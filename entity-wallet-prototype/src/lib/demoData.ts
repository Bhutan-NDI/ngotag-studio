/**
 * The demo's data model and its seed.
 *
 * There is no backend and there is not meant to be one — this is the Studio's
 * front end running against an in-browser store so the whole product can be
 * driven in a demo. Everything the UI can create, it creates here; everything
 * it lists, it lists from here. The seed exists so the app is worth looking at
 * on first load rather than being a tour of empty states.
 *
 * Ids are readable rather than random where they show up in the UI — a
 * readable id reads better in a demo than a uuid. DIDs are the exception:
 * they are did:polygon, because the NDI's verifiable data registry is anchored
 * on Polygon/Ethereum, and a DID shaped like the real thing is worth more here
 * than a memorable one. (They were did:indy:bhutan:… until the documentation
 * review flagged that method as wrong for the NDI.)
 */

import { SELF_SERVICE_SIGNUP_ENABLED } from "./deployment";

export type LedgerKind = "AnonCreds" | "W3C";
export type CredentialState = "offered" | "accepted" | "declined" | "revoked";
export type VerificationState = "requested" | "verified" | "declined" | "expired";

export interface Attribute {
  name: string;
  type: "string" | "number" | "boolean" | "date";
}

export interface Schema {
  id: string;
  name: string;
  version: string;
  ledger: LedgerKind;
  issuerDid: string;
  attributes: Attribute[];
  createdAt: string;
}

export interface CredDef {
  id: string;
  schemaId: string;
  tag: string;
  revocable: boolean;
  createdAt: string;
}

export interface Did {
  id: string;
  method: string;
  keyType: string;
  alias: string;
  isIssuer: boolean;
  createdAt: string;
}

export interface Connection {
  id: string;
  label: string;
  status: "active" | "invited";
  createdAt: string;
}

export interface Credential {
  id: string;
  holder: string;
  schemaName: string;
  credDefTag: string;
  state: CredentialState;
  issuedAt: string;
  method: "connection" | "email" | "qr" | "bulk";
}

export interface Verification {
  id: string;
  holder: string;
  schemaName: string;
  state: VerificationState;
  requestedAt: string;
}

/**
 * What an organisation may do on the NDI platform. Three separate grants,
 * held in any combination:
 *
 * - issuer / verifier — the platform's existing product. Bank of Bhutan has
 *   both: it issues account credentials and checks proofs at the counter.
 * - holder — the Entity Wallet: the organisation holds credentials issued to
 *   *it*, and people act for it under scoped authority.
 *
 * They arrive by different doors (Flow 1: tiered access). A company that
 * signs up for itself gets holder and nothing else; an organisation already
 * issuing on NDI asks for holder and is invited to it; issuer and verifier
 * are granted by an NDI platform admin on request.
 */
export type OrgCapability = "issuer" | "verifier" | "holder";

export interface Organization {
  id: string;
  /**
   * The entity type its authority verified it as (FLOW-ORG-01). Decides,
   * among other things, whether appointing someone is offered at all
   * (UXD-24). Absent on organisations that predate verification.
   */
  kind?: OrgKind;
  /**
   * Constituted by statute or executive order, with no register to verify it
   * against — a ministry, an authority. It is an issuer and a verifier and
   * never a holder, so it has no business-verification route; it reaches the
   * platform through a designation or an approval (EW-FLOW2-SD v0.13 §2.2,
   * D4; FLOW-ORG-01 §1.2).
   */
  statutory?: boolean;
  name: string;
  description: string;
  role: "Owner" | "Admin" | "Member";
  members: number;
  createdAt: string;
  website?: string;
  location?: string;
  visibility: "public" | "private";
  capabilities: OrgCapability[];
  /** Who belongs to it — decides whose switcher it appears in. */
  memberIds: PersonId[];
  /**
   * Each member's role in *this* organisation, for people who joined it by
   * invitation. A person's own `memberRole` was written when Pelden was the
   * only organisation, and one field cannot hold two roles: inviting Bank of
   * Bhutan's owner into Pelden as an admin overwrote it, and made them an
   * admin of the bank too (AC-10 — each membership at its own role, neither
   * affecting the other). Read through `roleIn`, which falls back to
   * `memberRole` for the seed's Pelden people.
   */
  roles?: Record<PersonId, "Owner" | "Admin" | "Member">;
  /**
   * The identity it would be publicly listed under, if it has one
   * (EW-FLOW4-SD/D13). An organisation already issuing keeps the one it has,
   * whatever its method — recorded as an exception (§10).
   */
  publicDid?: string;
  /**
   * A did:ethr created for an approval but not primary yet (FLOW-ACC-01
   * step 5, FLOW-ACC-02 step 4). It becomes `publicDid` — the primary — only
   * once the acceptance is recorded (ACC-01 step 8) or the request approved
   * (ACC-02 step 8). Until then nothing the organisation already does uses
   * it, so a wallet step that doesn't confirm (ACC-01/E4) or a declined
   * request (ACC-02 AC-07) leaves the organisation exactly as it was. It used
   * to be made primary the moment it was created, which put an unlisted DID
   * into every invitation the organisation sent while it waited.
   */
  pendingDid?: string;
  /** Its name on the register, when that differs from how it is known. */
  legalName?: string;
  /**
   * Its primary issuing identity — what FLOW-ORG-02 P4 reads. Named by
   * method only on SCR-DSG-04 and SCR-ACC-03, where someone acts on it.
   */
  issuingDid?: string;
  /** Whether its agent and wallet are provisioned (FLOW-ORG-02 P3). */
  agentReady?: boolean;
  /** Marketplace entitlements, read directly — never inferred (P5). */
  entitlements?: string[];
  /**
   * Flow 8 — its listing on NDI's list of trusted organisations as an issuer
   * of authority, written when it makes its first grant (EW-FLOW8-SD D5,
   * §7.1). `did` is the publishing did:ethr made in the grantor's session;
   * it becomes the primary DID once listed, which the prototype records
   * here rather than on `publicDid`, so Flow 4's accreditation screens don't
   * read it as an approval to verify. `firstNotice` is SCR-AUT-01's
   * first-grant notice, naming the counterparty, until dismissed.
   */
  authorityListing?: {
    status: "PENDING" | "CURRENT" | "TERMINATED";
    did: string;
    listedAt: string | null;
    firstNotice?: string | null;
  };
}

/** An invitation to join an ecosystem, as opposed to an organization. */
export interface EcosystemInvitation {
  id: string;
  ecosystem: string;
  invitedBy: string;
  role: "Issuer" | "Verifier";
  receivedAt: string;
  state: "pending" | "accepted" | "declined";
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Issuer" | "Verifier" | "Member";
  status: "active" | "invited";
  joinedAt: string;
}

export interface Certificate {
  id: string;
  commonName: string;
  keyType: string;
  validFrom: string;
  expires: string;
  status: "valid" | "expiring" | "expired";
}

export interface Invitation {
  id: string;
  organization: string;
  invitedBy: string;
  role: string;
  receivedAt: string;
  state: "pending" | "accepted" | "declined";
}

export interface Ecosystem {
  id: string;
  name: string;
  role: "Lead" | "Member";
  members: number;
  joinedAt: string;
}

export interface EcosystemMember {
  id: string;
  organization: string;
  role: "Lead" | "Issuer" | "Verifier";
  joinedAt: string;
  status: "active" | "invited";
}

export interface BulkUpload {
  id: string;
  fileName: string;
  records: number;
  succeeded: number;
  failed: number;
  status: "completed" | "partial" | "processing";
  uploadedAt: string;
}

export interface BulkRecord {
  id: string;
  uploadId: string;
  holder: string;
  status: "issued" | "failed";
  error?: string;
}

export interface ApiKey {
  id: string;
  label: string;
  masked: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

/* ================================================================== */
/* Entity Wallet                                                       */
/*                                                                     */
/* Everything below serves one story: Pelden Trading becomes real,  */
/* grants Rinzin a narrow authority, works under approval, delegates to */
/* Pema's own wallet, has that authority checked at a counterparty —   */
/* once passing, once failing — and leaves Pema a way to appeal.       */
/*                                                                     */
/* Two conventions worth stating once, because they run through all of */
/* it:                                                                 */
/*                                                                     */
/* 1. Anything named `decision` or `outcome` is a value the server      */
/*    would have returned. The UI renders it; the UI never computes it. */
/*    Deriving "is this in scope?" on the client would be four lines    */
/*    here and a lie about where authority lives — see CLAUDE.md.      */
/*                                                                     */
/* 2. A person is referenced by id, never by name, so that dual         */
/*    attribution has one place to resolve names and cannot drift.     */
/* ================================================================== */

/**
 * Everyone the entity knows about. A superset of the personas: the relations
 * register has to show people the demo is never driven as, or it shows one
 * row and teaches nothing about lifecycle.
 */
export type PersonId = string;

/**
 * The people the demo can be *driven* as.
 *
 * Four rather than three, and the fourth exists for a reason worth recording.
 * Act 2 is a grant being created from nothing, which means it needs somebody
 * who does not already hold a controllership — and everyone else does, or
 * shouldn't. Rinzin's relation is seeded active so act 3 can be shown on its
 * own; Pema is a Pattern B delegate and giving her a controllership would
 * teach the wrong model; Karma has left. Without Ugyen, act 2's person
 * selector offers only people it then refuses, and the act cannot be
 * completed at all.
 */
export type PersonaId =
  | "dorji"
  | "rinzin"
  | "pema"
  | "ugyen"
  | "invitee"
  | "yeshey"
  | "kesang"
  | "deki"
  | "root"
  | "tshering"
  | "tshendu";

/** The drivable personas, in story order. One list, so the harness, the nav
 *  and the acceptance screen cannot disagree about who exists.
 *
 *  Two kinds arrived with Flow 1. NDI's administrators: the root account,
 *  and two named platform admins, Kinzang Dorji and Tshendu. Two, because
 *  the root account approves nothing (FLOW-ONB-02 v0.6, S2, E13): every
 *  second approval is a second named admin, and anything needing one is
 *  refused while fewer than two are active (P7, E12). Root brings both on
 *  at bootstrap (S9). And "invitee" is whoever last accepted a member invitation: not a named
 *  character, because the person is whoever the owner typed into the invite
 *  form, and their record only exists once they have accepted. The harness
 *  shows a persona only while its person exists, so the invitee appears the
 *  moment there is one. An administrator invited at an unknown address is
 *  the same: a record of their own, listed once they have set up. */
export const PERSONAS: PersonaId[] = [
  "dorji",
  "rinzin",
  "pema",
  "ugyen",
  "invitee",
  "yeshey",
  "kesang",
  "deki",
  "root",
  "tshering",
  "tshendu",
];

/** NDI's own administrators — not members of any business on the platform. */
export const PLATFORM_ADMINS: PersonaId[] = ["tshering", "tshendu"];

/**
 * NDI's root administrator — seeded once by the deployment (Flow 1
 * preconditions: "at least one Root Admin exists"), never onboarded.
 *
 * WHY ROOT SIGNS IN AND NEVER SIGNS UP
 *
 * An earlier version had root create an account with the seeded address and
 * be "recognised" on the welcome screen. That read as root being onboarded
 * like a business — the room saw "Your account is ready · Add your
 * organisation" and asked why the platform's owner was being asked to set
 * anything up. It also meant anyone who typed root's address first became
 * root. The account now exists from the deployment: root signs in, lands in
 * NDI's own organisation, and sign-up refuses the address as taken.
 */
export const ROOT_ADMIN: PersonaId = "root";

/**
 * Bhutan NDI's own organisation — the platform administration organisation
 * (Flow 1 design D9), seeded rather than onboarded. Root and the admins root
 * invites belong to it. It has everything the Studio does, because NDI runs
 * the network the Studio is for; and it is not an organisation *on* the
 * platform, so it never appears in the admin's list of organisations.
 */
export const NDI_ORG = "org-ndi";

/**
 * The story's entity. Wallet records without an `orgId` are its — the seed
 * was written when it was the only wallet — and `inOrg` is the one place
 * that assumption lives.
 */
export const PELDEN = "org-pelden";
export const inOrg =
  (orgId: string) =>
  (x: { orgId?: string }): boolean =>
    (x.orgId ?? PELDEN) === orgId;

/**
 * An organisation's name as running text uses it: "Pelden Trading", not
 * "Pelden Trading Pvt. Ltd.". The legal suffix belongs in headings, on the
 * registration and in the switcher; mid-sentence it ends in a full stop
 * that collides with the sentence's own — "a member of Pelden Trading Pvt.
 * Ltd.." — which is how it first showed up on the member's dashboard.
 */
export const shortOrgName = (name: string) => name.replace(/ (Pvt\. )?Ltd\.$/, "");

/** A person's role in one organisation, or undefined if they do not belong to it. */
export const roleIn = (
  org: Pick<Organization, "id" | "memberIds" | "roles"> | undefined,
  person: Pick<Person, "id" | "memberRole"> | undefined,
): "Owner" | "Admin" | "Member" | undefined => {
  if (!org || !person || !org.memberIds.includes(person.id)) return undefined;
  return org.roles?.[person.id] ?? (org.id === PELDEN ? person.memberRole : undefined);
};

/** Whether someone administers the platform: root, or an admin root invited. */
export const isPlatformAdmin = (person: { platformRole?: "root" | "admin" } | undefined) =>
  person?.platformRole === "root" || person?.platformRole === "admin";

/**
 * A named platform admin — never the root account. Routine decisions and
 * every second approval belong to named admins only: the root account
 * approves nothing and does no routine work (FLOW-ONB-02 v0.6, S2, S9,
 * E13). isPlatformAdmin above still answers "may see NDI administration",
 * which root may; this answers "may decide something there", which it may
 * not.
 */
export const isNamedAdmin = (person: { platformRole?: "root" | "admin" } | undefined) =>
  person?.platformRole === "admin";

export interface Person {
  id: PersonId;
  name: string;
  /** Shown as a masked CID; a real one is never a display string. */
  cid: string;
  email: string;
  /** What they are to the entity, in words the UI can print. */
  title: string;
  /** Whether the register has confirmed them. Gates C2's person selector. */
  cidVerified: boolean;
  /**
   * Their role in Pelden Trading, if they belong to it at all.
   *
   * Membership, not authority (FLOW-ONB-02 Q4). A member can sign in and see
   * the organisation; acting for it needs a controllership relation on top,
   * granted separately and accepted (Flow 3). The two are kept in different
   * places precisely so that nothing can read one as the other. Absent for
   * people outside the company — Pema is an external clearing agent, and
   * NDI's administrators belong to no business at all.
   */
  memberRole?: "Owner" | "Admin" | "Member";
  /**
   * NDI's own staff: root (seeded by the deployment) or an admin root
   * invited. Independent of memberRole — an administrator belongs to no
   * business.
   */
  platformRole?: "root" | "admin";
  /**
   * False until the person has created their account. Absent means they
   * have one. It is what lets the platform's day zero exist at all: the
   * people are known to the story before any of them has signed up.
   */
  hasAccount?: boolean;
  /**
   * The invitation that brought them onto the platform, for someone who
   * joined an organisation during the demo at an address the story does
   * not know. Marks the record as drivable: the harness and the sign-in
   * panel list the story's named characters (PERSONAS) and, after them,
   * whoever the presenter invited — any number of them, since an owner
   * invites more than one colleague.
   */
  joinedBy?: string;
}

/**
 * The operations a scope can grant. These are the brief's operation names
 * rather than friendlier ones, because they appear in audit rows and parked
 * operations where matching the server's vocabulary matters more than reading
 * nicely. `scopeModel.ts` is what turns them into English.
 */
export type ControllerOperation =
  | "credential:receive"
  | "credential:accept"
  | "credential:list"
  | "proof:present"
  | "connection:create"
  | "approval:decide"
  /* Giving someone authority to act in their own wallet (EW-FLOW8-SD §8.1).
     The Root holds it, and so does a Controller ticked for *Give authority
     to act* on SCR-DEL-02 (EW-FLOW3-SD §4.2, D18). */
  | "authority:issue";

export type ApprovalPolicy = "AUTO" | "SINGLE_APPROVER" | "DUAL_CONTROL";

export type LegalBasis = "entity_consent" | "court_order" | "governance_prescribed";

export type RelationState =
  | "DRAFT"
  | "PENDING_ACCEPTANCE"
  | "PENDING_REGISTRATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "TERMINATED"
  | "EXPIRED";

/**
 * A dimension of a grant: either everything, or a named list.
 *
 * Modelled as a union rather than an empty array meaning "any", because the
 * difference between "to any relying party" and "to nobody" is the difference
 * between a broad grant and a useless one, and an empty array reads as both.
 */
export type ScopeFilter = { mode: "any" } | { mode: "list"; values: string[] };

/**
 * One operation, with its own filters and its own approval policy.
 *
 * The per-grant approval policy is the reason a relation renders as several
 * sentences instead of one: writing the read-mode sentences by hand made it
 * obvious that "everything he does needs an approver" is usually false —
 * accepting offers is automatic while presenting proofs is not, and a single
 * trailing clause can only tell that truth when every policy agrees.
 */
export interface ScopeGrant {
  operation: ControllerOperation;
  credentialTypes: ScopeFilter;
  relyingParties: ScopeFilter;
  approval: ApprovalPolicy;
}

export interface Scope {
  /** Audit rows cite the version that was matched, so it has to be on here. */
  version: number;
  validFrom: string;
  validUntil: string | null;
  grants: ScopeGrant[];
}

/** The signed instrument behind a relation — stored as a hash and a reference. */
export interface Instrument {
  fileName: string;
  hash: string;
  reference: string;
}

export interface ControllershipRelation {
  id: string;
  /** The entity it is authority over. Absent means Pelden Trading. */
  orgId?: string;
  personId: PersonId;
  legalBasis: LegalBasis;
  instrument: Instrument | null;
  scope: Scope;
  state: RelationState;
  /** The Owner's own full-scope relation. Renders as a special case. */
  isRootAuthority: boolean;
  createdAt: string;
  acceptedAt: string | null;
  activatedAt: string | null;
  suspendedAt?: string | null;
  endedReason?: string | null;
  /**
   * Why a pending appointment became EXPIRED (EW-FLOW3-SD §5.1). One state,
   * because none of them ever authorised anything; four reasons, because
   * each tells the person something different.
   */
  expiryReason?: ExpiryReason | null;
  /*
   * FLOW-DEL-01 — an appointment made on SCR-DEL-02. Absent on the story's
   * older relations, which were authored operation by operation before the
   * presets were agreed (EW-FLOW3-SD/D8).
   */
  /** Which presets were ticked — one or more (EW-FLOW3-SD §4.2, D18). */
  presets?: PresetId[];
  /**
   * The single preset an appointment carried before presets could be
   * combined. Only a demo saved then still has it; `presetsOf` reads it.
   */
  preset?: string;
  /** For *Share*: named organisations, or any (§4.2). */
  shareReach?: ShareReach;
  /** For *Share*: whether each share needs someone to approve it. */
  shareNeedsApproval?: boolean;
  /** For *Give authority to act*: whether each grant needs approval. */
  issueNeedsApproval?: boolean;
  /** The representative's required statement that they may make it (D5). */
  attestation?: { attestedBy: PersonId; attestedAt: string };
  /** The optional authorising document — cited, never uploaded (D5). */
  document?: AppointmentDocument | null;
  /** A pending appointment lapses after 14 days (DEL-01/E4). */
  expiresAt?: string | null;
  /** The appointee's name as their citizen credential gave it, at acceptance (D6). */
  verifiedName?: string | null;
}

/**
 * The four things a representative can let someone do, ticked in any
 * combination (EW-FLOW3-SD §4.2, D18; UXD-58). Raw scope is never authored
 * on a screen; the ticked presets resolve to one, in
 * `features/appointment/presets.ts`. There is no *Everything*.
 */
export type PresetId = "receive" | "share" | "approve" | "give_authority";

/** Who *Share* may share with: the organisations named, or any (§4.2). */
export type ShareReach = "named" | "any";

/**
 * Whether a relation still stands — in force, or offered and not yet
 * lapsed. A pending appointment past its 14 days is over (DEL-01/E4) even
 * before anything records it as EXPIRED, so everything that asks "does this
 * person already have authority?" asks this, not the raw state. Otherwise an
 * expired offer would block appointing the same person again.
 */
export function standsNow(r: Pick<ControllershipRelation, "state" | "expiresAt">, today: string): boolean {
  return r.state === "ACTIVE" || (r.state === "PENDING_ACCEPTANCE" && !(r.expiresAt && r.expiresAt < today));
}

/**
 * The four reasons an appointment that was never accepted ends: the
 * appointee said no, the representative withdrew it (D19), 14 days passed,
 * or the organisation or its representative stopped standing behind it.
 */
export type ExpiryReason = "DECLINED" | "WITHDRAWN" | "TIMED_OUT" | "BASIS_LOST";

/**
 * Whether a member can be appointed now, and if not, which refusal applies
 * (FLOW-DEL-01 P3). Split since FLOW-DEL-01 v0.8: someone who can already
 * act is E3, and someone with an appointment still waiting for them is E14 —
 * they can't act yet, so the screen mustn't say they can. The store refuses
 * with this, and SCR-DEL-02 shows the same answer, so the two never differ.
 */
export function appointmentHeld(
  relations: Pick<ControllershipRelation, "orgId" | "personId" | "isRootAuthority" | "state" | "expiresAt">[],
  orgId: string,
  personId: string,
  today: string,
): "E3" | "E14" | null {
  const theirs = relations.filter((r) => inOrg(orgId)(r) && r.personId === personId && !r.isRootAuthority && standsNow(r, today));
  if (theirs.some((r) => r.state === "ACTIVE")) return "E3";
  if (theirs.length) return "E14";
  return null;
}

/**
 * The document behind an appointment, if the representative cites one. The
 * type, date and where the original is kept — and the file's name, standing
 * in for the hash the browser would compute. The file never leaves the
 * device, and NDI never reads it (EW-FLOW3-SD/D5).
 */
export interface AppointmentDocument {
  type: "board_resolution" | "power_of_attorney" | "other";
  date: string;
  reference: string;
  fileName: string | null;
}

/**
 * The representative's acceptance of responsibility for an organisation
 * (FLOW-DEL-02). Written when the authority confirms them, and accepted on
 * SCR-DEL-01. An organisation with no entry here is one whose
 * representative accepted long ago — the story's lived-in organisations.
 */
export interface Responsibility {
  orgId: string;
  state: "PENDING" | "ACCEPTED" | "DECLINED";
  at: string;
}

/**
 * The NDI-operated organisation that sends the appointee's identity request
 * (EW-FLOW3-SD/D15). Its display name is set when it is seeded and is not
 * decided yet; this is the prototype's stand-in, and SCR-DEL-04 names it
 * exactly as the wallet would.
 */
export const VERIFICATION_ORG_NAME = "Bhutan NDI Verification";

/** An attribute as it actually arrived, value included. */
export interface CredentialAttribute {
  name: string;
  value: string;
}

/** A credential the *entity* holds. Distinct from `Credential`, which the
 *  entity issued to somebody else. */
export interface HeldCredential {
  id: string;
  /** Whose wallet it is in. Absent means Pelden Trading's. */
  orgId?: string;
  type: string;
  issuer: string;
  issuerDid: string;
  issuerTrusted: boolean;
  attributes: CredentialAttribute[];
  /** The root everything else chains from. Gets its own treatment in B3. */
  isFoundational: boolean;
  receivedAt: string;
  expiresAt: string | null;
  status: "active" | "expired" | "revoked";
  /**
   * The held credential that replaced this one: a newer one of the same type
   * from the same issuer DID, accepted by either route (EW-FLOW6-SD §4.5).
   * Both are kept — this one is the record — but this one is never presented
   * as a prerequisite and doesn't count towards one. Which one a relying
   * party receives is flow 7's: it preselects the newest.
   */
  supersededBy?: string;
}

/**
 * The held credential a newly stored one would supersede — same
 * organisation, same type, same issuer DID, not already superseded — or
 * undefined. One rule for both routes (EW-FLOW6-SD §4.5), read by the store
 * when it stores and by SCR-CRD-04 when it says "This replaces …".
 */
export const supersedes = (
  held: HeldCredential[],
  orgId: string,
  type: string,
  issuerDid: string,
): HeldCredential | undefined =>
  held
    .filter((c) => (c.orgId ?? PELDEN) === orgId && c.type === type && c.issuerDid === issuerDid && !c.supersededBy)
    .sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1))[0];

