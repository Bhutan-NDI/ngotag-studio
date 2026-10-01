"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * Ecosystems this organization belongs to. Lead and member are different jobs
 * — a lead governs the trust framework, a member issues under it — so the role
 * sits on the card rather than in a detail page.
 */
export function EcosystemsView() {
  const { ecosystems, addEcosystem } = useDemo();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = ecosystems.filter((e) => !q || e.name.toLowerCase().includes(q));

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Ecosystems" }]}
          title="Ecosystems"
          actions={
            <>
              <SearchField
                className="w-full min-[561px]:w-[280px]"
                placeholder="Search ecosystems"
                value={query}
                onChange={setQuery}
              />
              <Link href="/ecosystems/invitations">
                <HairlineButton className="h-11 px-4 text-[13px]">
                  <Icon name="mail" size={15} strokeWidth={1.8} />
                  Invitations
                </HairlineButton>
              </Link>
              <GradientButton
                className="h-11"
                onClick={() => addEcosystem(`Ecosystem ${ecosystems.length + 1}`)}
              >
                <Icon name="plus" size={16} strokeWidth={2} />
                Create ecosystem
              </GradientButton>
            </>
          }
        />

        {rows.length ? (
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            {rows.map((e) => (
              <Panel key={e.id}>
                <div className="relative z-[4] flex h-full flex-col gap-3.5">
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-grid text-accent"
                      style={{ background: "var(--ndi-mint-04)" }}
                    >
                      <Icon name="ecosystems" size={19} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="m-0 truncate font-display text-[16px] font-semibold tracking-[-0.01em] text-strong">
                        {e.name}
                      </h2>
                      <p className="m-0 mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                        {e.role}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-subtle pt-3.5">
                    <span className="text-[12.5px] text-faint">
                      {e.members} {e.members === 1 ? "organization" : "organizations"} · joined{" "}
                      {e.joinedAt}
                    </span>
                    <Link
                      href="/ecosystems/manage"
                      className="ndi-plainlink whitespace-nowrap text-[12.5px] text-accent"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <Panel padded={false}>
            <EmptyState
              icon="ecosystems"
              tone={q ? "filtered" : "empty"}
              title={q ? "No ecosystems match that search" : "No ecosystems yet"}
              message={
                q
                  ? "Nothing here matches what you typed."
                  : "An ecosystem lets several organizations govern schemas and trust between them."
              }
              action={
                q ? undefined : (
                  <GradientButton onClick={() => addEcosystem("New ecosystem")}>
                    <Icon name="plus" size={16} strokeWidth={2} />
                    Create ecosystem
                  </GradientButton>
                )
              }
            />
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
