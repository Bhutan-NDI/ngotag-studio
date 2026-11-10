"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { CONNECTED_SYSTEMS, inOrg, requestInFlight } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS, ROUND_TRIP_MS } from "@/lib/demoTiming";
import { namesOf } from "@/lib/sharing";

import { formatDate } from "@/features/controllership/scopeModel";

import { cannotAsk, issuerInline, useHolder, valueFor, withinDays } from "./shared";

/** "sole proprietorships" — the kind of business as running text uses it. */
const KIND_PLURAL: Record<string, string> = { company: "companies", sole_proprietorship: "sole proprietorships", partnership: "partnerships" };

/**
 * SCR-CRD-02 — Ask for a credential. FLOW-CRD-01 step 2: one consent, to
 * share a credential the organisation holds with this issuer, and to receive
 * this one.
 *
 * EVERY ATTRIBUTE, BECAUSE ALL OF IT GOES
 *
 * Each prerequisite is a JSON-LD credential, and those can't be shared in
 * part (EW-FLOW6-SD/D20). An offering can need more than one — the TPN
 * needs the registration and the business licence — and each is shown
 * whole, one after the other. So the screen lists every attribute in it — the
 * address and date of incorporation the issuer doesn't need included — and
 * separately what the issuer says it uses. The tempting version lists only
 * the used items under "what is shared", which reads better and is false.
 * The screen must never claim that only some of it is shared.
 *
 * THE SECOND DECISION, NAMED AT THE FIRST
 *
 * Asking doesn't put anything in the wallet. The issuer decides, may
 * decline, and whatever it sends waits for someone here to accept it. Said
 * now, so that the offer arriving later reads as the expected next step
 * rather than a surprise to be suspicious of (UN-37, UC-27).
 *
 * The store decides whether the request is allowed (P1–P5); the faces
 * below render what it said. E5 has two halves, told apart: a request
 * already in flight goes to its status, a credential already held (and not
 * renewable) to the organisation's credentials.
 *
 * ASKING FOR MORE, BEFORE ANYTHING IS SHARED
 *
 * The prototype's one way to reach A1 is offered here, at ask time, because
 * that's the only time it can happen: a request reaches NEEDS_CONSENT only
 * from AWAITING_PROOF, before the prerequisite is presented (EW-FLOW6-SD
 * §5.1, D10). Once it has been, the request's one use is spent.
 */
type Face =
  | "live"
  | "default"
  | "loading"
  | "submitted"
  | "e3"
  | "not_eligible"
  | "e4"
  | "e5"
  | "e5_held"
  | "offline"
  | "no_permission";

