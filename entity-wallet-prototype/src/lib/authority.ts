import { formatDate } from "@/features/controllership/scopeModel";

import {
  PELDEN,
  keyedIdHash,
  type ApprovalPolicy,
  type AuthorityDraft,
  type AuthorityGrant,
  type DemoState,
  type GrantStatus,
  type HeldCredential,
  type PersonId,
} from "./demoData";
import { approversFor, listedVerifier, namesOf, rootOf } from "./sharing";

/**
 * Flow 8's rules, as pure reads of the demo state (EW-FLOW8-SD §6, §8;
 * FLOW-AUT-01).
 *
 * WHY THEY LIVE HERE AND NOT IN A SCREEN
 *
 * As with Flow 7's `sharing.ts`: who may give authority, whether someone
 * else must approve it, which licences can be named and which counterparties
 * offered, and what a grant's state means in words are the Entity-Wallet
 * Service's answers. The store asks these before it does anything and hands
 * the same answers to the screens, so a screen that hides *Give authority*
 * and the store that refuses it can never disagree. No screen works any of
 * this out for itself, and nothing here reads who the person is in the
 * story — only their relation (FLOW-AUT-01 S6).
 *
 * WHAT A PERMISSION IS READ FROM
 *
 * The relation's `authority:issue` grant — which only the Root's scope and
 * Flow 3's *Give authority to act* box write (D21) — with that box's
 * approval setting: SINGLE_APPROVER by default, AUTO when the Root chose it,
 * and AUTO for the Root (EW-FLOW3-SD §4.2, D14). Approving is
 * `approval:decide`, never one's own grant (§8.1). Seeing grants at all is
 * `credential:list`, which every preset holds.
 */

