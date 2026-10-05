"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stepper } from "@/components/ui/Stepper";
import { Icon } from "@/components/ui/icons";

import { VERIFY_STEPS } from "./verifySteps";
import { useProofRequest } from "./useProofRequest";

interface Props {
  /** Where to send from — one delivery route, or two to choose between. */
  deliver: { label: string; href: string; icon: "mail" | "verify" | "connections" }[];
  back: string;
  crumbs: { label: string; href?: string }[];
}

/**
 * Choose which attributes the holder must present.
 *
 * Selective disclosure is the entire point of the credential model, so this
 * step defaults to nothing selected rather than everything: asking for the
 * whole credential should be a decision someone makes, not what happens when
 * they click through.
 */
export function VerifyAttributesStepView({ deliver, back, crumbs }: Props) {
  const { schema, attributes, withDraft, edit } = useProofRequest();

  if (!schema) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader crumbs={crumbs} title="Select attributes" />
          <Panel padded={false}>
            <EmptyState
              icon="layers"
              tone="filtered"
              title="No credential chosen yet"
              message="Attributes come from the credential being requested. Go back and choose one first."
              action={
                <Link href={back}>
                  <HairlineButton>
                    <Icon name="arrowLeft" size={15} strokeWidth={2} />
                    Choose a credential
                  </HairlineButton>
                </Link>
              }
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const all = schema.attributes.map((a) => a.name);
  const toggle = (name: string) =>
    attributes.includes(name) ? attributes.filter((a) => a !== name) : [...attributes, name];

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={crumbs} title="Select attributes" />

        <Stepper steps={VERIFY_STEPS} current={2} />

        <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-muted">
          The holder presents only what you ask for. Request the fewest attributes that answer your
          question — everything else stays in their wallet.
        </p>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {schema.name} v{schema.version}
              </span>
              <span className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => edit({ attributes: all })}
                  className="ndi-plainlink text-[12.5px] text-accent"
                >
                  Select all
                </button>
                <span className="text-faint">·</span>
                <button
                  type="button"
                  onClick={() => edit({ attributes: [] })}
                  className="ndi-plainlink text-[12.5px] text-muted"
                >
                  Clear
                </button>
              </span>
            </div>

            <div className="grid gap-2.5 min-[641px]:grid-cols-2">
              {schema.attributes.map((a) => {
                const on = attributes.includes(a.name);
                return (
                  <label
                    key={a.name}
                    className="ndi-lift flex cursor-pointer items-center gap-3 rounded-xl border p-3.5"
                    style={{
                      borderColor: on ? "var(--border-strong)" : "var(--border-grid)",
                      background: on ? "var(--ndi-mint-08)" : "rgb(var(--tint) / 0.02)",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="ndi-check flex-none"
                      checked={on}
                      onChange={() => edit({ attributes: toggle(a.name) })}
                    />
                    <span className="min-w-0">
                      <span className="block font-mono text-[13px] text-strong">{a.name}</span>
                      <span className="mt-0.5 block text-[12px] text-faint">{a.type}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
              {deliver.map((d, i) => {
                const Btn = i === 0 ? GradientButton : HairlineButton;
                return (
                  <Link key={d.href} href={`${d.href}${withDraft({})}`}>
                    <Btn className={i === 0 ? undefined : "h-12"}>
                      <Icon name={d.icon} size={16} strokeWidth={2} />
                      {d.label}
                    </Btn>
                  </Link>
                );
              })}
              <span className="text-[12.5px] text-faint">
                {attributes.length
                  ? `${attributes.length} of ${all.length} requested`
                  : "Nothing selected — the holder would be asked for nothing"}
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
