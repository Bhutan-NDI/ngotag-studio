import { formatDate } from "@/features/controllership/scopeModel";

import {
  PELDEN,
  type AskedDescriptor,
  type DemoState,
  type HeldCredential,
  type Organization,
  type PersonId,
  type PresentationRequest,
  type PresentationSession,
  type PresentationStatus,
  type ScopeGrant,
  type SessionStatus,
} from "./demoData";

/**
 * Flow 7's rules, as pure reads of the demo state (EW-FLOW7-SD §5, §6).
 *
 * WHY THEY LIVE HERE AND NOT IN A SCREEN
 *
 * Whether someone may share, whether a second person must agree, who that
 * is, and which held credential answers a request are the server's answers
 * in the real product. The store calls these before it does anything, and
 * hands the same answers to the screens through its context, so a screen
 * that greys *Share* and the store that refuses it can never disagree. A
 * screen never works any of this out for itself.
 *
 * WHAT A PERMISSION IS READ FROM
 *
 * The relation's `proof:present` grant — which Flow 3's *Share* box writes,
 * with its reach (named organisations, or any) and its approval policy
 * (EW-FLOW3-SD §4.2). Never the person's role in the organisation, and never
 * who they are in the story (FLOW-PRS-02 S4). The Root's grant is AUTO; a
 * *Share* Controller's is SINGLE_APPROVER unless the Root chose otherwise.
 */

export const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/** D7 — a request expires seven days after it arrives. */
export const REQUEST_DAYS = 7;
/** D16 — a session link must be first loaded within 15 minutes of creation… */
export const OPEN_BY_MS = 15 * 60_000;
/** …and redeemed within 30 minutes of that first load. */
export const REDEEM_WITHIN_MS = 30 * 60_000;

export const expiresFromToday = () => inDays(REQUEST_DAYS);

/**
 * The organisation NDI lists for a verifier: on the platform, holding an
 * ACTIVE source of the VERIFIER capability (V1, V2). The console records any
 * of EW-FLOW4-SD §2.3's three sources as the `verifier` capability, which is
 * also what Flow 3's *Share* reach names (`shareTargets`), so one fact
 * answers both "may it ask" and "may this person share with it".
 */
export function listedVerifier(s: Pick<DemoState, "organizations">, orgId: string | null): Organization | undefined {
  const org = orgId ? s.organizations.find((o) => o.id === orgId) : undefined;
  return org && org.capabilities.includes("verifier") ? org : undefined;
}

/** The DID its listing carries, for the record. */
export const verifierDidOf = (org: Organization) =>
  org.publicDid ?? org.issuingDid ?? `did:polygon:0x${[...org.id].map((c) => c.charCodeAt(0).toString(16)).join("").padEnd(40, "0").slice(0, 40)}`;

/**
 * The state a request is in today. A request nobody decided within its
 * seven days is EXPIRED on its date (FLOW-PRS-02 E6) — read that way
 * everywhere at once, and written back by the store's effect.
 */
export function statusOf(r: Pick<PresentationRequest, "status" | "expiresAt">, now = today()): PresentationStatus {
  if ((r.status === "OPEN" || r.status === "AWAITING_APPROVAL" || r.status === "RECEIVED") && r.expiresAt < now) return "EXPIRED";
  return r.status;
}

/** Still something a person could act on. */
export const isLive = (status: PresentationStatus) => status === "OPEN" || status === "AWAITING_APPROVAL" || status === "RECEIVED";

/* ------------------------------------------------------------------ */
/* V7 — which held credential answers each descriptor                  */
/* ------------------------------------------------------------------ */

export interface DescriptorMatch {
  descriptor: AskedDescriptor;
  /** Shareable credentials of the type, newest first — the first is preselected (D18). */
  options: HeldCredential[];
  /** Held, but not shareable — and why, in §3.5's words. Null when an option exists or nothing is held. */
  unshareable: { credential: HeldCredential; reason: string } | null;
}

/** Why a held credential can't be shared, or null if it can (V7). */
export function whyUnshareable(c: HeldCredential, now = today()): string | null {
  if (c.status === "revoked") return `${c.issuer} has revoked it`;
  if (c.status === "expired" || (c.expiresAt && c.expiresAt < now)) return `it expired on ${formatDate(c.expiresAt ?? now)}`;
  if (!c.issuerTrusted) return `${c.issuer} is no longer on NDI's list of trusted organisations`;
  return null;
}

export function matchRequest(s: Pick<DemoState, "heldCredentials">, r: Pick<PresentationRequest, "orgId" | "asked">): DescriptorMatch[] {
  const orgId = r.orgId ?? PELDEN;
  return r.asked.map((descriptor) => {
    /* A superseded credential is the record, not something shared. */
    const held = s.heldCredentials.filter(
      (c) => (c.orgId ?? PELDEN) === orgId && c.type === descriptor.credentialType && !c.supersededBy,
    );
    const options = held.filter((c) => !whyUnshareable(c)).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    const blocked = options.length ? undefined : held.find((c) => whyUnshareable(c));
    return {
      descriptor,
      options,
      unshareable: blocked ? { credential: blocked, reason: whyUnshareable(blocked) ?? "" } : null,
    };
  });
}

