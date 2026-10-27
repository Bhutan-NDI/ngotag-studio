"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import {
  ENFORCEMENT_DATE,
  REMINDER_WORKING_DAYS,
  accStopped,
  isNamedAdmin,
  workingDaysSince,
  type Accreditation,
} from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { Criteria, issueOverlaps } from "./Criteria";
import { ScopeList, accPill, asSentence, capVerb, daysUntil, inline, legalBasisText, sampleAccreditation } from "./shared";

/**
 * SCR-ACC-02 — Approve an accreditation. FLOW-ACC-01 step 2; FLOW-ACC-02
 * step 7. Also the record of an accreditation in every later state, because
 * an administrator following one up arrives at the same address.
 *
 * DUAL CONTROL, SHOWN BEFORE IT IS ENFORCED
 *
 * Whoever proposed it — or, for a business's request, whoever reviewed it —
 * sees it in full with the approve control replaced by the reason they
 * can't (E1, ACC-02/E5), and who can. The store refuses regardless: the
 * screen is not the boundary (standing rule 9), it only avoids offering
 * something and then refusing it.
 *
 * AS SUBMITTED, AND A RECOMMENDED DECLINE CAN ONLY BE CONFIRMED
 *
 * A business's request is approved or declined as the business wrote it —
 * NDI does not narrow it on their behalf (EW-FLOW4-SD/D9, UXD-30), because
 * then the business would be approved for something it never asked for and
 * never saw. If it asks for too much, the decline says what to remove. And
 * when the reviewer recommended declining, there is no approve control at
 * all (ACC-02/E11): only confirming it, and the business reads the
 * reviewer's reason. There used to be a "send for a different review" as
 * well; it had no defined end and, with two administrators, could go round
 * for ever (D21). A second administrator who disagrees talks to the
 * reviewer, who can withdraw the recommendation and review it again — on
 * SCR-ACC-05, where the recommendation was made ("Decline waiting"); this
 * page only points the reviewer there.
 *
 * AN APPROVAL NOBODY ACCEPTS IS WITHDRAWN, NOT EXPIRED
 *
 * An institution's approval waits for its owner without a deadline (D20);
 * the owner and NDI are reminded after 10 working days. If it is never
 * going to be accepted, an administrator withdraws it here, with a reason
 * the organisation is shown (ACC-01/E2) — so it never blocks a new
 * proposal for good, and it never ends silently.
 */
type Face =
  | "live"
  | "default"
  | "self_proposed"
  | "recommended_decline"
  | "lapsed"
  | "not_accepted"
  | "loading"
  | "success"
  | "offline"
  | "not_found";

/** decideAccreditation's refusals, in the words SCR-ACC-02 gives them. Nothing is recorded in any of them. */
const DECIDE_REFUSALS: Record<"E1" | "E5" | "E11" | "not_admin" | "invalid", string> = {
  E1: "You proposed this, so a different administrator has to decide it. Nothing was recorded.",
  E5: "You reviewed this request, so a different administrator has to decide it. Nothing was recorded.",
  E11: "This was recommended for decline, so it can't be approved — only the decline confirmed. If you disagree, talk to the reviewer. Nothing was recorded.",
  not_admin: "Only NDI's named platform administrators decide approvals. Nothing was recorded.",
  invalid: "This has already been decided, or is no longer waiting for a decision. Nothing you did was recorded.",
};

