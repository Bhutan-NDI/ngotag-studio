"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { cancellable, ending, counterpartyName, delegateNameOf, rowLine, stateWords, tabOf, type Tab } from "@/lib/authority";
import type { AuthorityGrant } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { namesOf } from "@/lib/sharing";

import { Notice } from "./shared";

/**
 * SCR-AUT-01 — Authority. FLOW-AUT-01 steps 1 and 16; E1, E2, E14, E15, A2.
 *
 * WHO CAN ACT FOR US, FOR WHAT, UNTIL WHEN
 *
 * One page with three tabs — Active, Waiting, Ended — as UX-EW-04's
 * Sharing page (UX-EW-05 §3.1). A row is one line a Root can read back
 * (UC-41): the person's name, what they may do and where, under which
 * licence, up to what, until when — then its state in words, and who gave
 * it and who approved it. Never a scope string; never the ID number, which
 * nothing keeps.
 *
 * WHO SEES WHAT
 *
 * Anyone whose relation here holds credential:list sees the page (every
 * preset does). *Give authority* and *Cancel* need authority:issue, which
 * only the Root and a *Give authority to act* Controller hold (D21). The
 * store answers both from the relation — never from who the person is in
 * the story — and where *Give authority* can't be offered, its reason
 * takes its place (E1, E2), naming who can.
 *
 * THE HEADING
 *
 * "People who can act for <organisation>" is the specification's, and is
 * also SCR-DEL-05's heading for Flow 3's appointments — two pages under one
 * name (align D1, a docs problem). The nav calls this one *Authority*.
 */
type Face = "live" | "empty" | "loading" | "error" | "offline" | "no_permission" | "not_in_standing" | "first_grant";

