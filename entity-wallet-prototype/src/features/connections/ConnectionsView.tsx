"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toolbar } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * The channels between this organization and the wallets it deals with. A
 * connection is the precondition for connection-based issuance, so each row
 * offers that as its action rather than making you go back to the issue page.
 */
export function ConnectionsView() {
  const { connections, addConnection } = useDemo();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("desc");

  const q = query.trim().toLowerCase();
  const rows = connections
    .filter((c) => !q || c.label.toLowerCase().includes(q) || c.id.includes(q))
    .slice()
    .sort((a, b) =>
      order === "desc"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt),
    );

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Connections" }]}
          title="Connections"
          actions={
            <GradientButton
              className="h-11"
              onClick={() => addConnection(`Holder ${connections.length + 1}`)}
            >
              <Icon name="plus" size={16} strokeWidth={2} />
              New invitation
            </GradientButton>
          }
        />

        <Panel padded={false}>
          <Toolbar
            left={
              <SearchField
                className="w-full min-[561px]:w-[300px]"
                placeholder="Search connections"
                value={query}
                onChange={setQuery}
              />
            }
            right={
              <>
                <button
                  type="button"
                  aria-label="Refresh connections"
                  className="ndi-iconbtn inline-flex h-11 w-11 items-center justify-center rounded-[10px]"
                >
                  <Icon name="refresh" size={16} strokeWidth={1.8} />
                </button>
                <Select
                  label="Sort order"
                  value={order}
                  onChange={setOrder}
                  options={[
                    { value: "desc", label: "Newest first" },
                    { value: "asc", label: "Oldest first" },
                  ]}
                />
              </>
            }
          />
          <DataTable
            columns={["Holder", "Connection ID", "Status", "Created on", ""]}
            empty={{
              icon: "connections",
              title: q ? "No connections match that search" : "No connections yet",
              message: q
                ? "Nothing here matches what you typed."
                : "A connection is a channel between one of your organizations and a wallet holder. They appear here once a holder scans an invitation.",
            }}
          >
            {rows.length
              ? rows.map((c) => (
                  <tr key={c.id}>
                    <td className="text-strong">{c.label}</td>
                    <td className="font-mono text-[12.5px] text-muted">{c.id}</td>
                    <td>
                      <StatusPill status={c.status} />
                    </td>
                    <td className="text-muted">{c.createdAt}</td>
                    <td>
                      {c.status === "active" ? (
                        <Link
                          href="/credentials/connections/issuance"
                          className="ndi-plainlink whitespace-nowrap text-[12.5px] text-accent"
                        >
                          Issue credential
                        </Link>
                      ) : (
                        <span className="text-[12.5px] text-faint">Awaiting scan</span>
                      )}
                    </td>
                  </tr>
                ))
              : undefined}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
