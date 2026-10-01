"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { PendingInvitations } from "@/features/invitations/PendingInvitations";

/**
 * The platform admin's invitations — SCR-INV-03 for Kind O, and the way into
 * SCR-INV-01 for it.
 *
 * Split into what is still open and what is settled, because the settled
 * list is the record of who brought each root of trust onto the platform and
 * who approved it — the dual-control evidence FLOW-ONB-02 keeps permanently —
 * and mixing it with the live ones would bury the few that need a hand.
 */
export function AdminInvitationsView() {
  const { orgInvitations } = useDemo();
  const forced = useScreenState("SCR-INV-03-O", ["default", "loading", "empty", "offline"]);

  const kindO = orgInvitations.filter((i) => i.kind === "O");
  const open =
    forced === "empty" ? [] : kindO.filter((i) => i.state === "PENDING" || i.state === "PENDING_APPROVAL");
  const settled = kindO.filter((i) => i.state !== "PENDING" && i.state !== "PENDING_APPROVAL");

  const inviteButton = (
    <Link href="/admin/invitations/new">
      <GradientButton>
        <Icon name="plus" size={15} strokeWidth={2} />
        Bring an organisation on
      </GradientButton>
    </Link>
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "NDI administration" }, { label: "Invitations" }]} title="Organisation invitations" actions={inviteButton} />
        <p className="max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          Organisations that cannot sign up for themselves — the authorities other organisations
          depend on — are brought on by invitation. A foundational issuer takes two administrators:
          one to propose it and a different one to approve it.
        </p>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[16px] font-semibold text-strong">Open</h2>
          <Panel padded={false}>
            {forced === "loading" ? (
              <div aria-hidden="true" className="h-24 animate-pulse" />
            ) : (
              <PendingInvitations rows={open} kind="O" offline={forced === "offline"} emptyAction={inviteButton} />
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[16px] font-semibold text-strong">Settled</h2>
          <Panel padded={false}>
            <PendingInvitations rows={settled} kind="O" readOnly />
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
