"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Icon } from "@/components/ui/icons";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { WalletHandoff, type HandoffStatus } from "@/components/ui/WalletHandoff";
import { useDemo } from "@/lib/demoStore";
import { AUTO_ADVANCE_MS, LOCAL_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

/**
 * Confirm your identity, at the moment it's needed — ADR-001 Amendment 1 (in
 * review), as the first build phase would have it.
 *
 * WHY IN THE TASK, NOT IN SETTINGS
 *
 * The amendment defers the scan at sign-up and asks for an anchored account
 * only before the actions that carry authority: an administrator creating
 * or approving an agency or admin invitation, an invitee accepting one, and
 * — the review's addition — an organisation's officer accepting an
 * accreditation or a designation. A person told to go to account settings
 * and find their way back is a person lost. So the check appears where the
 * action was pressed, says why in the action's own words, and once it
 * passes carries straight on with that action. Account settings stays the
 * second way in.
 *
 * NOTHING IS LOST
 *
 * Every way it can fail leaves the task where it was: the invitation still
 * pending, the approval still waiting. Each says so, and "Try again" starts
 * the same request. "No wallet" has no "carry on without it" here: these
 * actions need a confirmed person, so it says who to ask instead.
 *
 * "ALREADY USED" SAYS NOTHING ABOUT THE OTHER ACCOUNT
 *
 * One citizen, one account (Decision 2's unique constraint). When the ID
 * already confirms another account, the screen doesn't say which, doesn't
 * accuse, and offers the two honest ways on: sign in to that account, or
 * ask NDI. For an administrator NDI's security team is told quietly — two
 * admin accounts for one person is exactly what the two-person rule
 * exists to stop.
 *
 * THE SCREEN SPEC
 *
 * `SCR-ONB-06` (UX-EW-01, docs PR #16): heading, body, primary button and
 * error copy are the spec's. The extra states — checking, the verified name
 * on success, "no wallet" as a state, Not now on every error, and each
 * error saying the task is unchanged — are the ones suggested on that PR.
 *
 * Only on while the developers' list is (harness.developer). The guided demo
 * keeps the set-up scan of the accepted ADR.
 */
export type ConfirmStage =
  | "intro"
  | "idle"
  | "wallet"
  | "checking"
  | "proved"
  | "declined"
  | "timed_out"
  | "no_wallet"
  | "in_use"
  | "offline"
  | "unavailable";

export function ConfirmItsYouStep({
  task,
  verifiedName,
  onConfirmed,
  onCancel,
  waiting,
  askWho = "the NDI platform team",
  admin = false,
  lead,
}: {
  /** In place of "To <task>, NDI needs to know it's you…", where the step
   *  is the page itself (account settings) rather than part of a task. */
  lead?: ReactNode;
  /** What the person was doing, mid-sentence: "approve this invitation". */
  task: string;
  /** Who the wallet answers as. The prototype has no phone, so the story says. */
  verifiedName: string;
  /** The proof is in: anchor the account and carry on with the task. */
  onConfirmed: (name: string) => void;
  /** Back to the task, nothing done. */
  onCancel: () => void;
  /** What stays where it was if this fails: "Your invitation is still waiting." */
  waiting: string;
  /** Who to ask when there is no wallet, or the ID is already in use. */
  askWho?: string;
  /** An administrator: an ID already in use is told to NDI's security team. */
  admin?: boolean;
}) {
  /* Default first (SCR-ONB-06): why, what is kept, and the button. */
  const router = useRouter();
  const [stage, setStage] = useState<ConfirmStage>("intro");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const after = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  /* The scan, then the answer checked, then confirmed. */
  const scan = () => {
    clear();
    setStage("wallet");
    after(WALLET_HANDOFF_MS, () => {
      setStage("checking");
      after(LOCAL_MS * 2, () => setStage("proved"));
    });
  };
  /* Every other way it can end, from the dashed panel. */
  const end = (outcome: Exclude<ConfirmStage, "intro" | "idle" | "wallet" | "checking" | "proved">) => {
    clear();
    setStage(outcome);
  };

  /* Confirmed: nothing left to decide, so it carries on by itself. */
  const confirmedRef = useRef(onConfirmed);
  useEffect(() => {
    confirmedRef.current = onConfirmed;
  });
  useEffect(() => {
    if (stage !== "proved") return;
    const t = setTimeout(() => confirmedRef.current(verifiedName), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [stage, verifiedName]);

  const handoff = stage === "idle" || stage === "wallet" || stage === "checking";
  const status: HandoffStatus =
    stage === "idle" ? "awaiting_scan" : stage === "wallet" ? "waiting" : stage === "checking" ? "verifying" : "confirmed";

  /* SCR-ONB-06's errors, each also saying the task is unchanged (`waiting`). */
  const failure: Partial<Record<ConfirmStage, { title: string; body: ReactNode; retry?: boolean }>> = {
    declined: { title: "You declined in your NDI wallet", body: "Nothing was saved.", retry: true },
    timed_out: {
      title: "The request expired",
      body: "It lasts 5 minutes, for your security. Nothing was saved.",
      retry: true,
    },
    no_wallet: {
      title: "You'll need the NDI wallet app to confirm your identity",
      body: (
        <>
          Bhutan NDI Wallet is on the App Store and Google Play; setting it up adds your citizen ID. There&rsquo;s no way round this step — if
          you can&rsquo;t get the app, ask {askWho}.
        </>
      ),
    },
    in_use: {
      title: "This identity is already linked to another account",
      body: (
        <>
          One person can have only one account. Sign in to the account you already have, or contact support if you don&rsquo;t recognise
          it.{admin ? " NDI's security team has been told, in case this wasn't you." : ""}
        </>
      ),
    },
    offline: { title: "You're offline", body: "The request couldn't be sent. Nothing was saved.", retry: true },
    unavailable: {
      title: "We can't check your identity right now",
      body: "Nothing was saved — try again shortly.",
      retry: true,
    },
  };
  const failed = failure[stage];

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-[var(--ndi-mint-40)] px-4 py-4" style={{ background: "var(--ndi-mint-08)" }}>
      <div className="flex flex-col gap-1">
        <p className="m-0 font-display text-[15px] font-semibold text-strong">Confirm your identity</p>
        <p className="m-0 max-w-[64ch] text-[13.5px] leading-[1.6] text-body">{lead ?? <>To {task}, first confirm your identity.</>}</p>
        {/* Before the person approves, not after (ADR-001 Transparency). */}
        <p className="m-0 max-w-[64ch] text-[13px] leading-[1.6] text-muted">
          We&rsquo;ll ask your NDI wallet for your name and citizenship ID. We keep your name and a protected reference to your citizenship
          ID, so this account can only ever be yours.
        </p>
      </div>

      {stage === "intro" ? (
        <div className="flex flex-wrap items-center gap-2.5">
          <GradientButton onClick={() => setStage("idle")}>
            <Icon name="wallet" size={15} strokeWidth={2} />
            Confirm with my NDI wallet
          </GradientButton>
          <HairlineButton onClick={onCancel}>Not now</HairlineButton>
          <button type="button" onClick={() => end("no_wallet")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
            I don&rsquo;t have the NDI wallet app
          </button>
        </div>
      ) : null}

      {stage === "proved" ? (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[var(--ndi-mint-40)] bg-[var(--chrome-fill-strong)] px-4 py-3">
          <p className="m-0 flex items-start gap-2 text-[13.5px] leading-[1.6] text-body">
            <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none text-accent" />
            <span>
              Your identity is confirmed, as <strong className="text-strong">{verifiedName}</strong>. Taking you back to {task}…
            </span>
          </p>
          <HairlineButton onClick={() => confirmedRef.current(verifiedName)}>Continue</HairlineButton>
        </div>
      ) : null}

      {failed ? (
        <div role="alert" className="flex flex-col gap-2 rounded-[12px] border border-grid bg-[var(--chrome-fill-strong)] px-4 py-3.5 text-[13px] leading-[1.6] text-muted">
          <p className="m-0 font-display text-[14.5px] font-semibold text-strong">{failed.title}</p>
          <p className="m-0">{failed.body}</p>
          <p className="m-0 text-body">{waiting}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            {failed.retry ? (
              <HairlineButton onClick={() => setStage("idle")}>
                <Icon name="refresh" size={14} strokeWidth={2} />
                Try again
              </HairlineButton>
            ) : null}
            {stage === "no_wallet" ? <HairlineButton onClick={() => setStage("idle")}>I have it now</HairlineButton> : null}
            {stage === "in_use" ? (
              <>
                <HairlineButton onClick={() => router.push("/sign-in")}>Sign in to the account you already have</HairlineButton>
                <HairlineButton onClick={() => router.push("/legal/support")}>Contact support</HairlineButton>
              </>
            ) : null}
            <HairlineButton onClick={onCancel}>Not now</HairlineButton>
          </div>
        </div>
      ) : null}

      {handoff ? (
        <WalletHandoff
          value="ndi-account-identity-anchor"
          cardVerb="Confirm"
          title="Bhutan NDI is asking who you are"
          purpose="Approve the request in your NDI wallet app."
          sharing={["Your full name, as it is on your citizen ID", "Your citizenship ID number"]}
          notSharing={["Your date of birth, gender or anything else on your citizen ID", "Anything else in your NDI wallet"]}
          status={status}
          statusDetail={
            stage === "checking" ? "Checking the answer with Bhutan NDI…" : undefined
          }
          onSimulateScan={scan}
          onCancel={stage === "checking" ? undefined : onCancel}
        />
      ) : null}

      {/* Every way the request can end, for building each state. */}
      {stage === "intro" || stage === "idle" || stage === "wallet" ? (
        <SimulatedStep
          standsFor="the other ways the wallet request can end"
          action={
            <>
              <SimulatedAction onClick={() => end("declined")}>Declined in the wallet</SimulatedAction>
              <SimulatedAction onClick={() => end("timed_out")}>Times out</SimulatedAction>
              <SimulatedAction onClick={() => end("no_wallet")}>No NDI wallet</SimulatedAction>
              <SimulatedAction onClick={() => end("in_use")}>ID already used by another account</SimulatedAction>
              <SimulatedAction onClick={() => end("offline")}>Goes offline</SimulatedAction>
              <SimulatedAction onClick={() => end("unavailable")}>Verification service down</SimulatedAction>
            </>
          }
        >
          Each leaves the task where it was. No CID or anchor is shown in any of them.
        </SimulatedStep>
      ) : null}
    </div>
  );
}

/**
 * Guards one action behind Confirm your identity, for the developers' phase.
 * `guard(fn)` runs fn at once for a confirmed person — or anyone, outside
 * that phase — and otherwise shows the step (`panel`, placed beside the
 * action) and runs fn once it passes. The root account is a role account
 * and is never asked (Decision 6).
 */
export function useIdentityGate(task: string, waiting: string) {
  const { harness, currentPerson, confirmIdentity } = useDemo();
  const [pending, setPending] = useState<(() => void) | null>(null);
  const needed = harness.developer === true && currentPerson.platformRole !== "root" && !currentPerson.cidVerified;
  const guard = (fn: () => void) => {
    if (needed) setPending(() => fn);
    else fn();
  };
  const panel = pending ? (
    <ConfirmItsYouStep
      task={task}
      waiting={waiting}
      verifiedName={currentPerson.name}
      admin={currentPerson.platformRole === "admin"}
      askWho={currentPerson.platformRole === "admin" ? "NDI's security team" : "the NDI platform team"}
      onConfirmed={() => {
        confirmIdentity(currentPerson.id);
        const run = pending;
        setPending(null);
        run();
      }}
      onCancel={() => setPending(null)}
    />
  ) : null;
  return { guard, panel, needed, open: pending !== null };
}
