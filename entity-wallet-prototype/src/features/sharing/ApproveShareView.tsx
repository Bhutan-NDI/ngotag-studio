"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";
import { statusOf } from "@/lib/sharing";

import { CredentialsToShare, ReferenceCheck, VerifierReason, stateWords } from "./shared";

/**
 * SCR-PRS-04 — Approve sharing. FLOW-PRS-01 A1, FLOW-PRS-02 A1.
 *
 * WHAT THE COLLEAGUE SAW, AND WHO CHOSE IT
 *
 * The approver sees exactly what the sharer saw — the verifier, its reason,
 * its reference, every attribute of every credential chosen, with the
 * asked-for ones marked — plus who chose to share and when (UN-51). They are
 * deciding on what will actually go, which is the whole credential.
 *
 * APPROVE, NEVER SHARE (UXD-44)
 *
 * The sharer shares; the approver approves. *Approve and share with
 * <verifier>* restates the recipient (SC 3.3.4). *Don't approve* says what
 * it does and what it doesn't: the colleague is told, with the note, and
 * can ask someone else — the bank isn't refused, and the request goes back
 * to OPEN (D15).
 *
 * NEVER ONE'S OWN
 *
 * Whoever chose *Share* sees the content and "Someone else must approve
 * this", with no actions. The store refuses it as well (approveOperation),
 * so the screen is never the only thing standing between a person and
 * approving their own share.
 *
 * APPROVAL RE-CHECKS
 *
 * At approval the store checks the sharer again (E16/E11), the verifier
 * (V1/V2) and the credentials (V7). If the sharer can no longer share it,
 * nothing goes and the request reopens; the approver is told why, and — if
 * they may share themselves — offered to.
 */
type Face =
  | "live"
  | "default"
  | "own"
  | "loading"
  | "recheck_error"
  | "initiator_lapsed"
  | "already_decided"
  | "send_error"
  | "cancelled"
  | "offline"
  | "no_permission"
  | "approved";

