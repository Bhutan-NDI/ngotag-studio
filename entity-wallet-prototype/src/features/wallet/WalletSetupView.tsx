"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";

const STEPS = [
  {
    icon: "wallet",
    title: "Create the agent wallet",
    body: "A dedicated wallet holds your organization's keys and connections. It is created once and cannot be renamed afterwards.",
  },
  {
    icon: "fingerprint",
    title: "Anchor an issuing DID",
    body: "The DID that signs every credential you issue. Anchored on the ledger you choose during creation.",
  },
  {
    icon: "layers",
    title: "Define what you issue",
    body: "A schema names the attributes; a credential definition binds it to your DID and makes it issuable.",
  },
] as const;

const LEDGERS = [
  { value: "bhutan", label: "Bhutan NDI" },
  { value: "indicio", label: "Indicio TestNet" },
  { value: "none", label: "No ledger" },
];

function LedgerSelect() {
  const [ledger, setLedger] = useState("bhutan");
  return (
    <Select label="Ledger" className="h-12 w-full" value={ledger} onChange={setLedger} options={LEDGERS} />
  );
}

/**
 * Wallet setup is the gate in front of everything else an organization can do,
 * so the page states the whole sequence rather than only the step in hand — a
 * one-field form with no context reads as busywork when it is actually the
 * point the organization becomes able to issue.
 */
export function WalletSetupView() {
  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Wallet setup" }]} title="Set up your wallet" />

        <div className="grid gap-5 min-[901px]:grid-cols-[1.1fr_1fr]">
          <Panel>
            <div className="relative z-[4] flex flex-col gap-5">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Wallet name</span>
                <input className={`${FIELD_CLASS} h-12`} placeholder="bhutan-ndi-issuer" />
                <span className="text-[12.5px] leading-[1.5] text-faint">
                  Lowercase letters, numbers and hyphens. This cannot be changed later.
                </span>
              </label>

              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Ledger</span>
<LedgerSelect />
              </label>

              <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
                <GradientButton>
                  <Icon name="wallet" size={16} strokeWidth={2} />
                  Create wallet
                </GradientButton>
                <HairlineButton className="h-12">Cancel</HairlineButton>
              </div>
            </div>
          </Panel>

          <Panel>
            <ol className="relative z-[4] m-0 flex list-none flex-col gap-5 p-0">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3.5">
                  <span
                    className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-grid text-accent"
                    style={{ background: "var(--ndi-mint-04)" }}
                  >
                    <Icon name={step.icon} size={18} strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 font-display text-[14.5px] font-semibold text-strong">
                      <span className="mr-2 font-mono text-[11px] text-faint">0{i + 1}</span>
                      {step.title}
                    </p>
                    <p className="m-0 mt-1 text-[13.5px] leading-[1.55] text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
