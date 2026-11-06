"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { WalletHandoff, type HandoffStatus } from "@/components/ui/WalletHandoff";
import { Icon } from "@/components/ui/icons";
import { shortOrgName } from "@/lib/demoData";
import { useDemo, type SessionLook } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";
import { REDEEM_WITHIN_MS } from "@/lib/sharing";

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
 * SIGNED IN OR NOT
 *
 * Someone already signed in to the Entity Wallet in this browser is not
 * asked again (FLOW-PRS-01 step 2: "if they have no Studio session"): they
 * see who they are signed in as and continue. Signed out, Sign in with
 * Bhutan NDI opens the sign-in — the Bhutan NDI scan — in place, so the
 * request is still here when it is done.
 *
 * SIMULATED
 *
 * The Bhutan NDI sign-in happens on the person's phone; the dashed scan
 * stands in for it and signs in as whoever the demo is driven as. Which of
 * the two arrivals the demo shows, and NDI's list being out of reach (E8),
 * are prototype what-ifs folded under the panel. In the
 * product Studio keeps the session reference on its own side through the
 * sign-in and accepts only a Studio path after it (§7.3).
 */
type Face =
  | "live"
  | "signed_in"
  | "signed_out"
  | "sign_in"
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
  const { hydrated, currentPerson, presentationSessions, openPresentationSession, redeemPresentationSession, returnToVerifier, sharingOrgs } =
    useDemo();
  const forced = useScreenState("SCR-PRS-01", [
    "live",
    "signed_in",
    "signed_out",
    "sign_in",
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
  /* Whether this browser already has a wallet session. Most arrivals in the
     demo do — the presenter is driving as someone — so that is the default;
     the folded what-if below shows the signed-out arrival. */
  const [signedIn, setSignedIn] = useState(true);
  /* The Bhutan NDI scan on the sign-in page. */
  const [scan, setScan] = useState<HandoffStatus>("awaiting_scan");
  const [usedRequest, setUsedRequest] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  /* Simulated: NDI's list can't be reached when the request arrives (E8). */
  const [registryDown, setRegistryDown] = useState(false);
  /* The clock for the 30-minute window, read every few seconds. */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setLook(sessionId ? openPresentationSession(sessionId) : { kind: "unknown" });
    setAddress(`${window.location.host}/present`);
    // Re-read when the person driving changes: E3 depends on who is looking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sessionId, currentPerson.id]);

  const verifier = look && look.kind !== "unknown" ? look.verifierName : "The organisation";
  const reference = look?.kind === "ready" ? look.displayReference : null;

  /* SC 2.2.1's security exception (UX-EW-04 §2.3): the 30 minutes to
     redeem run during sign-in, and the time left is stated once five
     minutes remain. Gone once the link is redeemed. */
  const session = presentationSessions.find((x) => x.id === sessionId);
  const msLeft = session && session.firstLoadedAt !== null && !session.boundOrgId ? session.firstLoadedAt + REDEEM_WITHIN_MS - now : null;
  const minutesLeft = msLeft !== null && msLeft > 0 && msLeft <= 5 * 60_000 ? Math.ceil(msLeft / 60_000) : null;

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
                    : phase === "signing_in"
                      ? "sign_in"
                      : signedIn
                        ? "signed_in"
                        : "signed_out";
  const face: Face = forced === "live" ? natural : forced;
  const usedId = usedRequest ?? (look?.kind === "used" ? look.requestId : null);

  const redeem = (orgId: string, listDown = registryDown) => {
    if (!sessionId) return;
    setPhase("loading");
    /* Steps 4–6 run behind "Getting <verifier>'s request…": they take
       seconds and the person can do nothing about them. */
    window.setTimeout(() => {
      const res = redeemPresentationSession(sessionId, orgId, { registryDown: listDown });
      if (res.ok) router.push(`/wallet/sharing/${res.requestId}`);
      /* E8 — held while NDI's list is checked; going back now is pending,
         and the request waits on Sharing as "Checking …". */
      else if (res.error === "E8") setPhase("checking");
      else if (res.error === "E7") setPhase("refused");
      else if (res.error === "E4") setPhase("no_organisation");
      else if (res.error === "E3") {
        setUsedRequest(res.requestId ?? null);
        setPhase("used");
      } else setLook({ kind: "expired", verifierName: verifier, sessionId });
    }, ROUND_TRIP_MS);
  };

  const afterSignIn = (listDown: boolean) => {
    setRegistryDown(listDown);
    const orgs = sharingOrgs();
    if (orgs.length === 0) {
      /* E4 — the session is DECLINED: nobody here acts for a verified holder. */
      if (sessionId) redeemPresentationSession(sessionId, "");
      setPhase("no_organisation");
    } else if (orgs.length === 1) redeem(orgs[0].id, listDown);
    else setPhase("choose");
  };

  /* The simulated scan: checked, confirmed, then on as if back from the phone. */
  const scanned = () => {
    setScan("verifying");
    window.setTimeout(() => {
      setScan("confirmed");
      window.setTimeout(() => {
        setSignedIn(true);
        afterSignIn(registryDown);
      }, 700);
    }, ROUND_TRIP_MS);
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
            {error && face === "error_unknown"
              ? "This link can't be opened"
              : face === "sign_in"
                ? `Sign in to see ${verifier}'s request`
                : `${verifier} is asking for your organisation's details`}
          </h1>
          <p className="m-0 text-[14.5px] leading-[1.6] text-body">You&rsquo;re on the NDI Entity Wallet. Nothing is shared until you choose.</p>
        </div>

        {reference && !error ? <ReferenceCheck verifier={verifier} reference={reference} /> : null}

        {minutesLeft !== null && !error && (face === "signed_out" || face === "sign_in" || face === "choose") ? (
          <p role="status" className="m-0 flex items-center gap-2 text-[13.5px] text-body">
            <Icon name="info" size={14} strokeWidth={2} className="flex-none text-muted" />
            {minutesLeft === 1 ? "Less than a minute" : `${minutesLeft} minutes`} left to sign in and continue. After that, start again on{" "}
            {verifier}&rsquo;s website.
          </p>
        ) : null}

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
            ) : face === "signed_in" ? (
              <>
                {/* Already signed in to the wallet here: not asked again
                    (FLOW-PRS-01 step 2). Who it is, so a shared computer
                    can't pass as someone else. */}
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[14px] font-semibold"
                    style={{ background: "var(--grad-cta)", color: "var(--text-on-mint)" }}
                  >
                    {currentPerson.name.charAt(0)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[12.5px] text-muted">Signed in as</span>
                    <span className="font-display text-[15px] font-semibold text-strong">{currentPerson.name}</span>
                  </span>
                </div>
                <p className="m-0 text-[14px] leading-[1.6] text-body">
                  Next you&rsquo;ll see exactly what {verifier} is asking for, and choose whether to share it.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <GradientButton onClick={() => afterSignIn(registryDown)} disabled={forced !== "live"}>
                    Continue
                    <Icon name="arrowRight" size={15} strokeWidth={2} />
                  </GradientButton>
                  <HairlineButton onClick={goBack}>Go back to {verifier}</HairlineButton>
                </div>
              </>
            ) : face === "sign_in" ? (
              /* The sign-in page: the Bhutan NDI scan, in place, so the
                 request is still here when it's done (EW-FLOW7-SD §7.3). */
              <WalletHandoff
                value={`ndi-sign-in-${sessionId ?? "session"}`}
                cardVerb="Login"
                title="Sign in with Bhutan NDI"
                purpose={`Scan with the Bhutan NDI Wallet on your phone to sign in. ${verifier}'s request waits here while you do.`}
                sharing={["Your identity, to sign you in to your NDI Entity Wallet account"]}
                notSharing={[`Anything about your organisation — that's only shared with ${verifier} if you choose to, after this`]}
                status={forced === "live" ? scan : "awaiting_scan"}
                onSimulateScan={forced === "live" ? scanned : undefined}
                onCancel={() => {
                  setScan("awaiting_scan");
                  setPhase("signed_out");
                }}
              />
            ) : (
              <>
                <p className="m-0 text-[14.5px] leading-[1.6] text-body">
                  Sign in to see what {verifier} is asking for. Nothing is shared by signing in.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <GradientButton
                    onClick={() => {
                      setScan("awaiting_scan");
                      setPhase("signing_in");
                    }}
                    disabled={forced !== "live"}
                  >
                    Sign in with Bhutan NDI
                  </GradientButton>
                  <HairlineButton onClick={goBack}>Go back to {verifier}</HairlineButton>
                </div>
              </>
            )}
          </div>
        </Panel>

        {/* Prototype what-ifs, folded away so the page reads as the product. */}
        {forced === "live" && (face === "signed_in" || face === "signed_out") ? (
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 font-display text-[12px] font-medium text-faint">
              <Icon name="chevronRight" size={12} strokeWidth={2.2} className="transition-transform duration-200 group-open:rotate-90" />
              Prototype: other ways in
            </summary>
            <div className="mt-2">
              <SimulatedStep
                standsFor="how the person arrives, and NDI's list of trusted organisations"
                action={
                  <>
                    <SimulatedAction onClick={() => setSignedIn(!signedIn)}>
                      {signedIn ? "Arrive signed out instead" : `Arrive already signed in as ${currentPerson.name}`}
                    </SimulatedAction>
                    <SimulatedAction onClick={() => setRegistryDown(!registryDown)}>
                      {registryDown ? "NDI's list is back" : "NDI's list can't be reached"}
                    </SimulatedAction>
                  </>
                }
              >
                Already signed in to the NDI Entity Wallet in this browser, the person isn&rsquo;t asked again; signed out, they
                sign in with the Bhutan NDI scan first. With NDI&rsquo;s list out of reach{registryDown ? " (on now)" : ""}, the
                request is held and checked again rather than passed unchecked.
              </SimulatedStep>
            </div>
          </details>
        ) : null}
      </main>
    </div>
  );
}
