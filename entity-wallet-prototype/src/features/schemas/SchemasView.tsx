"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * Schemas are browsed as cards, not rows: each carries an issuer DID, a ledger
 * badge and its attribute names, which is more than a table cell reads well at.
 */
export function SchemasView() {
  const { schemas } = useDemo();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shown = q
    ? schemas.filter(
        (s) => s.name.toLowerCase().includes(q) || s.attributes.some((a) => a.name.includes(q)),
      )
    : schemas;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Schemas" }]}
          title="Schemas"
          actions={
            <>
              <SearchField
                className="w-full min-[561px]:w-[280px]"
                placeholder="Search schemas"
                value={query}
                onChange={setQuery}
              />
              <Link href="/schemas/create">
                <GradientButton className="h-11">
                  <Icon name="plus" size={16} strokeWidth={2} />
                  Create schema
                </GradientButton>
              </Link>
            </>
          }
        />

        {shown.length ? (
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            {shown.map((s) => (
              <Link
                key={s.id}
                href={`/schemas/${encodeURIComponent(s.id)}`}
                data-cta-form="1"
                className="ndi-lift relative flex flex-col gap-3.5 overflow-hidden rounded-[16px] border border-grid p-5 min-[641px]:p-6"
              >
                <div className="relative z-[4] flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 truncate font-display text-[17px] font-semibold leading-[1.25] tracking-[-0.01em] text-strong">
                      {s.name}
                    </h2>
                    <p className="m-0 mt-1 font-mono text-[11px] text-faint">v{s.version}</p>
                  </div>
                  <span
                    className="inline-flex flex-none items-center rounded-full border border-grid px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent"
                    style={{ background: "var(--ndi-mint-08)" }}
                  >
                    {s.ledger}
                  </span>
                </div>

                <div className="relative z-[4] flex flex-wrap gap-1.5">
                  {s.attributes.map((a) => (
                    <span
                      key={a.name}
                      className="inline-flex items-center rounded-md border border-grid px-2 py-1 font-mono text-[11px] text-muted"
                      style={{ background: "rgb(var(--tint) / 0.03)" }}
                    >
                      {a.name}
                    </span>
                  ))}
                </div>

                <div className="relative z-[4] mt-auto flex items-center justify-between gap-3 border-t border-subtle pt-3.5">
                  <span className="truncate font-mono text-[11px] text-faint">{s.issuerDid}</span>
                  <span className="flex-none text-[12px] text-faint">{s.createdAt}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Panel padded={false}>
            <Toolbar left={<ToolbarCount>0 schemas</ToolbarCount>} />
            <EmptyState
              icon="layers"
              tone={q ? "filtered" : "empty"}
              title={q ? "No schemas match that search" : "No schemas yet"}
              message={
                q
                  ? "Nothing here matches what you typed. Clear the search to see every schema."
                  : "A schema names the attributes a credential carries — it is the shape, not the data. Create one before you define a credential against it."
              }
              action={
                q ? undefined : (
                  <Link href="/schemas/create">
                    <GradientButton>
                      <Icon name="plus" size={16} strokeWidth={2} />
                      Create schema
                    </GradientButton>
                  </Link>
                )
              }
            />
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
