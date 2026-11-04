"use client";

import { useEffect, useRef, useState } from "react";

import { HairlineButton } from "@/components/ui/HairlineButton";
import { Icon } from "@/components/ui/icons";
import { WalletHandoff, type HandoffStatus } from "@/components/ui/WalletHandoff";
import { AUTO_ADVANCE_MS, SKIP_AFTER_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

/**
 * The set-up scan (ADR-001): one Bhutan NDI Wallet scan that anchors an
 * account to its citizen. Used at sign-up, before an invitee joins, and
 * by Confirm your identity in account settings — the same request in all
 * three, so a person meets it once.
 *
 * WHY IT IS HERE AT ALL
 *
 * Names don't tell people apart in Bhutan, and an account set up by
 * someone else — an assistant who reads a director's email — used to be
 * anchored to whoever presented first. Anchoring at set-up means every
 * later check (verifying an organisation, accepting an appointment) has
 * something to compare against, and one citizen can hold only one account.
 *
 * WHAT IT ASKS, AND SAYS IT KEEPS
 *
 * Name and citizenship ID number only (Decision 1). Before the scan it
 * says what is kept and why, in the ADR's own sentence: the name, and a
 * protected reference to the ID — never the number itself. Nothing on any
 * screen shows the number or the anchor afterwards.
 *
 * NOT A WALL
 *
 * Someone with no NDI wallet still gets an account (Decision 5). They can
 * be a member; they can't verify an organisation or be appointed until
 * they confirm who they are, and the screen says so before they go on.
 */
export type IdentityScanStage = "idle" | "wallet" | "proved" | "declined" | "no_wallet";

export function IdentityScan({
  verifiedName,
  forced,
  onProved,
  onContinue,
  onWithout,
  withoutLabel = "Continue without it",
  cancelLabel,
  onCancel,
}: {
  /** Who the wallet answers as. The prototype has no phone, so the story says. */
  verifiedName: string;
  /** A state the reviewer's switcher pinned, if any. */
  forced?: IdentityScanStage | null;
  /** The proof is in: anchor the account. */
  onProved: (name: string) => void;
  /** After the confirmation has been seen: go on. */
  onContinue: () => void;
  /** Go on without the scan, as a member not yet appointable. */
  onWithout?: () => void;
  withoutLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}) {
  const [stage, setStage] = useState<IdentityScanStage>("idle");
  const [skippable, setSkippable] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const shown = forced ?? stage;

  const finish = (outcome: "proved" | "declined") => {
    timers.current.forEach(clearTimeout);
    setStage(outcome);
    if (outcome === "proved") onProved(verifiedName);
  };
  const start = (outcome: "proved" | "declined") => {
    setSkippable(false);
    setStage("wallet");
    timers.current.push(setTimeout(() => setSkippable(true), SKIP_AFTER_MS));
    timers.current.push(setTimeout(() => finish(outcome), WALLET_HANDOFF_MS));
  };

  /* Once confirmed there is nothing left to decide, so it moves on by itself,
     like SCR-ORG-03. Only for a proof that happened: a pinned state has to
     stay on screen to be reviewed. */
  const continueRef = useRef(onContinue);
  useEffect(() => {
    continueRef.current = onContinue;
  });
  useEffect(() => {
    if (stage !== "proved" || forced) return;
    const t = setTimeout(() => continueRef.current(), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [stage, forced]);

  const status: HandoffStatus =
    shown === "idle" ? "awaiting_scan" : shown === "wallet" ? "waiting" : shown === "proved" ? "confirmed" : "failed";

  const withoutNote = (
    <p className="m-0">
      You can still join an organisation as a member. You won&rsquo;t be able to verify one, or be
      appointed to act for one, until you confirm who you are — you can do that from your account
      whenever you have the wallet.
    </p>
  );

  return (
    <div className="flex flex-col gap-4">
      {shown === "proved" ? (
        <div role="status" className="flex items-start gap-3 rounded-[12px] border border-[var(--ndi-mint-40)] px-4 py-3.5" style={{ background: "var(--ndi-mint-08)" }}>
          <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 flex-none text-accent" />
          <div className="flex flex-col gap-1">
            <p className="m-0 font-display text-[14.5px] font-semibold text-strong">This account is yours, {verifiedName}</p>
            <p className="m-0 text-[13px] leading-[1.6] text-muted">
              It can only ever belong to you. Whenever you prove who you are later, it&rsquo;s checked against this.
            </p>
            <p className="m-0 mt-1 inline-flex items-center gap-2 text-[12.5px] text-faint">
              <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border-grid)] border-t-[var(--accent)]" />
              {forced ? "Moves on by itself" : "Taking you on…"}
            </p>
          </div>
        </div>
      ) : null}

      {shown === "declined" || shown === "no_wallet" ? (
        <div role="alert" className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3.5 text-[13px] leading-[1.6] text-muted">
          <p className="m-0 font-display text-[14.5px] font-semibold text-strong">
            {shown === "declined" ? "You didn't approve the request" : "You'll need the NDI wallet to confirm who you are"}
          </p>
          {shown === "declined" ? (
            <p className="m-0">Nothing was shared. Your account isn&rsquo;t confirmed yet.</p>
          ) : (
            <p className="m-0">
              Bhutan NDI Wallet is on the App Store and Google Play. Setting it up adds your identity.
            </p>
          )}
          {onWithout ? withoutNote : null}
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            {shown === "declined" ? (
              <HairlineButton onClick={() => setStage("idle")}>
                <Icon name="refresh" size={14} strokeWidth={2} />
                Try again
              </HairlineButton>
            ) : null}
            {onWithout ? <HairlineButton onClick={onWithout}>{withoutLabel}</HairlineButton> : null}
            {shown === "no_wallet" ? (
              <button type="button" onClick={() => setStage("idle")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
                I have it now
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {shown !== "no_wallet" ? (
        <WalletHandoff
          value="ndi-account-identity-anchor"
          title="Bhutan NDI is asking who you are"
          purpose="We keep your name and a protected reference to your citizenship ID, so this account can only ever be yours."
          sharing={["Your full name, as it is on your citizen ID", "Your citizenship ID number"]}
          notSharing={["Your date of birth, gender or anything else on your citizen ID", "Anything else in your NDI wallet"]}
          status={status}
          statusDetail={shown === "declined" ? "You declined in the NDI wallet app. Nothing was shared." : undefined}
          onSimulateScan={() => start("proved")}
          onCancel={onCancel}
          onSkip={skippable && shown === "wallet" ? () => finish("proved") : undefined}
        />
      ) : null}

      {shown === "idle" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {onCancel && cancelLabel ? <HairlineButton onClick={onCancel}>{cancelLabel}</HairlineButton> : null}
          <button type="button" onClick={() => setStage("no_wallet")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
            I don&rsquo;t have the NDI wallet
          </button>
          <button type="button" onClick={() => start("declined")} className="ndi-plainlink text-[12.5px] font-medium text-faint">
            Show what happens if you decline in the NDI wallet app
          </button>
        </div>
      ) : null}
    </div>
  );
}
