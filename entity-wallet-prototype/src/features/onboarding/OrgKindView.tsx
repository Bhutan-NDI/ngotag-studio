"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { GradientButton } from "@/components/ui/GradientButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import type { OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { OnboardingShell } from "./OnboardingShell";
import { ORG_KINDS } from "./orgKinds";

/**
 * Flow 2 step 1 — the representative opts the organisation in, and says
 * what kind it is.
 *
 * WHY THE KIND COMES BEFORE ANYTHING ELSE
 *
 * It decides which register is asked about you, and the person should know
 * that before they prove who they are to anyone. So the register is named on
 * each option.
 *
 * WHAT IS NOT ASKED HERE
 *
 * No name, no registration number. Under list-then-select the register
 * returns the organisations it lists you against once it knows who you are;
 * asking you to type one first would make the organisation something you
 * claim rather than something the register confirms.
 */
export function OrgKindView() {
  const router = useRouter();
  const { startOrgOnboarding, orgOnboarding } = useDemo();
  const [kind, setKind] = useState<OrgKind>(orgOnboarding?.kind ?? "company");

  const chosen = ORG_KINDS.find((k) => k.value === kind)!;

  return (
    <OnboardingShell current={0}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          Add the organisation you act for
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          Adding it gives the organisation a wallet of its own — it can hold its registration,
          prove things about itself, and let named people act for it. First we establish that you
          represent it. We don&rsquo;t decide that; the register does.
        </p>
      </div>

      <Panel>
        <fieldset className="relative z-[4] m-0 flex flex-col gap-2 border-0 p-0">
          <legend className={`${LABEL_CLASS} mb-2 p-0`}>What kind of organisation is it?</legend>
          {ORG_KINDS.map((option) => {
            const on = kind === option.value;
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-[11px] border px-3.5 py-3"
                style={{
                  borderColor: on ? "var(--ndi-mint-40)" : "var(--border-grid)",
                  background: on ? "var(--ndi-mint-08)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="org-kind"
                  checked={on}
                  onChange={() => setKind(option.value)}
                  className="mt-0.5 h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-display text-[13.5px] font-medium text-body">{option.label}</span>
                  <span className="text-[12.5px] leading-[1.5] text-faint">
                    {option.register
                      ? `Confirmed by the ${option.register}`
                      : "No register can confirm this automatically yet — NDI reviews it instead"}
                  </span>
                </span>
                {!option.register ? <StatusPill status="under_review" label="Reviewed by NDI" /> : null}
              </label>
            );
          })}
        </fieldset>
      </Panel>

      <div className="flex flex-col gap-2">
        <div>
          <GradientButton
            onClick={() => {
              startOrgOnboarding(kind);
              router.push("/onboarding/prove");
            }}
          >
            Continue to prove who you are
            <Icon name="arrowRight" size={15} strokeWidth={2} />
          </GradientButton>
        </div>
        <p className="max-w-[64ch] text-[12.5px] leading-[1.5] text-faint">
          {chosen.register
            ? `Next you'll answer a request from your NDI Wallet. Then the ${chosen.register} is asked which organisations it lists you as representing, and you choose one.`
            : "Next you'll answer a request from your NDI Wallet. Then you'll tell NDI about the organisation and send what shows you represent it, and a person at NDI reviews it."}
        </p>
      </div>
    </OnboardingShell>
  );
}
