"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * Membership of one ecosystem: who belongs to it and in what role. The lead
 * organization governs; members issue and verify under its trust framework.
 */
export function EcosystemManageView() {
  const { ecosystemMembers, inviteEcosystemMember } = useDemo();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = ecosystemMembers.filter((m) => !q || m.organization.toLowerCase().includes(q));

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Ecosystems", href: "/ecosystems" }, { label: "Manage" }]}
          title="Manage ecosystem"
          actions={
            <GradientButton
              className="h-11"
              onClick={() =>
                inviteEcosystemMember(`Partner org ${ecosystemMembers.length + 1}`)
              }
            >
              <Icon name="plus" size={16} strokeWidth={2} />
              Invite organization
            </GradientButton>
          }
        />

        <Panel padded={false}>
          <Toolbar
            left={<ToolbarCount>{rows.length} member organizations</ToolbarCount>}
            right={
              <SearchField
                className="w-full min-[561px]:w-[280px]"
                placeholder="Search members"
                value={query}
                onChange={setQuery}
              />
            }
          />
          <DataTable
            columns={["Organization", "Role", "Joined on", "Status"]}
            empty={{
              icon: "ecosystems",
              title: "No member organizations",
              message:
                "An ecosystem is a group of organizations issuing and verifying under one trust framework. Invite an organization to start building it.",
              action: (
                <GradientButton
                  onClick={() =>
                    inviteEcosystemMember(`Partner org ${ecosystemMembers.length + 1}`)
                  }
                >
                  <Icon name="plus" size={16} strokeWidth={2} />
                  Invite organization
                </GradientButton>
              ),
            }}
          >
            {rows.length
              ? rows.map((m) => (
                  <tr key={m.id}>
                    <td className="text-strong">{m.organization}</td>
                    <td>{m.role}</td>
                    <td className="text-muted">{m.joinedAt}</td>
                    <td>
                      <StatusPill status={m.status} />
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
