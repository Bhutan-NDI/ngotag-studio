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
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { delegateNameOf, statement, stateWords } from "@/lib/authority";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { Notice, Statement, WhatTheyCarry } from "./shared";

/**
 * SCR-AUT-06 — Approve authority. FLOW-AUT-01 A1; E11, E16.
 *
 * WHAT THE COLLEAGUE CHOSE, AND WHO ASKED
 *
 * The approver sees SCR-AUT-03's statement and what-they-carry text exactly
 * as the grantor saw them, and who asked and when (UN-59). The approval is
 * bound to the hash of the grant as submitted (D20), so what is approved is
 * what the person will carry.
 *
 * APPROVE, NEVER GIVE (UXD-44)
 *
 * The grantor *gives*; the approver *approves* — "Approve — the link will
 * be ready for <name>". *Don't approve* takes an optional note, which the
 * grantor reads; the grant ends REJECTED, because nobody outside is waiting
 * on it and anyone who may give authority can give it again (D22).
 *
 * NEVER ONE'S OWN
 *
 * Whoever gave it sees the content and "You can't approve your own.", with
 * no actions. The store refuses it as well (approveOperation), so the
 * screen is never the only thing in the way.
 *
 * RE-CHECKS AT APPROVAL
 *
 * The store checks the grantor still may give authority (E16) and runs
 * G2–G6 again (E11). Either failing ends the grant FAILED, and this screen
 * says why in §3.5's words.
 */
type Face = "live" | "default" | "own" | "cant_go_ahead" | "grantor_lapsed" | "already_decided" | "loading" | "offline" | "no_permission" | "approved" | "rejected";

export function ApproveGrantView({ grantId }: { grantId: string }) {
  const router = useRouter();
  const { hydrated, authorityGrants, parkedOperations, organizations, personById, harness, grantApprovers, approveOperation, rejectOperation } = useDemo();
  const forced = useScreenState("SCR-AUT-06", [
    "live",
    "default",
    "own",
    "cant_go_ahead",
    "grantor_lapsed",
    "already_decided",
    "loading",
    "offline",
    "no_permission",
  ]) as Face;
  const [busy, setBusy] = useState(false);
  const [acted, setActed] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  const g = authorityGrants.find((x) => x.id === grantId);

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (!g) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
          <PageHeader crumbs={[{ label: "Approvals", href: "/approvals" }, { label: "Not found" }]} title="Not found" />
          <Notice role="status">
            It may have been reset with the demo.{" "}
            <Link href="/approvals" className="ndi-plainlink text-accent">
              Back to approvals
            </Link>
            .
          </Notice>
        </div>
      </AppShell>
    );
  }

  const orgName = organizations.find((o) => o.id === g.orgId)?.name ?? "your organisation";
  const person = (id: string | null | undefined) => (id ? personById(id).name : "Someone");
  const name = delegateNameOf(g);
  const grantor = person(g.grantedBy);
  const op = parkedOperations.find((p) => p.id === g.approvalId);
  const approvers = grantApprovers(g.id);
  const me = harness.persona;
  const words = stateWords(g, { person, approvers: approvers.map(person), org: orgName });

  const natural: Face = busy
    ? "loading"
    : acted && g.status === "REJECTED"
      ? "rejected"
      : acted && g.status === "FAILED" && op?.invalidatedReason?.includes("can no longer give authority")
        ? "grantor_lapsed"
        : acted && g.status === "FAILED"
          ? "cant_go_ahead"
          : acted && g.status !== "AWAITING_APPROVAL"
            ? "approved"
            : g.status !== "AWAITING_APPROVAL"
              ? "already_decided"
              : g.grantedBy === me
                ? "own"
                : !approvers.includes(me)
                  ? "no_permission"
                  : "default";
  const face: Face = forced === "live" ? natural : forced;
  const actionable = face === "default" || face === "loading";

  const approve = () => {
    if (!op || forced !== "live") return;
    setBusy(true);
    window.setTimeout(() => {
      setActed(true);
      approveOperation(op.id, "web");
      setBusy(false);
    }, LOCAL_MS);
  };

  const reject = () => {
    if (!op || forced !== "live") return;
    setActed(true);
    rejectOperation(op.id, note.trim());
    setRejecting(false);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Approvals", href: "/approvals" }, { label: "Approve authority" }]}
          title={`${grantor} wants to give ${name} authority`}
          actions={<StatusPill status={words.pill} label={words.label} />}
        />

        {face === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}
        {face === "approved" ? (
          <Notice role="status" tone="success">
            Approved. {g.status === "CLAIMABLE" ? `The link is ready for ${name}` : `${orgName} is being set up to give authority; the link follows`}, and{" "}
            {grantor} has been told.
          </Notice>
        ) : null}
        {face === "rejected" ? (
          <Notice role="status">
            Not approved. {grantor} has been told{note.trim() ? ", with your note" : ""}. Nothing was given.
          </Notice>
        ) : null}
        {face === "grantor_lapsed" ? (
          <Notice role="alert" tone="warning">
            {grantor} can no longer give authority, so this hasn&rsquo;t gone ahead.
          </Notice>
        ) : null}
        {face === "cant_go_ahead" ? (
          <Notice role="alert" tone="warning">
            {g.status === "FAILED" && g.endReason ? g.endReason : `${orgName} can't give authority at the moment: its registration isn't valid.`}
          </Notice>
        ) : null}
        {face === "already_decided" ? (
          <Notice role="status">
            {g.status === "REJECTED" && g.rejection
              ? `${person(g.rejection.by)} didn't approve this on ${formatDate(g.rejection.at)}.`
              : g.approvedBy
                ? `${person(g.approvedBy)} already approved this.`
                : words.sentence}{" "}
            <Link href={`/authority-to-act/${g.id}`} className="ndi-plainlink text-accent">
              Open
            </Link>
          </Notice>
        ) : null}
        {face === "no_permission" ? (
          <Notice role="alert" tone="warning">
            Only someone who can approve others&rsquo; actions for {orgName} can decide this
            {approvers.length ? ` — ${approvers.map(person).join(", ")}` : ""}.
          </Notice>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <p className="m-0 text-[13.5px] text-muted">
              {grantor} asked on {formatDate(g.submittedAt)}.
            </p>
            <Statement>{statement({ organizations }, g)}</Statement>
            <WhatTheyCarry name={name} orgName={orgName} licences={g.licenceNumbers} />

            {face === "own" ? (
              <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] text-body">
                You can&rsquo;t approve your own.
              </p>
            ) : null}

            {actionable ? (
              rejecting ? (
                <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                  <p className="m-0 text-[13.5px] leading-[1.6] text-body">Don&rsquo;t approve. {grantor} will be told, and nothing will be given.</p>
                  <label className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>A note to {grantor} (optional)</span>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Let's give Sangay a lower limit to start with."
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
                    {face === "loading" ? "Approving…" : `Approve — the link will be ready for ${name}`}
                  </GradientButton>
                  <HairlineButton onClick={() => setRejecting(true)} disabled={face === "loading" || forced !== "live"}>
                    Don&rsquo;t approve
                  </HairlineButton>
                </div>
              )
            ) : null}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
