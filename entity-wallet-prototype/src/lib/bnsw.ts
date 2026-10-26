import { formatDate } from "@/features/controllership/scopeModel";

import { ending, keyedFor, licenceNumberOf, orgName, taskLabel, today } from "./authority";
import {
  PELDEN,
  SIM_CITIZENS,
  type AuthorityGrant,
  type AuthoritySession,
  type BnswCheck,
  type CounterpartyRegistration,
  type DemoState,
  type HeldCredential,
} from "./demoData";
import { namesOf } from "./sharing";

/**
 * Flow 9 — acting for an organisation at the Bhutan National Single Window
 * (FLOW-AUT-02, EW-FLOW9-SD, EW-FLOW9-CIG, UX-EW-06 SCR-AUT-07).
 *
 * WHOSE RULES THESE ARE
 *
 * None of this is the Entity Wallet's. `V1`–`V6` are NDI's `client-service`,
 * the relying-party verifier BNSW already uses for every NDI credential;
 * `B0`–`B4`, the authority session, the check at each declaration and the
 * value limit are BNSW's own system, built against the counterparty
 * integration guide. The prototype has neither, so both stand here, as pure
 * reads of the demo state, and the store runs them before it changes
 * anything — the BNSW page renders what comes back and decides nothing,
 * the same rule as every other screen.
 *
 * WHAT THIS REPLACES
 *
 * The page before the specification sent every declaration to the agent's
 * wallet and asked an "NDI Authority Verification API" to walk a chain and
 * sign a PASS or FAIL (`lib/avs.ts`, align/flow-7-9 item 10). The
 * specification works the other way round: one presentation of the citizen
 * credential and the authority, from one did:key, opens an *authority
 * session* (D2); after that each declaration is only a status lookup and
 * the limit — no further hop to the app, and no signed decision object
 * (EW-FLOW9-SD §15, the DA-CORE §8.1 departures). There is no chain:
 * the authority is the organisation's (EW-FLOW8-SD D15).
 *
 * WHAT BNSW SEES
 *
 * More than the old page claimed. The session holds the delegate's name and
 * citizen ID number, from the citizen credential (§4.2, Q1), and BNSW keeps
 * both with every declaration (§4.3) — that is how it answers "under what
 * authority, by whom" later. The company's own credentials never leave its
 * wallet at this point: BNSW has the company's name, TPN and licences from
 * the company's registration with it (D11), and the authority names only a
 * licence number.
 */

export const BNSW = "org-bnsw";
export const SUBMIT = "nsw:submit-declaration";
export const AMEND = "nsw:amend-declaration";

/** E2 — the request waits five minutes for the app. */
export const REQUEST_MS = 5 * 60_000;

/**
 * BNSW's sign-in session. Its length is open (EW-FLOW9-SD §13 item 8,
 * FLOW-AUT-02 §12 item 3); the prototype assumes eight hours, a working
 * day, and says so on the what's-real page. The authority session ends at
 * this or at the authority's expirationDate, whichever is first (D13).
 */
export const SIGN_IN_MS = 8 * 60 * 60_000;

/* ------------------------------------------------------------------ */
/* The copy — UX-EW-06 §3.5, word for word                              */
/* ------------------------------------------------------------------ */

/**
 * Every message the delegate reads on SCR-AUT-07. Where §3.5 gives the
 * words they are used exactly; the three lines it doesn't give — the
 * stopped notice, the "Checking…" detail and E12's reasons — are the
 * prototype's, written to the same rules (plain words, who can fix it) and
 * listed on the what's-real page. "BNSW" is the specification's own word
 * for the Single Window in this copy. A name ending in a full stop
 * ("Pelden Trading Pvt. Ltd.") takes no second one (`ending`).
 */
