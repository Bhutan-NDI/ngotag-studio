"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { dsgReminderSent, isNamedAdmin, type Designation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { SAMPLE_DESIGNATION, daysLeft, dsgPill, kindSingular, kindsInWords, scopePairs } from "./shared";

/**
 * SCR-DSG-02 — Approve a designation. FLOW-ORG-02 A1: dual control, for a
 * task done a handful of times in the platform's life by someone with no
 * routine for it — deliberately the same shape as SCR-INV-02 and
 * SCR-ACC-02 (UX-EW-02 §3.2).
 *
 * THE CONTROL YOU MAY NOT USE IS NOT OFFERED
 *
 * The proposer sees the whole proposal with approve disabled and the
 * reason in its place — never enabled and refused on press (E7, UC-15).
 * Refuse is disabled too; withdrawing is what is left. The store refuses
 * regardless, and logs the attempt.
 *
 * THE CONSEQUENCE AT THE MOMENT OF DECISION
 *
 * The confirmation states what approving does in outcome words: the
 * organisation will create the credential that makes these businesses
 * real, and everyone on the platform will trust what it issues (SC 3.3.4).
 *
 * THREE WAYS IT ENDS BEFORE THE AUTHORITY HEARS OF IT
 *
 * Refused (E12) — DECLINED, with the approver's reason carried to the
 * proposer word for word. Lapsed (E13) — nobody decided in 30 days, which is
 * NDI's lapse, so the page says so plainly. Withdrawn (A3) — by its
 * proposer, with a reason, and kept on record rather than deleted. Asking
 * for more information is none of these: it changes nothing, and the
 * window keeps running.
 *
 * Also the record of a designation in its later states, because an
 * administrator following one up arrives at the same address.
 */
type Face =
  | "live"
  | "default"
  | "self_proposed"
  | "expired"
  | "lapsed"
  | "declined"
  | "withdrawn"
  | "loading"
  | "error"
  | "success"
  | "offline"
  | "empty";

