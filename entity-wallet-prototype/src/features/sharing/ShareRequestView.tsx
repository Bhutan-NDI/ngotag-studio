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
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { shortOrgName } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";
import { namesOf, satisfiable, statusOf } from "@/lib/sharing";

import { CredentialsToShare, ReferenceCheck, VerifierReason, refusedSentence, stateWords } from "./shared";

/**
 * SCR-PRS-02 — Share with <verifier>? FLOW-PRS-01 step 7, FLOW-PRS-02 step 5.
 *
 * THE ONE DECISION, AND IT MUST NOT BE QUICK
 *
 * Everything before this screen is meant to be passed quickly; this one
 * isn't (§1.3). Who is asking, as NDI lists them; their reason, in their
 * own words and labelled as theirs; on a website request, their reference
 * with the only-continue-if sentence (D21); and every attribute of every
 * credential that will go, the asked-for ones marked (D4, UXD-42). Nothing
 * here lets anyone pick attributes: the whole credential is shared, and
 * the screen says so rather than promising less.
 *
 * WHAT *SHARE* DOES IS DECIDED BEFORE IT IS PRESSED
 *
 * The store reads the person's *Share* preset — its reach and its approval
 * — and the screen renders that answer (EW-FLOW7-SD §5.3). The Root, or a
 * Controller the Root set to AUTO, shares at once. A Controller under
 * SINGLE_APPROVER is told *before* choosing who will be asked (UN-50), and
 * *Share* sends it to them; the sharer never approves (UXD-44). Someone with
 * no *Share*, or facing an organisation outside their reach, sees the whole
 * request, the reason they can't answer it, and *Pass to someone who can*,
 * naming who (D13) — never a dead end.
 *
 * Decline needs what Share needs, because it answers the bank. Passing on
 * needs only being able to see the request.
 */
type Face =
  | "live"
  | "default"
  | "with_approval"
  | "cant_satisfy"
  | "no_approver"
  | "loading"
  | "recheck_error"
  | "send_error"
  | "already_answered"
  | "cancelled"
  | "offline"
  | "no_permission"
  | "outside_reach";

type Done = { kind: "approval"; names: string } | { kind: "declined" } | { kind: "passed"; names: string };

