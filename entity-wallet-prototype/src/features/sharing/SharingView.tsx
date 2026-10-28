"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs } from "@/components/ui/Tabs";
import { formatDate } from "@/features/controllership/scopeModel";
import { inOrg, type PresentationRequest } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { isLive, onWaiting, statusOf } from "@/lib/sharing";

import { refusedSentence, stateWords } from "./shared";

/**
 * SCR-PRS-05 — Sharing. FLOW-PRS-01 A3, FLOW-PRS-02 steps 3–4 and 9: every
 * request waiting, everything shared, every request refused — one page,
 * three tabs, as UXD-16 did for the authority console.
 *
 * WAITING FIRST, IN WORDS
 *
 * The page opens on what someone could answer, each with who is asking,
 * their reason, the date it must be answered by, and where it stands in a
 * sentence — "Waiting for Dorji Wangchuk to approve" — rather than a status
 * code (§3.4 state in words). Who passed it on is said, because the person
 * it was passed to is reading this to find out why it is theirs.
 *
 * HISTORY ANSWERS THE ROOT'S QUESTION
 *
 * "What did we give the bank, and who agreed?" (§4.3). Each row: the
 * verifier, the date, what was shared, who shared, who approved, and how it
 * ended — without opening the audit trail.
 *
 * REFUSED IS WHERE A BLOCKED REQUEST GOES, AND THE ONLY PLACE
 *
 * A request that failed the checks is never shown as answerable and nobody
 * is told about it (D3, FLOW-PRS-02 E1): telling people would hand anyone
 * who can reach the wallet a way to message the organisation. So the only
 * trace is here, with the name it *claimed*.
 */
type Face = "live" | "default" | "empty" | "loading" | "error" | "offline";
type Tab = "waiting" | "history" | "refused";