/**
 * What the server said about an operation the Controller wants to run.
 * Never computed here — see the header note.
 */
export type ScopeDecision = "allowed" | "out_of_scope" | "requires_approval";

/**
 * An offer sent without a request — the organisation's inbox item
 * (FLOW-CRD-02). It is reviewed on SCR-CRD-04, the same screen a requested
 * offer uses, under the same checks.
 *
 * Only offers from issuers on NDI's list get here: anything else is refused
 * on arrival and kept on the Activity tab alone (`RefusedOffer`, D1/D14).
 * Accepting needs a person with credential:accept and never an approver —
 * every preset carries it AUTO (EW-FLOW6-SD §5.3) — so there is no
 * waiting-for-approval state.
 */
export interface CredentialOffer {
  id: string;
  /** Whose wallet it was offered to. Absent means Pelden Trading's. */
  orgId?: string;
  type: string;
  issuer: string;
  issuerDid: string;
  /** Read from the offer payload, not from anything a user typed. */
  attributes: CredentialAttribute[];
  state: "pending" | "accepted" | "declined" | "expired" | "failed";
  receivedAt: string;
  /** offerExpiresAt — 30 days from arrival (EW-FLOW6-SD §4.4). */
  expiresAt: string;
  /** Who accepted or declined it, and when (Q2). */
  decidedBy?: PersonId | null;
  decidedAt?: string | null;
  /** Why it ended without being added, in words, and the reason code (E9). */
  failReason?: string | null;
  failCode?: "ISSUER_NOT_TRUSTED" | "ISSUANCE" | null;
  /**
   * What re-running C2 at acceptance will find — set only by SCR-CRD-04's
   * prototype control, standing in for the issuer leaving NDI's list or the
   * list being out of reach while the offer waited (E9 / FLOW-CRD-01 E19).
   */
  simulatedRecheck?: "delisted" | "unreachable" | null;
}

/**
 * Flow 7 — a proof request a verifier sent the organisation, on the
 * holder's side (EW-FLOW7-SD §4.1). One record for both ways a request
 * arrives: by redirect from the verifier's website (FLOW-PRS-01, with a
 * session) and on a connection the organisation already has (FLOW-PRS-02).
 *
 * WHY THE WHOLE CREDENTIAL, AND NO "DISCLOSING" FIELD
 *
 * The pre-spec screen kept a list of the attributes a Controller chose to
 * disclose, ticked down from what the bank asked for. Entity credentials
 * are JSON-LD, and a JSON-LD credential signed the way the platform signs
 * cannot be presented in part (D4). So there is nothing to choose below the
 * credential: `asked` is what the verifier's request names, kept so the
 * consent can mark it, and `chosen` is which held credential answers each
 * descriptor — every attribute of it goes.
 *
 * WHERE THE VERIFIER'S NAME COMES FROM
 *
 * `verifierName` is the name NDI lists for the verifier organisation, never
 * one the link or the request supplied (UXD-41). The one exception is a
 * BLOCKED request whose sender isn't on the platform at all: there is no
 * listing to read, so the name is what it *claimed*, and the Refused tab
 * says "claiming to be" for that reason (FLOW-PRS-02 E1).
 */
export type PresentationStatus =
  | "RECEIVED"
  | "BLOCKED"
  | "OPEN"
  | "AWAITING_APPROVAL"
  | "SHARED"
  | "DECLINED"
  | "EXPIRED"
  | "WITHDRAWN"
  | "FAILED";

/** Why a check refused a request (EW-FLOW7-SD §6). Shown only on *Refused*. */
export type BlockedReason = "VERIFIER_NOT_TRUSTED" | "OUT_OF_SCOPE" | "UNSUPPORTED_FORMAT" | "NO_CHALLENGE" | "NO_PURPOSE";

/** One input descriptor: a credential type, and the fields the request names in it. */
export interface AskedDescriptor {
  id: string;
  credentialType: string;
  fields: string[];
}

export interface PresentationRequest {
  id: string;
  /** Whose wallet was asked. Absent means Pelden Trading's. */
  orgId?: string;
  /** The verifier organisation on the platform — null when the sender isn't one. */
  verifierOrgId: string | null;
  verifierName: string;
  verifierDid: string;
  /** The verifier's reason, in its own words (V6). */
  purpose: string;
  asked: AskedDescriptor[];
  /** FLOW-PRS-01's session, or null for a request on an existing connection. */
  sessionId: string | null;
  /** The verifier's own reference, shown with the only-continue-if sentence (D21). */
  displayReference: string | null;
  status: PresentationStatus;
  blockedReason?: BlockedReason | null;
  /** Which held credential answers each descriptor, recorded at *Share*. */
  chosen?: Record<string, string> | null;
  /** The relation of whoever chose *Share* — `initiatedBy` in §4.1. */
  initiatedBy?: PersonId | null;
  initiatedAt?: string | null;
  approvedBy?: PersonId | null;
  /** The approval waiting on this share (a `proof:present` parked operation). */
  approvalId?: string | null;
  /** Who declined, or who shared under AUTO — the person on the History row. */
  decidedBy?: PersonId | null;
  decidedAt?: string | null;
  /** Members who passed it to people who can answer (D13, A4). */
  passedBy?: PersonId[];
  /** The last approver's rejection, which sent it back to OPEN (D15). */
  rejection?: { by: PersonId; note: string; at: string } | null;
  /** E16/E11 — the sharer whose permission lapsed before approval. */
  lapsedSharer?: PersonId | null;
  /** E12 — an identical request already OPEN. */
  repeatOf?: string | null;
  /** Why it FAILED, in §3.5's words. */
  failure?: string | null;
  /** FLOW-PRS-01 — who redeemed the session: the sharer A3's notice leaves out. */
  openedBy?: PersonId | null;
  /** FLOW-PRS-01 A3 — when the people who may answer were told it was left undecided. Once only. */
  undecidedToldAt?: string | null;
  receivedAt: string;
  expiresAt: string;
}

/**
 * The verifier's side of FLOW-PRS-01 (EW-FLOW7-SD §4.2): what its back end
 * creates when the person presses *Share from NDI Entity Wallet*. The
 * browser only ever carries `id`. Its status follows the request once there
 * is one (§5.1's mapping, `sessionStatusOf`); before that it is stored.
 */
export type SessionStatus = "CREATED" | "OPENED" | "SHARED" | "PENDING" | "DECLINED" | "EXPIRED" | "FAILED";

export interface PresentationSession {
  id: string;
  verifierOrgId: string;
  asked: AskedDescriptor[];
  purpose: string;
  /** Which registered return address — never a URL (D9). */
  returnUrlId: string;
  /** The verifier website's own value, returned unchanged. */
  state: string;
  displayReference: string;
  status: SessionStatus;
  /** Milliseconds, because the windows are minutes (D16). */
  createdAt: number;
  /** Set by the page once it has loaded in a browser, never by the request
   *  that serves it — so a link preview neither starts the 30 minutes nor
   *  uses the link (EW-FLOW7-SD v0.3 §4.2, D16). */
  firstLoadedAt: number | null;
  /**
   * When it was redeemed and the organisation it is bound to from then on
   * (EW-FLOW7-SD v0.3 §4.2, S7). Never returned to the verifier: before
   * anything is shared it would tell whoever started the session which
   * organisation opened the link (§8).
   */
  redeemedAt: number | null;
  boundOrgId: string | null;
  requestId: string | null;
  /** The person went back to the verifier without a final answer. */
  returnedPending?: boolean;
}

/** SCR-PRS-06 — an address NDI may send people back to, and its history. */
export interface ReturnAddress {
  id: string;
  orgId: string;
  returnUrlId: string;
  url: string;
  addedBy: PersonId;
  addedAt: string;
  removedBy?: PersonId | null;
  removedAt?: string | null;
}

export interface ApprovalSignature {
  personId: PersonId;
  at: string;
  method: "web" | "wallet";
}

/**
 * An operation held back by policy until somebody decides it.
 *
 * `stale` is the edge the brief calls out and the one most likely to be
 * skipped: approved, then invalidated before it ran because the relation or
 * scope changed underneath it. Worth designing precisely because a system
 * that quietly executed it would be broken in a way nobody could see.
 */
export interface ParkedOperation {
  id: string;
  /** Whose operation it is. Absent means Pelden Trading's. */
  orgId?: string;
  /** Issuing delegated authority parks like anything else, but it is an
   *  Owner action rather than one of the Controller operations. */
  operation: ControllerOperation | "authority:issue";
  summary: string;
  requestedBy: PersonId;
  relationId: string;
  scopeVersion: number;
  /**
   * The verification request this is holding back. Accepting an offer never
   * parks: credential:accept is AUTO in every preset (EW-FLOW6-SD §5.3).
   *
   * Without it an approval is a state change and nothing else — the whole
   * point of the queue is that deciding it lets the held operation run, and
   * "approved" with nothing to apply it to is a dead end that looks like a
   * feature.
   */
  targetId: string | null;
  targetRelyingParty: string | null;
  /** What an approver's wallet signature actually commits to. */
  payloadHash: string;
  policy: ApprovalPolicy;
  requiredSignatures: number;
  signatures: ApprovalSignature[];
  state: "parked" | "awaiting_signature" | "approved" | "rejected" | "expired" | "stale";
  decisionReason: string | null;
  createdAt: string;
  /** Drives the TTL countdown. */
  expiresAt: string;
  /** Set when `stale` — why an approved operation stopped being valid. */
  invalidatedReason?: string | null;
}

/**
 * Flow 8 — an authority grant (EW-FLOW8-SD §4.1), the record behind one
 * person's authority to act for an organisation from their own Bhutan NDI
 * app.
 *
 * WHAT CHANGED FROM THE PRE-SPEC "DELEGATED AUTHORITY"
 *
 * The prototype used to hold Role and Capability credentials hanging off
 * each other, issued to a member of the organisation, traced to the
 * relation of whoever issued them. The specification settles all three the
 * other way: Capability only, no chain (D1, D3); the delegate needs no
 * account and may be outside the organisation (D10), identified when they
 * collect it by the citizen ID number the grantor entered (D11); and the
 * authority is the organisation's, not the grantor's — it survives them
 * leaving (D15). So the record names the organisation and its decision,
 * and who granted and approved it are attribution, not a link anything
 * depends on.
 *
 * THE ID NUMBER IS NEVER KEPT
 *
 * Only `delegateIdKeyed` — what `keyedIdHash` makes of it — and that is
 * cleared when the grant ends (§4.1, S4). Nothing on any screen can show
 * the number again once it is submitted.
 */
export type GrantStatus =
  | "AWAITING_APPROVAL"
  | "AWAITING_LISTING"
  | "CLAIMABLE"
  | "ISSUING"
  | "ACTIVE"
  | "EXPIRED"
  | "SUSPENDED"
  | "REVOKED"
  | "REJECTED"
  | "CANCELLED"
  | "DECLINED"
  | "LAPSED"
  | "FAILED";

export interface AuthorityGrant {
  /** `grantId` — carried in the credential as `relationId`. */
  id: string;
  orgId: string;
  /** `CAPABILITY` at first release (D1). `ROLE` is reserved. */
  kind: "CAPABILITY";
  /** The name the grantor typed. Shown until the delegate collects it. */
  name: string;
  /** The name the delegate's citizen credential states — written at claim (G8). */
  delegateName: string | null;
  /** The keyed hash of the ID number. Cleared when the grant ends (S4). */
  delegateIdKeyed: string | null;
  /** The did:key that signed the claim presentation (G8). */
  delegateDid: string | null;
  /**
   * Prototype only: the story's record of whoever collected it, when they
   * are one of its characters, so Flow 9's stand-in page can say who is
   * signed in. Not part of the grant record — the platform keeps no
   * account for a delegate (D10).
   */
  delegatePersonId: PersonId | null;
  /** Task scopes from the published vocabulary (§5.2) — never shown as strings. */
  tasks: string[];
  /** Counterparty organisations, each CURRENT as a verifier (D19). */
  counterparties: string[];
  licenceNumbers: string[];
  valueCapNu: number;
  /** Always true at first release — the form offers only "per declaration" (EW-FLOW8-SD D25). */
  perTransaction: true;
  validFrom: string;
  validUntil: string;
  /** The publishing DID it is issued from, once the organisation is listed (§7.1). */
  issuerDid: string | null;
  /** Generated when the identity matches; discarded if the offer isn't accepted (D23). */
  revocationId: string | null;
  grantedBy: PersonId;
  grantedRelationId: string;
  approvedBy: PersonId | null;
  approvedRelationId: string | null;
  /** The parked approval, under SINGLE_APPROVER (§8.2). */
  approvalId: string | null;
  credentialRef: string | null;
  /** The bearer reference in the claim link's path (FLOW-AUT-01 §7.2). */
  claimRef: string | null;
  claimExpiresAt: string | null;
  /** SHA-256 of the grant as submitted — an approval is bound to it (D20). */
  approvalHash: string;
  status: GrantStatus;
  submittedAt: string;
  /** When it reached the state it is in. */
  statusAt: string;
  /** For an ended grant, the reason in words — SCR-AUT-01's Ended tab. */
  endReason: string | null;
  cancelledBy?: PersonId | null;
  rejection?: { by: PersonId; note: string; at: string } | null;
  /** Identity mismatches at claim; the third ends the grant (E9). */
  mismatches: number;
  /** ISSUING: when the offer is withdrawn (E13), as epoch ms. */
  offerExpiresAt: number | null;
  /** ISSUING: the delegate accepted, and the revocation id isn't registered yet (E17). */
  accepted: boolean;
}

/**
 * What SCR-AUT-02 holds between the form and SCR-AUT-03. In the store so
 * the two screens can have their own addresses — *Change* goes back to a
 * form still filled in. The ID number lives here only until *Give
 * authority*, which keeps nothing but its keyed hash.
 */
export interface AuthorityDraft {
  orgId: string;
  name: string;
  cid: string;
  counterparty: string;
  tasks: string[];
  licences: string[];
  limit: string;
  until: string;
  /** A3 answered "give another anyway". */
  duplicateOk: boolean;
}

/**
 * A stand-in for the HMAC FLOW-AUT-01 S4 asks for — a per-organisation key
 * in the key management service over the citizen ID number. This is a
 * string hash with the organisation's id mixed in: enough for the match
 * and the duplicate warning to behave as the real one does, and nothing
 * like enough to protect a real number (the what's-real page says so).
 */
