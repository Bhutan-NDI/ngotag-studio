"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stepper } from "@/components/ui/Stepper";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";

import { VERIFY_STEPS } from "./verifySteps";
import { useProofRequest } from "./useProofRequest";

interface Props {
  /** Where a schema selection goes next — the cred-def step, usually. */
  next: string;
  crumbs: { label: string; href?: string }[];
}

/**
 * Pick the credential the holder is being asked to present from.
 *
 * Choosing a schema also clears any definition and attributes already in the
 * draft: both belong to the previous schema, and carrying them forward would
 * build a request for attributes the new credential does not have.
 */
export function VerifySchemaStepView({ next, crumbs }: Props) {
  const { schemas, schemaId, go } = useProofRequest();

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={crumbs} title="Select a credential" />

        <Stepper steps={VERIFY_STEPS} current={0} />

        <Panel padded={false}>
          <Toolbar left={<ToolbarCount>{schemas.length} schemas</ToolbarCount>} />
          {schemas.length ? (
            <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
              {schemas.map((s, i) => (
                <li key={s.id} className={i > 0 ? "border-t border-subtle" : ""}>
                  <button
                    type="button"
                    onClick={() =>
                      go(next, { schemaId: s.id, credDefId: "", attributes: [] })
                    }
                    className="ndi-navrow flex w-full items-center gap-3 px-4 py-3.5 text-left min-[641px]:px-6"
                    data-active={s.id === schemaId ? "1" : "0"}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-strong">{s.name}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-faint">
                        v{s.version} · {s.ledger} · {s.attributes.length} attributes
                      </span>
                    </span>
                    <Icon name="chevronRight" size={16} strokeWidth={2} className="flex-none" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="layers"
              title="No credentials to request"
              message="A proof request names the schema whose attributes the holder should present. Create a schema first."
              action={
                <Link href="/schemas/create">
                  <GradientButton>
                    <Icon name="plus" size={16} strokeWidth={2} />
                    Create schema
                  </GradientButton>
                </Link>
              }
            />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