export const COPY = {
  empty: "Acting for a company? Share your authority from your Bhutan NDI app.",
  E2: "You didn't share your authority. You can try again. If you don't have authority yet, ask the company to give it to you through the NDI Entity Wallet.",
  E3: "We couldn't verify your authority. Try again from your Bhutan NDI app. If it keeps happening, contact BNSW support.",
  E4: (c: string) => `${c} can't give authority at the moment, so you can't act for it.`,
  E5: (c: string) => `Your authority to act for ${c} is no longer valid. Ask ${c} about it.`,
  E5citizen: "Your citizen ID in Bhutan NDI isn't valid at the moment.",
  E6: (c: string, date: string) => `Your authority to act for ${c} ended on ${date}. Ask ${c} to give it again.`,
  E6citizen: "Your citizen ID in Bhutan NDI has expired. Renew it in the app.",
  E7: "We can't check authority right now. Nothing has been submitted. Try again in a few minutes.",
  E8: (c: string) =>
    `${c} needs to register with BNSW, or register again, before anyone can act for it here. Ask them to share their licence and TPN with BNSW from the NDI Entity Wallet.`,
  E9: (c: string, task: string) => `Your authority from ${c} doesn't let you ${task} at BNSW.`,
  E10: (c: string) => `The licence in your authority isn't registered with BNSW. Ask ${c} to register it.`,
  E11: (c: string, n: string) => `${c}'s business licence ${n} isn't valid at the moment, so you can't declare under it.`,
  E12: (c: string, reason: string) => `Your authority to act for ${c} has changed, so this declaration wasn't submitted: ${reason}. Your draft is saved.`,
  E13: (limit: string, c: string) => `This declaration is above your limit of Nu ${limit} for ${ending(c)} Ask ${c} to submit it, or to change your authority.`,
  E14: (c: string, tail: string) => `You're no longer acting for ${ending(c)} Your authority ${tail}. Your draft is saved.`,
  E15: "The authority shared isn't yours. Only share authority from your own Bhutan NDI app.",
  A2: "Which licence is this declaration under?",
  A4: (c: string, time: string) => `You're acting for ${c} until ${time}.`,
  /** The sentence that must survive review unchanged (UX-EW-06 §2.4). */
  acting: (c: string, licences: string, limit: string, time: string) =>
    `You're acting for ${c} under licence ${licences}, up to Nu ${limit} per declaration, until ${time}.`,
  offline: "You're offline. Nothing has been submitted.",
  /** The prototype's: nothing in §3.5 covers *Stop acting*. */
  stopped: (c: string) => `You've stopped acting for ${ending(c)}`,
};

/** "1,000,000" — the number in "Nu <limit>". */
export const grouped = (n: number) => n.toLocaleString("en-US");

/**
 * When a session ends, as the delegate reads it: "17:30" today, with the
 * date when it isn't today. Local time — this is a clock on a desk in a
 * clearing agent's office (UX-EW-06 SC 2.2.1: shown as a time).
 */
export function timeOf(ms: number, now = Date.now()): string {
  const d = new Date(ms);
  const hhmm = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return new Date(now).toDateString() === d.toDateString() ? hhmm : `${hhmm} on ${formatDate(d.toISOString())}`;
}

/* ------------------------------------------------------------------ */
/* The simulated app's contents                                        */
/* ------------------------------------------------------------------ */

export const citizenOf = (cid: string | null) => SIM_CITIZENS.find((c) => c.cid === cid) ?? null;

/**
 * Which authorities a citizen's Bhutan NDI app holds. The platform keeps
 * no list of who holds what (EW-FLOW8-SD D10), so this is the simulated
 * app's contents, read the only ways the story can: the character who
 * collected it, the ID number's keyed hash while the grant still has one,
 * or — once it has ended and the hash is gone (S4) — the verified name it
 * was collected under. An authority that was withdrawn or ran out stays in
 * the app: the app has nothing to tell it otherwise, which is exactly why
 * BNSW checks status (V4, V5).
 */
export function heldAuthorities(s: Pick<DemoState, "authorityGrants">, cid: string): AuthorityGrant[] {
  const citizen = citizenOf(cid);
  if (!citizen) return [];
  return s.authorityGrants.filter(
    (g) =>
      g.credentialRef !== null &&
      ["ACTIVE", "SUSPENDED", "REVOKED", "EXPIRED"].includes(g.status) &&
      ((citizen.personId !== null && g.delegatePersonId === citizen.personId) ||
        g.delegateIdKeyed === keyedFor(g.orgId, cid) ||
        g.delegateName === citizen.name),
  );
}

/** The app's one default did:key (D2) — the DID its authorities were made out to, or one derived for a citizen holding none. */
export function appDidOf(s: Pick<DemoState, "authorityGrants">, cid: string): string {
  const held = heldAuthorities(s, cid).find((g) => g.delegateDid);
  if (held?.delegateDid) return held.delegateDid;
  const base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let h = 0x811c9dc5;
  return `did:key:z6Mk${Array.from({ length: 44 }, (_, i) => {
    h = Math.imul(h ^ cid.charCodeAt(i % cid.length) ^ i, 0x01000193) >>> 0;
    return base58[h % 58];
  }).join("")}`;
}