export function keyedIdHash(orgId: string, cid: string): string {
  const input = `${orgId}|${cid.replace(/\D/g, "")}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < input.length; i += 1) {
    a = Math.imul(a ^ input.charCodeAt(i), 0x01000193) >>> 0;
    b = Math.imul(b ^ input.charCodeAt(input.length - 1 - i), 0x811c9dc5) >>> 0;
  }
  return `hmac:${a.toString(16).padStart(8, "0")}${b.toString(16).padStart(8, "0")}`;
}

/**
 * The citizens the simulated Bhutan NDI app can share as, at a claim link.
 * The first is the clearing agent the guided demo gives authority to; the
 * others are who a forwarded link might reach (Journey U). Their numbers
 * are invented, and are the only ID numbers anywhere in the prototype.
 */
export const SIM_CITIZENS: { cid: string; name: string; personId: PersonId | null }[] = [
  { cid: "11512002960", name: "Pema Choden", personId: "pema" },
  { cid: "10811004417", name: "Kinley Wangdi", personId: null },
  { cid: "11206003325", name: "Sangay Wangmo", personId: null },
  { cid: "10305007781", name: "Tashi Dorji", personId: null },
];

/* ------------------------------------------------------------------ */
/* Flow 9 — the Bhutan National Single Window's own records            */
/*                                                                     */
/* None of these is the platform's. They are what BNSW's back end      */
/* keeps (EW-FLOW9-SD §4), held in the demo store only because the      */
/* prototype has no BNSW: the dashed BNSW pages read them, and nothing  */
/* in the Entity Wallet does except the first-grant notice asking       */
/* "is this organisation registered there?" (§7).                      */
/* ------------------------------------------------------------------ */

/**
 * BNSW's record of a company's registration — kept from FLOW-PRS-01's
 * result when the company shares its registration, TPN and business
 * licence with BNSW (§4.1, EW-FLOW9-CIG §3). Registering again replaces it.
 */
export interface CounterpartyRegistration {
  id: string;
  counterpartyId: string;
  orgId: string;
  /** `verification.holder` — the company's did:key. Audit only. */
  holderDid: string;
  /**
   * `verification.holderPublishingDid` — the platform's attestation of the
   * company's listed did:ethr (D8), or null when it wasn't CURRENT as an
   * issuer of authority when it registered. B1 matches an authority's issuer to it.
   */
  publishingDid: string | null;
  legalName: string;
  registrationNumber: string;
  tpn: string | null;
  /** Kept, never looked up (pr-9 item 1 — see lib/bnsw.ts). */
  tpnRevocationId: string | null;
  /** Each business licence number and its revocation_id (B3, B4). `credentialId` is the prototype's link to the held credential its status stands for. */
  licences: { number: string; revocationId: string; credentialId: string }[];
  registeredAt: string;
  /** The presentation request it came from — null for the seed's. */
  requestId: string | null;
}

/**
 * BNSW's authority session — written at sign-in once V1–V6 and B0–B4 pass
 * (§4.2, FLOW-AUT-02 Q1). It holds the delegate's name and citizen ID
 * number: BNSW does see them, from the citizen credential.
 */
export interface AuthoritySession {
  id: string;
  counterpartyId: string;
  /** BNSW's signed-in user, from its own Bhutan NDI sign-in (B0). */
  signedInCid: string;
  delegateDid: string;
  /** The citizen credential's name and ID number. */
  delegateName: string;
  delegateCid: string;
  /** The name the authority carries — shown beside the citizen credential's, not compared (D12). */
  authorityName: string;
  /** The registered company matched in B1. */
  orgId: string;
  registrationId: string;
  principalDid: string;
  /** The grant's id — `credentialSubject.relationId`. */
  relationId: string;
  /** BNSW task scopes the authority names (B2). */
  tasks: string[];
  /** Named by the authority, registered (B3) and ACTIVE at B4 — what A2 offers. */
  licenceNumbers: string[];
  valueCapNu: number;
  perTransaction: boolean;
  authorityRevocationId: string;
  citizenRevocationId: string;
  /** The authority's expirationDate (D19). */
  validUntil: string;
  /** The earlier of BNSW's sign-in timeout and validUntil (D13), as epoch ms. */
  endsAt: number;
  checkedAt: number;
  status: "OPEN" | "ENDED";
  endedAt: number | null;
  endReason: "stopped" | "changed" | "timeout" | "expired" | "signed_out" | null;
}

/** What BNSW keeps with each declaration (§4.3, D14). */
export interface CounterpartyDeclaration {
  id: string;
  reference: string;
  counterpartyId: string;
  orgId: string;
  sessionId: string;
  kind: "submit" | "amend";
  /** The declaration this one amends (A3), and the one that amended this. */
  amends: string | null;
  amendedBy: string | null;
  goods: string;
  valueNu: number;
  licenceNumber: string;
  relationId: string;
  authorityRevocationId: string;
  delegateName: string;
  delegateCid: string;
  /** The status lookup's answer, as kept. */
  statusResult: string;
  at: string;
}

/** BNSW's form, kept as a draft through any refusal at submit (UXD-54). */
export interface DeclarationDraft {
  goods: string;
  value: string;
  licence: string;
  /** The declaration being amended, or null for a new one. */
  amends: string | null;
}

/** One of V1–V6 or B0–B4, as the result reports it. */
export interface BnswCheck {
  id: string;
  label: string;
  outcome: "pass" | "fail" | "not_run";
}

/**
 * The simulated BNSW portal's own state: who is signed in to it, the
 * request out to the app, what it last told the person, the draft, and the
 * two things the prototype can't otherwise produce — an outage at NDI and
 * a citizen credential that isn't valid.
 */
export interface BnswState {
  signedInCid: string | null;
  servicesDown: boolean;
  suspendedCitizens: string[];
  /** Steps 2–3 — the proof request out to the app; five minutes (E2). */
  request: { id: string; startedAt: number } | null;
  /** The last outcome to show, set by the store: a refusal, A4, an acceptance. */
  notice: { code: string; text: string; checks: BnswCheck[]; at: number } | null;
  draft: DeclarationDraft | null;
}

/**
 * An append-only audit row.
 *
 * `prevHash`/`rowHash` are fixture strings — this is an array in
 * localStorage, not a hash chain, and the README says so out loud. They are
 * here because the *integrity indicator* is part of what C6 has to show, and
 * a row with nowhere to put a hash cannot show it.
 */
export interface AuditEntry {
  id: string;
  seq: number;
  operation: string;
  summary: string;
  /** The principal. Always the entity, never the person. */
  entity: string;
  /** The person who acted. Both are shown, always. */
  actorId: PersonId;
  relationId: string | null;
  scopeVersion: number | null;
  approvedById: PersonId | null;
  relyingPartyDid: string | null;
  /** A digest of what was disclosed. Never the values themselves. */
  disclosedDigest: string | null;
  at: string;
  prevHash: string;
  rowHash: string;
}

export interface Appeal {
  id: string;
  /** The reference given to the holder in the revocation notice. */
  reference: string;
  subjectId: PersonId;
  againstKind: "authority" | "relation";
  againstId: string;
  againstTitle: string;
  /** The reason the Owner gave when revoking. */
  noticeReason: string;
  noticeIssuedAt: string;
  submittedAt: string | null;
  submission: string | null;
  state:
    | "notice_issued"
    | "open"
    | "under_review"
    | "upheld_reinstated"
    | "rejected"
    | "window_closed";
  /** Provisional, pending the Governance Framework. Copy, never a graphic. */
  windowWorkingDays: number;
  decisionWorkingDays: number;
  evidence: string[];
}

/** Where the demo currently is in the story. */
/* ================================================================== */
/* Onboarding — Flow 1 (FLOW-ONB-01, FLOW-ONB-02)                      */
/* ================================================================== */

/**
 * FLOW-ONB-01 — the one account the sign-up flow is creating.
 *
 * WHY THIS IS NOT A PERSONA
 *
 * Personas are people the story already knows, driven from the harness. The
 * person signing up is, by definition, someone the platform does not know
 * yet: until step 7 they are an email address and a token. Modelling them as
 * a persona would mean an account existing before it has been created, which
 * is the one thing this flow exists to prevent. So it is a session — one at
 * a time, persisted so an interrupted sign-up resumes (UN-03), and cleared by
 * starting again.
 *
 * WHAT IT DELIBERATELY DOES NOT HOLD
 *
 * No password (Keycloak holds it — FLOW-ONB-01 §12 item 3), no national ID,
 * no organisation details, no DID (§7.3). A shell account has nothing to
 * protect, and that is what makes an open sign-up door safe.
 */
export type SignupStage = "check_email" | "set_password" | "done";

export interface SignupSession {
  email: string;
  stage: SignupStage;
  /** Epoch ms of each verification mail sent, oldest first. S4 counts these. */
  sends: number[];
  /** The verification link is single-use (E3). */
  linkUsed: boolean;
  /** Set at step 6. */
  name: string;
  /** Organisations this account belongs to. Empty means a shell (Q3). */
  memberships: { orgId: string; role: "Owner" | "Admin" | "Member" }[];
  /**
   * Where to go once the account exists. An invitation link sets this, so a
   * person who had to create an account first is brought straight back to
   * the invitation (FLOW-ONB-02 A1) — "we'll bring you straight back here".
   */
  returnTo: string | null;
  createdAt: string | null;
}

/**
 * FLOW-ONB-02 — an invitation, of either kind.
 *
 * ONE RECORD, TWO KINDS, NO HIDDEN BRANCHING
 *
 * Kind M adds a person to an organisation that exists; Kind O brings on an
 * organisation that does not exist yet. The specification is careful that
 * every difference between them is tabulated (§1.1), so they share one
 * record and differ in which fields are filled — rather than the platform's
 * own `org_invitations`, which requires an organisation and a user id and so
 * cannot name an organisation that has not been created (§12 item 2).
 *
 * The second approval follows the capability being granted, not the kind
 * (POL-CAP, §1.1): a foundational issuer needs it, an ordinary business
 * invited to register does not. So it is a field, not a property of Kind O.
 */
/**
 * M and O are FLOW-ONB-02's two kinds. Two more arrived with the platform's
 * own setup, and the flow specification does not name them yet (raise at
 * Gate 2):
 *
 * - A — root invites a platform administrator. Root holds every grant, so
 *   there is nobody above to approve it.
 * - W — a platform admin invites the owner of an organisation already on
 *   NDI (an issuer or verifier) to set up its Entity Wallet, after
 *   reviewing its request. The organisation exists; what the invitation
 *   carries is the holder capability, still subject to the register check.
 */
export type InvitationKind = "M" | "O" | "A" | "W";

export type OrgInvitationState =
  | "PENDING_APPROVAL" // Kind O, waiting on a second administrator. Not sent.
  | "PENDING" // Sent. Confers nothing until accepted.
  | "ACCEPTED"
  | "DECLINED" // A2
  | "EXPIRED" // E4 — 14 days (M), 30 days (O)
  | "REVOKED" // E5 — withdrawn by the inviter or an admin before acceptance
  | "REFUSED" // The second administrator said no. Never sent.
  | "VOID"; // E6 — the inviter lost their authority before acceptance

export interface OrgInvitation {
  id: string;
  kind: InvitationKind;
  /** The address it goes to. Stored whole here; the audit log would hash it. */
  email: string;
  /* ---- Kind M ---- */
  orgId: string | null;
  role: "Member" | "Admin" | null;
  /* ---- Kind O ---- */
  /** The organisation to be created. */
  legalName: string | null;
  /** How it is constituted — its legal identity, in the proposer's words. */
  legalIdentity: string | null;
  /** What it is being brought on for, in words the approver will read. */
  purpose: string | null;
  /** Whether POL-CAP requires a second administrator for what this grants. */
  needsSecondApproval: boolean;
  /* ---- Kind A issued by the root account (FLOW-ONB-02 S9, P8) ---- */
  /** Why the root account was used — required, logged and alerted. */
  rootReason?: string | null;
  /** The custodians present, since the platform can't tell which acted (S10). */
  rootCustodians?: string | null;
  /* ---- Both ---- */
  invitedBy: PersonId;
  approvedBy: PersonId | null;
  createdAt: string;
  /** Null until it has actually been sent — a Kind O invitation waiting on
   *  approval has not been. */
  sentAt: string | null;
  expiresAt: string | null;
  state: OrgInvitationState;
  /** E8 — delivery is asynchronous, and a failure is only visible here. */
  delivery: "not_sent" | "delivered" | "failed";
  decidedAt: string | null;
  /** Who accepted it, once someone has. */
  acceptedName: string | null;
}

/* ================================================================== */
/* Onboarding — Flow 2 (organisation onboarding, holder)               */
/* ================================================================== */

/**
 * The entity types FLOW-ORG-01 routes by (Flow 2 solution design §2.2).
 * Which register verifies each one, and whether it is connected yet, is in
 * `features/onboarding/orgKinds.ts`; this is only the set of names.
 */
export type OrgKind = "company" | "sole_proprietorship" | "partnership";

/**
 * Where a verification record is (FLOW-ORG-01 §4 steps 3–11).
 *
 * `started` is the person on SCR-ORG-01/02 with nothing submitted. The
 * record exists from `proof_requested` (step 3 creates it, step 4 asks for
 * the proof), and from then until the authority decides it is the *only*
 * thing that exists: no organisation is created before step 9
 * (EW-FLOW2-SD/D10). That is why SCR-ONB-05 has to carry it while it is in
 * flight — there is nothing else on the account to come back to.
 *
 * `not_confirmed` covers both E6 and E7 on purpose. The authority's answer
 * is one of the two, but the record keeps no distinction the person could
 * be shown, so the store has nothing to leak (FLOW-ORG-01 S6).
 */
export type VerificationStage =
  | "started"
  | "proof_requested"
  | "checking"
  | "setting_up"
  | "verified"
  | "not_confirmed";

/**
 * Flow 2 in progress — one organisation being verified by one person.
 *
 * ONE IDENTIFIER, TYPED; ONE IDENTITY, PROVED
 *
 * The person types the registration identifier and nothing else (FLOW-ORG-01
 * step 1) — no name, no evidence. Who they are is never typed: it comes
 * from the proof the authority asks their wallet for. The authority then
 * answers one question about that pair, "is this person a representative of
 * the entity with this identifier?", and the platform renders the answer.
 *
 * This replaced a list-then-select model in which the register returned
 * every organisation it listed against the person to pick from. The spec
 * never had it — it would have NDI receive a list of who represents what,
 * which §7.3 says NDI never receives — and it is gone.
 */
export interface OrgOnboarding {
  kind: OrgKind;
  /** The one thing typed: the registration identifier, as entered. */
  identifier: string | null;
  stage: VerificationStage;
  /** The name the citizen credential gave when the proof was answered. */
  provedName: string | null;
  /** Who the wallet answered as — what the register is asked about. */
  provedPersonId: PersonId | null;
  /** The name the authority returned at step 8, which the organisation takes. */
  authoritativeName: string | null;
  /** "Notify me when it's done" on SCR-ORG-04. */
  notify: boolean;
  /**
   * Set when an NDI invitation started this (FLOW-ONB-02 Kind O, or the
   * Kind W departure). The invitation names an organisation; it is not the
   * trust decision, so the identifier is still typed and the authority
   * still asked.
   */
  invitationId: string | null;
  /**
   * Kind E (FLOW-ORG-01 A1): the organisation already exists on the
   * platform, unverified. The record points at it, and step 9 provisions it
   * rather than creating a new one.
   */
  existingOrgId: string | null;
}

/**
 * The registers' own records — what the authority checks its answer
 * against. A fixture, read only by the store standing in for the
 * authority: no screen reads it, because NDI never sees a register's
 * contents (FLOW-ORG-01 §7.3). The screens see a decision and nothing else.
 *
 * Each row is here for an outcome a presenter can reach by typing its
 * number on SCR-ORG-02:
 *
 *   Pelden Trading      — Dorji is a representative: verified.
 *   Druk Valley         — already verified on the platform: E3.
 *   Norbu Construction  — Dorji is not a representative: E6.
 *   Gangri Exports      — deregistered: E7, worded exactly as E6.
 *   Bank of Bhutan      — Yeshey is a representative: Kind E.
 *   Yangchen Handicrafts — a trade licence, so E6 names the other
 *                          authority (only Pelden can be created here).
 */
export interface RegisterRecord {
  kind: OrgKind;
  identifier: string;
  legalName: string;
  entityType: string;
  /** Who the register records as able to represent it. Never sent to NDI. */
  representatives: PersonId[];
  /** Deregistered or struck off — the register no longer recognises it. */
  active: boolean;
  /** Already verified on the platform by someone else (E3). */
  verifiedOnPlatform?: boolean;
}

export const REGISTER_RECORDS: RegisterRecord[] = [
  {
    kind: "company",
    identifier: "CRA-2019-04477",
    legalName: "Pelden Trading Pvt. Ltd.",
    entityType: "Private limited company",
    representatives: ["dorji"],
    active: true,
  },
  {
    kind: "company",
    identifier: "CRA-2023-11802",
    legalName: "Druk Valley Hardware Pvt. Ltd.",
    entityType: "Private limited company",
    representatives: ["dorji"],
    active: true,
    verifiedOnPlatform: true,
  },
  {
    kind: "company",
    identifier: "CRA-2015-03310",
    legalName: "Norbu Construction Pvt. Ltd.",
    entityType: "Private limited company",
    representatives: [],
    active: true,
  },
  {
    kind: "company",
    identifier: "CRA-2008-00731",
    legalName: "Gangri Exports Pvt. Ltd.",
    entityType: "Private limited company",
    representatives: ["dorji"],
    active: false,
  },
  {
    kind: "company",
    identifier: "CRA-1997-00112",
    legalName: "Bank of Bhutan Ltd.",
    entityType: "Public limited company",
    representatives: ["yeshey"],
    active: true,
  },
  {
    kind: "sole_proprietorship",
    identifier: "BL-PARO-2011-0387",
    legalName: "Yangchen Handicrafts",
    entityType: "Sole proprietorship",
    representatives: [],
    active: true,
  },
];

/**
 * Someone who chose a type no authority verifies yet and asked to be told
 * when one does (SCR-ORG-06). The type and an address, and nothing else:
 * the registration identifier is deliberately never collected for it
 * (FLOW-ORG-01 S9), and nothing about it is an application.
 */
export interface OrgInterest {
  kind: OrgKind;
  email: string;
  recordedAt: string;
}

/* ================================================================== */
/* Accreditation — Flow 4 (FLOW-ACC-01, FLOW-ACC-02)                   */
/* ================================================================== */

/**
 * Approval to verify or to issue, for an organisation, on NDI's public
 * list of trusted organisations (EW-FLOW4-SD).
 *
 * WHY THIS REPLACED A SIMPLE REQUEST
 *
 * The prototype used to hold "access requests" a single platform admin
 * approved with one click. The specification has two doors and neither is
 * that: NDI proposes an approval and a *second* administrator approves it,
 * then the organisation's officer accepts it — identity-anchored, knowing it
 * will be publicly listed (FLOW-ACC-01); or a verified business asks, one
 * administrator recommends and a second decides, on the request exactly as
 * written (FLOW-ACC-02). Every state either door can reach is here.
 */
export type AccCapability = "verifier" | "issuer";
/**
 * How the accreditation began. `NEW` is FLOW-ACC-01 Kind N (an institution
 * not yet on the platform, invited to register), `EXISTING` Kind E,
 * `RECOGNITION` Kind E for an organisation already issuing or verifying
 * before approvals were enforced, and `REQUEST` FLOW-ACC-02 (a verified
 * business asking).
 */
export type AccDoor = "NEW" | "EXISTING" | "RECOGNITION" | "REQUEST";
/**
 * What the first release keeps (EW-FLOW4-SD v0.2, D20–D24).
 *
 * `LAPSED` is the specification's `EXPIRED`, reason `NOT_APPROVED`: a
 * FLOW-ACC-01 proposal no second administrator decided in 30 days (E14).
 * It is the only ending a date causes (D20), and it keeps the name it has
 * always had on screen — "Lapsed" — rather than share a word with the
 * endings that went.
 *
 * Gone, and why:
 * - `EXPIRED` for an approval nobody accepted, and the listing lapse with
 *   it. Neither window expires any more: acceptance reminds the owner and
 *   NDI and ends only when someone acts — the owner accepts or declines, or
 *   an administrator withdraws it (ACC-01/E2) — and a listing retries and
 *   alerts NDI after 72 hours (E8). A business never loses a request, and
 *   an organisation never loses an approval, to a date nobody watched.
 * - `SUPERSEDED`. Widening is a replacement: the new record names the one
 *   it replaces (`replacesId`), and the old one is `WITHDRAWN`, reason
 *   `REPLACED`, in the step that makes the new one `ACTIVE` (D24).
 * - `STOPPED`. A changed primary DID refuses gated calls and alerts both
 *   parties but leaves the record `ACTIVE` (ACC-01/E11) — so "stopped" is
 *   read from the organisation's identity, by `accStopped`, not stored.
 *   Suspension, its old neighbour, is flow 11's.
 *
 * `HELD` stays: a listing held because the DID is listed for someone else
 * (E9) needs NDI, and the organisation is told so.
 */
export type AccState =
  | "SUBMITTED"
  | "IN_REVIEW"
  | "PROPOSED"
  | "PENDING_ACCEPTANCE"
  | "LISTING"
  | "ACTIVE"
  | "DECLINED"
  | "LAPSED"
  | "WITHDRAWN"
  | "RESIGNED"
  | "HELD";

/** One thing a verifier may ask people for, from a published credential. */
export interface AskItem {
  credential: string;
  item: string;
  /** "Check only — you'll learn whether it's true, not the value" (UXD-28). */
  checkOnly: boolean;
}

/**
 * A credential type an issuer may issue, named in words. It used to carry a
 * basis of its own; an issuer now gives one purpose and one legal basis for
 * the record (EW-FLOW4-SD/D23, UXD-59), because purpose and a basis per
 * type both answered "why you can and will issue this". Whether one basis is
 * enough is open with GovTech Liaison (§13 item 12).
 */
export interface IssueType {
  name: string;
}

/**
 * Why a record is `WITHDRAWN` — each is said differently to the
 * organisation, so the reason is kept, not inferred from the door.
 *
 * - `REQUESTER` — the business's Root withdrew its request (ACC-02/A1).
 * - `BY_NDI` — an administrator withdrew it, with a reason: an approval
 *   nobody accepted (ACC-01/E2), or — catalogue flow 11, shown only from the
 *   state switcher — one already active.
 * - `NOT_LISTED` — NDI abandoned a listing that couldn't be published (E8,
 *   ACC-02/E7). Shown only from the state switcher: the demo's listing
 *   always publishes.
 * - `REPLACED` — a wider approval became `ACTIVE` (D24).
 */
export type AccWithdrawReason = "REQUESTER" | "BY_NDI" | "NOT_LISTED" | "REPLACED";

export interface Accreditation {
  id: string;
  /** Absent for `NEW` until the invited officer has registered the organisation. */
  orgId: string | null;
  orgName: string;
  /** `NEW`: whom the Kind O invitation goes to. */
  officerEmail: string | null;
  door: AccDoor;
  capability: AccCapability;
  /**
   * What it will use the capability for. For an issuer, the single
   * justification for every type in scope (D23).
   */
  purpose: string;
  /** Issuer only: the mandate it issues under, once for the record (D23). */
  legalBasis: string;
  /** Issuer only: where that mandate is written down — an act, a licence number. */
  legalBasisRef: string;
  agreementRef: string;
  ask: AskItem[];
  issue: IssueType[];
  /** Recognition: what the gate observed it doing, and since when. */
  observed: { since: string; ask: AskItem[]; issue: IssueType[] } | null;
  state: AccState;
  /** The `ACTIVE` record this one replaces, if any (D24). That one stays `ACTIVE` until this one is. */
  replacesId: string | null;
  /**
   * FLOW-ACC-02: the request this record is a part of. A business may ask
   * for both capabilities at once (D22); each is its own record — reviewed,
   * recommended and decided on its own, so one can be approved and the
   * other declined — and the two share this id, which is how they are
   * withdrawn together and shown as one request.
   */
  requestId: string | null;
  /** The administrator who proposed it — or, for a request, who reviewed and recommended it. */
  proposedBy: PersonId | null;
  proposedAt: string | null;
  /** FLOW-ACC-02: the business's Root, and when they asked. */
  requestedBy: PersonId | null;
  requestedAt: string | null;
  /** FLOW-ACC-02 step 6: the reviewer's recommendation. */
  recommendation: { by: PersonId; approve: boolean; reason: string | null; at: string } | null;
  decidedBy: PersonId | null;
  decidedAt: string | null;
  /**
   * The reason the organisation is shown when it is declined, verbatim. For
   * a recommended decline that is the reviewer's reason (ACC-02/E11): the
   * second administrator confirms it and adds nothing.
   */
  declineReason: string | null;
  /** The officer declined at acceptance (FLOW-ACC-01 E3). */
  declinedByOrg: boolean;
  /** Why it is `WITHDRAWN`, by whom, and NDI's words if NDI did it. */
  withdrawal: { reason: AccWithdrawReason; note: string | null; by: PersonId | null; at: string } | null;
  /** The officer's name as their citizen credential gave it, at acceptance. */
  acceptedName: string | null;
  acceptedAt: string | null;
  listedAt: string | null;
  /**
   * The one deadline left (D20): a FLOW-ACC-01 proposal lapses 30 days after
   * it is made if nobody decides it (E14). Null everywhere else — requests,
   * recommendations, acceptance and listing are reminded, not expired.
   */
  expiresAt: string | null;
  /** The public identity it is (to be) listed under. */
  publicIdentity: string | null;
  /** Refused in the last 30 days — asked for something outside scope. */
  refusals: { count: number; items: string[] } | null;
}

/** What SCR-ACC-01 sends: an administrator's proposal, through any NDI door. */
export interface AccProposalInput {
  door: Exclude<AccDoor, "REQUEST">;
  orgId: string | null;
  orgName: string;
  officerEmail: string | null;
  capability: AccCapability;
  purpose: string;
  legalBasis: string;
  legalBasisRef: string;
  agreementRef: string;
  ask: AskItem[];
  issue: IssueType[];
  /** Names the ACTIVE approval this one replaces — the way past E10. */
  replaces: string | null;
}

/** One capability in a business's request, exactly as its Root wrote it. */
export interface AccRequestPart {
  capability: AccCapability;
  purpose: string;
  ask: AskItem[];
  issue: IssueType[];
  legalBasis: string;
  legalBasisRef: string;
  /**
   * Names the ACTIVE approval this part replaces — "Ask for more"
   * (ACC-02/E3, AC-10). The way past E3 for a business, as `replaces` is
   * for NDI's proposals: that approval keeps working until this one is.
   */
  replaces: string | null;
}

/** What SCR-ACC-06 sends: one capability or both (D22). */
export interface AccRequestInput {
  parts: AccRequestPart[];
  /** The business's agreement with NDI, if it has one (FLOW-ACC-02 step 2). Optional, unlike a proposal's. */
  agreementRef: string;
}

/**
 * Kind N's matching key (FLOW-ACC-01 P3, EW-FLOW4-SD §4.1): the legal name
 * with case, spacing and punctuation folded, so "Druk Insurance Ltd." and
 * "DRUK  INSURANCE LTD" are one institution. Trimming and lower-casing alone
 * let a full stop through, and two administrators could each invite the
 * same body as a verifier.
 */
export const normaliseLegalName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * What an accreditation becomes when its one window runs out, or null if it
 * hasn't. Nobody acts to end it — the date does — so it is read from the
 * date rather than waiting for someone to press a button that would discover
 * it. Until it was, a lapsed proposal still counted as in progress, "Propose
 * again" returned E10, and nothing could end it.
 *
 * Only an NDI proposal nobody decided lapses (FLOW-ACC-01/E14, D20). A
 * business's request and the recommendation on it never expire
 * (ACC-02/E8, E12): NDI is reminded after 10 working days and the business
 * keeps its place. There used to be three more windows here — acceptance,
 * listing and the recommendation — each with its own ending and copy, and
 * most of the prototype's faults were in those edges.
 */
export const accEnding = (a: Pick<Accreditation, "state" | "expiresAt" | "door">, today: string): "LAPSED" | null =>
  a.state === "PROPOSED" && a.door !== "REQUEST" && a.expiresAt !== null && a.expiresAt < today ? "LAPSED" : null;

/**
 * Whether an accreditation still stands in the way of another for the same
 * organisation and capability — in progress, or ACTIVE (FLOW-ACC-01/E10,
 * FLOW-ACC-02/E3). Ended ones do not, and nor does a proposal whose window
 * has run out but which the store hasn't yet moved on. A withdrawn approval
 * is ended, which is what lets NDI propose again after withdrawing one
 * nobody accepted (AC-15).
 */
export const accInProgress = (a: Pick<Accreditation, "state" | "expiresAt" | "door">) =>
  ["SUBMITTED", "IN_REVIEW", "PROPOSED", "PENDING_ACCEPTANCE", "LISTING", "ACTIVE", "HELD"].includes(a.state) &&
  accEnding(a, new Date().toISOString().slice(0, 10)) === null;

/**
 * Whether the organisation itself sees a record. Its own request it always
 * does. Of what NDI proposes, it sees nothing until a second administrator
 * has approved it — the owner is told only then (FLOW-ACC-01 step 3) — and
 * never a proposal NDI declined or let lapse, whose reason was written to
 * the proposer, not to it (E13, E14). A decline the organisation made
 * itself (E3) is its own, and stays.
 */
export const accSeenByOrg = (a: Pick<Accreditation, "state" | "door" | "declinedByOrg">) =>
  a.state !== "LAPSED" && (a.door === "REQUEST" || !(a.state === "PROPOSED" || (a.state === "DECLINED" && !a.declinedByOrg)));

/**
 * ACC-01/E11 as a face, not a state: an `ACTIVE` approval whose organisation
 * no longer has the listed identity as its primary DID. Gated calls are
 * refused and both parties alerted, but the record stays `ACTIVE` (D24) —
 * putting the listed DID back is enough, with no state to move back from.
 */
export const accStopped = (
  a: Pick<Accreditation, "state" | "publicIdentity">,
  org: Pick<Organization, "publicDid"> | undefined,
) => a.state === "ACTIVE" && Boolean(a.publicIdentity) && org !== undefined && org.publicDid !== a.publicIdentity;

/**
 * Working days since a date — weekends skipped, holidays not modelled. The
 * reminders that replaced the old expiries all fire at 10 working days
 * (ACC-01/E2, E14; ACC-02/E8, E12), and the screens say when one has gone.
 */
export function workingDaysSince(date: string | null): number {
  if (!date) return 0;
  const d = new Date(`${date}T00:00:00`);
  const end = new Date();
  let n = 0;
  while (d < end) {
    d.setDate(d.getDate() + 1);
    if (d < end && d.getDay() !== 0 && d.getDay() !== 6) n++;
  }
  return n;
}

export const REMINDER_WORKING_DAYS = 10;

/* ------------------------------------------------------------------ */
/* Flow 5 — foundational-issuer designation and adoption               */
/* ------------------------------------------------------------------ */

/**
 * A designation's life — EW-FLOW5-SD §5.1's eight states, and no others.
 * Each says on whom it is waiting or how it ended, because every screen that
 * shows a designation has to (UN-25).
 *
 * - `PROPOSED` — a Kind E proposal waiting for a second administrator (A1).
 *   Lapses after 30 days (E13), with a reminder to administrators at 10
 *   working days.
 * - `PENDING` — approved, waiting for the authority's OWNER (A2). 30 days (E6).
 * - `ACCEPTED` — accepted; the activation checks are not yet all passing
 *   (E1–E5). It doesn't lapse: the authority has consented, so an abandoned
 *   one is withdrawn by NDI, with a reason (A3).
 * - `ACTIVE` — switched on (step 5). Nothing is live until something is adopted.
 * - `SUSPENDED` — the issuing identity changed after activation (E10), or the
 *   organisation was suspended (E9). Organisations already verified stay verified.
 * - `DECLINED` — refused by the second administrator (E12, the reason carried
 *   to the proposer) or declined by the authority (A2). One state for both,
 *   as the spec has it: who said no is on the record, not in the state.
 * - `WITHDRAWN` — ended by NDI with a reason (A3). Kept, never deleted.
 * - `EXPIRED` — lapsed: not approved (`NOT_APPROVED`, E13) or not accepted
 *   (`NOT_ACCEPTED`, E6). Confers nothing; a new one needs a fresh approval.
 */
export type DesignationState =
  | "PROPOSED"
  | "PENDING"
  | "ACCEPTED"
  | "ACTIVE"
  | "SUSPENDED"
  | "DECLINED"
  | "WITHDRAWN"
  | "EXPIRED";

/** One activation check (FLOW-ORG-02 P2–P6), as SCR-DSG-04 lists it. */
export interface ActivationCheck {
  id: "P2" | "P3" | "P4" | "P5" | "P6";
  label: string;
  pass: boolean;
  /** On failure: what was observed, in the words SCR-DSG-04 uses. */
  observed: string | null;
  /** On failure: who resolves it — the whole point of the screen (UN-19). */
  resolver: "NDI" | "authority" | null;
  /** The spec's error for this check, when it fails. */
  error: "E1" | "E2" | "E3" | "E4" | "E5" | null;
}

export interface Designation {
  id: string;
  orgId: string;
  orgName: string;
  /** `N` arrived through a Kind O invitation; `E` was proposed against an existing organisation. */
  kind: "N" | "E";
  /** The entity types it will confirm. Fixed once active (EW-FLOW5-SD/D6). */
  entityTypes: OrgKind[];
  legalBasis: string;
  legalRef: string;
  state: DesignationState;
  proposedBy: PersonId | null;
  proposedAt: string | null;
  approvedBy: PersonId | null;
  approvedAt: string | null;
  /** The OWNER who accepted for the authority. */
  acceptedBy: PersonId | null;
  acceptedAt: string | null;
  /**
   * Who said no, and why — the second administrator (E12, reason required
   * and carried to the proposer verbatim) or the authority's OWNER (A2).
   * Which of the two it was is read from `approvedBy`: a refusal comes
   * before any approval.
   */
  declinedBy: PersonId | null;
  declinedReason: string | null;
  /** A3 — NDI ended it before activation, with a reason. The row is kept. */
  withdrawnBy: PersonId | null;
  withdrawnAt: string | null;
  withdrawnReason: string | null;
  /**
   * The state it was withdrawn from. The authority is told only if the
   * proposal had reached it (PENDING or ACCEPTED) — before the second
   * approval nothing was ever sent (A1).
   */
  withdrawnFrom: DesignationState | null;
  /** E13 or E6 — which window ran out. */
  expiredReason: "NOT_APPROVED" | "NOT_ACCEPTED" | null;
  /**
   * The running 30-day window — approval while PROPOSED (E13), acceptance
   * while PENDING (E6). One field because only one window is ever open, and
   * SC 2.2.1 wants the days left shown wherever either is.
   */
  expiresAt: string | null;
  /**
   * SCR-DSG-02's "request more information" (A1). Changes nothing — the
   * state stays PROPOSED and the window keeps running — so it is a note on
   * the record, not a state.
   */
  infoRequests: { by: PersonId; at: string; note: string }[];
  activatedAt: string | null;
  /**
   * The primary DID observed at activation (step 5, Q1) — the DID itself,
   * not only its method, so a switch to a different did:ethr is caught too
   * (E10, AC-08a). Compared with the organisation's primary DID whenever
   * that changes.
   */
  publishingDid: string | null;
  didMethodAtActivation: string | null;
  /** Why it is SUSPENDED: the issuing identity changed (E10) or the organisation was (E9). */
  suspendedReason: "IDENTITY_CHANGED" | "ORGANISATION" | null;
  /** The last run of the activation checks, if any. */
  checks: ActivationCheck[] | null;
  checkedAt: string | null;
  /**
   * The OWNER's grant of `VERIFIER` to NDI's service principal — the
   * invitation issued in the officer's own session (FLOW-ORG-02 step 2 for
   * Kind N, A2 for Kind E; A4 again on restore). P2 needs it: without it
   * activation is E1, and nothing is added (AC-11). The service never
   * grants itself anything (S5); it only accepts what this records.
   */
  ndiGrant: { by: PersonId; at: string } | null;
  /**
   * NDI's service account as a member of the authority's organisation —
   * `null` until step 4 accepts the grant. The authority removes it itself,
   * without asking, from its members list or the console (FLOW-ORG-02 E8,
   * FLOW-ORG-03 A3 — one control, EW-FLOW5-SD §4.4), and turns it back on by
   * granting again (A4).
   */
  ndiAccess: "ACTIVE" | "REMOVED" | null;
  ndiAccessChangedBy: PersonId | null;
  ndiAccessChangedAt: string | null;
}

/** The named platform account that acts in an authority's name (EW-FLOW5-SD/D13). */
export const NDI_SERVICE_PRINCIPAL = "NDI service account";

/**
 * The authorisation — EW-FLOW5-SD §4.4: the record of what NDI's service
 * account was agreed to do, per entity type. Written with each adoption
 * (FLOW-ORG-03 step 5), withdrawn with the membership when NDI's access is
 * paused, and never reactivated: restoring writes a new row (A4), so the
 * record of when NDI could and couldn't act stays readable.
 */
export interface Authorisation {
  id: string;
  designationId: string;
  orgId: string;
  entityType: OrgKind;
  principal: string;
  permittedPurpose: string;
  grantedBy: PersonId;
  grantedAt: string;
  state: "ACTIVE" | "WITHDRAWN";
  withdrawnBy: PersonId | null;
  withdrawnAt: string | null;
}

/** What a person is asked, item by item, with why it is needed (SCR-ADO-01). */
export interface AskedItem {
  item: string;
  from: string;
  why: string;
}

/**
 * The artefact set for one entity type (FLOW-ORG-03): the credential's
 * contents, exactly what a person is asked, and the purpose their wallet
 * shows. NDI may draft it; only the authority adopts it (EW-FLOW5-SD/D7).
 */
export interface ArtefactDraft {
  entityType: OrgKind;
  credential: string;
  contents: string[];
  asked: AskedItem[];
  purpose: string;
  /**
   * An item the draft asks for that the register query doesn't need — the
   * case SCR-ADO-01's objection route exists for (FLOW-ORG-03 P5, A5). An
   * objection holds adoption until NDI revises the draft without it, or the
   * officer withdraws the objection; nothing is overridden.
   */
  overBroad: string | null;
}

export interface Adoption {
  id: string;
  designationId: string;
  orgId: string;
  entityType: OrgKind;
  version: number;
  /** `SUPERSEDED` is kept, never deleted (UC-18). `WITHDRAWN` is a stop (A2). */
  state: "ACTIVE" | "SUPERSEDED" | "WITHDRAWN";
  adoptedBy: PersonId;
  adoptedAt: string;
  asked: AskedItem[];
  purpose: string;
  stoppedBy: PersonId | null;
  stoppedAt: string | null;
}

/**
 * The officer's objection to NDI's draft (FLOW-ORG-03 A5), against one
 * entity type or — `entityType: null` — the whole draft, every entity type
 * in it. Kept with how it closed, permanently (§7.1).
 */
export interface ArtefactObjection {
  id: string;
  designationId: string;
  entityType: OrgKind | null;
  /** The item it names, when it names one — the over-broad one SCR-ADO-01 flags. */
  item: string | null;
  note: string;
  by: PersonId;
  at: string;
  /**
   * It closes one of two ways only: NDI revises the draft (a new draft to
   * review), or the officer withdraws it. NDI can't close it alone and the
   * officer can't override it, so there is no third value.
   */
  closedAt: string | null;
  closedHow: "REVISED" | "WITHDRAWN" | null;
}

/**
 * NDI's revised draft for one entity type, in answer to an objection. A new
 * draft rather than an edit to the old one, so what the officer objected to
 * stays on record beside what replaced it.
 */
export interface DraftRevision {
  designationId: string;
  entityType: OrgKind;
  revision: number;
  at: string;
  asked: AskedItem[];
  objectionId: string;
}

/**
 * The objection holding adoption of an entity type, if any (A5): an open
 * one against that type, or against the whole draft. Every open objection
 * holds — the one the officer names an item in as much as a general one —
 * until NDI revises the draft or the officer withdraws it.
 */
export const openObjectionFor = (objections: ArtefactObjection[], designationId: string | undefined, kind: OrgKind) =>
  objections.find((o) => o.designationId === designationId && !o.closedAt && (o.entityType === null || o.entityType === kind));

/** What the current draft asks for an entity type — NDI's latest revision, or its first draft. */
export function draftAsked(revisions: DraftRevision[], designationId: string | undefined, kind: OrgKind): AskedItem[] {
  const latest = revisions
    .filter((r) => r.designationId === designationId && r.entityType === kind)
    .sort((a, b) => b.revision - a.revision)[0];
  return latest ? latest.asked : draftFor(kind).asked;
}

/**
 * NDI's drafts for each entity type. The sole proprietorship draft also
 * asks for the date of birth — which confirming a licence holder doesn't
 * need, and which SCR-ADO-01 flags on the item so the officer can send it
 * back (E4) rather than adopt it in the authority's name.
 */
export const ARTEFACT_DRAFTS: ArtefactDraft[] = [
  {
    entityType: "sole_proprietorship",
    credential: "Trade Licence",
    contents: ["Business name", "Trade licence number", "Licence holder", "Dzongkhag", "Licence status", "Valid until"],
    asked: [
      { item: "Full name", from: "Citizen ID", why: "To find the licence holder in the trade licence register" },
      { item: "Citizenship ID number", from: "Citizen ID", why: "To tell two people with the same name apart" },
      { item: "Date of birth", from: "Citizen ID", why: "Added in NDI's draft — the register doesn't use it to answer" },
    ],
    purpose: "To check with the Ministry of Industry, Commerce & Employment that you hold this trade licence.",
    overBroad: "Date of birth",
  },
  {
    entityType: "partnership",
    credential: "Trade Licence",
    contents: ["Business name", "Trade licence number", "Partners", "Dzongkhag", "Licence status", "Valid until"],
    asked: [
      { item: "Full name", from: "Citizen ID", why: "To find the partner in the trade licence register" },
      { item: "Citizenship ID number", from: "Citizen ID", why: "To tell two people with the same name apart" },
    ],
    purpose: "To check with the Ministry of Industry, Commerce & Employment that you are a partner in this business.",
    overBroad: null,
  },
  {
    entityType: "company",
    credential: "Business Registration",
    contents: ["Registered name", "Registration number", "Company type", "Registered address", "Status"],
    asked: [
      { item: "Full name", from: "Citizen ID", why: "To find the director or authorised representative" },
      { item: "Citizenship ID number", from: "Citizen ID", why: "To tell two people with the same name apart" },
    ],
    purpose: "To check with the Corporate Regulatory Authority that you can represent this company.",
    overBroad: null,
  },
];

export const draftFor = (kind: OrgKind) => ARTEFACT_DRAFTS.find((d) => d.entityType === kind)!;

/** The marketplace entitlements a foundational issuer needs (FLOW-ORG-02 P5). */
export const ISSUER_ENTITLEMENTS = ["schemaCreate", "issuance", "verification"];

/**
 * Whether a designation has run out of its open 30-day window — approval
 * while PROPOSED (E13), acceptance while PENDING (E6). Read from the date,
 * like an accreditation's window, so the admin list, the console and
 * "Propose again" agree without anyone first having to press a button to
 * discover it. ACCEPTED never lapses (EW-FLOW5-SD §5.1).
 */
export const dsgExpired = (d: Pick<Designation, "state" | "expiresAt">, today: string) =>
  (d.state === "PROPOSED" || d.state === "PENDING") && Boolean(d.expiresAt && d.expiresAt < today);

/**
 * Whether the 10-working-day reminder to NDI administrators has gone for a
 * proposal still waiting for approval (E13) or a designation still waiting
 * for the authority (§5.1 — "after 10 working days of either").
 */
export const dsgReminderSent = (d: Pick<Designation, "state" | "proposedAt" | "approvedAt">) =>
  d.state === "PROPOSED"
    ? workingDaysSince(d.proposedAt) >= REMINDER_WORKING_DAYS
    : d.state === "PENDING"
      ? workingDaysSince(d.approvedAt) >= REMINDER_WORKING_DAYS
      : false;

/** Whether a designation still stands in the way of another for the same organisation. */
export const designationInProgress = (d: Pick<Designation, "state" | "expiresAt">) =>
  ["PROPOSED", "PENDING", "ACCEPTED", "ACTIVE", "SUSPENDED"].includes(d.state) && !dsgExpired(d, new Date().toISOString().slice(0, 10));

/* ------------------------------------------------------------------ */
/* Flow 6 — receiving a credential                                     */
/* ------------------------------------------------------------------ */

/**
 * What an issuer needs to see before it decides: a credential the
 * organisation holds, shared whole (EW-FLOW6-SD/D20), and the items the
 * issuer says it will use. SCR-CRD-02 lists every attribute, because a
 * JSON-LD credential can't be shared in part — and must never claim it is.
 */
export interface Prerequisite {
  credential: string;
  issuer: string;
  /** Every attribute in it, in the words SCR-CRD-02 lists them. */
  attributes: string[];
  /** What the issuer says it uses — a subset of `attributes`. */
  uses: string[];
}

/** A field the officer fills or confirms on SCR-CRD-09. */
export interface OfferField {
  name: string;
  label: string;
  example: string;
}

/**
 * An issuer's offering — something a business can ask it for (SCR-CRD-07).
 * `version` pins what a request agreed to: publishing a change makes a new
 * version, and requests already made keep theirs.
 */
export interface CredentialOffering {
  id: string;
  issuerOrgId: string;
  issuerName: string;
  credential: string;
  summary: string;
  eligibleKinds: OrgKind[];
  prerequisite: Prerequisite;
  /** `queue` — officers answer on SCR-CRD-08 (Kind Q). `api` — the issuer's system answers (Kind A). */
  answering: "queue" | "api";
  answerWindowDays: number;
  renewable: boolean;
  status: "ACTIVE" | "PAUSED" | "RETIRED";
  version: number;
  fields: OfferField[];
  /** Whether the issuer's approval to issue still covers it (FLOW-CRD-03 E2). */
  covered: boolean;
}

/**
 * A request's life, as the holder's side sees it (FLOW-CRD-01). Each is
 * stated in words by who has it now (SCR-CRD-03, UN-38) — never as a code.
 */
export type CrdRequestState =
  | "AWAITING_PROOF"
  | "NEEDS_CONSENT"
  | "WITH_ISSUER"
  | "OFFER_READY"
  | "ISSUED"
  | "DECLINED_BY_ISSUER"
  | "DECLINED_BY_HOLDER"
  | "WITHDRAWN"
  | "EXPIRED"
  | "FAILED";

export interface CredentialRequest {
  id: string;
  orgId: string;
  offeringId: string;
  offeringVersion: number;
  credential: string;
  issuerName: string;
  issuerOrgId: string;
  requestedBy: PersonId;
  requestedAt: string;
  state: CrdRequestState;
  /** What the consent on SCR-CRD-02 covered. */
  consented: Prerequisite;
  /** A1 — what the issuer asked for beyond the consent, listed separately (UXD-35). */
  askedMore: { credential: string; items: string[] } | null;
  /** A1 answered "share this too": what was shared beyond the first consent, which the officer sees too. */
  alsoShared?: { credential: string; items: string[] } | null;
  /** The issuer stops waiting for the answer on this date (7 days, FLOW-CRD-03 E4). */
  consentBy: string | null;
  /** The issuer's answer window (FLOW-CRD-03 step 4). */
  answerBy: string | null;
  /** The issuer's reason, carried verbatim (UXD-38). */
  declined: { code: string; message: string } | null;
  offer: { attributes: CredentialAttribute[]; validUntil: string | null; offeredAt: string; expiresAt: string } | null;
  answeredBy: PersonId | null;
  answeredAt: string | null;
  /**
   * Kind A: answered by the issuer's own system, through the API — recorded
   * as its client, not as a person (FLOW-CRD-03 Q1, Q4; EW-FLOW6-SD §4.3,
   * `answeredBy` is `SYSTEM` or the officer). `answeredBy` stays the
   * officer's id, the one attribution every other screen reads, and is null
   * when the system answered.
   */
  answeredBySystem?: { clientId: string; name: string } | null;
  /** Kind A: where the request stands with the issuer's system. Absent on a request that was the officers' from the start. */
  system?: SystemRoute | null;
  /** Why a request failed, in words (E6, E11, E14, E16, E18, E19). */
  failReason: string | null;
  /** The reason code behind a FAILED or platform-WITHDRAWN request (E14, E16, E19). */
  failCode?: "ISSUER_NOT_TRUSTED" | "ISSUANCE" | "REQUESTER_ENDED" | null;
  /** As `CredentialOffer.simulatedRecheck` — what C2 finds when re-run at acceptance (E19). */
  simulatedRecheck?: "delisted" | "unreachable" | null;
}

/** An offer refused automatically — only ever on the Activity tab (UXD-36). */
export interface RefusedOffer {
  id: string;
  orgId: string;
  claimedIssuer: string;
  credential: string;
  reason: string;
  /** Whether the sender is listed — "claiming" when it isn't, because the name is unproven. */
  listed: boolean;
  at: string;
}

/**
 * Kind A — where a request stands with the issuer's own system, once it has
 * reached the issuer (FLOW-CRD-03 step 5).
 *
 * - `WAITING` — delivered; the system answers after a short delay.
 * - `REFERRED` — A2: the system couldn't decide, and says why. Referring is
 *   not an answer: the system may still offer afterwards, and the first
 *   answer wins.
 * - `MISSED` — E6: delivery to the system failed, so nothing picked it up.
 *   It joins the officers' queue only while fallback is on; with it off, it
 *   waits for the system until `answerBy`.
 * - `UNCONNECTED` — the offering is answered by the system but the issuer
 *   hadn't set it up when the request arrived (no URL, or no client to
 *   answer with — P3), so it went straight to the queue, as SCR-CRD-10's
 *   empty state says it does.
 */
export interface SystemRoute {
  state: "WAITING" | "REFERRED" | "MISSED" | "UNCONNECTED";
  /** What the simulated system does when its delay ends. */
  plan: "answer" | "refer" | "miss";
  /** A2's note — the system's own words, shown to the officers and never to the business. */
  note: string | null;
}

/** A2's note is the issuer system's own words; this one is an example. */
export const SAMPLE_REFERRAL_NOTE = "two records in the register match this registration number";

/**
 * Whether a request is on the officers' queue (SCR-CRD-08). A queue
 * offering's always is; a request for an offering the system answers is only
 * when the system referred it (A2), the issuer hadn't set the system up, or
 * the system missed it and fallback is on (E6). Read from the request and the
 * fallback setting, so turning fallback on moves a request already missed.
 */
export const inOfficerQueue = (r: Pick<CredentialRequest, "state" | "system">, queueFallback: boolean) =>
  r.state === "WITH_ISSUER" &&
  (!r.system || r.system.state === "REFERRED" || r.system.state === "UNCONNECTED" || (r.system.state === "MISSED" && queueFallback));

/** The issuer's integration (SCR-CRD-10) — read by its IT lead, the one technical screen. */
export interface IssuerIntegration {
  orgId: string;
  webhookUrl: string | null;
  secretRotatedAt: string | null;
  clients: { id: string; name: string; createdAt: string }[];
  queueFallback: boolean;
  /**
   * Prototype — what the simulated system does with the next request that
   * reaches it, set by the dashed stand-in on SCR-CRD-10 and put back to
   * `answer` once used. No system exists to decide this for itself.
   */
  nextAnswer: "answer" | "refer" | "miss";
  failingSince: string | null;
  lastError: string | null;
  log: { id: string; event: string; attempt: number; status: number; latencyMs: number; at: string }[];
}

/**
 * Whether the issuer's system can answer: a URL to deliver to and a client
 * to answer with (FLOW-CRD-03 P3). Either missing, and requests go to the
 * officers' queue, as SCR-CRD-10 says before anything is set up.
 */
export const systemConnected = (i: Pick<IssuerIntegration, "webhookUrl" | "clients">) => Boolean(i.webhookUrl) && i.clients.length > 0;

/**
 * What a request becomes when a date it was waiting on passes, or null. The
 * issuer stops waiting for an answer to its wider ask on `consentBy`
 * (FLOW-CRD-03 E4), which withdraws the request; an issuer that hasn't answered by `answerBy` has
 * missed its window (FLOW-CRD-01 E10); an offer nobody accepted lapses on its
 * `expiresAt` (E13). Read from the date, like the other windows in the
 * prototype, so every screen and the store agree without anyone having to
 * press a button that would discover it.
 */
export const crdEnding = (
  r: Pick<CredentialRequest, "state" | "consentBy" | "answerBy" | "offer" | "issuerName">,
  today: string,
): { state: "EXPIRED" | "WITHDRAWN"; failReason: string | null } | null => {
  /* EW-FLOW6-SD §5.1: NEEDS_CONSENT ends in WITHDRAWN "on refusal or when
     the issuer stops waiting" — the request is withdrawn, not expired. */
  if (r.state === "NEEDS_CONSENT" && r.consentBy && r.consentBy < today)
    return { state: "WITHDRAWN", failReason: `${r.issuerName} stopped waiting for your answer. You can ask again.` };
  if (r.state === "WITH_ISSUER" && r.answerBy && r.answerBy < today)
    return { state: "EXPIRED", failReason: `${r.issuerName} didn't answer in time. Nothing was issued. You can ask again.` };
  if (r.state === "OFFER_READY" && r.offer && r.offer.expiresAt < today)
    return { state: "EXPIRED", failReason: `This offer from ${r.issuerName} expired. You can ask again.` };
  return null;
};

