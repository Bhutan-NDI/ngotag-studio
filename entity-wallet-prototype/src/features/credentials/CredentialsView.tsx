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

const METHOD_LABEL: Record<string, string> = {
  connection: "Connection",
  email: "Email",
  qr: "QR code",
  bulk: "Bulk",
};

/**
 * The issuance ledger: every credential this organization has offered and what
 * became of it. An offered credential is still actionable — the demo lets you
 * settle it either way from the row, which is what the holder's wallet would
 * otherwise do.
 */
export function CredentialsView() {
  const { credentials, setCredentialState } = useDemo();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("desc");

  const q = query.trim().toLowerCase();
  const rows = credentials
    .filter(
      (c) =>
        !q || c.holder.toLowerCase().includes(q) || c.schemaName.toLowerCase().includes(q),
    )
    .slice()
    .sort((a, b) =>
      order === "desc" ? b.issuedAt.localeCompare(a.issuedAt) : a.issuedAt.localeCompare(b.issuedAt),
    );

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Credentials" }]}
          title="Credentials"
          actions={
            <Link href="/credentials/issue">
              <GradientButton className="h-11">
                <Icon name="issue" size={16} strokeWidth={2} />
                Issue credential
              </GradientButton>
            </Link>
          }
        />

        <Panel padded={false}>
          <Toolbar
            left={
              <SearchField
                className="w-full min-[561px]:w-[300px]"
                placeholder="Search credentials"
                value={query}
                onChange={setQuery}
              />
            }
            right={
              <Select
                  label="Sort order"
                  value={order}
                  onChange={setOrder}
                  options={[
                    { value: "desc", label: "Newest first" },
                    { value: "asc", label: "Oldest first" },
                  ]}
                />
            }
          />
          <DataTable
            columns={["Holder", "Schema", "Definition", "Method", "Status", "Issued on", ""]}
            empty={{
              icon: "credentials",
              title: q ? "No credentials match that search" : "No credentials issued yet",
              message: q
                ? "Nothing here matches what you typed. Clear the search to see the full ledger."
                : "Issued credentials and their state appear here once you issue against a credential definition.",
              action: q ? undefined : (
                <Link href="/credentials/issue">
                  <GradientButton>
                    <Icon name="issue" size={16} strokeWidth={2} />
                    Issue credential
                  </GradientButton>
                </Link>
              ),
            }}
          >
            {rows.length
              ? rows.map((c) => (
                  <tr key={c.id}>
                    <td className="text-strong">{c.holder}</td>
                    <td>{c.schemaName}</td>
                    <td className="text-muted">{c.credDefTag}</td>
                    <td className="text-muted">{METHOD_LABEL[c.method] ?? c.method}</td>
                    <td>
                      <StatusPill status={c.state} />
                    </td>
                    <td className="text-muted">{c.issuedAt}</td>
                    <td>
                      {/* Offered is the only state with anything left to do; the
                          rest are settled and get no controls. */}
                      {c.state === "offered" ? (
                        <span className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCredentialState(c.id, "accepted")}
                            className="ndi-plainlink whitespace-nowrap text-[12.5px] text-accent"
                          >
                            Mark accepted
                          </button>
                          <span className="text-faint">·</span>
                          <button
                            type="button"
                            onClick={() => setCredentialState(c.id, "declined")}
                            className="ndi-plainlink whitespace-nowrap text-[12.5px] text-muted"
                          >
                            Decline
                          </button>
                        </span>
                      ) : c.state === "accepted" ? (
                        <button
                          type="button"
                          onClick={() => setCredentialState(c.id, "revoked")}
                          className="ndi-plainlink whitespace-nowrap text-[12.5px] text-muted"
                        >
                          Revoke
                        </button>
                      ) : null}
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
