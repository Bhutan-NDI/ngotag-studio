"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { FIELD_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import type { Member } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

const TABS: TabItem[] = [
  { id: "users", label: "Users", icon: "users" },
  { id: "invitations", label: "Invitations", icon: "mail" },
];

const ROLES: Member["role"][] = ["Admin", "Issuer", "Verifier", "Member"];

/**
 * Members of the current organization, split by whether they have joined yet.
 * The two tabs are the same people at different stages, so they share a table
 * shape and differ only in which rows they hold.
 */
export function UsersView() {
  const { members, inviteMember, removeMember } = useDemo();
  const [tab, setTab] = useState("users");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Member["role"]>("Issuer");

  const q = query.trim().toLowerCase();
  const wanted = tab === "users" ? "active" : "invited";
  const rows = members.filter(
    (m) =>
      m.status === wanted &&
      (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)),
  );

  const invite = () => {
    if (!email.includes("@")) return;
    inviteMember({ email: email.trim(), role });
    setEmail("");
    setTab("invitations");
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Organizations", href: "/organizations" }, { label: "Users" }]}
          title="Users"
        />

        <Panel>
          <div className="relative z-[4] flex flex-wrap items-end gap-2.5">
            <label className="flex min-w-[220px] flex-1 flex-col gap-[7px]">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Invite by email
              </span>
              <input
                type="email"
                className={`${FIELD_CLASS} h-11`}
                placeholder="name@organization.bt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && invite()}
              />
            </label>
            <label className="flex flex-col gap-[7px]">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Role
              </span>
              <Select
                label="Role"
                value={role}
                onChange={(v) => setRole(v as Member["role"])}
                options={ROLES.map((r) => ({ value: r, label: r }))}
              />
            </label>
            <GradientButton className="h-11" onClick={invite}>
              Send invite
              <Icon name="send" size={15} strokeWidth={2} />
            </GradientButton>
          </div>
        </Panel>

        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Users and invitations" />

        <Panel padded={false}>
          <Toolbar
            left={
              <ToolbarCount>
                {rows.length} {tab === "users" ? "members" : "pending invitations"}
              </ToolbarCount>
            }
            right={
              <SearchField
                className="w-full min-[561px]:w-[280px]"
                placeholder={tab === "users" ? "Search members" : "Search invitations"}
                value={query}
                onChange={setQuery}
              />
            }
          />
          <DataTable
            columns={["Name", "Email", "Role", "Status", tab === "users" ? "Joined" : "Invited", ""]}
            empty={{
              icon: tab === "users" ? "users" : "mail",
              title: tab === "users" ? "No members yet" : "No pending invitations",
              message:
                tab === "users"
                  ? "Members belong to an organization. Invite the people who will issue and verify alongside you."
                  : "Invitations you send appear here until they are accepted.",
            }}
          >
            {rows.length
              ? rows.map((m) => (
                  <tr key={m.id}>
                    <td className="text-strong capitalize">{m.name}</td>
                    <td className="text-muted">{m.email}</td>
                    <td>{m.role}</td>
                    <td>
                      <StatusPill status={m.status} />
                    </td>
                    <td className="text-muted">{m.joinedAt}</td>
                    <td>
                      {/* The owner is the only account that cannot be removed;
                          an organization with no owner has no one to fix it. */}
                      {m.role === "Owner" ? (
                        <span className="text-[12.5px] text-faint">Owner</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeMember(m.id)}
                          className="ndi-plainlink whitespace-nowrap text-[12.5px] text-muted"
                        >
                          {m.status === "invited" ? "Revoke" : "Remove"}
                        </button>
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