/** Whether a request is still in flight — it blocks asking again (FLOW-CRD-01 P5, E5). */
export const requestInFlight = (r: Pick<CredentialRequest, "state">) =>
  ["AWAITING_PROOF", "NEEDS_CONSENT", "WITH_ISSUER", "OFFER_READY"].includes(r.state);

/** The Business Registration's attributes, as SCR-CRD-02 lists them. */
const REGISTRATION_ATTRIBUTES = [
  "Registered name",
  "Registration number",
  "Company type",
  "Registered address",
  "Date of incorporation",
  "Status",
];

/**
 * What the Department of Revenue & Customs offers on request. The TPN is
 * the next credential in a company's chain (UX-EW-01 UXD-14) and what the
 * first day's dashboard leads with; the bonded-warehouse authorisation
 * needs the TPN first, which is E4's case in the catalogue.
 *
 * HOW EACH IS ANSWERED
 *
 * The TPN stays with the officers' queue. Whether the Department answers
 * its taxpayer numbers through the API is still open with GovTech (REQ-EW-01
 * item 23), and the prototype shows both paths without deciding it. The
 * bonded-warehouse authorisation is the one the system answers — which
 * only happens once the office has set its integration up on SCR-CRD-10;
 * until then it lands on the queue like the other. It also comes second in
 * the story, so the system's path can be walked after the queue's.
 */