/** Every descriptor answered — `Share` is possible as far as V7 goes. */
export const satisfiable = (m: DescriptorMatch[]) => m.every((x) => x.options.length > 0);

/* ------------------------------------------------------------------ */
/* §5.3 — who may share, and who must agree                            */
/* ------------------------------------------------------------------ */

export type ShareVerdict =
  /** The Root, or a Controller the Root set to AUTO: sent at once. */
  | { kind: "auto" }
  /** SINGLE_APPROVER: these people will be asked, never the sharer. */
  | { kind: "approval"; approvers: PersonId[] }
  /** SINGLE_APPROVER with nobody else holding approval:decide (E6/E13). */
  | { kind: "no_approver" }
  /** No proof:present, or not for these credentials (E4/E10). */
  | { kind: "no_permission"; can: PersonId[] }
  /** A *Share* Controller facing a verifier outside their reach (E5). */
  | { kind: "outside_reach"; allowed: string[]; can: PersonId[] };

/** A person's ACTIVE relation in the organisation, in force today, and its grant for an operation. */
function grantFor(s: Pick<DemoState, "relations">, personId: PersonId, orgId: string, op: string, now = today()) {
  for (const r of s.relations) {
    if (r.personId !== personId || (r.orgId ?? PELDEN) !== orgId || r.state !== "ACTIVE") continue;
    if (r.scope.validFrom > now || (r.scope.validUntil !== null && r.scope.validUntil < now)) continue;
    const grant = r.scope.grants.find((g) => g.operation === op);
    if (grant) return { relation: r, grant };
  }
  return null;
}

const coversTypes = (g: ScopeGrant, r: Pick<PresentationRequest, "asked">) =>
  g.credentialTypes.mode === "any" || r.asked.every((d) => (g.credentialTypes as { values: string[] }).values.includes(d.credentialType));

const coversVerifier = (g: ScopeGrant, r: Pick<PresentationRequest, "verifierName">) =>
  g.relyingParties.mode === "any" || g.relyingParties.values.includes(r.verifierName);

/** Whether this person's grant lets them share this request at all — reach and types included. */
export function mayShare(s: Pick<DemoState, "relations">, personId: PersonId, r: Pick<PresentationRequest, "orgId" | "asked" | "verifierName">): boolean {
  const found = grantFor(s, personId, r.orgId ?? PELDEN, "proof:present");
  return Boolean(found && coversTypes(found.grant, r) && coversVerifier(found.grant, r));
}

/** Everyone else who holds approval:decide here — the only possible approvers. Never the sharer. */
export function approversFor(s: Pick<DemoState, "relations">, orgId: string, except: PersonId): PersonId[] {
  const people = new Set<PersonId>();
  for (const r of s.relations) {
    if (r.personId === except) continue;
    if (grantFor(s, r.personId, orgId, "approval:decide")) people.add(r.personId);
  }
  return [...people];
}

/** Everyone else who could share this request — named when *Share* is unavailable (UN-52, D13). */
export function whoCanShare(s: Pick<DemoState, "relations">, r: Pick<PresentationRequest, "orgId" | "asked" | "verifierName">, except: PersonId | null): PersonId[] {
  const orgId = r.orgId ?? PELDEN;
  const people = new Set<PersonId>();
  for (const rel of s.relations) {
    if (rel.personId === except || (rel.orgId ?? PELDEN) !== orgId) continue;
    if (mayShare(s, rel.personId, r)) people.add(rel.personId);
  }
  return [...people];
}

export function isRootOf(s: Pick<DemoState, "relations">, personId: PersonId, orgId: string): boolean {
  return s.relations.some((r) => r.personId === personId && (r.orgId ?? PELDEN) === orgId && r.isRootAuthority && r.state === "ACTIVE");
}

export function rootOf(s: Pick<DemoState, "relations">, orgId: string): PersonId | null {
  return s.relations.find((r) => (r.orgId ?? PELDEN) === orgId && r.isRootAuthority && r.state === "ACTIVE")?.personId ?? null;
}

/**
 * The one answer to "can this person share this, and what happens if they
 * do" — FLOW-PRS-01 step 7–8, FLOW-PRS-02 step 5–6.
 *
 * Anything that isn't AUTO needs one other person. DUAL_CONTROL and
 * thresholds are catalogue flow 10 (EW-FLOW7-SD §1.2), so a policy the
 * presets never write is read as the one approval the spec does define.
 */
export function shareVerdict(s: Pick<DemoState, "relations">, personId: PersonId, r: Pick<PresentationRequest, "orgId" | "asked" | "verifierName">): ShareVerdict {
  const orgId = r.orgId ?? PELDEN;
  const found = grantFor(s, personId, orgId, "proof:present");
  const can = whoCanShare(s, r, personId);
  if (!found || !coversTypes(found.grant, r)) return { kind: "no_permission", can };
  if (!coversVerifier(found.grant, r)) {
    return { kind: "outside_reach", allowed: found.grant.relyingParties.mode === "list" ? found.grant.relyingParties.values : [], can };
  }
  if (found.grant.approval === "AUTO") return { kind: "auto" };
  const approvers = approversFor(s, orgId, personId);
  return approvers.length ? { kind: "approval", approvers } : { kind: "no_approver" };
}

