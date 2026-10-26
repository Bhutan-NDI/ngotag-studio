"use client";

import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { QrPlaceholder } from "@/components/ui/QrPlaceholder";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { formatDate } from "@/features/controllership/scopeModel";
import { digitsOnly, orgName, taskLabel, tasksPhrase } from "@/lib/authority";
import {
  AMEND,
  BNSW,
  COPY,
  REQUEST_MS,
  actingSentence,
  citizenOf,
  grouped,
  heldAuthorities,
  registrationOf,
  timeOf,
} from "@/lib/bnsw";
import { PELDEN, SIM_CITIZENS, type AuthoritySession, type BnswCheck, type DeclarationDraft } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";
import { namesOf } from "@/lib/sharing";

import { BnswFrame, BnswMessage, Fact } from "./shared";

/**
 * SCR-AUT-07 — Act for a company, on the Bhutan National Single Window's
 * website (UX-EW-06; FLOW-AUT-02 steps 1–3 and 11–15, E1–E15, A2–A4).
 *
 * ONE PRESENTATION, THEN A SESSION
 *
 * The person signs in to BNSW as themselves — BNSW's own Bhutan NDI
 * sign-in, unchanged — and chooses *Act for a company*. BNSW asks for the
 * citizen credential and an authority in one proof request; the app shares
 * both in one presentation (SCR-AUT-08, a dashed panel here). NDI's
 * client-service checks V1–V6, BNSW checks B0–B4, and an *authority
 * session* opens. Declarations after that need no trip to the app: each is
 * a status lookup and the limit, at submission (EW-FLOW9-SD D5, D6). That
 * replaces the page before the specification, which sent every declaration
 * to the wallet and rendered a signed PASS or FAIL.
 *
 * THE COMPANY'S DETAILS ARE SHOWN, NEVER ASKED FOR (UXD-52)
 *
 * Name, TPN and licence come from the company's registration with BNSW —
 * there is no consignee field, and nothing the person types can mismatch
 * (D11). Where the authority names several registered licences that are
 * ACTIVE, A2 asks which one each declaration is under; nothing else is a
 * choice.
 *
 * EVERY REFUSAL SAYS WHY AND WHO CAN FIX IT
 *
 * UX-EW-06 §3.5's copy, word for word, from `lib/bnsw.ts`. A refusal at
 * submit keeps the draft (UXD-54). The store decides; this page renders.
 *
 * WHAT BNSW SEES
 *
 * The records panel below the site shows BNSW's back end: the
 * registration, the session — with the person's name and citizen ID
 * number, which BNSW does receive (§4.2) — and what it keeps with each
 * declaration. The company is told nothing (D7).
 */
const FACES = [
  "live",
  "signed_out",
  "default",
  "waiting",
  "checking",
  "acting",
  "choose_licence",
  "resumed",
  "refused_E2",
  "refused_E3",
  "refused_E4",
  "refused_E5",
  "refused_E5_citizen",
  "refused_E6",
  "refused_E6_citizen",
  "refused_E7",
  "refused_E8",
  "refused_E9",
  "refused_E10",
  "refused_E11",
  "refused_E15",
  "not_submitted_E7",
  "not_submitted_E9",
  "not_submitted_E12",
  "not_submitted_E13",
  "ended_E14",
  "offline",
] as const;

type Phase = "signed_out" | "default" | "waiting" | "checking" | "acting";

interface Notice {
  code: string;
  text: string;
  checks: BnswCheck[];
}