export function ApproveDesignationView({ id }: { id: string }) {
  const router = useRouter();
  const {
    designations,
    organizations,
    people,
    currentPerson,
    harness,
    personById,
    decideDesignation,
    askForMoreInformation,
    withdrawDesignation,
    hydrated,
  } = useDemo();
  const forced = useScreenState("SCR-DSG-02", [
    "live",
    "default",
    "self_proposed",
    "expired",
    "lapsed",
    "declined",
    "withdrawn",
    "loading",
    "error",
    "success",
    "offline",
    "empty",
  ]) as Face;

  const [confirming, setConfirming] = useState<"approve" | "refuse" | "ask" | "withdraw" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const live = designations.find((d) => d.id === id);
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const sample: Designation | undefined =
    live ??
    (forced !== "live" && forced !== "empty"
      ? { ...SAMPLE_DESIGNATION, id, state: "PROPOSED", approvedBy: null, proposedAt: today, expiresAt: in30 }
      : undefined);
  /* The ended faces, for the state switcher, each with what its record would carry. */
  const d: Designation | undefined = !sample
    ? undefined
    : forced === "expired"
      ? { ...sample, state: "EXPIRED", expiredReason: "NOT_ACCEPTED" }
      : forced === "lapsed"
        ? { ...sample, state: "EXPIRED", expiredReason: "NOT_APPROVED", approvedBy: null }
        : forced === "declined"
          ? {
              ...sample,
              state: "DECLINED",
              approvedBy: null,
              declinedBy: sample.declinedBy ?? "tshendu",
              declinedReason: sample.declinedReason ?? "The legal basis needs the Ministry's notification number before this goes further.",
            }
          : forced === "withdrawn"
            ? {
                ...sample,
                state: "WITHDRAWN",
                approvedBy: null,
                withdrawnBy: sample.withdrawnBy ?? sample.proposedBy,
                withdrawnAt: sample.withdrawnAt ?? today,
                withdrawnFrom: "PROPOSED",
                withdrawnReason: sample.withdrawnReason ?? "Proposed against the wrong organisation.",
              }
            : sample;

  const natural: Face = !d
    ? "empty"
    : done
      ? "success"
      : d.state === "EXPIRED"
        ? d.expiredReason === "NOT_APPROVED"
          ? "lapsed"
          : "expired"
        : d.state === "DECLINED" && !d.approvedBy
          ? "declined"
          : d.state === "WITHDRAWN"
            ? "withdrawn"
            : d.state === "PROPOSED" && d.proposedBy === harness.persona
              ? "self_proposed"
              : "default";
  const face: Face = forced === "live" ? natural : forced;
  const offline = face === "offline";
  const isRoot = currentPerson.platformRole === "root";
  const canAct = isNamedAdmin(currentPerson) && !offline && !busy;

  const header = (
    <PageHeader
      crumbs={[{ label: "NDI administration" }, { label: "Designations", href: "/admin/designations" }, { label: d?.orgName ?? "Designation" }]}
      title="Approve a designation"
    />
  );

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (face === "empty" || !d) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState icon="userCheck" title="Nothing is waiting for your approval." message="Designations a colleague proposes come here for a second administrator." />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const org = organizations.find((o) => o.id === d.orgId);
  const pill = dsgPill(d, "admin");
  const whoCan = people
    .filter((p) => isNamedAdmin(p) && p.hasAccount !== false && p.id !== d.proposedBy)
    .map((p) => p.name);
  const ended = face === "expired" || face === "lapsed" || face === "declined" || face === "withdrawn";
  const proposedHere = d.state === "PROPOSED" && !ended;
  /* A3 after approval: any named administrator, while it hasn't activated —
     an abandoned set-up, or an incumbent overlap (E5). */
  const withdrawable = !ended && (d.state === "PENDING" || d.state === "ACCEPTED");

  const decide = (approve: boolean) => {
    setBusy(true);
    setFailed(false);
    window.setTimeout(() => {
      if (forced === "error") {
        setBusy(false);
        setFailed(true);
        setConfirming(null);
        return;
      }
      const r = decideDesignation(d.id, approve, reason);
      setBusy(false);
      setConfirming(null);
      if (!r.ok) {
        setFailed(true);
        return;
      }
      setReason("");
      setDone(
        approve
          ? `Approved. ${d.orgName} has been asked to accept, and has 30 days to.`
          : `Declined. ${d.proposedBy ? personById(d.proposedBy).name : "The proposer"} has been told why. ${d.orgName} isn't told — nothing was ever sent to it.`,
      );
    }, LOCAL_MS);
  };

  const ask = () => {
    const r = askForMoreInformation(d.id, reason);
    setConfirming(null);
    if (!r.ok) {
      setFailed(true);
      return;
    }
    setReason("");
    /* Not `done`: nothing was decided, and the item stays in the queue. */
    setFailed(false);
  };

  const withdraw = () => {
    const r = withdrawDesignation(d.id, reason);
    setConfirming(null);
    if (!r.ok) {
      setFailed(true);
      return;
    }
    setReason("");
    router.push("/admin/designations");
  };

  const reasonField = (label: string) => (
    <label className={FIELD_BLOCK_CLASS}>
      <span className={LABEL_CLASS}>{label}</span>
      <textarea className={`${FIELD_CLASS} resize-y py-3`} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
    </label>
  );

  /* E12, E13, E6 and A3 — each in UX-EW-02 §3.5's words. */
  const endedMessage =
    face === "declined"
      ? `${d.declinedBy ? personById(d.declinedBy).name : "The second administrator"} declined this: ${d.declinedReason ?? "no reason was recorded"}.`
      : face === "lapsed"
        ? "This proposal lapsed without a decision."
        : face === "expired"
          ? "This designation expired without being accepted. A new one needs a fresh second approval."
          : face === "withdrawn"
            ? `Withdrawn by ${d.withdrawnBy ? personById(d.withdrawnBy).name : "an administrator"}${d.withdrawnAt ? ` on ${formatDate(d.withdrawnAt)}` : ""}: ${d.withdrawnReason ?? "no reason was recorded"}.`
            : null;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        {header}

        {face === "success" ? (
          <p role="status" className="m-0 flex items-center gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] text-body">
            <Icon name="check" size={14} strokeWidth={2.4} style={{ color: "var(--ndi-success)" }} />
            {done ?? `Approved. ${d.orgName} has been asked to accept, and has 30 days to.`}
          </p>
        ) : null}
        {failed || face === "error" ? (
          <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13px]" style={{ borderColor: "var(--text-danger)", color: "var(--text-danger)" }}>
            Your decision wasn&rsquo;t recorded — nothing changed. Try again.
          </p>
        ) : null}
        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline, so this is read-only. Deciding is switched off until you&rsquo;re back.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="m-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Designation proposed</p>
                <p className="m-0 font-display text-[18px] font-semibold text-strong">{d.orgName}</p>
              </div>
              <StatusPill status={pill.status} label={pill.label} />
            </div>
            <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
              {d.orgName} would become the authority that confirms {kindsInWords(d.entityTypes)} on the
              platform: when a business says it is registered with them, they answer.
            </p>
            <DetailList
              items={[
                { label: "Legal identity", value: org?.legalName ?? d.orgName },
                { label: "Will confirm", value: scopePairs(d.entityTypes) },
                { label: "Legal basis", value: d.legalBasis },
                ...(d.legalRef ? [{ label: "Reference", value: d.legalRef, mono: true }] : []),
                {
                  label: "Proposed by",
                  value: d.proposedBy ? `${personById(d.proposedBy).name}${d.proposedAt ? `, ${formatDate(d.proposedAt)}` : ""}` : "Before this platform's administrators",
                },
                ...(d.approvedBy ? [{ label: "Approved by", value: `${personById(d.approvedBy).name}${d.approvedAt ? `, ${formatDate(d.approvedAt)}` : ""}` }] : []),
                ...(d.acceptedAt ? [{ label: "Accepted", value: `${d.acceptedBy ? `${personById(d.acceptedBy).name}, ` : ""}${formatDate(d.acceptedAt)}` }] : []),
                ...(d.activatedAt ? [{ label: "Switched on", value: formatDate(d.activatedAt) }] : []),
              ]}
            />
            {proposedHere ? (
              /* E13, SC 2.2.1 — the deadline wherever the proposal appears. */
              <p className="m-0 text-[13.5px] text-body">
                This proposal lapses in {daysLeft(d.expiresAt)} days if no one approves it.
                {dsgReminderSent(d) ? " A reminder has gone to NDI's administrators." : ""}
              </p>
            ) : null}
            {d.state === "PENDING" && !ended ? (
              <p className="m-0 text-[13.5px] text-body">The organisation has {daysLeft(d.expiresAt)} days to accept this.</p>
            ) : null}
            {d.state === "DECLINED" && d.approvedBy && !ended ? (
              <p className="m-0 text-[13.5px] text-body">{d.orgName} declined it. Nothing was created.</p>
            ) : null}
            {d.state === "ACCEPTED" ? (
              <p className="m-0 text-[13.5px] text-body">
                Accepted, but not every activation check passes yet.{" "}
                <Link className="ndi-plainlink font-medium text-accent" href={`/admin/designations/${d.id}/activation`}>
                  See the checks
                </Link>
              </p>
            ) : null}
            {d.state === "ACTIVE" && d.ndiAccess === "REMOVED" ? (
              <p className="m-0 text-[13.5px] text-body">
                {d.orgName} has withdrawn the platform&rsquo;s permission to request proofs in its name. Contact
                the authority if this wasn&rsquo;t expected.
              </p>
            ) : null}
            {endedMessage ? (
              <p role="status" className="m-0 text-[13.5px] text-body">
                {endedMessage}
              </p>
            ) : null}

            {d.infoRequests.length ? (
              <div className="flex flex-col gap-1.5 rounded-[12px] border border-grid px-4 py-3">
                <p className={LABEL_CLASS}>Asked for more information</p>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {d.infoRequests.map((q, i) => (
                    <li key={i} className="text-[13px] leading-[1.55] text-body">
                      {personById(q.by).name}, {formatDate(q.at)}: &ldquo;{q.note}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {isRoot && proposedHere ? (
              <p role="status" className="m-0 text-[13.5px] leading-[1.6] text-body">
                The root account doesn&rsquo;t approve anything. {whoCan.length ? `${whoCan.join(" or ")} can.` : ""}
              </p>
            ) : null}

            {proposedHere && face !== "success" ? (
              face === "self_proposed" ? (
                <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                  <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                    <Icon name="lockRounded" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
                    You proposed this designation, so a different administrator has to approve it.
                  </p>
                  <p className="m-0 text-[13px] text-muted">{whoCan.length ? `${whoCan.join(" or ")} can.` : "No other administrator has an account yet."}</p>
                  <div className="flex flex-wrap gap-2.5">
                    <GradientButton disabled aria-describedby="why-approve">
                      Approve
                    </GradientButton>
                    <HairlineButton disabled>Refuse</HairlineButton>
                    <HairlineButton disabled={offline} onClick={() => setConfirming("withdraw")}>
                      Withdraw it
                    </HairlineButton>
                  </div>
                  <span id="why-approve" className="sr-only">
                    Approve is unavailable because you proposed this.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                  <p className="m-0 text-[13px] leading-[1.6] text-muted">
                    Approving asks {d.orgName} to accept. Refusing means it is never asked. Asking for more
                    information changes nothing — the proposal stays here, and its days keep counting.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <GradientButton onClick={() => setConfirming("approve")} disabled={!canAct}>
                      <Icon name="check" size={15} strokeWidth={2.2} />
                      Approve
                    </GradientButton>
                    <HairlineButton onClick={() => setConfirming("refuse")} disabled={!canAct}>
                      Refuse
                    </HairlineButton>
                    <HairlineButton onClick={() => setConfirming("ask")} disabled={!canAct}>
                      Ask for more information
                    </HairlineButton>
                  </div>
                </div>
              )
            ) : null}

            {withdrawable && isNamedAdmin(currentPerson) ? (
              <div className="flex flex-col gap-2 border-t border-subtle pt-4">
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  It hasn&rsquo;t been switched on. If it shouldn&rsquo;t go ahead, withdraw it with a reason.{" "}
                  {d.orgName} is told.
                </p>
                <div>
                  <HairlineButton onClick={() => setConfirming("withdraw")} disabled={offline}>
                    Withdraw this designation
                  </HairlineButton>
                </div>
              </div>
            ) : null}
          </div>
        </Panel>

        {face === "expired" || face === "lapsed" || face === "declined" ? (
          <div>
            <GradientButton onClick={() => router.push("/admin/designations/new")}>
              {face === "declined" ? "Propose again, changed" : "Propose again"}
            </GradientButton>
          </div>
        ) : null}

        <Dialog
          open={confirming === "approve"}
          onClose={() => setConfirming(null)}
          title={`Approve ${d.orgName}?`}
          lead={`This organisation will be able to create the credential that makes a ${d.entityTypes.map(kindSingular).join(" or a ")} real. Everyone on the platform will trust what it issues.`}
          consequences={[
            `${d.orgName} is asked to accept, and has 30 days to`,
            "It is recorded with your name as the second administrator — permanently",
            "Nothing switches on until it accepts and the activation checks pass",
          ]}
          confirmLabel={busy ? "Recording…" : "Approve"}
          confirmDisabled={busy}
          onConfirm={() => decide(true)}
        />
        <Dialog
          open={confirming === "refuse"}
          onClose={() => setConfirming(null)}
          tone="danger"
          title={`Refuse ${d.orgName}?`}
          lead="It is never sent. Your reason goes to the proposer word for word. If it should go ahead later, it has to be proposed again — and approved again."
          confirmLabel={busy ? "Recording…" : "Refuse"}
          confirmDisabled={busy || !reason.trim()}
          onConfirm={() => decide(false)}
        >
          {reasonField("Reason, for the proposer")}
        </Dialog>
        <Dialog
          open={confirming === "ask"}
          onClose={() => setConfirming(null)}
          title="Ask for more information?"
          lead={`${d.proposedBy ? personById(d.proposedBy).name : "The proposer"} is asked. Nothing else changes: the proposal stays waiting for approval, and its days keep counting.`}
          confirmLabel="Ask"
          confirmDisabled={!reason.trim()}
          onConfirm={ask}
        >
          {reasonField("What do you need to know?")}
        </Dialog>
        <Dialog
          open={confirming === "withdraw"}
          onClose={() => setConfirming(null)}
          tone="danger"
          title="Withdraw this designation?"
          lead={
            d.state === "PROPOSED"
              ? "It ends here and is kept on record with your reason. Nothing was ever sent to the organisation."
              : `It ends here and is kept on record with your reason. ${d.orgName} is told: "NDI has withdrawn this designation: <your reason>."`
          }
          confirmLabel="Withdraw it"
          confirmDisabled={!reason.trim()}
          onConfirm={withdraw}
        >
          {reasonField("Reason")}
        </Dialog>
      </div>
    </AppShell>
  );
}