/**
 * Who is told a request is waiting (FLOW-PRS-02 step 3): everyone whose
 * *Share* reach admits this verifier, and the Root — §12 item 1 is open,
 * and the proposed answer, every request, is what is built.
 */
export function answerersFor(s: Pick<DemoState, "relations">, r: Pick<PresentationRequest, "orgId" | "asked" | "verifierName">): PersonId[] {
  const people = new Set(whoCanShare(s, r, null));
  const root = rootOf(s, r.orgId ?? PELDEN);
  if (root) people.add(root);
  return [...people];
}

/* ------------------------------------------------------------------ */
/* The session follows the request (§5.1's mapping)                    */
/* ------------------------------------------------------------------ */

export function sessionStatusOf(session: PresentationSession, request: Pick<PresentationRequest, "status" | "expiresAt"> | undefined): SessionStatus {
  if (!request) return session.status;
  switch (statusOf(request)) {
    case "SHARED":
      return "SHARED";
    case "DECLINED":
    case "BLOCKED":
      return "DECLINED";
    case "EXPIRED":
    case "WITHDRAWN":
      return "EXPIRED";
    case "FAILED":
      return "FAILED";
    default:
      return session.returnedPending ? "PENDING" : "OPENED";
  }
}

/** Whether a link is past either of its windows (D16). */
export function sessionLapsed(session: PresentationSession, now = Date.now()): boolean {
  if (session.boundOrgId) return false;
  if (session.firstLoadedAt === null) return now > session.createdAt + OPEN_BY_MS;
  return now > session.firstLoadedAt + REDEEM_WITHIN_MS;
}

/* ------------------------------------------------------------------ */
/* Notification copy                                                   */
/* ------------------------------------------------------------------ */

/**
 * What the flows tell people, by in-app notice and email (FLOW-PRS-02 S6).
 *
 * UX-EW-04 §3.5 doesn't give this copy yet (pr-7 item 2, open). These are
 * the prototype's choice, written to its rules: the verifier's listed name,
 * the credential *types* and never a value, the date that matters, and §2.4's
 * verbs — share, approve, never present. The D20 line is written as
 * UX-EW-03 writes the Root's note for requests: who shared, with whom,
 * which credentials. The prototype writes each to the organisation's
 * activity feed, naming who it goes to, because there is no inbox to put it
 * in; the what's-real page says so.
 */
export const NOTICE = {
  /** FLOW-PRS-02 step 3; FLOW-PRS-01 A3 (kept for later, or 10 minutes undecided). */
  ready: (verifier: string, types: string, by: string) => `${verifier} is asking for your ${types} — answer by ${formatDate(by)}.`,
  /** A4 — passed on. */
  passed: (name: string, verifier: string, by: string) => `${name} passed you ${verifier}'s request — answer by ${formatDate(by)}.`,
  /** A1 — approvers asked. */
  approve: (name: string, types: string, verifier: string, by: string) =>
    `${name} wants to share your ${types} with ${verifier}. Approve by ${formatDate(by)}.`,
  /** D20 — the Root, whenever anyone else shares. */
  rootTold: (name: string, verifier: string, types: string, approver: string | null) =>
    `${name} shared your ${types} with ${verifier}${approver ? `, approved by ${approver}` : ""}.`,
  /** D20 — the sharer, when their share is approved. */
  approved: (approver: string, verifier: string) => `${approver} approved. Shared with ${verifier}.`,
  /** A1 after rejection — the approver's note reaches the sharer (D15). */
  rejected: (approver: string, note: string) => `${approver} didn't approve sharing this${note ? `: ${note.replace(/\.$/, "")}` : ""}.`,
  /** E16/E11 — back to OPEN for someone who may answer. */
  lapsed: (name: string, verifier: string, by: string) =>
    `${name} can no longer share ${verifier}'s request, so it hasn't been sent. It's open again — answer by ${formatDate(by)}.`,
};

/** "Business Registration and Tax Clearance Certificate". */
export const typesOf = (r: Pick<PresentationRequest, "asked">) => {
  const xs = r.asked.map((d) => d.credentialType);
  return xs.length <= 1 ? (xs[0] ?? "credentials") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
};

/** "Dorji Wangchuk", "Dorji Wangchuk and Sonam Yeshey". */
export const namesOf = (names: string[]) =>
  names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/**
 * The verified holders a person acts for — those they hold an ACTIVE
 * relation in (FLOW-PRS-01 P2). SCR-PRS-01 lists only these, and E4 is
 * this list being empty.
 */
export function holdersActedFor(s: Pick<DemoState, "relations" | "organizations">, personId: PersonId): Organization[] {
  return s.organizations.filter(
    (o) => o.capabilities.includes("holder") && s.relations.some((r) => r.personId === personId && (r.orgId ?? PELDEN) === o.id && r.state === "ACTIVE"),
  );
}
