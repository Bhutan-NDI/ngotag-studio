"use client";

import Link from "next/link";

import { GradientButton } from "@/components/ui/GradientButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDemo } from "@/lib/demoStore";

import { daysLeft, kindsInWords } from "./shared";

/**
 * The organisation dashboard's way into SCR-DSG-03 and the authority
 * console — "notification to the organisation's OWNER; organisation
 * dashboard" (UX-EW-02 §3.2). A pending designation is always reachable
 * from here with its days left, never only from an email (§3.4, SC 2.2.1);
 * and once designated with nothing adopted, the dashboard says nothing is
 * live yet, because "designated" is easily read as "working".
 *
 * And it is where the authority is told when NDI withdraws a designation it
 * had been asked to accept (FLOW-ORG-02 A3) — with NDI's reason, never a
 * silent disappearance.
 */
export function DesignationNotice() {
  const { designations, adoptions, activeOrgId } = useDemo();
  const now = new Date().toISOString().slice(0, 10);
  const d = designations.find(
    (x) => x.orgId === activeOrgId && (x.state === "PENDING" || x.state === "ACCEPTED" || x.state === "ACTIVE"),
  );
  const withdrawn = designations.find(
    (x) => x.orgId === activeOrgId && x.state === "WITHDRAWN" && (x.withdrawnFrom === "PENDING" || x.withdrawnFrom === "ACCEPTED"),
  );
  if (!d && withdrawn) {
    return (
      <Panel>
        <div className="relative z-[4] flex flex-col gap-1.5">
          <StatusPill status="withdrawn" label="Withdrawn by NDI" />
          <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">
            NDI has withdrawn this designation: {withdrawn.withdrawnReason ?? "no reason was recorded"}.
          </p>
          <Link href="/legal/support" className="ndi-plainlink text-[13px] font-medium text-accent">
            Contact NDI
          </Link>
        </div>
      </Panel>
    );
  }
  if (!d || (d.state === "PENDING" && d.expiresAt && d.expiresAt < now)) return null;
  /* Kind N's step 2: accepted, and NDI's access is the owner's to grant. */
  const toGrant = d.state === "ACCEPTED" && !d.ndiGrant;
  const anyLive = adoptions.some((a) => a.designationId === d.id && a.state === "ACTIVE");
  if (d.state === "ACTIVE" && anyLive) return null;

  const body =
    d.state === "PENDING"
      ? `NDI has proposed that ${d.orgName} act as the authority that confirms ${kindsInWords(d.entityTypes)}. ${daysLeft(d.expiresAt)} days left to decide.`
      : toGrant
        ? "You've accepted. One thing is left that only you can do: let NDI's service account ask in your name."
        : d.state === "ACCEPTED"
        ? "You've accepted. NDI is finishing switching it on."
        : "You're designated, but nothing is live in your name yet. People can't verify with you until you agree what they'll be asked.";
  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-3 min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between">
        <div className="flex flex-col gap-1.5">
          <StatusPill
            status={d.state === "PENDING" ? "pending_acceptance" : d.state === "ACCEPTED" ? "pending" : "not_set_up"}
            label={d.state === "PENDING" ? "Waiting for you" : d.state === "ACCEPTED" ? "Being switched on" : "Nothing live yet"}
          />
          <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">{body}</p>
        </div>
        <Link href={d.state === "PENDING" || toGrant ? `/designation/${d.id}` : "/authority"} className="flex-none">
          <GradientButton>{d.state === "PENDING" || toGrant ? "Review it" : "Go to your authority console"}</GradientButton>
        </Link>
      </div>
    </Panel>
  );
}