export function ApproveAccreditationView({ id }: { id: string }) {
  const router = useRouter();
  const { accreditations, organizations, people, harness, currentPerson, personById, decideAccreditation, withdrawApproval, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-ACC-02", [
    "live",
    "default",
    "self_proposed",
    "recommended_decline",
    "lapsed",
    "not_accepted",
    "loading",
    "success",
    "offline",
  ]) as Face;

  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);

  const live = accreditations.find((a) => a.id === id);
  const today = new Date().toISOString().slice(0, 10);
  /* Forced faces need something to show even when the address names
     nothing; a recognition proposal for the bank is the story's own. */
  const sample: Accreditation | undefined =
    live ?? (forced !== "live" ? sampleAccreditation({ id, door: forced === "recommended_decline" ? "REQUEST" : "RECOGNITION" }) : undefined);
  const acc: Accreditation | undefined =
    sample && forced === "recommended_decline"
      ? {
          ...sample,
          door: "REQUEST",
          state: "PROPOSED",
          requestedBy: sample.requestedBy ?? "dorji",
          requestedAt: sample.requestedAt ?? today,
          recommendation: {
            by: sample.proposedBy ?? "tshering",
            approve: false,
            reason: sample.recommendation?.reason ?? "Ask to check age only, not the date of birth.",
            at: sample.proposedAt ?? today,
          },
        }
      : sample && forced === "not_accepted"
        ? { ...sample, state: "PENDING_ACCEPTANCE", decidedBy: sample.decidedBy ?? "tshendu", decidedAt: sample.decidedAt ?? today }
        : sample;

  const proposedHere = acc?.state === "PROPOSED";
  const natural: Face = !acc
    ? "not_found"
    : done
      ? "success"
      : proposedHere && acc.door !== "REQUEST" && acc.expiresAt && acc.expiresAt < today
        ? "lapsed"
        : proposedHere && acc.proposedBy === harness.persona
          ? "self_proposed"
          : proposedHere && acc.recommendation && !acc.recommendation.approve
            ? "recommended_decline"
            : acc.state === "PENDING_ACCEPTANCE"
              ? "not_accepted"
              : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (title: string) => (
    <PageHeader
      crumbs={[{ label: "NDI administration" }, { label: "Accreditations", href: "/admin/accreditations" }, { label: acc?.orgName ?? "Not found" }]}
      title={title}
    />
  );

  if (!acc || face === "not_found") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header("Accreditation")}
          <Panel>
            <p role="status" className="relative z-[4] m-0 text-[14px] text-body">
              There&rsquo;s no accreditation at this address.
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const org = organizations.find((o) => o.id === acc.orgId);
  const verb = capVerb(acc.capability);
  const proposer = acc.proposedBy ? personById(acc.proposedBy).name : "—";
  const reviewer = acc.recommendation ? personById(acc.recommendation.by).name : "The reviewer";
  const isRequest = acc.door === "REQUEST";
  const whoCan = people.filter((p) => isNamedAdmin(p) && p.hasAccount !== false && p.id !== acc.proposedBy).map((p) => p.name);
  const overlaps = issueOverlaps(acc, accreditations, (oid) => organizations.find((o) => o.id === oid)?.name ?? oid);
  const stopped = accStopped(acc, org);
  const pill =
    face === "lapsed"
      ? { status: "lapsed", label: "Lapsed" }
      : stopped
        ? { status: "stopped", label: "Stopped" }
        : accPill(acc, "admin");
  const offline = face === "offline";
  const canAct = isNamedAdmin(currentPerson) && !offline;
  const replaces = acc.replacesId ? accreditations.find((a) => a.id === acc.replacesId) : undefined;
  const replacedBy = accreditations.find((a) => a.replacesId === acc.id && a.state === "ACTIVE");
  /* A request is never late (ACC-02/E12): it shows how long it has waited,
     and once a recommendation to approve has waited 10 working days, the
     reminder NDI was sent, in §3.5's words. */
  const waitingSince = isRequest ? acc.proposedAt ?? acc.requestedAt : acc.decidedAt;
  const reminded = workingDaysSince(waitingSince) >= REMINDER_WORKING_DAYS;
  const approveReminder = proposedHere && isRequest && acc.recommendation?.approve === true && reminded;

  const decide = (approve: boolean, why?: string) => {
    setBusy(true);
    window.setTimeout(() => {
      const r = decideAccreditation(acc.id, approve, why);
      setBusy(false);
      /* The store's refusal is the one that counts, so it's said here rather
         than swallowed: a second administrator who had it open while a
         colleague decided would otherwise see Approve come back with no
         explanation. */
      if (!r.ok) {
        setRefusal(DECIDE_REFUSALS[r.error]);
        return;
      }
      setRefusal(null);
      setDone(
        approve
          ? isRequest
            ? `Approved. ${acc.orgName} has been told, and its listing is being published.`
            : acc.door === "NEW"
              ? `Approved. ${acc.officerEmail} has been invited to register ${acc.orgName}; they accept once it's registered.`
              : `Approved. ${acc.orgName}'s owner has been told, and accepts it next.`
          : isRequest
            ? acc.recommendation && !acc.recommendation.approve
              ? `Declined. ${acc.orgName} has been told ${reviewer}'s reason, in their words.`
              : `Declined. ${acc.orgName} has been told your reason, in your words.`
            : `Declined. ${proposer} has been told your reason.`,
      );
    }, LOCAL_MS);
  };

  /* What happened since the decision, for an administrator following up.
     Each sentence is the admin-console half of a FLOW-ACC error path. */
  const after = (() => {
    if (proposedHere || face === "not_accepted") return null;
    switch (acc.state) {
      case "SUBMITTED":
      case "IN_REVIEW":
        return `Waiting for review since ${acc.requestedAt ? formatDate(acc.requestedAt) : "—"}.`;
      case "LISTING":
        return `${isRequest ? "Approved" : `Accepted by ${acc.acceptedName ?? "its representative"}${acc.acceptedAt ? ` on ${formatDate(acc.acceptedAt)}` : ""}`}. Publishing the listing — if it isn't published within 72 hours, NDI administrators are alerted and it keeps trying.`;
      case "ACTIVE":
        return stopped
          ? `${acc.orgName}'s public identity has changed since it was approved. Its requests are being refused until it's put back; the approval itself still stands.`
          : `Listed since ${acc.listedAt ? formatDate(acc.listedAt) : "—"}${acc.acceptedName ? `, accepted by ${acc.acceptedName}` : ""}.`;
      case "DECLINED":
        return acc.declinedByOrg
          ? `${acc.orgName} declined the accreditation.`
          : `${acc.decidedBy ? personById(acc.decidedBy).name : "An administrator"} declined this: ${asSentence(acc.declineReason)}`;
      case "LAPSED":
        return "This proposal lapsed without a decision. It confers nothing.";
      case "WITHDRAWN":
        switch (acc.withdrawal?.reason) {
          case "REPLACED":
            return `Replaced by a wider approval${replacedBy?.listedAt ? `, active since ${formatDate(replacedBy.listedAt)}` : ""}. This one stays on record; nothing stopped in between.`;
          case "BY_NDI":
            return `${acc.withdrawal.by ? personById(acc.withdrawal.by).name : "An administrator"} withdrew this approval: ${asSentence(acc.withdrawal.note)}`;
          case "NOT_LISTED":
            return "Withdrawn because the listing couldn't be published.";
          default:
            return `${acc.orgName} withdrew its request.`;
        }
      case "RESIGNED":
        return `${acc.orgName} stopped ${acc.capability === "verifier" ? "verifying" : "issuing"} on ${acc.decidedAt ? formatDate(acc.decidedAt) : "—"}.`;
      case "HELD":
        return "This public identity is already listed for another organisation. The listing is held until that's resolved.";
      default:
        return null;
    }
  })();

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        {header(proposedHere ? "Approve an accreditation" : "Accreditation")}

        <div className="flex flex-wrap items-center gap-2.5">
          <StatusPill status={pill.status} label={pill.label} />
          <span className="text-[13px] text-muted">
            {acc.door === "RECOGNITION"
              ? "Recognising an organisation already operating"
              : acc.door === "NEW"
                ? "An institution not on the platform yet"
                : acc.door === "REQUEST"
                  ? "A business asked"
                  : "An organisation on the platform"}
          </span>
        </div>

        {face === "success" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 flex items-start gap-2 text-[14px] leading-[1.6] text-body">
                <Icon name="check" size={15} strokeWidth={2.4} className="mt-[4px] flex-none text-accent" />
                {done ?? `Approved. ${acc.orgName}'s owner has been told, and accepts it next.`}
              </p>
              <div>
                <GradientButton onClick={() => router.push("/admin/accreditations")}>Back to list</GradientButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {refusal ? (
          <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ borderColor: "var(--ndi-warning)" }}>
            {refusal}
          </p>
        ) : null}

        {/* After a decision the success panel says what happened; the status
            panel would repeat it ("Waiting for … to accept") or, after a
            decline, offer to propose again under the confirmation. */}
        {after && face !== "success" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">{after}</p>
              {acc.state === "ACTIVE" && acc.publicIdentity ? (
                <p className="m-0 text-[13px] text-muted">
                  Public identity: <span className="break-all font-mono text-[12px]">{acc.publicIdentity}</span>
                </p>
              ) : null}
              {/* E12: informs discretion, asks for nothing. */}
              {acc.state === "ACTIVE" && org && !org.capabilities.includes("holder") ? (
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  {org.name} is no longer a verified holder. Its approval to {verb} is unchanged.
                </p>
              ) : null}
              {(acc.state === "DECLINED" && !acc.declinedByOrg && !isRequest) ||
              acc.state === "LAPSED" ||
              (acc.state === "WITHDRAWN" && acc.withdrawal?.reason === "BY_NDI") ? (
                <div>
                  <HairlineButton onClick={() => router.push("/admin/accreditations/new")}>
                    {acc.state === "DECLINED" ? "Propose again, changed" : "Propose again"}
                  </HairlineButton>
                </div>
              ) : null}
            </div>
          </Panel>
        ) : null}

        {face === "lapsed" && acc.state === "PROPOSED" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 text-[14px] leading-[1.6] text-body">This proposal lapsed without a decision. It confers nothing.</p>
              <div>
                <HairlineButton onClick={() => router.push("/admin/accreditations/new")}>Propose again</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {/* ACC-01/E2: an approval waiting for its organisation. No deadline —
            the owner and NDI are reminded — and Withdraw, with a reason,
            for one that will never be accepted. */}
        {face === "not_accepted" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
                {acc.door === "NEW" && !acc.orgId
                  ? `Invitation sent to ${acc.officerEmail}. Waiting for them to register ${acc.orgName} and accept.`
                  : `Waiting for ${acc.orgName} to accept.`}{" "}
                Not accepted since {waitingSince ? formatDate(waitingSince) : "—"}.
              </p>
              <p className="m-0 text-[13px] leading-[1.6] text-muted">
                {reminded
                  ? `${acc.orgName}'s owner and NDI's administrators have been reminded. It doesn't expire — withdraw it if it won't be accepted.`
                  : `If it isn't accepted within ${REMINDER_WORKING_DAYS} working days, ${acc.orgName}'s owner and NDI's administrators are reminded. It doesn't expire.`}
              </p>
              <div>
                <HairlineButton onClick={() => setWithdrawing(true)} disabled={!canAct}>
                  Withdraw
                </HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <p className="m-0 font-display text-[17px] font-semibold leading-[1.35] text-strong">
              {proposedHere
                ? `You're approving ${acc.orgName} to ${verb}. Every citizen's NDI wallet will trust it for this.`
                : `${acc.orgName} — approval to ${verb}`}
            </p>
            {isRequest && proposedHere ? (
              <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-muted">
                You can approve or decline this as the business asked for it. You can&rsquo;t change it — if it
                asks for too much, decline and say what to remove.
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">
                {acc.capability === "verifier" ? "What it can ask people for" : "What it can issue"}
              </h2>
              <ScopeList capability={acc.capability} ask={acc.ask} issue={acc.issue} observed={acc.observed?.ask} />
              {acc.capability === "verifier" ? (
                <p className="m-0 text-[13px] text-muted">Anything else will be refused before it reaches anyone.</p>
              ) : null}
              {overlaps.map((o) => (
                <p key={o.type} className="m-0 flex items-start gap-2 text-[13px] text-muted">
                  <Icon name="info" size={14} strokeWidth={2} className="mt-[3px] flex-none text-faint" />
                  {o.type} is also issued by {o.others.join(", ")}.
                </p>
              ))}
            </div>
            {acc.observed ? (
              <p className="m-0 max-w-[66ch] text-[13px] leading-[1.6] text-muted">
                Seen since {formatDate(acc.observed.since)}:{" "}
                {acc.capability === "verifier"
                  ? acc.observed.ask.map((a) => inline(a.item)).join(", ")
                  : acc.observed.issue.map((t) => t.name).join(", ")}
                . After {formatDate(ENFORCEMENT_DATE)}, anything not approved is refused.
              </p>
            ) : null}
            <DetailList
              items={[
                { label: "Purpose", value: acc.purpose || "—" },
                ...(acc.capability === "issuer" ? [{ label: "Legal basis", value: legalBasisText(acc) }] : []),
                ...(acc.door === "NEW" ? [{ label: "Officer", value: acc.officerEmail ?? "—" }] : []),
                { label: "Agreement", value: acc.agreementRef || "—" },
                ...(replaces
                  ? [
                      {
                        label: "Replaces",
                        value: `Its current approval${replaces.listedAt ? `, listed ${formatDate(replaces.listedAt)}` : ""} — which stays in force until this one is listed`,
                      },
                    ]
                  : []),
                isRequest
                  ? {
                      label: "Asked by",
                      value: `${acc.requestedBy ? personById(acc.requestedBy).name : "—"}${acc.requestedAt ? `, ${formatDate(acc.requestedAt)}` : ""}`,
                    }
                  : { label: "Proposed by", value: `${proposer}${acc.proposedAt ? `, ${formatDate(acc.proposedAt)}` : ""}` },
                ...(acc.recommendation
                  ? [
                      {
                        label: "Reviewed by",
                        value: `${reviewer} — recommends ${acc.recommendation.approve ? "approving" : "declining"}${acc.recommendation.reason ? `: ${acc.recommendation.reason}` : ""}`,
                      },
                    ]
                  : []),
                ...(acc.decidedBy ? [{ label: "Decided by", value: `${personById(acc.decidedBy).name}${acc.decidedAt ? `, ${formatDate(acc.decidedAt)}` : ""}` }] : []),
                ...(proposedHere && face !== "lapsed"
                  ? [
                      isRequest
                        ? { label: "Waiting since", value: waitingSince ? formatDate(waitingSince) : "—" }
                        : { label: "Lapses", value: `In ${daysUntil(acc.expiresAt)} days, if nobody decides` },
                    ]
                  : []),
              ]}
            />
            {approveReminder ? (
              <p role="status" className="m-0 text-[13.5px] leading-[1.6] text-body">
                A recommendation to approve has waited since {waitingSince ? formatDate(waitingSince) : "—"}.
              </p>
            ) : null}
            <p className="m-0 text-[13.5px] leading-[1.6] text-body">
              {isRequest
                ? `Approving adds ${acc.orgName} to NDI's public list of trusted organisations.`
                : `Once accepted, ${acc.orgName} is added to NDI's public list of trusted organisations.`}
            </p>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What NDI checks</h2>
            <Criteria acc={acc} org={org} overlaps={overlaps} />
          </div>
        </Panel>

        {proposedHere && face !== "lapsed" && face !== "success" ? (
          <div className="flex flex-col gap-3">
            {offline ? (
              <p role="status" className="m-0 text-[13.5px] text-body">
                You&rsquo;re offline, so this is read-only.
              </p>
            ) : null}
            {currentPerson.platformRole === "root" ? (
              <p role="status" className="m-0 text-[13.5px] leading-[1.6] text-body">
                The root account doesn&rsquo;t approve anything. {whoCan.length ? `${whoCan.join(" or ")} can.` : ""}
              </p>
            ) : null}
            {face === "self_proposed" ? (
              <div className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                  {isRequest
                    ? "You reviewed this, so a different administrator has to approve it."
                    : "You proposed this, so a different administrator has to approve it."}
                </p>
                <p className="m-0 text-[13px] text-muted">{whoCan.length ? `${whoCan.join(" or ")} can.` : "No other administrator has an account yet."}</p>
                {/* ACC-02/E11: the reviewer, and only the reviewer, can take
                    a recommended decline back — on SCR-ACC-05, its "Decline
                    waiting" state, where it was made. */}
                {isRequest && acc.recommendation && !acc.recommendation.approve && acc.recommendation.by === harness.persona ? (
                  <div>
                    <HairlineButton onClick={() => router.push(`/admin/accreditations/${acc.id}/review`)}>
                      Go to your recommendation
                    </HairlineButton>
                  </div>
                ) : null}
              </div>
            ) : face === "recommended_decline" ? (
              <>
                <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-body">
                  {reviewer} recommends declining: {asSentence(acc.recommendation?.reason)} Confirm the decline, or talk to {reviewer}{" "}
                  if you disagree.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <GradientButton onClick={() => decide(false)} disabled={!canAct || busy}>
                    {busy ? "Recording…" : "Confirm the decline"}
                  </GradientButton>
                </div>
                <p className="m-0 text-[12.5px] text-muted">{acc.orgName} is told {reviewer}&rsquo;s reason, word for word.</p>
              </>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                <GradientButton onClick={() => decide(true)} disabled={!canAct || busy}>
                  <Icon name="check" size={15} strokeWidth={2.2} />
                  {busy ? "Recording…" : "Approve"}
                </GradientButton>
                <HairlineButton onClick={() => setDeclining(true)} disabled={!canAct || busy}>
                  Decline
                </HairlineButton>
              </div>
            )}
          </div>
        ) : null}

        <Dialog
          open={declining}
          onClose={() => {
            setDeclining(false);
            setReason("");
          }}
          tone="danger"
          title={`Decline ${acc.orgName}'s accreditation?`}
          lead={isRequest ? "The business is shown your reason, in your words — say what to change." : `${proposer} is shown your reason.`}
          confirmLabel="Decline"
          confirmDisabled={!reason.trim()}
          onConfirm={() => {
            if (!reason.trim()) return;
            setDeclining(false);
            decide(false, reason.trim());
          }}
        >
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Reason</span>
            <textarea
              className={`${FIELD_CLASS} resize-y py-3`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isRequest ? 'For example: "Ask to check age only, not the date of birth."' : "For example: the purpose doesn't need the photo."}
            />
          </label>
        </Dialog>

        <Dialog
          open={withdrawing}
          onClose={() => {
            setWithdrawing(false);
            setReason("");
          }}
          tone="danger"
          title={`Withdraw ${acc.orgName}'s approval?`}
          lead={`${acc.orgName} is told it has been withdrawn, with your reason. Nothing is listed, and approving it again needs a new proposal.`}
          confirmLabel="Withdraw"
          confirmDisabled={!reason.trim()}
          onConfirm={() => {
            if (!reason.trim()) return;
            setWithdrawing(false);
            const r = withdrawApproval(acc.id, reason.trim());
            setReason("");
            if (!r.ok) {
              setRefusal(
                r.error === "not_admin"
                  ? DECIDE_REFUSALS.not_admin
                  : "This is no longer waiting to be accepted, so there's nothing to withdraw. Nothing was recorded.",
              );
              return;
            }
            setDone(`Withdrawn. ${acc.orgName} has been told your reason. A new proposal for it is no longer blocked.`);
          }}
        >
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Reason, for the organisation</span>
            <textarea
              className={`${FIELD_CLASS} resize-y py-3`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: we couldn't reach your owner to accept it."
            />
          </label>
        </Dialog>
      </div>
    </AppShell>
  );
}
