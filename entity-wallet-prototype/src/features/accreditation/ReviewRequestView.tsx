"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { kindOf } from "@/features/onboarding/orgKinds";
import { REMINDER_WORKING_DAYS, inOrg, isNamedAdmin, workingDaysSince } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { Criteria, issueOverlaps } from "./Criteria";
import { ScopeList, asSentence, capVerb, legalBasisText } from "./shared";

/**
 * SCR-ACC-05 — Review a request. FLOW-ACC-02 step 6.
 *
 * A RECOMMENDATION, NOT A DECISION
 *
 * The first administrator reads a business's request against the interim
 * criteria and recommends — either way. Either recommendation goes to a
 * second administrator on SCR-ACC-02, who decides. The reviewer cannot
 * edit the request (UXD-30): if it asks for more than it needs, the reason
 * for declining says what to remove, and the business reads that reason in
 * the reviewer's own words (UN-32). That is why the prompt for it gives an
 * example written to the business, not about it.
 *
 * ONE PART AT A TIME
 *
 * A business may ask for both capabilities in one request (D22). Each is a
 * part of it, reviewed and recommended on its own — this page is one part,
 * and says so when there is another — so verifying can be recommended while
 * issuing is not, and neither waits for the other.
 *
 * ALERTS FIRST
 *
 * If the business has stopped being a verified holder since it asked
 * (ACC-02/E10), that is the first thing on the page — the reviewer decides
 * what it means, but must not find it after recommending. A request whose
 * asker no longer represents the business has lapsed (ACC-02/E9), and there
 * is nothing to decide.
 *
 * OVERDUE IS 10 WORKING DAYS
 *
 * The same count NDI is reminded on (ACC-02/E8): a request is overdue once
 * it has waited 10 working days, not a fortnight of calendar days — which
 * marked a request sent before a long weekend late for days it never was.
 *
 * A DECLINE CAN BE TAKEN BACK BY WHOEVER RECOMMENDED IT
 *
 * A recommended decline waits for a second administrator to confirm it,
 * who can't approve against it (ACC-02/E11, D21). If the two disagree they
 * settle it between themselves, and then the reviewer — only the reviewer —
 * withdraws the recommendation here ("Decline waiting"). The part returns
 * to review and a new recommendation can be made.
 */
type Face =
  | "live"
  | "default"
  | "holder_alert"
  | "overdue"
  | "decline_waiting"
  | "lapsed"
  | "error"
  | "offline"
  | "empty"
  | "not_found"
  | "done";

