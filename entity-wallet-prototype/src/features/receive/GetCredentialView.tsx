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
import { SearchField } from "@/components/ui/SearchField";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { CONNECTED_SYSTEMS, NDI_ORG, inOrg, requestInFlight, type CredentialOffering } from "@/lib/demoData";
import { namesOf } from "@/lib/sharing";
import { useDemo } from "@/lib/demoStore";

import { cannotAsk, issuerInline, useHolder, withinDays } from "./shared";

/**
 * SCR-CRD-01 — Get a credential. FLOW-CRD-01 step 1: what this business
 * can get next, and from whom.
 *
 * WHAT IT NEEDS, BEFORE ANYONE ASKS
 *
 * Every offering says what the issuer needs to see first. That is the one
 * fact that decides whether asking will go anywhere, and the business should
 * have it before it consents rather than learn it from a refusal (E4). An
 * offering whose prerequisite isn't held stays in the list — knowing a
 * bonded-warehouse authorisation exists, and that the TPN comes first, is
 * the useful answer — but its action becomes the way to get what's missing.
 *
 * REQUESTABLE FIRST
 *
 * Sorted by what can be asked for now, then what needs something first,
 * then what's already held or in flight. A list in issuer order puts the
 * thing someone came for below two they can't use.
 *
 * Badges are read from fixtures — held, in flight — and the decision about
 * whether a request is allowed is the store's on submit (P1–P5). The
 * screen only declines to offer an action it already knows will be refused.
 *
 * WHO ISSUES, BESIDE WHAT
 *
 * A short column beside the list names every organisation on NDI that can
 * issue, with a search, so a business that knows *who* it needs something
 * from — "the ministry" — can start there rather than read every card.
 * Choosing one narrows the list to what that office offers businesses like
 * this one; an office that issues nothing to them yet says so, rather than
 * disappearing. The prototype's addition: UX-EW-03 lists offerings only.
 */
type Face = "live" | "default" | "empty" | "loading" | "error" | "offline" | "no_permission";

