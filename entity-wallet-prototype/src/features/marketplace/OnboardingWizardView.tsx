"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Atmosphere } from "@/components/layout/Atmosphere";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { Stepper } from "@/components/ui/Stepper";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

const STEPS = [{ label: "Organization" }, { label: "Activate" }];

/**
 * Linking a marketplace subscription to an organization.
 *
 * Two routes through it — create a new organization, or attach to one the
 * account already has — because a subscription bought by an existing customer
 * should not force a second organization into existence. Which one is offered
 * depends on whether there is anything to link to.
 */
export function OnboardingWizardView() {
  const router = useRouter();
  const { organizations, addOrganization, setActiveOrg } = useDemo();

  const [mode, setMode] = useState<"create" | "link">(
    organizations.length ? "link" : "create",
  );
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const chosen = organizations.find((o) => o.id === orgId) ?? organizations[0];
  const label = mode === "create" ? name.trim() : chosen?.name ?? "";

  const next = () => {
    if (mode === "create" && !name.trim()) return setError("Give the organization a name.");
    if (mode === "link" && !chosen) return setError("Choose an organization to link.");
    setError("");
    setStep(1);
  };

  const activate = () => {
    if (mode === "create") {
      addOrganization({ name: name.trim(), description: "", visibility: "private" });
    } else if (chosen) {
      setActiveOrg(chosen.id);
    }
    router.push("/marketplace/onboarding/success");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Atmosphere />
      <div className="relative z-[1]">
        <AuthHeader />

        <main className="mx-auto w-full max-w-[760px] px-4 py-10 min-[641px]:px-6 min-[901px]:py-16">
          <div className="flex flex-col gap-6">
            <div>
              <p className="m-0 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                — Setup
              </p>
              <h1 className="mt-3 font-display text-[clamp(26px,3.6vw,34px)] font-semibold leading-[1.1] tracking-[-0.03em] text-strong">
                {step === 0
                  ? "Which organization is this for?"
                  : "Activate the subscription"}
              </h1>
            </div>

            <Stepper steps={STEPS} current={step} />

            {step === 0 ? (
              <Panel>
                <div className="relative z-[4] flex flex-col gap-6">
                  <div className="grid gap-2.5 min-[641px]:grid-cols-2">
                    {[
                      {
                        id: "create" as const,
                        label: "Create a new organization",
                        hint: "Start fresh. You become its owner.",
                        disabled: false,
                      },
                      {
                        id: "link" as const,
                        label: "Link an existing one",
                        hint: organizations.length
                          ? "Attach the subscription to an organization you already run."
                          : "You have no organizations yet.",
                        disabled: !organizations.length,
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`ndi-lift flex items-start gap-3 rounded-xl border p-3.5 ${
                          opt.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        }`}
                        style={{
                          borderColor:
                            mode === opt.id ? "var(--border-strong)" : "var(--border-grid)",
                          background:
                            mode === opt.id ? "var(--ndi-mint-08)" : "rgb(var(--tint) / 0.02)",
                        }}
                      >
                        <input
                          type="radio"
                          name="onboarding-mode"
                          className="ndi-check mt-0.5 flex-none"
                          checked={mode === opt.id}
                          disabled={opt.disabled}
                          onChange={() => setMode(opt.id)}
                        />
                        <span className="min-w-0">
                          <span className="block font-display text-[14px] font-medium text-strong">
                            {opt.label}
                          </span>
                          <span className="mt-1 block text-[12.5px] leading-[1.5] text-muted">
                            {opt.hint}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {mode === "create" ? (
                    <label className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>Organization name</span>
                      <input
                        className={`${FIELD_CLASS} h-12`}
                        placeholder="Ministry of Health"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                  ) : (
                    <label className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>Organization</span>
                      <Select
                        label="Organization"
                        className="h-12 w-full"
                        value={chosen?.id ?? ""}
                        onChange={setOrgId}
                        placeholder="No organizations"
                        options={organizations.map((o) => ({
                          value: o.id,
                          label: o.name,
                          hint: o.role,
                        }))}
                      />
                    </label>
                  )}

                  {error ? (
                    <p
                      role="alert"
                      className="m-0 flex items-center gap-2 text-[13px] text-[var(--text-danger)]"
                    >
                      <Icon name="shieldAlert" size={15} strokeWidth={2} />
                      {error}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
                    <GradientButton onClick={next}>
                      Continue
                      <Icon name="arrowRight" size={16} strokeWidth={2} />
                    </GradientButton>
                    <Link href="/marketplace/landing">
                      <HairlineButton className="h-12">Back</HairlineButton>
                    </Link>
                  </div>
                </div>
              </Panel>
            ) : (
              <Panel>
                <div className="relative z-[4] flex flex-col gap-5">
                  <p className="m-0 text-[14.5px] leading-[1.6] text-muted">
                    The Starter subscription will be linked to{" "}
                    <span className="text-strong">{label}</span>. Metered limits reset on the first
                    of each month and can be raised from billing at any time.
                  </p>

                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {[
                      "A wallet is created for the organization",
                      "You are set as its owner",
                      "Usage starts counting from today",
                    ].map((l) => (
                      <li key={l} className="flex items-center gap-2.5">
                        <Icon
                          name="check"
                          size={15}
                          strokeWidth={2.4}
                          className="flex-none text-accent"
                        />
                        <span className="text-[14px] text-body">{l}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
                    <GradientButton onClick={activate}>
                      <Icon name="check" size={16} strokeWidth={2.2} />
                      Activate subscription
                    </GradientButton>
                    <HairlineButton className="h-12" onClick={() => setStep(0)}>
                      <Icon name="arrowLeft" size={15} strokeWidth={2} />
                      Back
                    </HairlineButton>
                    <Link
                      href="/marketplace/onboarding/error"
                      className="ndi-plainlink text-[12.5px] text-faint"
                    >
                      Simulate a failure
                    </Link>
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