/** The citizen credential's revocation id — stable per citizen, as an NDI-issued credential's is. */
export const citizenRevocationIdOf = (cid: string) => `${cid.slice(0, 8)}-c17e-4a0d-9b52-${cid.padEnd(12, "0").slice(-12)}`;

/* ------------------------------------------------------------------ */
/* BNSW's registration record (§4.1)                                   */
/* ------------------------------------------------------------------ */

/** A stable revocation id for a held credential, as its issuer registered it. */
export function revocationIdOf(credentialId: string): string {
  let a = 0x9e3779b9;
  for (let i = 0; i < credentialId.length; i += 1) a = Math.imul(a ^ credentialId.charCodeAt(i), 0x85ebca6b) >>> 0;
  const hex = (n: number) => n.toString(16).padStart(8, "0");
  const b = Math.imul(a, 0xc2b2ae35) >>> 0;
  return `${hex(a)}-${hex(b).slice(0, 4)}-4${hex(b).slice(4, 7)}-a${hex(a ^ b).slice(0, 3)}-${hex(b ^ 0x5bd1e995)}${hex(a).slice(0, 4)}`;
}

/** The organisation's did:key its registration credentials are made out to (EW-FLOW8-SD §7.1). */
export const holderDidOf = (orgId: string) =>
  `did:key:z6Mk${[...`${orgId}holderwallet`].map((c) => "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789".charAt(c.charCodeAt(0) % 57)).join("").padEnd(44, "q").slice(0, 44)}`;

/**
 * What BNSW keeps when a company registers with it — FLOW-PRS-01's shared
 * result, read as EW-FLOW9-SD §4.1 and EW-FLOW9-CIG §3 say. Built by the
 * store when a share to BNSW goes through; registering again replaces it.
 *
 * `publishingDid` is the platform's attestation (D8): filled only where the
 * organisation is CURRENT on NDI's list as an issuer of authority at the
 * moment it shares — SD9 §7's wording, not CIG §3's "once the company has
 * given authority to anyone" (pr-9, optional), because the listing is
 * CURRENT from the first grant, before anyone accepts. A company that
 * registered before its first grant has none, and its delegates fail B1
 * (E8) until it registers again — the specification's answer to the
 * registration-order problem (§7, R5), not a gap the prototype fills.
 */
export function registrationFrom(
  s: Pick<DemoState, "organizations">,
  orgId: string,
  credentials: HeldCredential[],
  requestId: string | null,
  at = today(),
): CounterpartyRegistration {
  const org = s.organizations.find((o) => o.id === orgId);
  const attr = (type: string, name: string) => credentials.find((c) => c.type === type)?.attributes.find((a) => a.name === name)?.value ?? null;
  const tpnCredential = credentials.find((c) => c.type === "Taxpayer Number (TPN)");
  return {
    id: `reg-${orgId}-${Math.random().toString(36).slice(2, 7)}`,
    counterpartyId: BNSW,
    orgId,
    holderDid: holderDidOf(orgId),
    publishingDid: org?.authorityListing?.status === "CURRENT" ? org.authorityListing.did : null,
    legalName: attr("Business Registration", "registered_name") ?? org?.name ?? "The company",
    registrationNumber: attr("Business Registration", "registration_number") ?? "",
    tpn: tpnCredential ? (tpnCredential.attributes.find((a) => a.name === "tpn")?.value ?? null) : null,
    tpnRevocationId: tpnCredential ? revocationIdOf(tpnCredential.id) : null,
    licences: credentials
      .filter((c) => c.type === "Business Licence")
      .map((c) => ({ number: licenceNumberOf(c), revocationId: revocationIdOf(c.id), credentialId: c.id })),
    registeredAt: at,
    requestId,
  };
}

export const registrationOf = (s: Pick<DemoState, "counterpartyRegistrations">, orgId: string) =>
  s.counterpartyRegistrations.find((r) => r.counterpartyId === BNSW && r.orgId === orgId) ?? null;

/* ------------------------------------------------------------------ */
/* client-service's status lookup (§8.1)                               */
/* ------------------------------------------------------------------ */

export type RevocationStatus = "ACTIVE" | "SUSPENDED" | "REVOKED" | "NOT_FOUND";

/**
 * `POST /status`, for one revocation id — read from the record the
 * revocation service stands for. A withdrawal or a pause reaches here the
 * moment it is made: DA-CORE's propagation target is "within 60 s" of the
 * portal action, and the prototype models that as immediate on the next
 * check, which the what's-real page says.
 *
 * An authority that reached its end date is still ACTIVE here — its
 * validity is V5's, not the revocation service's.
 */
