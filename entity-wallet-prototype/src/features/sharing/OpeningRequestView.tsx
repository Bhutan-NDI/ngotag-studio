"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { Icon } from "@/components/ui/icons";
import { shortOrgName } from "@/lib/demoData";
import { useDemo, type SessionLook } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { ReferenceCheck } from "./shared";

/**
 * SCR-PRS-01 — Opening a request. FLOW-PRS-01 steps 1–6.
 *
 * THE PATTERN PHISHING IMITATES, SO THE ADDRESS AND THE NAME COME FIRST
 *
 * A person sent from a site they trust to a page asking them to sign in is
 * exactly what a fake page does. The only reassurances the design has are
 * the wallet's own address and the verifier's name as NDI lists it, and
 * both are on screen before sign-in (§1.4, UXD-40, UXD-41). The name is
 * read from the platform's record of the session's verifier, never from
 * the link or the request. The verifier's reference sits with them, with
 * the sentence that tells the person to compare it (UXD-46).
 *
 * QUICK TO PASS
 *
 * Every screen before the decision should be quick; this one is: sign in
 * if there is no session, choose the organisation if there is more than
 * one, and "Getting <verifier>'s request…" while the wallet receives it.
 * Nothing is shared here — permission is decided on the next screen.
 *
 * SIMULATED
 *
 * The Bhutan NDI sign-in happens on the person's phone; the dashed step
 * stands in for it and signs in as whoever the demo is driven as. In the
 * product Studio keeps the session reference on its own side through the
 * sign-in and accepts only a Studio path after it (§7.3).
 */
type Face =
  | "live"
  | "signed_out"
  | "choose"
  | "loading"
  | "checking"
  | "error_unknown"
  | "error_expired"
  | "error_used"
  | "no_organisation"
  | "refused"
  | "no_request"
  | "offline";

type Phase = "signed_out" | "signing_in" | "choose" | "loading" | "checking" | "no_organisation" | "refused" | "used";

