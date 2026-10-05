"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { StatusPill } from "@/components/ui/StatusPill";
import { Stepper } from "@/components/ui/Stepper";
import { Toolbar } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { ISSUE_STEPS } from "./issueSteps";

/**
 * Pick which existing holder to issue to. Only active connections can receive
 * an offer — an invited one has not been accepted yet, so there is no channel
 * to send down — and the row says so rather than failing later.
 */
export function ConnectionPickerView() {
  const { connections } = useDemo();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = connections.filter((c) => !q || c.label.toLowerCase().includes(q));

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Credentials", href: "/credentials" },
            { label: "Issue", href: "/credentials/issue" },
            { label: "Connection" },
          ]}
          title="Choose a connection"
        />

        <Stepper steps={ISSUE_STEPS} current={0} />

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
          />
          <DataTable
            columns={["Holder", "Connection ID", "Status", "Connected on", ""]}
            empty={{
              icon: "connections",
              title: q ? "No connections match that search" : "No connections yet",
              message: q
                ? "Nothing here matches what you typed."
                : "Connection-based issuance needs an existing channel. Invite a holder, or issue by QR code instead.",
              action: q ? undefined : (
                <Link href="/credentials/issue/connection-oob">
                  <GradientButton>
                    <Icon name="verify" size={16} strokeWidth={2} />
                    Issue by QR code
                  </GradientButton>
                </Link>
              ),
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
                          href={`/credentials/connections/issuance?connection=${encodeURIComponent(c.id)}`}
                          className="ndi-plainlink inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] text-accent"
                        >
                          Select
                          <Icon name="arrowRight" size={14} strokeWidth={2} />
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
