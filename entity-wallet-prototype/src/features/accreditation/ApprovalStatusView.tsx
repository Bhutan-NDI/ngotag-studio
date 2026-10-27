"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/features/controllership/scopeModel";
import { accInProgress, accSeenByOrg, accStopped, inOrg, roleIn, type AccCapability, type Accreditation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { WALLET_HANDOFF_MS } from "@/lib/demoTiming";

import { ScopeList, accPill, asSentence, capApproved, capVerb, inline, sampleAccreditation } from "./shared";

/**
 * SCR-ACC-04 — Approval status. FLOW-ACC-01 steps 8–11; FLOW-ACC-02 steps
 * 5–11. A region of the organisation's console, here its own page so both
 * an institution and a business reach it from the nav.
 *
 * WHAT IS REFUSED, BEFORE IT IS A SUPPORT CALL
 *
 * Per capability: whether it is approved, what may be asked for or issued —
 * the same list, in the same words, that was accepted — that it is listed
 * and since when, the public identity it is listed under, and what has been
 * refused in the last 30 days, with the items that were outside scope. An
 * integration that keeps asking for a date of birth it is not approved for
 * shows up here first, worded as what happened rather than as an error.
 *
 * EVERY ENDING SAYS WHAT STILL WORKS
 *
 * Resigning is always a stop, never a deletion (EW-FLOW4-SD §5.2), so the
 * confirmation says both halves: what stops straight away, and — for an
 * issuer — that what it has already issued stays valid (UXD-17). It does not
 * say the organisation leaves NDI's public list: a stop leaves the listing
 * as it was, and the gate is what refuses (FLOW-ACC-01 A3) — an
 * organisation that issues and verifies and stops one stays listed for the
 * other (AC-12). Each other ending names who did it and what the
 * organisation can do next.
 *
 * ASKING FOR MORE REPLACES, IT DOESN'T STOP
 *
 * A business's Root widens an approval by asking for a replacement
 * (ACC-02/E3, AC-10): "Ask for more" opens SCR-ACC-06 with the current
 * scope filled in. The current approval keeps working until the new one is
 * listed, and is then shown under it as "Replaced".
 *
 * WHAT THE FIRST RELEASE LEFT OUT
 *
 * No suspension and no supersession (D24): a wider approval replaces the
 * earlier one only once it is itself active, and the earlier one is shown
 * under it as "Replaced", with nothing stopped in between. "Stopped" is not
 * a state either — it is what an ACTIVE approval looks like when the
 * organisation's primary identity no longer matches the listed one
 * (ACC-01/E11), and putting it back is all Restore does. Nothing lapses
 * here: a listing that can't be published is abandoned by NDI, by name.
 */
type Face =
  | "live"
  | "default"
  | "waiting"
  | "withdrawn"
  | "request_lapsed"
  | "listing_abandoned"
  | "withdrawn_by_ndi"
  | "replaced"
  | "declined"
  | "publishing"
  | "held"
  | "stopped"
  | "resigned"
  | "empty"
  | "offline"
  | "member";

/** The record each forced face shows, as overrides of the sample. */
const FORCED: Partial<Record<Face, Partial<Accreditation>>> = {
  default: { state: "ACTIVE" },
  waiting: { state: "SUBMITTED", door: "REQUEST" },
  withdrawn: { state: "WITHDRAWN", door: "REQUEST", withdrawal: { reason: "REQUESTER", note: null, by: null, at: "" } },
  request_lapsed: { state: "WITHDRAWN", door: "REQUEST", withdrawal: { reason: "REQUESTER", note: null, by: null, at: "" } },
  listing_abandoned: { state: "WITHDRAWN", listedAt: null, withdrawal: { reason: "NOT_LISTED", note: null, by: "tshendu", at: "" } },
  withdrawn_by_ndi: {
    state: "WITHDRAWN",
    withdrawal: { reason: "BY_NDI", note: "your agreement with NDI has ended", by: "tshendu", at: "" },
  },
  replaced: { state: "ACTIVE", replacesId: "acc-sample-old" },
  declined: { state: "DECLINED", door: "REQUEST" },
  publishing: { state: "LISTING" },
  held: { state: "HELD" },
  stopped: { state: "ACTIVE" },
  resigned: { state: "RESIGNED" },
  offline: { state: "ACTIVE" },
  member: { state: "ACTIVE" },
};

export function ApprovalStatusView() {
  const router = useRouter();
  const { accreditations, organizations, relations, activeOrgId, currentPerson, harness, personById, completeListing, resignAccreditation, withdrawRequest, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-ACC-04", [
    "live",
    "default",
    "waiting",
    "withdrawn",
    "request_lapsed",
    "listing_abandoned",
    "withdrawn_by_ndi",
    "replaced",
    "declined",
    "publishing",
    "held",
    "stopped",
    "resigned",
    "empty",
    "offline",
    "member",
  ]) as Face;
  const [resigning, setResigning] = useState<Accreditation | null>(null);
  const [restored, setRestored] = useState(false);

  const org = organizations.find((o) => o.id === activeOrgId);
  const name = org?.name ?? "Your organisation";
  const short = name.replace(/ (Pvt\. )?Ltd\.$/, "");
  const root = relations.find((r) => inOrg(org?.id ?? "")(r) && r.isRootAuthority && r.state === "ACTIVE");
  const isRoot = root?.personId === harness.persona;
  /* Only the Root of a verified holder is offered the way to ask
     (FLOW-ACC-02 P1, P2); anyone else is not shown it at all (E1). */
  const canAsk = isRoot && Boolean(org?.capabilities.includes("holder"));
  /* "Ask for more" (ACC-02/E3, AC-10): the Root of a business, against an
     ACTIVE approval with nothing else in progress for that capability — a
     replacement already on its way would be refused with E3. A forced face
     shows it on the sample. */
  const canAskMore = (a: Accreditation) =>
    canAsk &&
    forced !== "member" &&
    a.state === "ACTIVE" &&
    (forced !== "live" ||
      !accreditations.some((x) => x.id !== a.id && x.orgId === a.orgId && x.capability === a.capability && accInProgress(x)));
  /* Resign and withdraw: OWNER for what NDI proposed, the Root for a
     business's own request — an OWNER who is not the Root is not offered
     it (ACC-02/S3, A1). The store checks again; this only decides whether
     to offer them. */
  const manages = (a: Pick<Accreditation, "door">) =>
    forced !== "member" && (a.door === "REQUEST" ? isRoot : roleIn(org, currentPerson) === "Owner");
  /* What stands in the way of a new request is everything in progress,
     which is what the store tests against (E3). What the organisation is
     shown is less: not an NDI proposal before its second approval, nor one
     NDI declined or let lapse (FLOW-ACC-01 step 3, E13, E14). */
  const standing = accreditations.filter((a) => a.orgId === activeOrgId && accInProgress(a));
  const mine = accreditations.filter((a) => a.orgId === activeOrgId && accSeenByOrg(a));

  /* Publishing the listing is simulated: whatever is LISTING when this page
     is open is published after a moment, standing in for the registry
     write (FLOW-ACC-01 step 9). */
  const listing = mine.filter((a) => a.state === "LISTING").map((a) => a.id);
  useEffect(() => {
    if (forced !== "live" || !listing.length) return;
    const t = window.setTimeout(() => listing.forEach((id) => completeListing(id)), WALLET_HANDOFF_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.join(","), forced]);

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  /* A forced face shows one approval in that state — the org's own record
     if it has one, otherwise the bank's verifying. */
  const today = new Date().toISOString().slice(0, 10);
  const sampleBase: Accreditation =
    mine[0] ??
    sampleAccreditation({
      orgId: activeOrgId,
      orgName: name,
      agreementRef: "",
      state: "ACTIVE",
      requestedBy: root?.personId ?? null,
      requestedAt: today,
      decidedBy: "tshendu",
      decidedAt: today,
      acceptedName: currentPerson.name,
      listedAt: today,
      publicIdentity: org?.publicDid ?? "did:ethr:0x3f9a1c7e5b2d48a06e91f0c4d7b8a2e5c13f6d90",
    });
  const forcedRecord = (): Accreditation[] => {
    const a: Accreditation = {
      ...sampleBase,
      declinedByOrg: false,
      declineReason: sampleBase.declineReason ?? "Ask to check age only, not the date of birth.",
      refusals: sampleBase.refusals ?? { count: 3, items: ["Date of birth", "Permanent address"] },
      listedAt: sampleBase.listedAt ?? today,
      ...FORCED[forced],
    };
    /* "Replaced": the approval that replaced another, with the earlier one
       under it — the one face that needs two records. */
    if (forced !== "replaced") return [a];
    return [
      a,
      {
        ...a,
        id: "acc-sample-old",
        replacesId: null,
        state: "WITHDRAWN",
        listedAt: "2025-06-02",
        /* Narrower: a replacement is how a scope widens (D7). */
        ask: a.ask.slice(0, Math.max(1, a.ask.length - 1)),
        issue: a.issue.slice(0, Math.max(1, a.issue.length - 1)),
        withdrawal: { reason: "REPLACED", note: null, by: null, at: today },
      },
    ];
  };
  const shown: Accreditation[] = forced === "live" ? mine : forced === "empty" ? [] : forcedRecord();

  /* A replaced approval is shown under the one that replaced it (D24). */
  const isReplaced = (a: Accreditation) => a.state === "WITHDRAWN" && a.withdrawal?.reason === "REPLACED";
  const top = shown.filter((a) => !isReplaced(a) || !shown.some((x) => x.replacesId === a.id));
  const replacedUnder = (a: Accreditation) => shown.filter((x) => isReplaced(x) && a.replacesId === x.id);
  const stoppedFace = (a: Accreditation) => (forced === "live" ? accStopped(a, org) : forced === "stopped");

  const contactNdi = (label = "Contact NDI") => (
    <Link href="/legal/support" className="ndi-plainlink text-[13px] font-medium text-accent">
      {label}
    </Link>
  );

  const status = (a: Accreditation): { text: React.ReactNode; action?: React.ReactNode } => {
    const verb = capVerb(a.capability);
    if (forced === "request_lapsed")
      return {
        text: `A request made by ${a.requestedBy ? personById(a.requestedBy).name : "your previous representative"} lapsed when their authority ended.`,
        action: isRoot ? <HairlineButton onClick={() => router.push("/verify-or-issue/ask")}>Ask again</HairlineButton> : null,
      };
    if (stoppedFace(a))
      /* ACC-01/E11. The record is still ACTIVE; what stopped is every
         request it makes, until the listed identity is primary again.
         Nothing in the demo changes an organisation's primary identity —
         the lock forbids it — so Restore shows the outcome rather than
         calling the store. */
      return restored
        ? { text: "Put back. Your listed public identity is primary again, and verifying and issuing have restarted." }
        : {
            text: "Your organisation's public identity has changed since it was approved. Verifying and issuing have stopped until it's put back.",
            action: manages(a) ? <GradientButton onClick={() => setRestored(true)}>Restore</GradientButton> : null,
          };
    switch (a.state) {
      case "ACTIVE":
        return {
          text: `${capApproved(a.capability)}, listed since ${a.listedAt ? formatDate(a.listedAt) : "—"}.`,
          action:
            forced !== "offline" && (manages(a) || canAskMore(a)) ? (
              <>
                {canAskMore(a) ? (
                  <HairlineButton onClick={() => router.push(`/verify-or-issue/ask?more=${a.id}`)}>Ask for more</HairlineButton>
                ) : null}
                {manages(a) ? (
                  <HairlineButton onClick={() => setResigning(a)}>Stop {a.capability === "verifier" ? "verifying" : "issuing"}</HairlineButton>
                ) : null}
              </>
            ) : null,
        };
      case "SUBMITTED":
      case "IN_REVIEW":
      case "PROPOSED":
        return {
          text: `Waiting for NDI since ${a.requestedAt ? formatDate(a.requestedAt) : "—"}.`,
          action:
            manages(a) && a.door === "REQUEST" && forced !== "offline" ? (
              <HairlineButton onClick={() => withdrawRequest(a.id)}>Withdraw request</HairlineButton>
            ) : null,
        };
      case "PENDING_ACCEPTANCE":
        return {
          text: `NDI has proposed approving ${short} to ${verb}. It's waiting for ${manages(a) ? "you" : "the owner"} to accept.`,
          action: <GradientButton onClick={() => router.push(`/verify-or-issue/${a.id}`)}>Review and accept</GradientButton>,
        };
      case "LISTING":
        return { text: `${a.door === "REQUEST" ? "Approved" : "Accepted"}. We're publishing your listing — this can take a moment.` };
      case "DECLINED":
        return a.declinedByOrg
          ? { text: "You declined. Nothing is listed and NDI has been told." }
          : {
              text: `NDI hasn't approved this. Their reason: ${asSentence(a.declineReason)} You can change your request and ask again.`,
              action: isRoot ? (
                <HairlineButton onClick={() => router.push(`/verify-or-issue/ask?from=${a.id}`)}>Change and ask again</HairlineButton>
              ) : null,
            };
      case "WITHDRAWN":
        switch (a.withdrawal?.reason) {
          case "NOT_LISTED":
            return { text: "This approval was withdrawn because the listing couldn't be published. NDI will contact you.", action: contactNdi() };
          case "BY_NDI":
            /* Before it was accepted (E2) nothing ever started; after it
               was listed (catalogue flow 11) the page says what stopped and
               what still works. */
            return a.listedAt && a.acceptedName
              ? {
                  text: `NDI has withdrawn ${short}'s approval to ${verb}: ${a.withdrawal.note ?? "—"}. ${
                    a.capability === "verifier"
                      ? "You can no longer ask people for information."
                      : "You can no longer issue. Credentials you've already issued stay valid unless NDI says otherwise."
                  }`,
                  action: contactNdi(),
                }
              : { text: `NDI has withdrawn this approval: ${asSentence(a.withdrawal.note)} Nothing is listed.`, action: contactNdi() };
          case "REPLACED":
            return { text: "Replaced by a wider approval. Kept on record; nothing stopped in between." };
          default:
            return {
              text: "You've withdrawn your request.",
              action: isRoot ? <HairlineButton onClick={() => router.push("/verify-or-issue/ask")}>Ask again later</HairlineButton> : null,
            };
        }
      case "HELD":
        return { text: "Your listing is held while NDI checks something. We'll contact you.", action: contactNdi() };
      case "RESIGNED":
        return {
          text:
            a.capability === "verifier"
              ? "You've stopped verifying. You can no longer ask people for information."
              : "You've stopped issuing. Credentials you've already issued stay valid.",
          action: contactNdi("Contact NDI to be approved again"),
        };
      default:
        return { text: "This is no longer waiting for anything." };
    }
  };

  /* What the Root could still ask for: a capability with nothing in
     progress or active (ACC-02/E3, per capability). */
  const askable = (["verifier", "issuer"] as AccCapability[]).filter((c) => !standing.some((a) => a.capability === c));

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        <PageHeader crumbs={[{ label: name }, { label: "Verify or issue" }]} title="Verify or issue" />
        {forced === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is how things stood when you were last connected, on {formatDate(today)}.
          </p>
        ) : null}

        {top.length === 0 ? (
          <Panel padded={false}>
            <EmptyState
              icon="shieldCheck"
              title={`${short} isn't approved to verify or issue.`}
              message={canAsk ? "Want to verify customers or issue credentials?" : "NDI approves organisations to verify or issue."}
              action={canAsk ? <GradientButton onClick={() => router.push("/verify-or-issue/ask")}>Ask NDI</GradientButton> : undefined}
            />
          </Panel>
        ) : (
          top.map((a) => {
            const pill = stoppedFace(a) && !restored ? { status: "stopped", label: "Stopped" } : accPill(a, "org");
            const s = status(a);
            /* The other part of the same request, when it asked for both
               (D22) — each decided on its own, said so beside each. */
            const sibling = a.requestId ? shown.find((x) => x.requestId === a.requestId && x.id !== a.id) : undefined;
            return (
              <Panel key={a.id}>
                <div className="relative z-[4] flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="m-0 font-display text-[17px] font-semibold text-strong">
                      {a.capability === "verifier" ? "Verifying" : "Issuing"}
                    </h2>
                    <StatusPill status={pill.status} label={pill.label} />
                  </div>
                  <p role="status" className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
                    {s.text}
                  </p>
                  {sibling ? (
                    <p className="m-0 text-[12.5px] leading-[1.55] text-muted">
                      Asked for together with {sibling.capability === "verifier" ? "verifying" : "issuing"}. NDI decides each on its own.
                    </p>
                  ) : null}
                  {/* A replacement on its way sits beside the approval it
                      replaces; this says why there are two (AC-10). */}
                  {a.replacesId && a.state !== "ACTIVE" && shown.some((x) => x.id === a.replacesId && x.state === "ACTIVE") ? (
                    <p className="m-0 text-[12.5px] leading-[1.55] text-muted">
                      This asks for more. Your current approval keeps working until the new one replaces it.
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    <p className="m-0 text-[12.5px] text-muted">
                      {a.capability === "verifier" ? "What you can ask people for" : "What you can issue"}
                      {a.state === "ACTIVE" ? "" : a.door === "REQUEST" ? " — as you asked" : " — as proposed"}
                    </p>
                    <ScopeList capability={a.capability} ask={a.ask} issue={a.issue} />
                  </div>
                  {a.state === "ACTIVE" && a.publicIdentity ? (
                    <p className="m-0 text-[13px] leading-[1.6] text-muted">
                      Your organisation&rsquo;s public identity is{" "}
                      <span className="break-all font-mono text-[12px] text-body">{a.publicIdentity}</span>.
                    </p>
                  ) : null}
                  {a.state === "ACTIVE" && a.refusals?.count ? (
                    <p className="m-0 max-w-[66ch] text-[13px] leading-[1.6] text-body">
                      Refused in the last 30 days: {a.refusals.count} request{a.refusals.count === 1 ? "" : "s"} asked for
                      things you&rsquo;re not approved to ask for — {a.refusals.items.map(inline).join(", ")}.
                    </p>
                  ) : null}
                  {s.action ? <div className="flex flex-wrap gap-2.5">{s.action}</div> : null}
                  {replacedUnder(a).map((old) => (
                    <div key={old.id} className="flex flex-col gap-1.5 border-t border-subtle pt-3">
                      <StatusPill status="replaced" label="Replaced" />
                      <p className="m-0 text-[12.5px] text-muted">
                        Earlier approval{old.listedAt ? `, listed ${formatDate(old.listedAt)}` : ""}:{" "}
                        {old.ask.map((x) => inline(x.item)).join(", ") || old.issue.map((t) => t.name).join(", ")}. It stayed in force until
                        this one was listed.
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })
        )}

        {canAsk && top.length > 0 && askable.length ? (
          <p className="m-0 text-[13px] text-muted">
            {askable.length === 1
              ? `Want to ${askable[0] === "verifier" ? "verify customers" : "issue credentials"} as well? `
              : "Want to verify customers or issue credentials? "}
            <Link href="/verify-or-issue/ask" className="ndi-plainlink font-medium text-accent">
              Ask NDI
            </Link>
          </p>
        ) : null}

        <Dialog
          open={resigning !== null}
          onClose={() => setResigning(null)}
          tone="danger"
          title={resigning?.capability === "issuer" ? `Stop issuing for ${short}?` : `Stop verifying for ${short}?`}
          lead={
            resigning?.capability === "issuer"
              ? "You'll stop being able to issue straight away. Credentials you've already issued stay valid."
              : "You'll stop being able to ask people for information straight away."
          }
          consequences={["Being approved again needs NDI."]}
          confirmLabel={resigning?.capability === "issuer" ? "Stop issuing" : "Stop verifying"}
          onConfirm={() => {
            if (resigning) resignAccreditation(resigning.id);
            setResigning(null);
          }}
        />
      </div>
    </AppShell>
  );
}