export function ApproveShareView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const {
    presentationRequests,
    parkedOperations,
    personById,
    harness,
    hydrated,
    whoApproves,
    matchRequest,
    shareVerdict,
    approveOperation,
    rejectOperation,
    withdrawPresentationRequest,
  } = useDemo();
  const forced = useScreenState("SCR-PRS-04", [
    "live",
    "default",
    "own",
    "loading",
    "recheck_error",
    "initiator_lapsed",
    "already_decided",
    "send_error",
    "cancelled",
    "offline",
    "no_permission",
  ]) as Face;

  const [busy, setBusy] = useState(false);
  /* The approval this visit acted on, so its outcome stays on screen after
     the request moves on — rather than reading as "someone else decided". */
  const [actedOn, setActedOn] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  const r = presentationRequests.find((x) => x.id === requestId);

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (!r) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          <PageHeader crumbs={[{ label: "Wallet" }, { label: "Sharing", href: "/wallet/sharing" }, { label: "Not found" }]} title="Request not found" />
          <Panel>
            <p className="relative z-[4] m-0 text-[13.5px] text-muted">
              It may have been reset with the demo.{" "}
              <Link href="/wallet/sharing" className="ndi-plainlink text-accent">
                Back to Sharing
              </Link>
              .
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const st = statusOf(r);
  const v = r.verifierName;
  const person = (id: string | null | undefined) => (id ? personById(id).name : "Someone");
  const op = parkedOperations.find((p) => p.id === (actedOn ?? r.approvalId));
  const sharer = op?.requestedBy ?? r.initiatedBy ?? null;
  const sharerName = person(sharer);
  const me = harness.persona;
  const approvers = whoApproves(r.id);
  const myVerdict = shareVerdict(r.id);
  const iCanShare = myVerdict?.kind === "auto" || myVerdict?.kind === "approval";
  const words = stateWords(r, { person, approvers: approvers.map(person) });

  const natural: Face = busy
    ? "loading"
    : actedOn && op?.state === "approved"
      ? "approved"
      : actedOn && op?.state === "stale" && r.lapsedSharer
        ? "initiator_lapsed"
        : actedOn && op?.state === "stale"
          ? "recheck_error"
          : actedOn && op?.state === "rejected"
            ? "already_decided"
            : st === "WITHDRAWN"
              ? "cancelled"
              : st !== "AWAITING_APPROVAL"
                ? "already_decided"
                : sharer === me
                  ? "own"
                  : !approvers.includes(me)
                    ? "no_permission"
                    : "default";
  const face: Face = forced === "live" ? natural : forced;

  const approve = () => {
    if (!op || forced !== "live") return;
    setBusy(true);
    window.setTimeout(() => {
      setActedOn(op.id);
      approveOperation(op.id, "web");
      setBusy(false);
    }, LOCAL_MS);
  };

  const reject = () => {
    if (!op || forced !== "live") return;
    setActedOn(op.id);
    rejectOperation(op.id, note.trim());
    setRejecting(false);
  };

  const showContent = face !== "no_permission";
  const actionable = face === "default" || face === "loading";

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Wallet" }, { label: "Sharing", href: "/wallet/sharing" }, { label: "Approve" }]}
          title={`${sharerName} wants to share this with ${v}`}
          actions={<StatusPill status={words.status} label={words.label} />}
        />

        {face === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. Nothing has been shared.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}

        {face === "approved" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                Approved. Shared with {v}.
              </p>
              <p className="m-0 text-[13.5px] text-muted">{sharerName} has been told. The history names you both.</p>
              <div>
                <HairlineButton onClick={() => router.push("/wallet/sharing")}>Go to Sharing</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {face === "initiator_lapsed" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="alert" className="m-0 text-[14px] leading-[1.6] text-body">
                {sharerName} can no longer share this, so it hasn&rsquo;t been sent.{iCanShare ? " You can share it yourself." : ""}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {iCanShare ? <GradientButton onClick={() => router.push(`/wallet/sharing/${r.id}`)}>Share it yourself</GradientButton> : null}
                <HairlineButton onClick={() => router.push("/wallet/sharing")}>Go to Sharing</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {face === "recheck_error" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            {op?.invalidatedReason ?? `${v} can't receive this any more. Nothing has been shared.`}{" "}
            <Link href="/wallet/sharing" className="ndi-plainlink text-accent">
              Back
            </Link>
          </p>
        ) : null}
        {face === "send_error" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            Something went wrong sharing this. Nothing has been sent. {v} will need to ask again.
          </p>
        ) : null}
        {face === "cancelled" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            {/* FLOW-PRS-01 E14 and FLOW-PRS-02 E7 word it differently. */}
            {r.sessionId ? `${v} has cancelled this request. Nothing has been shared.` : `${v} cancelled this request. Nothing has been shared.`}
          </p>
        ) : null}
        {face === "already_decided" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 text-[14px] leading-[1.6] text-body">
                {actedOn && op?.state === "rejected"
                  ? `Not approved. ${sharerName} has been told${note.trim() ? ", with your note" : ""}, and can ask someone else.`
                  : st === "SHARED"
                    ? `${person(r.approvedBy ?? r.decidedBy)} already shared this on ${formatDate(r.decidedAt ?? r.receivedAt)}.`
                    : st === "OPEN" && r.rejection
                      ? `${person(r.rejection.by)} didn't approve this on ${formatDate(r.rejection.at)}. It's open again for someone who may share it.`
                      : st === "EXPIRED"
                        ? `This request from ${v} expired on ${formatDate(r.expiresAt)}. Nothing was shared.`
                        : st === "DECLINED"
                          ? `${person(r.decidedBy)} already declined this on ${formatDate(r.decidedAt ?? r.receivedAt)}.`
                          : "There's nothing waiting for approval here."}
              </p>
              <div>
                <HairlineButton onClick={() => router.push("/wallet/sharing")}>Open history</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}
        {face === "no_permission" ? (
          <Panel>
            <p role="alert" className="relative z-[4] m-0 flex items-start gap-2 text-[14px] leading-[1.6] text-body">
              <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[4px] flex-none" style={{ color: "var(--ndi-warning)" }} />
              Only someone who can approve others&rsquo; actions for your organisation can decide this
              {approvers.length ? ` — ${approvers.map(person).join(", ")}` : ""}.
            </p>
          </Panel>
        ) : null}

        {showContent ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="m-0 text-[13.5px] text-body">
                  {sharerName} chose to share this on {formatDate(r.initiatedAt ?? op?.createdAt ?? r.receivedAt)}. Answer by {formatDate(r.expiresAt)}.
                </p>
                <VerifierReason r={r} />
              </div>
              {r.displayReference && r.sessionId ? <ReferenceCheck verifier={v} reference={r.displayReference} /> : null}
              <CredentialsToShare verifier={v} matches={matchRequest(r.id)} chosen={r.chosen ?? {}} />

              {face === "own" ? (
                <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] text-body">
                  Someone else must approve this.
                </p>
              ) : null}

              {actionable ? (
                rejecting ? (
                  <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                    <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                      Don&rsquo;t approve. {sharerName} will be told, and can ask someone else.
                    </p>
                    <label className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>A note to {sharerName} (optional)</span>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="Let's wait until the new address is registered."
                        className={`${FIELD_CLASS} resize-y py-3`}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      <GradientButton onClick={reject}>Don&rsquo;t approve</GradientButton>
                      <HairlineButton onClick={() => setRejecting(false)}>Cancel</HairlineButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-4">
                    <GradientButton onClick={approve} disabled={face === "loading" || forced !== "live"}>
                      <Icon name="userCheck" size={15} strokeWidth={2} />
                      {face === "loading" ? "Sharing…" : `Approve and share with ${v}`}
                    </GradientButton>
                    <HairlineButton onClick={() => setRejecting(true)} disabled={face === "loading" || forced !== "live"}>
                      Don&rsquo;t approve
                    </HairlineButton>
                  </div>
                )
              ) : null}
            </div>
          </Panel>
        ) : null}

        {forced === "live" && st === "AWAITING_APPROVAL" ? (
          <SimulatedStep
            standsFor={`${v}'s system`}
            action={<SimulatedAction onClick={() => withdrawPresentationRequest(r.id)}>Have {v} cancel this request</SimulatedAction>}
          >
            If {v} cancels while this waits for approval, nothing is shared and the approval is removed from the queue.
          </SimulatedStep>
        ) : null}
      </div>
    </AppShell>
  );
}