export function ActForCompanyView() {
  const demo = useDemo();
  const {
    hydrated,
    counterpartyDeclarations,
    organizations,
    bnswSignIn,
    bnswSignOut,
    bnswActForCompany,
    bnswCancelRequest,
    bnswAnswer,
    bnswSaveDraft,
    bnswSubmit,
    bnswStopActing,
    bnswDismissNotice,
    bnswTick,
  } = demo;
  const face = useScreenState("SCR-AUT-07", FACES);
  const live = face === "live";

  /* "Checking…" is the page waiting on client-service and on B0–B4 — the
     answer comes from the store once the pause is over. */
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  /* The five-minute request and the session's end are the store's to apply. */
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(bnswTick, 5000);
    return () => window.clearInterval(t);
  }, [live, bnswTick]);

  if (!hydrated || now === 0) return <BnswFrame>{null}</BnswFrame>;

  /* ---- What to render: the store, or a switcher face built from Pelden and Pema ---- */
  const model = live ? liveModel(demo, checking) : fixtureModel(face, now);
  const { phase, signedIn, session, notice, draft } = model;
  const company = session ? orgName({ organizations }, session.orgId) : orgName({ organizations }, PELDEN);
  const registration = session ? demo.counterpartyRegistrations.find((r) => r.id === session.registrationId) ?? registrationOf(demo, session.orgId) : registrationOf(demo, PELDEN);

  const share = (answer: Parameters<typeof bnswAnswer>[0]) => {
    if (!live) return;
    if (answer.kind !== "share") {
      bnswAnswer(answer);
      return;
    }
    setChecking(true);
    window.setTimeout(() => {
      bnswAnswer(answer);
      setChecking(false);
    }, ROUND_TRIP_MS);
  };

  const mine = session
    ? counterpartyDeclarations.filter((d) => d.counterpartyId === BNSW && d.orgId === session.orgId && d.delegateCid === session.delegateCid)
    : [];

  return (
    <BnswFrame signedIn={signedIn?.name ?? null} onSignOut={live && signedIn ? bnswSignOut : undefined}>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[22px] font-semibold leading-[1.2] tracking-[-0.01em] text-strong">
          {phase === "acting" ? `Acting for ${company}` : "Customs declarations"}
        </h1>
        {phase === "signed_out" ? (
          <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-muted">Sign in to declare, for yourself or for a company.</p>
        ) : null}
      </div>

      {model.offline ? (
        <BnswMessage tone="warning" role="alert">
          <span>{COPY.offline}</span>
          <span>
            <HairlineButton className="!h-9 !px-3.5 !text-[13px]">Retry</HairlineButton>
          </span>
        </BnswMessage>
      ) : null}

      {notice && notice.text ? (
        <BnswMessage tone={notice.code === "accepted" ? "success" : notice.code === "A4" || notice.code === "stopped" ? "info" : "warning"} role={notice.code.startsWith("E") ? "alert" : "status"}>
          <span>{notice.text}</span>
          {live && (notice.code === "accepted" || notice.code === "A4" || notice.code === "stopped") ? (
            <button type="button" onClick={bnswDismissNotice} className="ndi-plainlink self-start text-[12.5px] text-muted">
              Dismiss
            </button>
          ) : null}
        </BnswMessage>
      ) : null}

      {/* ---- Signed out: BNSW's own sign-in ---- */}
      {phase === "signed_out" ? (
        <SimulatedStep
          standsFor="BNSW's own sign-in with Bhutan NDI, which this flow doesn't change"
          action={
            <>
              {SIM_CITIZENS.map((c) => (
                <SimulatedAction key={c.cid} onClick={() => (live ? bnswSignIn(c.cid) : undefined)}>
                  Sign in as {c.name}
                </SimulatedAction>
              ))}
            </>
          }
        >
          BNSW knows the person signed in by their citizen ID — what B0 later checks the shared authority against. Pema Choden holds Pelden&rsquo;s
          authority; the others let you try someone else answering, or someone holding none.
        </SimulatedStep>
      ) : null}

      {/* ---- Default: nobody acting for anyone ---- */}
      {phase === "default" ? (
        <section className="flex flex-col items-start gap-3 rounded-[12px] border border-grid px-4 py-5">
          <p className="m-0 text-[14px] leading-[1.6] text-body">{COPY.empty}</p>
          <GradientButton onClick={() => (live ? bnswActForCompany() : undefined)}>
            <Icon name="userCheck" size={15} strokeWidth={2} />
            {notice && ["E12", "E14", "stopped"].includes(notice.code)
              ? "Act for a company again"
              : notice && ["E2", "E3", "E7"].includes(notice.code)
                ? "Try again"
                : "Act for a company"}
          </GradientButton>
          {draft ? <p className="m-0 text-[12.5px] text-faint">Your draft declaration is kept and will be there when you act for the company again.</p> : null}
        </section>
      ) : null}

      {/* ---- Waiting for the app (steps 2–4) ---- */}
      {phase === "waiting" ? (
        <section className="flex flex-col gap-4 rounded-[12px] border border-grid px-4 py-5 min-[641px]:flex-row min-[641px]:items-start">
          <div className="w-[168px] flex-none">
            <QrPlaceholder value={model.requestId} />
          </div>
          <div className="flex min-w-0 flex-col gap-2.5">
            <h2 className="m-0 font-display text-[16px] font-semibold text-strong">Scan with your Bhutan NDI app</h2>
            <p className="m-0 max-w-[56ch] text-[13.5px] leading-[1.6] text-muted">
              Your app will ask you to share your citizen ID and your authority to act for a company, together. On this phone? Open the request in
              the app instead.
            </p>
            <p role="status" className="m-0 text-[13px] text-body">
              {remaining(model.requestStartedAt, now)}
            </p>
            <span>
              <HairlineButton className="!h-10 !px-4 !text-[13.5px]" onClick={() => (live ? bnswCancelRequest() : undefined)}>
                Cancel
              </HairlineButton>
            </span>
          </div>
        </section>
      ) : null}

      {phase === "checking" ? (
        <section role="status" className="flex items-center gap-3 rounded-[12px] border border-grid px-4 py-5">
          <Icon name="refresh" size={18} strokeWidth={2} className="animate-spin text-accent" />
          <span className="flex flex-col">
            <span className="font-display text-[14px] font-semibold text-strong">Checking…</span>
            <span className="text-[12.5px] text-muted">Your authority, your citizen ID, and the company&rsquo;s registration and licence.</span>
          </span>
        </section>
      ) : null}

      {/* ---- Acting for (step 11 on) ---- */}
      {phase === "acting" && session ? (
        <>
          <section className="flex flex-col gap-4 rounded-[12px] border border-grid px-4 py-5" aria-label={`Acting for ${company}`}>
            <p role="status" className="m-0 font-display text-[16px] font-semibold leading-[1.45] text-strong">
              {actingSentence({ organizations }, session, now)}
            </p>
            <dl className="m-0 grid gap-3 min-[641px]:grid-cols-3">
              <Fact label="Company">{registration?.legalName ?? company}</Fact>
              <Fact label="TPN">{registration?.tpn ?? "—"}</Fact>
              <Fact label={session.licenceNumbers.length > 1 ? "Licences" : "Licence"}>{namesOf(session.licenceNumbers)}</Fact>
              <Fact label="You can">{tasksPhrase(session.tasks).replace(/^./, (c) => c.toUpperCase())}</Fact>
              <Fact label="Limit">Nu {grouped(session.valueCapNu)} per declaration</Fact>
              <Fact label="Until">{timeOf(session.endsAt, now)}</Fact>
              <Fact label="You">
                {session.delegateName}
                {session.authorityName !== session.delegateName ? (
                  <span className="block text-[12.5px] text-faint">Named in the authority as {session.authorityName}</span>
                ) : null}
              </Fact>
            </dl>
            <p className="m-0 text-[12.5px] leading-[1.55] text-faint">
              The company&rsquo;s name, TPN and licence are from its registration with BNSW. You don&rsquo;t enter them.
            </p>
            <span>
              <HairlineButton className="!h-10 !px-4 !text-[13.5px]" onClick={() => (live ? bnswStopActing() : undefined)}>
                Stop acting for {company}
              </HairlineButton>
            </span>
          </section>

          <DeclarationForm
            session={session}
            company={company}
            consignee={{ name: registration?.legalName ?? company, tpn: registration?.tpn ?? "—" }}
            draft={draft}
            live={live}
            onChange={bnswSaveDraft}
            onSubmit={bnswSubmit}
            amending={draft?.amends ? counterpartyDeclarations.find((d) => d.id === draft.amends)?.reference ?? null : null}
          />

          {mine.length ? (
            <section className="flex flex-col gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Your declarations for {company}</h2>
              <ul className="m-0 flex list-none flex-col p-0">
                {mine.map((d, i) => (
                  <li key={d.id} className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 ${i ? "border-t border-subtle" : ""}`}>
                    <span className="font-mono text-[12.5px] text-body">{d.reference}</span>
                    <span className="min-w-0 flex-1 text-[13px] text-muted">
                      {d.goods} · Nu {grouped(d.valueNu)} · licence {d.licenceNumber}
                      {d.amends ? ` · amends ${counterpartyDeclarations.find((x) => x.id === d.amends)?.reference ?? ""}` : ""}
                    </span>
                    <StatusPill status={d.amendedBy ? "replaced" : "accepted"} label={d.amendedBy ? "Amended" : "Accepted"} />
                    {/* A3 — Amend only where the authority includes it. */}
                    {session.tasks.includes(AMEND) && !d.amendedBy ? (
                      <button
                        type="button"
                        className="ndi-plainlink text-[12.5px] text-muted"
                        onClick={() =>
                          live ? bnswSaveDraft({ goods: d.goods, value: String(d.valueNu), licence: d.licenceNumber, amends: d.id }) : undefined
                        }
                      >
                        Amend
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

      {live ? <AppPanel phase={phase} share={share} /> : null}
      {live ? <Elsewhere /> : null}
      <Records notice={notice} session={session} />
    </BnswFrame>
  );
}

/* ------------------------------------------------------------------ */

function remaining(startedAt: number, now: number): string {
  const left = Math.max(0, REQUEST_MS - (now - startedAt));
  const m = Math.floor(left / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return `${m}:${String(s).padStart(2, "0")} left to share from the app`;
}

interface Model {
  phase: Phase;
  signedIn: { cid: string; name: string } | null;
  session: AuthoritySession | null;
  notice: Notice | null;
  draft: DeclarationDraft | null;
  requestId: string | null;
  requestStartedAt: number;
  offline?: boolean;
}

function liveModel(demo: ReturnType<typeof useDemo>, checking: boolean): Model {
  const b = demo.bnsw;
  const citizen = citizenOf(b.signedInCid);
  const session = b.signedInCid
    ? demo.authoritySessions.find((x) => x.status === "OPEN" && x.signedInCid === b.signedInCid && x.counterpartyId === BNSW) ?? null
    : null;
  const phase: Phase = !citizen ? "signed_out" : checking ? "checking" : session ? "acting" : b.request ? "waiting" : "default";
  return {
    phase,
    signedIn: citizen ? { cid: citizen.cid, name: citizen.name } : null,
    session,
    notice: b.notice,
    draft: b.draft,
    requestId: b.request?.id ?? null,
    requestStartedAt: b.request?.startedAt ?? 0,
  };
}

/**
 * The switcher's faces, built from the story's own people — Pema acting
 * for Pelden under its Phuentsholing licence — so every state in UX-EW-06's
 * table can be reviewed without driving into it. Read-only: nothing here
 * calls the store.
 */
function fixtureModel(face: string, now: number): Model {
  const pema = { cid: "11512002960", name: "Pema Choden" };
  const company = "Pelden Trading Pvt. Ltd.";
  const session: AuthoritySession = {
    id: "as-fixture",
    counterpartyId: BNSW,
    signedInCid: pema.cid,
    delegateDid: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
    delegateName: pema.name,
    delegateCid: pema.cid,
    authorityName: pema.name,
    orgId: PELDEN,
    registrationId: "reg-pelden-bnsw",
    principalDid: "did:ethr:bt:0x3b7e90c4d12a58f6e0b9a41c7d2e85f3a6c01d94",
    relationId: "g-pema",
    tasks: ["nsw:submit-declaration", "nsw:amend-declaration"],
    licenceNumbers: face === "choose_licence" ? ["BL-PLG-2025-00871", "BL-THI-2026-10442"] : ["BL-PLG-2025-00871"],
    valueCapNu: 1000000,
    perTransaction: true,
    authorityRevocationId: "7f2c9e14-5a3b-4d8e-9c61-0b4a2f7d83e5",
    citizenRevocationId: "11512002-c17e-4a0d-9b52-115120029600",
    validUntil: new Date(now + 59 * 86_400_000).toISOString().slice(0, 10),
    endsAt: now + 6 * 3_600_000,
    checkedAt: now,
    status: "OPEN",
    endedAt: null,
    endReason: null,
  };
  const base: Model = { phase: "default", signedIn: pema, session: null, notice: null, draft: null, requestId: null, requestStartedAt: now };
  const draft: DeclarationDraft = { goods: "Steel roofing sheets, 14 pallets", value: "1200000", licence: "BL-PLG-2025-00871", amends: null };
  const n = (code: string, text: string): Notice => ({ code, text, checks: [] });
  const ended = new Date(now - 86_400_000).toISOString();
  const refusals: Record<string, string> = {
    refused_E2: COPY.E2,
    refused_E3: COPY.E3,
    refused_E4: COPY.E4(company),
    refused_E5: COPY.E5(company),
    refused_E5_citizen: COPY.E5citizen,
    refused_E6: COPY.E6(company, formatDate(ended)),
    refused_E6_citizen: COPY.E6citizen,
    refused_E7: COPY.E7,
    refused_E8: COPY.E8(company),
    refused_E9: COPY.E9(company, taskLabel("nsw:submit-declaration").toLowerCase()),
    refused_E10: COPY.E10(company),
    refused_E11: COPY.E11(company, "BL-PLG-2025-00871"),
    refused_E15: COPY.E15,
  };
  if (face === "signed_out") return { ...base, phase: "signed_out", signedIn: null };
  if (face === "waiting") return { ...base, phase: "waiting", requestId: "pr-fixture", requestStartedAt: now - 72_000 };
  if (face === "checking") return { ...base, phase: "checking" };
  if (face === "acting" || face === "choose_licence") return { ...base, phase: "acting", session, draft: face === "choose_licence" ? { ...draft, value: "640000", licence: "" } : null };
  if (face === "resumed") return { ...base, phase: "acting", session, notice: n("A4", COPY.A4(company, timeOf(session.endsAt, now))) };
  if (face in refusals) return { ...base, notice: n(face.replace("refused_", "").replace("_citizen", "citizen"), refusals[face]) };
  if (face === "not_submitted_E7") return { ...base, phase: "acting", session, draft, notice: n("E7", COPY.E7) };
  if (face === "not_submitted_E9")
    return { ...base, phase: "acting", session: { ...session, tasks: ["nsw:submit-declaration"] }, draft: { ...draft, value: "380000", amends: "dcl-84137" }, notice: n("E9", COPY.E9(company, taskLabel(AMEND).toLowerCase())) };
  if (face === "not_submitted_E13") return { ...base, phase: "acting", session, draft, notice: n("E13", COPY.E13(grouped(1000000), company)) };
  if (face === "not_submitted_E12") return { ...base, draft, notice: n("E12", COPY.E12(company, `${company} has withdrawn it`)) };
  if (face === "ended_E14") return { ...base, draft, notice: n("E14", COPY.E14(company, "needs to be shared again")) };
  if (face === "offline") return { ...base, phase: "acting", session, draft, offline: true };
  return base;
}

/* ------------------------------------------------------------------ */
/* BNSW's declaration form                                             */
/* ------------------------------------------------------------------ */

function DeclarationForm({
  session,
  company,
  consignee,
  draft,
  live,
  onChange,
  onSubmit,
  amending,
}: {
  session: AuthoritySession;
  company: string;
  consignee: { name: string; tpn: string };
  draft: DeclarationDraft | null;
  live: boolean;
  onChange: (d: DeclarationDraft | null) => void;
  onSubmit: () => void;
  amending: string | null;
}) {
  const d: DeclarationDraft = draft ?? { goods: "", value: "", licence: "", amends: null };
  const set = (patch: Partial<DeclarationDraft>) => (live ? onChange({ ...d, ...patch }) : undefined);
  const several = session.licenceNumbers.length > 1;

  return (
    <section className="flex flex-col gap-4 rounded-[12px] border border-grid px-4 py-5">
      <h2 className="m-0 font-display text-[15px] font-semibold text-strong">{amending ? `Amend ${amending}` : "New declaration"}</h2>

      <dl className="m-0 grid gap-3 rounded-[10px] border border-subtle px-3.5 py-3 min-[641px]:grid-cols-2">
        <Fact label="Importer">{consignee.name}</Fact>
        <Fact label="TPN">{consignee.tpn}</Fact>
        {!several ? <Fact label="Licence">{session.licenceNumbers[0]}</Fact> : null}
        <Fact label="Declared by">
          {session.delegateName}, for {company}
        </Fact>
      </dl>

      {/* A2 — several registered licences, ACTIVE, named by the authority. */}
      {several ? (
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className={`${LABEL_CLASS} mb-1.5`}>{COPY.A2}</legend>
          {session.licenceNumbers.map((n) => (
            <label key={n} className="flex items-center gap-2.5 text-[13.5px] text-body">
              <input type="radio" name="licence" value={n} checked={d.licence === n} onChange={() => set({ licence: n })} />
              {n}
            </label>
          ))}
        </fieldset>
      ) : null}

      <div className="grid gap-4 min-[641px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <label className={FIELD_BLOCK_CLASS}>
          <span className={LABEL_CLASS}>Goods</span>
          <input className={`${FIELD_CLASS} h-11`} value={d.goods} onChange={(e) => set({ goods: e.target.value })} placeholder="What is being imported" />
        </label>
        <label className={FIELD_BLOCK_CLASS}>
          <span className={LABEL_CLASS}>Declared value (Nu)</span>
          <input className={`${FIELD_CLASS} h-11`} inputMode="numeric" value={d.value} onChange={(e) => set({ value: digitsOnly(e.target.value) })} />
          <span className="text-[12px] text-faint">Your limit for {company} is Nu {grouped(session.valueCapNu)} per declaration.</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <GradientButton onClick={() => (live ? onSubmit() : undefined)} disabled={!d.value || (several && !d.licence)}>
          <Icon name="send" size={15} strokeWidth={2} />
          {amending ? "Submit amendment" : "Submit declaration"}
        </GradientButton>
        {amending ? (
          <HairlineButton onClick={() => (live ? onChange(null) : undefined)}>Don&rsquo;t amend</HairlineButton>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SCR-AUT-08 — the Bhutan NDI app, simulated                          */
/* ------------------------------------------------------------------ */

/**
 * The app's proof-request screen is the app team's (UX-EW-06 SCR-AUT-08),
 * so it is a dashed panel saying what the app must show — who is asking,
 * each matching authority by company name with its tasks, licences, limit
 * and end date (A1, UXD-55), and that the citizen ID goes in the same step —
 * and the answers the person, or someone else, could give.
 */
function AppPanel({ phase, share }: { phase: Phase; share: (a: Parameters<ReturnType<typeof useDemo>["bnswAnswer"]>[0]) => void }) {
  const demo = useDemo();
  const cid = demo.bnsw.signedInCid;
  const held = cid ? heldAuthorities(demo, cid) : [];
  const [chosen, setChosen] = useState<string | null>(null);
  if (phase !== "waiting" || !cid) return null;
  const pick = held.find((g) => g.id === chosen) ?? held.find((g) => g.status === "ACTIVE") ?? held[0] ?? null;
  const citizen = citizenOf(cid);
  /* Someone else holding an authority — for a relayed code (E15). */
  const others = SIM_CITIZENS.filter((c) => c.cid !== cid)
    .map((c) => ({ c, g: heldAuthorities(demo, c.cid).find((x) => x.status === "ACTIVE") }))
    .filter((x) => x.g);

  return (
    <SimulatedStep
      standsFor={`${citizen?.name ?? "the person"}'s Bhutan NDI app — the app team's screen (SCR-AUT-08)`}
      action={
        <>
          {pick ? (
            <SimulatedAction onClick={() => share({ kind: "share", grantId: pick.id, answeredBy: cid })}>Share</SimulatedAction>
          ) : null}
          <SimulatedAction onClick={() => share({ kind: "decline" })}>Decline</SimulatedAction>
          <SimulatedAction onClick={() => share({ kind: "timeout" })}>Let five minutes pass</SimulatedAction>
          {pick ? (
            <SimulatedAction onClick={() => share({ kind: "share", grantId: pick.id, answeredBy: cid, copied: true })}>
              A copied authority, signed with another key
            </SimulatedAction>
          ) : null}
          {others.map(({ c, g }) => (
            <SimulatedAction key={c.cid} onClick={() => share({ kind: "share", grantId: g!.id, answeredBy: c.cid })}>
              {c.name} scans the code and shares instead
            </SimulatedAction>
          ))}
        </>
      }
    >
      <div className="flex flex-col gap-2.5 text-body">
        <p className="m-0 text-[13px]">
          <span className="text-faint">Who is asking:</span> Bhutan National Single Window
        </p>
        {held.length ? (
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-1 text-[12.5px] text-faint">Authority to share — choose one</legend>
            {held.map((g) => (
              <label key={g.id} className="flex items-start gap-2.5 text-[13px] leading-[1.5]">
                <input type="radio" name="app-authority" className="mt-1" checked={pick?.id === g.id} onChange={() => setChosen(g.id)} />
                <span>
                  <span className="font-medium text-strong">{orgName(demo, g.orgId)}</span> — {tasksPhrase(g.tasks)}, under licence{" "}
                  {namesOf(g.licenceNumbers)}, up to Nu {grouped(g.valueCapNu)} per declaration, until {formatDate(g.validUntil)}
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="m-0 text-[13px]">
            No authority to share — the app says so in its own words, and that authority comes from the company (E1). BNSW only sees the request
            time out.
          </p>
        )}
        <p className="m-0 text-[12.5px] text-muted">Your citizen ID is shared with it, in the same step.</p>
      </div>
    </SimulatedStep>
  );
}

/* ------------------------------------------------------------------ */
/* Things that happen elsewhere                                        */
/* ------------------------------------------------------------------ */

/**
 * What the prototype can't reach, by hand: the company withdrawing or
 * pausing the authority (catalogue flow 11, unspecified), the ministry
 * suspending a licence, NDI's services going down, the citizen ID being
 * suspended, BNSW's sign-in running out, and coming back to BNSW later.
 * A withdrawal is at NDI's revocation service at once; DA-CORE's target is
 * within 60 seconds of the action, and the prototype shows it on BNSW's
 * very next check.
 */
function Elsewhere() {
  const demo = useDemo();
  const { bnsw: b, bnswSimulate, simulateAuthorityStatus, simulateLicenceRevoked, bnswComeBack, heldCredentials } = demo;
  const cid = b.signedInCid;
  if (!cid) return null;
  const session = demo.authoritySessions.find((x) => x.status === "OPEN" && x.signedInCid === cid && x.counterpartyId === BNSW) ?? null;
  const held = heldAuthorities(demo, cid);
  const g = (session ? demo.authorityGrants.find((x) => x.id === session.relationId) : null) ?? held.find((x) => x.status === "ACTIVE" || x.status === "SUSPENDED") ?? null;
  const citizen = citizenOf(cid);
  const company = g ? orgName(demo, g.orgId) : null;
  const licences = g
    ? g.licenceNumbers.filter((n) => heldCredentials.some((c) => c.attributes.some((a) => a.name === "licence_number" && a.value === n) && c.status === "active"))
    : [];
  const suspended = b.suspendedCitizens.includes(cid);

  return (
    <SimulatedStep
      standsFor="things that happen elsewhere — the company, the ministry, NDI, time"
      action={
        <>
          {g && company && (g.status === "ACTIVE" || g.status === "SUSPENDED") ? (
            <SimulatedAction onClick={() => simulateAuthorityStatus(g.id, "REVOKED")}>{company.replace(/ Pvt\. Ltd\.$/, "")} withdraws the authority</SimulatedAction>
          ) : null}
          {g && company && g.status === "ACTIVE" ? (
            <SimulatedAction onClick={() => simulateAuthorityStatus(g.id, "SUSPENDED")}>{company.replace(/ Pvt\. Ltd\.$/, "")} pauses it</SimulatedAction>
          ) : null}
          {g && company && g.status === "SUSPENDED" ? (
            <SimulatedAction onClick={() => simulateAuthorityStatus(g.id, "ACTIVE")}>{company.replace(/ Pvt\. Ltd\.$/, "")} resumes it</SimulatedAction>
          ) : null}
          {licences.map((n) => (
            <SimulatedAction key={n} onClick={() => simulateLicenceRevoked(n)}>
              The ministry suspends licence {n}
            </SimulatedAction>
          ))}
          <SimulatedAction onClick={() => bnswSimulate(b.servicesDown ? "services_up" : "services_down")}>
            {b.servicesDown ? "NDI's services come back" : "NDI's revocation service can't be reached"}
          </SimulatedAction>
          <SimulatedAction onClick={() => bnswSimulate(suspended ? "citizen_restored" : "citizen_suspended")}>
            {suspended ? `${citizen?.name}'s citizen ID is valid again` : `${citizen?.name}'s citizen ID is suspended`}
          </SimulatedAction>
          {session ? <SimulatedAction onClick={() => bnswSimulate("signin_timeout")}>BNSW&rsquo;s sign-in times out</SimulatedAction> : null}
          {session ? <SimulatedAction onClick={bnswComeBack}>Close BNSW and come back later</SimulatedAction> : null}
        </>
      }
    >
      Withdrawing and pausing stand in for catalogue flow 11, which has no specification yet. Each change reaches NDI&rsquo;s revocation service at
      once; DA-CORE&rsquo;s target is within 60 seconds, and the prototype shows it on BNSW&rsquo;s next check — at the next declaration, not
      before. {b.servicesDown ? "NDI's services can't be reached right now." : ""}
    </SimulatedStep>
  );
}

/* ------------------------------------------------------------------ */
/* BNSW's back end                                                     */
/* ------------------------------------------------------------------ */

/**
 * What BNSW keeps — EW-FLOW9-SD §4 — shown so a reviewer can see what the
 * counterparty learns. Field names are the specification's, because this
 * is the back end, not anything the person at BNSW's screen reads.
 */
function Records({ notice, session }: { notice: Notice | null; session: AuthoritySession | null }) {
  const demo = useDemo();
  const regs = demo.counterpartyRegistrations.filter((r) => r.counterpartyId === BNSW);
  const last = session ?? demo.authoritySessions.find((x) => x.counterpartyId === BNSW && x.signedInCid === demo.bnsw.signedInCid) ?? null;
  const decls = demo.counterpartyDeclarations.filter((d) => d.counterpartyId === BNSW).slice(0, 4);
  const row = (k: string, v: string | null) => (
    <div key={k} className="flex flex-wrap gap-x-2">
      <dt className="font-mono text-[11px] text-faint">{k}</dt>
      <dd className="m-0 break-all font-mono text-[11.5px] text-muted">{v ?? "—"}</dd>
    </div>
  );

  return (
    <section
      className="flex flex-col gap-4 rounded-[12px] border border-dashed px-4 py-4"
      style={{ borderColor: "var(--border-strong)", background: "rgb(var(--tint) / 0.03)" }}
      aria-label="BNSW's records"
    >
      <p className="m-0 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--ndi-warning)" }} />
        Prototype · BNSW&rsquo;s back end — what it keeps (EW-FLOW9-SD §4)
      </p>

      <div className="grid gap-4 min-[901px]:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="m-0 font-display text-[13px] font-semibold text-strong">Registrations (§4.1)</p>
          {regs.length === 0 ? <p className="m-0 text-[12.5px] text-faint">No company has registered.</p> : null}
          {regs.map((r) => (
            <dl key={r.id} className="m-0 flex flex-col gap-0.5">
              {row("legal name", r.legalName)}
              {row("registration no.", r.registrationNumber)}
              {row("TPN", r.tpn ? `${r.tpn} · revocation_id ${r.tpnRevocationId} (kept, not looked up)` : null)}
              {r.licences.map((l) => row("licence", `${l.number} · revocation_id ${l.revocationId}`))}
              {row("holderDid", r.holderDid)}
              {row("publishingDid", r.publishingDid ?? "none — registered before it was listed to give authority, so B1 fails (E8) until it registers again")}
              {row("registeredAt", r.registeredAt)}
            </dl>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="m-0 font-display text-[13px] font-semibold text-strong">Authority session (§4.2)</p>
          {last ? (
            <dl className="m-0 flex flex-col gap-0.5">
              {row("status", `${last.status}${last.endReason ? ` · ${last.endReason}` : ""}`)}
              {row("delegateDid", last.delegateDid)}
              {row("name · citizen ID", `${last.delegateName} · ${last.delegateCid}`)}
              {row("principalDid", last.principalDid)}
              {row("relationId", last.relationId)}
              {row("constraints", `${last.tasks.join(", ")} · ${last.licenceNumbers.join(", ")} · valueCapNu ${last.valueCapNu} · perTransaction ${last.perTransaction}`)}
              {row("authority revocation_id", last.authorityRevocationId)}
              {row("citizen revocation_id", last.citizenRevocationId)}
              {row("validUntil", last.validUntil)}
            </dl>
          ) : (
            <p className="m-0 text-[12.5px] text-faint">None for the person signed in.</p>
          )}
        </div>
      </div>

      {notice?.checks.length ? (
        <div className="flex flex-col gap-1.5">
          <p className="m-0 font-display text-[13px] font-semibold text-strong">Last sign-in check — client-service V1–V6, BNSW B0–B4</p>
          <ul className="m-0 grid list-none gap-1 p-0 min-[641px]:grid-cols-2">
            {notice.checks.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-[12.5px] text-muted">
                <span className="w-6 flex-none font-mono text-[11px] text-faint">{c.id}</span>
                <span className="min-w-0 flex-1">{c.label}</span>
                <StatusPill status={c.outcome === "not_run" ? "inactive" : c.outcome} label={c.outcome === "pass" ? "Pass" : c.outcome === "fail" ? "Fail" : "Not run"} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {decls.length ? (
        <div className="flex flex-col gap-1.5">
          <p className="m-0 font-display text-[13px] font-semibold text-strong">Kept with each declaration (§4.3)</p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {decls.map((d) => (
              <li key={d.id} className="break-all font-mono text-[11.5px] text-muted">
                {d.reference} · relationId {d.relationId} · revocation_id {d.authorityRevocationId} · {d.licenceNumber} · {d.delegateName} {d.delegateCid} ·{" "}
                {d.statusResult}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="m-0 text-[12px] leading-[1.5] text-faint">
        Nothing here reaches the company: it isn&rsquo;t told about sessions or declarations (EW-FLOW9-SD D7). NDI&rsquo;s client-service sees the
        proof and the status lookups — ids only, never the declaration.
      </p>
    </section>
  );
}
