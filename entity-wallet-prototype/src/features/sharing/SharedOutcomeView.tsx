"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";
import { namesOf, statusOf } from "@/lib/sharing";

/**
 * SCR-PRS-03 — Shared, back to <verifier>. FLOW-PRS-01 steps 9–11, A1–A3,
 * E7, E8, E13, E15.
 *
 * ONE LINE, THEN BACK
 *
 * The person came from the bank's form and wants to return to it. The
 * screen says what happened in one line and sends them back to the address
 * the bank registered — never one a link supplied (D9).
 *
 * A COUNTDOWN ONLY WHEN THE BANK HAS IT (UXD-43)
 *
 * *Shared* counts down five seconds, visibly, and the person can stop it
 * (SC 3.2.5). Every other outcome waits for a press. "<Verifier> doesn't
 * have this yet" is the sentence UC-35 tests — a person who clicked Share
 * and is back at the bank's site will assume the bank has it — so it must
 * be read, and a countdown would carry them past it.
 *
 * *Go back* works without the server: in the product the address is
 * already on the page. *Stay in the wallet* stops the countdown and opens
 * Sharing.
 */
type Face = "live" | "shared" | "pending_approval" | "pending_kept" | "pending_passed" | "pending_checking" | "declined" | "refused" | "failed" | "cancelled" | "expired" | "no_return" | "offline";

export function SharedOutcomeView({ requestId, why }: { requestId: string; why: string | null }) {
  const router = useRouter();
  const { presentationRequests, returnAddresses, presentationSessions, personById, whoApproves, shareVerdict, returnToVerifier, hydrated } = useDemo();
  const forced = useScreenState("SCR-PRS-03", [
    "live",
    "shared",
    "pending_approval",
    "pending_kept",
    "pending_passed",
    "pending_checking",
    "declined",
    "refused",
    "failed",
    "cancelled",
    "expired",
    "no_return",
    "offline",
  ]) as Face;

  const r = presentationRequests.find((x) => x.id === requestId);
  const session = presentationSessions.find((x) => x.id === r?.sessionId);
  const st = r ? statusOf(r) : null;
  const hasReturn = Boolean(session && returnAddresses.some((a) => a.orgId === session.verifierOrgId && a.returnUrlId === session.returnUrlId && !a.removedAt));

  const natural: Face = !r
    ? "failed"
    : !hasReturn
      ? "no_return"
      : st === "SHARED"
        ? "shared"
        : st === "AWAITING_APPROVAL"
          ? "pending_approval"
          : st === "RECEIVED"
            ? "pending_checking"
            : st === "DECLINED"
              ? "declined"
              : st === "BLOCKED"
                ? "refused"
                : st === "FAILED"
                  ? "failed"
                  : st === "EXPIRED"
                    ? "expired"
                    : st === "WITHDRAWN"
                      ? "cancelled"
                      : why === "passed"
                        ? "pending_passed"
                        : "pending_kept";
  const face: Face = forced === "live" ? natural : forced;

  const [left, setLeft] = useState(5);
  const [stopped, setStopped] = useState(false);
  const counting = face === "shared" && !stopped;

  const goBack = () => {
    if (!session) return;
    const back = returnToVerifier(session.id);
    if (back.url) router.push(back.url);
  };

  useEffect(() => {
    if (!counting || !hydrated) return;
    if (left <= 0) {
      goBack();
      return;
    }
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counting, left, hydrated]);

  const v = r?.verifierName ?? "the website";
  const approvers = r ? namesOf(whoApproves(r.id).map((id) => personById(id).name)) : "";
  /* Who it went to — the people who could share it when it was passed. */
  const verdict = r ? shareVerdict(r.id) : null;
  const passedTo = verdict && "can" in verdict ? namesOf(verdict.can.map((id) => personById(id).name)) : "";

  const lines: Record<Exclude<Face, "live">, { lead: string; more?: string; ok?: boolean }> = {
    shared: { lead: `Shared with ${v}. Taking you back in ${left} seconds.`, ok: true },
    pending_approval: {
      /* Must survive review unchanged (§2.4), "need" included. */
      lead: `${v} doesn't have this yet. ${approvers || "Someone"} need to approve it first. We'll send it as soon as they do.`,
    },
    pending_kept: { lead: `${v} doesn't have this yet. It's saved under Sharing until ${formatDate(r?.expiresAt ?? new Date().toISOString())}.` },
    pending_passed: { lead: `${v} doesn't have this yet. Passed to ${passedTo || "someone who can share it"}.` },
    pending_checking: { lead: `We can't check ${v} right now. We've kept the request — you'll find it under Sharing.` },
    declined: { lead: "You've declined. Nothing has been shared." },
    refused: { lead: `${v}'s request can't be answered through the NDI Entity Wallet. Nothing has been shared.` },
    /* E12 (V1/V2) says the bank can't receive it; anything else is E13. */
    failed: { lead: r?.failure && st === "FAILED" ? r.failure : `Something went wrong sharing this. Nothing has been sent. Go back to ${v} and try again.` },
    cancelled: { lead: `${v} has cancelled this request. Nothing has been shared.` },
    /* FLOW-PRS-02 E6's words: a kept request nobody answered in its seven days. */
    expired: { lead: `This request from ${v} expired on ${formatDate(r?.expiresAt ?? new Date().toISOString())}. Nothing was shared.` },
    no_return: { lead: `Done. Go back to ${v}'s website to continue.` },
    offline: { lead: r && st === "SHARED" ? `Shared with ${v}.` : `${v} doesn't have this yet.`, more: "You're offline, so this is the outcome as we last knew it. Going back still works." },
  };
  const shown = lines[face as Exclude<Face, "live">];

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-64 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "Wallet" }, { label: "Sharing", href: "/wallet/sharing" }, { label: v }]} title={face === "shared" ? `Shared with ${v}` : v} />
        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <p role="status" aria-live="polite" className="m-0 flex items-start gap-2.5 text-[15.5px] font-medium leading-[1.5] text-strong">
              <Icon
                name={shown.ok ? "check" : "info"}
                size={17}
                strokeWidth={2.2}
                className="mt-[3px] flex-none"
                style={{ color: shown.ok ? "var(--ndi-success)" : "var(--ndi-info)" }}
              />
              {face === "shared" && stopped ? `Shared with ${v}.` : shown.lead}
            </p>
            {shown.more ? <p className="m-0 text-[13.5px] text-muted">{shown.more}</p> : null}
            {face === "no_return" ? null : (
              <div className="flex flex-wrap gap-2.5">
                <GradientButton onClick={goBack}>
                  Go back to {v}
                  <Icon name="arrowRight" size={15} strokeWidth={2} />
                </GradientButton>
                {face.startsWith("pending") || face === "shared" ? (
                  <HairlineButton
                    onClick={() => {
                      setStopped(true);
                      router.push("/wallet/sharing");
                    }}
                  >
                    Stay in the wallet
                  </HairlineButton>
                ) : null}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