export function OpeningRequestView({ sessionId }: { sessionId: string | null }) {
  const router = useRouter();
  const { hydrated, currentPerson, openPresentationSession, redeemPresentationSession, returnToVerifier, sharingOrgs } = useDemo();
  const forced = useScreenState("SCR-PRS-01", [
    "live",
    "signed_out",
    "choose",
    "loading",
    "checking",
    "error_unknown",
    "error_expired",
    "error_used",
    "no_organisation",
    "refused",
    "no_request",
    "offline",
  ]) as Face;

  const [look, setLook] = useState<SessionLook | null>(null);
  const [phase, setPhase] = useState<Phase>("signed_out");
  const [usedRequest, setUsedRequest] = useState<string | null>(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    setLook(sessionId ? openPresentationSession(sessionId) : { kind: "unknown" });
    setAddress(`${window.location.host}/present`);
    // Re-read when the person driving changes: E3 depends on who is looking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sessionId, currentPerson.id]);

  const verifier = look && look.kind !== "unknown" ? look.verifierName : "The organisation";
  const reference = look?.kind === "ready" ? look.displayReference : null;

  const natural: Face = !look
    ? "loading"
    : look.kind === "unknown"
      ? "error_unknown"
      : look.kind === "expired"
        ? "error_expired"
        : look.kind === "used" || phase === "used"
          ? "error_used"
          : phase === "choose"
            ? "choose"
            : phase === "loading"
              ? "loading"
              : phase === "checking"
                ? "checking"
                : phase === "no_organisation"
                  ? "no_organisation"
                  : phase === "refused"
                    ? "refused"
                    : "signed_out";
  const face: Face = forced === "live" ? natural : forced;
  const usedId = usedRequest ?? (look?.kind === "used" ? look.requestId : null);

  const redeem = (orgId: string) => {
    if (!sessionId) return;
    setPhase("loading");
    /* Steps 4–6 run behind "Getting <verifier>'s request…": they take
       seconds and the person can do nothing about them. */
    window.setTimeout(() => {
      const res = redeemPresentationSession(sessionId, orgId);
      if (res.ok) router.push(`/wallet/sharing/${res.requestId}`);
      else if (res.error === "E7") setPhase("refused");
      else if (res.error === "E4") setPhase("no_organisation");
      else if (res.error === "E3") {
        setUsedRequest(res.requestId ?? null);
        setPhase("used");
      } else setLook({ kind: "expired", verifierName: verifier, sessionId });
    }, ROUND_TRIP_MS);
  };

  const afterSignIn = () => {
    const orgs = sharingOrgs();
    if (orgs.length === 0) {
      /* E4 — the session is DECLINED: nobody here acts for a verified holder. */
      if (sessionId) redeemPresentationSession(sessionId, "");
      setPhase("no_organisation");
    } else if (orgs.length === 1) redeem(orgs[0].id);
    else setPhase("choose");
  };

  const goBack = () => {
    if (!sessionId) return;
    const back = returnToVerifier(sessionId);
    if (back.url) router.push(back.url);
  };

  const orgs = hydrated ? sharingOrgs() : [];

  const errors: Partial<Record<Face, { text: string; back: boolean }>> = {
    error_unknown: { text: "This link isn't valid. Go back to the website you came from and start again.", back: false },
    error_expired: { text: `This link has expired. Go back to ${verifier} and start again.`, back: true },
    error_used: {
      text: usedId ? "This request is already open. Here's where it stands." : "This link has already been used.",
      back: false,
    },
    no_organisation: {
      text: `You don't act for a verified organisation in the NDI Entity Wallet, so there's nothing to share. Go back to ${verifier}.`,
      back: true,
    },
    refused: { text: `${verifier}'s request can't be answered through the NDI Entity Wallet. Nothing has been shared.`, back: true },
    no_request: { text: `We couldn't get ${verifier}'s request. Nothing has been shared. Go back to ${verifier} and try again.`, back: true },
  };
  const error = errors[face];

  return (
    <div className="flex min-h-dvh flex-col">
      <AuthHeader />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-5 px-4 py-10 min-[641px]:px-6">
        {/* ---- The arrival banner (§3.4): NDI, and who is asking ---- */}
        <div className="flex flex-col gap-2">
          <p className="m-0 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <Icon name="lock" size={12} strokeWidth={2.2} />
            NDI Entity Wallet{address ? ` · ${address}` : ""}
          </p>
          <h1 className="m-0 font-display text-[clamp(24px,3vw,32px)] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
            {error && face === "error_unknown" ? "This link can't be opened" : `${verifier} is asking for your organisation's details`}
          </h1>
          <p className="m-0 text-[14.5px] leading-[1.6] text-body">You&rsquo;re on the NDI Entity Wallet. Nothing is shared until you choose.</p>
        </div>

        {reference && !error ? <ReferenceCheck verifier={verifier} reference={reference} /> : null}

        {face === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. Nothing has been shared.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4" aria-live="polite">
            {error ? (
              <>
                <p role="alert" className="m-0 text-[14.5px] leading-[1.6] text-body">
                  {error.text}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {face === "error_used" && usedId ? (
                    <GradientButton onClick={() => router.push(`/wallet/sharing/${usedId}`)}>Open request</GradientButton>
                  ) : null}
                  {error.back ? <HairlineButton onClick={goBack}>Go back to {verifier}</HairlineButton> : null}
                </div>
              </>
            ) : face === "loading" ? (
              <p role="status" className="m-0 flex items-center gap-2 text-[14.5px] text-body">
                <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--ndi-info)" }} />
                Getting {verifier}&rsquo;s request…
              </p>
            ) : face === "checking" ? (
              <>
                <p role="status" className="m-0 text-[14.5px] leading-[1.6] text-body">
                  We&rsquo;re checking {verifier}. This can take a moment.
                </p>
                <p className="m-0 text-[13.5px] leading-[1.6] text-muted">
                  After two minutes: We can&rsquo;t check {verifier} right now. We&rsquo;ve kept the request — you&rsquo;ll find it under Sharing.
                </p>
                <div>
                  <HairlineButton onClick={goBack}>Go back to {verifier}</HairlineButton>
                </div>
              </>
            ) : face === "choose" ? (
              <>
                <p className="m-0 text-[15px] font-medium text-strong">Which organisation is this for?</p>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {(orgs.length ? orgs : [{ id: "org-pelden", name: "Pelden Trading Pvt. Ltd." }]).map((o) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => forced === "live" && redeem(o.id)}
                        className="ndi-hairline-btn flex w-full items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-left text-[14px] text-body"
                      >
                        {shortOrgName(o.name)}
                        <Icon name="arrowRight" size={15} strokeWidth={2} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div>
                  <HairlineButton onClick={goBack}>Go back to {verifier}</HairlineButton>
                </div>
              </>
            ) : (
              <>
                <p className="m-0 text-[14.5px] leading-[1.6] text-body">Sign in with Bhutan NDI to continue.</p>
                <div className="flex flex-wrap gap-2.5">
                  <GradientButton onClick={() => setPhase("signing_in")} disabled={phase === "signing_in" || forced !== "live"}>
                    Continue
                  </GradientButton>
                  <HairlineButton onClick={goBack}>Go back to {verifier}</HairlineButton>
                </div>
                {phase === "signing_in" && forced === "live" ? (
                  <SimulatedStep
                    standsFor="the Bhutan NDI sign-in on your phone"
                    action={<SimulatedAction onClick={afterSignIn}>Sign in as {currentPerson.name}</SimulatedAction>}
                  >
                    Sign-in sends you to the Bhutan NDI app and back. The request waits for you here; nothing about it changes while
                    you sign in.
                  </SimulatedStep>
                ) : null}
              </>
            )}
          </div>
        </Panel>

      </main>
    </div>
  );
}