export function authorityStatus(s: Pick<DemoState, "authorityGrants">, revocationId: string | null): RevocationStatus {
  const g = revocationId ? s.authorityGrants.find((x) => x.revocationId === revocationId) : undefined;
  if (!g) return "NOT_FOUND";
  if (g.status === "SUSPENDED") return "SUSPENDED";
  if (g.status === "REVOKED") return "REVOKED";
  return g.status === "ACTIVE" || g.status === "EXPIRED" ? "ACTIVE" : "NOT_FOUND";
}

/**
 * A licence's status by the revocation id BNSW kept from the registration
 * (D4). The held credential has no suspended state, so anything but a
 * current, active licence reads as not ACTIVE — which is all B4 and the
 * per-declaration check need.
 */
export function licenceStatus(s: Pick<DemoState, "heldCredentials">, licence: CounterpartyRegistration["licences"][number], now = today()): RevocationStatus {
  const c = s.heldCredentials.find((x) => x.id === licence.credentialId);
  if (!c) return "NOT_FOUND";
  return c.status === "active" && (c.expiresAt === null || c.expiresAt >= now) ? "ACTIVE" : "REVOKED";
}

export const citizenStatus = (s: Pick<DemoState, "bnsw">, cid: string): RevocationStatus =>
  s.bnsw.suspendedCitizens.includes(cid) ? "SUSPENDED" : "ACTIVE";

/** The organisation listed under a publishing DID, and whether it is CURRENT for the Capability type (V3, D15). */
export function listingOf(s: Pick<DemoState, "organizations">, did: string | null) {
  const org = did ? s.organizations.find((o) => o.authorityListing?.did === did) : undefined;
  return { org: org ?? null, current: org?.authorityListing?.status === "CURRENT" };
}

/* ------------------------------------------------------------------ */
/* Sign-in: V1–V6 in client-service, B0–B4 at BNSW                      */
/* ------------------------------------------------------------------ */

export type RefusalCode = "E2" | "E3" | "E4" | "E5" | "E5citizen" | "E6" | "E7" | "E8" | "E9" | "E10" | "E11" | "E15";

export interface Presentation {
  grantId: string;
  /** The citizen whose app answered — not necessarily the person signed in (B0, E15). */
  answeredBy: string;
  /** A copy of the authority wrapped in someone else's key (V2 fails). */
  copied?: boolean;
}

export type SignInResult =
  | { ok: true; checks: BnswCheck[]; session: Omit<AuthoritySession, "id" | "status" | "endedAt" | "endReason"> }
  | { ok: false; code: RefusalCode; text: string; checks: BnswCheck[] };

const CHECKS: { id: string; label: string }[] = [
  { id: "V1", label: "The presentation and every credential verify" },
  { id: "V2", label: "Both credentials are made out to whoever signed it" },
  { id: "V3", label: "Each issuer is CURRENT on NDI's list for its type" },
  { id: "V4", label: "Each revocation id is ACTIVE" },
  { id: "V5", label: "Each credential is within its validity" },
  { id: "V6", label: "The authority's principal is its issuer" },
  { id: "B0", label: "The citizen ID is the signed-in user's" },
  { id: "B1", label: "The issuer is a registered company's publishing DID" },
  { id: "B2", label: "It names BNSW and a BNSW task" },
  { id: "B3", label: "It names a licence registered for the company" },
  { id: "B4", label: "That licence is ACTIVE" },
];

/**
 * FLOW-AUT-02 steps 6–11. Every check runs in order and the first failure
 * stops it, as it would — `client-service` reports a failed proof as
 * failed (the fix R11 waits for), and BNSW never runs B0–B4 on one. The
 * result carries each check's outcome, so BNSW can tell E3–E6 apart and
 * the reviewer can see which one it was.
 */