export const SEED_OFFERINGS: CredentialOffering[] = [
  {
    id: "off-tpn",
    issuerOrgId: "org-drc",
    issuerName: "Department of Revenue & Customs",
    credential: "Taxpayer Number (TPN)",
    summary: "Your business's tax identity — what a bank, a customs broker or a supplier asks for.",
    eligibleKinds: ["company", "sole_proprietorship", "partnership"],
    prerequisite: {
      credential: "Business Registration",
      issuer: "Corporate Regulatory Authority",
      attributes: REGISTRATION_ATTRIBUTES,
      uses: ["Registered name", "Registration number", "Company type"],
    },
    answering: "queue",
    answerWindowDays: 5,
    renewable: false,
    status: "ACTIVE",
    version: 1,
    fields: [
      { name: "tpn", label: "Taxpayer number", example: "TPN-114-8830" },
      { name: "tax_office", label: "Tax office", example: "Thimphu Regional Revenue & Customs Office" },
      { name: "registered_for", label: "Registered for", example: "Business income tax, GST" },
    ],
    covered: true,
  },
  {
    id: "off-bonded",
    issuerOrgId: "org-drc",
    issuerName: "Department of Revenue & Customs",
    credential: "Bonded Warehouse Authorisation",
    summary: "Permission to store goods in a bonded warehouse before duty is paid.",
    eligibleKinds: ["company"],
    prerequisite: {
      credential: "Taxpayer Number (TPN)",
      issuer: "Department of Revenue & Customs",
      attributes: ["Registered name", "Taxpayer number", "Tax office", "Registered for"],
      uses: ["Registered name", "Taxpayer number"],
    },
    answering: "api",
    answerWindowDays: 15,
    renewable: true,
    status: "ACTIVE",
    version: 1,
    fields: [
      { name: "facility_code", label: "Facility code", example: "BW-PHU-0043" },
      { name: "bonded_capacity", label: "Bonded capacity", example: "1,800 m³" },
    ],
    covered: true,
  },
];

export const SEED_INTEGRATION: IssuerIntegration = {
  orgId: "org-drc",
  webhookUrl: null,
  secretRotatedAt: null,
  clients: [],
  queueFallback: true,
  nextAnswer: "answer",
  failingSince: null,
  lastError: null,
  log: [],
};

export interface HarnessState {
  /**
   * Who the console is being driven as. Decides what is *absent*.
   *
   * A person id rather than a PersonaId: a colleague the owner invites at an
   * address the story does not know gets a record of their own, and has to
   * be drivable the moment they accept. The story's named characters are
   * still PersonaIds; this is where anyone else fits.
   */
  persona: PersonId;
  /** 1–6, matching the acts. 0 means nobody has started the story. */
  act: number;
  /** Whether the story runner overlay is showing. */
  runnerOpen: boolean;
  /**
   * Per-screen state overrides, for review rather than for the demo: a screen
   * asks for its own key and renders that state instead of its real one. A
   * state you cannot reach is a state you cannot review.
   */
  stateOverrides: Record<string, string>;
  /**
   * FLOW-ONB-01 P3, as the deployment would set it. Held here rather than
   * only in deployment.ts so the demo can show both ways onto the platform:
   * on, businesses sign up for themselves; off, NDI invites each one
   * (FLOW-ONB-02 Kind O). It is scaffolding — a deployment setting, not
   * something any user of the product could change.
   */
  selfServiceSignup: boolean;
  /**
   * Where the guided demo is, as an index into GUIDE_STEPS; null when it is
   * not running. Optional so a save from before the guide existed still
   * loads — its harness simply has no guide running.
   */
  guideStep?: number | null;
}

export interface DemoState {
  /** Which organization the workspace is currently showing. */
  activeOrgId: string;
  schemas: Schema[];
  credDefs: CredDef[];
  dids: Did[];
  connections: Connection[];
  credentials: Credential[];
  verifications: Verification[];
  organizations: Organization[];
  members: Member[];
  certificates: Certificate[];
  invitations: Invitation[];
  ecosystems: Ecosystem[];
  ecosystemMembers: EcosystemMember[];
  ecosystemInvitations: EcosystemInvitation[];
  bulkUploads: BulkUpload[];
  bulkRecords: BulkRecord[];
  apiKeys: ApiKey[];
  /** Newest first. `orgId` is where it happened; absent means Pelden's
   *  (the seed's entries, written when it was the only organisation). */
  activity: { id: string; text: string; at: string; orgId?: string }[];

  /* ---- Entity wallet ---- */
  people: Person[];
  relations: ControllershipRelation[];
  heldCredentials: HeldCredential[];
  offers: CredentialOffer[];
  /** Flow 7 — proof requests verifiers sent, in every state (SCR-PRS-05). */
  presentationRequests: PresentationRequest[];
  /** Flow 7 — the verifiers' sessions behind FLOW-PRS-01's redirects. */
  presentationSessions: PresentationSession[];
  /** Flow 7 — where NDI may send people back to, per verifier (SCR-PRS-06). */
  returnAddresses: ReturnAddress[];
  parkedOperations: ParkedOperation[];
  /** Flow 8 — every grant of authority to act, in every state (SCR-AUT-01). */
  authorityGrants: AuthorityGrant[];
  /** Flow 8 — SCR-AUT-02's form, read by SCR-AUT-03. */
  authorityDraft: AuthorityDraft | null;
  /** Flow 9 — BNSW's registration records, authority sessions and declarations (BNSW's data, see above). */
  counterpartyRegistrations: CounterpartyRegistration[];
  authoritySessions: AuthoritySession[];
  counterpartyDeclarations: CounterpartyDeclaration[];
  /** Flow 9 — the simulated BNSW portal. */
  bnsw: BnswState;
  auditEntries: AuditEntry[];
  appeals: Appeal[];

  /* ---- Onboarding ---- */
  signup: SignupSession | null;
  orgInvitations: OrgInvitation[];
  orgOnboarding: OrgOnboarding | null;
  /** SCR-ORG-06 — people waiting for an authority to connect. Not applications. */
  orgInterests: OrgInterest[];
  /** FLOW-DEL-02 — whether each new organisation's representative has accepted. */
  responsibilities: Responsibility[];
  /** Flow 4 — approvals to verify or issue, through either door. */
  accreditations: Accreditation[];
  /** Flow 5 — which organisation is the foundational issuer for which entity types. */
  designations: Designation[];
  /** Flow 5 — what each authority has adopted, per entity type, every version kept. */
  adoptions: Adoption[];
  /** Flow 5 — what an officer objected to on SCR-ADO-01, with how each closed (A5). */
  artefactObjections: ArtefactObjection[];
  /** Flow 6 — what issuers offer on request. */
  offerings: CredentialOffering[];
  /** Flow 6 — every organisation's requests to issuers, from both sides. */
  credentialRequests: CredentialRequest[];
  /** Flow 6 — offers refused automatically, shown only on the Activity tab. */
  refusedOffers: RefusedOffer[];
  /** Flow 6 — the issuer's delivery set-up (Kind A). */
  integration: IssuerIntegration;
  /** Flow 5 — NDI's revised drafts, each answering an objection. */
  draftRevisions: DraftRevision[];
  /** Flow 5 — what NDI's service account was agreed to do, per entity type (EW-FLOW5-SD §4.4). */
  authorisations: Authorisation[];
  /**
   * True from the moment onboarding completes until the story jumps past
   * act 1: the console is showing Pelden on its first day (`firstRunState`),
   * not the three-months-in seed.
   */
  firstRun: boolean;

  harness: HarnessState;
}

const ISSUER_DID = "did:polygon:0x63e1c57eb106e9daa28f8883118b7b35ce6288c1";

/* ================================================================== */
/* Dates that do not rot                                               */
/*                                                                     */
/* The entity-wallet fixtures used to be literal dates around          */
/* September 2026, which read correctly for about a fortnight and then */
/* started lying: countdowns said "Expired", capabilities fell outside  */
/* their validity window, and the verification service began failing    */
/* the one check the demo most needs to pass. A demo that decays is a   */
/* demo somebody eventually runs broken in front of an audience.        */
/*                                                                     */
/* So story dates are offsets from today. `day(-7)` is a week ago and   */
/* always will be.                                                      */
/*                                                                     */
/* Computed in UTC on purpose: the server and the client both evaluate  */
/* this module, and a local-time calculation would disagree between     */
/* them for anyone west of Greenwich — a hydration mismatch on every    */
/* screen showing a date. The one residual case is a dev server left    */
/* running across UTC midnight, which a restart fixes.                  */
/*                                                                     */
/* The issuer/verifier fixtures above keep their literal dates. They    */
/* are background rather than story, nothing computes against them, and */
/* an organisation whose schemas were created months ago is right.      */
/* ================================================================== */

const NOW = new Date();

/** A date this many days from today, as YYYY-MM-DD. */
const day = (offset: number): string =>
  new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate() + offset))
    .toISOString()
    .slice(0, 10);

/** A timestamp, for audit rows that show a time as well as a date. */
const at = (offset: number, time: string): string => `${day(offset)}T${time}:00+06:00`;

/**
 * When the capability gate stops observing and starts refusing
 * (EW-FLOW4-SD §6.5). A dated decision, not reached yet: organisations
 * already operating are recognised before it, and every recognition screen
 * shows it, because an officer who misses it finds out by being refused.
 */
export const ENFORCEMENT_DATE = day(53);

/**
 * Credentials published on the platform, and what can be asked for from
 * each — the only things a verifier's scope may be made of (UXD-28). Items
 * that can be answered as a yes or no come first: asking whether someone is
 * over 18 is less than asking for their date of birth.
 */
export const PUBLISHED_CREDENTIALS: { credential: string; issuer: string; items: { item: string; checkOnly: boolean }[] }[] = [
  {
    credential: "Citizen ID",
    issuer: "Department of Civil Registration and Census",
    items: [
      { item: "Is over 18", checkOnly: true },
      { item: "Is a Bhutanese citizen", checkOnly: true },
      { item: "Full name", checkOnly: false },
      { item: "Date of birth", checkOnly: false },
      { item: "Citizenship ID number", checkOnly: false },
      { item: "Photo", checkOnly: false },
      { item: "Permanent address", checkOnly: false },
    ],
  },
  {
    credential: "Driving licence",
    issuer: "Road Safety & Transport Authority",
    items: [
      { item: "Licence is valid", checkOnly: true },
      { item: "Licence class", checkOnly: false },
      { item: "Licence number", checkOnly: false },
    ],
  },
  {
    credential: "Business Registration",
    issuer: "Corporate Regulatory Authority",
    items: [
      { item: "Registration is active", checkOnly: true },
      { item: "Registered name", checkOnly: false },
      { item: "Registration number", checkOnly: false },
    ],
  },
];

/**
 * What the capability gate saw organisations doing while it only observed
 * (EW-FLOW4-SD §10) — the recognition list. A fixture: there is no gate.
 * Bank of Bhutan's verifying asks for more than opening an account needs,
 * which is the case recognition exists to catch (UC-25).
 */
export const OBSERVED_OPERATORS: {
  orgId: string;
  capability: AccCapability;
  since: string;
  ask: AskItem[];
  issue: IssueType[];
  /** Issuer only: the mandate it already issues under, offered as the proposal's one legal basis (D23). */
  legalBasis?: string;
  suggestedPurpose: string;
}[] = [
  {
    orgId: "org-bob",
    capability: "verifier",
    since: day(-210),
    ask: [
      { credential: "Citizen ID", item: "Full name", checkOnly: false },
      { credential: "Citizen ID", item: "Citizenship ID number", checkOnly: false },
      { credential: "Citizen ID", item: "Date of birth", checkOnly: false },
      { credential: "Citizen ID", item: "Photo", checkOnly: false },
      { credential: "Citizen ID", item: "Permanent address", checkOnly: false },
    ],
    issue: [],
    suggestedPurpose: "Confirming who a customer is when they open an account",
  },
  {
    orgId: "org-bob",
    capability: "issuer",
    since: day(-240),
    ask: [],
    issue: [{ name: "Bank account confirmation" }],
    legalBasis: "Financial Services Act — the bank holds the account record",
    suggestedPurpose: "Confirming to other organisations that a customer holds an account",
  },
  {
    orgId: "org-tashicell",
    capability: "issuer",
    since: day(-150),
    ask: [],
    issue: [{ name: "SIM registration" }],
    legalBasis: "Telecommunications licence — the operator registers its subscribers",
    suggestedPurpose: "Proving which person a mobile number is registered to",
  },
];