export function ShareRequestView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const {
    presentationRequests,
    organizations,
    personById,
    harness,
    hydrated,
    shareVerdict,
    matchRequest,
    whoApproves,
    shareRequest,
    declineRequest,
    passRequest,
    keepForLater,
    withdrawPresentationRequest,
  } = useDemo();
  const forced = useScreenState("SCR-PRS-02", [
    "live",
    "default",
    "with_approval",
    "cant_satisfy",
    "no_approver",
    "loading",
    "recheck_error",
    "send_error",
    "already_answered",
    "cancelled",
    "offline",
    "no_permission",
    "outside_reach",
  ]) as Face;

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, string>>({});

  const r = presentationRequests.find((x) => x.id === requestId);
  const verdict = r ? shareVerdict(r.id) : null;
  const matches = r ? matchRequest(r.id) : [];
  const fromWebsite = Boolean(r?.sessionId);

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

  const v = r.verifierName;
  const st = statusOf(r);
  const person = (id: string | null | undefined) => (id ? personById(id).name : "Someone");
  const orgName = shortOrgName(organizations.find((o) => o.id === (r.orgId ?? "org-pelden"))?.name ?? "your organisation");

  const natural: Face = busy
    ? "loading"
    : st === "WITHDRAWN"
      ? "cancelled"
      : st !== "OPEN"
        ? "already_answered"
        : verdict?.kind === "no_permission"
          ? "no_permission"
          : verdict?.kind === "outside_reach"
            ? "outside_reach"
            : !satisfiable(matches)
              ? "cant_satisfy"
              : verdict?.kind === "no_approver"
                ? "no_approver"
                : verdict?.kind === "approval"
                  ? "with_approval"
                  : "default";
  const face: Face = forced === "live" ? natural : forced;

  /* Names for the state the screen is in, live or forced. */
  const approverNames =
    verdict?.kind === "approval" ? verdict.approvers.map(person) : face === "with_approval" ? whoApproves(r.id).map(person) : [];
  const canNames = verdict && (verdict.kind === "no_permission" || verdict.kind === "outside_reach") ? verdict.can.map(person) : [];
  const allowed = verdict?.kind === "outside_reach" ? verdict.allowed : [];

  const chosen: Record<string, string> = {};
  for (const m of matches) chosen[m.descriptor.id] = picked[m.descriptor.id] ?? m.options[0]?.id ?? "";

  const toOutcome = (why?: string) => router.push(`/wallet/sharing/${r.id}/done${why ? `?why=${why}` : ""}`);

  const share = () => {
    if (forced === "offline" || forced === "send_error" || forced === "recheck_error") return;
    setBusy(true);
    setError(null);
    window.setTimeout(() => {
      const res = shareRequest(r.id, chosen);
      setBusy(false);
      if (res.ok) {
        if (fromWebsite) toOutcome();
        else if (res.status === "AWAITING_APPROVAL") setDone({ kind: "approval", names: namesOf(res.approvers.map(person)) });
        else router.push("/wallet/sharing");
        return;
      }
      if (res.error === "E8") setError(`${v} can't receive this any more. Nothing has been shared.`);
    }, LOCAL_MS);
  };

  const decline = () => {
    const res = declineRequest(r.id);
    if (!res.ok) return;
    if (fromWebsite) toOutcome();
    else setDone({ kind: "declined" });
  };

  const pass = () => {
    const res = passRequest(r.id);
    if (!res.ok) return;
    if (fromWebsite) toOutcome("passed");
    else setDone({ kind: "passed", names: namesOf(res.to.map(person)) });
  };

  const keep = () => {
    keepForLater(r.id);
    toOutcome("kept");
  };

  const header = (
    <PageHeader
      crumbs={[{ label: "Wallet" }, { label: "Sharing", href: "/wallet/sharing" }, { label: v }]}
      title={`Share with ${v}?`}
      actions={<StatusPill status={stateWords(r, { person, approvers: [] }).status} label={stateWords(r, { person, approvers: [] }).label} />}
    />
  );

  /* ---- After acting, in FLOW-PRS-02 (no website to go back to) ---- */
  if (done) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                {done.kind === "approval"
                  ? `Sent to ${done.names} to approve.`
                  : done.kind === "passed"
                    ? `Passed to ${done.names}.`
                    : "You've declined. Nothing has been shared."}
              </p>
              {done.kind === "approval" ? (
                <p className="m-0 text-[13.5px] leading-[1.6] text-muted">{v} doesn&rsquo;t have this yet. You&rsquo;ll be told when they decide.</p>
              ) : null}
              <div>
                <HairlineButton onClick={() => router.push("/wallet/sharing")}>Go to Sharing</HairlineButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  /* ---- No longer answerable: say who did what, or why ---- */
  if (face === "already_answered" || face === "cancelled") {
    const awaiting = st === "AWAITING_APPROVAL";
    const mineAwaiting = awaiting && r.initiatedBy === harness.persona;
    const canApprove = awaiting && !mineAwaiting && whoApproves(r.id).includes(harness.persona);
    const line =
      face === "cancelled"
        ? `${v} cancelled this request. Nothing has been shared.`
        : st === "SHARED"
          ? `${person(r.initiatedBy ?? r.decidedBy)} already shared this on ${formatDate(r.decidedAt ?? r.receivedAt)}.`
          : st === "DECLINED"
            ? `${person(r.decidedBy)} already declined this on ${formatDate(r.decidedAt ?? r.receivedAt)}.`
            : st === "EXPIRED"
              ? `This request from ${v} expired on ${formatDate(r.expiresAt)}. Nothing was shared.`
              : st === "FAILED"
                ? (r.failure ?? "Something went wrong sharing this. Nothing has been sent. " + v + " will need to ask again.")
                : st === "BLOCKED"
                  ? refusedSentence(r)
                  : st === "RECEIVED"
                    ? `Checking ${v} — you can't answer this yet.`
                    : mineAwaiting
                      ? `Sent to ${namesOf(whoApproves(r.id).map(person))} to approve.`
                      : `${person(r.initiatedBy)} chose to share this on ${formatDate(r.initiatedAt ?? r.receivedAt)}. Waiting for ${namesOf(whoApproves(r.id).map(person))} to approve.`;
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 text-[14px] leading-[1.6] text-body">
                {line}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {canApprove ? <GradientButton onClick={() => router.push(`/wallet/sharing/${r.id}/approve`)}>Approve</GradientButton> : null}
                <HairlineButton onClick={() => router.push("/wallet/sharing")}>Open history</HairlineButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const readOnly = face === "no_permission" || face === "outside_reach";
  const blockedShare = readOnly || face === "cant_satisfy" || face === "no_approver";

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}

        {face === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. Nothing has been shared.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}
        {face === "send_error" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            {fromWebsite
              ? `Something went wrong sharing this. Nothing has been sent. Go back to ${v} and try again.`
              : `Something went wrong sharing this. Nothing has been sent. ${v} will need to ask again.`}
          </p>
        ) : null}
        {face === "recheck_error" || error ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            {error ?? `${v} can't receive this any more. Nothing has been shared.`}
          </p>
        ) : null}
        {r.failure && st === "OPEN" ? (
          /* E8/E12 with V7 — a credential changed between choosing and sending. */
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            {r.failure} Choose again, or decline.
          </p>
        ) : null}
        {st === "OPEN" && r.rejection ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            {person(r.rejection.by)} didn&rsquo;t approve sharing this{r.rejection.note ? `: ${r.rejection.note.replace(/\.$/, "")}.` : "."}
          </p>
        ) : null}
        {st === "OPEN" && r.lapsedSharer ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            {person(r.lapsedSharer)} can no longer share this, so it hasn&rsquo;t been sent. It&rsquo;s open again.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="m-0 text-[13px] text-muted">
                {v} is on NDI&rsquo;s list of trusted organisations. Answer by {formatDate(r.expiresAt)}.
              </p>
              <VerifierReason r={r} />
              {r.repeatOf ? <p className="m-0 text-[13px] text-muted">{v} has asked again.</p> : null}
            </div>
            {fromWebsite && r.displayReference ? <ReferenceCheck verifier={v} reference={r.displayReference} /> : null}

            <CredentialsToShare
              verifier={v}
              matches={face === "cant_satisfy" && satisfiable(matches) ? matches.map((m, i) => (i === matches.length - 1 ? { ...m, options: [] } : m)) : matches}
              chosen={chosen}
              onChoose={readOnly ? undefined : (d, c) => setPicked((p) => ({ ...p, [d]: c }))}
            />

            {/* ---- Who will approve, before Share (UN-50) ---- */}
            {face === "with_approval" ? (
              <p className="m-0 flex items-start gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body">
                <Icon name="userCheck" size={15} strokeWidth={2} className="mt-[3px] flex-none text-accent" />
                {namesOf(approverNames) || "Someone"} will be asked to approve before {v} gets this.
              </p>
            ) : null}
            {face === "no_approver" ? (
              <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body">
                Sharing needs someone else in {orgName} to approve, and nobody can at the moment.
                {fromWebsite ? " You can keep this request for later." : ""}
              </p>
            ) : null}
            {face === "no_permission" ? (
              <p role="alert" className="m-0 flex items-start gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body">
                <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
                You can&rsquo;t share with {v}. {namesOf(canNames) || "Your organisation's representative"} can. Pass it to them?
              </p>
            ) : null}
            {face === "outside_reach" ? (
              <p role="alert" className="m-0 flex items-start gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body">
                <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
                You can share only with {namesOf(allowed) || "the organisations named for you"}. {namesOf(canNames) || "Your organisation's representative"} can share with {v}.
              </p>
            ) : null}

            {/* ---- Actions ---- */}
            <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-4">
              {readOnly ? (
                <GradientButton onClick={pass} disabled={forced !== "live" || canNames.length === 0}>
                  <Icon name="send" size={15} strokeWidth={2} />
                  Pass to someone who can
                </GradientButton>
              ) : (
                <GradientButton onClick={share} disabled={blockedShare || face === "loading" || face === "offline"}>
                  <Icon name="send" size={15} strokeWidth={2} />
                  {face === "loading" ? "Sharing…" : `Share with ${v}`}
                </GradientButton>
              )}
              {!readOnly && face !== "no_approver" ? (
                <HairlineButton onClick={decline} disabled={face === "loading" || face === "offline" || forced !== "live"}>
                  Decline
                </HairlineButton>
              ) : null}
              {fromWebsite && face !== "with_approval" && !readOnly ? (
                <HairlineButton onClick={keep} disabled={face === "loading" || forced !== "live"}>
                  Keep for later
                </HairlineButton>
              ) : null}
            </div>
            {face === "with_approval" ? (
              <p className="m-0 text-[12.5px] leading-[1.5] text-faint">
                Choosing Share sends it to them. Nothing goes to {v} until one of them approves.
              </p>
            ) : null}
          </div>
        </Panel>

        {forced === "live" ? (
          <SimulatedStep
            standsFor={`${v}'s system`}
            action={<SimulatedAction onClick={() => withdrawPresentationRequest(r.id)}>Have {v} cancel this request</SimulatedAction>}
          >
            A bank or agency can cancel a request it no longer needs — the customer abandoned the application, say. If it does
            while you&rsquo;re deciding, nothing is shared.
          </SimulatedStep>
        ) : null}
      </div>
    </AppShell>
  );
}