export function checkSignIn(s: DemoState, signedInCid: string, p: Presentation, now = Date.now()): SignInResult {
  const outcomes: Record<string, BnswCheck["outcome"]> = {};
  const lines = () => CHECKS.map((c) => ({ ...c, outcome: outcomes[c.id] ?? ("not_run" as const) }));
  const fail = (id: string, code: RefusalCode, text: string): SignInResult => {
    outcomes[id] = "fail";
    return { ok: false, code, text, checks: lines() };
  };
  const pass = (...ids: string[]) => ids.forEach((id) => (outcomes[id] = "pass"));

  const g = s.authorityGrants.find((x) => x.id === p.grantId);
  if (!g) return fail("V1", "E3", COPY.E3);
  /* The company's name is the issuer's listed name, carried in the result. */
  const company = orgName(s, g.orgId);

  /* E7 — the Trust Registry or the revocation service can't be reached.
     A Capability credential fails closed, never passes unchecked (D10). */
  if (s.bnsw.servicesDown) {
    pass("V1", "V2");
    return fail("V3", "E7", COPY.E7);
  }

  pass("V1");
  if (p.copied || !g.delegateDid) return fail("V2", "E3", COPY.E3);
  pass("V2");

  const listing = listingOf(s, g.issuerDid);
  if (!listing.current) return fail("V3", "E4", COPY.E4(company));
  pass("V3");

  if (citizenStatus(s, p.answeredBy) !== "ACTIVE") return fail("V4", "E5citizen", COPY.E5citizen);
  if (authorityStatus(s, g.revocationId) !== "ACTIVE") return fail("V4", "E5", COPY.E5(company));
  pass("V4");

  if (g.status === "EXPIRED" || g.validUntil < today()) return fail("V5", "E6", COPY.E6(company, formatDate(g.validUntil)));
  pass("V5");
  /* principal.id equals the issuer — the authority is the organisation's own (EW-FLOW8-SD D3). Always so for a grant the store made. */
  pass("V6");

  /* B0 — the holder is the person signed in (D17). A relayed QR code fails here. */
  if (p.answeredBy !== signedInCid) return fail("B0", "E15", COPY.E15);
  pass("B0");

  /* B1 — the issuer equals a registered company's publishing DID. */
  const reg = registrationOf(s, g.orgId);
  if (!reg || !reg.publishingDid || reg.publishingDid !== g.issuerDid) return fail("B1", "E8", COPY.E8(company));
  pass("B1");

  /* B2 — names BNSW, and a task to do here. Which task is checked again
     at each action: amending needs its own (A3). */
  if (!g.counterparties.includes(BNSW) || !g.tasks.some((t) => t === SUBMIT || t === AMEND)) {
    return fail("B2", "E9", COPY.E9(company, taskLabel(SUBMIT).toLowerCase()));
  }
  pass("B2");

  /* B3 — at least one named licence is registered for the company. */
  const named = reg.licences.filter((l) => g.licenceNumbers.includes(l.number));
  if (named.length === 0) return fail("B3", "E10", COPY.E10(company));
  pass("B3");

  /* B4 — pr-9 item 2, chosen: every registered licence the authority
     names is looked up; the session opens if at least one is ACTIVE, and
     A2 offers only those. With none ACTIVE, E11 names the first. */
  const active = named.filter((l) => licenceStatus(s, l) === "ACTIVE");
  if (active.length === 0) return fail("B4", "E11", COPY.E11(company, named[0].number));
  pass("B4");

  const citizen = citizenOf(p.answeredBy);
  const endOfAuthority = new Date(`${g.validUntil}T23:59:59`).getTime();
  return {
    ok: true,
    checks: lines(),
    session: {
      counterpartyId: BNSW,
      signedInCid,
      delegateDid: g.delegateDid,
      delegateName: citizen?.name ?? "",
      delegateCid: p.answeredBy,
      authorityName: g.delegateName ?? g.name,
      orgId: g.orgId,
      registrationId: reg.id,
      principalDid: g.issuerDid ?? "",
      relationId: g.id,
      tasks: g.tasks.filter((t) => t === SUBMIT || t === AMEND),
      licenceNumbers: active.map((l) => l.number),
      valueCapNu: g.valueCapNu,
      perTransaction: g.perTransaction,
      authorityRevocationId: g.revocationId ?? "",
      citizenRevocationId: citizenRevocationIdOf(p.answeredBy),
      validUntil: g.validUntil,
      endsAt: Math.min(now + SIGN_IN_MS, endOfAuthority),
      checkedAt: now,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Each declaration (§8)                                               */
/* ------------------------------------------------------------------ */

export type SubmitResult =
  | { ok: true; statusResult: string }
  /** E9 — that action isn't in the authority; the session continues. */
  | { ok: false; code: "E9" | "E7" | "E13" | "invalid"; text: string; keep: true }
  /** E12 — a status changed: nothing submitted, the session ends. E14 — it had already ended. */
  | { ok: false; code: "E12" | "E14"; text: string; keep: false; endReason: AuthoritySession["endReason"] };

/** E14's tail: "ended on <date>" when the authority ran out, "needs to be shared again" when BNSW's sign-in did. */
export const endedTail = (session: AuthoritySession) =>
  session.endReason === "expired" ? `ended on ${formatDate(session.validUntil)}` : "needs to be shared again";

export function sessionEndReason(session: AuthoritySession, now = Date.now()): AuthoritySession["endReason"] | null {
  if (session.status !== "OPEN") return session.endReason;
  if (now < session.endsAt) return null;
  return session.validUntil <= today() ? "expired" : "timeout";
}

/**
 * FLOW-AUT-02 steps 13–15 — at every submission, before anything is
 * accepted. The order is the guide's: the action in the authority (B2),
 * then `POST /status` for the authority, the citizen credential, the
 * licence on this declaration and the listing (§8.1, CIG §6.1), then the
 * limit (§8.2).
 *
 * pr-9 item 1, chosen: the TPN is not looked up. Step 13, §8.1 and the
 * guide's request body name four things and the TPN isn't one, so a TPN
 * DRC has revoked does not stop a declaration here; BNSW shows the TPN
 * from the registration and keeps its id. Recorded on the what's-real page.
 */
export function checkDeclaration(
  s: DemoState,
  session: AuthoritySession,
  d: { kind: "submit" | "amend"; valueNu: number; licenceNumber: string },
  now = Date.now(),
): SubmitResult {
  const company = orgName(s, session.orgId);
  const ended = sessionEndReason(session, now);
  if (ended) return { ok: false, code: "E14", text: COPY.E14(company, endedTail({ ...session, endReason: ended })), keep: false, endReason: ended };

  const task = d.kind === "amend" ? AMEND : SUBMIT;
  if (!session.tasks.includes(task)) return { ok: false, code: "E9", text: COPY.E9(company, taskLabel(task).toLowerCase()), keep: true };
  if (!session.licenceNumbers.includes(d.licenceNumber)) return { ok: false, code: "invalid", text: COPY.A2, keep: true };
  if (!(d.valueNu > 0)) return { ok: false, code: "invalid", text: "Enter the declared value.", keep: true };

  /* E7 — an outage stops the declaration but keeps the session (D18). */
  if (s.bnsw.servicesDown) return { ok: false, code: "E7", text: COPY.E7, keep: true };

  const reg = s.counterpartyRegistrations.find((r) => r.id === session.registrationId);
  const licence = reg?.licences.find((l) => l.number === d.licenceNumber);
  const statuses = {
    authority: authorityStatus(s, session.authorityRevocationId),
    citizen: citizenStatus(s, session.delegateCid),
    licence: licence ? licenceStatus(s, licence) : ("NOT_FOUND" as RevocationStatus),
    listing: listingOf(s, session.principalDid).current ? "CURRENT" : "TERMINATED",
  };

  /* E12's <reason>, in plain words — pr-9 (optional) asks the docs to list
     them; until they do, these are the prototype's. */
  const reason =
    statuses.authority === "REVOKED"
      ? `${company} has withdrawn it`
      : statuses.authority === "SUSPENDED"
        ? `${company} has paused it`
        : statuses.authority === "NOT_FOUND"
          ? "it can't be found at NDI"
          : statuses.citizen !== "ACTIVE"
            ? "your citizen ID in Bhutan NDI isn't valid at the moment"
            : statuses.licence !== "ACTIVE"
              ? `business licence ${d.licenceNumber} isn't valid at the moment`
              : statuses.listing !== "CURRENT"
                ? `${company} can't give authority at the moment`
                : null;
  if (reason) return { ok: false, code: "E12", text: COPY.E12(company, reason), keep: false, endReason: "changed" };

  /* §8.2 — per declaration, the only kind a grant carries (pr-8 item 1). */
  if (d.valueNu > session.valueCapNu) return { ok: false, code: "E13", text: COPY.E13(grouped(session.valueCapNu), company), keep: true };

  return {
    ok: true,
    statusResult: `authority ${statuses.authority} · citizen ID ${statuses.citizen} · licence ${statuses.licence} · ${company} ${statuses.listing}`,
  };
}

/** The *Acting for* sentence for a session. */
export const actingSentence = (s: Pick<DemoState, "organizations">, session: AuthoritySession, now = Date.now()) =>
  COPY.acting(orgName(s, session.orgId), namesOf(session.licenceNumbers), grouped(session.valueCapNu), timeOf(session.endsAt, now));

/** Pelden's id, for the seed and the switcher's fixtures. */
export const DEFAULT_COMPANY = PELDEN;
