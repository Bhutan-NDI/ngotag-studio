"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { Stepper } from "@/components/ui/Stepper";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { ISSUE_STEPS } from "./issueSteps";

/**
 * Step one of every issuance route: which schema is this credential an
 * instance of. The stepper is here rather than inside the panel so it reads as
 * the state of the whole flow, not of the list.
 */
export function SchemaSelectionView() {
  const { schemas } = useDemo();

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Credentials", href: "/credentials" },
            { label: "Issue", href: "/credentials/issue" },
            { label: "Schema" },
          ]}
          title="Select a schema"
        />

        <Stepper steps={ISSUE_STEPS} current={0} />

        <Panel padded={false}>
          <Toolbar
            left={<ToolbarCount>{schemas.length} schemas</ToolbarCount>}
            right={
              <SearchField className="w-full min-[561px]:w-[280px]" placeholder="Search schemas" />
            }
          />
          {schemas.length ? (
            <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
              {schemas.map((s, i) => (
                <li key={s.id} className={i > 0 ? "border-t border-subtle" : ""}>
                  <Link
                    href="/credentials/issue/email"
                    className="ndi-navrow flex items-center gap-3 px-4 py-3.5 min-[641px]:px-6"
                    data-active="0"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-strong">{s.name}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-faint">
                        v{s.version} · {s.ledger} · {s.attributes.length} attributes
                      </span>
                    </span>
                    <Icon name="chevronRight" size={16} strokeWidth={2} className="flex-none" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
          <EmptyState
            icon="layers"
            title="No schemas to issue against"
            message="You need a schema before you can issue anything: it names the attributes the credential will carry. Create one, then come back to this step."
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