export function AuthorityView() {
  const router = useRouter();
  const {
    hydrated,
    authorityGrants,
    organizations,
    activeOrgId,
    personById,
    giveVerdict,
    mayIssueAuthority,
    whoCanGive,
    grantApprovers,
    cancelGrant,
    dismissFirstGrantNotice,
  } = useDemo();
  const forced = useScreenState("SCR-AUT-01", ["live", "empty", "loading", "error", "offline", "no_permission", "not_in_standing", "first_grant"]) as Face;
  const [tab, setTab] = useState<Tab>("active");
  const [cancelled, setCancelled] = useState<string | null>(null);

  const org = organizations.find((o) => o.id === activeOrgId);
  const orgName = org?.name ?? "your organisation";
  const bnsw = counterpartyName({ organizations }, "org-bnsw");
  const grants = forced === "empty" ? [] : authorityGrants.filter((g) => g.orgId === activeOrgId);
  const verdict = hydrated ? giveVerdict() : null;
  const mayCancel = hydrated && mayIssueAuthority();
  const person = (id: string | null | undefined) => (id ? personById(id).name : "Someone");

  /* E1 / E2 — the reason in place of the button. */
  const blocked =
    forced === "no_permission"
      ? { text: `You can't give authority for ${ending(orgName)} ${namesOf(whoCanGive().map(person))} can.` }
      : forced === "not_in_standing"
        ? { text: `${orgName} can't give authority at the moment: its registration isn't valid.` }
        : verdict?.kind === "no_permission"
          ? {
              text: verdict.can.length
                ? `You can't give authority for ${ending(orgName)} ${namesOf(verdict.can.map(person))} can.`
                : `You can't give authority for ${ending(orgName)}`,
            }
          : verdict?.kind === "not_in_standing"
            ? { text: `${orgName} can't give authority at the moment: ${verdict.reason}.` }
            : verdict?.kind === "no_approver"
              ? { text: "Nobody else here can approve authority you give, so you can't give it yet." }
              : null;

  const giveButton = blocked ? null : (
    <Link href="/authority-to-act/give">
      <GradientButton>
        <Icon name="plus" size={15} strokeWidth={2} />
        Give authority
      </GradientButton>
    </Link>
  );

  const counts = {
    active: grants.filter((g) => tabOf(g.status) === "active").length,
    waiting: grants.filter((g) => tabOf(g.status) === "waiting").length,
    ended: grants.filter((g) => tabOf(g.status) === "ended").length,
  };
  const shown = grants.filter((g) => tabOf(g.status) === tab);
  const notice = forced === "first_grant" ? "org-bnsw" : org?.authorityListing?.firstNotice ?? null;

  const cancel = (g: AuthorityGrant) => {
    if (forced !== "live" && forced !== "empty") return;
    const res = cancelGrant(g.id);
    if (res.ok) setCancelled(delegateNameOf(g));
  };

  const empty: Record<Tab, string> = {
    active: `Nobody can act for ${orgName} outside the wallet yet. Give authority to a clearing agent or employee so they can act for you at ${bnsw}.`,
    waiting: "Nothing waiting.",
    ended: "Nothing here yet.",
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Authority" }]} title={`People who can act for ${orgName}`} actions={giveButton} />

        <p className="m-0 max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          People who act for {orgName} from their own Bhutan NDI app — a clearing agent, or an employee — for what, where, and until when. The
          authority is {orgName}&rsquo;s: it stays in force if the person who gave it leaves.
        </p>

        {blocked ? (
          <Notice role="status" tone="warning">
            {blocked.text}
          </Notice>
        ) : null}

        {forced === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}
        {forced === "error" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            We couldn&rsquo;t load this. Try again.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}

        {notice ? (
          <Panel>
            <div className="relative z-[4] flex flex-wrap items-start justify-between gap-3">
              <p className="m-0 flex max-w-[70ch] items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="info" size={15} strokeWidth={2} className="mt-[3px] flex-none text-accent" />
                You&rsquo;ve given authority for the first time. If {orgName} is already registered with {counterpartyName({ organizations }, notice)},
                register again so {counterpartyName({ organizations }, notice)} can recognise authority you give.
              </p>
              <HairlineButton onClick={() => (forced === "live" ? dismissFirstGrantNotice() : undefined)}>Got it</HairlineButton>
            </div>
          </Panel>
        ) : null}

        {cancelled ? (
          <Notice role="status" tone="success">
            Cancelled. The link no longer works. ({cancelled})
          </Notice>
        ) : null}

        <Tabs
          label="Authority given"
          active={tab}
          onChange={(id) => setTab(id as Tab)}
          tabs={[
            { id: "active", label: `Active${counts.active ? ` · ${counts.active}` : ""}` },
            { id: "waiting", label: `Waiting${counts.waiting ? ` · ${counts.waiting}` : ""}` },
            { id: "ended", label: `Ended${counts.ended ? ` · ${counts.ended}` : ""}` },
          ]}
        />

        <Panel padded={false}>
          {!hydrated || forced === "loading" ? (
            <div aria-hidden="true" className="flex flex-col gap-2 p-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-[8px] bg-[rgb(var(--tint)/0.04)]" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            tab === "active" ? (
              <EmptyState icon="send" title="Nobody holds authority yet" message={empty.active} action={giveButton ?? undefined} />
            ) : (
              <p className="m-0 px-5 py-6 text-[13.5px] text-muted">{empty[tab]}</p>
            )
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {shown.map((g, i) => {
                const words = stateWords(g, { person, approvers: grantApprovers(g.id).map(person), org: orgName });
                const waiting = tabOf(g.status) === "waiting";
                return (
                  <li key={g.id} className={`flex flex-col gap-2 px-5 py-4 ${i > 0 ? "border-t border-subtle" : ""}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="m-0 text-[14.5px] font-medium text-strong">
                          {g.delegateName ?? g.name}
                          {!g.delegateName ? <span className="font-normal text-faint"> · not yet collected</span> : null}
                        </p>
                        <p className="m-0 text-[13px] leading-[1.55] text-body">{rowLine({ organizations }, g)}</p>
                        <p className="m-0 text-[12.5px] text-muted">{words.sentence}</p>
                        <p className="m-0 text-[12px] text-faint">
                          Given by {person(g.grantedBy)} on {formatDate(g.submittedAt)}
                          {g.approvedBy ? `, approved by ${person(g.approvedBy)}` : ""}
                        </p>
                      </div>
                      <StatusPill status={words.pill} label={words.label} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/authority-to-act/${g.id}`}
                        aria-label={`Open the authority for ${delegateNameOf(g)}`}
                        className="ndi-plainlink text-[12.5px] font-medium text-accent"
                      >
                        Open
                      </Link>
                      {waiting && mayCancel && cancellable(g) ? (
                        <button
                          type="button"
                          onClick={() => cancel(g)}
                          aria-label={`Cancel the authority for ${delegateNameOf(g)}`}
                          className="ndi-plainlink text-[12.5px] font-medium text-muted"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