export function AskForCredentialView({ offeringId }: { offeringId: string }) {
  const router = useRouter();
  const { offerings, credentialRequests, askForCredential, simulateAskForMore, hydrated } = useDemo();
  const holder = useHolder();
  const forced = useScreenState("SCR-CRD-02", [
    "live",
    "default",
    "loading",
    "submitted",
    "e3",
    "not_eligible",
    "e4",
    "e5",
    "e5_held",
    "offline",
    "no_permission",
  ]) as Face;

  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refused, setRefused] = useState<"E3" | "E4" | "E5" | "E5_held" | "not_eligible" | "offline" | null>(null);

  const offering = offerings.find((o) => o.id === offeringId);
  const needed = offering?.prerequisites.map((p) => p.credential) ?? [];
  const missing = needed.filter((t) => !holder.held.some((c) => c.type === t));
  const existing = credentialRequests.find((r) => inOrg(holder.orgId)(r) && r.offeringId === offeringId && requestInFlight(r));

  const natural: Face = submitted
    ? "submitted"
    : busy
      ? "loading"
      : refused === "E3" || !offering || offering.status !== "ACTIVE"
        ? "e3"
        : refused === "not_eligible" || !offering.eligibleKinds.includes(holder.kind)
          ? "not_eligible"
        : refused === "E5" || (existing && !submitted)
          ? "e5"
          : refused === "E5_held" || (!offering.renewable && holder.held.some((c) => c.type === offering.credential))
            ? "e5_held"
          : refused === "E4" || missing.length > 0
            ? "e4"
          : refused === "offline"
            ? "offline"
            : !holder.can("credential:receive", offering.credential)
              ? "no_permission"
              : "default";
  const face: Face = forced === "live" ? natural : forced;

  const issuer = offering?.issuerName ?? "The issuer";
  const credential = offering?.credential ?? "this credential";

  const header = (
    <PageHeader
      crumbs={[{ label: "Wallet" }, { label: "Get a credential", href: "/wallet/get" }, { label: credential }]}
      title={`Ask ${issuerInline(issuer)} for your ${credential}`}
    />
  );

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  /* `more` — the stand-in below: the issuer's proof request will ask for
     more than this consent covers (A1), before anything is presented. */
  const ask = (more = false) => {
    if (forced === "offline") {
      setRefused("offline");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const r = askForCredential(offeringId);
      setBusy(false);
      if (r.ok) {
        if (more) simulateAskForMore(r.id);
        setSubmitted(true);
        /* The confirmation, then where it stands — the spec's "Submitted"
           is a moment, not a page to dismiss. */
        window.setTimeout(() => router.push(`/wallet/requests/${r.id}`), ROUND_TRIP_MS);
      } else if (r.error === "E3" || r.error === "E4" || r.error === "E5" || r.error === "E5_held" || r.error === "not_eligible") setRefused(r.error);
    }, LOCAL_MS);
  };

  if (face === "submitted") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <p role="status" className="relative z-[4] m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
              <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
              Asked. Sending your {namesOf(needed) || "credential"} to {issuerInline(issuer)}…
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "e3" || face === "not_eligible" || face === "e4" || face === "e5" || face === "e5_held") {
    /* E4 arrives here only by address — the catalogue doesn't offer Ask
       until the prerequisite is held — so it says what's needed and offers
       the way to get it. */
    const prereq = offerings.find((o) => o.credential === missing[0] && o.status === "ACTIVE");
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="alert" className="m-0 text-[14px] leading-[1.6] text-body">
                {face === "e3"
                  ? `${issuer} isn't offering this at the moment. Nothing has been sent.`
                  : face === "not_eligible"
                    ? `${issuer} doesn't offer this to ${KIND_PLURAL[holder.kind]}. Nothing has been sent.`
                  : face === "e4"
                    ? `To ask for this you first need: ${namesOf(missing) || "another credential"}.`
                    : face === "e5_held"
                      ? "Your organisation already has this."
                      : "You've already asked for this. Here's where it stands."}
              </p>
              <div>
                {face === "e5_held" ? (
                  <GradientButton onClick={() => router.push("/wallet/credentials")}>Go to credentials</GradientButton>
                ) : face === "e5" && existing ? (
                  <GradientButton onClick={() => router.push(`/wallet/requests/${existing.id}`)}>Go to status</GradientButton>
                ) : face === "e5" ? (
                  <GradientButton onClick={() => router.push("/wallet/requests")}>Go to status</GradientButton>
                ) : face === "e4" && prereq ? (
                  <GradientButton onClick={() => router.push(`/wallet/get/${prereq.id}`)}>Get {prereq.credential}</GradientButton>
                ) : (
                  <HairlineButton onClick={() => router.push("/wallet/get")}>Back to the list</HairlineButton>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (!offering) return null;
  const readOnly = face === "no_permission";
  /* For each prerequisite, the one that goes: active, not replaced by a
     newer one, and the newest of those — the same rule the store applies
     when it asks. */
  const going = offering.prerequisites.map((p) => {
    const sendable = holder.held
      .filter((c) => c.type === p.credential && c.status === "active" && !c.supersededBy)
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    return { p, sendable, card: sendable[0] };
  });
  const fast = offering.answering === "api" && Boolean(CONNECTED_SYSTEMS[offering.issuerOrgId]);
  /* Dates are held as ISO strings; everything else reads as it is. */
  const shown = (v: string | null) => (v === null ? "—" : /^\d{4}-\d{2}-\d{2}/.test(v) ? formatDate(v) : v);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            That didn&rsquo;t go through, so nothing was sent. Try again when you&rsquo;re back online.
          </p>
        ) : null}
        {readOnly ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {cannotAsk(holder.rootName)}
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            {/* ---- The exchange, as a picture: what goes, what comes back ----
                One credential out, one in. Every detail of the one going out
                is shown (EW-FLOW6-SD/D20 — all of it is shared), sorted into
                what the issuer says it uses and what goes along anyway, so
                the "used / not used" reading is a glance, not a column of
                labels. Stacked on a phone, share still comes first. */}
            <div className="grid gap-6 min-[761px]:grid-cols-2 min-[761px]:gap-0">
              <section aria-labelledby="ask-share" className="flex min-w-0 flex-col gap-3 min-[761px]:pr-6">
                <h2 id="ask-share" className={LABEL_CLASS}>
                  You share
                </h2>
                {going.map(({ p, sendable, card }, n) => (
                  <div key={p.credential} className={`flex flex-col gap-3 ${n > 0 ? "border-t border-subtle pt-4" : ""}`}>
                    {/* The card Pelden Trading holds, as Held credentials draws it,
                        so "which one goes" is recognised rather than read. */}
                    <div className="flex flex-col gap-1.5">
                      <CredentialCard
                        type={p.credential}
                        issuer={card?.issuer ?? p.issuer}
                        foundational={Boolean(card?.isFoundational)}
                        /* No format pill: "W3C VC" means nothing to the person deciding. */
                        formats={[]}
                      />
                      <p className="m-0 text-[12px] text-faint">
                        {card
                          ? `Received ${formatDate(card.receivedAt)}${sendable.length > 1 ? ` · the newest of your ${sendable.length}` : ""}`
                          : " "}
                      </p>
                    </div>
                    {/* Its details with their values, in the open: what is sent is
                        read before agreeing to send it, not found behind a flip.
                        Grouped by whether the issuer uses them, so the marking is
                        two headings rather than a tag on every row
                        (EW-FLOW6-SD/D20 — all of it goes either way). */}
                    <p className="m-0 text-[13px] leading-[1.5] text-muted">{issuerShort(issuer)} sees everything in it.</p>
                    {[
                      { used: true, title: `Used by ${issuerShort(issuer).toLowerCase()}` },
                      { used: false, title: "Sent, but not used" },
                    ].map((group) => {
                      const rows = p.attributes
                        .filter((a) => p.uses.includes(a) === group.used)
                        .map((a) => ({ label: a, value: shown(card ? valueFor(card.attributes, a) : null) }));
                      return rows.length ? (
                        <div key={group.title} className="flex flex-col gap-1">
                          <p className="m-0 flex items-center gap-2 text-[11.5px] font-semibold text-muted">
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 flex-none rounded-full"
                              style={{ background: group.used ? "var(--ndi-mint)" : "var(--text-faint)" }}
                            />
                            {group.title}
                          </p>
                          <DetailRows rows={rows} quiet={!group.used} />
                        </div>
                      ) : null;
                    })}
                  </div>
                ))}
                <p className="m-0 flex items-center gap-1.5 pt-1 text-[12.5px] text-muted">
                  <Icon name="shieldCheck" size={14} strokeWidth={2} className="flex-none text-accent" />
                  None of your other credentials is shared.
                </p>
              </section>

              {/* A rule between the two rather than a box round each: the two
                  sides are rarely the same height, and a box shows the
                  difference as empty space. */}
              <section
                aria-labelledby="ask-receive"
                className="flex min-w-0 flex-col gap-3 border-t border-subtle pt-6 min-[761px]:border-l min-[761px]:border-t-0 min-[761px]:pl-6 min-[761px]:pt-0"
              >
                <h2 id="ask-receive" className={LABEL_CLASS}>
                  You&rsquo;ll receive, if approved
                </h2>
                {/* Marked as an offer: not held, and not until someone accepts. */}
                <div className="flex flex-col gap-1.5">
                  <CredentialCard type={offering.credential} issuer={issuer} status="offered" formats={[]} />
                  <p className="m-0 text-[12px] text-faint">Not in your wallet yet</p>
                </div>
                <p className="m-0 text-[13px] leading-[1.5] text-muted">
                  {issuerShort(issuer)} fills it in. It will look like this:
                </p>
                {/* The offering's own examples, so the rows read like the
                    ones opposite rather than a list of names. */}
                <DetailRows rows={offering.fields.map((f) => ({ label: f.label, value: f.example ? `e.g. ${f.example}` : "—" }))} quiet />
                <p className="m-0 flex items-center gap-1.5 pt-1 text-[12.5px] text-muted">
                  <Icon name="info" size={14} strokeWidth={2} className="flex-none text-accent" />
                  It arrives as an offer — you choose whether to accept it.
                </p>
              </section>
            </div>

            {/* ---- What happens next, as three steps ----
                The second decision named at the first (UN-37, UC-27). */}
            <section aria-labelledby="ask-next" className="flex flex-col gap-3">
              <h2 id="ask-next" className={LABEL_CLASS}>
                What happens next
              </h2>
              <ol className="m-0 grid list-none gap-2.5 p-0 min-[761px]:grid-cols-3">
                {[
                  { icon: "send" as const, title: "You ask", note: `Your ${namesOf(needed)} ${needed.length > 1 ? "go" : "goes"} to them.` },
                  {
                    icon: "refresh" as const,
                    title: "They check",
                    note: fast
                      ? "Their system checks it and answers in moments. It may decline."
                      : `Usually within ${withinDays(offering.answerWindowDays)}. They may decline.`,
                  },
                  {
                    icon: "check" as const,
                    title: "You decide",
                    note: "Nothing is added until someone here accepts it.",
                  },
                ].map((step) => (
                  <li key={step.title} className="flex items-start gap-3 rounded-[12px] border border-grid px-3.5 py-3">
                    {/* All three alike: this explains what comes, it is not
                        a progress bar with the first step already lit. */}
                    <span
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-accent"
                      style={{ background: "var(--ndi-mint-12)", border: "1px solid var(--ndi-mint-25)" }}
                    >
                      <Icon name={step.icon} size={14} strokeWidth={2.2} />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-display text-[13.5px] font-semibold text-strong">{step.title}</span>
                      <span className="text-[12.5px] leading-[1.45] text-muted">{step.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <div className="flex flex-wrap justify-center gap-2.5 border-t border-subtle pt-4">
              <GradientButton onClick={() => ask()} disabled={readOnly || face === "loading"}>
                {face === "loading" ? "Asking…" : `Ask ${issuerInline(issuer)}`}
              </GradientButton>
              <HairlineButton onClick={() => router.push("/wallet/get")}>Cancel</HairlineButton>
            </div>
          </div>
        </Panel>

        {/* A reviewer's what-if, folded away so it doesn't add to the page. */}
        {forced === "live" && !readOnly ? (
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 font-display text-[12px] font-medium text-faint">
              <Icon name="chevronRight" size={12} strokeWidth={2.2} className="transition-transform duration-200 group-open:rotate-90" />
              Prototype: what if they ask for more?
            </summary>
            <div className="mt-2">
              <SimulatedStep
                standsFor={`${issuer}'s system asking for more than the request said`}
                action={
                  <SimulatedAction onClick={() => ask(true)}>Ask, and have it ask for a bank account too</SimulatedAction>
                }
              >
                An issuer&rsquo;s proof request can ask for more than the business agreed to share. That can only happen
                before anything is shared, and when it does, nothing is sent until someone here answers.
              </SimulatedStep>
            </div>
          </details>
        ) : null}
      </div>
    </AppShell>
  );
}

/** "Department of Revenue & Customs" → "The department", for running text
 *  where the full name has already been said in the heading. */
/** A credential's details as label and value, one per line where there is room. */
function DetailRows({ rows, quiet = false }: { rows: { label: string; value: string }[]; quiet?: boolean }) {
  return (
    <dl className="m-0 flex flex-col rounded-[10px] border border-subtle px-3">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={`grid gap-0.5 py-2 min-[521px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] min-[521px]:gap-3 ${i > 0 ? "border-t border-subtle" : ""}`}
        >
          <dt className="text-[12px] text-faint">{r.label}</dt>
          <dd className={`m-0 text-[13px] ${quiet ? "text-muted" : "font-medium text-strong"}`}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const issuerShort = (name: string) =>
  /^Department/.test(name) ? "The department" : /^Ministry/.test(name) ? "The ministry" : name;