export const today = () => new Date().toISOString().slice(0, 10);
export const inDays = (n: number, from = today()) =>
  new Date(new Date(`${from}T00:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);

/** D13 — 90 days by default, never more than a year. */
export const DEFAULT_DAYS = 90;
export const MAX_DAYS = 365;
/** D14 — a link lapses 7 days after it is ready; an approval 7 days after submission. */
export const CLAIM_DAYS = 7;
export const APPROVAL_DAYS = 7;
/** E13 — an offer not accepted in 30 minutes is withdrawn. */
export const OFFER_MS = 30 * 60_000;
/** E10 — the identity request times out after 5 minutes. */
export const IDENTITY_MS = 5 * 60_000;
/** E9, S9 — the third mismatch ends the grant. */
export const MAX_MISMATCHES = 3;

/* ------------------------------------------------------------------ */
/* The vocabulary (§5.2) and what may be relied on (D9)                */
/* ------------------------------------------------------------------ */

/**
 * The published task vocabulary's first entries — BNSW's, provisional
 * (§13 item 1). A grant names only these, and only the counterparty an
 * entry names (G5). People see the label; the scope string never reaches a
 * screen (UX-EW-05 §2.4). "Amend" has no label in the specification; this
 * one follows the form "Submit customs declarations" sets.
 */
export interface Task {
  scope: string;
  label: string;
  counterparty: string;
  /** Whether acting on it needs a business licence named (G4). */
  needsLicence: boolean;
}

export const VOCABULARY: Task[] = [
  { scope: "nsw:submit-declaration", label: "Submit customs declarations", counterparty: "org-bnsw", needsLicence: true },
  { scope: "nsw:amend-declaration", label: "Amend customs declarations", counterparty: "org-bnsw", needsLicence: true },
];

export const taskLabel = (scope: string) => VOCABULARY.find((t) => t.scope === scope)?.label ?? "Act for the organisation";

/** "submit customs declarations and amend customs declarations", for a sentence. */
export const tasksPhrase = (scopes: string[]) => namesOf(scopes.map((s) => taskLabel(s).replace(/^./, (c) => c.toLowerCase())));

/**
 * Which credential types their issuers have marked as ones someone acting
 * for the holder may rely on — the Trust Registry's `delegable` flag (D9),
 * which the registry doesn't have yet (§11.2). MoICE sets it for the
 * business licence (§7.1).
 */
export const RELIABLE_BY_SOMEONE_ACTING: { issuer: string; type: string }[] = [
  { issuer: "Ministry of Industry, Commerce & Employment", type: "Business Licence" },
];

const LICENCE_TYPES = ["Business Licence"];

export const licenceNumberOf = (c: Pick<HeldCredential, "attributes">) =>
  c.attributes.find((a) => a.name === "licence_number")?.value ?? "";

/**
 * Why a licence can't be named — G4, in the words E4 uses. Never
 * "delegable" (UX-EW-05 §2.4): the person reads what the issuer decided.
 */
export function whyLicenceUnusable(c: HeldCredential, now = today()): string | null {
  if (c.status === "revoked") return "the ministry has revoked it";
  if (c.status === "expired" || (c.expiresAt !== null && c.expiresAt < now)) return "it has expired";
  if (!c.issuerTrusted) return "the organisation that issued it isn't on NDI's list of trusted organisations";
  if (!RELIABLE_BY_SOMEONE_ACTING.some((d) => d.issuer === c.issuer && d.type === c.type)) {
    return "the organisation that issued it doesn't allow someone acting for you to use it";
  }
  return null;
}

export interface LicenceOption {
  number: string;
  credentialId: string;
  /** Null when it can be named. */
  unusable: string | null;
}

/** The organisation's business licences, each with why it can or can't be named (UXD-47). */
export function licenceOptions(s: Pick<DemoState, "heldCredentials">, orgId: string, now = today()): LicenceOption[] {
  return s.heldCredentials
    .filter((c) => (c.orgId ?? PELDEN) === orgId && LICENCE_TYPES.includes(c.type) && !c.supersededBy)
    .map((c) => ({ number: licenceNumberOf(c), credentialId: c.id, unusable: whyLicenceUnusable(c, now) }));
}

export interface CounterpartyOption {
  orgId: string;
  name: string;
  /** CURRENT on NDI's list as a verifier (G5). */
  current: boolean;
}

/** Every counterparty the vocabulary names, and whether it can be offered now. */
export function counterpartyOptions(s: Pick<DemoState, "organizations">): CounterpartyOption[] {
  const ids = [...new Set(VOCABULARY.map((t) => t.counterparty))];
  return ids.map((orgId) => {
    const org = s.organizations.find((o) => o.id === orgId);
    return { orgId, name: org?.name ?? "The organisation", current: Boolean(listedVerifier(s, orgId)) };
  });
}

export const counterpartyName = (s: Pick<DemoState, "organizations">, orgId: string) =>
  s.organizations.find((o) => o.id === orgId)?.name ?? "the organisation";

/* ------------------------------------------------------------------ */
/* Who may give authority (G1, G2) and who approves (§8)               */
/* ------------------------------------------------------------------ */

/** A person's ACTIVE relation here, in force today, and its grant for an operation. */
export function grantFor(s: Pick<DemoState, "relations">, personId: PersonId, orgId: string, op: string, now = today()) {
  for (const r of s.relations) {
    if (r.personId !== personId || (r.orgId ?? PELDEN) !== orgId || r.state !== "ACTIVE") continue;
    if (r.scope.validFrom > now || (r.scope.validUntil !== null && r.scope.validUntil < now)) continue;
    const grant = r.scope.grants.find((g) => g.operation === op);
    if (grant) return { relation: r, grant };
  }
  return null;
}

/** Everyone who may give authority for the organisation — named by E1. */
export function whoCanGive(s: Pick<DemoState, "relations">, orgId: string, except: PersonId | null = null): PersonId[] {
  const people = new Set<PersonId>();
  for (const r of s.relations) {
    if (r.personId === except || (r.orgId ?? PELDEN) !== orgId) continue;
    if (grantFor(s, r.personId, orgId, "authority:issue")) people.add(r.personId);
  }
  return [...people];
}

/**
 * G2 — the organisation in good standing: holding a verified wallet, its
 * foundational credential valid, its Root relation ACTIVE. The reason, in
 * E2's words, or null.
 */
export function standingProblem(s: Pick<DemoState, "organizations" | "heldCredentials" | "relations">, orgId: string): string | null {
  const org = s.organizations.find((o) => o.id === orgId);
  if (!org || !org.capabilities.includes("holder")) return "it isn't verified on the NDI Entity Wallet";
  const foundational = s.heldCredentials.find((c) => (c.orgId ?? PELDEN) === orgId && c.isFoundational && !c.supersededBy);
  if (!foundational || foundational.status !== "active") return "its registration isn't valid";
  if (!rootOf(s, orgId)) return "its representative hasn't confirmed their responsibilities";
  if (org.authorityListing?.status === "TERMINATED") return "it is no longer on NDI's list of trusted organisations";
  return null;
}

export type GiveVerdict =
  | { kind: "may"; policy: ApprovalPolicy; approvers: PersonId[] }
  /** G1 fails — E1, naming who can. */
  | { kind: "no_permission"; can: PersonId[] }
  /** G2 fails — E2. */
  | { kind: "not_in_standing"; reason: string }
  /** SINGLE_APPROVER and nobody else holds approval:decide. */
  | { kind: "no_approver" };

/**
 * The one answer to "can this person give authority, and does someone have
 * to approve it" — FLOW-AUT-01 P1, P2, step 5.
 *
 * Anything that isn't AUTO needs one other person. Threshold and
 * two-person approval are catalogue flow 10 (§1.2), so a policy the presets
 * never write is read as the one approval the specification defines.
 */
export function giveVerdict(s: Pick<DemoState, "relations" | "organizations" | "heldCredentials">, personId: PersonId, orgId: string): GiveVerdict {
  const problem = standingProblem(s, orgId);
  if (problem) return { kind: "not_in_standing", reason: problem };
  const found = grantFor(s, personId, orgId, "authority:issue");
  if (!found) return { kind: "no_permission", can: whoCanGive(s, orgId, personId) };
  if (found.grant.approval === "AUTO") return { kind: "may", policy: "AUTO", approvers: [] };
  const approvers = approversFor(s, orgId, personId);
  return approvers.length ? { kind: "may", policy: "SINGLE_APPROVER", approvers } : { kind: "no_approver" };
}

/* ------------------------------------------------------------------ */
/* The form's checks (G4–G7)                                           */
/* ------------------------------------------------------------------ */

export type DraftField = "name" | "cid" | "counterparty" | "tasks" | "licences" | "limit" | "until";

/** E6's copy, word for word, and the prototype's own for the fields E6 doesn't cover. */
export const FIELD_COPY: Record<string, string> = {
  until: "Authority can last up to a year.",
  untilPast: "Choose a date after today.",
  limit: "Enter a limit above zero.",
  tasks: "Choose at least one thing they can do.",
  name: "Enter their name.",
  cid: "Enter their 11-digit citizen ID number.",
  licences: "Choose a licence they can act under.",
};

export interface DraftCheck {
  errors: Partial<Record<DraftField, string>>;
  /** G5 failed — E5 names the counterparty. */
  counterpartyDown: string | null;
  /** G7 — a live grant to the same person for the same tasks and counterparty (A3). */
  duplicate: AuthorityGrant | null;
}

export const digitsOnly = (v: string) => v.replace(/\D/g, "");

/**
 * G4–G7 on a draft, as the service runs them at submission. G5 is in
 * practice prevented by the form, which offers only valid choices; it is
 * still checked, because the form is not the boundary.
 */
export function checkDraft(s: Pick<DemoState, "organizations" | "heldCredentials" | "authorityGrants">, d: AuthorityDraft, now = today()): DraftCheck {
  const errors: Partial<Record<DraftField, string>> = {};
  if (!d.name.trim()) errors.name = FIELD_COPY.name;
  if (digitsOnly(d.cid).length !== 11) errors.cid = FIELD_COPY.cid;

  let counterpartyDown: string | null = null;
  const cp = counterpartyOptions(s).find((c) => c.orgId === d.counterparty);
  if (!cp) errors.counterparty = "Choose where they can act.";
  else if (!cp.current) counterpartyDown = cp.name;

  const valid = d.tasks.filter((t) => VOCABULARY.some((v) => v.scope === t && v.counterparty === d.counterparty));
  if (valid.length === 0) errors.tasks = FIELD_COPY.tasks;

  const needsLicence = valid.some((t) => VOCABULARY.find((v) => v.scope === t)?.needsLicence);
  const usable = licenceOptions(s, d.orgId, now).filter((l) => !l.unusable).map((l) => l.number);
  if (d.licences.some((n) => !usable.includes(n))) errors.licences = "One of the licences chosen can't be used any more.";
  else if (needsLicence && d.licences.length === 0) errors.licences = FIELD_COPY.licences;

  const limit = Number(digitsOnly(d.limit));
  if (!limit || limit <= 0) errors.limit = FIELD_COPY.limit;

  if (!d.until || d.until <= now) errors.until = FIELD_COPY.untilPast;
  else if (d.until > inDays(MAX_DAYS, now)) errors.until = FIELD_COPY.until;

  return { errors, counterpartyDown, duplicate: duplicateOf(s, d) };
}

const LIVE: GrantStatus[] = ["ACTIVE", "ISSUING", "CLAIMABLE", "AWAITING_APPROVAL", "AWAITING_LISTING"];

/**
 * G7, by the keyed hash and never the number. Read over the waiting states
 * too — AWAITING_APPROVAL and AWAITING_LISTING as well as CLAIMABLE,
 * ISSUING and ACTIVE (EW-FLOW8-SD v0.3 §6): a second grant to someone whose
 * first is still waiting for approval is the same mistake (EW-FLOW8-SD v0.3 §6, G7).
 */
export function duplicateOf(s: Pick<DemoState, "authorityGrants">, d: AuthorityDraft): AuthorityGrant | null {
  if (digitsOnly(d.cid).length !== 11) return null;
  const key = keyedFor(d.orgId, d.cid);
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
  return (
    s.authorityGrants.find(
      (g) =>
        g.orgId === d.orgId &&
        LIVE.includes(g.status) &&
        g.delegateIdKeyed === key &&
        g.counterparties.includes(d.counterparty) &&
        same(g.tasks, d.tasks),
    ) ?? null
  );
}

/* One hashing, so the store's match and the form's duplicate check agree. */
export const keyedFor = (orgId: string, cid: string) => keyedIdHash(orgId, digitsOnly(cid));

/**
 * G2–G6 again, at approval and at claim — the reason, in words for E11's
 * "<Name>'s authority couldn't be given: <reason>.", or null. An
 * unreachable registry would hold the grant and retry ("Checking…"); the
 * prototype has nothing unreachable here, so only real failures end it.
 */
export function recheck(s: Pick<DemoState, "organizations" | "heldCredentials" | "relations">, g: AuthorityGrant, now = today()): string | null {
  const standing = standingProblem(s, g.orgId);
  if (standing) return `${orgName(s, g.orgId)} can't give authority at the moment — ${standing}`;
  const down = g.counterparties.find((id) => !listedVerifier(s, id));
  if (down) return `${counterpartyName(s, down)} can't accept authority from the NDI Entity Wallet at the moment`;
  const options = licenceOptions(s, g.orgId, now);
  for (const n of g.licenceNumbers) {
    const l = options.find((o) => o.number === n);
    if (!l) return `licence ${n} isn't in ${orgName(s, g.orgId)}'s wallet any more`;
    if (l.unusable) return `licence ${n} can't be used: ${l.unusable}`;
  }
  if (g.validUntil <= now) return "its end date has passed";
  return null;
}

export const orgName = (s: Pick<DemoState, "organizations">, orgId: string) =>
  s.organizations.find((o) => o.id === orgId)?.name ?? "The organisation";

/* ------------------------------------------------------------------ */
/* What a grant says                                                   */
/* ------------------------------------------------------------------ */

/** A name that ends a sentence — "Pelden Trading Pvt. Ltd." takes no second full stop. */
export const ending = (name: string) => (name.endsWith(".") ? name : `${name}.`);

export const nu = (n: number) => `Nu ${n.toLocaleString("en-US")}`;

/** The delegate's name: verified once collected, the grantor's words before. */
export const delegateNameOf = (g: Pick<AuthorityGrant, "delegateName" | "name">) => g.delegateName ?? g.name;

/**
 * The authority statement (UX-EW-05 §3.4, UXD-48) — one sentence, never a
 * table, built from vocabulary labels. SCR-AUT-03 and SCR-AUT-06 in the
 * third person; SCR-AUT-05 addressed to the delegate.
 */
export function statement(
  s: Pick<DemoState, "organizations">,
  g: Pick<AuthorityGrant, "orgId" | "tasks" | "counterparties" | "licenceNumbers" | "valueCapNu" | "validUntil" | "delegateName" | "name">,
  to: "grantor" | "delegate" = "grantor",
): string {
  const who = to === "delegate" ? "You'll" : `${delegateNameOf(g)} will`;
  const where = namesOf(g.counterparties.map((id) => counterpartyName(s, id)));
  const licences = g.licenceNumbers.length ? `, under licence ${namesOf(g.licenceNumbers)}` : "";
  return `${who} be able to ${tasksPhrase(g.tasks)} for ${orgName(s, g.orgId)} at ${where}${licences}, up to ${nu(g.valueCapNu)} per declaration, until ${formatDate(g.validUntil)}.`;
}

/** SCR-AUT-01's row: "<Name> · <task labels> at <counterparty> · under licence <numbers> · up to Nu <limit> · until <date>". */
export function rowLine(s: Pick<DemoState, "organizations">, g: AuthorityGrant): string {
  const where = namesOf(g.counterparties.map((id) => counterpartyName(s, id)));
  return [
    `${namesOf(g.tasks.map((t, i) => (i === 0 ? taskLabel(t) : taskLabel(t).replace(/^./, (c) => c.toLowerCase()))))} at ${where}`,
    g.licenceNumbers.length ? `under licence ${namesOf(g.licenceNumbers)}` : null,
    `up to ${nu(g.valueCapNu)}`,
    `until ${formatDate(g.validUntil)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export type Tab = "active" | "waiting" | "ended";

/** SCR-AUT-01's three tabs: SUSPENDED sits under Active, marked Paused. */
export function tabOf(status: GrantStatus): Tab {
  if (status === "ACTIVE" || status === "SUSPENDED") return "active";
  if (status === "AWAITING_APPROVAL" || status === "AWAITING_LISTING" || status === "CLAIMABLE" || status === "ISSUING") return "waiting";
  return "ended";
}

/** A grant may be cancelled before the delegate accepts it (E14). */
export const cancellable = (g: AuthorityGrant) =>
  g.status === "AWAITING_APPROVAL" || g.status === "AWAITING_LISTING" || g.status === "CLAIMABLE" || (g.status === "ISSUING" && !g.accepted);

/**
 * The state in words — a pill key, its label, and a sentence — for
 * SCR-AUT-01 and SCR-AUT-04 (UX-EW-03's state-in-words pattern; never
 * colour alone, SC 1.4.1).
 */
export function stateWords(
  g: AuthorityGrant,
  names: { person: (id: PersonId | null | undefined) => string; approvers: string[]; org: string },
): { pill: string; label: string; sentence: string } {
  const n = delegateNameOf(g);
  switch (g.status) {
    case "AWAITING_APPROVAL":
      return { pill: "awaiting_approval", label: "Waiting for approval", sentence: `Sent to ${namesOf(names.approvers) || "an approver"} to approve` };
    case "AWAITING_LISTING":
      return { pill: "listing", label: "Setting up", sentence: `Setting up ${names.org} to give authority…` };
    case "CLAIMABLE":
      return { pill: "pending", label: "Not yet collected", sentence: `Not yet collected — link expires ${formatDate(g.claimExpiresAt ?? g.statusAt)}` };
    case "ISSUING":
      return g.accepted
        ? { pill: "processing", label: "Finishing", sentence: `${n} has accepted — finishing setting it up` }
        : { pill: "processing", label: "Collecting", sentence: `${n} is collecting their authority.` };
    case "ACTIVE":
      return { pill: "active", label: "Active", sentence: `${n} has their authority.` };
    case "SUSPENDED":
      return { pill: "suspended", label: "Paused", sentence: `${n}'s authority is paused.` };
    case "EXPIRED":
      return { pill: "expired", label: "Ended", sentence: `Ended on ${formatDate(g.validUntil)}, its end date.` };
    case "REVOKED":
      return { pill: "revoked", label: "Withdrawn", sentence: g.endReason ?? `${names.org} withdrew it.` };
    case "REJECTED":
      return {
        pill: "rejected",
        label: "Not approved",
        sentence: g.endReason ?? `${names.person(g.rejection?.by)} didn't approve giving ${n} authority.`,
      };
    case "CANCELLED":
      return { pill: "withdrawn", label: "Cancelled", sentence: g.endReason ?? `Cancelled by ${names.person(g.cancelledBy)}. The link no longer works.` };
    case "DECLINED":
      return { pill: "declined", label: "Declined", sentence: `${n} declined the authority.` };
    case "LAPSED":
      return { pill: "lapsed", label: "Not collected", sentence: g.endReason ?? `${n} didn't collect their authority. Nothing was given.` };
    case "FAILED":
      return { pill: "failed", label: "Couldn't be given", sentence: g.endReason ?? `${n}'s authority couldn't be given.` };
  }
}

/* ------------------------------------------------------------------ */
/* Endings that come with a date (D13, D14)                            */
/* ------------------------------------------------------------------ */

/**
 * Whether a date has ended a grant: a link nobody collected in 7 days and
 * an approval nobody gave in 7 days lapse (E15, A1); an issued authority
 * past its end date expires. A grant in ISSUING lapses only after it
 * returns to CLAIMABLE (E15's note), so it isn't read here.
 */
export function grantEnding(g: AuthorityGrant, now = today()): { status: GrantStatus; endReason: string } | null {
  const n = delegateNameOf(g);
  if (g.status === "CLAIMABLE" && g.claimExpiresAt && g.claimExpiresAt < now) {
    return { status: "LAPSED", endReason: NOTICE_GRANT.notCollected(n, g.claimExpiresAt) };
  }
  if (g.status === "AWAITING_APPROVAL" && inDays(APPROVAL_DAYS, g.submittedAt) < now) {
    return { status: "LAPSED", endReason: NOTICE_GRANT.nobodyApproved(n, inDays(APPROVAL_DAYS, g.submittedAt)) };
  }
  if (g.status === "ACTIVE" && g.validUntil < now) {
    return { status: "EXPIRED", endReason: "Reached its end date." };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* What people are told (D18)                                          */
/* ------------------------------------------------------------------ */

/**
 * FLOW-AUT-01 §6 and UX-EW-05 §3.5's copy where they give it, word for
 * word; the rest — the approvers asked, the link being ready, the Root told
 * a link is out and that it was collected — is the prototype's, written to
 * the same rules: the person's name, what for, and the date that matters,
 * never a scope string or an ID number. Written to the organisation's
 * activity feed, saying who it goes to, as Flow 7's are.
 */
export const NOTICE_GRANT = {
  /** A1 — the approvers asked. */
  approve: (grantor: string, name: string, by: string) => `${grantor} wants to give ${name} authority. Approve by ${formatDate(by)}.`,
  /** A1 — to the grantor, on the screen and as a notice. */
  sent: (approvers: string) => `Sent to ${approvers} to approve. We'll tell you when the link is ready.`,
  /** A1 approved — the grantor. */
  approved: (approver: string, name: string) => `${approver} approved giving ${name} authority. The link is ready.`,
  /** Step 7 — the grantor, when the link is ready after approval or setting up. */
  linkReady: (name: string) => `The link for ${name} is ready. Send it the way you usually reach them.`,
  /** A1 rejected (§3.5). */
  rejected: (approver: string, name: string, note: string) =>
    `${approver} didn't approve giving ${name} authority${note ? `: ${note.replace(/\.$/, "")}` : ""}.`,
  /** A1 lapsed (§3.5). */
  nobodyApproved: (name: string, by: string) => `Nobody approved giving ${name} authority by ${formatDate(by)}. Nothing was given.`,
  /** E15 (§3.5). */
  notCollected: (name: string, by: string) => `${name} didn't collect their authority by ${formatDate(by)}. Nothing was given.`,
  /** E9 on FAILED — the grantor (§3.5). */
  someoneElse: (name: string) => `Someone else tried to collect the authority for ${name}. Nothing was given. Give it again with a new link if you still need to.`,
  /** E11 — the grantor (§3.5). */
  couldNot: (name: string, reason: string) => `${name}'s authority couldn't be given: ${reason}.`,
  /** E16 — the grantor (§3.5). */
  grantorLapsed: (name: string) => `${name}'s authority couldn't be given: you can no longer give authority.`,
  /** E16 — the approver (§3.5). */
  approverLapsed: (grantor: string) => `${grantor} can no longer give authority, so this hasn't gone ahead.`,
  /** A2 — the grantor (§3.5). */
  declined: (name: string) => `${name} declined the authority.`,
  /** Step 16 — the grantor (SCR-AUT-04 Done). */
  active: (name: string) => `${name} has their authority.`,
  /** E14 — the grantor (§3.5). */
  cancelled: "Cancelled. The link no longer works.",
  /** E3 after 24 hours (§3.5). */
  listingFailed: "We couldn't set this up. Nothing has been given. Try again later.",
  /** D18 — the Root, when someone else's grant puts a link in circulation. */
  rootLinkOut: (grantor: string, name: string, what: string) => `${grantor} gave ${name} authority to ${what}. The link to collect it is out.`,
  /** E14 — the Root, when someone else cancelled the authority (§3.5). */
  rootCancelled: (person: string, name: string) => `${person} cancelled the authority for ${name}. Nothing was given.`,
  /** E14 — the grantor, when someone else cancelled it: the prototype's, §3.5 gives only the Root's. */
  cancelledBy: (person: string, name: string) => `${person} cancelled the authority for ${name}. The link no longer works.`,
  /** E18 — the delegate, after identity matches again while an offer was out (§3.5). */
  startedAlready: "You've already started collecting this. We've sent it to your Bhutan NDI app again.",
  /** D18 — the Root, when it is collected, declined, fails or lapses. */
  rootOutcome: (grantor: string, text: string) => `${text} (Given by ${grantor}.)`,
};

/** A SHA-256-shaped fingerprint of the grant as submitted — the shape of `approvalHash`, not a real hash. */
export function fingerprint(parts: string[]): string {
  let a = 0x6a09e667;
  let b = 0xbb67ae85;
  const text = parts.join("|");
  for (let i = 0; i < text.length; i += 1) {
    a = Math.imul(a ^ text.charCodeAt(i), 0x5bd1e995) >>> 0;
    b = Math.imul(b ^ text.charCodeAt(text.length - 1 - i), 0x27d4eb2d) >>> 0;
  }
  const hex = (n: number) => n.toString(16).padStart(8, "0");
  return `sha256:${hex(a)}${hex(b)}${hex(a ^ b)}${hex(Math.imul(a, 31) >>> 0)}${hex(Math.imul(b, 17) >>> 0)}${hex((a + b) >>> 0)}`;
}

/** Who to tell about a grant: the grantor, and the Root when the grantor isn't the Root (D18). */
export function toldOf(s: Pick<DemoState, "relations">, g: AuthorityGrant): { grantor: PersonId; root: PersonId | null } {
  const root = rootOf(s, g.orgId);
  return { grantor: g.grantedBy, root: root && root !== g.grantedBy ? root : null };
}
