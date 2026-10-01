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
 * The organizations this account belongs to. One of them is the workspace you
 * are currently in, which the card says outright — switching from here is the
 * same action as switching from the top bar.
 */
export function OrganizationsView() {
  const { organizations, activeOrgId, setActiveOrg } = useDemo();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = organizations.filter((o) => !q || o.name.toLowerCase().includes(q));

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Organizations" }]}
          title="Organizations"
          actions={
            <>
              <SearchField
                className="w-full min-[561px]:w-[280px]"
                placeholder="Search organizations"
                value={query}
                onChange={setQuery}
              />
            </>
          }
        />

        {rows.length ? (
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            {rows.map((o) => {
              const current = o.id === activeOrgId;
              return (
                <Panel key={o.id}>
                  <div className="relative z-[4] flex h-full flex-col gap-3.5">
                    <div className="flex items-start gap-3">
                      <span
                        className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-grid font-display text-[15px] font-semibold text-[var(--text-on-mint)]"
                        style={{ background: "var(--grad-mint)" }}
                      >
                        {o.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="m-0 truncate font-display text-[16px] font-semibold tracking-[-0.01em] text-strong">
                          {o.name}
                        </h2>
                        <p className="m-0 mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                          {o.role}
                        </p>
                      </div>
                      {current ? (
                        <span
                          className="inline-flex flex-none items-center gap-1.5 rounded-full border border-grid px-2.5 py-1 text-[11px] font-medium text-accent"
                          style={{ background: "var(--ndi-mint-08)" }}
                        >
                          <Icon name="check" size={12} strokeWidth={2.4} />
                          Current
                        </span>
                      ) : null}
                    </div>

                    <p className="m-0 text-[13.5px] leading-[1.55] text-muted">
                      {o.description || "No description."}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-3.5">
                      <span className="text-[12.5px] text-faint">
                        {o.members} {o.members === 1 ? "member" : "members"} · {o.createdAt}
                      </span>
                      <span className="flex items-center gap-2.5">
                        {current ? (
                          <Link
                            href="/dashboard/profile"
                            className="ndi-plainlink whitespace-nowrap text-[12.5px] text-accent"
                          >
                            Settings
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveOrg(o.id)}
                            className="ndi-plainlink whitespace-nowrap text-[12.5px] text-accent"
                          >
                            Switch to this
                          </button>
                        )}
                        <span className="text-faint">·</span>
                        <Link
                          href="/users"
                          className="ndi-plainlink whitespace-nowrap text-[12.5px] text-muted"
                        >
                          Members
                        </Link>
                      </span>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        ) : (
          <Panel padded={false}>
            <EmptyState
              icon="building"
              tone={q ? "filtered" : "empty"}
              title={q ? "No organizations match that search" : "No organizations yet"}
              message={
                q
                  ? "Nothing here matches what you typed."
                  : "An organization owns the schemas, credential definitions and connections you issue under. It is registered once, through onboarding, and confirmed by a register."
              }
              action={
                q ? (
                  <HairlineButton onClick={() => setQuery("")}>Clear search</HairlineButton>
                ) : (
                  <Link href="/onboarding">
                    <GradientButton>Register your organisation</GradientButton>
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
