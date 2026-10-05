"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthShell } from "@/components/layout/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Icon } from "@/components/ui/icons";
import { SecureSignInScene } from "@/components/ui/scenes";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { AuthCardHeader, AuthNotice } from "@/features/auth/AuthCard";

type Outcome = "loading" | "success" | "expired" | "used" | "offline" | "unknown";

/**
 * SCR-ONB-03 — Link outcome. FLOW-ONB-01 steps 4–5.
 *
 * Reached from an email, on any device, possibly days after the person last
 * saw this product — so every outcome has to make sense to someone with no
 * memory of the screens before it, and every outcome has a way forward.
 *
 * FOUR OUTCOMES, AND TWO OF THEM LOOK THE SAME
 *
 * Valid, expired, already used, unknown. Unknown — a malformed or made-up
 * link — renders exactly as expired does, because telling the two apart
 * tells someone probing links which ones were real (UX-EW-01 §3.4).
 *
 * NO EMAIL ADDRESS ON THIS PAGE
 *
 * Anyone holding the link can open it — a forwarded message, a shared
 * computer. The outcome is all it shows.
 *
 * THE LINK IS CONSUMED ONCE, AND ONLY ONCE
 *
 * Opening it a second time is E3, which is the point of a single-use token.
 * Consumption is guarded by a ref, because React's development mode mounts
 * effects twice and a second consumption would find the link already used
 * and show a person their own first click as a replay.
 */
export function LinkOutcomeView() {
  const router = useRouter();
  const { signup, consumeSignupLink, resendSignupMail, hydrated } = useDemo();

  const forced = useScreenState("SCR-ONB-03", [
    "live",
    "loading",
    "success",
    "expired",
    "used",
    "offline",
    "unknown",
  ]);

  const [outcome, setOutcome] = useState<Outcome>("loading");
  const consumed = useRef(false);
  /* The session as it is when the timer fires, not as it was when the effect
     was scheduled — and read through a ref so that consuming the link, which
     changes the session, does not re-run the effect and cancel itself. */
  const latest = useRef(signup);
  latest.current = signup;

  useEffect(() => {
    if (!hydrated) return;
    /* Validation takes a round trip in the real product, and a result that
       appeared instantly would be the one thing on this page nobody reads.
       The guard sits on the consumption, not on the scheduling: development
       mode mounts this effect twice, cancelling the first timer, and a guard
       on scheduling would leave the page waiting on a timer that never
       fires. */
    const t = window.setTimeout(() => {
      if (consumed.current) return;
      consumed.current = true;
      const session = latest.current;
      if (!session || !session.email) return setOutcome("unknown");
      setOutcome(consumeSignupLink() ? "success" : "used");
    }, ROUND_TRIP_MS);
    return () => window.clearTimeout(t);
  }, [hydrated, consumeSignupLink]);

  const shown: Outcome = forced === "live" ? outcome : (forced as Outcome);

  const sendNew = () => {
    if (signup?.email) {
      resendSignupMail();
      router.push("/sign-up/check-email");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <AuthShell
      scene={<SecureSignInScene />}
      title={
        <>
          Confirming <span className="ndi-wave-text">it&rsquo;s your address</span>
        </>
      }
      lead="Each link works once, for seven days. If it has run out, a new one is a click away."
    >
      {shown === "loading" ? (
        <>
          <AuthCardHeader title="Checking your link" />
          <p role="status" className="relative z-[4] m-0 text-center text-[14px] text-muted">
            One moment…
          </p>
        </>
      ) : null}

      {shown === "success" ? (
        <>
          <AuthCardHeader title="Your email is confirmed" />
          <div className="relative z-[4] flex flex-col gap-4">
            <p role="status" className="m-0 text-center text-[14px] leading-[1.6] text-muted">
              Now choose a password and you&rsquo;re in.
            </p>
            <GradientButton block onClick={() => router.push("/sign-up/password")}>
              Continue
              <Icon name="arrowRight" size={16} strokeWidth={2} />
            </GradientButton>
          </div>
        </>
      ) : null}

      {shown === "expired" || shown === "unknown" ? (
        <>
          <AuthCardHeader title="This link has expired" />
          <div className="relative z-[4] flex flex-col gap-4">
            <p role="alert" className="m-0 text-center text-[14px] leading-[1.6] text-muted">
              This link has expired. We can send you a new one.
            </p>
            <GradientButton block onClick={sendNew}>
              Send a new link
            </GradientButton>
          </div>
        </>
      ) : null}

      {shown === "used" ? (
        <>
          <AuthCardHeader title="This link has already been used" />
          <div className="relative z-[4] flex flex-col gap-4">
            <p role="alert" className="m-0 text-center text-[14px] leading-[1.6] text-muted">
              This link has already been used. Sign in, or reset your password.
            </p>
            <GradientButton block onClick={() => router.push("/sign-in")}>
              Sign in
            </GradientButton>
            <HairlineButton onClick={() => router.push("/reset-password")}>
              Reset your password
            </HairlineButton>
            {signup?.stage === "set_password" ? (
              /* The person who used it a moment ago and then reloaded is the
                 common case, not an attacker — let them carry on. */
              <button
                type="button"
                onClick={() => router.push("/sign-up/password")}
                className="ndi-plainlink text-center text-[13px] font-medium text-accent"
              >
                I just opened it — carry on setting my password
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      {shown === "offline" ? (
        <>
          <AuthCardHeader title="We couldn't check your link" />
          <div className="relative z-[4] flex flex-col gap-4">
            <AuthNotice role="alert" tone="warning">
              The link hasn&rsquo;t been used up. Check your connection and open it again.
            </AuthNotice>
            <GradientButton block onClick={() => router.refresh()}>
              Try again
            </GradientButton>
          </div>
        </>
      ) : null}
    </AuthShell>
  );
}
