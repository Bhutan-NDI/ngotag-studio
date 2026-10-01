"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { PendingInvitations } from "./PendingInvitations";

/**
 * Members of the organisation — FLOW-ONB-02's Kind M home, and the entry to
 * SCR-INV-01 and SCR-INV-03.
 *
 * TWO COLUMNS THAT MUST NEVER BE READ AS ONE
 *
 * "Role" is membership: who can sign in and see the organisation. "Authority
 * to act" is controllership: who may bind it, granted separately and
 * accepted (Flow 3). Membership is routinely mistaken for authority — the
 * reason FLOW-ONB-02 Q4 and UXD-04 exist — so they sit side by side and a
 * member with no authority says so in words, rather than leaving an empty
 * cell for someone to read as "not relevant".
 *
 * Identity is a third, separate fact. A person who joined by invitation has
 * not been checked against the register — anchoring happens when someone
 * takes on accountability, not when they join (Flow 1 design D3) — and act 2
 * will refuse to grant them authority until it has.
 */
export function MembersView() {
  const { people, relations, orgInvitations, organizations, activeOrgId, currentPerson } = useDemo();

  const forced = useScreenState("SCR-INV-03", ["default", "loading", "empty", "offline", "read_only"]);

  const org = organizations.find((o) => o.id === activeOrgId);
  const members = people.filter((p) => p.memberRole);
  const canInvite =
    forced !== "read_only" &&
    (currentPerson.memberRole === "Owner" || currentPerson.memberRole === "Admin");

  const pending =
    forced === "empty"
      ? []
      : orgInvitations.filter(
          (i) =>
            i.kind === "M" &&
            i.orgId === activeOrgId &&
            (i.state === "PENDING" || i.state === "PENDING_APPROVAL"),
        );

  const authorityOf = (personId: string) => {
    const r = relations.find((rel) => rel.personId === personId && rel.state === "ACTIVE");
    if (!r) return null;
    return r.isRootAuthority ? "Root authority" : "Controller";
  };

  const inviteButton = canInvite ? (
    <Link href="/members/invite">
      <GradientButton>
        <Icon name="plus" size={15} strokeWidth={2} />
        Invite someone
      </GradientButton>
    </Link>
  ) : undefined;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Members" }]} title={`Members of ${org?.name ?? "the organisation"}`} actions={inviteButton} />

        <p className="max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          Everyone who can sign in and see this organisation. Being a member does not let anyone
          act for it — that is a separate authority, granted and accepted under Controllership.
        </p>

        <Panel padded={false}>
          {forced === "loading" ? (
            <div aria-hidden="true" className="flex flex-col gap-2 p-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-[8px] bg-[rgb(var(--tint)/0.04)]" />
              ))}
            </div>
          ) : (
            <DataTable columns={["Member", "Role", "Identity", "Authority to act"]}>
              {members.map((m) => {
                const authority = authorityOf(m.id);
                return (
                  <tr key={m.id}>
                    <td>
                      <span className="flex flex-col">
                        <span className="text-body">{m.name}</span>
                        <span className="text-[12px] text-faint">{m.email}</span>
                      </span>
                    </td>
                    <td className="text-body">{m.memberRole}</td>
                    <td>
                      <StatusPill
                        status={m.cidVerified ? "verified" : "pending"}
                        label={m.cidVerified ? "Identity confirmed" : "Not yet confirmed"}
                      />
                    </td>
                    <td>
                      {authority ? (
                        <Link href="/controllership/relations" className="ndi-plainlink text-body">
                          {authority}
                        </Link>
                      ) : (
                        <span className="text-muted">None — membership only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </Panel>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[16px] font-semibold text-strong">Invitations waiting</h2>
          <Panel padded={false}>
            {forced === "loading" ? (
              <div aria-hidden="true" className="h-24 animate-pulse" />
            ) : (
              <PendingInvitations
                rows={pending}
                kind="M"
                readOnly={!canInvite}
                offline={forced === "offline"}
                emptyAction={inviteButton}
              />
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
