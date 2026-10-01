"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { useDemo } from "@/lib/demoStore";

const TABS: TabItem[] = [
  { id: "received", label: "Received", icon: "mail" },
  { id: "sent", label: "Sent", icon: "send" },
];

/**
 * Invitations to join an ecosystem, in both directions.
 *
 * Received and sent share a tab strip rather than a page each: they are the
 * same relationship seen from either end, and keeping them together is what
 * makes it obvious which end you are on.
 */
export function EcosystemInvitationsView() {
  const { ecosystemInvitations, ecosystemMembers, respondToEcosystemInvitation } = useDemo();
  const [tab, setTab] = useState("received");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const received = ecosystemInvitations.filter((i) => !q || i.ecosystem.toLowerCase().includes(q));
  const sent = ecosystemMembers.filter(
    (m) => m.status === "invited" && (!q || m.organization.toLowerCase().includes(q)),
  );
  const pending = ecosystemInvitations.filter((i) => i.state === "pending").length;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Ecosystems", href: "/ecosystems" }, { label: "Invitations" }]}
          title="Ecosystem invitations"
        />

        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Invitation direction" />

        <Panel padded={false}>
          <Toolbar
            left={
              <ToolbarCount>
                {tab === "received"
                  ? `${pending} pending`
                  : `${sent.length} awaiting a response`}
              </ToolbarCount>
            }
            right={
              <SearchField
                className="w-full min-[561px]:w-[280px]"
                placeholder="Search invitations"
                value={query}
                onChange={setQuery}
              />
            }
          />

          {tab === "received" ? (
            <DataTable
              columns={["Ecosystem", "Invited by", "Role", "Received on", "Status", ""]}
              empty={{
                icon: "mail",
                title: q ? "No invitations match that search" : "No invitations received",
                message: q
                  ? "Nothing here matches what you typed."
                  : "When an ecosystem lead invites this organization to join, the invitation lands here.",
              }}
            >
              {received.length
                ? received.map((i) => (
                    <tr key={i.id}>
                      <td className="text-strong">{i.ecosystem}</td>
                      <td className="text-muted">{i.invitedBy}</td>
                      <td>{i.role}</td>
                      <td className="text-muted">{i.receivedAt}</td>
                      <td>
                        <StatusPill status={i.state} />
                      </td>
                      <td>
                        {i.state === "pending" ? (
                          <span className="flex items-center gap-2">
                            <GradientButton
                              className="h-9 px-3 text-[12.5px]"
                              onClick={() => respondToEcosystemInvitation(i.id, "accepted")}
                            >
                              Accept
                            </GradientButton>
                            <HairlineButton
                              className="h-9 px-3 text-[12.5px]"
                              onClick={() => respondToEcosystemInvitation(i.id, "declined")}
                            >
                              Decline
                            </HairlineButton>
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))
                : undefined}
            </DataTable>
          ) : (
            <DataTable
              columns={["Organization", "Role", "Invited on", "Status"]}
              empty={{
                icon: "send",
                title: q ? "No invitations match that search" : "Nothing awaiting a response",
                message: q
                  ? "Nothing here matches what you typed."
                  : "Organizations you invite to your ecosystem appear here until they accept.",
              }}
            >
              {sent.length
                ? sent.map((m) => (
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
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