export function SharingView() {
  const router = useRouter();
  const {
    presentationRequests,
    activeOrgId,
    personById,
    harness,
    hydrated,
    whoApproves,
    simulateIncomingRequest,
    resolveRegistryCheck,
    remindUndecided,
  } = useDemo();
  const forced = useScreenState("SCR-PRS-05", ["live", "default", "empty", "loading", "error", "offline"]) as Face;
  const [tab, setTab] = useState<Tab>("waiting");

  const mine = presentationRequests.filter(inOrg(activeOrgId));
  /* A request held while NDI's list is checked is on Waiting only if it
     came from a website, whose person was told to look here (E8); one that
     arrived on a connection stays unlisted until it passes (E2). */
  const waiting = mine.filter(onWaiting);
  const history = mine.filter((r) => !isLive(statusOf(r)) && statusOf(r) !== "BLOCKED");
  const refused = mine.filter((r) => statusOf(r) === "BLOCKED");

  const natural: Face = mine.length ? "default" : "empty";
  const face: Face = forced === "live" ? natural : forced;
  const show = face === "empty" ? { waiting: [], history: [], refused: [] } : { waiting, history, refused };

  const person = (id: string | null | undefined) => (id ? personById(id).name : "Someone");
  const words = (r: PresentationRequest) =>
    stateWords(r, { person, approvers: statusOf(r) === "AWAITING_APPROVAL" ? whoApproves(r.id).map((id) => personById(id).name) : [] });

  const header = (
    <PageHeader
      crumbs={[{ label: "Wallet" }, { label: "Sharing" }]}
      title="Sharing"
      actions={waiting.length && face !== "empty" ? <StatusPill status="open" label={`${waiting.length} waiting`} /> : null}
    />
  );

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <div aria-hidden="true" className="h-64 animate-pulse rounded-[16px] border border-grid" />
        </div>
      </AppShell>
    );
  }

  if (face === "error") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            We couldn&rsquo;t load this. Nothing has changed.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const checking = mine.filter((r) => statusOf(r) === "RECEIVED");
  /* Website requests nobody has decided, not yet announced as left undecided (A3). */
  const undecided = mine.filter((r) => r.sessionId && statusOf(r) === "OPEN" && !r.undecidedToldAt);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="status" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is how things stood when it was last loaded, and may not be current.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}

        <p className="m-0 max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          What banks and agencies have asked your organisation for, what it has shared and who agreed, and the requests
          NDI refused on your behalf.
        </p>

        <div>
          <Tabs
            label="Sharing"
            active={tab}
            onChange={(id) => setTab(id as Tab)}
            tabs={[
              { id: "waiting", label: `Waiting${show.waiting.length ? ` (${show.waiting.length})` : ""}`, icon: "bell" },
              { id: "history", label: "History", icon: "fileText" },
              { id: "refused", label: "Refused", icon: "shieldAlert" },
            ]}
          />
        </div>

        {tab === "waiting" ? (
          show.waiting.length ? (
            <ul aria-live="polite" className="m-0 flex list-none flex-col gap-3 p-0">
              {show.waiting.map((r) => {
                const w = words(r);
                const st = statusOf(r);
                const canApprove = st === "AWAITING_APPROVAL" && r.initiatedBy !== harness.persona && whoApproves(r.id).includes(harness.persona);
                return (
                  <li key={r.id}>
                    <Panel>
                      <div className="relative z-[4] flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 max-w-[68ch] flex-col gap-1.5">
                          <p className="m-0 text-[14.5px] font-medium text-strong">{r.verifierName}</p>
                          <p className="m-0 text-[13px] leading-[1.55] text-muted">
                            {r.verifierName}&rsquo;s reason: &ldquo;{r.purpose}&rdquo;
                          </p>
                          <p className="m-0 flex flex-wrap items-center gap-2 text-[13px] text-body">
                            <StatusPill status={w.status} label={w.label} />
                            {w.sentence}
                          </p>
                          {st !== "OPEN" ? <p className="m-0 text-[12.5px] text-faint">Answer by {formatDate(r.expiresAt)}</p> : null}
                          {r.repeatOf ? <p className="m-0 text-[12.5px] text-muted">{r.verifierName} has asked again.</p> : null}
                          {r.passedBy?.length ? (
                            <p className="m-0 text-[12.5px] text-muted">Passed on by {r.passedBy.map(person).join(", ")}</p>
                          ) : null}
                          {st === "OPEN" && r.rejection ? (
                            <p className="m-0 text-[12.5px] text-muted">
                              {person(r.rejection.by)} didn&rsquo;t approve sharing this{r.rejection.note ? `: ${r.rejection.note.replace(/\.$/, "")}.` : "."}
                            </p>
                          ) : null}
                          {st === "OPEN" && r.lapsedSharer ? (
                            <p className="m-0 text-[12.5px] text-muted">{person(r.lapsedSharer)} can no longer share this, so it hasn&rsquo;t been sent.</p>
                          ) : null}
                        </div>
                        {st === "OPEN" ? (
                          <GradientButton onClick={() => router.push(`/wallet/sharing/${r.id}`)}>Answer</GradientButton>
                        ) : canApprove ? (
                          <GradientButton onClick={() => router.push(`/wallet/sharing/${r.id}/approve`)}>Approve</GradientButton>
                        ) : st === "AWAITING_APPROVAL" ? (
                          <HairlineButton onClick={() => router.push(`/wallet/sharing/${r.id}`)}>Open</HairlineButton>
                        ) : null}
                      </div>
                    </Panel>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Panel padded={false}>
              <EmptyState icon="bell" title="No one is asking for anything right now." message="When a bank or agency asks your organisation for something, it waits here until someone answers." />
            </Panel>
          )
        ) : null}

        {tab === "history" ? (
          show.history.length ? (
            <Panel padded={false}>
              <DataTable columns={["Organisation", "Date", "What was shared", "Shared by", "Approved by", "Outcome"]}>
                {show.history.map((r) => {
                  const w = words(r);
                  const st = statusOf(r);
                  return (
                    <tr key={r.id}>
                      <td className="text-body">
                        {r.verifierName}
                        <span className="block max-w-[32ch] text-[12px] text-faint">&ldquo;{r.purpose}&rdquo;</span>
                      </td>
                      <td>{formatDate(st === "SHARED" || st === "DECLINED" ? (r.decidedAt ?? r.receivedAt) : st === "EXPIRED" ? r.expiresAt : r.receivedAt)}</td>
                      <td>{st === "SHARED" ? r.asked.map((d) => d.credentialType).join(", ") : "Nothing"}</td>
                      <td>{st === "SHARED" ? person(r.initiatedBy ?? r.decidedBy) : "—"}</td>
                      <td>{st === "SHARED" ? (r.approvedBy ? person(r.approvedBy) : "No approval needed") : "—"}</td>
                      <td>
                        <span className="flex flex-col items-start gap-1">
                          <StatusPill status={w.status} label={w.label} />
                          <span className="max-w-[40ch] text-[12.5px] leading-[1.5] text-muted">
                            {st === "EXPIRED"
                              ? `This request from ${r.verifierName} expired on ${formatDate(r.expiresAt)}. Nothing was shared.`
                              : st === "WITHDRAWN"
                                ? `${r.verifierName} cancelled this request. Nothing has been shared.`
                                : (r.failure ?? w.sentence)}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </DataTable>
            </Panel>
          ) : (
            <Panel padded={false}>
              <EmptyState
                icon="fileText"
                title="Your organisation hasn't shared anything yet."
                message="When a bank or agency asks, it will appear here."
              />
            </Panel>
          )
        ) : null}

        {tab === "refused" ? (
          show.refused.length ? (
            <Panel padded={false}>
              <DataTable columns={["Claimed to be from", "Date", "Why it was refused"]}>
                {show.refused.map((r) => (
                  <tr key={r.id}>
                    <td className="text-body">{r.verifierName}</td>
                    <td>{formatDate(r.receivedAt)}</td>
                    <td className="max-w-[60ch] text-[12.5px] leading-[1.5] text-muted">{refusedSentence(r)}</td>
                  </tr>
                ))}
              </DataTable>
            </Panel>
          ) : (
            <Panel padded={false}>
              <EmptyState icon="shieldCheck" title="Nothing has been refused." message="Requests NDI refuses on your behalf are listed here. Nobody is notified about them." />
            </Panel>
          )
        ) : null}

        {face !== "offline" ? (
          <SimulatedStep
            standsFor="other organisations' systems sending requests"
            action={
              <>
                <SimulatedAction onClick={() => simulateIncomingRequest("bank_recheck")}>Bank of Bhutan asks on its connection</SimulatedAction>
                <SimulatedAction onClick={() => simulateIncomingRequest("untrusted")}>A sender not on NDI&rsquo;s list asks</SimulatedAction>
                <SimulatedAction onClick={() => simulateIncomingRequest("registry_down")}>A request arrives while NDI&rsquo;s list can&rsquo;t be reached</SimulatedAction>
                {checking.map((r) => (
                  <SimulatedAction key={r.id} onClick={() => resolveRegistryCheck(r.id)}>
                    NDI&rsquo;s list answers for {r.verifierName}
                  </SimulatedAction>
                ))}
                {undecided.map((r) => (
                  <SimulatedAction key={`u-${r.id}`} onClick={() => remindUndecided(r.id)}>
                    Ten minutes pass with {r.verifierName}&rsquo;s request undecided
                  </SimulatedAction>
                ))}
              </>
            }
          >
            A bank re-checking a customer, or an agency checking bidders, sends its request to the wallet with nobody at a
            website. A request from a sender NDI doesn&rsquo;t list is refused and goes only to <strong>Refused</strong>; one
            that arrives while NDI&rsquo;s list can&rsquo;t be reached is held and checked again — it isn&rsquo;t listed, and
            nobody is told, until it passes. Asking again while one is waiting makes a second request, marked as a repeat. A
            request opened from a website and left undecided for ten minutes is announced to the others who may answer it.
          </SimulatedStep>
        ) : null}

        <p className="m-0 text-[12.5px] text-faint">
          Looking for credentials offered to you? They&rsquo;re under{" "}
          <Link href="/wallet/requests" className="ndi-plainlink text-muted">
            Requests and offers
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}