/** Dates are fixed strings, not computed: a demo should look the same twice. */
export const SEED: DemoState = {
  activeOrgId: "org-pelden",
  schemas: [
    {
      id: "schema:bhutan:2:CitizenshipID:1.2",
      name: "Citizenship ID",
      version: "1.2",
      ledger: "AnonCreds",
      issuerDid: ISSUER_DID,
      createdAt: "2026-03-11",
      attributes: [
        { name: "cid_number", type: "string" },
        { name: "full_name", type: "string" },
        { name: "date_of_birth", type: "date" },
        { name: "dzongkhag", type: "string" },
      ],
    },
    {
      id: "schema:bhutan:2:UniversityDegree:1.0",
      name: "University Degree",
      version: "1.0",
      ledger: "W3C",
      issuerDid: ISSUER_DID,
      createdAt: "2026-04-02",
      attributes: [
        { name: "student_name", type: "string" },
        { name: "programme", type: "string" },
        { name: "graduation_year", type: "number" },
        { name: "honours", type: "string" },
      ],
    },
    {
      id: "schema:bhutan:2:DriversLicence:2.0",
      name: "Driving Licence",
      version: "2.0",
      ledger: "AnonCreds",
      issuerDid: ISSUER_DID,
      createdAt: "2026-05-19",
      attributes: [
        { name: "licence_number", type: "string" },
        { name: "vehicle_class", type: "string" },
        { name: "valid_until", type: "date" },
      ],
    },
  ],
  credDefs: [
    {
      id: "creddef:bhutan:3:CitizenshipID:default",
      schemaId: "schema:bhutan:2:CitizenshipID:1.2",
      tag: "default",
      revocable: true,
      createdAt: "2026-03-11",
    },
    {
      id: "creddef:bhutan:3:UniversityDegree:rub-2026",
      schemaId: "schema:bhutan:2:UniversityDegree:1.0",
      tag: "rub-2026",
      revocable: false,
      createdAt: "2026-04-02",
    },
  ],
  dids: [
    {
      id: ISSUER_DID,
      method: "did:polygon",
      keyType: "ed25519",
      alias: "Issuer key",
      isIssuer: true,
      createdAt: "2026-02-28",
    },
    {
      id: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
      method: "did:key",
      keyType: "ed25519",
      alias: "Test key",
      isIssuer: false,
      createdAt: "2026-04-20",
    },
  ],
  connections: [
    { id: "c-8f21ab4d", label: "Sonam Wangchuk", status: "active", createdAt: "2026-06-02" },
    { id: "c-4b90cc17", label: "Tashi Dema", status: "active", createdAt: "2026-06-14" },
    { id: "c-1e77fa02", label: "Karma Yangchen", status: "active", createdAt: "2026-07-08" },
    { id: "c-9d33b510", label: "Ugyen Tshering", status: "invited", createdAt: "2026-08-01" },
  ],
  credentials: [
    {
      id: "cred-70a1",
      holder: "Sonam Wangchuk",
      schemaName: "Citizenship ID",
      credDefTag: "default",
      state: "accepted",
      issuedAt: "2026-06-03",
      method: "connection",
    },
    {
      id: "cred-70a2",
      holder: "Tashi Dema",
      schemaName: "University Degree",
      credDefTag: "rub-2026",
      state: "accepted",
      issuedAt: "2026-06-15",
      method: "email",
    },
    {
      id: "cred-70a3",
      holder: "Karma Yangchen",
      schemaName: "Citizenship ID",
      credDefTag: "default",
      state: "offered",
      issuedAt: "2026-07-09",
      method: "qr",
    },
    {
      id: "cred-70a4",
      holder: "Ugyen Tshering",
      schemaName: "Driving Licence",
      credDefTag: "default",
      state: "declined",
      issuedAt: "2026-08-02",
      method: "email",
    },
  ],
  verifications: [
    {
      id: "ver-3301",
      holder: "Sonam Wangchuk",
      schemaName: "Citizenship ID",
      state: "verified",
      requestedAt: "2026-07-21",
    },
    {
      id: "ver-3302",
      holder: "Tashi Dema",
      schemaName: "University Degree",
      state: "requested",
      requestedAt: "2026-08-12",
    },
  ],
  organizations: [
    {
      /* NDI itself — see NDI_ORG. Every Studio capability, no Entity Wallet:
         the platform does not hold credentials issued to it here. */
      id: NDI_ORG,
      name: "Bhutan NDI",
      legalName: "Bhutan National Digital Identity",
      description: "Runs the Bhutan National Digital Identity network and this Studio.",
      role: "Owner",
      members: 2,
      createdAt: "2023-02-21",
      website: "https://www.bhutanndi.com",
      location: "Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer", "verifier"],
      memberIds: ["root", "tshering", "tshendu"],
    },
    {
      /* The entity the whole Entity Wallet story is about. */
      id: "org-pelden",
      name: "Pelden Trading Pvt. Ltd.",
      description: "General trading — import and wholesale. CRA-2019-04477.",
      role: "Owner",
      members: 5,
      createdAt: "2026-05-20",
      website: "https://www.peldentrading.bt",
      location: "Babesa, Thimphu, Bhutan",
      visibility: "private",
      /* Holder only: it signed up for itself, so it has an Entity Wallet and
         no issuing or verifying on the network. */
      capabilities: ["holder"],
      /* Not Pema: a clearing agent acts for Pelden from her own Bhutan NDI
         app and needs no account here (EW-FLOW8-SD D10). */
      memberIds: ["dorji", "rinzin", "ugyen", "invitee", "sonam", "karma", "tenzin"],
      /* Listed as an issuer of authority since its first grant (Flow 8, D5). */
      authorityListing: {
        status: "CURRENT",
        did: "did:ethr:bt:0x3b7e90c4d12a58f6e0b9a41c7d2e85f3a6c01d94",
        listedAt: "2026-07-14",
        firstNotice: null,
      },
    },
    {
      /* Already on NDI as an issuer and verifier long before the Entity
         Wallet existed — it issues account credentials and checks proofs at
         the counter. Three months into the story it also holds an Entity
         Wallet: its owner verified it with the Corporate Regulatory
         Authority, the way any organisation already on the platform is
         verified (FLOW-ORG-01 Kind E) — nobody at NDI approved it. Each organisation appears only in its own
         people's switcher, so Pelden's never shows it. */
      id: "org-bob",
      name: "Bank of Bhutan",
      legalName: "Bank of Bhutan Ltd.",
      description: "Commercial bank. Issues account credentials and verifies customers on NDI.",
      role: "Owner",
      members: 3,
      createdAt: "2024-02-12",
      website: "https://www.bob.bt",
      location: "Norzin Lam, Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer", "verifier", "holder"],
      publicDid: ISSUER_DID,
      memberIds: ["yeshey"],
      /* Yeshey is the bank's OWNER, and only an OWNER accepts an approval
         for it (SCR-ACC-03) — recorded, not assumed from the org's role. */
      roles: { yeshey: "Owner" },
    },
    {
      /* Another existing NDI customer, already issuing before approvals were
         enforced — the second entry on the recognition list. */
      id: "org-tashicell",
      name: "Tashi InfoComm Ltd.",
      description: "Mobile network operator. Issues SIM-registration credentials.",
      role: "Owner",
      members: 2,
      createdAt: "2025-03-04",
      location: "Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer"],
      memberIds: [],
    },
    {
      /* The authority every company chains back to. Designated through a
         Kind O invitation before the Entity Wallet opened (see
         designations), with the issuing identity a foundational issuer
         needs. Not driven in the demo: its office is only ever seen through
         what it confirms. */
      id: "org-cra",
      statutory: true,
      name: "Corporate Regulatory Authority",
      legalName: "Corporate Regulatory Authority",
      description: "Statutory authority · Registrar of Companies.",
      role: "Owner",
      members: 1,
      createdAt: "2025-11-02",
      location: "Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer", "verifier"],
      memberIds: ["registrar"],
      roles: { registrar: "Owner" },
      issuingDid: "did:ethr:bt:0x5a2f7c19e0b4d8a63c11f0e97b2d4a6c8e3f1b07",
      agentReady: true,
      entitlements: ["schemaCreate", "issuance", "verification"],
    },
    {
      /* Flow 5's authority. The Ministry of Industry, Commerce & Employment
         licenses sole proprietorships and partnerships, and is already on
         the platform — it verifies trade licences at its own counters — so
         it is designated in place (FLOW-ORG-02 Kind E) rather than invited.
         It has the issuing identity a foundational issuer needs, and lacks
         one entitlement: schema creation, which it has never needed. That
         is the E4 the activation checks catch, and NDI resolves. */
      id: "org-moice",
      statutory: true,
      name: "Ministry of Industry, Commerce & Employment",
      legalName: "Ministry of Industry, Commerce & Employment",
      description: "Licenses sole proprietorships and partnerships. Verifies trade licences on NDI.",
      role: "Owner",
      members: 1,
      createdAt: "2025-06-18",
      location: "Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer", "verifier"],
      memberIds: ["kesang"],
      /* Kesang is the ministry's OWNER — the only role that accepts a
         designation or adopts in its name (SCR-DSG-03, SCR-ADO-02). */
      roles: { kesang: "Owner" },
      issuingDid: "did:ethr:bt:0x9c4e21a7b8f03d56e1a2c7b94f0d18e6a3b5c2d9",
      agentReady: true,
      entitlements: ["issuance", "verification"],
    },
    {
      /* Flow 6's issuer. The Department of Revenue & Customs issues the
         taxpayer number a company needs next, approved to issue on NDI. Its
         officers answer requests from a queue today (Kind Q); its own system
         isn't connected yet, which SCR-CRD-10 shows as its empty state. */
      id: "org-drc",
      name: "Department of Revenue & Customs",
      legalName: "Department of Revenue & Customs, Ministry of Finance",
      description: "Issues taxpayer numbers and customs authorisations on NDI.",
      role: "Owner",
      members: 1,
      createdAt: "2024-09-03",
      location: "Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer", "verifier"],
      memberIds: ["deki"],
      roles: { deki: "Owner" },
      publicDid: "did:polygon:0x08b3ba5dcbac0b871587004b93f298dcc81726c3",
    },
    {
      /* Flow 8's counterparty. The Bhutan National Single Window is where a
         clearing agent declares for a company (EW-FLOW8-SD §9), and the one
         organisation the task vocabulary names (§5.2). It verifies on the
         platform, which is what makes it CURRENT as a verifier (G5). Nobody
         in the story works there: its own page is Flow 9's stand-in. */
      id: "org-bnsw",
      name: "Bhutan National Single Window",
      legalName: "Bhutan National Single Window, Department of Revenue & Customs",
      description: "The single window for customs declarations. Verifies authority to act on NDI.",
      role: "Owner",
      members: 0,
      createdAt: "2026-04-14",
      location: "Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["verifier"],
      memberIds: [],
      publicDid: "did:ethr:bt:0x6e1d47a0c9b38f25d7e40a1c6b93f08e2d57a4c1",
    },
  ],
  /* The original Studio's staff list — four NDI people the story never
     knew, the first of them the prototype's own designer. Emptied: NDI's
     organisation is root and the admins root invites (see UsersView). */
  members: [],
  certificates: [
    {
      id: "x509-1",
      commonName: "issuer.bhutanndi.bt",
      keyType: "RSA 2048",
      validFrom: "2026-01-15",
      expires: "2027-01-15",
      status: "valid",
    },
    {
      id: "x509-2",
      commonName: "verify.bhutanndi.bt",
      keyType: "ECDSA P-256",
      validFrom: "2025-09-01",
      expires: "2026-09-01",
      status: "expiring",
    },
  ],
  invitations: [
    {
      id: "inv-1",
      organization: "Ministry of Education",
      invitedBy: "sangay@moe.gov.bt",
      role: "Issuer",
      receivedAt: "2026-08-18",
      state: "pending",
    },
  ],
  ecosystems: [
    { id: "eco-1", name: "Bhutan Education Trust", role: "Lead", members: 3, joinedAt: "2026-04-08" },
  ],
  ecosystemMembers: [
    {
      id: "em-1",
      organization: "Bhutan NDI",
      role: "Lead",
      joinedAt: "2026-04-08",
      status: "active",
    },
    {
      id: "em-2",
      organization: "Royal University of Bhutan",
      role: "Issuer",
      joinedAt: "2026-04-12",
      status: "active",
    },
    {
      id: "em-3",
      organization: "Ministry of Education",
      role: "Verifier",
      joinedAt: "2026-05-02",
      status: "invited",
    },
  ],
  ecosystemInvitations: [
    {
      id: "einv-1",
      ecosystem: "Himalayan Trust Network",
      invitedBy: "governance@htn.org",
      role: "Verifier",
      receivedAt: "2026-08-20",
      state: "pending",
    },
  ],
  bulkUploads: [
    {
      id: "bulk-2201",
      fileName: "graduates-2026-batch-1.csv",
      records: 248,
      succeeded: 246,
      failed: 2,
      status: "partial",
      uploadedAt: "2026-07-30",
    },
    {
      id: "bulk-2202",
      fileName: "graduates-2026-batch-2.csv",
      records: 112,
      succeeded: 112,
      failed: 0,
      status: "completed",
      uploadedAt: "2026-08-06",
    },
  ],
  bulkRecords: [
    { id: "br-1", uploadId: "bulk-2201", holder: "choki.wangmo@rub.edu.bt", status: "issued" },
    { id: "br-2", uploadId: "bulk-2201", holder: "tenzin.norbu@rub.edu.bt", status: "issued" },
    {
      id: "br-3",
      uploadId: "bulk-2201",
      holder: "not-an-email",
      status: "failed",
      error: "Invalid email address",
    },
    {
      id: "br-4",
      uploadId: "bulk-2201",
      holder: "rinzin.p@rub.edu.bt",
      status: "failed",
      error: "Missing required attribute: graduation_year",
    },
    { id: "br-5", uploadId: "bulk-2202", holder: "yeshey.d@rub.edu.bt", status: "issued" },
  ],
  apiKeys: [
    {
      id: "key-1",
      label: "Issuance service",
      masked: "ndi_live_••••••••7f3a",
      createdAt: "2026-03-12",
      lastUsed: "2026-08-22",
      status: "active",
    },
  ],
  /* Pelden's recent history, newest first, drawn from the same events as the
     audit trail below so the two never disagree. It used to be the inherited
     Studio's issuer feed — credentials offered to graduates, a bulk upload —
     which read as this trading company running a university's issuance. */
  activity: [
    { id: "a-1", text: "Pema Choden accepted Declaration authority", at: day(-1) },
    { id: "a-2", text: "Declaration authority issued to Pema Choden", at: day(-2) },
    { id: "a-3", text: "Business Registration presented to Bhutan National Single Window", at: day(-14) },
    { id: "a-4", text: "Karma Wangmo's controllership ended", at: day(-40) },
    { id: "a-5", text: "Rinzin Dema accepted the duties of a controller", at: day(-102) },
  ],

  /* ================================================================ */
  /* Entity wallet — the six acts, as data                            */
  /* ================================================================ */

  people: [
    {
      id: "dorji",
      name: "Dorji Wangchuk",
      cid: "•••• •••• 4821",
      email: "dorji.wangchuk@peldentrading.bt",
      title: "Director · registered representative",
      cidVerified: true,
      memberRole: "Owner",
    },
    {
      id: "rinzin",
      name: "Rinzin Dema",
      cid: "•••• •••• 7134",
      email: "rinzin.dema@peldentrading.bt",
      title: "Operations manager",
      cidVerified: true,
      memberRole: "Member",
    },
    {
      id: "pema",
      name: "Pema Choden",
      cid: "•••• •••• 2960",
      email: "pema.choden@druksharpa.bt",
      title: "Clearing agent · Druk Sharpa Freight",
      cidVerified: true,
    },
    {
      /* Act 2's recipient: verified, and deliberately holding nothing. He is
         who the audience watches an authority being built for. */
      id: "ugyen",
      name: "Ugyen Phuntsho",
      cid: "•••• •••• 8306",
      email: "ugyen.phuntsho@peldentrading.bt",
      title: "Warehouse manager",
      cidVerified: true,
      memberRole: "Member",
    },
    {
      id: "sonam",
      name: "Sonam Yeshey",
      cid: "•••• •••• 5573",
      email: "sonam.yeshey@peldentrading.bt",
      title: "Finance officer",
      cidVerified: true,
      memberRole: "Member",
    },
    {
      id: "karma",
      name: "Karma Wangmo",
      cid: "•••• •••• 1208",
      email: "karma.wangmo@peldentrading.bt",
      title: "Finance officer (left the company)",
      cidVerified: true,
    },
    {
      /* C2 needs a person the register has not confirmed, or its
         "person not CID-verified" state is unreachable. */
      id: "tenzin",
      name: "Tenzin Norbu",
      cid: "—",
      email: "tenzin.norbu@peldentrading.bt",
      title: "Warehouse supervisor",
      cidVerified: false,
      memberRole: "Member",
    },
    {
      /* The two NDI administrators every second approval needs — the
         root account approves nothing (FLOW-ONB-02 S2). Neither belongs to
         Pelden Trading or to any business: they act for the platform
         administration organisation, which is seeded rather than onboarded
         (Flow 1 design D9). */
      id: "tshering",
      name: "Kinzang Dorji",
      cid: "•••• •••• 3317",
      email: "kinzang.dorji@bhutanndi.bt",
      title: "Platform admin · Bhutan NDI",
      cidVerified: true,
      platformRole: "admin",
    },
    {
      id: "tshendu",
      name: "Tshendu",
      cid: "•••• •••• 4528",
      email: "tshendu@bhutanndi.bt",
      title: "Platform admin · Bhutan NDI",
      cidVerified: true,
      platformRole: "admin",
    },
    {
      /* NDI's root administrator. Seeded by the deployment with an account
         already made, so never onboarded and never signed up: signs in.
         Named only as "Root", not as a person: root is the deployment's
         own account, held by whoever NDI makes responsible for it, and
         giving it a staff member's name read as though one person owned
         the platform. */
      id: "root",
      name: "Root",
      cid: "•••• •••• 1002",
      email: "root@bhutanndi.bt",
      title: "Root administrator · Bhutan NDI",
      cidVerified: true,
      platformRole: "root",
    },
    {
      /* Bank of Bhutan's owner on the platform — an account that has
         existed since the bank started issuing on NDI. */
      id: "yeshey",
      name: "Yeshey Choden",
      cid: "•••• •••• 7731",
      email: "yeshey.choden@bob.bt",
      title: "Head of digital banking · Bank of Bhutan",
      cidVerified: true,
    },
    {
      /* The Ministry of Industry, Commerce & Employment's officer — a senior
         civil servant, not an SSI specialist (UX-EW-02 §1.1). Has had an
         account since the ministry started verifying on NDI. */
      id: "kesang",
      name: "Kesang Wangmo",
      cid: "•••• •••• 5108",
      email: "kesang.wangmo@moice.gov.bt",
      title: "Director, Department of Trade · Ministry of Industry, Commerce & Employment",
      cidVerified: true,
    },
    {
      /* The Department of Revenue & Customs' officer: processes taxpayer
         registrations in DRC's own system today (UX-EW-03 §1.1), and is
         also the office's owner on the platform, so one person can show
         both the queue and the offerings. */
      id: "deki",
      name: "Deki Yangzom",
      cid: "•••• •••• 2264",
      email: "deki.yangzom@drc.gov.bt",
      title: "Taxpayer services officer · Department of Revenue & Customs",
      cidVerified: true,
    },
    {
      /* The Corporate Regulatory Authority's office, as its records name
         who adopted in its name. Never driven — not in PERSONAS. */
      id: "registrar",
      name: "Office of the Registrar",
      cid: "—",
      email: "registrar@cra.gov.bt",
      title: "Registrar of Companies · Corporate Regulatory Authority",
      cidVerified: true,
    },
  ],

  relations: [
    {
      /* Yeshey's root authority over Bank of Bhutan's Entity Wallet, from
         when the bank set it up. */
      id: "rel-bob-root",
      orgId: "org-bob",
      personId: "yeshey",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-bob-2026-06.pdf",
        hash: "sha256:7d0e5a91c3b24f68a0e1d97c52b8f3a4e6c10d29b7f5a8e3",
        reference: "BOB/BR/2026/022",
      },
      scope: {
        version: 1,
        validFrom: day(-70),
        validUntil: null,
        grants: [
          { operation: "credential:receive", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:accept", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "proof:present", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
        ],
      },
      state: "ACTIVE",
      isRootAuthority: true,
      createdAt: day(-70),
      acceptedAt: day(-70),
      activatedAt: day(-70),
    },
    {
      /* The Owner's own relation. Full scope, no expiry — the root everything
         else is granted out of, and the reason the scope grammar needs a
         special case rather than a sentence listing every operation. */
      id: "rel-root",
      personId: "dorji",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-2026-05-18.pdf",
        hash: "sha256:4f1c9e2a7b83d05e6c41a9fb2d7e08c3915b6ad4e2f70c81",
        reference: "PT/BR/2026/011",
      },
      scope: {
        version: 1,
        validFrom: day(-112),
        validUntil: null,
        grants: [
          { operation: "credential:receive", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:accept", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "proof:present", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "connection:create", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "approval:decide", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          /* The Root preset gained authority:issue when giving authority to
             act became something the Root can also tick for others
             (EW-FLOW3-SD §4.2, EW-FLOW8-SD/D21). */
          { operation: "authority:issue", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
        ],
      },
      state: "ACTIVE",
      isRootAuthority: true,
      createdAt: day(-112),
      acceptedAt: day(-112),
      activatedAt: day(-112),
    },
    {
      /* Rinzin's grant, the one Act 3 runs on. Deliberately narrow, and
         narrow in a way you can see: she may present exactly one kind of
         credential, to two named counterparties, and only presenting needs
         an approver. Accepting has no type filter — EW-FLOW3-SD §4.2 gives
         credential:accept none, AUTO, in every preset. */
      id: "rel-rinzin",
      personId: "rinzin",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-2026-05-28.pdf",
        hash: "sha256:9a7d40be15c2f386071e4dab8c93520fe6b1748ad03c95e2",
        reference: "PT/BR/2026/014",
      },
      scope: {
        version: 3,
        validFrom: day(-100),
        validUntil: day(113),
        grants: [
          { operation: "credential:receive", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:accept", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          {
            operation: "proof:present",
            credentialTypes: { mode: "list", values: ["Business Registration"] },
            relyingParties: { mode: "list", values: ["Bhutan National Single Window", "Bank of Bhutan"] },
            approval: "SINGLE_APPROVER",
          },
          { operation: "connection:create", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          /* *Give authority to act*, at its default: each grant needs one
             other person to approve it (EW-FLOW3-SD §4.2, EW-FLOW8-SD D2).
             Rinzin looks after the clearing agents — Journey T. */
          { operation: "authority:issue", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "SINGLE_APPROVER" },
        ],
      },
      state: "ACTIVE",
      isRootAuthority: false,
      createdAt: day(-104),
      acceptedAt: day(-102),
      activatedAt: day(-102),
    },
    {
      /* Waiting on its Controller. The register has to show this state, and
         C4 needs a relation that has not been accepted yet. */
      id: "rel-sonam",
      personId: "sonam",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-2026-09-01.pdf",
        hash: "sha256:2e58ac91d7f4630b85c2019eab7d43f6c80915e7b24da6f3",
        reference: "PT/BR/2026/019",
      },
      scope: {
        version: 1,
        validFrom: day(-1),
        validUntil: day(203),
        grants: [
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "approval:decide", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
        ],
      },
      state: "PENDING_ACCEPTANCE",
      isRootAuthority: false,
      createdAt: day(-8),
      acceptedAt: null,
      activatedAt: null,
    },
    {
      /* The departing-officer fear from the personas, already resolved. */
      id: "rel-karma",
      personId: "karma",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-2026-03-04.pdf",
        hash: "sha256:71b3ec4a09d8526f1c74b0ade39f2851dc6047ba9e13f582",
        reference: "PT/BR/2026/006",
      },
      scope: {
        version: 2,
        validFrom: day(-187),
        validUntil: day(113),
        grants: [
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          {
            operation: "proof:present",
            credentialTypes: { mode: "list", values: ["Tax Clearance Certificate"] },
            relyingParties: { mode: "list", values: ["Bank of Bhutan"] },
            approval: "DUAL_CONTROL",
          },
        ],
      },
      state: "TERMINATED",
      isRootAuthority: false,
      createdAt: day(-189),
      acceptedAt: day(-187),
      activatedAt: day(-187),
      endedReason: "Left the company. Terminated on her last working day.",
    },
  ],

  heldCredentials: [
    {
      /* Act 1's milestone, and the root of every chain in Act 5. */
      id: "hc-foundational",
      type: "Business Registration",
      issuer: "Corporate Regulatory Authority",
      issuerDid: "did:polygon:0xbc8970d729b33f01ff0e7ca3caaf695da8747db4",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "registration_number", value: "CRA-2019-04477" },
        { name: "entity_type", value: "Private limited company" },
        { name: "registered_address", value: "Babesa, Thimphu, Bhutan" },
        { name: "incorporation_date", value: day(-2583) },
        { name: "status", value: "Active" },
      ],
      isFoundational: true,
      receivedAt: day(-112),
      expiresAt: null,
      status: "active",
    },
    {
      /* Bank of Bhutan's own registration, in its own wallet. */
      id: "hc-bob-registration",
      orgId: "org-bob",
      type: "Business Registration",
      issuer: "Corporate Regulatory Authority",
      issuerDid: "did:polygon:0xe58a0aa81d2ec2fb904f800d2699123052be5913",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Bank of Bhutan Ltd." },
        { name: "registration_number", value: "CRA-1997-00112" },
        { name: "entity_type", value: "Public limited company" },
        { name: "registered_address", value: "Norzin Lam, Thimphu, Bhutan" },
        { name: "status", value: "Active" },
      ],
      isFoundational: true,
      receivedAt: day(-70),
      expiresAt: null,
      status: "active",
    },
    {
      /* Not everything an entity holds comes from government. A bank issues
         the company its account as a credential too — the same wallet holds
         both, as any NDI wallet would, and presenting it is how Pelden proves
         to a supplier where payment goes without sending a bank letter. */
      id: "hc-bank",
      type: "Business Current Account",
      issuer: "Bank of Bhutan",
      issuerDid: "did:polygon:0xa2a4e362eb3f8494b23536454137d49265f1725c",
      issuerTrusted: true,
      attributes: [
        { name: "account_holder", value: "Pelden Trading Pvt. Ltd." },
        { name: "account_number", value: "•••• •••• 4417" },
        { name: "branch", value: "Thimphu main branch" },
        { name: "opened_on", value: day(-104) },
      ],
      isFoundational: false,
      receivedAt: day(-104),
      expiresAt: null,
      status: "active",
    },
    {
      id: "hc-tax",
      type: "Tax Clearance Certificate",
      issuer: "Department of Revenue & Customs",
      issuerDid: "did:polygon:0x08b3ba5dcbac0b871587004b93f298dcc81726c3",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "tpn", value: "TPN-114-8830" },
        { name: "assessment_year", value: "2025" },
        { name: "cleared_on", value: day(-161) },
      ],
      isFoundational: false,
      receivedAt: day(-161),
      expiresAt: day(-9),
      status: "expired",
    },
    {
      id: "hc-freight",
      type: "Freight Forwarder Permit",
      issuer: "Road Safety & Transport Authority",
      issuerDid: "did:polygon:0x7df3e776fe6432c53644c127df254180e12526fb",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "permit_number", value: "RSTA-FF-2024-0912" },
        { name: "vehicle_classes", value: "Heavy goods, container" },
      ],
      isFoundational: false,
      receivedAt: day(-210),
      expiresAt: day(154),
      status: "revoked",
    },
    {
      /* Pelden's taxpayer number, from the Department of Revenue & Customs
         (Flow 6's offering). Flow 9's registration with the Single Window
         shares it with the registration and the licence (EW-FLOW9-SD §4.1). */
      id: "hc-tpn",
      type: "Taxpayer Number (TPN)",
      issuer: "Department of Revenue & Customs",
      issuerDid: "did:polygon:0x08b3ba5dcbac0b871587004b93f298dcc81726c3",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "tpn", value: "TPN-114-8830" },
        { name: "tax_office", value: "Thimphu Regional Revenue & Customs Office" },
        { name: "registered_for", value: "Business income tax, GST" },
      ],
      isFoundational: false,
      receivedAt: day(-60),
      expiresAt: null,
      status: "active",
    },
    {
      /* Flow 8 — the business licence Pelden's clearing agents act under.
         The Phuentsholing branch's, because that is where its imports cross.
         MoICE marks its business licence as one someone acting for the
         holder may use (EW-FLOW8-SD D9), so it can be named in a grant (G4). */
      id: "hc-licence-plg",
      type: "Business Licence",
      issuer: "Ministry of Industry, Commerce & Employment",
      issuerDid: "did:ethr:bt:0x9c4e21a7b8f03d56e1a2c7b94f0d18e6a3b5c2d9",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "licence_number", value: "BL-PLG-2025-00871" },
        { name: "licensed_activity", value: "General trading — import and wholesale" },
        { name: "branch", value: "Phuentsholing" },
      ],
      isFoundational: false,
      receivedAt: day(-150),
      expiresAt: day(215),
      status: "active",
    },
    {
      /* An earlier licence, now expired — SCR-AUT-02 shows it unavailable,
         with the reason, rather than hiding it (E4, UXD-47). */
      id: "hc-licence-thi-old",
      type: "Business Licence",
      issuer: "Ministry of Industry, Commerce & Employment",
      issuerDid: "did:ethr:bt:0x9c4e21a7b8f03d56e1a2c7b94f0d18e6a3b5c2d9",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "licence_number", value: "BL-THI-2022-04410" },
        { name: "licensed_activity", value: "General trading — retail" },
        { name: "branch", value: "Thimphu" },
      ],
      isFoundational: false,
      receivedAt: day(-1100),
      expiresAt: day(-30),
      status: "expired",
    },
  ],

  offers: [
    {
      /* Act 3's offer, sent without a request (FLOW-CRD-02) and reviewed on
         SCR-CRD-04 like any other. Accepting it is the whole interaction,
         and the type is read from this payload, not typed.

         A trade licence, because that is what a trading company is offered
         after incorporation (Story A2 in the user stories: MoICE issues the
         Business Licence that authorises the activity). This was a Customs
         Broker Licence while the entity was a logistics firm; an importer does
         not hold one — it hires a licensed clearing agent, which is Pema. */
      id: "offer-licence",
      type: "Business Licence",
      issuer: "Ministry of Industry, Commerce & Employment",
      issuerDid: "did:polygon:0xafb50adefe9b359e15a79eada5d0bbb2675f33d3",
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "licence_number", value: "BL-THI-2026-10442" },
        { name: "licensed_activity", value: "General trading — import and wholesale" },
        { name: "valid_until", value: day(358) },
      ],
      state: "pending",
      receivedAt: day(-7),
      expiresAt: day(23),
    },
    {
      /* An ordinary offer. It used to be the denied example, refused because
         Rinzin's accept grant named only two credential types. EW-FLOW3-SD
         §4.2 gives credential:accept no type filter in any preset, so no
         offer can be out of scope by its type. The one refusal SCR-CRD-04
         has is about the person — a role without credential:accept — and
         that face is in SCR-CRD-04's state switcher, on any offer. */
      id: "offer-insurance",
      type: "Fleet Insurance Certificate",
      issuer: "Royal Insurance Corporation of Bhutan",
      issuerDid: "did:polygon:0x4fc2bf84747e22ab86675163f6b59fc8ab469cb4",
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "policy_number", value: "RICB-MV-2026-77412" },
        { name: "sum_insured", value: "BTN 4,200,000" },
      ],
      state: "pending",
      receivedAt: day(-4),
      expiresAt: day(26),
    },
    {
      /* A reissue of something Pelden already holds — the same type from the
         same issuer DID as hc-bank — so SCR-CRD-04 says what it replaces,
         and accepting it marks the earlier one superseded (EW-FLOW6-SD §4.5,
         Journey L). It replaces what used to be an unasked Bonded Warehouse
         Authorisation, which needed an approver to accept and a TPN Pelden
         doesn't hold — neither of which the spec allows. */
      id: "offer-bank",
      type: "Business Current Account",
      issuer: "Bank of Bhutan",
      issuerDid: "did:polygon:0xa2a4e362eb3f8494b23536454137d49265f1725c",
      attributes: [
        { name: "account_holder", value: "Pelden Trading Pvt. Ltd." },
        { name: "account_number", value: "•••• •••• 4417" },
        { name: "branch", value: "Phuentsholing branch" },
        { name: "opened_on", value: day(-104) },
      ],
      state: "pending",
      receivedAt: day(-3),
      expiresAt: day(27),
    },
    {
      /* Nobody reviewed it within 30 days (FLOW-CRD-02 E4). */
      id: "offer-lapsed",
      type: "Warehouse Safety Certificate",
      issuer: "Department of Labour",
      issuerDid: "did:polygon:0x37c307beb791b306b109010ad5d97de062f28f02",
      attributes: [{ name: "registered_name", value: "Pelden Trading Pvt. Ltd." }],
      state: "expired",
      receivedAt: day(-52),
      expiresAt: day(-22),
    },
  ],

  /*
   * Flow 7 — what verifiers have asked Pelden for, three months in. Each is
   * here for a case the screens must show from the seed, before anyone has
   * walked anything (UX-EW-04 SCR-PRS-05):
   *
   * - pr-bob-earlier: Rinzin chose to share with the bank and Dorji hasn't
   *   approved yet — Journey P's middle, AWAITING_APPROVAL.
   * - pr-moice-tender: the ministry checking bidders asks for a tax
   *   clearance Pelden holds only expired — D17, shown but not answerable.
   * - pr-drc-check: a verifier outside Rinzin's reach — FLOW-PRS-02 E5 for
   *   her, an ordinary share for Dorji.
   * - History: the account the bank opened (Dorji, AUTO), a loan Rinzin
   *   shared and Dorji approved, and a request that expired after Karma's
   *   appointment ended under it.
   * - Refused: a sender not on NDI's list, and the bank asking for
   *   something outside what it is approved to ask for — neither notified.
   */
  presentationRequests: [
    {
      id: "pr-bob-earlier",
      verifierOrgId: "org-bob",
      verifierName: "Bank of Bhutan",
      verifierDid: ISSUER_DID,
      purpose: "Annual review of a business customer's registration, as banking rules require.",
      asked: [{ id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number", "entity_type"] }],
      sessionId: null,
      displayReference: null,
      status: "AWAITING_APPROVAL",
      chosen: { registration: "hc-foundational" },
      initiatedBy: "rinzin",
      initiatedAt: day(-1),
      approvalId: "park-present-bob",
      receivedAt: day(-3),
      expiresAt: day(4),
    },
    {
      id: "pr-moice-tender",
      verifierOrgId: "org-moice",
      verifierName: "Ministry of Industry, Commerce & Employment",
      verifierDid: "did:ethr:bt:0x9c4e21a7b8f03d56e1a2c7b94f0d18e6a3b5c2d9",
      purpose: "Checking that every bidder on tender MoICE/T/2026/031 is registered and has cleared its taxes.",
      asked: [
        { id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number", "status"] },
        { id: "tax", credentialType: "Tax Clearance Certificate", fields: ["tpn", "assessment_year"] },
      ],
      sessionId: null,
      displayReference: null,
      status: "OPEN",
      receivedAt: day(-1),
      expiresAt: day(6),
    },
    {
      id: "pr-drc-check",
      verifierOrgId: "org-drc",
      verifierName: "Department of Revenue & Customs",
      verifierDid: "did:polygon:0x08b3ba5dcbac0b871587004b93f298dcc81726c3",
      purpose: "Confirming your registered name and number before we update your taxpayer record.",
      asked: [{ id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number"] }],
      sessionId: null,
      displayReference: null,
      status: "OPEN",
      receivedAt: day(-2),
      expiresAt: day(5),
    },
    {
      id: "pr-bob-loan",
      verifierOrgId: "org-bob",
      verifierName: "Bank of Bhutan",
      verifierDid: ISSUER_DID,
      purpose: "Assessing a working-capital loan application.",
      asked: [{ id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number"] }],
      sessionId: null,
      displayReference: "LN-2026-0381",
      status: "SHARED",
      chosen: { registration: "hc-foundational" },
      initiatedBy: "rinzin",
      initiatedAt: day(-15),
      approvedBy: "dorji",
      approvalId: "park-approved-bob-loan",
      decidedBy: "rinzin",
      decidedAt: day(-14),
      receivedAt: day(-15),
      expiresAt: day(-8),
    },
    {
      id: "pr-bob-account",
      verifierOrgId: "org-bob",
      verifierName: "Bank of Bhutan",
      verifierDid: ISSUER_DID,
      purpose: "Opening a business current account.",
      asked: [{ id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number", "registered_address"] }],
      sessionId: null,
      displayReference: "EKYB-20177",
      status: "SHARED",
      chosen: { registration: "hc-foundational" },
      initiatedBy: "dorji",
      initiatedAt: day(-106),
      decidedBy: "dorji",
      decidedAt: day(-106),
      receivedAt: day(-106),
      expiresAt: day(-99),
    },
    {
      id: "pr-lapsed",
      verifierOrgId: "org-bob",
      verifierName: "Bank of Bhutan",
      verifierDid: ISSUER_DID,
      purpose: "Confirming tax clearance before renewing an overdraft.",
      asked: [{ id: "tax", credentialType: "Tax Clearance Certificate", fields: ["tpn", "assessment_year"] }],
      sessionId: null,
      displayReference: null,
      status: "EXPIRED",
      lapsedSharer: "karma",
      receivedAt: day(-30),
      expiresAt: day(-23),
    },
    {
      id: "pr-druk",
      verifierOrgId: null,
      verifierName: "Druk Trading House",
      verifierDid: "did:polygon:0x067c37a944b618effbd0dfe9f463e5f60e458b07",
      purpose: "Supplier onboarding.",
      asked: [{ id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number", "registered_address"] }],
      sessionId: null,
      displayReference: null,
      status: "BLOCKED",
      blockedReason: "VERIFIER_NOT_TRUSTED",
      receivedAt: day(-2),
      expiresAt: day(5),
    },
    {
      id: "pr-bob-scope",
      verifierOrgId: "org-bob",
      verifierName: "Bank of Bhutan",
      verifierDid: ISSUER_DID,
      purpose: "Checking a trade-finance customer's transport permits.",
      asked: [{ id: "permit", credentialType: "Freight Forwarder Permit", fields: ["permit_number", "vehicle_classes"] }],
      sessionId: null,
      displayReference: null,
      status: "BLOCKED",
      blockedReason: "OUT_OF_SCOPE",
      receivedAt: day(-9),
      expiresAt: day(-2),
    },
  ],
  presentationSessions: [],
  /* Bank of Bhutan's one registered return address — its eKYB journey's
     return page. Removing it is how FLOW-PRS-01 E15 is reached live. */
  returnAddresses: [
    {
      id: "ra-bob-ekyb",
      orgId: "org-bob",
      returnUrlId: "ekyb-return",
      url: "https://www.bob.bt/ekyb/return",
      addedBy: "yeshey",
      addedAt: day(-40),
    },
    {
      /* The Single Window's registration page — Flow 9's way back from
         FLOW-PRS-01 once a company has shared its registration, licence
         and TPN. Nobody in the story works at BNSW; the address was
         registered when it joined (SCR-PRS-06). */
      id: "ra-bnsw-register",
      orgId: "org-bnsw",
      returnUrlId: "bnsw-register-return",
      url: "https://www.bnsw.gov.bt/register/return",
      addedBy: "bnsw-admin",
      addedAt: day(-200),
    },
  ],

  parkedOperations: [
    {
      /* Waiting on Dorji. The payload hash is what his wallet signature
         would actually commit to — B7 shows it for that reason. */
      id: "park-present-bob",
      operation: "proof:present",
      summary: "Share Business Registration with Bank of Bhutan",
      requestedBy: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      targetId: "pr-bob-earlier",
      targetRelyingParty: "Bank of Bhutan",
      payloadHash: "sha256:c0a71e94b83f2d6508a1c47fe9b230da75146c8be03f9a27",
      policy: "SINGLE_APPROVER",
      requiredSignatures: 1,
      signatures: [],
      state: "parked",
      decisionReason: null,
      createdAt: day(-1),
      expiresAt: day(2),
    },
    {
      /* Flow 8, Journey T: Rinzin gave an employee authority to act, and
         her *Give authority to act* is SINGLE_APPROVER, so it waits for one
         other person (EW-FLOW8-SD §8.2). One approver, never Rinzin — the
         value threshold and two-signature control this used to show are
         catalogue flow 10, out of scope (§1.2). */
      id: "park-grant-sangay",
      operation: "authority:issue",
      summary: "Give Sangay Wangmo authority to submit customs declarations at Bhutan National Single Window",
      requestedBy: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      targetId: "g-sangay",
      targetRelyingParty: "Bhutan National Single Window",
      payloadHash: "sha256:9c03e7b15fa2d4806e1b3c97a54d0f82e6b19a7c3d05f418",
      policy: "SINGLE_APPROVER",
      requiredSignatures: 1,
      signatures: [],
      state: "parked",
      decisionReason: null,
      createdAt: day(-1),
      expiresAt: day(6),
    },
    {
      /* Approved, then invalidated before it ran. The edge the brief calls
         out in 8.4 and the one a system would be broken to execute. */
      id: "park-stale",
      operation: "proof:present",
      summary: "Share Tax Clearance Certificate with Bank of Bhutan",
      requestedBy: "karma",
      relationId: "rel-karma",
      scopeVersion: 2,
      targetId: "pr-lapsed",
      targetRelyingParty: "Bank of Bhutan",
      payloadHash: "sha256:b61f7c05e298a4d3706b1cfe45a9d823017e5b9c4af26d10",
      policy: "SINGLE_APPROVER",
      requiredSignatures: 1,
      signatures: [{ personId: "dorji", at: day(-8), method: "web" }],
      state: "stale",
      decisionReason: null,
      /* FLOW-PRS-02 E11: approving re-checks the sharer, and Karma's
         appointment had ended — so nothing went, and the request went back
         to OPEN, where it later expired. */
      invalidatedReason: "Karma Wangmo can no longer share this, so it hasn't been sent.",
      createdAt: day(-9),
      expiresAt: day(-2),
    },
    {
      id: "park-approved-bob-loan",
      operation: "proof:present",
      summary: "Share Business Registration with Bank of Bhutan",
      requestedBy: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      targetId: "pr-bob-loan",
      targetRelyingParty: "Bank of Bhutan",
      payloadHash: "sha256:e572b0491ac8d36f7be24051c9da8317064fb2e85d1a7c63",
      policy: "SINGLE_APPROVER",
      requiredSignatures: 1,
      signatures: [{ personId: "dorji", at: day(-14), method: "wallet" }],
      state: "approved",
      decisionReason: null,
      createdAt: day(-14),
      expiresAt: day(-7),
    },
  ],

  /*
   * Flow 8 — Pelden's grants of authority to act, three months in. Each is
   * here for a case SCR-AUT-01 must show before anyone has walked anything:
   *
   * - g-pema: Pema Choden, Druk Sharpa Freight's clearing agent, collected
   *   her authority a month ago — Journey S's end, ACTIVE.
   * - g-sangay: Rinzin, appointed with *Give authority to act*, gave an
   *   employee authority to submit declarations, and Dorji hasn't approved
   *   it yet — Journey T's middle, AWAITING_APPROVAL.
   * - g-kinley: claimable — a link out, not yet collected.
   * - g-tashi: a link nobody collected in seven days (E15, LAPSED).
   * - g-pema-q2: Pema's earlier authority, which reached its end date.
   *
   * Their ID-number hashes are made the way the store makes them, from the
   * simulated citizens' numbers, so a claim against g-kinley matches.
   */
  authorityGrants: [
    {
      id: "g-pema",
      orgId: PELDEN,
      kind: "CAPABILITY",
      name: "Pema Choden",
      delegateName: "Pema Choden",
      delegateIdKeyed: keyedIdHash(PELDEN, "11512002960"),
      delegateDid: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
      delegatePersonId: "pema",
      tasks: ["nsw:submit-declaration", "nsw:amend-declaration"],
      counterparties: ["org-bnsw"],
      licenceNumbers: ["BL-PLG-2025-00871"],
      valueCapNu: 1000000,
      perTransaction: true,
      validFrom: day(-31),
      validUntil: day(59),
      issuerDid: "did:ethr:bt:0x3b7e90c4d12a58f6e0b9a41c7d2e85f3a6c01d94",
      revocationId: "7f2c9e14-5a3b-4d8e-9c61-0b4a2f7d83e5",
      grantedBy: "dorji",
      grantedRelationId: "rel-root",
      approvedBy: null,
      approvedRelationId: null,
      approvalId: null,
      credentialRef: "urn:uuid:4c1e8a72-9d03-4b6f-a5e2-81f7c03d9b46",
      claimRef: null,
      claimExpiresAt: null,
      approvalHash: "sha256:2a9f41c7e0b3d85640c1f7ae92b4d03e65a817cf0d24b9e3",
      status: "ACTIVE",
      submittedAt: day(-31),
      statusAt: day(-30),
      endReason: null,
      mismatches: 0,
      offerExpiresAt: null,
      accepted: true,
    },
    {
      id: "g-sangay",
      orgId: PELDEN,
      kind: "CAPABILITY",
      name: "Sangay Wangmo",
      delegateName: null,
      delegateIdKeyed: keyedIdHash(PELDEN, "11206003325"),
      delegateDid: null,
      delegatePersonId: null,
      tasks: ["nsw:submit-declaration"],
      counterparties: ["org-bnsw"],
      licenceNumbers: ["BL-PLG-2025-00871"],
      valueCapNu: 300000,
      perTransaction: true,
      validFrom: day(-1),
      validUntil: day(89),
      issuerDid: null,
      revocationId: null,
      grantedBy: "rinzin",
      grantedRelationId: "rel-rinzin",
      approvedBy: null,
      approvedRelationId: null,
      approvalId: "park-grant-sangay",
      credentialRef: null,
      claimRef: null,
      claimExpiresAt: null,
      approvalHash: "sha256:9c03e7b15fa2d4806e1b3c97a54d0f82e6b19a7c3d05f418",
      status: "AWAITING_APPROVAL",
      submittedAt: day(-1),
      statusAt: day(-1),
      endReason: null,
      mismatches: 0,
      offerExpiresAt: null,
      accepted: false,
    },
    {
      id: "g-kinley",
      orgId: PELDEN,
      kind: "CAPABILITY",
      name: "Kinley Wangdi",
      delegateName: null,
      delegateIdKeyed: keyedIdHash(PELDEN, "10811004417"),
      delegateDid: null,
      delegatePersonId: null,
      tasks: ["nsw:submit-declaration", "nsw:amend-declaration"],
      counterparties: ["org-bnsw"],
      licenceNumbers: ["BL-PLG-2025-00871"],
      valueCapNu: 500000,
      perTransaction: true,
      validFrom: day(-2),
      validUntil: day(88),
      issuerDid: "did:ethr:bt:0x3b7e90c4d12a58f6e0b9a41c7d2e85f3a6c01d94",
      revocationId: null,
      grantedBy: "dorji",
      grantedRelationId: "rel-root",
      approvedBy: null,
      approvedRelationId: null,
      approvalId: null,
      credentialRef: null,
      claimRef: "c7Qm2xVb9TkPa4Lw",
      claimExpiresAt: day(5),
      approvalHash: "sha256:51d8e0a3c7f294b6e1a05d38c9f27b4e0a6d13f58c2b97e4",
      status: "CLAIMABLE",
      submittedAt: day(-2),
      statusAt: day(-2),
      endReason: null,
      mismatches: 0,
      offerExpiresAt: null,
      accepted: false,
    },
    {
      id: "g-tashi",
      orgId: PELDEN,
      kind: "CAPABILITY",
      name: "Tashi Dorji",
      delegateName: null,
      delegateIdKeyed: null,
      delegateDid: null,
      delegatePersonId: null,
      tasks: ["nsw:submit-declaration"],
      counterparties: ["org-bnsw"],
      licenceNumbers: ["BL-PLG-2025-00871"],
      valueCapNu: 250000,
      perTransaction: true,
      validFrom: day(-20),
      validUntil: day(70),
      issuerDid: "did:ethr:bt:0x3b7e90c4d12a58f6e0b9a41c7d2e85f3a6c01d94",
      revocationId: null,
      grantedBy: "dorji",
      grantedRelationId: "rel-root",
      approvedBy: null,
      approvedRelationId: null,
      approvalId: null,
      credentialRef: null,
      claimRef: "t3Wd8nKq5RzHe1Yc",
      claimExpiresAt: day(-13),
      approvalHash: "sha256:e74a0c19b5d23f86a0c7e41b9d53f2a86c0e17b4d95a3f20",
      status: "LAPSED",
      submittedAt: day(-20),
      statusAt: day(-13),
      endReason: "Tashi Dorji didn't collect their authority by the date the link expired. Nothing was given.",
      mismatches: 0,
      offerExpiresAt: null,
      accepted: false,
    },
    {
      id: "g-pema-q2",
      orgId: PELDEN,
      kind: "CAPABILITY",
      name: "Pema Choden",
      delegateName: "Pema Choden",
      delegateIdKeyed: null,
      delegateDid: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
      delegatePersonId: "pema",
      tasks: ["nsw:submit-declaration"],
      counterparties: ["org-bnsw"],
      licenceNumbers: ["BL-PLG-2025-00871"],
      valueCapNu: 500000,
      perTransaction: true,
      validFrom: day(-122),
      validUntil: day(-32),
      issuerDid: "did:ethr:bt:0x3b7e90c4d12a58f6e0b9a41c7d2e85f3a6c01d94",
      revocationId: "0d6b3f28-c1e4-47a9-8b25-e93f0a7c164d",
      grantedBy: "dorji",
      grantedRelationId: "rel-root",
      approvedBy: null,
      approvedRelationId: null,
      approvalId: null,
      credentialRef: "urn:uuid:a93d17e0-5b2c-48f6-9e41-c08b7f2d65a3",
      claimRef: null,
      claimExpiresAt: null,
      approvalHash: "sha256:0f6c2e91a7d438b5c1e09f4a72d3b86e5c10a9f7e2d4b631",
      status: "EXPIRED",
      submittedAt: day(-122),
      statusAt: day(-32),
      endReason: "Reached its end date.",
      mismatches: 0,
      offerExpiresAt: null,
      accepted: true,
    },
  ],
  authorityDraft: null,

  /*
   * Flow 9 — BNSW's own records, three months in (EW-FLOW9-SD §4). Pelden
   * registered with the Single Window after its first grant, so the record
   * carries its publishing DID and Pema's authority is recognised (B1). One
   * earlier session of Pema's, ended at BNSW's sign-in timeout, with the two
   * declarations she made in it — what BNSW keeps with each (§4.3).
   */
  counterpartyRegistrations: [
    {
      id: "reg-pelden-bnsw",
      counterpartyId: "org-bnsw",
      orgId: PELDEN,
      holderDid: "did:key:z6MkhPq3vT8wYb2LcR5nJd9sXe4mKa7GuF1oZi6NyWrQ2tBc",
      publishingDid: "did:ethr:bt:0x3b7e90c4d12a58f6e0b9a41c7d2e85f3a6c01d94",
      legalName: "Pelden Trading Pvt. Ltd.",
      registrationNumber: "CRA-2019-04477",
      tpn: "TPN-114-8830",
      tpnRevocationId: "b81f04c2-6d3e-4a97-8e15-c2d07a9f3b64",
      licences: [{ number: "BL-PLG-2025-00871", revocationId: "e4a92c17-0b5d-4f38-a6c1-9d27f30e85b2", credentialId: "hc-licence-plg" }],
      registeredAt: day(-29),
      requestId: null,
    },
  ],
  authoritySessions: [
    {
      id: "as-pema-earlier",
      counterpartyId: "org-bnsw",
      signedInCid: "11512002960",
      delegateDid: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
      delegateName: "Pema Choden",
      delegateCid: "11512002960",
      authorityName: "Pema Choden",
      orgId: PELDEN,
      registrationId: "reg-pelden-bnsw",
      principalDid: "did:ethr:bt:0x3b7e90c4d12a58f6e0b9a41c7d2e85f3a6c01d94",
      relationId: "g-pema",
      tasks: ["nsw:submit-declaration", "nsw:amend-declaration"],
      licenceNumbers: ["BL-PLG-2025-00871"],
      valueCapNu: 1000000,
      perTransaction: true,
      authorityRevocationId: "7f2c9e14-5a3b-4d8e-9c61-0b4a2f7d83e5",
      citizenRevocationId: "11512002-c17e-4a0d-9b52-115120029600",
      validUntil: day(59),
      endsAt: Date.parse(`${day(-2)}T11:30:00Z`),
      checkedAt: Date.parse(`${day(-2)}T03:30:00Z`),
      status: "ENDED",
      endedAt: Date.parse(`${day(-2)}T11:30:00Z`),
      endReason: "timeout",
    },
  ],
  counterpartyDeclarations: [
    {
      id: "dcl-84120",
      reference: "BNSW-DEC-2026-84120",
      counterpartyId: "org-bnsw",
      orgId: PELDEN,
      sessionId: "as-pema-earlier",
      kind: "submit",
      amends: null,
      amendedBy: null,
      goods: "Steel roofing sheets, 12 pallets",
      valueNu: 420000,
      licenceNumber: "BL-PLG-2025-00871",
      relationId: "g-pema",
      authorityRevocationId: "7f2c9e14-5a3b-4d8e-9c61-0b4a2f7d83e5",
      delegateName: "Pema Choden",
      delegateCid: "11512002960",
      statusResult: "authority ACTIVE · citizen ID ACTIVE · licence ACTIVE · Pelden Trading Pvt. Ltd. CURRENT",
      at: day(-2),
    },
    {
      id: "dcl-84137",
      reference: "BNSW-DEC-2026-84137",
      counterpartyId: "org-bnsw",
      orgId: PELDEN,
      sessionId: "as-pema-earlier",
      kind: "submit",
      amends: null,
      amendedBy: null,
      goods: "Cement, 40 tonnes",
      valueNu: 380000,
      licenceNumber: "BL-PLG-2025-00871",
      relationId: "g-pema",
      authorityRevocationId: "7f2c9e14-5a3b-4d8e-9c61-0b4a2f7d83e5",
      delegateName: "Pema Choden",
      delegateCid: "11512002960",
      statusResult: "authority ACTIVE · citizen ID ACTIVE · licence ACTIVE · Pelden Trading Pvt. Ltd. CURRENT",
      at: day(-2),
    },
  ],
  bnsw: { signedInCid: null, servicesDown: false, suspendedCitizens: [], request: null, notice: null, draft: null },

  auditEntries: [
    {
      id: "au-8",
      seq: 8,
      operation: "authority:revoke",
      summary: "Revoked Customs broker role held by Pema Choden",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-root",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(0, "09:14"),
      prevHash: "sha256:0d47b1e9",
      rowHash: "sha256:6ca39f02",
    },
    {
      id: "au-7",
      seq: 7,
      operation: "authority:accept",
      summary: "Pema Choden accepted Declaration authority",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "pema",
      relationId: "rel-root",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-1, "15:41"),
      prevHash: "sha256:93e28ac5",
      rowHash: "sha256:0d47b1e9",
    },
    {
      id: "au-6",
      seq: 6,
      operation: "authority:issue",
      summary: "Gave Pema Choden authority to submit and amend customs declarations at Bhutan National Single Window — up to Nu 1,000,000 per declaration",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-root",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-2, "11:02"),
      prevHash: "sha256:41fb7d60",
      rowHash: "sha256:93e28ac5",
    },
    {
      /* The row that carries the whole dual-attribution point: the entity
         presented, Rinzin acted, Dorji approved, and only a digest of what
         was disclosed is kept. */
      id: "au-5",
      seq: 5,
      operation: "proof:present",
      summary: "Shared Business Registration with Bhutan National Single Window",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      approvedById: "dorji",
      relyingPartyDid: "did:polygon:0xc70c2d3625bec5a34d5b3746b830d36f2525f163",
      disclosedDigest: "sha256:a7f3c9e1",
      at: at(-14, "14:23"),
      prevHash: "sha256:c85a0b34",
      rowHash: "sha256:41fb7d60",
    },
    {
      id: "au-4",
      seq: 4,
      operation: "relation:terminate",
      summary: "Terminated the controllership of Karma Wangmo",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-karma",
      scopeVersion: 2,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-40, "17:05"),
      prevHash: "sha256:2b6e91df",
      rowHash: "sha256:c85a0b34",
    },
    {
      id: "au-3",
      seq: 3,
      operation: "relation:accept",
      summary: "Rinzin Dema accepted the duties of a controller",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-102, "10:12"),
      prevHash: "sha256:74d0af28",
      rowHash: "sha256:2b6e91df",
    },
    {
      id: "au-2",
      seq: 2,
      operation: "relation:create",
      summary: "Created a controllership relation for Rinzin Dema",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-rinzin",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-104, "09:47"),
      prevHash: "sha256:1a05c7be",
      rowHash: "sha256:74d0af28",
    },
    {
      id: "au-1",
      seq: 1,
      operation: "credential:accept",
      summary: "Accepted the entity's Business Registration from the Corporate Regulatory Authority",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-root",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-112, "13:30"),
      prevHash: "sha256:00000000",
      rowHash: "sha256:1a05c7be",
    },
  ],

  appeals: [
    {
      /* Act 6. Notice issued, nothing submitted yet — the state the demo
         opens on, so the audience sees the recourse exists. */
      id: "ap-pema",
      reference: "AP-2026-0417",
      subjectId: "pema",
      againstKind: "authority",
      againstId: "g-pema-q2",
      againstTitle: "Authority to submit customs declarations at Bhutan National Single Window",
      noticeReason:
        "Withdrawn pending an internal review of declaration values submitted in August.",
      noticeIssuedAt: day(0),
      submittedAt: null,
      submission: null,
      state: "notice_issued",
      windowWorkingDays: 10,
      decisionWorkingDays: 5,
      evidence: [],
    },
    {
      /* An appeal that worked, so the upheld outcome is not hypothetical. */
      id: "ap-karma",
      reference: "AP-2026-0288",
      subjectId: "karma",
      againstKind: "relation",
      againstId: "rel-karma",
      againstTitle: "Karma Wangmo's appointment",
      noticeReason: "Withdrawn on departure from the company.",
      noticeIssuedAt: day(-40),
      submittedAt: day(-36),
      submission:
        "My last working day was 8 August, not 31 July. I had four declarations outstanding on the date my appointment was ended.",
      state: "rejected",
      windowWorkingDays: 10,
      decisionWorkingDays: 5,
      evidence: ["handover-note-2026-08-08.pdf"],
    },
  ],

  /* Nobody is part-way through signing up when the demo starts. */
  signup: null,

  orgOnboarding: null,

  accreditations: [],

  /* The Corporate Regulatory Authority has confirmed companies on the
     platform since before the Entity Wallet opened: it came on through a
     Kind O invitation (FLOW-ONB-02, the inv-cra record), and its
     designation and adoption are the deployment's, not anything a
     presenter walks. The prototype walks the other kind — a ministry
     already on the platform, designated in place (Kind E) — so MoICE has
     no designation at all here, and sole proprietorships and partnerships
     have nobody to confirm them until Flow 5 gives them one. */
  designations: [
    {
      id: "dsg-cra",
      orgId: "org-cra",
      orgName: "Corporate Regulatory Authority",
      kind: "N",
      entityTypes: ["company"],
      legalBasis: "Companies Act of Bhutan — the Registrar of Companies",
      legalRef: "NDI/DSG/2026/001",
      state: "ACTIVE",
      proposedBy: null,
      proposedAt: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: day(-125),
      declinedBy: null,
      declinedReason: null,
      withdrawnBy: null,
      withdrawnAt: null,
      withdrawnReason: null,
      withdrawnFrom: null,
      expiredReason: null,
      expiresAt: null,
      infoRequests: [],
      activatedAt: day(-124),
      publishingDid: "did:ethr:bt:0x5a2f7c19e0b4d8a63c11f0e97b2d4a6c8e3f1b07",
      didMethodAtActivation: "did:ethr",
      suspendedReason: null,
      checks: null,
      checkedAt: null,
      ndiGrant: { by: "registrar", at: day(-125) },
      ndiAccess: "ACTIVE",
      ndiAccessChangedBy: null,
      ndiAccessChangedAt: null,
    },
  ],
  adoptions: [
    {
      id: "ado-cra-company-1",
      designationId: "dsg-cra",
      orgId: "org-cra",
      entityType: "company",
      version: 1,
      state: "ACTIVE",
      adoptedBy: "registrar",
      adoptedAt: day(-120),
      asked: draftFor("company").asked,
      purpose: draftFor("company").purpose,
      stoppedBy: null,
      stoppedAt: null,
    },
  ],
  artefactObjections: [],
  draftRevisions: [],
  /* The authority's own grant, written when it adopted for companies. */
  authorisations: [
    {
      id: "auth-cra-company-1",
      designationId: "dsg-cra",
      orgId: "org-cra",
      entityType: "company",
      principal: NDI_SERVICE_PRINCIPAL,
      permittedPurpose: "Confirming a company's representative, for entity onboarding",
      grantedBy: "registrar",
      grantedAt: day(-120),
      state: "ACTIVE",
      withdrawnBy: null,
      withdrawnAt: null,
    },
  ],

  offerings: SEED_OFFERINGS,
  credentialRequests: [],
  /* One attempt the wallet refused on its own: an offer from a sender not
     on NDI's list. Never notified (UXD-36) — the Activity tab is the only
     place it shows, which is the point of keeping it. */
  refusedOffers: [
    {
      id: "rof-1",
      orgId: "org-pelden",
      claimedIssuer: "Bhutan Revenue Authority",
      credential: "Tax Exemption Certificate",
      reason: "not from an organisation on NDI's list of trusted organisations",
      listed: false,
      at: day(-6),
    },
  ],
  integration: SEED_INTEGRATION,

  orgInterests: [],
  responsibilities: [],

  orgInvitations: [
    {
      /* History: the invitation that set up Bank of Bhutan's Entity Wallet. */
      id: "inv-bob-wallet",
      kind: "W",
      email: "yeshey.choden@bob.bt",
      orgId: "org-bob",
      role: null,
      legalName: "Bank of Bhutan Ltd.",
      legalIdentity: "Public limited company, CRA-1997-00112",
      purpose: "Entity Wallet for an organisation already issuing and verifying on NDI.",
      needsSecondApproval: false,
      invitedBy: "tshering",
      approvedBy: null,
      createdAt: day(-73),
      sentAt: day(-73),
      expiresAt: day(-43),
      state: "ACCEPTED",
      delivery: "delivered",
      decidedAt: day(-70),
      acceptedName: "Yeshey Choden",
    },
    {
      /* History, not a demo step: how Ugyen came to be a member at all.
         Membership came first and authority separately, later — which is
         exactly the order act 2 then shows (Flow 1 design §7.4). */
      id: "inv-ugyen",
      kind: "M",
      email: "ugyen.phuntsho@peldentrading.bt",
      orgId: "org-pelden",
      role: "Member",
      legalName: null,
      legalIdentity: null,
      purpose: null,
      needsSecondApproval: false,
      invitedBy: "dorji",
      approvedBy: null,
      createdAt: day(-44),
      sentAt: day(-44),
      expiresAt: day(-30),
      state: "ACCEPTED",
      delivery: "delivered",
      decidedAt: day(-43),
      acceptedName: "Ugyen Phuntsho",
    },
    {
      /* Seeded so the pending list opens with the one failure it exists to
         surface (E8): delivery is asynchronous, and this list is the only
         place a bounced invitation is ever visible to the person who sent
         it. */
      id: "inv-tashi",
      kind: "M",
      email: "tashi.dema@pelden-trading.bt",
      orgId: "org-pelden",
      role: "Member",
      legalName: null,
      legalIdentity: null,
      purpose: null,
      needsSecondApproval: false,
      invitedBy: "dorji",
      approvedBy: null,
      createdAt: day(-2),
      sentAt: day(-2),
      expiresAt: day(12),
      state: "PENDING",
      delivery: "failed",
      decidedAt: null,
      acceptedName: null,
    },
    {
      /* The Corporate Regulatory Authority's own designation, months ago —
         the root of trust every company on the platform chains back to. It
         took two administrators, and the record says which two. */
      id: "inv-cra",
      kind: "O",
      email: "registrar@cra.gov.bt",
      orgId: null,
      role: null,
      legalName: "Corporate Regulatory Authority",
      legalIdentity: "Statutory authority · Registrar of Companies",
      purpose: "Foundational issuer for companies — issues the Business Registration every company chains back to.",
      needsSecondApproval: true,
      invitedBy: "tshering",
      /* A second named administrator — never the root account (S2). */
      approvedBy: "tshendu",
      createdAt: day(-128),
      sentAt: day(-127),
      expiresAt: day(-97),
      state: "ACCEPTED",
      delivery: "delivered",
      decidedAt: day(-125),
      acceptedName: "Office of the Registrar",
    },
  ],

  firstRun: false,

  harness: {
    persona: "dorji",
    act: 0,
    runnerOpen: false,
    stateOverrides: {},
    selfServiceSignup: SELF_SERVICE_SIGNUP_ENABLED,
    guideStep: null,
  },
};

/**
 * Pelden Trading on the day it is registered — what completing Flow 2 leaves
 * behind, in place of the months of history the story's seed carries.
 *
 * WHY ONBOARDING DOES NOT LAND ON THE SEED
 *
 * The seed is Pelden three months in: Rinzin appointed, credentials held,
 * approvals parked, an authority issued to Pema and revoked. Arriving at that
 * dashboard straight from registering the company told the room the opposite
 * of what act 1 says — that an organisation which existed thirty seconds ago
 * already had a past. A first-run console is empty except for the two things
 * onboarding actually produced: the registration it accepted, and Dorji's
 * root authority to act for it.
 *
 * WHAT IS KEPT, AND WHY
 *
 * - The foundational credential and the root relation, dated today.
 * - The organisation's own DID, because provisioning its wallet made it.
 * - Two audit rows for the registration and the acceptance. The dashboard
 *   shows no activity — nothing has been done in the console — but an audit
 *   trail that did not record the organisation coming into existence would
 *   be a trail with a hole at the top.
 * - Everything on the NDI side (invitations NDI issued, review cases).
 *
 * WHAT IS NOT KEPT: PELDEN'S PEOPLE
 *
 * The seed's Pelden has eight people attached — its staff, a clearing agent,
 * someone who has left. The first version emptied their roles but kept them
 * attached to the organisation and kept their accounts, so on a company that
 * existed a minute ago the controllership picker already listed six
 * colleagues "Identity confirmed", and the persona switcher offered to drive
 * as any of them. Nobody could say how they got there, because they hadn't.
 * On the first day Pelden has one member, Dorji, and the rest of the story's
 * people have no account at all — they arrive the way anyone does, by an
 * invitation Dorji sends and they accept (FLOW-ONB-02 Kind M).
 *
 * Acts 2–6 need the lived-in state, so the story runner restores it when it
 * jumps past act 1 (see `restoreStoryState` in the store).
 */
export function firstRunState(s: DemoState): DemoState {
  const today = day(0);
  const foundational = SEED.heldCredentials.filter(inOrg(PELDEN)).find((c) => c.isFoundational);
  const root = SEED.relations.filter(inOrg(PELDEN)).find((r) => r.isRootAuthority);
  const entity = SEED.organizations.find((o) => o.id === PELDEN)!;
  return {
    ...s,
    activeOrgId: entity.id,
    /* Other organisations are untouched — Bank of Bhutan's day is not
       Pelden's first one. The issuer/verifier collections (schemas,
       credentials issued…) stay for the same reason: they are the issuers',
       and Pelden, a holder only, never sees them. */
    organizations: [
      /* No listing as an issuer of authority: that comes with its first
         grant (Flow 8, D5), which the first day hasn't made. */
      { ...entity, memberIds: ["dorji"], members: 1, createdAt: today, authorityListing: undefined },
      ...s.organizations.filter((o) => o.id !== PELDEN),
    ],
    activity: [],
    /* Nobody but Dorji is a member yet, and nobody else from Pelden's side of
       the story has an account: they come on by invitation. The platform's
       own people keep whatever the story has given them — an admin root
       invited stays one — and so does anyone who belongs to another
       organisation (Bank of Bhutan's owner). */
    people: s.people.map((p) =>
      p.id === "dorji"
        ? {
            ...p,
            memberRole: "Owner",
            hasAccount: true,
            /* The account that did the onboarding is Dorji's: its address and
               the name it was given, not the seed's, so the console greets
               whoever the room watched sign up. */
            ...(s.signup?.stage === "done"
              ? { email: s.signup.email || p.email, name: s.signup.name || p.name }
              : {}),
          }
        : isPlatformAdmin(p) ||
            !(entity.memberIds.includes(p.id) || p.joinedBy) ||
            s.organizations.some((o) => o.id !== PELDEN && o.memberIds.includes(p.id))
          ? p
          : { ...p, memberRole: undefined, hasAccount: false },
    ),
    relations: [
      ...s.relations.filter((r) => !inOrg(PELDEN)(r)),
      ...(root
      ? [
          {
            ...root,
            scope: { ...root.scope, validFrom: today },
            createdAt: today,
            acceptedAt: today,
            activatedAt: today,
          },
        ]
      : []),
    ],
    heldCredentials: [
      ...s.heldCredentials.filter((c) => !inOrg(PELDEN)(c)),
      ...(foundational ? [{ ...foundational, receivedAt: today }] : []),
    ],
    offers: s.offers.filter((o) => !inOrg(PELDEN)(o)),
    presentationRequests: s.presentationRequests.filter((v) => !inOrg(PELDEN)(v)),
    presentationSessions: [],
    parkedOperations: [],
    authorityGrants: [],
    authorityDraft: null,
    counterpartyRegistrations: [],
    authoritySessions: [],
    counterpartyDeclarations: [],
    bnsw: { signedInCid: null, servicesDown: false, suspendedCitizens: [], request: null, notice: null, draft: null },
    auditEntries: [
      {
        id: "au-onb-2",
        seq: 2,
        operation: "credential:accept",
        summary: "Accepted Business Registration under the bootstrap authority",
        entity: entity.name,
        actorId: "dorji",
        relationId: root?.id ?? null,
        scopeVersion: 1,
        approvedById: null,
        relyingPartyDid: null,
        disclosedDigest: null,
        at: new Date().toISOString(),
        prevHash: "sha256:9b2e07c4",
        rowHash: "sha256:3f81d6a0",
      },
      {
        id: "au-onb-1",
        seq: 1,
        operation: "entity:register",
        summary: "Registered, confirmed by the register — Dorji Wangchuk as director",
        entity: entity.name,
        actorId: "dorji",
        relationId: null,
        scopeVersion: null,
        approvedById: null,
        relyingPartyDid: null,
        disclosedDigest: null,
        at: new Date().toISOString(),
        prevHash: "sha256:00000000",
        rowHash: "sha256:9b2e07c4",
      },
    ],
    appeals: [],
    /* Only what NDI issued: an organisation that exists today has sent no
       member invitations. */
    orgInvitations: s.orgInvitations.filter((i) => i.kind !== "M"),
    firstRun: true,
  };
}

/**
 * The Entity Wallet's day zero — the state the guided demo starts from.
 *
 * WHY THE STORY STARTS BEFORE ANY BUSINESS
 *
 * Nobody can bring an organisation onto the Entity Wallet until NDI has
 * people to review it, and NDI has none until its root administrator has
 * invited them. So the platform is shown being set up first: root signs in
 * (seeded by the deployment, never onboarded), invites a platform admin, and
 * only then does any organisation get on — Bank of Bhutan by invitation,
 * Pelden by signing up.
 *
 * WHAT ALREADY EXISTS ON DAY ZERO
 *
 * The NDI platform itself is not new. Bank of Bhutan and Tashi InfoComm
 * have issued and verified on it for years, so they are here — without an
 * Entity Wallet. Everyone else is known to the story but has no account:
 * `hasAccount: false` keeps them out of the persona switcher until they
 * sign up or accept an invitation. Pelden does not exist yet.
 */
export function dayZeroState(seed: DemoState): DemoState {
  const existing = seed.organizations
    .filter((o) => o.id !== PELDEN)
    .map((o) => ({ ...o, capabilities: o.capabilities.filter((c) => c !== "holder") }))
    /* NDI's organisation has only root until root invites someone. */
    .map((o) => (o.id === NDI_ORG ? { ...o, memberIds: ["root"], members: 1 } : o));
  return {
    ...seed,
    activeOrgId: "org-bob",
    organizations: existing,
    activity: [],
    /* Yeshey has had an account since the bank came onto NDI; root since the
       platform was deployed. Nobody else has one yet. */
    people: seed.people.map((p) =>
      /* Kesang and Deki too: their offices have been on NDI as long as the bank. */
      p.id === "yeshey" || p.id === "kesang" || p.id === "deki" || p.id === "registrar" || p.platformRole === "root"
        ? p
        : { ...p, hasAccount: false, memberRole: undefined, platformRole: undefined },
    ),
    relations: [],
    heldCredentials: [],
    offers: [],
    presentationRequests: [],
    presentationSessions: [],
    parkedOperations: [],
    authorityGrants: [],
    authorityDraft: null,
    counterpartyRegistrations: [],
    authoritySessions: [],
    counterpartyDeclarations: [],
    bnsw: { signedInCid: null, servicesDown: false, suspendedCitizens: [], request: null, notice: null, draft: null },
    auditEntries: [],
    appeals: [],
    signup: null,
    orgInvitations: [],
    orgOnboarding: null,
    orgInterests: [],
    responsibilities: [],
    /* Nothing waiting. It used to hold one request so the new admin's queue
       was not only the one the story was about to send — but a request
       sitting in a queue on a platform nobody administers yet read as
       history the day-zero platform cannot have, and the guide no longer
       walks the requests queue at all. */
    accreditations: [],
    firstRun: true,
    harness: { ...seed.harness, persona: "yeshey" },
  };
}

/**
 * Day zero, one chapter on: root has invited Kinzang Dorji and Tshendu, and
 * both have set up as platform admins. The state the guided demo reaches
 * when the platform-admin chapter ends — so a company's onboarding walked on
 * its own starts on the same platform the guide reaches — authorities
 * connected, administrators in place — and no business on it yet.
 *
 * TWO, BECAUSE THE ROOT ACCOUNT APPROVES NOTHING
 *
 * With root counting as a second approver, one admin used to be enough.
 * FLOW-ONB-02 v0.6 took that away (S2, E13): every second approval is a
 * named admin, and anything that needs one is refused while fewer than two
 * are active (P7, E12). So bootstrap is root bringing on two, each with the
 * reason and the custodians recorded (S9) — the invitations below say so.
 *
 * WHY NOT THE LIVED-IN STORY
 *
 * The company walks used to start from the seed's three-months-in state,
 * because that was the only one with an administrator in it. It also came
 * with every character already holding an account, so the persona switcher
 * offered Pelden's staff before Pelden had been registered — the "people
 * already there" a first-time walk must not show.
 */
export function platformReadyState(seed: DemoState): DemoState {
  const zero = dayZeroState(seed);
  const admins = ["tshering", "tshendu"] as const;
  const invitedAt = day(-1);
  return {
    ...zero,
    organizations: zero.organizations.map((o) =>
      o.id === NDI_ORG ? { ...o, memberIds: ["root", ...admins], members: 3 } : o,
    ),
    people: zero.people.map((p) =>
      (admins as readonly string[]).includes(p.id) ? { ...p, platformRole: "admin" as const, hasAccount: true } : p,
    ),
    orgInvitations: admins.map((admin) => {
      const person = seed.people.find((p) => p.id === admin);
      return {
        id: `inv-${admin}`,
        kind: "A" as const,
        email: person?.email ?? `${admin}@bhutanndi.bt`,
        orgId: null,
        role: null,
        legalName: null,
        legalIdentity: null,
        purpose: "Platform administrator",
        needsSecondApproval: false,
        rootReason: "Bootstrap: the platform's first administrators",
        rootCustodians: "Both custodians",
        invitedBy: "root" as const,
        approvedBy: null,
        createdAt: invitedAt,
        sentAt: invitedAt,
        expiresAt: day(13),
        state: "ACCEPTED" as const,
        delivery: "delivered" as const,
        decidedAt: invitedAt,
        acceptedName: person?.name ?? admin,
      };
    }),
    activeOrgId: NDI_ORG,
    harness: { ...zero.harness, persona: "root" },
  };
}

