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
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { useDemo } from "@/lib/demoStore";

/**
 * Invitations this account has received to join someone else's organization —
 * the opposite direction from the invitations an organization sends, which
 * live under Users. Same word, so the copy has to carry the difference.
 */
export function InvitationsView() {
  const { invitations, respondToInvitation } = useDemo();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = invitations.filter((i) => !q || i.organization.toLowerCase().includes(q));
  const pending = invitations.filter((i) => i.state === "pending").length;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Invitations" }]} title="Invitations" />

        <Panel padded={false}>
          <Toolbar
            left={
              <ToolbarCount>
                {pending} pending {pending === 1 ? "invitation" : "invitations"}
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
          <DataTable
            columns={["Organization", "Invited by", "Role", "Received on", "Status", ""]}
            empty={{
              icon: "mail",
              title: q ? "No invitations match that search" : "No invitations",
              message: q
                ? "Nothing here matches what you typed."
                : "When another organization invites you to join, the invitation lands here for you to accept or decline.",
            }}
          >
            {rows.length
              ? rows.map((i) => (
                  <tr key={i.id}>
                    <td className="text-strong">{i.organization}</td>
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
                            onClick={() => respondToInvitation(i.id, "accepted")}
                          >
                            Accept
                          </GradientButton>
                          <HairlineButton
                            className="h-9 px-3 text-[12.5px]"
                            onClick={() => respondToInvitation(i.id, "declined")}
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
        </Panel>
      </div>
    </AppShell>
  );
}
