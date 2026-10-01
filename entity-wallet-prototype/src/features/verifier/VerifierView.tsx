"use client";

import Link from "next/link";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthorityChain } from "@/components/ui/AuthorityChain";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff } from "@/components/ui/WalletHandoff";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { ROUND_TRIP_MS, SKIP_AFTER_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";
import { useDemo } from "@/lib/demoStore";
import type { VerificationDecision } from "@/lib/demoData";

/**
 * D5 — the counterparty's own site, and the signed decision it renders.
 *
 * THIS IS NOT THE CONSOLE, AND MUST NOT LOOK LIKE IT.
 *
 * No AppShell, no sidebar, no NDI lockup. This is Bhutan National Single
 * Window's website, where a clearing agent files a declaration and where the
 * authority behind it gets checked. Dressing it in the Studio's chrome would
 * teach the single most damaging misunderstanding available here — that the
 * verifier is part of the platform, or that the platform is watching over
 * their shoulder. It is a different organisation's system making a request
 * against an API and rendering what comes back.
 *
 * The plan calls this act the money shot, and the reason is on this screen:
 * the same authority, the same person, the same counterparty, passing and
 * then failing once a role above it is withdrawn. That pair explains
 * delegated authority better than any diagram, but only if the FAIL is
 * *caused* rather than staged — so the decision is derived live by the
 * stand-in verification service, and revoking the role between two runs is
 * what changes the answer.
 *
 * PASS is the easy half. The invested half is FAIL: which check failed, which
 * link in the chain broke, and what that means, without leaking a single
 * personal attribute the declaration did not need.
 */
export function VerifierView() {
  const { delegatedAuthorities, personById, runVerification, decisions } = useDemo();

  const screenState = useScreenState("D5", [
    "ready",
    "pass",
    "fail",
    "service_unreachable",
  ]);

  const [value, setValue] = useState("420000");
  const [phase, setPhase] = useState<"ready" | "wallet" | "verifying">("ready");
  const [decision, setDecision] = useState<VerificationDecision | null>(null);
  const [skippable, setSkippable] = useState(false);

  /* The capability Pema files declarations under. Found by task rather than
     by id, so it still resolves if the demo issued a fresh one in act 4. */
  const capability =
    delegatedAuthorities.find(
      (a) => a.taskScopes.includes("customs:declaration") && a.kind === "capability" && a.status === "ACTIVE",
    ) ??
    delegatedAuthorities.find((a) => a.taskScopes.includes("customs:declaration"));

  const holder = capability ? personById(capability.recipientId) : null;

  /* The state switcher shows a seeded decision of the requested kind, so
     every outcome is reachable without having to drive the story into it. */
  const forced =
    screenState === "pass"
      ? decisions.find((d) => d.outcome === "PASS")
      : screenState === "fail"
        ? decisions.find((d) => d.outcome === "FAIL")
        : screenState === "service_unreachable"
          ? decisions.find((d) => d.outcome === "SERVICE_UNREACHABLE")
          : undefined;

  const shown = forced ?? decision;

  const submit = (unreachable = false) => {
    if (!capability) return;
    setDecision(null);
    setSkippable(false);
    setPhase("wallet");

    /* Two authored waits, because two different things are happening and
       collapsing them would hide the more important one. The first is the
       holder answering a proof request on their phone — that is a person
       doing something. The second is the service walking the chain. See
       demoTiming.ts for why these are ~2s and skippable. */
    const skipTimer = setTimeout(() => setSkippable(true), SKIP_AFTER_MS);
    setTimeout(() => {
      setPhase("verifying");
      setTimeout(() => {
        clearTimeout(skipTimer);
        const result = runVerification({
          authorityId: capability.id,
          verifier: "Bhutan National Single Window",
          declarationRef: `BNSW-DEC-${new Date().getFullYear()}-${Math.floor(
            10000 + Math.random() * 89999,
          )}`,
          declaredValue: Number(value) || 0,
          task: "customs:declaration",
          unreachable,
        });
        setDecision(result);
        setPhase("ready");
      }, ROUND_TRIP_MS);
    }, WALLET_HANDOFF_MS);
  };

  const skip = () => {
    /* Resolves immediately rather than shortening the timers, because a
       presenter who presses skip wants the answer now, not sooner. */
    if (!capability) return;
    const result = runVerification({
      authorityId: capability.id,
      verifier: "Bhutan National Single Window",
      declarationRef: `BNSW-DEC-${new Date().getFullYear()}-${Math.floor(
        10000 + Math.random() * 89999,
      )}`,
      declaredValue: Number(value) || 0,
      task: "customs:declaration",
    });
    setDecision(result);
    setPhase("ready");
    setSkippable(false);
  };

  return (
    /* The counterparty's own ground: no atmosphere, no glass, a plain
       surface. It should feel like leaving the product. */
    <div className="min-h-dvh" style={{ background: "var(--surface-sunken)" }}>
      {/* ---- Their chrome, not ours ---- */}
      <header className="border-b border-subtle" style={{ background: "var(--surface-canvas)" }}>
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 min-[641px]:px-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-[8px] font-display text-[13px] font-bold"
              style={{ background: "var(--ndi-info)", color: "var(--ndi-ink-900)" }}
            >
              SW
            </span>
            <div className="flex flex-col">
              <span className="font-display text-[14px] font-semibold leading-tight text-strong">
                Bhutan National Single Window
              </span>
              <span className="text-[11.5px] leading-tight text-faint">
                Customs declaration portal
              </span>
            </div>
          </div>
          <span className="text-[12px] text-faint">
            {holder ? `Signed in as ${holder.name} · Druk Sharpa Freight` : "Not signed in"}
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1000px] flex-col gap-5 px-4 py-6 min-[641px]:px-6 min-[901px]:py-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            — Not part of NDI Studio
          </p>
          <h1 className="font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
            File a customs declaration
          </h1>
          <p className="max-w-[62ch] text-[13.5px] leading-[1.65] text-muted">
            This is a counterparty&rsquo;s own website. It asks the NDI&rsquo;s
            Authority Verification API whether the person filing has the authority to
            file, and renders the signed answer. It never sees the
            entity&rsquo;s credentials, and it learns nothing about the person
            beyond who acted.
          </p>
        </div>

        {!capability ? (
          <Panel>
            <p className="relative z-[4] text-[13.5px] leading-[1.6] text-muted">
              No declaration authority exists yet. Issue one first — the story
              runner&rsquo;s act 4 does that — and this page will have something
              to check.
            </p>
          </Panel>
        ) : (
          <div className="grid gap-5 min-[901px]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* ---- The declaration ---- */}
            <Panel>
              <div className="relative z-[4] flex flex-col gap-4">
                <h2 className="font-display text-[15px] font-semibold text-strong">
                  Declaration
                </h2>

                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Declared value (Nu.)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
                    className={`${FIELD_CLASS} h-11`}
                  />
                  <span className="text-[12px] leading-[1.5] text-faint">
                    Try a value over the cap on the authority to see the check
                    refuse it.
                  </span>
                </label>

                <dl className="m-0 flex flex-col gap-2 text-[13px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Consignee</dt>
                    <dd className="m-0 text-body">Pelden Trading Pvt. Ltd.</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Filed by</dt>
                    <dd className="m-0 text-body">{holder?.name}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Under</dt>
                    <dd className="m-0 text-body">{capability.title}</dd>
                  </div>
                </dl>

                {phase === "ready" ? (
                  <div className="flex flex-col gap-2.5">
                    <GradientButton onClick={() => submit(false)}>
                      <Icon name="send" size={15} strokeWidth={2} />
                      Submit declaration
                    </GradientButton>
                    <HairlineButton onClick={() => submit(true)}>
                      Submit with the service unreachable
                    </HairlineButton>
                  </div>
                ) : null}

                {/* ---- Hand-off #4: the holder authorises this specific
                        transaction from their own phone ---- */}
                {phase === "wallet" ? (
                  <div className="rounded-[12px] border border-grid px-4 py-4">
                    <WalletHandoff
                      value={`bnsw-${value}`}
                      title={`Waiting for ${holder?.name.split(" ")[0] ?? "the agent"} to authorise`}
                      purpose="Their wallet is being asked to authorise this declaration — not to sign in, and not to authorise anything else."
                      sharing={[
                        "That they hold an authority covering this declaration",
                        "A commitment to this declaration's exact value and counterparty",
                      ]}
                      status="waiting"
                      onSkip={skippable ? skip : undefined}
                    />
                  </div>
                ) : null}

                {phase === "verifying" ? (
                  <div className="flex flex-col items-center gap-2 rounded-[12px] border border-grid px-4 py-6">
                    <Icon
                      name="refresh"
                      size={18}
                      strokeWidth={2}
                      className="animate-spin text-accent"
                    />
                    <p className="font-display text-[13.5px] font-semibold text-strong">
                      Checking the authority
                    </p>
                    <p className="max-w-[38ch] text-center text-[12.5px] leading-[1.5] text-muted">
                      Walking the chain from this authority up to the
                      company&rsquo;s registration, then checking the
                      constraints.
                    </p>
                  </div>
                ) : null}
              </div>
            </Panel>

            {/* ---- The decision ---- */}
            <div className="flex flex-col gap-4">
              {shown ? <DecisionPanel decision={shown} /> : null}

              {!shown ? (
                <Panel>
                  <p className="relative z-[4] text-[13.5px] leading-[1.6] text-muted">
                    No decision yet. Submit the declaration and the signed
                    answer appears here.
                  </p>
                </Panel>
              ) : null}
            </div>
          </div>
        )}

        <p className="text-[12px] leading-[1.5] text-faint">
          Prototype. The Single Window is not live yet, and there is no
          Authority Verification API behind this page —{" "}
          <Link href="/dashboard" className="ndi-plainlink text-muted">
            back to the console
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

/**
 * The signed decision. PASS, FAIL with reasons, or an honest admission that
 * nothing could be checked.
 *
 * The outcome is never carried by colour alone: the word is the headline, the
 * icon changes, and every check names its own result. Someone reading this in
 * greyscale, or with a colour vision deficiency, gets the same answer.
 */
function DecisionPanel({ decision }: { decision: VerificationDecision }) {
  const { personById } = useDemo();
  const actor = personById(decision.actorId);
  const failed = decision.outcome !== "PASS";
  const unreachable = decision.outcome === "SERVICE_UNREACHABLE";

  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-4">
        {/* ---- Headline ---- */}
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border"
            style={{
              borderColor: failed ? "rgb(225 73 62 / 0.45)" : "var(--ndi-mint-40)",
              background: failed ? "rgb(225 73 62 / 0.12)" : "var(--ndi-mint-12)",
            }}
          >
            <Icon
              name={failed ? "close" : "check"}
              size={20}
              strokeWidth={2.6}
              style={{ color: failed ? "var(--ndi-danger)" : "var(--accent)" }}
            />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p
              className="font-display text-[20px] font-semibold leading-[1.15] tracking-[-0.01em]"
              style={{ color: failed ? "var(--ndi-danger)" : "var(--accent)" }}
            >
              {unreachable ? "Not verified" : decision.outcome}
            </p>
            <p className="text-[13px] leading-[1.5] text-muted">
              {unreachable
                ? "Treated as a failure."
                : failed
                  ? "This declaration cannot be accepted."
                  : "This declaration is authorised."}
            </p>
          </div>
        </div>

        {/* ---- Who, and nothing more ---- */}
        <div className="rounded-[12px] border border-grid px-3.5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Acting
          </p>
          <p className="mt-1.5 font-display text-[13.5px] font-medium text-body">
            {decision.entity}
          </p>
          <p className="text-[12.5px] leading-[1.45] text-faint">
            acted by <span className="text-muted">{actor.name}</span>
          </p>
          <p className="mt-2 text-[12px] leading-[1.5] text-faint">
            Nothing else about this person is disclosed — not their citizenship
            number, not their address, not what else they are authorised to do.
          </p>
        </div>

        {/* ---- Why ---- */}
        {decision.reasons.length > 0 ? (
          <div
            className="rounded-[12px] border px-3.5 py-3"
            style={{
              borderColor: "rgb(225 73 62 / 0.35)",
              background: "rgb(225 73 62 / 0.07)",
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Why
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {decision.reasons.map((reason) => (
                <li key={reason} className="text-[13px] leading-[1.55] text-body">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* ---- The checks ---- */}
        {decision.checks.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              What was checked
            </p>
            <ul className="flex flex-col">
              {decision.checks.map((check, i) => (
                <li
                  key={check.label}
                  className={`flex items-start gap-2.5 py-2.5 ${
                    i > 0 ? "border-t border-subtle" : ""
                  }`}
                >
                  <Icon
                    name={check.outcome === "pass" ? "check" : "close"}
                    size={13}
                    strokeWidth={2.6}
                    className="mt-[4px] flex-none"
                    style={{
                      color:
                        check.outcome === "pass" ? "var(--accent)" : "var(--ndi-danger)",
                    }}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-display text-[13px] font-medium leading-[1.4] text-body">
                      {check.label}
                    </span>
                    <span className="text-[12.5px] leading-[1.5] text-faint">
                      {check.detail}
                    </span>
                  </span>
                  <StatusPill status={check.outcome} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* ---- The chain ---- */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Authority chain
          </p>
          <AuthorityChain chain={decision.chain} />
        </div>

        {/* ---- The artifact ---- */}
        <div className="flex flex-col gap-1.5 border-t border-subtle pt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[12px] text-faint">Decision reference</span>
            <span className="font-mono text-[12px] text-muted">{decision.declarationRef}</span>
          </div>
          {decision.signature ? (
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[12px] text-faint">Signature</span>
              <span className="max-w-full truncate font-mono text-[11.5px] text-muted">
                {decision.signature.slice(0, 28)}…
              </span>
            </div>
          ) : null}
          <p className="mt-1 text-[12px] leading-[1.5] text-faint">
            {decision.signature
              ? "A signed decision can be re-checked later by anyone, without asking the platform again."
              : "No signature — nothing was decided, so there is nothing to re-check."}
          </p>
        </div>
      </div>
    </Panel>
  );
}
