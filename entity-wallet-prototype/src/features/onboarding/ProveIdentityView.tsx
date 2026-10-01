"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff, type HandoffStatus } from "@/components/ui/WalletHandoff";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";
import { SKIP_AFTER_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

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
  const { signup, orgOnboarding, recordIdentityProof } = useDemo();

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
  const provedName = accountName || "Dorji Wangchuk";
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

      {shown === "proved" ? (
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
            <div>
              <GradientButton onClick={() => router.push("/onboarding/choose")}>
                Continue
                <Icon name="arrowRight" size={15} strokeWidth={2} />
              </GradientButton>
            </div>
          </div>
        </Panel>
      ) : null}

      {shown === "mismatch" ? (
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
      ) : null}

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