export function ReviewRequestView({ id }: { id: string }) {
  const router = useRouter();
  const { accreditations, organizations, relations, currentPerson, harness, personById, reviewRequest, withdrawRecommendation, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-ACC-05", [
    "live",
    "default",
    "holder_alert",
    "overdue",
    "decline_waiting",
    "lapsed",
    "error",
    "offline",
    "empty",
  ]) as Face;

  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const acc = accreditations.find((a) => a.id === id && a.door === "REQUEST");
  const org = organizations.find((o) => o.id === acc?.orgId);
  const askerStillRoot = relations.some(
    (r) => inOrg(org?.id ?? "")(r) && r.isRootAuthority && r.state === "ACTIVE" && r.personId === acc?.requestedBy,
  );
  const overdue = workingDaysSince(acc?.requestedAt ?? null) >= REMINDER_WORKING_DAYS;
  const reviewable = acc?.state === "SUBMITTED" || acc?.state === "IN_REVIEW";
  /* The viewer's own recommendation to decline, not yet confirmed. */
  const myDeclineWaiting =
    acc?.state === "PROPOSED" && acc.recommendation !== null && !acc.recommendation.approve && acc.recommendation.by === harness.persona;

  const natural: Face = done
    ? "done"
    : !acc
      ? "not_found"
      : myDeclineWaiting
        ? "decline_waiting"
        : !reviewable
          ? "done"
        : !askerStillRoot
          ? "lapsed"
          : org && !org.capabilities.includes("holder")
            ? "holder_alert"
            : overdue
              ? "overdue"
              : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (
    <PageHeader
      crumbs={[{ label: "NDI administration" }, { label: "Accreditations", href: "/admin/accreditations" }, { label: "Review" }]}
      title="Review a request"
    />
  );
  const message = (text: React.ReactNode) => (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">{text}</p>
            <div>
              <HairlineButton onClick={() => router.push("/admin/accreditations")}>Back to accreditations</HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );

  if (face === "empty") return message("No requests are waiting for review.");
  if (!acc || face === "not_found") return message("There's no request at this address.");
  if (face === "done")
    return message(
      done ?? (
        <>
          This request has already been reviewed.{" "}
          <Link className="ndi-plainlink text-accent" href={`/admin/accreditations/${acc.id}`}>
            See where it stands
          </Link>
          .
        </>
      ),
    );
  if (face === "lapsed")
    return message(
      `A request made by ${acc.requestedBy ? personById(acc.requestedBy).name : "its previous representative"} lapsed when their authority ended. There's nothing to decide.`,
    );

  const overlaps = issueOverlaps(acc, accreditations, (oid) => organizations.find((o) => o.id === oid)?.name ?? oid);
  const offline = face === "offline";
  const canAct = isNamedAdmin(currentPerson) && !offline;
  /* The other part of the same request, if it asked for both (D22). */
  const sibling = acc.requestId ? accreditations.find((a) => a.requestId === acc.requestId && a.id !== acc.id) : undefined;

  /* "Decline waiting": a forced face shows a sample recommendation when the
     record has none of the viewer's. */
  const declined =
    acc.recommendation && !acc.recommendation.approve
      ? acc.recommendation
      : { by: harness.persona, approve: false, reason: "Ask to check age only, not the date of birth.", at: acc.requestedAt ?? "" };
  const withdraw = () => {
    if (forced !== "live") return;
    const r = withdrawRecommendation(acc.id);
    /* Back to review: the record is IN_REVIEW again, so this page shows
       the request to recommend afresh. A refusal means someone confirmed
       it first, or it isn't the viewer's to withdraw. */
    if (!r.ok) setFailed(true);
  };

  const send = (approve: boolean) => {
    setBusy(true);
    setFailed(false);
    window.setTimeout(() => {
      setBusy(false);
      /* The forced error face stands in for a save that failed. */
      if (face === "error") {
        setFailed(true);
        return;
      }
      const r = reviewRequest(acc.id, approve, approve ? null : reason);
      if (!r.ok) {
        setFailed(true);
        return;
      }
      setDone(
        approve
          ? "Recommended for approval. A different administrator decides next."
          : "Recommended to decline. A different administrator confirms it; only then is the business told, with your reason in your words.",
      );
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        {header}

        {face === "holder_alert" ? (
          <p role="alert" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ background: "rgb(var(--tint) / 0.05)" }}>
            <Icon name="shieldAlert" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {acc.orgName} is no longer a verified holder. This request came from its holder dashboard.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <p className="m-0 font-display text-[17px] font-semibold text-strong">
              {acc.orgName} asks to {capVerb(acc.capability)}
            </p>
            <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-muted">
              Recommend approving or declining this as the business asked for it. You can&rsquo;t edit it.
            </p>
            {sibling ? (
              <p className="m-0 max-w-[66ch] text-[13px] leading-[1.6] text-muted">
                The same request also asks to {capVerb(sibling.capability)}. That part is reviewed and decided on its own.
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">
                {acc.capability === "verifier" ? "What it asks to ask people for" : "What it asks to issue"}
              </h2>
              <ScopeList capability={acc.capability} ask={acc.ask} issue={acc.issue} />
            </div>
            <DetailList
              items={[
                { label: "Purpose", value: acc.purpose },
                ...(acc.capability === "issuer" ? [{ label: "Legal basis", value: legalBasisText(acc) }] : []),
                { label: "Asked by", value: acc.requestedBy ? `${personById(acc.requestedBy).name}, its representative` : "—" },
                {
                  label: "Verified",
                  value: `By the ${kindOf(org?.kind).authority}${org?.createdAt ? `, ${formatDate(org.createdAt)}` : ""}`,
                },
                {
                  label: "Waiting since",
                  value: (
                    <>
                      {acc.requestedAt ? formatDate(acc.requestedAt) : "—"}
                      {face === "overdue" ? <span className="text-body"> · overdue</span> : null}
                    </>
                  ),
                },
              ]}
            />
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What NDI checks</h2>
            <Criteria acc={acc} org={org} overlaps={overlaps} />
          </div>
        </Panel>

        {offline ? (
          <p role="status" className="m-0 text-[13.5px] text-body">
            You&rsquo;re offline. Nothing can be recorded until you&rsquo;re back.
          </p>
        ) : null}
        {failed ? (
          <p role="alert" className="m-0 text-[13.5px] text-body">
            We couldn&rsquo;t save that. Nothing was recorded — try again.
          </p>
        ) : null}

        {face === "decline_waiting" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Your recommendation</h2>
              <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
                You recommended declining{declined.at ? ` on ${formatDate(declined.at)}` : ""}: {asSentence(declined.reason)}
              </p>
              <p className="m-0 max-w-[66ch] text-[13px] leading-[1.6] text-muted">
                A different administrator hasn&rsquo;t confirmed it yet, and nothing has been sent to the business. If you
                withdraw it, the request comes back here to review again, and you can recommend afresh.
              </p>
              <div>
                <HairlineButton onClick={withdraw} disabled={!canAct}>
                  Withdraw the recommendation
                </HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {currentPerson.platformRole === "root" ? (
          <p role="status" className="m-0 text-[13.5px] leading-[1.6] text-body">
            The root account doesn&rsquo;t review requests. NDI&rsquo;s platform administrators do.
          </p>
        ) : null}
        {face === "decline_waiting" ? null : declining ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Reason, for the business</span>
                <textarea
                  className={`${FIELD_CLASS} resize-y py-3`}
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span className="text-[12.5px] leading-[1.5] text-faint">
                  Tell the business what to change — for example, &ldquo;Ask to check age only, not the date of birth.&rdquo;
                </span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                <GradientButton onClick={() => send(false)} disabled={!canAct || busy || !reason.trim()}>
                  {busy ? "Recording…" : "Recommend declining"}
                </GradientButton>
                <HairlineButton onClick={() => setDeclining(false)}>Cancel</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <GradientButton onClick={() => send(true)} disabled={!canAct || busy}>
              {busy ? "Recording…" : "Recommend approval"}
            </GradientButton>
            <HairlineButton onClick={() => setDeclining(true)} disabled={!canAct || busy}>
              Recommend decline
            </HairlineButton>
          </div>
        )}
      </div>
    </AppShell>
  );
}
