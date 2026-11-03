"use client";

import Link from "next/link";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { NDI_SERVICE_PRINCIPAL, roleIn, type OrgInvitation } from "@/lib/demoData";
import { formatDate } from "@/features/controllership/scopeModel";
import { presetOf, presetsOf } from "@/features/appointment/presets";
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
 *
 * NDI'S SERVICE ACCOUNT IS LISTED HERE
 *
 * A designated authority's owner granted it membership (FLOW-ORG-02 step
 * 2 / A2), and SCR-DSG-03 promised it would appear here and could be
 * removed from here without asking NDI (Q6). Remove calls the same store
 * action as "Remove NDI's access" on the authority console and SCR-ADO-04
 * — one control, one end state (EW-FLOW5-SD §4.4, E8).
 */
export function MembersView() {
  const { people, relations, orgInvitations, organizations, activeOrgId, currentPerson, designations, personById, setNdiAccess } =
    useDemo();
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState(false);

  const forced = useScreenState("SCR-INV-03", ["default", "loading", "empty", "delivery_failed", "offline", "read_only"]);

  const org = organizations.find((o) => o.id === activeOrgId);
  /* This organisation's members, each at the role they hold *here* (roleIn).
     It used to be everyone with a role anywhere, which on a
     multi-organisation platform (AC-10) is somebody else's staff. */
  const members = people
    .filter((p) => p.hasAccount !== false && roleIn(org, p))
    .map((p) => ({ ...p, role: roleIn(org, p) }));
  const myRole = roleIn(org, currentPerson);
  const canInvite = forced !== "read_only" && (myRole === "Owner" || myRole === "Admin");
  /* The designation whose grant put NDI's service account here, if any. */
  const dsg = designations.find((x) => x.orgId === activeOrgId && (x.state === "ACTIVE" || x.state === "SUSPENDED") && x.ndiAccess !== null);
  const canRemove = myRole === "Owner" && forced !== "read_only" && forced !== "offline";

  const live = orgInvitations.filter(
    (i) => i.kind === "M" && i.orgId === activeOrgId && (i.state === "PENDING" || i.state === "PENDING_APPROVAL"),
  );
  /* E8 is only ever seen here, and on a first day nothing has bounced — so
     the state switcher shows one bounced invitation for review, rather than
     leaving the one failure this list exists to surface unreachable. */
  const bounced: OrgInvitation = {
    id: "inv-review-bounce",
    kind: "M",
    email: "tashi.dema@pelden-trading.bt",
    orgId: activeOrgId,
    role: "Member",
    legalName: null,
    legalIdentity: null,
    purpose: null,
    needsSecondApproval: false,
    invitedBy: currentPerson.id,
    approvedBy: null,
    createdAt: live[0]?.createdAt ?? new Date().toISOString().slice(0, 10),
    sentAt: new Date().toISOString().slice(0, 10),
    expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
    state: "PENDING",
    delivery: "failed",
    decidedAt: null,
    acceptedName: null,
  };
  const pending =
    forced === "empty" ? [] : forced === "delivery_failed" && !live.some((i) => i.delivery === "failed") ? [bounced, ...live] : live;

  /* Membership and authority side by side: what each person may do for the
     organisation — an appointment they accepted — and an appointment still
     waiting on them, so the owner can see it is not yet in force. Authority
     given to act from someone's own Bhutan NDI app isn't listed here: that
     person needs no account and isn't a member (EW-FLOW8-SD D10); it is on
     the Authority page. */
  const authorityOf = (personId: string) => {
    const r = relations.find((rel) => rel.personId === personId && rel.state === "ACTIVE");
    if (r) return r.isRootAuthority ? "Representative" : `Can act · ${presetsOf(r).map((id) => presetOf(id)?.label).join(", ") || "set individually"}`;
    const waiting = relations.some((rel) => rel.personId === personId && rel.state === "PENDING_ACCEPTANCE");
    return waiting ? "Appointed — waiting for them to accept" : null;
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
          act for it — that is given separately, and accepted by the person, under People who can act.
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
                    <td className="text-body">{m.role}</td>
                    <td>
                      <StatusPill
                        status={m.cidVerified ? "verified" : "pending"}
                        label={m.cidVerified ? "Identity confirmed" : "Not yet confirmed"}
                      />
                    </td>
                    <td>
                      {authority ? (
                        <Link
                          href="/people-who-can-act"
                          className="ndi-plainlink text-body"
                        >
                          {authority}
                        </Link>
                      ) : (
                        <span className="text-muted">None — membership only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {dsg?.ndiAccess === "ACTIVE" ? (
                <tr>
                  <td>
                    <span className="flex flex-col">
                      <span className="text-body">{NDI_SERVICE_PRINCIPAL}</span>
                      <span className="text-[12px] text-faint">
                        Added by {dsg.ndiGrant ? `${personById(dsg.ndiGrant.by).name}, ${formatDate(dsg.ndiGrant.at)}` : "your organisation's owner"}
                      </span>
                    </span>
                  </td>
                  <td className="text-body">Service account</td>
                  <td>
                    <StatusPill status="not_set_up" label="Not a person" />
                  </td>
                  <td>
                    <span className="flex flex-wrap items-center gap-3">
                      <span className="text-body">Sends only the request you approved, in your name</span>
                      {canRemove ? <HairlineButton onClick={() => setRemoving(true)}>Remove</HairlineButton> : null}
                    </span>
                  </td>
                </tr>
              ) : null}
            </DataTable>
          )}
        </Panel>
        {dsg?.ndiAccess === "REMOVED" ? (
          <p role="status" className="m-0 max-w-[70ch] text-[13px] leading-[1.6] text-body">
            {removed
              ? "NDI's service account can no longer send requests in your name. What you've agreed stays agreed."
              : `NDI's service account was removed${dsg.ndiAccessChangedAt ? ` on ${formatDate(dsg.ndiAccessChangedAt)}` : ""}${dsg.ndiAccessChangedBy ? ` by ${personById(dsg.ndiAccessChangedBy).name}` : ""}. It can no longer send in your name.`}{" "}
            <Link href="/authority" className="ndi-plainlink font-medium text-accent">
              Turn it back on from your authority console
            </Link>
          </p>
        ) : null}

        {dsg ? (
          <Dialog
            open={removing}
            onClose={() => setRemoving(false)}
            tone="danger"
            title="Remove NDI's service account?"
            lead="It will no longer be able to send requests in your name — from this moment. What you've agreed stays agreed, and you can turn it back on."
            consequences={["Businesses can't verify with you while it's removed", "Businesses already verified are not affected"]}
            confirmLabel="Remove"
            onConfirm={() => {
              const r = setNdiAccess(dsg.id, false);
              setRemoving(false);
              if (r.ok) setRemoved(true);
            }}
          />
        ) : null}

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
                compactEmpty
              />
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
