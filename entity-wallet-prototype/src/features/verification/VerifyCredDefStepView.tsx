"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stepper } from "@/components/ui/Stepper";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";

import { VERIFY_STEPS } from "./verifySteps";
import { useProofRequest } from "./useProofRequest";

interface Props {
  /** Where picking a definition goes. */
  next: string;
  /** Where "any definition" goes — the reference keeps a parallel tree for the
      unnarrowed request, so skipping is a different path, not a flag. */
  skip: string;
  back: string;
  crumbs: { label: string; href?: string }[];
}

/**
 * Narrow the request to one credential definition, or leave it open.
 *
 * This step is genuinely optional: naming a definition means "the credential
 * issued under this exact key", which is stricter than "any credential of this
 * schema". Skipping is offered as a first-class control rather than something
 * you achieve by not clicking, because both are real choices.
 */
export function VerifyCredDefStepView({ next, skip, back, crumbs }: Props) {
  const { schema, defs, credDefId, go } = useProofRequest();

  if (!schema) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader crumbs={crumbs} title="Select a definition" />
          <Panel padded={false}>
            <EmptyState
              icon="layers"
              tone="filtered"
              title="No credential chosen yet"
              message="This step narrows a credential you have already picked. Go back and choose one first."
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

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={crumbs}
          title="Select a definition"
          actions={
            <HairlineButton
              className="h-11 px-4 text-[13px]"
              onClick={() => go(skip, { credDefId: "" })}
            >
              Any definition
              <Icon name="arrowRight" size={15} strokeWidth={2} />
            </HairlineButton>
          }
        />

        <Stepper steps={VERIFY_STEPS} current={1} />

        <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-muted">
          Requesting a specific definition accepts only credentials issued under that key. Leave it
          open to accept any credential built on{" "}
          <span className="text-body">{schema.name}</span>.
        </p>

        <Panel padded={false}>
          <Toolbar left={<ToolbarCount>{defs.length} definitions</ToolbarCount>} />
          {defs.length ? (
            <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
              {defs.map((d, i) => (
                <li key={d.id} className={i > 0 ? "border-t border-subtle" : ""}>
                  <button
                    type="button"
                    onClick={() => go(next, { credDefId: d.id })}
                    className="ndi-navrow flex w-full items-center gap-3 px-4 py-3.5 text-left min-[641px]:px-6"
                    data-active={d.id === credDefId ? "1" : "0"}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-strong">{d.tag}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-faint">
                        {d.id} · {d.revocable ? "revocable" : "not revocable"}
                      </span>
                    </span>
                    <Icon name="chevronRight" size={16} strokeWidth={2} className="flex-none" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="credentials"
              tone="filtered"
              title="No definitions for this credential"
              message="Nothing has been issued under this schema yet, so there is no definition to narrow to. Continue with any definition."
              action={
                <HairlineButton onClick={() => go(skip, { credDefId: "" })}>
                  Continue
                  <Icon name="arrowRight" size={15} strokeWidth={2} />
                </HairlineButton>
              }
            />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
