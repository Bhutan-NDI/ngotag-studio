"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff, type HandoffStatus } from "@/components/ui/WalletHandoff";
import { Icon } from "@/components/ui/icons";
import { useReveal } from "@/components/ui/useReveal";
import { useDemo } from "@/lib/demoStore";
import { AUTO_ADVANCE_MS, SKIP_AFTER_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

/**
 * Flow 2 step 2 — the representative proves who they are, from their own
 * NDI Wallet.
 *
 * ONLY THE PERSON, NOT YET THE ORGANISATION
 *
 * This screen used to prove the person and then check them against a
 * company they had typed in. Under list-then-select it does only the first:
 * who you are is established here, and the register is asked what you
 * represent on the next screen, with your identity taken from this proof —
 * never from a field (GovTech requirements §6.1).
 *
 * WHERE PROXY SIGN-UP IS CAUGHT
 *
 * Sign-up cannot tell a director from their accountant typing (UXD-09), so
 * SCR-ONB-01 warns that the account must match the person named here. This
 * is where that is enforced: identity anchoring is the real control, and it
 * fails in the right place — with the proof in hand, before anything is
 * registered. The refusal is walkable, not just a state in the switcher,
 * because "what if someone else signed up for them?" is the question the
 * room asks.
 */
type Stage = "idle" | "wallet" | "proved" | "mismatch" | "expired";

export function ProveIdentityView() {
  const router = useRouter();
  const { signup, orgOnboarding, orgInvitations, people, recordIdentityProof } = useDemo();

  const screenState = useScreenState("A2", [
    "awaiting_scan",
    "waiting_for_wallet",
    "proved",
    "name_mismatch",
    "expired",
  ]);

  const [stage, setStage] = useState<Stage>("idle");
  const [skippable, setSkippable] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const accountName = signup?.stage === "done" ? signup.name : null;
  /* The wallet in this prototype answers as whoever holds the account — or
     as Dorji, the story's director, when the flow is run without one. The
     mismatch path answers as somebody else on purpose. */
  /* Invited to an organisation already on NDI, the invitee has had an
     account for years — the wallet answers as them. */
  const invitation = orgInvitations.find((i) => i.id === orgOnboarding?.invitationId);
  const invitee = invitation?.kind === "W" ? people.find((p) => p.email === invitation.email) : undefined;
  const provedName = invitee?.name || accountName || "Dorji Wangchuk";
  const kind = kindOf(orgOnboarding?.kind);

  const start = (outcome: "proved" | "mismatch") => {
    setSkippable(false);
    setStage("wallet");
    timers.current.push(setTimeout(() => setSkippable(true), SKIP_AFTER_MS));
    timers.current.push(
      setTimeout(() => {
        setStage(outcome);
        if (outcome === "proved") recordIdentityProof(provedName);
      }, WALLET_HANDOFF_MS),
    );
  };

  const forced: Stage | null =
    screenState === "awaiting_scan"
      ? null
      : screenState === "waiting_for_wallet"
        ? "wallet"
        : screenState === "proved"
          ? "proved"
          : screenState === "name_mismatch"
            ? "mismatch"
            : "expired";
  const shown = forced ?? stage;

  /* Once the proof is in, move on by itself after a beat (see
     AUTO_ADVANCE_MS). Only for a proof that really happened: the state
     switcher's "proved" is for reviewing this screen, and a screen that
     leaves the moment you ask to see it cannot be reviewed. */
  /* The confirmation goes above the scan card, straight under the heading.
     It used to sit under the card — 300px below the fold at laptop height —
     and was scrolled to, but a page that scrolls itself and then leaves by
     itself two seconds later gave nobody time to read it. Above the card
     it is on screen from the moment it appears; useReveal only has to act
     if someone had scrolled down to press the scan. */
  const provedRef = useReveal<HTMLDivElement>(shown === "proved");
  const mismatchRef = useReveal<HTMLDivElement>(shown === "mismatch");
  useEffect(() => {
    if (stage !== "proved" || forced) return;
    const t = setTimeout(() => router.push("/onboarding/choose"), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [stage, forced, router]);

  const handoffStatus: HandoffStatus =
    shown === "idle"
      ? "awaiting_scan"
      : shown === "wallet"
        ? "waiting"
        : shown === "proved"
          ? "confirmed"
          : shown === "expired"
            ? "expired"
            : "failed";

  return (
    <OnboardingShell current={1}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          Prove who you are
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          Scan the code with your Bhutan NDI Wallet. It tells us who you are, so that
          {kind.register
            ? ` the ${kind.register} can be asked which organisations it lists you as representing.`
            : " NDI knows exactly who is asking it to review the organisation."}{" "}
          Nothing about any organisation is asked yet.
        </p>
      </div>

      {shown === "proved" ? (
        <div ref={provedRef}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 flex-none text-accent" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  You&rsquo;ve proved you are {provedName}
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {kind.register
                    ? `Next, the ${kind.register} is asked which organisations it lists you as representing.`
                    : "Next, tell NDI about the organisation and send what shows you represent it."}
                </p>
              </div>
            </div>
            <p role="status" className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 pl-[30px] text-[12.5px] text-faint">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border-grid)] border-t-[var(--accent)]" />
                {forced ? "Moves on to the next step by itself" : "Taking you to the next step…"}
              </span>
              <button
                type="button"
                onClick={() => router.push("/onboarding/choose")}
                className="ndi-plainlink inline-flex items-center gap-1 font-medium text-accent"
              >
                Continue now
                <Icon name="arrowRight" size={13} strokeWidth={2} />
              </button>
            </p>
          </div>
        </Panel>
        </div>
      ) : null}

      {shown === "mismatch" ? (
        <div ref={mismatchRef}>
        <Panel>
          <div className="relative z-[4] flex items-start gap-3">
            <Icon name="close" size={18} strokeWidth={2.2} className="mt-0.5 flex-none" style={{ color: "var(--ndi-danger)" }} />
            <div className="flex flex-col gap-2">
              <p className="font-display text-[14.5px] font-semibold text-strong">
                This proof is for someone else
              </p>
              <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                The wallet that answered belongs to Karma Dorji, but this account belongs to{" "}
                {accountName ?? "someone else"}. An organisation has to be added by the person who
                represents it, from their own account.
              </p>
              <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                If you were helping someone, they need to create their own account and add the
                organisation themselves. Nothing has been registered and nothing about either of
                you has been kept.
              </p>
            </div>
          </div>
        </Panel>
        </div>
      ) : null}

      <Panel>
        <WalletHandoff
          value="ndi-onboarding-proof"
          title="Prove who you are with your NDI Wallet"
          purpose="Your citizen credential establishes who you are. Nothing else is asked for."
          sharing={[
            "Your full name, as it appears on your citizen credential",
            "Your citizenship number, to the platform only",
          ]}
          status={handoffStatus}
          statusDetail={
            shown === "mismatch"
              ? "The identity you proved does not match the person this account belongs to."
              : undefined
          }
          onRetry={() => setStage("idle")}
          onSimulateScan={() => start("proved")}
          onCancel={() => router.push("/onboarding")}
          onSkip={
            skippable && shown === "wallet"
              ? () => {
                  timers.current.forEach(clearTimeout);
                  setStage("proved");
                  recordIdentityProof(provedName);
                }
              : undefined
          }
        />
      </Panel>

      {shown === "idle" ? (
        <div className="flex flex-wrap items-center gap-2.5">
          <HairlineButton onClick={() => router.push("/onboarding")}>Back</HairlineButton>
          <button
            type="button"
            onClick={() => start("mismatch")}
            className="ndi-plainlink text-[12.5px] font-medium text-muted"
          >
            Show what happens if someone else&rsquo;s wallet answers
          </button>
        </div>
      ) : null}
    </OnboardingShell>
  );
}