export function GetCredentialView() {
  const router = useRouter();
  const { offerings, credentialRequests, organizations, hydrated } = useDemo();
  const holder = useHolder();
  const forced = useScreenState("SCR-CRD-01", ["live", "default", "empty", "loading", "error", "offline", "no_permission"]) as Face;
  const [issuerId, setIssuerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const offered = offerings.filter((o) => o.status === "ACTIVE" && o.covered && o.eligibleKinds.includes(holder.kind));
  const listed = issuerId ? offered.filter((o) => o.issuerOrgId === issuerId) : offered;
  /* Every organisation on NDI that issues, but not this business itself or
     NDI — the ones that offer something to businesses like this first. */
  const issuers = organizations
    .filter((o) => o.capabilities.includes("issuer") && o.id !== NDI_ORG && o.id !== holder.orgId)
    .map((o) => {
      const theirs = offered.filter((x) => x.issuerOrgId === o.id);
      /* Searched by what it is and what it issues, not only its name:
         someone looking for "tax" means the Department of Revenue & Customs. */
      const words = [o.name, o.legalName ?? "", o.description ?? "", ...theirs.map((x) => x.credential)].join(" ").toLowerCase();
      return { id: o.id, name: o.name, count: theirs.length, words };
    })
    .sort((a, b) => Number(b.count > 0) - Number(a.count > 0) || a.name.localeCompare(b.name));
  const q = query.trim().toLowerCase();
  const found = q ? issuers.filter((i) => i.words.includes(q)) : issuers;
  const chosen = issuers.find((i) => i.id === issuerId);
  const natural: Face = !offered.length ? "empty" : !holder.can("credential:receive") ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const mayAsk = face === "default";

  const rows = listed
    .map((o) => {
      const held = holder.held.some((c) => c.type === o.credential);
      const request = credentialRequests.find((r) => inOrg(holder.orgId)(r) && r.offeringId === o.id && requestInFlight(r));
      const missing = o.prerequisites.map((p) => p.credential).filter((t) => !holder.held.some((c) => c.type === t));
      const needs = missing.length > 0;
      const rank = request || (held && !o.renewable) ? 2 : needs ? 1 : 0;
      return { o, held, request, needs, missing, rank };
    })
    .sort((a, b) => a.rank - b.rank);

  const header = <PageHeader crumbs={[{ label: "Wallet" }, { label: "Get a credential" }]} title="What your business can get" />;

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          {[0, 1].map((i) => (
            <div key={i} aria-hidden="true" className="h-40 animate-pulse rounded-[16px] border border-grid" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (face === "empty") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState
              icon="credentials"
              title="Nothing else is available for your type of business yet."
              message="We'll show new credentials here as offices add them."
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {header}
        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Credentials offices on NDI issue to businesses like {holder.name}. You ask; the office checks what you
          share and decides. Nothing is added to your credentials until someone here accepts it.
        </p>

        {face === "error" ? (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            We couldn&rsquo;t load this. Nothing has changed.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </div>
        ) : null}
        {face === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is the list as it was last loaded, and may not be current.
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {cannotAsk(holder.rootName)}
          </p>
        ) : null}

        {face === "error" ? null : (
          <div className="grid items-start gap-5 min-[1000px]:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex min-w-0 flex-col gap-3">
          {chosen ? (
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-body">
              <span>
                Showing what {issuerInline(chosen.name)} offers
              </span>
              <button type="button" onClick={() => setIssuerId(null)} className="ndi-plainlink text-[13px] font-medium text-accent">
                Show every office
              </button>
            </div>
          ) : null}
          {chosen && !rows.length ? (
            <Panel padded={false}>
              <EmptyState
                icon="credentials"
                title={`${chosen.name} doesn't offer anything to businesses like ${holder.name} yet.`}
                message="It's on NDI and can issue, so what it offers will show here when it adds something."
              />
            </Panel>
          ) : null}
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {rows.map(({ o, held, request, needs, missing }) => {
              const prereqOffering = offerings.find((x) => x.credential === missing[0] && x.status === "ACTIVE");
              return (
                <li key={o.id}>
                  <Panel>
                    <div className="relative z-[4] flex flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <h2 className="m-0 font-display text-[17px] font-semibold text-strong">{o.credential}</h2>
                          <p className="m-0 text-[12.5px] text-faint">From {o.issuerName}</p>
                        </div>
                        {request ? (
                          <StatusPill status="requested" label="Requested" />
                        ) : held ? (
                          <StatusPill status="active" label="Held" />
                        ) : needs ? (
                          <StatusPill status="not_set_up" label={`Needs ${missing[0]} first`} />
                        ) : null}
                      </div>
                      <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-body">{o.summary}</p>
                      <dl className="m-0 grid gap-x-6 gap-y-2 min-[641px]:grid-cols-2">
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-[12px] text-faint">What it needs</dt>
                          <dd className="m-0 text-[13px] text-body">
                            {o.issuerName} needs to see your {namesOf(o.prerequisites.map((p) => p.credential))} first.
                          </dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-[12px] text-faint">Answer time</dt>
                          <dd className="m-0 text-[13px] text-body">{answerTime(o)}</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-3">
                        {request ? (
                          <>
                            <p className="m-0 text-[13px] text-body">You&rsquo;ve already asked for this. Here&rsquo;s where it stands.</p>
                            <HairlineButton onClick={() => router.push(`/wallet/requests/${request.id}`)}>Go to status</HairlineButton>
                          </>
                        ) : held && !o.renewable ? (
                          <>
                            <p className="m-0 text-[13px] text-body">Your organisation already has this.</p>
                            <Link href="/wallet/credentials" className="ndi-plainlink text-[13px] font-medium text-muted">
                              Your credentials
                            </Link>
                          </>
                        ) : needs ? (
                          <>
                            <p className="m-0 text-[13px] text-body">To ask for this you first need: {namesOf(missing)}.</p>
                            {prereqOffering && !requestFor(prereqOffering.id) ? (
                              <HairlineButton onClick={() => router.push(`/wallet/get/${prereqOffering.id}`)} disabled={!mayAsk}>
                                Get {prereqOffering.credential}
                              </HairlineButton>
                            ) : null}
                          </>
                        ) : mayAsk ? (
                          <GradientButton onClick={() => router.push(`/wallet/get/${o.id}`)}>
                            Ask for this
                            <Icon name="arrowRight" size={16} strokeWidth={2} />
                          </GradientButton>
                        ) : (
                          <p className="m-0 text-[13px] text-muted">
                            {face === "offline" ? "Asking needs a connection." : cannotAsk(holder.rootName)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Panel>
                </li>
              );
            })}
          </ul>
          </div>

          {/* ---- Who issues on NDI ----
              Beside the list on a wide screen, above it on a narrow one, so
              choosing an office comes before reading what it offers. */}
          <aside aria-labelledby="issuers-title" className="order-first min-[1000px]:sticky min-[1000px]:top-4 min-[1000px]:order-none">
            <Panel padded={false}>
              <div className="relative z-[4] flex flex-col gap-3 p-4">
                <div className="flex flex-col gap-0.5">
                  <h2 id="issuers-title" className="m-0 font-display text-[14.5px] font-semibold text-strong">
                    Offices that issue on NDI
                  </h2>
                  <p className="m-0 text-[12.5px] leading-[1.5] text-muted">Choose one to see what you can ask it for.</p>
                </div>
                <SearchField placeholder="Search offices" label="Search offices that issue" value={query} onChange={setQuery} />
                <ul className="m-0 flex max-h-[232px] list-none flex-col gap-1 overflow-y-auto p-0 min-[1000px]:max-h-[460px]" aria-label="Offices">
                  {!q ? (
                    <li>
                      <IssuerRow name="Every office" note={`${offered.length} to ask for`} on={!issuerId} onClick={() => setIssuerId(null)} all />
                    </li>
                  ) : null}
                  {found.map((i) => (
                    <li key={i.id}>
                      <IssuerRow
                        name={i.name}
                        note={i.count ? `${i.count} to ask for` : "Nothing for you yet"}
                        on={issuerId === i.id}
                        onClick={() => setIssuerId(issuerId === i.id ? null : i.id)}
                      />
                    </li>
                  ))}
                  {!found.length ? (
                    <li className="px-2 py-3 text-[13px] text-muted">No office on NDI matches &ldquo;{query.trim()}&rdquo;.</li>
                  ) : null}
                </ul>
              </div>
            </Panel>
          </aside>
          </div>
        )}
      </div>
    </AppShell>
  );

  function requestFor(offeringId: string) {
    return credentialRequests.some((r) => inOrg(holder.orgId)(r) && r.offeringId === offeringId && requestInFlight(r));
  }
}

/** How long an answer takes: moments, where the office's own system answers; its window otherwise. */
const answerTime = (o: Pick<CredentialOffering, "answering" | "answerWindowDays" | "issuerOrgId">) =>
  o.answering === "api" && CONNECTED_SYSTEMS[o.issuerOrgId]
    ? "Answered by their system, usually in moments"
    : `Usually answered within ${withinDays(o.answerWindowDays)}`;

/** "Ministry of Industry, Commerce & Employment" → "MI" — the office's disc. */
const initialsOf = (name: string) =>
  name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("");

function IssuerRow({ name, note, on, onClick, all = false }: { name: string; note: string; on: boolean; onClick: () => void; all?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-[rgb(var(--tint)/0.05)]"
      style={on ? { background: "var(--ndi-mint-12)", boxShadow: "inset 0 0 0 1px var(--ndi-mint-25)" } : undefined}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full font-mono text-[11px] font-semibold text-accent"
        style={{ background: "var(--ndi-mint-12)", border: "1px solid var(--ndi-mint-25)" }}
      >
        {all ? <Icon name="credentials" size={14} strokeWidth={2} /> : initialsOf(name)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] font-medium leading-[1.35] text-strong">
          {name}
        </span>
        <span className="text-[12px] text-faint">{note}</span>
      </span>
    </button>
  );
}

