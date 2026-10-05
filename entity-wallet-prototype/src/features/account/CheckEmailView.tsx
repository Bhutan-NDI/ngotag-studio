"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthShell } from "@/components/layout/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { Icon } from "@/components/ui/icons";
import { SecureSignInScene } from "@/components/ui/scenes";
import {
  RESEND_COOLDOWN_SECONDS,
  SENDS_PER_ADDRESS_PER_HOUR,
  VERIFY_LINK_DAYS,
} from "@/lib/deployment";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { AuthCardHeader, AuthFooterLink, AuthNotice } from "@/features/auth/AuthCard";

const HOUR = 60 * 60 * 1000;

/** "4 minutes" / "38 seconds" — the time remaining, said the way a person would. */
function remaining(ms: number): string {
  const s = Math.max(1, Math.ceil(ms / 1000));
  if (s < 60) return `${s} second${s === 1 ? "" : "s"}`;
  const m = Math.ceil(s / 60);
  return `${m} minute${m === 1 ? "" : "s"}`;
}

/**
 * SCR-ONB-02 — Check your email. FLOW-ONB-01 step 3.
 *
 * The highest-abandonment point in the flow, and the only one whose success
 * this screen can never observe: the mail is sent, and whether it arrived is
 * unknowable from here (§11). So the screen does the three things that keep
 * people through an unbounded wait — it shows the address so a typo can be
 * caught, it offers a resend, and it says plainly that the page can be closed
 * (UXD-05). No spinner: a spinner promises that something is about to
 * happen, and here nothing will until the person opens their inbox.
 *
 * THE RESEND IS THROTTLED, AND SAYS SO
 *
 * A short cooling period after every send, so a double-tap does not send
 * twice; and S4's limit of five an hour per address, after which resend is
 * disabled with the time remaining stated rather than silently doing
 * nothing. Both are measured from real send times kept in the session, so
 * the counts are true, not illustrative.
 */
export function CheckEmailView() {
  const router = useRouter();
  const { signup, resendSignupMail, hydrated } = useDemo();

  const forced = useScreenState("SCR-ONB-02", [
    "default",
    "loading",
    "delivery_failed",
    "offline",
    "rate_limited",
  ]);

  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  /* A one-second clock, only so the cooling period and the limit count down
     where the person can see them. */
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!hydrated) return <Frame>{null}</Frame>;

  if (!signup || !signup.email) {
    return (
      <Frame>
        <AuthCardHeader title="Nothing is waiting" />
        <AuthNotice>
          There&rsquo;s no sign-up in progress in this browser. Start again with your email
          address.
        </AuthNotice>
        <Link href="/sign-up" className="relative z-[4] mt-4 block">
          <GradientButton block>Start again</GradientButton>
        </Link>
      </Frame>
    );
  }

  const recent = signup.sends.filter((t) => now - t < HOUR);
  const last = signup.sends[signup.sends.length - 1] ?? 0;
  const coolingFor = last + RESEND_COOLDOWN_SECONDS * 1000 - now;
  const limited = forced === "rate_limited" || recent.length >= SENDS_PER_ADDRESS_PER_HOUR;
  /* When the forced state says "limited" without the sends to back it, show
     a plausible remainder rather than "1 second". */
  const limitClears = recent.length >= SENDS_PER_ADDRESS_PER_HOUR ? recent[0] + HOUR - now : 38 * 60 * 1000;
  const cooling = !limited && coolingFor > 0;
  const loading = busy || forced === "loading";

  const resend = () => {
    setBusy(true);
    setResent(false);
    window.setTimeout(() => {
      resendSignupMail();
      setBusy(false);
      setResent(true);
    }, LOCAL_MS);
  };

  return (
    <Frame>
      <AuthCardHeader title="Check your email" />

      <div className="relative z-[4] flex flex-col gap-4">
        {forced === "delivery_failed" ? (
          <AuthNotice role="alert" tone="warning">
            We couldn&rsquo;t deliver to <strong className="text-strong">{signup.email}</strong>.
            Check it and try again.
          </AuthNotice>
        ) : null}
        {forced === "offline" ? (
          <AuthNotice role="alert" tone="warning">
            We couldn&rsquo;t send another link just now. The one we already sent still works.
          </AuthNotice>
        ) : null}

        {/* Announced, not just drawn: the pending state must reach a screen
            reader (UX-EW-01 §2.3), and a static paragraph would not. */}
        <p role="status" className="m-0 text-[14px] leading-[1.6] text-body">
          We&rsquo;ve sent a link to{" "}
          <strong className="break-words text-strong">{signup.email}</strong>. Open it to carry on.
          You can close this page — the link will still work.
        </p>

        <p className="m-0 text-[12.5px] text-faint">
          This link works for {VERIFY_LINK_DAYS} days.
        </p>

        {/* Both routes out, visible without scrolling on a 360px viewport. */}
        <div className="flex flex-col gap-2 border-t border-subtle pt-4 text-[13px] text-muted">
          <p className="m-0">
            Wrong address?{" "}
            <button
              type="button"
              onClick={() => router.push("/sign-up")}
              className="ndi-plainlink font-medium text-accent"
            >
              Change it
            </button>
          </p>
          <p className="m-0" aria-live="polite">
            Didn&rsquo;t arrive?{" "}
            {limited ? (
              <span className="text-faint">
                You&rsquo;ve asked for {SENDS_PER_ADDRESS_PER_HOUR} links in the last hour. You can
                ask again in {remaining(limitClears)}.
              </span>
            ) : loading ? (
              <span className="text-faint">Sending…</span>
            ) : cooling ? (
              <span className="text-faint">You can resend in {remaining(coolingFor)}.</span>
            ) : (
              <button
                type="button"
                onClick={resend}
                className="ndi-plainlink inline-flex min-h-[44px] items-center font-medium text-accent"
              >
                Resend
              </button>
            )}
            {resent && !loading ? (
              <span className="ml-2 inline-flex items-center gap-1 text-accent">
                <Icon name="check" size={13} strokeWidth={2.2} /> Sent again
              </span>
            ) : null}
          </p>
        </div>

        <SimulatedStep
          standsFor="the verification email"
          action={
            <SimulatedAction onClick={() => router.push("/sign-up/verify")}>
              Open the link from the email
            </SimulatedAction>
          }
        >
          No email is sent in this prototype. In the product the person opens the link in their
          inbox — often on another device, sometimes days later — and lands on the next screen.
        </SimulatedStep>
      </div>

      <AuthFooterLink
        prompt="Already confirmed?"
        action="Sign in"
        onClick={() => router.push("/sign-in")}
      />
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <AuthShell
      scene={<SecureSignInScene />}
      title={
        <>
          A link, <span className="ndi-wave-text">not a code to copy</span>
        </>
      }
      lead="Opening the link on any device confirms the address is yours. Nothing else about you is checked yet — that happens when you add your organisation."
    >
      {children}
    </AuthShell>
  );
}
