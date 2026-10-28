"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { verifyAuthority, type VerificationRequestInput } from "./avs";
import { INVITATION_DAYS } from "./deployment";
import { SYSTEM_ANSWER_MS } from "./demoTiming";
import { scopeFor, shareTargets } from "@/features/appointment/presets";
import * as sharing from "./sharing";
import { NOTICE, namesOf, typesOf } from "./sharing";
import {
  NDI_ORG,
  PELDEN,
  PERSONAS,
  SEED,
  dayZeroState,
  firstRunState,
  platformReadyState,
  inOrg,
  isNamedAdmin,
  isPlatformAdmin,
  roleIn,
  type Attribute,
  type AuthorityKind,
  type BulkUpload,
  type Certificate,
  type Connection,
  type ControllershipRelation,
  type CredDef,
  type Credential,
  type DelegatedAuthority,
  type DemoState,
  type Did,
  type Ecosystem,
  type EcosystemInvitation,
  type Invitation,
  type LedgerKind,
  type LegalBasis,
  type Member,
  type Organization,
  type OrgInvitation,
  type Person,
  type PersonId,
  type Schema,
  type Scope,
  type ScopeFilter,
  type OrgKind,
  type AppointmentDocument,
  type PresetId,
  type ShareReach,
  type ParkedOperation,
  type PresentationRequest,
  type PresentationSession,
  appointmentHeld,
  REGISTER_RECORDS,
  OBSERVED_OPERATORS,
  accEnding,
  accInProgress,
  designationInProgress,
  dsgExpired,
  openObjectionFor,
  draftAsked,
  draftFor,
  requestInFlight,
  crdEnding,
  inOfficerQueue,
  systemConnected,
  SAMPLE_REFERRAL_NOTE,
  supersedes,
  type CredentialOffering,
  type CredentialRequest,
  type IssuerIntegration,
  type SystemRoute,
  shortOrgName,
  type CredentialAttribute,
  type HeldCredential,
  NDI_SERVICE_PRINCIPAL,
  type Authorisation,
  ISSUER_ENTITLEMENTS,
  type ActivationCheck,
  type Designation,
  normaliseLegalName,
  type AccProposalInput,
  type AccRequestInput,
  type Accreditation,
  type Verification,
  type VerificationDecision,
} from "./demoData";

const STORAGE_KEY = "ndi-studio-demo";

/**
 * What a browser that has never run the demo sees, and what Reset returns
 * to: the platform's day zero — root's account and NDI's organisation, the
 * organisations already on NDI, and nothing else.
 *
 * It used to be the seed itself, which is the story three months in:
 * Pelden with its staff, controllers appointed, approvals waiting. Anyone
 * opening the prototype without pressing Guided demo — the link sent round
 * after a meeting, say — met a sign-in panel listing a dozen accounts and a
 * dashboard with seven tasks open, and the onboarding the prototype exists
 * to show had apparently already happened. The lived-in story is still the
 * seed, and still one click away for the acts beyond onboarding
 * (`restoreStoryState`); it is just no longer the front door.
 */
const FRESH: DemoState = dayZeroState(SEED);

/**
 * Bump this whenever a change to the SEED would leave a saved demo showing
 * something now known to be wrong.
 *
 * Saved state is otherwise merged over the seed, which is right for additive
 * changes — a new collection just appears — but wrong for corrections: a
 * browser that ran the demo last week would keep the old values until someone
 * pressed Reset, and the presenter is the one person who would not notice.
 * A save from a different seed version is discarded and the demo starts
 * fresh, which costs a presenter nothing they meant to keep.
 *
 *   1 — the original seed
 *   2 — DIDs corrected from did:indy to did:polygon
 *   3 — the running example: Pelden Trading, with Dorji as the director.
 *       Dorji and Rinzin swapped roles, so a version-2 save that says
 *       "driving as rinzin" meant the owner and would now mean the controller
 *       — the exact silent wrongness this guard exists to prevent.
 *   4 — Flow 1: people carry their membership role, and NDI's two platform
 *       administrators exist. The merge over the seed is shallow, so a
 *       version-3 save would bring back a people list with neither — an
 *       empty Members page and no one to approve a designation.
 *   5 — Flow 2 as list-then-select. The switcher key "A3" moved from the
 *       registration screen to the new choose-your-organisation screen, so a
 *       version-4 save holding an A3 override of "verified" would force the
 *       new screen into a state it does not have.
 *   6 — one organisation. A version-5 save would bring back the inherited
 *       Bhutan NDI and Royal University rows the seed no longer has.
 *   7 — the activity feed is Pelden's own history, not the inherited
 *       Studio issuer feed a version-6 save would keep showing.
 *   8 — organisations carry capabilities and members, and the platform's
 *       own people (root, platform admins, Bank of Bhutan's owner) exist. A
 *       version-7 organisation has no capabilities, and every nav rule
 *       reading them would treat Pelden as having no wallet.
 *   9 — Bhutan NDI's own organisation, and root's account made by the
 *       deployment. A version-8 save has neither, so root would sign in to
 *       no organisation at all.
 *  10 — NDI's staff renamed (Anand Acharya is root, Kinzang Dorji an admin)
 *       and moved to @bhutanndi.bt, so a version-9 save would show the old
 *       names beside the new guide copy.
 *  11 — Pelden's first day has one member, members who accept get records
 *       of their own, and activity entries carry their organisation. A
 *       version-10 save taken on the first day still lists the seed's
 *       colleagues in the controllership picker — the leak this fixes.
 *  12 — NDI is Anand (root) and Kinzang (platform admin) only: Kinley Wangdi
 *       and the inherited Studio staff list are gone, so a version-11 save
 *       would still offer to drive as someone the story no longer has.
 *  13 — Root is named "Root", not Anand Acharya, and approves nothing;
 *       Tshendu joins Kinzang as the second platform admin (FLOW-ONB-02
 *       v0.6). A version-12 save keeps the old name and one admin.
 *  14 — Flow 2 follows FLOW-ORG-01: one identifier, the authority decides,
 *       no manual review and no wallet requests to NDI. A version-13 save
 *       carries an onboarding with no stage and review cases nothing reads.
 *  15 — Flow 4: access requests replaced by accreditations, with two doors
 *       and dual control. A version-14 save holds an `accessRequests` list
 *       nothing reads and no `accreditations` list everything expects.
 *  16 — Flow 5: designations and adoptions decide which entity types are
 *       connected, and two new organisations (the CRA and MoICE) with
 *       Kesang as the ministry's officer. A version-15 save has none of it,
 *       so nothing would be connected at all.
 *  17 — Flow 6: offerings, requests and the issuer's integration, the
 *       Department of Revenue & Customs and Deki as its officer.
 *  18 — Rinzin's credential:accept takes any type, as EW-FLOW3-SD §4.2
 *       gives it. A version-17 save still carries the narrow grant, which
 *       the stricter permission check would now refuse the TPN under.
 *  19 — The Fleet Insurance offer is an ordinary offer, not refused by its
 *       type. A version-18 save still carries it as out of scope.
 *  20 — Flow 4 simplified for the first release (EW-FLOW4-SD v0.2): no
 *       SUPERSEDED, STOPPED or acceptance EXPIRED states, issue types without
 *       a basis each, and records that carry a legal basis, a replacement
 *       link, a request id and a withdrawal reason. A version-19 save would
 *       hold rows in states no screen has words for any more.
 *  21 — Flow 5 follows FLOW-ORG-02 and FLOW-ORG-03 v0.3: no REFUSED state
 *       (DECLINED and WITHDRAWN instead), designations carry NDI's grant,
 *       publishingDid and the withdrawal and lapse fields, and authorisation
 *       rows and draft revisions exist. A version-20 save holds designations
 *       with no grant — which P2 would now refuse — and objections that no
 *       longer hold anything.
 *  22 — Flow 3 follows FLOW-DEL-01 v0.8: an appointment that ends before
 *       acceptance is EXPIRED with a reason (declined, withdrawn, basis
 *       lost). A version-21 save records a decline as TERMINATED, which the
 *       screens no longer read as declined.
 *  23 — Flow 6 follows FLOW-CRD-01..03 and UX-EW-03 v0.4: an offer sent
 *       unasked is an inbox item reviewed on SCR-CRD-04, with no approval
 *       decision and no parked state, and the seeded credential:accept
 *       approvals are gone; a request no longer carries `replaces`, because
 *       superseding is read from the held credentials when one is stored. A
 *       version-22 save holds an offer parked for an approver nobody can
 *       give, and an approval that would accept it.
 *  24 — The high-value grant waiting for dual control no longer carries
 *       Dorji's own signature on his own request. A version-23 save would
 *       let one more approver complete it alone.
 *  25 — The ministry and the CRA are marked as constituted by statute, so
 *       neither is offered business verification (EW-FLOW2-SD §2.2). A
 *       version-24 save has no flag and would still offer it.
 *  26 — Flow 6's Kind A path (FLOW-CRD-03 steps 5–7): the bonded-warehouse
 *       authorisation is answered by the office's system, requests record
 *       whether the system or an officer answered, and the integration
 *       carries what the simulated system does next. A version-25 save has
 *       that offering on the queue and an integration with no setting, so
 *       connecting the system would change nothing.
 *  27 — Flow 7 (EW-FLOW7-SD, FLOW-PRS-01/02): verification requests with
 *       a chosen disclosure are replaced by presentation requests that
 *       share whole credentials, presentation sessions and return
 *       addresses. A version-26 save holds `verificationRequests` nothing
 *       reads and parked shares pointing at requests that no longer exist.
 *  28 — Flow 7 follows FLOW-PRS-01 v0.2, FLOW-PRS-02 v0.3 and UX-EW-04 v0.3:
 *       a session records when it was redeemed (EW-FLOW7-SD v0.3 §4.2), and
 *       a request records who opened it from a website and when the people
 *       who may answer were told it was left undecided (A3). A version-27
 *       save holds sessions with no redemption time.
 */
const SEED_VERSION = 28;

/**
 * Appends one audit row, carrying the hash chain forward.
 *
 * Newest first, matching how the trail is read. The hashes are fixtures — this
 * is an array in localStorage, not a hash-chained store — but the *shape* has
 * to be right, because the integrity indicator is part of what the audit
 * screen has to show and a row with nowhere to put a hash cannot show it.
 *
 * Dual attribution is not optional here: every row takes an entity and an
 * acting person, so there is no way to write a row that records only one.
 */
function appendAudit(
  state: DemoState,
  entry: {
    operation: string;
    summary: string;
    actorId: string;
    relationId?: string | null;
    scopeVersion?: number | null;
    approvedById?: string | null;
    relyingPartyDid?: string | null;
    disclosedDigest?: string | null;
  },
): DemoState["auditEntries"] {
  const previous = state.auditEntries[0];
  const rowHash = `sha256:${Math.random().toString(16).slice(2, 10)}`;
  const entity =
    state.organizations.find((o) => o.id === state.activeOrgId)?.name ?? "The entity";

  return [
    {
      id: rid("au"),
      seq: (previous?.seq ?? 0) + 1,
      operation: entry.operation,
      summary: entry.summary,
      entity,
      actorId: entry.actorId,
      relationId: entry.relationId ?? null,
      scopeVersion: entry.scopeVersion ?? null,
      approvedById: entry.approvedById ?? null,
      relyingPartyDid: entry.relyingPartyDid ?? null,
      disclosedDigest: entry.disclosedDigest ?? null,
      at: new Date().toISOString(),
      prevHash: previous?.rowHash ?? "sha256:00000000",
      rowHash,
    },
    ...state.auditEntries,
  ];
}

/**
 * Storing a credential that was accepted, by either route — what arrived
 * goes into the organisation's held credentials, and anything it supersedes
 * is marked (EW-FLOW6-SD §4.5).
 *
 * One rule for both routes, in one place: same type, same issuer DID, both
 * kept, the earlier one gets `supersededBy`. A requested offer and an unasked
 * one used to decide this differently — one by a link set when the request
 * was made, the other not at all — and a renewal accepted from the inbox
 * left two credentials that both looked current.
 */
function storeAccepted(
  held: HeldCredential[],
  incoming: Omit<HeldCredential, "id" | "isFoundational" | "receivedAt" | "status" | "issuerTrusted">,
): HeldCredential[] {
  const id = rid("hc");
  const orgId = incoming.orgId ?? PELDEN;
  const older = supersedes(held, orgId, incoming.type, incoming.issuerDid);
  return [
    {
      ...incoming,
      id,
      orgId: orgId === PELDEN ? undefined : orgId,
      /* C2 passed a moment ago, or this wouldn't be stored. */
      issuerTrusted: true,
      isFoundational: false,
      receivedAt: today(),
      status: "active",
    },
    ...held.map((c) => (c.id === older?.id ? { ...c, supersededBy: id } : c)),
  ];
}

/**
 * Sending a share, at once (AUTO) or on approval (SINGLE_APPROVER) —
 * FLOW-PRS-01 step 9, FLOW-PRS-02 step 7.
 *
 * Shared by both paths so they cannot drift: the same request record, the
 * same audit row, differing only in whether an approver is named on it.
 *
 * WHAT THE AUDIT ROW KEEPS
 *
 * Credential types and attribute *names*, the verifier, who shared and who
 * approved — and a digest, never the values (FLOW-PRS-02 §10, S9). Every
 * attribute name is listed because every attribute went (D4): a row that
 * named only the asked-for fields would be the audit trail repeating the
 * promise the consent screen refuses to make.
 */
function applyShare(
  state: DemoState,
  requestId: string,
  chosen: Record<string, string>,
  sharer: PersonId,
  approverId: PersonId | null,
): DemoState {
  const request = state.presentationRequests.find((r) => r.id === requestId);
  if (!request) return state;
  const orgId = request.orgId ?? PELDEN;
  const relation = state.relations.find((r) => r.personId === sharer && (r.orgId ?? PELDEN) === orgId && r.state === "ACTIVE");
  const credentials = Object.values(chosen)
    .map((id) => state.heldCredentials.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const names = credentials.flatMap((c) => c.attributes.map((a) => a.name));
  return {
    ...state,
    presentationRequests: state.presentationRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "SHARED" as const,
            chosen,
            decidedBy: sharer,
            decidedAt: today(),
            approvedBy: approverId,
            initiatedBy: r.initiatedBy ?? sharer,
            initiatedAt: r.initiatedAt ?? today(),
            rejection: null,
          }
        : r,
    ),
    auditEntries: appendAudit(state, {
      operation: "proof:present",
      summary: `Shared ${credentials.map((c) => c.type).join(" and ")} with ${request.verifierName} — every attribute: ${names.join(", ")}`,
      actorId: sharer,
      relationId: relation?.id ?? null,
      scopeVersion: relation?.scope.version ?? null,
      approvedById: approverId,
      relyingPartyDid: request.verifierDid,
      disclosedDigest: `sha256:${Math.random().toString(16).slice(2, 10)}`,
    }),
  };
}

/** A person's name for a notice, or a placeholder that still reads. */
const nameOf = (s: DemoState, id: PersonId | null | undefined) => s.people.find((p) => p.id === id)?.name ?? "Someone";
const namesFor = (s: DemoState, ids: PersonId[]) => namesOf(ids.map((id) => nameOf(s, id)));

/** A notice for the activity feed, saying who it goes to. */
type Note = { text: string; orgId: string };
const noteTo = (s: DemoState, to: PersonId[], text: string, orgId: string): Note[] =>
  to.length ? [{ text: `To ${namesFor(s, to)}: ${text}`, orgId }] : [];

/** The organisation's name as the notices write it — "Pelden Trading". */
const orgNameOf = (s: Pick<DemoState, "organizations">, orgId: string) =>
  shortOrgName(s.organizations.find((o) => o.id === orgId)?.name ?? "your organisation");

/**
 * A share or an approval the store refused, on the record (FLOW-PRS-01 v0.2
 * and FLOW-PRS-02 v0.3 §10): the relation, the request, the operation and
 * the reason — never an attribute value. A refusal with no trace would
 * leave unrecorded the one attempt an investigation most wants to see.
 */
function refusedOnRecord(s: DemoState, actor: PersonId, r: PresentationRequest, reason: string, relationId?: string): DemoState {
  const orgId = r.orgId ?? PELDEN;
  const relation = relationId
    ? s.relations.find((x) => x.id === relationId)
    : s.relations.find((x) => x.personId === actor && (x.orgId ?? PELDEN) === orgId && x.state === "ACTIVE");
  return {
    ...s,
    auditEntries: appendAudit(s, {
      operation: /^(approving|deciding)/.test(reason) ? "approval:decide" : "proof:present",
      summary: `Refused ${reason}: ${r.verifierName}'s request for ${typesOf(r)}`,
      actorId: actor,
      relationId: relation?.id ?? null,
      scopeVersion: relation?.scope.version ?? null,
      relyingPartyDid: r.verifierDid,
    }),
  };
}

/**
 * SCR-PRS-04's *Approve and share with <verifier>* — FLOW-PRS-01 A1,
 * FLOW-PRS-02 A1. Pure, so the store can run it inside setState and read
 * the notes it produces from the state the click was made against.
 *
 * WHAT IS CHECKED AGAIN, IN WHAT ORDER
 *
 * 1. The approver: holds approval:decide here, and is not the sharer —
 *    never one's own (SAD-EW-01 §8.4), the rule approveOperation always
 *    kept and still does.
 * 2. The sharer's standing (E16/E11): their relation still ACTIVE and still
 *    permitting this share, reach included. An approval confirms a
 *    colleague's decision; it doesn't stand in for a permission that has
 *    lapsed. Nothing is sent and the request goes back to OPEN for someone
 *    who may answer it — not FAILED, because the bank's request is still
 *    perfectly answerable.
 * 3. V1/V2: the verifier still listed. If not, FAILED.
 * 4. V7: the credentials chosen still shareable. If not, back to OPEN with
 *    the change shown.
 *
 * Only then does the share run, with the approver on the record.
 */
function approveShare(s: DemoState, id: string, approver: PersonId, method: "web" | "wallet"): { next: DemoState; notes: Note[] } {
  const none = { next: s, notes: [] as Note[] };
  const op = s.parkedOperations.find((p) => p.id === id);
  if (!op || op.state !== "parked" || !op.targetId) return none;
  const r = s.presentationRequests.find((x) => x.id === op.targetId);
  if (!r || sharing.statusOf(r) !== "AWAITING_APPROVAL" || r.approvalId !== id) return none;
  const orgId = r.orgId ?? PELDEN;
  /* Never one's own, and only someone holding approval:decide. Refused —
     and the refusal is on the record (FLOW-PRS-01/02 §10, AC-03). */
  if (op.requestedBy === approver) return { next: refusedOnRecord(s, approver, r, "approving their own share"), notes: [] };
  if (!sharing.approversFor(s, orgId, op.requestedBy).includes(approver))
    return { next: refusedOnRecord(s, approver, r, "approving without approval:decide"), notes: [] };

  const signature = { personId: approver, at: today(), method };
  const ops = (patch: Partial<ParkedOperation>) =>
    s.parkedOperations.map((p) => (p.id === id ? { ...p, signatures: [...p.signatures, signature], ...patch } : p));
  const reqs = (patch: Partial<PresentationRequest>) => s.presentationRequests.map((x) => (x.id === r.id ? { ...x, ...patch } : x));
  const sharerName = nameOf(s, op.requestedBy);

  const relation = s.relations.find((x) => x.id === op.relationId);
  if (!relation || relation.state !== "ACTIVE" || !sharing.mayShare(s, op.requestedBy, r)) {
    const lapsed = {
      ...s,
      parkedOperations: ops({ state: "stale", invalidatedReason: `${sharerName} can no longer share this, so it hasn't been sent.` }),
      presentationRequests: reqs({ status: "OPEN", approvalId: null, lapsedSharer: op.requestedBy, initiatedBy: null, initiatedAt: null }),
    };
    return {
      /* E16/E11 on the record: the share the sharer's standing no longer
         covers, refused at approval (§10). */
      next: refusedOnRecord(lapsed, op.requestedBy, r, `sharing, at approval — ${sharerName} can no longer share this`, op.relationId),
      notes: noteTo(
        s,
        sharing.answerersFor(s, r).filter((x) => x !== op.requestedBy),
        NOTICE.reopened(r.verifierName, sharerName, r.expiresAt),
        orgId,
      ),
    };
  }

  if (!sharing.listedVerifier(s, r.verifierOrgId)) {
    const failure = `${r.verifierName} can't receive this any more. Nothing has been shared.`;
    return {
      next: { ...s, parkedOperations: ops({ state: "stale", invalidatedReason: failure }), presentationRequests: reqs({ status: "FAILED", failure }) },
      notes: noteTo(s, [op.requestedBy], failure, orgId),
    };
  }

  const changed = sharing.matchRequest(s, r).find((m) => !m.options.some((c) => c.id === r.chosen?.[m.descriptor.id]));
  if (changed) {
    const held = s.heldCredentials.find((c) => c.id === r.chosen?.[changed.descriptor.id]);
    const reason = `${changed.descriptor.credentialType} can't be shared any more: ${(held && sharing.whyUnshareable(held)) ?? "it is no longer in your wallet"}.`;
    return {
      next: { ...s, parkedOperations: ops({ state: "stale", invalidatedReason: reason }), presentationRequests: reqs({ status: "OPEN", approvalId: null, failure: reason }) },
      notes: noteTo(s, [op.requestedBy], reason, orgId),
    };
  }

  const next = applyShare({ ...s, parkedOperations: ops({ state: "approved" }) }, r.id, r.chosen ?? {}, op.requestedBy, approver);
  const root = sharing.rootOf(s, orgId);
  const approverName = nameOf(s, approver);
  return {
    next,
    notes: [
      ...noteTo(s, [op.requestedBy], NOTICE.approved(approverName, typesOf(r), r.verifierName), orgId),
      /* D20 — the Root is told whenever anyone else shares, on approval
         too; not when the Root is the one who just approved it. */
      ...(root && root !== approver && root !== op.requestedBy
        ? noteTo(s, [root], NOTICE.rootTold(sharerName, orgNameOf(s, orgId), typesOf(r), r.verifierName, approverName), orgId)
        : []),
    ],
  };
}

/**
 * SCR-PRS-04's *Don't approve* (D15). The request goes back to OPEN — the
 * approver decided this person shouldn't share this now, not that the
 * organisation refuses the bank — and the sharer is told, with the note.
 */
function rejectShare(s: DemoState, id: string, approver: PersonId, note: string): { next: DemoState; notes: Note[] } {
  const none = { next: s, notes: [] as Note[] };
  const op = s.parkedOperations.find((p) => p.id === id);
  if (!op || op.state !== "parked" || !op.targetId) return none;
  const r = s.presentationRequests.find((x) => x.id === op.targetId);
  if (!r || sharing.statusOf(r) !== "AWAITING_APPROVAL" || r.approvalId !== id) return none;
  const orgId = r.orgId ?? PELDEN;
  if (op.requestedBy === approver) return { next: refusedOnRecord(s, approver, r, "deciding their own share"), notes: [] };
  if (!sharing.approversFor(s, orgId, op.requestedBy).includes(approver))
    return { next: refusedOnRecord(s, approver, r, "deciding a share without approval:decide"), notes: [] };
  const relation = s.relations.find((x) => x.personId === approver && (x.orgId ?? PELDEN) === orgId && x.state === "ACTIVE");
  return {
    next: {
      ...s,
      parkedOperations: s.parkedOperations.map((p) => (p.id === id ? { ...p, state: "rejected", decisionReason: note || null } : p)),
      presentationRequests: s.presentationRequests.map((x) =>
        x.id === r.id ? { ...x, status: "OPEN" as const, approvalId: null, rejection: { by: approver, note, at: today() } } : x,
      ),
      auditEntries: appendAudit(s, {
        operation: "approval:decide",
        summary: `Didn't approve ${nameOf(s, op.requestedBy)} sharing ${typesOf(r)} with ${r.verifierName}`,
        actorId: approver,
        relationId: relation?.id ?? null,
        scopeVersion: relation?.scope.version ?? null,
        relyingPartyDid: r.verifierDid,
      }),
    },
    notes: noteTo(s, [op.requestedBy], NOTICE.rejected(nameOf(s, approver), r.verifierName, Boolean(note.trim())), orgId),
  };
}

/** Today, as the seed writes dates. Anything created in a demo is dated now. */
const today = () => new Date().toISOString().slice(0, 10);
/**
 * FLOW-ORG-01 P3 as the server would answer it: which entity types have a
 * connected authority (Flow 2 solution design §2.2).
 *
 * Since Flow 5 this is read from the designations and adoptions, which is
 * what P3 actually is: an authority designated `ACTIVE`, with NDI's access
 * in place, an `ACTIVE` adoption for the entity type and an `ACTIVE`
 * authorisation for it (FLOW-ORG-03 Q3, Q4).
 * Stopping either — an entity type (A2) or NDI's access (A3) — takes the
 * type off this list at once, and nothing else changes.
 *
 * WHY THERE IS STILL AN ADMINISTRATOR CONDITION
 *
 * Demo sequencing, not a rule from the spec. The Corporate Regulatory
 * Authority's designation predates every state the demo starts in, so on
 * day zero companies would already be connected — and the guide's first
 * chapters are about a platform that takes nobody in until it has people
 * to run it. Requiring an active platform admin keeps that story true
 * without inventing a second CRA designation for the presenter to walk.
 */
const ROUTED_KINDS: OrgKind[] = ["company", "sole_proprietorship", "partnership"];
function connectedKinds(s: DemoState): OrgKind[] {
  if (!s.people.some((p) => p.platformRole === "admin" && p.hasAccount !== false)) return [];
  return ROUTED_KINDS.filter((kind) =>
    s.adoptions.some((a) => {
      if (a.entityType !== kind || a.state !== "ACTIVE") return false;
      const d = s.designations.find((x) => x.id === a.designationId);
      /* The authorisation row as well as the membership: they move together
         (EW-FLOW5-SD §4.4), and P3 reads both. */
      return (
        d?.state === "ACTIVE" &&
        d.ndiAccess === "ACTIVE" &&
        s.authorisations.some((z) => z.designationId === d.id && z.entityType === kind && z.state === "ACTIVE")
      );
    }),
  );
}

/**
 * FLOW-ORG-02 step 3 — the activation checks, read-only. Each is read from
 * the organisation's record as it is now, never inferred from something
 * having worked before (P5's note). What each failure says, and who fixes
 * it, is SCR-DSG-04's content — the checks carry both so the screen only
 * renders them.
 */
function activationChecks(s: DemoState, d: Designation): ActivationCheck[] {
  const org = s.organizations.find((o) => o.id === d.orgId);
  const did = org?.issuingDid ?? "";
  const method = did.split(":").slice(0, 2).join(":");
  const missing = ISSUER_ENTITLEMENTS.filter((e) => !org?.entitlements?.includes(e));
  const incumbent = s.designations.find(
    (x) => x.id !== d.id && x.state === "ACTIVE" && x.entityTypes.some((t) => d.entityTypes.includes(t)),
  );
  /* P2 is two things: the OWNER's acceptance, and the OWNER's grant of
     VERIFIER to NDI's service principal. Either missing is E1 (AC-11) — and
     nothing is added, because the membership is only accepted at step 4,
     after every check passes. */
  const accepted = d.state === "ACCEPTED" || d.state === "ACTIVE";
  const granted = Boolean(d.ndiGrant);
  const p2 = accepted && granted;
  return [
    {
      id: "P2",
      label: "Accepted by the organisation, and NDI's access granted",
      pass: p2,
      observed: p2 ? null : !accepted ? "Not accepted yet" : "Accepted; NDI's access not granted",
      resolver: p2 ? null : "authority",
      error: p2 ? null : "E1",
    },
    {
      id: "P3",
      label: "Organisation set up — agent and wallet",
      pass: Boolean(org?.agentReady),
      observed: org?.agentReady ? null : "No agent or wallet",
      resolver: org?.agentReady ? null : "authority",
      error: org?.agentReady ? null : "E2",
    },
    {
      id: "P4",
      label: "Issuing identity is did:ethr on the national network",
      pass: method === "did:ethr",
      observed: method === "did:ethr" ? null : method || "None",
      resolver: method === "did:ethr" ? null : "authority",
      error: method === "did:ethr" ? null : "E3",
    },
    {
      id: "P5",
      label: "Entitlements: schema creation, issuance, verification",
      pass: missing.length === 0,
      observed: missing.length ? missing.join(", ") : null,
      resolver: missing.length ? "NDI" : null,
      error: missing.length ? "E4" : null,
    },
    {
      id: "P6",
      label: "No other foundational issuer for these entity types",
      pass: !incumbent,
      observed: incumbent ? incumbent.orgName : null,
      resolver: incumbent ? "NDI" : null,
      error: incumbent ? "E5" : null,
    },
  ];
}

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/** One row on SCR-CRD-10's delivery log, newest first, kept to the twelve it shows. */
function withLogRow(i: IssuerIntegration, event: string, status: number, attempt = 1): IssuerIntegration {
  return {
    ...i,
    log: [{ id: rid("evt"), event, attempt, status, latencyMs: 90 + Math.floor(Math.random() * 150), at: today() }, ...i.log].slice(0, 12),
  };
}

/**
 * FLOW-CRD-03 step 5 — a request has reached the issuer. An offering the
 * system answers goes to it only if the issuer has set it up (P3); until
 * then it lands on the officers' queue, which is what SCR-CRD-10 says before
 * anything is set up. Once set up, the event is delivered and the log says
 * so — a 503 for the simulated miss (E6), which also raises the failing
 * banner. `nextAnswer` is what the dashed stand-in chose, used once.
 */
function routeToIssuer(
  integration: IssuerIntegration,
  offering: CredentialOffering | undefined,
  issuerOrgId: string,
): { system: SystemRoute | null; integration: IssuerIntegration } {
  if (offering?.answering !== "api" || integration.orgId !== issuerOrgId) return { system: null, integration };
  if (!systemConnected(integration)) return { system: { state: "UNCONNECTED", plan: "answer", note: null }, integration };
  const plan = integration.nextAnswer;
  const used = { ...integration, nextAnswer: "answer" as const };
  return {
    system: { state: "WAITING", plan, note: null },
    integration:
      plan === "miss"
        ? { ...withLogRow(used, "credential-request.received", 503), failingSince: used.failingSince ?? today(), lastError: "HTTP 503" }
        : withLogRow(used, "credential-request.received", 200),
  };
}

/**
 * The issuer's system answering (FLOW-CRD-03 steps 6–7; A2, E6, E10).
 *
 * Run when the short delay after delivery ends, doing what the stand-in
 * chose: offer the values the system supplies, refer with a note, or not pick
 * the request up at all. `force` is the other stand-in — the system answering
 * a request an officer already has open, which is how the first answer wins
 * is shown. An offer is recorded against the first client the issuer created
 * (Q1, Q4) and nothing about it is an officer's; the business still reviews
 * and accepts by hand (D3). A request past `answerBy` is refused (410), and
 * one an officer already answered is no longer `WITH_ISSUER` (409), so
 * neither changes.
 */
function systemAnswers(s: DemoState, requestId: string, force = false): DemoState {
  const r = s.credentialRequests.find((x) => x.id === requestId);
  if (!r || r.state !== "WITH_ISSUER" || !r.system) return s;
  if (!force && r.system.state !== "WAITING") return s;
  if (r.answerBy && r.answerBy < today()) return s;
  const offering = s.offerings.find((o) => o.id === r.offeringId);
  const client = s.integration.clients[0];
  const plan = force ? "answer" : r.system.plan;
  const patch = (x: CredentialRequest, change: Partial<CredentialRequest>) => (x.id === requestId ? { ...x, ...change } : x);
  const note = (text: string, orgId: string) => ({ id: rid("a"), text, at: today(), orgId });

  if (plan === "refer")
    return {
      ...s,
      credentialRequests: s.credentialRequests.map((x) => patch(x, { system: { ...r.system!, state: "REFERRED", note: SAMPLE_REFERRAL_NOTE } })),
      activity: [note(`Your system couldn't decide a request for ${r.credential}. It's on Requests to answer`, r.issuerOrgId), ...s.activity].slice(0, 20),
    };
  if (plan === "miss" || !client)
    return { ...s, credentialRequests: s.credentialRequests.map((x) => patch(x, { system: { ...r.system!, state: "MISSED" } })) };

  return {
    ...s,
    credentialRequests: s.credentialRequests.map((x) =>
      patch(x, {
        state: "OFFER_READY",
        answeredBy: null,
        answeredBySystem: { clientId: client.id, name: client.name },
        answeredAt: today(),
        /* The values the system supplies: the offering's examples, since no
           register exists to look them up in. */
        offer: {
          attributes: (offering?.fields ?? []).map((f) => ({ name: f.name, value: f.example })),
          validUntil: null,
          offeredAt: today(),
          expiresAt: inDays(30),
        },
      }),
    ),
    activity: [
      note(`${r.issuerName} has replied — review it`, r.orgId),
      note(`Your system answered a request for ${r.credential}`, r.issuerOrgId),
      ...s.activity,
    ].slice(0, 20),
  };
}

/**
 * Whether the person driving owns an issuing office — what changing its
 * offerings and integration needs (SCR-CRD-07, SCR-CRD-10). Answering
 * requests needs only membership (OrgRoles.ISSUER), checked where it's done.
 */
function issuerOwner(s: DemoState, orgId: string): boolean {
  const org = s.organizations.find((o) => o.id === orgId);
  return org?.roles?.[s.harness.persona] === "Owner";
}

/**
 * Whether a person may run an operation for an organisation — read from
 * their ACTIVE relation's scope, the way the server would (FLOW-CRD-01 P2).
 * The screens ask this to grey a button with its reason; the store asks it
 * again before doing anything, because the screen is not the boundary.
 *
 * The whole grant is read, not only its operation: the scope has to be in
 * force today, and when a credential type is given the grant has to cover
 * it. Every preset leaves accepting unfiltered (EW-FLOW3-SD §4.2), but a
 * grant may still name types — Rinzin may present exactly one kind. A
 * grant that needs an approver is not a yes here. No preset puts one on
 * receiving or accepting, and parking one for an approver isn't
 * built for credentials, so it's refused rather than waved through.
 */
function mayOperate(s: DemoState, personId: string, orgId: string, op: string, credentialType?: string): boolean {
  const now = today();
  return s.relations.some(
    (r) =>
      r.personId === personId &&
      (r.orgId ?? PELDEN) === orgId &&
      r.state === "ACTIVE" &&
      r.scope.validFrom <= now &&
      (r.scope.validUntil === null || r.scope.validUntil >= now) &&
      r.scope.grants.some(
        (g) =>
          g.operation === op &&
          g.approval === "AUTO" &&
          (!credentialType || g.credentialTypes.mode === "any" || g.credentialTypes.values.includes(credentialType)),
      ),
  );
}

/**
 * A DID shaped like the method it claims to be.
 *
 * This used to be `${method}:bhutan:<random>` for every method, which gave
 * did:polygon:bhutan:… and did:key:bhutan:… — shapes neither method uses.
 * Nobody reads a new DID closely in a demo, but a DID that is visibly the
 * wrong shape is the kind of detail an engineer in the room notices and then
 * stops trusting the rest. Random, not derived from anything: there are no
 * keys here to derive it from.
 */
const newDidId = (method: string): string => {
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  switch (method) {
    case "did:polygon":
      return `did:polygon:0x${hex(40)}`;
    case "did:key":
      return `did:key:z6Mk${Array.from({ length: 44 }, () => base58[Math.floor(Math.random() * 58)]).join("")}`;
    case "did:web":
      return "did:web:issuer.bhutanndi.bt";
    case "did:ethr":
      return `did:ethr:0x${hex(40)}`;
    default:
      return `${method}:${hex(32)}`;
  }
};
/**
 * SCR-ACC-03's checks, run when Accept is pressed and again when the wallet
 * has confirmed — the second time because the first answer can be stale by
 * then. Kept out of the action so both can ask the same question.
 */
function acceptanceCheck(
  s0: DemoState,
  id: string,
): { ok: true } | { ok: false; error: "E5" | "E6" | "not_owner" | "invalid" } {
  /* No date check: an approval waiting to be accepted no longer expires
     (D20). It ends when the owner acts, or when an administrator withdraws
     it (E2) — and a withdrawn one is no longer PENDING_ACCEPTANCE, so it
     is "invalid" here like anything else that moved on. */
  const acc = s0.accreditations.find((a) => a.id === id);
  if (!acc || acc.state !== "PENDING_ACCEPTANCE") return { ok: false, error: "invalid" };
  const org = s0.organizations.find((o) => o.id === acc.orgId);
  /* E5: an invited institution that has not registered yet has nobody
     who could accept. */
  if (!org) return { ok: false, error: "E5" };
  const me = s0.people.find((p) => p.id === s0.harness.persona);
  if (roleIn(org, me) !== "Owner") return { ok: false, error: "not_owner" };
  /* E6: new approvals are listed under a did:ethr identity. An
     organisation recognised for what it already does keeps the identity it
     has been operating under, whatever its method — recorded as an
     exception (EW-FLOW4-SD §10). */
  const did = listingDid(s0, org);
  if (!did || (acc.door !== "RECOGNITION" && !did.startsWith("did:ethr:") && !listedUnder(s0, org.id, did)))
    return { ok: false, error: "E6" };
  return { ok: true };
}

/**
 * The identity an acceptance would list the organisation under. Its
 * primary DID when a standing approval is already listed under it (see
 * listedUnder) or when there is no other; otherwise a did:ethr set up for
 * this approval and not yet primary (step 5). The switch to primary happens
 * only when the acceptance is recorded (step 8), so until then the
 * organisation's invitations still carry the identity they always did.
 */
function listingDid(s0: DemoState, org: Organization): string | undefined {
  if (org.publicDid && listedUnder(s0, org.id, org.publicDid)) return org.publicDid;
  return org.pendingDid ?? org.publicDid;
}

/**
 * Makes `did` the organisation's primary DID — ACC-01 step 8, ACC-02 step
 * 8 — and clears it as pending. From this switch the primary-DID lock
 * applies (listedUnder covers LISTING and ACTIVE), so there is no window
 * between the identity becoming primary and it being locked.
 */
const switchPrimary = (o: Organization, did: string | null): Organization =>
  !did ? o : { ...o, publicDid: did, pendingDid: o.pendingDid === did ? undefined : o.pendingDid };

/**
 * Whether an approval that still stands is listed under this identity. If
 * one is, the identity can't be swapped: every wallet that trusts the
 * organisation trusts it under that DID, and replacing it would leave the
 * standing approval pointing at an identity the organisation no longer
 * uses — the "stopped" face SCR-ACC-04 describes (ACC-01/E11), reached by
 * the app itself. The lock runs from the switch to primary (step 8) through
 * LISTING and ACTIVE (EW-FLOW4-SD §6.2).
 * So a later approval for the same organisation keeps the identity it
 * already has, whatever its method, the way a recognition does.
 */
function listedUnder(s0: DemoState, orgId: string, did: string): boolean {
  return s0.accreditations.some(
    (a) => a.orgId === orgId && a.publicIdentity === did && ["LISTING", "ACTIVE", "HELD"].includes(a.state),
  );
}

/**
 * Accreditations are decided by named platform admins — never the root
 * account, which approves nothing (FLOW-ONB-02 S2, E13). Root reaching an
 * accreditation action is a control failure worth recording, since no screen
 * offers it. One guard for every action that proposes, reviews, decides or
 * withdraws, so none of them can drift from the others again.
 */
function namedAdminRefusal(me: Person | undefined, log: (text: string, orgId?: string) => void): { ok: false; error: "not_admin" } | null {
  if (isNamedAdmin(me)) return null;
  if (me?.platformRole === "root") log("Control failure — the root account tried to act on an accreditation", NDI_ORG);
  return { ok: false, error: "not_admin" };
}

/**
 * Runs the activation checks (FLOW-ORG-02 P2–P6) and records the result: the
 * checks on the designation and, if they all pass, ACTIVE with the two log
 * entries that say nothing is live until the authority adopts. Accepting,
 * re-running and granting entitlements all end here, so the record of how a
 * designation became active never depends on which button did it.
 */
function runActivation(
  s0: DemoState,
  d: Designation,
  setState: (f: (s: DemoState) => DemoState) => void,
  log: (text: string, orgId?: string) => void,
): boolean {
  const checks = activationChecks(s0, d);
  const allPass = checks.every((c) => c.pass);
  /* Step 5 records the primary DID itself (Q1) — what E10 compares against
     later — and the method read from it, not assumed. */
  const did = s0.organizations.find((o) => o.id === d.orgId)?.issuingDid ?? null;
  setState((s) => ({
    ...s,
    designations: s.designations.map((x) =>
      x.id !== d.id
        ? x
        : allPass
          ? {
              ...x,
              state: "ACTIVE" as const,
              checks,
              checkedAt: today(),
              activatedAt: today(),
              publishingDid: did,
              didMethodAtActivation: did ? did.split(":").slice(0, 2).join(":") : null,
              /* Step 4 — the service, as the named principal, accepts the
                 VERIFIER grant the OWNER issued. It adds nothing itself (S5). */
              ndiAccess: "ACTIVE" as const,
              ndiAccessChangedBy: x.ndiGrant?.by ?? null,
              ndiAccessChangedAt: today(),
            }
          : { ...x, checks, checkedAt: today() },
    ),
  }));
  if (allPass) {
    log(`${d.orgName} is designated — nothing is live until it adopts`, NDI_ORG);
    log("NDI's service account joined, accepting the access you granted. It's in your members list", d.orgId);
    log("Designated as foundational issuer. Nothing is live in your name yet", d.orgId);
  }
  return allPass;
}

const rid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * FLOW-ONB-02 P7 — the named platform admins who are active: an account that
 * exists and is not locked or suspended. One definition, used wherever the
 * flow counts admins, as the spec asks.
 */
/**
 * Who may end an organisation's accreditation record — resign it, or
 * withdraw a request still waiting (SCR-ACC-04). For a business's request
 * the Root, by its ACTIVE relation and never the role (FLOW-ACC-02 S3, A1);
 * for anything NDI proposed, the organisation's OWNER, who accepted it.
 */
const mayEndAcc = (s: DemoState, acc: Pick<Accreditation, "orgId" | "door">, personId: PersonId | undefined) => {
  if (!personId || !acc.orgId) return false;
  if (acc.door === "REQUEST")
    return s.relations.some((r) => inOrg(acc.orgId!)(r) && r.isRootAuthority && r.state === "ACTIVE" && r.personId === personId);
  const org = s.organizations.find((o) => o.id === acc.orgId);
  return roleIn(org, s.people.find((p) => p.id === personId)) === "Owner";
};

const activeAdmins = (s: DemoState) => s.people.filter((p) => p.platformRole === "admin" && p.hasAccount !== false);

/**
 * FLOW-ONB-02 P8 — whether the root account may issue another administrator
 * invitation: only while fewer than two named admins are active (S9). The
 * same answer decides whether SCR-INV-01 offers root the form at all, so the
 * screen never offers something the store would then refuse.
 *
 * There used to be a cap on pending invitations too — no more than it takes
 * to reach two. The spec dropped it on 14 Oct: the step-8 re-check already
 * stops a third admin, because a root-issued invitation accepted once two
 * are active is void (E6, AC-16), and a cap only made a mistyped address
 * harder to replace.
 */
function rootInviteBlock(s: DemoState): "two_active" | null {
  return activeAdmins(s).length >= 2 ? "two_active" : null;
}

/**
 * A person once their own wallet has proved who they are: confirmed, with the
 * masked citizenship number the proof returned. For someone the story knows
 * that is the number it already has for them; anyone else gets a fixture.
 */
function anchored(p: Person): Person {
  if (p.cidVerified) return p;
  const known = SEED.people.find((x) => x.id === p.id && x.cid !== "—");
  const cid = known?.cid ?? `•••• •••• ${String(1000 + Math.floor(Math.random() * 9000))}`;
  return { ...p, cidVerified: true, cid };
}

/**
 * FLOW-ONB-02 step 9 for a member invitation: the invitee joins the named
 * organisation at the named role, and gains nothing else (Q4).
 *
 * WHO THE MEMBER IS
 *
 * Someone the story already knows by that address — Ugyen, Rinzin — keeps
 * their record. Anyone else gets a record of their own, marked with the
 * invitation that brought them so the harness can drive as them. The first
 * version wrote every member into one shared "invitee" slot, so inviting a
 * second colleague quietly replaced the first on the Members page.
 *
 * WHAT JOINING DOES NOT DO
 *
 * It confirms nothing about who they are. Nobody has asked the register, and
 * nothing here should: identity is anchored when someone takes on authority
 * to act, not when they join (FLOW-ONB-02 §7.3). So a person joining from no
 * account is recorded as not confirmed, whatever the story's later acts say
 * about them; someone who already had an account elsewhere keeps what that
 * account says (AC-10 — one account, several organisations).
 *
 * The role goes on the organisation (`roles`), not on the person. Someone who
 * already has an account keeps their name and their role everywhere else:
 * the first version overwrote both, so inviting Bank of Bhutan's owner into
 * Pelden as an admin also made them an admin of the bank.
 */
function joinOrganisation(s: DemoState, inv: OrgInvitation, name: string, personId: PersonId): DemoState {
  const orgId = inv.orgId as string;
  const role = inv.role ?? "Member";
  const known = s.people.find((p) => p.id === personId);
  /* An existing account is named as it already is, not as typed here. */
  const shownName = known && known.hasAccount !== false ? known.name : name;
  const people: Person[] = known
    ? s.people.map((p) =>
        p.id !== personId
          ? p
          : p.hasAccount === false
            ? /* New to the platform: the story knows them, the platform does
                 not yet — no confirmed identity, so no CID either (that only
                 ever comes from their own wallet proof). */
              { ...p, name, memberRole: role, hasAccount: true, cidVerified: false, cid: "—", joinedBy: inv.id }
            : p,
      )
    : [
        ...s.people,
        {
          id: personId,
          name,
          cid: "—",
          email: inv.email,
          title: role === "Admin" ? "Administrator · joined by invitation" : "Member · joined by invitation",
          cidVerified: false,
          memberRole: role,
          hasAccount: true,
          joinedBy: inv.id,
        },
      ];
  return {
    ...s,
    people,
    organizations: s.organizations.map((o) =>
      o.id !== orgId
        ? o
        : {
            ...o,
            memberIds: o.memberIds.includes(personId) ? o.memberIds : [...o.memberIds, personId],
            members: o.memberIds.includes(personId) ? o.members : o.members + 1,
            roles: { ...o.roles, [personId]: role },
          },
    ),
    orgInvitations: s.orgInvitations.map((i) =>
      i.id === inv.id ? { ...i, state: "ACCEPTED" as const, decidedAt: today(), acceptedName: shownName } : i,
    ),
    /* The organisation's own history: its owner sees who joined, and when. */
    activity: [
      { id: rid("a"), text: `${shownName} joined as ${role === "Admin" ? "an admin" : "a member"}`, at: today(), orgId },
      ...s.activity,
    ].slice(0, 20),
  };
}

/**
 * The step-8 re-check every member acceptance runs, whichever screen it
 * came from: the invitation is still live, and the person who sent it may
 * still invite people to that organisation (S4). Null means it may go ahead.
 */
function memberInvitationRefusal(s: DemoState, inv: OrgInvitation | undefined): "E4" | "E5" | "E6" | "E7" | null {
  if (!inv || inv.kind !== "M" || !inv.orgId) return "E5";
  if (inv.state === "ACCEPTED") return "E7";
  if (inv.state === "VOID") return "E6";
  /* Expiry before the catch-all, so a lapsed invitation says it lapsed (E4)
     rather than that it was withdrawn (E5). */
  if (inv.state === "EXPIRED" || (inv.state === "PENDING" && inv.expiresAt !== null && inv.expiresAt < today())) return "E4";
  /* Declined, revoked, refused, waiting on approval — none can be accepted. */
  if (inv.state !== "PENDING") return "E5";
  const role = roleIn(
    s.organizations.find((o) => o.id === inv.orgId),
    s.people.find((p) => p.id === inv.invitedBy),
  );
  return role === "Owner" || role === "Admin" ? null : "E6";
}

/** Records the outcome of a refused member acceptance: E6 voids it, E4 expires it. */
function markRefused(s: DemoState, id: string, refusal: string): DemoState {
  if (refusal !== "E6" && refusal !== "E4") return s;
  return {
    ...s,
    orgInvitations: s.orgInvitations.map((i) =>
      i.id === id ? { ...i, state: refusal === "E6" ? ("VOID" as const) : ("EXPIRED" as const) } : i,
    ),
  };
}

/** What a session link is when it loads (SCR-PRS-01). */
export type SessionLook =
  | { kind: "unknown" }
  | { kind: "expired"; verifierName: string; sessionId: string }
  | { kind: "used"; verifierName: string; requestId: string | null; sessionId: string }
  | { kind: "ready"; verifierName: string; displayReference: string; sessionId: string };

interface DemoActions {
  addSchema: (input: {
    name: string;
    version: string;
    ledger: LedgerKind;
    attributes: Attribute[];
  }) => Schema;
  addCredDef: (input: { schemaId: string; tag: string; revocable: boolean }) => CredDef;
  addDid: (input: { method: string; keyType: string; alias: string }) => Did;
  setIssuerDid: (id: string) => void;
  removeDid: (id: string) => void;
  issueCredentials: (input: {
    holders: string[];
    schemaName: string;
    credDefTag: string;
    method: Credential["method"];
  }) => Credential[];
  setCredentialState: (id: string, state: Credential["state"]) => void;
  addVerification: (input: { holder: string; schemaName: string }) => Verification;
  setVerificationState: (id: string, state: Verification["state"]) => void;
  addConnection: (label: string) => Connection;
  addOrganization: (input: {
    name: string;
    description: string;
    website?: string;
    location?: string;
    visibility: Organization["visibility"];
  }) => Organization;
  updateOrganization: (id: string, patch: Partial<Organization>) => void;
  /** Removes the organization and everything it owned. See the note below. */
  deleteOrganization: (id: string) => void;
  setActiveOrg: (id: string) => void;
  respondToEcosystemInvitation: (id: string, state: EcosystemInvitation["state"]) => void;
  inviteMember: (input: { email: string; role: Member["role"] }) => Member;
  removeMember: (id: string) => void;
  addCertificate: (input: { commonName: string; keyType: string; expires: string }) => Certificate;
  removeCertificate: (id: string) => void;
  respondToInvitation: (id: string, state: Invitation["state"]) => void;
  addEcosystem: (name: string) => Ecosystem;
  inviteEcosystemMember: (organization: string) => void;
  addBulkUpload: (input: { fileName: string; records: number }) => BulkUpload;
  addApiKey: (label: string) => void;
  revokeApiKey: (id: string) => void;

  /* ---- Controllership ----
     The relation lifecycle, as an Owner and a Controller move a grant through
     it: DRAFT -> PENDING_ACCEPTANCE -> ACTIVE. */

  /** Creates a relation in DRAFT with an empty scope, ready for the builder. */
  addRelation: (input: {
    personId: string;
    legalBasis: LegalBasis;
    instrumentFileName?: string;
    instrumentReference?: string;
  }) => ControllershipRelation;
  /** Replaces a draft's scope. Bumps the version, which audit rows cite. */
  updateRelationScope: (id: string, scope: Scope) => void;
  sendRelationForAcceptance: (id: string) => void;
  /** The Controller's own acceptance. Only this makes a relation ACTIVE. */
  /**
   * The proposed controller's wallet proof, answered as they accept — where
   * identity is anchored for anyone who joined by invitation (FLOW-ONB-02
   * §7.3: "at appointment, not here"). The register's answer is a fixture.
   */
  confirmIdentity: (personId: string) => void;
  /** Refused (left unchanged) until the controller's identity is confirmed. */
  acceptRelation: (id: string) => void;

  /* ---- Flow 3 (FLOW-DEL-02, FLOW-DEL-01) ----
     The representative accepts responsibility; then gives a member
     authority from one or more of four presets; the member accepts with one wallet
     approval. Every refusal is decided here, not on the screen. */

  /**
   * SCR-DEL-01 — the representative accepts responsibility for the
   * organisation the authority just confirmed them for. E3 for anyone else.
   */
  acceptResponsibility: (orgId: string) => { ok: true } | { ok: false; error: "E3" | "E4" };
  /** SCR-DEL-01's decline (DEL-02/E2). Nothing moves; it can be reopened. */
  declineResponsibility: (orgId: string) => void;
  /** SCR-DEL-02 — appoint a member. Returns the appointment's id. */
  appoint: (input: {
    personId: PersonId;
    /** One or more, in any combination (EW-FLOW3-SD §4.2, D18). */
    presets: PresetId[];
    shareReach: ShareReach;
    shareWith: string[];
    shareNeedsApproval: boolean;
    issueNeedsApproval: boolean;
    validUntil: string | null;
    document: AppointmentDocument | null;
  }) => { ok: true; id: string } | { ok: false; error: "E1" | "E3" | "E12" | "E13" | "E14" | "E16" };
  /**
   * SCR-DEL-04 — the appointee's one wallet approval, which both confirms
   * who they are and records their acceptance (EW-FLOW3-SD/D7). `answeredAs`
   * is who the wallet proved; anyone but the appointee is E7, and the
   * reason is not given. E15 is an appointment no longer waiting — withdrawn,
   * declined or already accepted; E8 and E9 are the basis lost at the last
   * moment (step 8's re-check).
   */
  acceptAppointment: (
    id: string,
    answeredAs: PersonId,
  ) => { ok: true } | { ok: false; error: "E4" | "E7" | "E8" | "E9" | "E15" };
  /** SCR-DEL-03's decline (DEL-01/E5). */
  declineAppointment: (id: string) => void;
  /**
   * SCR-DEL-05 — the representative withdraws an appointment still waiting
   * to be accepted (DEL-01/E15, EW-FLOW3-SD/D19). `not_pending` when the
   * appointee's answer got there first: an accepted appointment is ended
   * only by catalogue flow 12.
   */
  withdrawAppointment: (id: string) => { ok: true } | { ok: false; error: "E1" | "not_pending" };
  declineRelation: (id: string, reason: string) => void;

  /* ---- The holder's daily loop (Pattern A) ----
     Presenting what the entity is asked for, and the approval gate in front
     of it. Accepting what it is offered is Flow 6's, below: it never parks. */

  /* ---- Presenting a credential (Flow 7) ----
     FLOW-PRS-01 (from a verifier's website) and FLOW-PRS-02 (in the
     wallet). Who may share, who must agree and what answers a request are
     decided here, from lib/sharing.ts; the screens render the answers. */

  /** §5.3 — what *Share* would do for the person driving, or null if there's no such request. */
  shareVerdict: (requestId: string) => sharing.ShareVerdict | null;
  /** V7 — which held credential answers each descriptor, newest first. */
  matchRequest: (requestId: string) => sharing.DescriptorMatch[];
  /** The verified holders the person driving acts for — SCR-PRS-01's choice. */
  sharingOrgs: () => Organization[];
  /** Who may approve this share — everyone holding approval:decide except whoever chose it. */
  whoApproves: (requestId: string) => PersonId[];
  /** SCR-PRS-06 — the verifier organisation's OWNER, of an organisation approved to verify. */
  canManageReturnAddresses: () => boolean;
  /** Simulated — the verifier's back end creates a session when its button is pressed (§7.1). */
  startPresentationSession: (verifierOrgId: string, displayReference: string) => string | null;
  /** SCR-PRS-01 — the link loads. Records the first load (D16) and says what the link is now. */
  openPresentationSession: (sessionId: string) => SessionLook;
  /** SCR-PRS-01 → step 4 — redeem for the chosen organisation; the request arrives and is checked. */
  redeemPresentationSession: (
    sessionId: string,
    orgId: string,
    /** Simulated — NDI's list can't be reached when the request arrives (FLOW-PRS-01 E8). */
    opts?: { registryDown?: boolean },
  ) => { ok: true; requestId: string } | { ok: false; error: "E1" | "E2" | "E3" | "E4" | "E7" | "E8"; requestId?: string | null };
  /** SCR-PRS-02 — *Share*. AUTO sends; SINGLE_APPROVER asks someone else. */
  shareRequest: (
    requestId: string,
    chosen: Record<string, string>,
  ) =>
    | { ok: true; status: "SHARED" }
    | { ok: true; status: "AWAITING_APPROVAL"; approvers: PersonId[] }
    | { ok: false; error: "E3" | "E4" | "E5" | "E8" | "E10" | "E13" };
  /** SCR-PRS-02 — *Decline* (A2). Needs proof:present for this verifier, as sharing does. */
  declineRequest: (requestId: string) => { ok: true } | { ok: false; error: "E4" | "E5" | "E10" };
  /** SCR-PRS-02 — *Pass to someone who can* (A4, D13). Needs only credential:list. */
  passRequest: (requestId: string) => { ok: true; to: PersonId[] } | { ok: false; error: "E10" | "not_permitted" };
  /** SCR-PRS-02 — *Keep for later* (FLOW-PRS-01 A3): open for 7 days, people who may answer told. */
  keepForLater: (requestId: string) => void;
  /** Simulated — a website request has sat OPEN ten minutes with no decision (FLOW-PRS-01 A3). Told once. */
  remindUndecided: (requestId: string) => void;
  /** SCR-PRS-03 — back to the verifier's registered address, or null when it's gone (E15). */
  returnToVerifier: (sessionId: string) => { url: string | null; status: string };
  /** Simulated — the verifier cancels (FLOW-PRS-01 E14, FLOW-PRS-02 E7). */
  withdrawPresentationRequest: (requestId: string) => void;
  /** Simulated — a request arrives on an existing connection (FLOW-PRS-02's trigger). */
  simulateIncomingRequest: (kind: "bank_recheck" | "untrusted" | "registry_down") => string;
  /** Simulated — NDI's list answers for a request held RECEIVED (E2/E8). */
  resolveRegistryCheck: (requestId: string) => void;
  /** SCR-PRS-06 — the verifier's OWNER registers or removes a return address. */
  addReturnAddress: (url: string) => { ok: true } | { ok: false; error: "not_https" | "wildcard" | "not_full" | "duplicate" | "not_owner" };
  removeReturnAddress: (id: string) => void;

  /**
   * Records one approver's decision.
   *
   * When the last required signature lands, the held operation actually runs
   * — that is what makes this a gate rather than a status field.
   */
  approveOperation: (id: string, method: "web" | "wallet") => void;
  rejectOperation: (id: string, reason: string) => void;

  /* ---- Delegated authority (Pattern B) ---- */

  /** Issues a Role or Capability into a person's own wallet. Awaits their
   *  acceptance — acceptance is the holder's consent and cannot be assumed. */
  issueAuthority: (input: {
    kind: AuthorityKind;
    title: string;
    recipientId: string;
    parentId: string | null;
    taskScopes: string[];
    valueCap: { amount: number; currency: "BTN"; perTransaction: boolean } | null;
    counterparties: ScopeFilter;
    validFrom: string;
    validUntil: string;
  }) =>
    | { status: "issued"; authority: DelegatedAuthority }
    | { status: "parked"; authority: DelegatedAuthority }
    | { status: "refused" };
  acceptAuthority: (id: string) => void;
  /** Reversible. */
  suspendAuthority: (id: string, reason: string) => void;
  reactivateAuthority: (id: string) => void;
  /**
   * Final, and deliberately does NOT cascade a status onto its children —
   * see the note at the implementation. Raises the holder's appeal notice.
   */
  revokeAuthority: (id: string, reason: string) => void;

  /**
   * Runs a verification and keeps the decision.
   *
   * The decision comes from the stand-in verification service in `avs.ts`,
   * never from a component — see the long note in that file for why that
   * boundary matters and where it would be a real network call.
   */
  runVerification: (input: VerificationRequestInput) => VerificationDecision;

  /* ---- Appeals ---- */

  /** The holder's submission against a withdrawal. */
  submitAppeal: (id: string, submission: string) => void;
  /** An owner's decision on one. Upholding reinstates the authority. */
  decideAppeal: (id: string, outcome: "upheld_reinstated" | "rejected") => void;

  /* ---- Account creation (FLOW-ONB-01) ----
     Steps 1–8. Each maps to one step of the flow specification; nothing
     here decides whether an address is acceptable — the view renders E1 and
     E7 identically (S3), and the store records only what happened. */

  /** Step 2: record a provisional account and "send" the verification mail. */
  startSignup: (email: string) => void;
  /** Resend the verification mail. Throttled by the view against S4. */
  resendSignupMail: () => void;
  /** Step 4–5: the verification link is opened. Returns false if it was already used (E3). */
  consumeSignupLink: () => boolean;
  /** Steps 6–8: name and password set, account created, session issued. */
  completeSignup: (name: string) => void;
  /** Adds an organisation to the signing-up account. Flow 2 and Kind M call it. */
  addSignupMembership: (orgId: string, role: "Owner" | "Admin" | "Member") => void;
  /** Where to go once the account exists — set by an invitation link (A1).
   *  `email` pre-fills sign-up with the invited address, so the account is
   *  created for the address the invitation was sent to. */
  setSignupReturn: (path: string | null, email?: string) => void;
  /** Throw the session away and start again from an empty sign-up. */
  clearSignup: () => void;

  /* ---- Invitations (FLOW-ONB-02) ----
     The inviter and the approver are always the persona the console is
     driven as — never a field on the form. That mirrors INV-2: who is acting
     is derived from the session, and an id in the request is never
     authority. Results name the flow's error ids so the screens can render
     exactly the message the specification gives for each. */

  /** Kind M — the owner invites a person into the organisation (step 1).
   *  Not the inherited `inviteMember`, which belongs to the Studio users page
   *  and adds a row with no invitation behind it. */
  inviteToOrganisation: (input: { email: string; role: "Member" | "Admin" }) =>
    | { ok: true; id: string }
    /* E3 split in two, because the spec's copy differs: "{Name} is already a
       member", or an invitation to that address is already waiting. `member`
       is a name from this organisation only — nothing about accounts
       elsewhere is disclosed (S8). */
    | { ok: false; error: "E1" | "waiting" }
    | { ok: false; error: "E3"; member: string };
  /** Kind O — a platform admin proposes an organisation that does not exist yet. */
  proposeOrganisation: (input: {
    email: string;
    legalName: string;
    legalIdentity: string;
    purpose: string;
    needsSecondApproval: boolean;
  }) => { ok: true; id: string } | { ok: false; error: "E1" | "E12" };
  /**
   * Step 2 — a second administrator approves. Refuses self-approval (E11),
   * and the root account, which approves nothing (E13).
   */
  approveInvitation: (id: string) => { ok: true } | { ok: false; error: "E11" | "E13" };
  /** The second administrator declines to send it. */
  refuseInvitation: (id: string) => void;
  /**
   * Revoked by the inviter before acceptance (E5), or withdrawn before
   * approval. The root account gives a reason, which is logged (S9).
   */
  withdrawInvitation: (id: string, rootReason?: string) => void;
  /** Resend after a delivery failure (E8). The token stays the same. */
  resendInvitation: (id: string) => void;
  /** Steps 7–9 — accept, after re-checking the invitation is still good. */
  acceptInvitation: (id: string) =>
    | { ok: true }
    | { ok: false; error: "E4" | "E5" | "E6" | "E7" | "no_account" | "wrong_person" };
  /**
   * A member invitation's invitee sets up their account from the link — name
   * and password — which accepts it in the same step, after the same
   * re-checks as `acceptInvitation`. The person the story already knows by
   * that address keeps their record; anyone else gets one of their own.
   */
  setUpMember: (
    invitationId: string,
    name: string,
  ) => { ok: true; personId: PersonId } | { ok: false; error: "E4" | "E5" | "E6" | "E7" | "invalid" | "has_account" };
  /** A2 — the invitee declines. */
  declineInvitation: (id: string) => void;

  /* ---- Organisation onboarding (Flow 2, FLOW-ORG-01) ----
     Choose the type, type the identifier, answer the authority's identity
     request, wait while it decides. The authority's answers come from
     REGISTER_RECORDS, read only here: the store stands in for the authority
     and the Entity-Wallet Service, and the screens render what it returns. */

  /**
   * SCR-ORG-01 — begins, or begins again, with the type chosen. An
   * invitation or an existing organisation (Kind E) that started this is
   * carried through.
   */
  startOrgOnboarding: (kind: OrgKind, invitationId?: string | null, existingOrgId?: string | null) => void;
  /**
   * SCR-ORG-02 — steps 1–4. Creates the verification record and asks the
   * authority to raise its identity request. E3 when the registration is
   * already verified on the platform; the screen says nothing about why.
   */
  submitIdentifier: (identifier: string) => { ok: true } | { ok: false; error: "E3" | "E1" };
  /** SCR-ORG-03 — steps 5–6. The proof came back; the name is the credential's. */
  recordIdentityProof: (name: string, personId: PersonId) => void;
  /**
   * SCR-ORG-04 — steps 7–8. The authority checks its own records and
   * decides. Its answer is the store's to give and the screen's to show.
   */
  checkWithAuthority: () => "approved" | "not_confirmed";
  /** SCR-ORG-04's "notify me when it's done". */
  setVerificationNotify: (on: boolean) => void;
  /** SCR-ONB-05's "cancel" — the record is withdrawn, nothing was created. */
  cancelOrgOnboarding: () => void;
  /** SCR-ORG-06 — tell us you're waiting. Keeps the type and an address only. */
  recordOrgInterest: (kind: OrgKind, email: string) => void;
  /** Steps 9–11 — the organisation is set up, its registration accepted automatically. */
  completeOrgOnboarding: () => void;
  /** Leaves the first-run state for the story's lived-in one (acts 2–6). */
  restoreStoryState: () => void;

  /* ---- The platform's own setup ----
     Root invites platform admins; organisations ask for access and admins
     decide. Every decision is the store's, standing in for the server —
     screens render the answer, they do not make it. */

  /** The Entity Wallet's day zero: before any admin, before any business. */
  startDayZero: () => void;
  /** Day zero with one platform admin set up — see platformReadyState. */
  startPlatformReady: () => void;
  /**
   * Pelden Trading on the day it was registered, driven as Dorji — the start
   * of the member-invitation walk, without walking the whole onboarding
   * first to get there.
   */
  startFirstDay: () => void;
  /**
   * Pelden's first day after its people have joined: Ugyen and Pema have
   * accepted their invitations and hold no authority — where the controller
   * and delegate appointments start when walked on their own.
   */
  startTeamReady: () => void;
  /**
   * Sign in with an address. Resolves it to a person with an account and
   * drives the console as them; a stand-in for the server's answer, so the
   * screen only renders what comes back.
   */
  signIn: (email: string) => { ok: true; personId: PersonId | null } | { ok: false };
  /**
   * Kind A — someone is invited to administer the platform. A platform
   * admin's invitation waits for a second, distinct admin (P3, S2), and is
   * refused while fewer than two are active (E12). The root account's is
   * sent straight away, but only under S9 — fewer than two active, with the
   * custodians named, and a reason if one is given — and is otherwise
   * refused (E14).
   */
  invitePlatformAdmin: (
    email: string,
    root?: { reason: string; custodians: string },
  ) =>
    | { ok: true; id: string; queued: boolean }
    | { ok: false; error: "E1" | "E3" | "E12" | "E14" | "invalid" };
  /** P7 and P8, as the server would answer them — for SCR-INV-01 to render. */
  adminStatus: () => { active: number; rootBlock: "two_active" | null };
  /**
   * The invitee of a platform-admin invitation sets up their account from the
   * link — name and password — which accepts the invitation in the same step.
   */
  setUpPlatformAdmin: (
    invitationId: string,
    name: string,
  ) => { ok: true; personId: PersonId } | { ok: false; error: "E4" | "E5" | "E6" | "E7" | "invalid" | "has_account" };
  /* ---- Accreditation (Flow 4) ----
     Approval to verify or issue, through either door. Every rule that
     decides — dual control, who may accept, what has already been asked —
     is enforced here, the stand-in for the server, and the screens render
     the answer (standing rule 9). The same rules are not re-implemented in
     the screens as gating: a screen may grey out a button to say why, but
     the refusal that counts is the one returned from here. */

  /**
   * SCR-ACC-01 — an administrator proposes. Refused with E10 when the
   * organisation already has an approval in progress or ACTIVE for the same
   * capability and the proposal does not say it replaces it; for Kind N,
   * when the normalised legal name matches an open Kind N proposal for the
   * capability, or — `E10_ORG` — an organisation already on the platform,
   * which is proposed for as Kind E instead.
   */
  proposeAccreditation: (
    input: AccProposalInput,
  ) =>
    | { ok: true; id: string }
    | { ok: false; error: "E10" | "E12" | "not_admin" | "invalid" }
    | { ok: false; error: "E10_ORG"; orgId: string; orgName: string };
  /**
   * SCR-ACC-02 — the second administrator decides. Never the proposer (E1)
   * nor, for a business's request, its reviewer (ACC-02/E5). Against a
   * recommendation to decline there is no approve and no send-back
   * (ACC-02/E11, D21): only confirming it, with the reviewer's reason.
   */
  decideAccreditation: (
    id: string,
    approve: boolean,
    reason?: string,
  ) => { ok: true } | { ok: false; error: "E1" | "E5" | "E11" | "not_admin" | "invalid" };
  /** SCR-ACC-05 — the first administrator recommends, on the request as written. */
  reviewRequest: (
    id: string,
    approve: boolean,
    reason: string | null,
  ) => { ok: true } | { ok: false; error: "not_admin" | "invalid" };
  /**
   * SCR-ACC-02 — the reviewer takes back a recommendation to decline, so the
   * request is reviewed again (ACC-02/E11). How two administrators who
   * disagree settle it: between themselves, then the reviewer withdraws and
   * recommends afresh. Only the reviewer can, and only before a decision.
   */
  withdrawRecommendation: (id: string) => { ok: true } | { ok: false; error: "not_reviewer" | "invalid" };
  /**
   * SCR-ACC-02 — an administrator withdraws an approval nobody has accepted
   * (ACC-01/E2), with a reason the organisation is shown. The record is
   * WITHDRAWN and no longer stands in the way of a new proposal (AC-15).
   */
  withdrawApproval: (id: string, reason: string) => { ok: true } | { ok: false; error: "not_admin" | "invalid" };
  /**
   * SCR-ACC-03 — the organisation's OWNER accepts, after the wallet step.
   * E5 when the organisation has not finished setting up, E6 when its
   * public identity does not conform. Nothing expires (D20).
   */
  acceptAccreditation: (
    id: string,
  ) => { ok: true } | { ok: false; error: "E5" | "E6" | "not_owner" | "invalid" };
  /** SCR-ACC-03 — the same checks, before the wallet step, changing nothing. */
  prepareAcceptance: (
    id: string,
  ) => { ok: true } | { ok: false; error: "E5" | "E6" | "not_owner" | "invalid" };
  /**
   * SCR-ACC-03 E6 — set up a conforming public identity for the
   * organisation: a did:ethr, not primary, until the acceptance is recorded.
   */
  setUpPublicIdentity: (orgId: string) => { ok: true; did: string } | { ok: false; error: "E7" | "not_owner" | "listed" };
  /** SCR-ACC-03 — the OWNER declines (E3). Nothing is listed; NDI is told. */
  declineAccreditationAsOrg: (id: string) => void;
  /** The listing is published: the approval becomes ACTIVE. Simulated. */
  completeListing: (id: string) => void;
  /** SCR-ACC-04 — resign a capability (A3, ACC-02/A2). Always a stop. */
  resignAccreditation: (id: string) => void;
  /**
   * SCR-ACC-06 — a verified business's Root asks, for one capability or
   * both (D22). E2 for anyone but the Root, E3 when a request or approval
   * already exists for a capability it asks for — unless the part names
   * the ACTIVE approval it replaces ("Ask for more", AC-10). Returns the
   * request's id.
   */
  requestCapability: (
    input: AccRequestInput,
  ) => { ok: true; id: string } | { ok: false; error: "E2" | "E3" | "invalid" };
  /**
   * SCR-ACC-04 — the Root withdraws a request still waiting (ACC-02/A1):
   * every part of it not yet decided. Nobody else can, not even an OWNER.
   */
  withdrawRequest: (id: string) => void;

  /* ---- Designation and adoption (Flow 5) ----
     As with Flow 4, every rule that decides lives here — dual control,
     who may accept or adopt, what activation checks — and the screens
     render the answer. */

  /** SCR-DSG-01 — a named admin proposes a Kind E designation (FLOW-ORG-02 A1). */
  proposeDesignation: (input: {
    orgId: string;
    entityTypes: OrgKind[];
    legalBasis: string;
    legalRef: string;
  }) => { ok: true; id: string } | { ok: false; error: "not_admin" | "E12" | "exists" | "covered" | "invalid" };
  /** SCR-DSG-02 — a second named admin decides. Never the proposer (E7), never root. Refusing is E12, with a reason. */
  decideDesignation: (
    id: string,
    approve: boolean,
    reason?: string,
  ) => { ok: true } | { ok: false; error: "E6" | "E7" | "not_admin" | "invalid" };
  /** SCR-DSG-02 — the approver asks the proposer for more information. Changes nothing (A1). */
  askForMoreInformation: (id: string, note: string) => { ok: true } | { ok: false; error: "not_admin" | "E7" | "invalid" };
  /**
   * A3 — NDI withdraws a designation that hasn't activated, with a reason:
   * the proposer before approval, any named admin afterwards. Marked
   * WITHDRAWN, never deleted; the authority is told if it had been asked.
   */
  withdrawDesignation: (id: string, reason: string) => { ok: true } | { ok: false; error: "not_admin" | "not_proposer" | "invalid" };
  /** SCR-DSG-03 — the authority's OWNER accepts (A2), granting NDI's access in the same act. Activation runs at once. */
  acceptDesignation: (id: string) => { ok: true; active: boolean } | { ok: false; error: "not_owner" | "E6" | "invalid" };
  /** SCR-DSG-03, Kind N — an OWNER who has accepted grants NDI's access (FLOW-ORG-02 step 2). Activation runs at once. */
  grantNdiAccess: (id: string) => { ok: true; active: boolean } | { ok: false; error: "not_owner" | "invalid" };
  /** SCR-DSG-03 — the authority declines. Nothing is created; NDI is told. */
  declineDesignation: (id: string) => { ok: true } | { ok: false; error: "not_owner" | "invalid" };
  /** SCR-DSG-04 — run the activation checks again. Switches on if all pass. */
  rerunActivation: (id: string) => { ok: true; active: boolean } | { ok: false; error: "not_admin" | "invalid" };
  /** SCR-DSG-04 — NDI grants the missing entitlements (E4 — "NDI grants these"). */
  grantEntitlements: (orgId: string) => void;
  /**
   * NDI's access — one control with two entry points and the same end state
   * (EW-FLOW5-SD §4.4). Off: the members list's Remove (FLOW-ORG-02 E8),
   * "Remove NDI's access" on SCR-DSG-05 or SCR-ADO-04 option A (FLOW-ORG-03
   * A3) — the membership goes and every ACTIVE authorisation under the
   * designation is WITHDRAWN. On: A4 — the OWNER grants again and a new
   * authorisation is written per live entity type.
   */
  setNdiAccess: (designationId: string, on: boolean) => { ok: true } | { ok: false; error: "not_owner" | "invalid" };
  /** Prototype — a member changes the organisation's primary DID (E10 is detected against publishingDid). */
  setPrimaryDid: (orgId: string, did: string) => void;
  /** SCR-ADO-01 — the officer objects (A5), against one entity type or, with `null`, the whole draft. */
  objectToArtefacts: (designationId: string, entityType: OrgKind | null, item: string | null, note: string) => { ok: true } | { ok: false; error: "not_owner" | "invalid" };
  /** SCR-ADO-01 — the officer withdraws their own objection, releasing the hold (A5). */
  withdrawObjection: (objectionId: string) => { ok: true } | { ok: false; error: "not_owner" | "invalid" };
  /** Prototype — NDI revises the draft in answer to an objection: a new draft to review, which closes it (A5). */
  reviseDraft: (objectionId: string) => void;
  /**
   * SCR-ADO-02 — adopt the set for an entity type, as one act. A second
   * adoption for a type already live is a new version (A1), and only when
   * the caller says so; otherwise it is E7, someone else got there first.
   * An open objection holds it (`objection_open`, A5).
   */
  adoptArtefacts: (
    designationId: string,
    entityType: OrgKind,
    newVersion: boolean,
  ) => { ok: true; version: number } | { ok: false; error: "E1" | "E5" | "E7" | "objection_open" | "not_owner" | "invalid" };
  /** SCR-ADO-04 Option B — stop an entity type (A2): its adoption set and authorisation. Nothing is un-verified. */
  stopEntityType: (designationId: string, entityType: OrgKind) => { ok: true } | { ok: false; error: "not_owner" };

  /* ---- Receiving a credential (Flow 6) ----
     The holder's side (FLOW-CRD-01, -02) and the issuer's (FLOW-CRD-03).
     Every precondition and who-may is decided here; the screens render. */

  /** Whether the person driving may run an operation for an organisation (P2). */
  mayOperate: (orgId: string, op: "credential:receive" | "credential:accept" | "credential:list", credentialType?: string) => boolean;
  /** SCR-CRD-02 — one consent: share the prerequisite whole, and ask. P1–P5. */
  askForCredential: (
    offeringId: string,
  ) => { ok: true; id: string } | { ok: false; error: "E1" | "E2" | "E3" | "E4" | "E5" | "E5_held" | "not_eligible" };
  /** The organisation's agent presents the prerequisite; the issuer verifies it (steps 4–8). Simulated. */
  deliverPrerequisite: (requestId: string) => void;
  /** Prototype — the issuer's proof request asks for more than the consent (A1). Only before anything is presented. */
  simulateAskForMore: (requestId: string) => void;
  /** SCR-CRD-06 — share the wider prerequisite too, or don't (and the request is withdrawn). */
  answerAskForMore: (requestId: string, share: boolean) => void;
  /** SCR-CRD-03 — withdraw before an offer arrives (A2). */
  withdrawCredentialRequest: (requestId: string) => void;
  /** SCR-CRD-09 — the issuer's officer issues. E10 if someone already answered. */
  issueOnRequest: (
    requestId: string,
    attributes: CredentialAttribute[],
  ) => { ok: true } | { ok: false; error: "E7" | "E10" | "not_issuer" | "with_system" };
  /** SCR-CRD-09 — decline, with a reason code and a message the business reads verbatim (A1). */
  declineOnRequest: (
    requestId: string,
    code: string,
    message: string,
  ) => { ok: true } | { ok: false; error: "E7" | "E10" | "not_issuer" | "with_system" };
  /**
   * SCR-CRD-04 — accept what arrived: an offer answering a request
   * (FLOW-CRD-01 step 11) or one sent unasked (FLOW-CRD-02 step 4), by the
   * request's or the inbox item's id. C2 is run again first (E19 / E9).
   */
  acceptCredentialOffer: (
    id: string,
  ) => { ok: true } | { ok: false; error: "not_permitted" | "E13" | "E19_delisted" | "E19_unreachable" | "invalid" };
  /** SCR-CRD-04 — decline it (FLOW-CRD-01 A3, FLOW-CRD-02 A1). Nothing is added. */
  declineCredentialOffer: (id: string) => void;
  /** Prototype — what re-running C2 at acceptance will find: the issuer delisted, or NDI's list out of reach (E19). */
  simulateIssuerRecheck: (id: string, outcome: "delisted" | "unreachable") => void;
  /** SCR-CRD-07 — pause, resume or retire an offering, or publish a new version of it. */
  setOfferingStatus: (offeringId: string, status: "ACTIVE" | "PAUSED" | "RETIRED") => void;
  publishOfferingVersion: (offeringId: string, changes: { uses: string[]; answerWindowDays: number; renewable: boolean }) => void;
  /** SCR-CRD-10 — the integration lead's settings. */
  setWebhook: (url: string) => void;
  rotateSecret: () => void;
  createClient: (name: string) => void;
  setQueueFallback: (on: boolean) => void;
  sendTestEvent: () => void;
  /** Prototype — SCR-CRD-10's dashed stand-in: what the simulated system does with the next request (A2, E6). */
  setSystemNextAnswer: (next: IssuerIntegration["nextAnswer"]) => void;
  /** Prototype — SCR-CRD-09's dashed stand-in: the system answers a request an officer has open, so the first answer wins (E10). */
  simulateSystemAnswer: (requestId: string) => void;

  /* ---- Demo harness ----
     Not product surface. These drive the persona switcher, the story runner
     and the state switcher, which are what make the demo runnable by someone
     who is not the person who built it. */

  /** Switch who the console is being driven as. */
  setPersona: (persona: PersonId) => void;
  /** Jump the story to an act. 0 means "not started". */
  setAct: (act: number) => void;
  setRunnerOpen: (open: boolean) => void;
  /** Force one screen into one of its states, for review. */
  setStateOverride: (screen: string, state: string | null) => void;
  /** The deployment's self-service sign-up setting, switched for the demo. */
  setSelfServiceSignup: (on: boolean) => void;
  /** Move the guided demo to a step, or stop it with null. */
  setGuideStep: (step: number | null) => void;
  clearStateOverrides: () => void;

  /** Back to the platform's day zero (see FRESH), and the saved demo cleared. */
  resetDemo: () => void;
  /** False until the persisted state has been read, so lists can hold still. */
  hydrated: boolean;
}

/** Read-only lookups computed from state rather than stored in it. */
interface DemoDerived {
  /** The person the console is currently being driven as. */
  currentPerson: Person;
  /** Resolves an id to a person for dual attribution. Never fails. */
  personById: (id: string) => Person;
  /**
   * The entity types whose authority is connected — FLOW-ORG-01 P3, which
   * the server derives and the screen only renders. Empty on day zero:
   * until NDI has a platform administrator nobody has designated any
   * authority (that designation is FLOW-ORG-02's, and the demo folds it into
   * the platform being opened).
   */
  connectedKinds: OrgKind[];
}

type DemoContextValue = DemoState & DemoActions & DemoDerived;

const DemoContext = createContext<DemoContextValue | null>(null);

/**
 * The demo's single source of truth.
 *
 * State starts as the seed on both server and client so the first client
 * render matches the server's HTML; anything the visitor did in a previous
 * session is read from localStorage in an effect and swapped in afterwards.
 * Doing it the other way — reading storage during render — is the classic
 * hydration mismatch.
 */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(FRESH);
  const [hydrated, setHydrated] = useState(false);

  /* The actions memo is deliberately state-free so its callbacks stay stable,
     which leaves an action that has to *read* state with nowhere to read it
     from. A ref updated on every render is that place.

     Doing this inside a setState updater instead would be a real bug rather
     than a style choice: reactStrictMode is on, React invokes updaters twice
     in development, and a verification that derived its decision in there
     would record two of them per run. */
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { seedVersion?: number; state?: Partial<DemoState> };
        /* Merged over the seed rather than replacing it, so a state saved by an
           older build that lacks a newer collection still loads. A save with
           no version, or another version, predates a correction — see
           SEED_VERSION — and is dropped. */
        if (saved.seedVersion === SEED_VERSION && saved.state) {
          setState({ ...SEED, ...saved.state });
        }
      }
    } catch {
      /* Corrupt or unavailable storage just means the demo starts fresh. */
    }
    setHydrated(true);
  }, []);

  /* A proposal whose 30 days have run out lapses (see accEnding), on load
     and whenever state changes. Here rather than in each screen so every
     list, count and duplicate check agrees: the queue's "Review
     accreditations", the admin list and the E10 check all read the moved
     row. Returns the same state when nothing has run out, so it settles.

     It is the only thing a date ends any more (D20). It used to move three
     other windows on too — acceptance, listing and a recommendation, the
     last one back to IN_REVIEW — and each needed its own state and copy. */
  useEffect(() => {
    if (!hydrated) return;
    const now = today();
    if (!state.accreditations.some((a) => accEnding(a, now))) return;
    setState((s) => ({
      ...s,
      accreditations: s.accreditations.map((a) => {
        const ending = accEnding(a, now);
        return ending ? { ...a, state: ending } : a;
      }),
    }));
  }, [state.accreditations, hydrated]);

  /* FLOW-ORG-02 E13 and E6 — a proposal nobody approved, or a designation
     nobody accepted, in 30 days expires on its date, for every screen at
     once, with the reason that says which window ran out. It used to expire
     only when someone pressed Accept, so until then the list said "0 days
     left" and "Propose again" returned `exists`. The proposer is told of a
     lapsed proposal (E13): it is NDI's lapse, not the authority's. */
  useEffect(() => {
    if (!hydrated) return;
    const now = today();
    if (!state.designations.some((d) => dsgExpired(d, now))) return;
    setState((s) => {
      const lapsed = s.designations.filter((d) => d.state === "PROPOSED" && dsgExpired(d, now));
      return {
        ...s,
        designations: s.designations.map((d) =>
          dsgExpired(d, now)
            ? { ...d, state: "EXPIRED" as const, expiredReason: d.state === "PROPOSED" ? ("NOT_APPROVED" as const) : ("NOT_ACCEPTED" as const) }
            : d,
        ),
        activity: [
          ...lapsed.map((d) => ({ id: rid("a"), text: `The proposal for ${d.orgName} lapsed without a decision`, at: now, orgId: NDI_ORG })),
          ...s.activity,
        ].slice(0, 20),
      };
    });
  }, [state.designations, hydrated]);

  /* FLOW-CRD-01 E10/E13, FLOW-CRD-03 E4 — a request whose date has passed
     ends on that date (see crdEnding), for the lists, the inbox and the
     store's own checks at once. */
  useEffect(() => {
    if (!hydrated) return;
    const now = today();
    if (!state.credentialRequests.some((r) => crdEnding(r, now))) return;
    setState((s) => ({
      ...s,
      credentialRequests: s.credentialRequests.map((r) => {
        const ending = crdEnding(r, now);
        return ending ? { ...r, state: ending.state, failReason: ending.failReason, consentBy: null } : r;
      }),
    }));
  }, [state.credentialRequests, hydrated]);

  /* FLOW-PRS-02 E6 — a request nobody decided within its seven days
     expires on its date, for every list and every check at once; a share
     still waiting for an approver lapses with it. */
  useEffect(() => {
    if (!hydrated) return;
    const now = today();
    if (!state.presentationRequests.some((r) => sharing.statusOf(r, now) !== r.status)) return;
    setState((s) => {
      const ending = new Set(s.presentationRequests.filter((r) => sharing.statusOf(r, now) !== r.status).map((r) => r.id));
      return {
        ...s,
        presentationRequests: s.presentationRequests.map((r) => (ending.has(r.id) ? { ...r, status: "EXPIRED" as const } : r)),
        parkedOperations: s.parkedOperations.map((p) =>
          p.operation === "proof:present" && p.state === "parked" && p.targetId && ending.has(p.targetId)
            ? { ...p, state: "expired" as const, decisionReason: "Nobody decided this before it expired." }
            : p,
        ),
      };
    });
  }, [state.presentationRequests, hydrated]);

  /* FLOW-CRD-02 E4 — an offer sent unasked that nobody accepted in 30 days
     lapses on its date, the same way. */
  useEffect(() => {
    if (!hydrated) return;
    const now = today();
    if (!state.offers.some((o) => o.state === "pending" && o.expiresAt < now)) return;
    setState((s) => ({
      ...s,
      offers: s.offers.map((o) => (o.state === "pending" && o.expiresAt < now ? { ...o, state: "expired" as const } : o)),
    }));
  }, [state.offers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ seedVersion: SEED_VERSION, state }));
    } catch {
      /* Over quota or private mode — the demo still works for this session. */
    }
  }, [state, hydrated]);

  /* FLOW-CRD-03 steps 5–7, Kind A: the issuer's system answers a delivered
     request a moment later. There's no server to do it, so a timer does —
     here rather than on a screen, because the system answers whoever is
     looking and wherever they are. Simulated; on the what's-real page. */
  const awaitingSystem = state.credentialRequests
    .filter((r) => r.state === "WITH_ISSUER" && r.system?.state === "WAITING")
    .map((r) => r.id)
    .join("|");
  useEffect(() => {
    if (!hydrated || !awaitingSystem) return;
    const t = window.setTimeout(
      () => setState((s) => awaitingSystem.split("|").reduce((next, id) => systemAnswers(next, id), s)),
      SYSTEM_ANSWER_MS,
    );
    return () => window.clearTimeout(t);
  }, [awaitingSystem, hydrated]);

  /* Each entry belongs to the organisation it happened in — the one being
     worked in, unless the caller names another. The feed on a dashboard is
     that organisation's history, and without the tag root inviting an
     administrator turned up in Pelden's "Recent activity". */
  const log = useCallback(
    (text: string, orgId?: string) =>
      setState((s) => ({
        ...s,
        activity: [{ id: rid("a"), text, at: today(), orgId: orgId ?? s.activeOrgId }, ...s.activity].slice(0, 20),
      })),
    [],
  );

  /* FLOW-PRS-01 A3 — a website request left undecided: on *Keep for later*,
     or after ten minutes OPEN. Those who may answer are told once, except
     the person who started on it (UX-EW-04 §3.5). */
  const tellUndecided = useCallback(
    (s0: DemoState, r: PresentationRequest, starter: PersonId | null) => {
      const orgId = r.orgId ?? PELDEN;
      const to = sharing.answerersFor(s0, r).filter((id) => id !== starter);
      setState((s) => ({
        ...s,
        presentationRequests: s.presentationRequests.map((x) => (x.id === r.id ? { ...x, undecidedToldAt: x.undecidedToldAt ?? today() } : x)),
      }));
      if (!to.length || r.undecidedToldAt) return;
      const name = s0.people.find((p) => p.id === starter)?.name ?? "Someone";
      log(
        `To ${namesOf(to.map((id) => s0.people.find((p) => p.id === id)?.name ?? id))}: ${NOTICE.undecided(r.verifierName, orgNameOf(s0, orgId), name, r.expiresAt)}`,
        orgId,
      );
    },
    [log],
  );

  const actions = useMemo<DemoActions>(
    () => ({
      hydrated,

      addSchema: ({ name, version, ledger, attributes }) => {
        const schema: Schema = {
          id: `schema:bhutan:2:${name.replace(/\s+/g, "")}:${version}`,
          name,
          version,
          ledger,
          issuerDid: SEED.dids[0].id,
          attributes,
          createdAt: today(),
        };
        setState((s) => ({ ...s, schemas: [schema, ...s.schemas] }));
        log(`Schema ${name} v${version} created`);
        return schema;
      },

      addCredDef: ({ schemaId, tag, revocable }) => {
        const def: CredDef = {
          id: `creddef:bhutan:3:${tag}`,
          schemaId,
          tag,
          revocable,
          createdAt: today(),
        };
        setState((s) => ({ ...s, credDefs: [def, ...s.credDefs] }));
        log(`Credential definition ${tag} created`);
        return def;
      },

      addDid: ({ method, keyType, alias }) => {
        const did: Did = {
          id: newDidId(method),
          method,
          keyType,
          alias,
          isIssuer: false,
          createdAt: today(),
        };
        setState((s) => ({ ...s, dids: [did, ...s.dids] }));
        log(`DID created (${method})`);
        return did;
      },

      setIssuerDid: (id) => {
        setState((s) => ({
          ...s,
          dids: s.dids.map((d) => ({ ...d, isIssuer: d.id === id })),
        }));
        log("Issuing DID changed");
      },

      removeDid: (id) => setState((s) => ({ ...s, dids: s.dids.filter((d) => d.id !== id) })),

      issueCredentials: ({ holders, schemaName, credDefTag, method }) => {
        const created: Credential[] = holders.map((holder) => ({
          id: rid("cred"),
          holder,
          schemaName,
          credDefTag,
          state: "offered",
          issuedAt: today(),
          method,
        }));
        setState((s) => ({ ...s, credentials: [...created, ...s.credentials] }));
        log(
          holders.length === 1
            ? `Credential offered to ${holders[0]}`
            : `${holders.length} credentials offered`,
        );
        return created;
      },

      setCredentialState: (id, state) => {
        setState((s) => ({
          ...s,
          credentials: s.credentials.map((c) => (c.id === id ? { ...c, state } : c)),
        }));
        log(`Credential ${state}`);
      },

      addVerification: ({ holder, schemaName }) => {
        const v: Verification = {
          id: rid("ver"),
          holder,
          schemaName,
          state: "requested",
          requestedAt: today(),
        };
        setState((s) => ({ ...s, verifications: [v, ...s.verifications] }));
        log(`Presentation requested from ${holder}`);
        return v;
      },

      setVerificationState: (id, state) => {
        setState((s) => ({
          ...s,
          verifications: s.verifications.map((v) => (v.id === id ? { ...v, state } : v)),
        }));
        log(`Presentation ${state}`);
      },

      addConnection: (label) => {
        const c: Connection = { id: rid("c"), label, status: "invited", createdAt: today() };
        setState((s) => ({ ...s, connections: [c, ...s.connections] }));
        log(`Connection invited: ${label}`);
        return c;
      },

      addOrganization: ({ name, description, website, location, visibility }) => {
        const org: Organization = {
          id: rid("org"),
          name,
          description,
          role: "Owner",
          members: 1,
          createdAt: today(),
          website,
          location,
          visibility,
          capabilities: [],
          memberIds: [],
        };
        /* A newly created organization becomes the one you are working in —
           anything else means creating it and then having to go and find it. */
        setState((s) => ({
          ...s,
          organizations: [org, ...s.organizations],
          activeOrgId: org.id,
        }));
        log(`Organization ${name} created`);
        return org;
      },

      updateOrganization: (id, patch) => {
        setState((s) => ({
          ...s,
          organizations: s.organizations.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }));
        log("Organization profile updated");
      },

      /* The ledger in this demo belongs to the organization you are working
         in — it is not scoped per organization the way a real deployment
         would be. So deleting one takes its schemas, definitions, ledger and
         connections with it, which is what the reference's cascade does and
         what the confirmation screen counts up. Reset restores the seed. */
      deleteOrganization: (id) =>
        setState((s) => {
          const organizations = s.organizations.filter((o) => o.id !== id);
          return {
            ...s,
            organizations,
            activeOrgId: organizations[0]?.id ?? "",
            schemas: [],
            credDefs: [],
            credentials: [],
            verifications: [],
            connections: [],
            bulkUploads: [],
            bulkRecords: [],
            members: s.members.filter((m) => m.role === "Owner"),
            activity: [
              { id: rid("a"), text: "Organization deleted", at: today() },
              ...s.activity,
            ].slice(0, 20),
          };
        }),

      setActiveOrg: (id) => {
        setState((s) => ({ ...s, activeOrgId: id }));
      },

      respondToEcosystemInvitation: (id, state) => {
        setState((s) => ({
          ...s,
          ecosystemInvitations: s.ecosystemInvitations.map((i) =>
            i.id === id ? { ...i, state } : i,
          ),
        }));
        log(`Ecosystem invitation ${state}`);
      },

      inviteMember: ({ email, role }) => {
        const m: Member = {
          id: rid("m"),
          name: email.split("@")[0].replace(/[._]/g, " "),
          email,
          role,
          status: "invited",
          joinedAt: today(),
        };
        setState((s) => ({ ...s, members: [...s.members, m] }));
        log(`${email} invited as ${role}`);
        return m;
      },

      removeMember: (id) => setState((s) => ({ ...s, members: s.members.filter((m) => m.id !== id) })),

      addCertificate: ({ commonName, keyType, expires }) => {
        const cert: Certificate = {
          id: rid("x509"),
          commonName,
          keyType,
          validFrom: today(),
          expires,
          status: "valid",
        };
        setState((s) => ({ ...s, certificates: [cert, ...s.certificates] }));
        log(`Certificate added for ${commonName}`);
        return cert;
      },

      removeCertificate: (id) =>
        setState((s) => ({ ...s, certificates: s.certificates.filter((c) => c.id !== id) })),

      respondToInvitation: (id, state) => {
        setState((s) => ({
          ...s,
          invitations: s.invitations.map((i) => (i.id === id ? { ...i, state } : i)),
        }));
        log(`Invitation ${state}`);
      },

      addEcosystem: (name) => {
        const eco: Ecosystem = { id: rid("eco"), name, role: "Lead", members: 1, joinedAt: today() };
        setState((s) => ({ ...s, ecosystems: [eco, ...s.ecosystems] }));
        log(`Ecosystem ${name} created`);
        return eco;
      },

      inviteEcosystemMember: (organization) => {
        setState((s) => ({
          ...s,
          ecosystemMembers: [
            ...s.ecosystemMembers,
            {
              id: rid("em"),
              organization,
              role: "Issuer",
              joinedAt: today(),
              status: "invited",
            },
          ],
        }));
        log(`${organization} invited to the ecosystem`);
      },

      addBulkUpload: ({ fileName, records }) => {
        /* A demo upload that always succeeds teaches nothing about the failure
           report, so a small share of rows fail the way real ones do. */
        const failed = Math.min(records, Math.round(records * 0.02));
        const upload: BulkUpload = {
          id: rid("bulk"),
          fileName,
          records,
          succeeded: records - failed,
          failed,
          status: failed > 0 ? "partial" : "completed",
          uploadedAt: today(),
        };
        setState((s) => ({ ...s, bulkUploads: [upload, ...s.bulkUploads] }));
        log(`Bulk upload ${fileName} ${upload.status}`);
        return upload;
      },

      addApiKey: (label) => {
        setState((s) => ({
          ...s,
          apiKeys: [
            {
              id: rid("key"),
              label,
              masked: `ndi_live_••••••••${Math.random().toString(16).slice(2, 6)}`,
              createdAt: today(),
              lastUsed: "—",
              status: "active",
            },
            ...s.apiKeys,
          ],
        }));
        log(`API key ${label} created`);
      },

      revokeApiKey: (id) =>
        setState((s) => ({
          ...s,
          apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)),
        })),

      addRelation: ({ personId, legalBasis, instrumentFileName, instrumentReference }) => {
        const relation: ControllershipRelation = {
          id: rid("rel"),
          personId,
          legalBasis,
          instrument: instrumentFileName
            ? {
                fileName: instrumentFileName,
                /* The instrument itself is never stored — only a hash and a
                   reference to wherever the signed original lives. In a demo
                   the hash is decorative, but the shape has to be right or
                   the screen teaches the wrong model. */
                hash: `sha256:${Math.random().toString(16).slice(2, 10)}${Math.random()
                  .toString(16)
                  .slice(2, 10)}`,
                reference: instrumentReference || "—",
              }
            : null,
          scope: {
            version: 1,
            validFrom: today(),
            validUntil: null,
            grants: [],
          },
          state: "DRAFT",
          isRootAuthority: false,
          createdAt: today(),
          acceptedAt: null,
          activatedAt: null,
        };
        setState((s) => ({ ...s, relations: [relation, ...s.relations] }));
        return relation;
      },

      updateRelationScope: (id, scope) =>
        setState((s) => ({
          ...s,
          relations: s.relations.map((r) =>
            r.id === id
              ? {
                  ...r,
                  /* A new version on every save, because an audit row cites
                     the version it matched and two different scopes sharing a
                     number would make the trail unreadable. */
                  scope: { ...scope, version: r.scope.version + 1 },
                }
              : r,
          ),
        })),

      sendRelationForAcceptance: (id) =>
        setState((s) => ({
          ...s,
          relations: s.relations.map((r) =>
            r.id === id ? { ...r, state: "PENDING_ACCEPTANCE" } : r,
          ),
        })),

      confirmIdentity: (personId) =>
        setState((s) => ({ ...s, people: s.people.map((p) => (p.id === personId ? anchored(p) : p)) })),

      acceptRelation: (id) =>
        setState((s) => {
          const relation = s.relations.find((r) => r.id === id);
          if (!relation) return s;
          const person = s.people.find((p) => p.id === relation.personId);
          /* Nobody acts for the entity without a confirmed identity. The
             screen asks for the wallet proof first, but the refusal is here,
             because the screen is not the boundary. */
          if (!person?.cidVerified) return s;
          return {
            ...s,
            activity: [
              { id: rid("a"), text: `${person.name} accepted the duties of a controller`, at: today(), orgId: relation.orgId ?? PELDEN },
              ...s.activity,
            ].slice(0, 20),
            relations: s.relations.map((r) =>
              r.id === id
                ? { ...r, state: "ACTIVE", acceptedAt: today(), activatedAt: today() }
                : r,
            ),
            auditEntries: appendAudit(s, {
              operation: "relation:accept",
              summary: `${person?.name ?? "A controller"} accepted the duties of a controller`,
              actorId: relation.personId,
              relationId: relation.id,
              scopeVersion: relation.scope.version,
            }),
          };
        }),

      acceptResponsibility: (orgId) => {
        const s0 = stateRef.current;
        const root = s0.relations.find((r) => inOrg(orgId)(r) && r.isRootAuthority);
        /* Only the person the authority named. The screen shows anyone else
           the reason instead of the control, but this is the boundary. */
        if (!root || root.personId !== s0.harness.persona) return { ok: false, error: "E3" };
        if (!s0.organizations.find((o) => o.id === orgId)?.capabilities.includes("holder")) return { ok: false, error: "E4" };
        setState((s) => ({
          ...s,
          responsibilities: [
            ...s.responsibilities.filter((r) => r.orgId !== orgId),
            { orgId, state: "ACCEPTED", at: today() },
          ],
          relations: s.relations.map((r) =>
            r.id === root.id ? { ...r, state: "ACTIVE", acceptedAt: today(), activatedAt: today() } : r,
          ),
        }));
        return { ok: true };
      },

      declineResponsibility: (orgId) =>
        setState((s) => ({
          ...s,
          responsibilities: [
            ...s.responsibilities.filter((r) => r.orgId !== orgId),
            { orgId, state: "DECLINED", at: today() },
          ],
        })),

      appoint: ({ personId, presets, shareReach, shareWith, shareNeedsApproval, issueNeedsApproval, validUntil, document }) => {
        const s0 = stateRef.current;
        const orgId = s0.activeOrgId;
        const root = s0.relations.find((r) => inOrg(orgId)(r) && r.isRootAuthority && r.state === "ACTIVE");
        /* DEL-01/P1: the representative, and nobody else, appoints. */
        if (!root || root.personId !== s0.harness.persona) return { ok: false, error: "E1" };
        /* DEL-01/P3: one appointment per person per organisation at a time —
           E3 if they can already act, E14 if one is waiting for them. */
        const held = appointmentHeld(s0.relations, orgId, personId, today());
        if (held) return { ok: false, error: held };
        /* DEL-01/E16: an end date has to be after today. The date picker
           offers nothing earlier; this is the boundary for a direct call. */
        if (validUntil !== null && validUntil <= today()) return { ok: false, error: "E16" };
        /* DEL-01/E13: at least one preset. The screen disables the button;
           this is the boundary. */
        const ticked = presets.filter((p, i) => presets.indexOf(p) === i);
        if (ticked.length === 0) return { ok: false, error: "E13" };
        /* DEL-01/E12: a named reach names someone, and only organisations
           holding an ACTIVE verifier source (EW-FLOW3-SD v0.3 §4.2). */
        const named = ticked.includes("share") && shareReach === "named";
        const verifiers = shareTargets(s0.organizations, orgId);
        if (named && (shareWith.length === 0 || shareWith.some((t) => !verifiers.includes(t))))
          return { ok: false, error: "E12" };
        const choice = {
          presets: ticked,
          shareReach,
          shareWith: named ? shareWith : [],
          shareNeedsApproval,
          issueNeedsApproval,
        };
        const id = rid("rel");
        const now = today();
        const person = s0.people.find((p) => p.id === personId);
        setState((s) => ({
          ...s,
          relations: [
            {
              id,
              orgId,
              personId,
              legalBasis: "entity_consent",
              instrument: null,
              scope: scopeFor(choice, now, validUntil),
              state: "PENDING_ACCEPTANCE",
              isRootAuthority: false,
              createdAt: now,
              acceptedAt: null,
              activatedAt: null,
              presets: ticked,
              shareReach: ticked.includes("share") ? shareReach : undefined,
              shareNeedsApproval: ticked.includes("share") ? shareNeedsApproval : undefined,
              issueNeedsApproval: ticked.includes("give_authority") ? issueNeedsApproval : undefined,
              attestation: { attestedBy: s.harness.persona, attestedAt: now },
              document,
              expiresAt: inDays(14),
              verifiedName: null,
            },
            ...s.relations,
          ],
          activity: [
            { id: rid("a"), text: `${person?.name ?? "A member"} appointed, waiting for them to accept`, at: now, orgId },
            ...s.activity,
          ].slice(0, 20),
        }));
        return { ok: true, id };
      },

      acceptAppointment: (id, answeredAs) => {
        const s0 = stateRef.current;
        const r = s0.relations.find((x) => x.id === id);
        /* Withdrawal and acceptance are serialised on the relation: whichever
           commits first stands (EW-FLOW3-SD §5.1). Withdrawn, declined or
           already accepted, it is no longer there to accept. */
        if (!r || r.state !== "PENDING_ACCEPTANCE") return { ok: false, error: "E15" };
        if (r.expiresAt && r.expiresAt < today()) return { ok: false, error: "E4" };
        /* The wallet answered as somebody else. Deliberately not explained —
           to the person presenting, or to the representative (E7). */
        if (answeredAs !== r.personId) return { ok: false, error: "E7" };
        /* Step 8 re-checks P1–P4 at the moment of activation (AC-09). The
           representative who made it must still be the representative (E9),
           and the organisation must still be able to hold credentials (E8).
           Either way the appointment never authorised anything, so it ends
           as EXPIRED, reason BASIS_LOST — not activated and then undone. */
        const orgId = r.orgId ?? PELDEN;
        const rootActive = s0.relations.some((x) => inOrg(orgId)(x) && x.isRootAuthority && x.state === "ACTIVE");
        const holder = s0.organizations.find((o) => o.id === orgId)?.capabilities.includes("holder");
        if (!rootActive || !holder) {
          setState((s) => ({
            ...s,
            relations: s.relations.map((x) =>
              x.id === id && x.state === "PENDING_ACCEPTANCE" ? { ...x, state: "EXPIRED", expiryReason: "BASIS_LOST" } : x,
            ),
          }));
          return { ok: false, error: !rootActive ? "E9" : "E8" };
        }
        const person = s0.people.find((p) => p.id === r.personId);
        setState((s) => ({
          ...s,
          /* The one scan anchors them too: an appointee who joined by
             invitation is confirmed here (FLOW-ONB-02 §7.3). */
          people: s.people.map((p) => (p.id === r.personId ? anchored(p) : p)),
          relations: s.relations.map((x) =>
            x.id === id
              ? { ...x, state: "ACTIVE", acceptedAt: today(), activatedAt: today(), verifiedName: person?.name ?? null }
              : x,
          ),
          activity: [
            { id: rid("a"), text: `${person?.name ?? "The appointee"} accepted their appointment`, at: today(), orgId },
            ...s.activity,
          ].slice(0, 20),
        }));
        return { ok: true };
      },

      declineAppointment: (id) =>
        setState((s) => ({
          ...s,
          /* EXPIRED with reason DECLINED (EW-FLOW3-SD §5.1), not TERMINATED:
             termination ends authority someone held, which is flow 12's, and
             a declined appointment never authorised anything. */
          relations: s.relations.map((r) =>
            r.id === id && r.state === "PENDING_ACCEPTANCE" ? { ...r, state: "EXPIRED", expiryReason: "DECLINED" } : r,
          ),
        })),

      withdrawAppointment: (id) => {
        const s0 = stateRef.current;
        const r = s0.relations.find((x) => x.id === id);
        const orgId = r?.orgId ?? PELDEN;
        const root = s0.relations.find((x) => inOrg(orgId)(x) && x.isRootAuthority && x.state === "ACTIVE");
        /* Only the representative, who made it (EW-FLOW3-SD/D19). */
        if (!root || root.personId !== s0.harness.persona) return { ok: false, error: "E1" };
        /* Serialised with acceptance: if the appointee's answer committed
           first it stands, and an ACTIVE relation is ended only by flow 12.
           A lapsed one has nothing left to withdraw. */
        if (!r || r.state !== "PENDING_ACCEPTANCE" || (r.expiresAt && r.expiresAt < today()))
          return { ok: false, error: "not_pending" };
        const person = s0.people.find((p) => p.id === r.personId);
        const rep = s0.people.find((p) => p.id === root.personId);
        setState((s) => ({
          ...s,
          /* EXPIRED frees the member at once (AC-13): standsNow no longer
             counts it, so they can be appointed again straight away. The
             appointee is told by what their appointment now says. */
          relations: s.relations.map((x) =>
            x.id === id && x.state === "PENDING_ACCEPTANCE" ? { ...x, state: "EXPIRED", expiryReason: "WITHDRAWN" } : x,
          ),
          activity: [
            {
              id: rid("a"),
              text: `${rep?.name ?? "The representative"} withdrew ${person?.name ?? "a member"}'s appointment`,
              at: today(),
              orgId,
            },
            ...s.activity,
          ].slice(0, 20),
        }));
        return { ok: true };
      },

      declineRelation: (id, reason) =>
        setState((s) => ({
          ...s,
          /* Declining ends the relation rather than parking it. There is no
             DECLINED state in the lifecycle and inventing one would be wrong:
             a relation the proposed controller refused is over, and the Owner
             starts a new one. The reason is what makes that legible. */
          relations: s.relations.map((r) =>
            r.id === id ? { ...r, state: "TERMINATED", endedReason: reason } : r,
          ),
        })),

      approveOperation: (id, method) => {
        const s0 = stateRef.current;
        /* A share is approved on SCR-PRS-04, with its own re-checks and
           outcomes (approveShare). Everything else parks as it always did. */
        if (s0.parkedOperations.find((p) => p.id === id)?.operation === "proof:present") {
          const persona = s0.harness.persona;
          setState((s) => approveShare(s, id, persona, method).next);
          approveShare(s0, id, persona, method).notes.forEach((n) => log(n.text, n.orgId));
          return;
        }
        setState((s) => {
          const operation = s.parkedOperations.find((p) => p.id === id);
          if (!operation) return s;
          /* An approver never approves their own request (SAD-EW-01 §8.4;
             FLOW-DEL-01 A2) — not even someone holding Approve with Share. */
          if (operation.requestedBy === s.harness.persona) return s;

          /* One signature per approver, and the requester's never counts —
             so dual control always means two people other than the one who
             asked, whatever a saved record already holds. */
          if (operation.signatures.some((g) => g.personId === s.harness.persona)) return s;
          const signatures = [
            ...operation.signatures,
            { personId: s.harness.persona, at: today(), method },
          ];
          const satisfied =
            signatures.filter((g) => g.personId !== operation.requestedBy).length >= operation.requiredSignatures;

          let next: DemoState = {
            ...s,
            parkedOperations: s.parkedOperations.map((p) =>
              p.id === id
                ? { ...p, signatures, state: satisfied ? "approved" : "parked" }
                : p,
            ),
          };

          /* Not satisfied yet: dual control means the next signature comes
             from somebody else, and nothing runs in the meantime. */
          if (!satisfied) return next;

          /* Re-validated at execution time rather than trusting the approval.
             A relation terminated or a scope changed between the approval and
             now must stop the operation — the brief calls this the
             "approved but no longer valid" edge, and a system that quietly
             ran it anyway would be broken in a way nobody could see. */
          const relation = next.relations.find((r) => r.id === operation.relationId);
          if (!relation || relation.state !== "ACTIVE") {
            return {
              ...next,
              parkedOperations: next.parkedOperations.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      state: "stale",
                      invalidatedReason:
                        "The authority behind this operation is no longer active, so it was not run.",
                    }
                  : p,
              ),
            };
          }

          /* Shares were handed to approveShare above, and accepting an offer
             never parks — every preset carries credential:accept AUTO
             (EW-FLOW6-SD §5.3). What is left is a held grant. */
          if (operation.operation === "authority:issue" && operation.heldAuthority) {
            const authority = { ...operation.heldAuthority, issuedAt: today() };
            next = {
              ...next,
              delegatedAuthorities: [authority, ...next.delegatedAuthorities],
              auditEntries: appendAudit(next, {
                operation: "authority:issue",
                summary: `Issued ${authority.title} to ${
                  next.people.find((p) => p.id === authority.recipientId)?.name ?? "a recipient"
                }`,
                actorId: operation.requestedBy,
                relationId: operation.relationId,
                scopeVersion: operation.scopeVersion,
              }),
            };
          }

          return next;
        });
      },

      rejectOperation: (id, reason) => {
        const s0 = stateRef.current;
        if (s0.parkedOperations.find((p) => p.id === id)?.operation === "proof:present") {
          const persona = s0.harness.persona;
          setState((s) => rejectShare(s, id, persona, reason).next);
          rejectShare(s0, id, persona, reason).notes.forEach((n) => log(n.text, n.orgId));
          return;
        }
        setState((s) => {
          const operation = s.parkedOperations.find((p) => p.id === id);
          if (!operation) return s;
          /* Deciding includes refusing: still never one's own (A2). */
          if (operation.requestedBy === s.harness.persona) return s;
          return {
            ...s,
            parkedOperations: s.parkedOperations.map((p) =>
              p.id === id ? { ...p, state: "rejected", decisionReason: reason } : p,
            ),
            /* A held grant simply never goes out; there is nothing
               else to put back. */
          };
        });
      },

      issueAuthority: (input) => {
        /* Only someone whose own appointment carries authority:issue may
           issue — the Root (FLOW-DEL-02) or someone given *Give authority
           to act*. The credential traces back to that person's relation,
           and their grant's approval rule decides whether it goes out now
           or waits for the approver they were told about (FLOW-DEL-01 A1). */
        const s0 = stateRef.current;
        const issuer = s0.relations.find(
          (r) =>
            inOrg(PELDEN)(r) &&
            r.personId === s0.harness.persona &&
            r.state === "ACTIVE" &&
            r.scope.grants.some((g) => g.operation === "authority:issue"),
        );
        if (!issuer) return { status: "refused" };
        const grant = issuer.scope.grants.find((g) => g.operation === "authority:issue");
        const held = grant?.approval !== "AUTO";
        const authority: DelegatedAuthority = {
          id: rid("da"),
          kind: input.kind,
          title: input.title,
          recipientId: input.recipientId,
          parentId: input.parentId,
          relationId: issuer.id,
          taskScopes: input.taskScopes,
          valueCap: input.valueCap,
          counterparties: input.counterparties,
          validFrom: input.validFrom,
          validUntil: input.validUntil,
          status: "ACTIVE",
          acceptance: "sent",
          issuedAt: today(),
          acceptedAt: null,
        };
        const recipientName = s0.people.find((p) => p.id === input.recipientId)?.name ?? "a recipient";
        if (held) {
          /* Nothing reaches the recipient's wallet until it is approved. */
          setState((s) => ({
            ...s,
            parkedOperations: [
              {
                id: rid("park"),
                orgId: PELDEN,
                operation: "authority:issue" as const,
                summary: `Give ${input.title} to ${recipientName}`,
                requestedBy: s.harness.persona,
                relationId: issuer.id,
                scopeVersion: issuer.scope.version,
                targetId: authority.id,
                targetRelyingParty: null,
                payloadHash: `sha256:${Math.random().toString(16).slice(2, 10)}${Math.random()
                  .toString(16)
                  .slice(2, 10)}`,
                policy: "SINGLE_APPROVER" as const,
                requiredSignatures: 1,
                signatures: [],
                state: "parked" as const,
                decisionReason: null,
                createdAt: today(),
                expiresAt: inDays(14),
                heldAuthority: authority,
              },
              ...s.parkedOperations,
            ],
          }));
          return { status: "parked", authority };
        }
        setState((s) => ({
          ...s,
          delegatedAuthorities: [authority, ...s.delegatedAuthorities],
          auditEntries: appendAudit(s, {
            operation: "authority:issue",
            summary: `Issued ${input.title} to ${recipientName}`,
            actorId: s.harness.persona,
            relationId: authority.relationId,
            scopeVersion: issuer.scope.version,
          }),
        }));
        return { status: "issued", authority };
      },

      acceptAuthority: (id) =>
        setState((s) => {
          const authority = s.delegatedAuthorities.find((a) => a.id === id);
          if (!authority) return s;
          const holder = s.people.find((p) => p.id === authority.recipientId);
          return {
            ...s,
            /* Accepting happens in the holder's own NDI Wallet, which is bound
               to their citizen credential — so the acceptance is also the
               proof of who they are. A delegate who joined by invitation is
               confirmed here, the way a controller is confirmed on accepting
               their duties. */
            people: s.people.map((p) => (p.id === authority.recipientId ? anchored(p) : p)),
            activity: [
              { id: rid("a"), text: `${holder?.name ?? "The holder"} accepted ${authority.title}`, at: today(), orgId: PELDEN },
              ...s.activity,
            ].slice(0, 20),
            delegatedAuthorities: s.delegatedAuthorities.map((a) =>
              a.id === id ? { ...a, acceptance: "accepted", acceptedAt: today() } : a,
            ),
            auditEntries: appendAudit(s, {
              operation: "authority:accept",
              summary: `${
                s.people.find((p) => p.id === authority.recipientId)?.name ?? "The holder"
              } accepted ${authority.title}`,
              actorId: authority.recipientId,
              relationId: authority.relationId,
            }),
          };
        }),

      suspendAuthority: (id, reason) =>
        setState((s) => {
          const authority = s.delegatedAuthorities.find((a) => a.id === id);
          if (!authority) return s;
          return {
            ...s,
            delegatedAuthorities: s.delegatedAuthorities.map((a) =>
              a.id === id
                ? { ...a, status: "SUSPENDED", endedAt: today(), endedReason: reason }
                : a,
            ),
            auditEntries: appendAudit(s, {
              operation: "authority:suspend",
              summary: `Suspended ${authority.title}`,
              actorId: s.harness.persona,
              relationId: authority.relationId,
            }),
          };
        }),

      reactivateAuthority: (id) =>
        setState((s) => {
          const authority = s.delegatedAuthorities.find((a) => a.id === id);
          if (!authority) return s;
          return {
            ...s,
            delegatedAuthorities: s.delegatedAuthorities.map((a) =>
              a.id === id ? { ...a, status: "ACTIVE", endedAt: null, endedReason: null } : a,
            ),
            auditEntries: appendAudit(s, {
              operation: "authority:reactivate",
              summary: `Reinstated ${authority.title}`,
              actorId: s.harness.persona,
              relationId: authority.relationId,
            }),
          };
        }),

      revokeAuthority: (id, reason) =>
        setState((s) => {
          const authority = s.delegatedAuthorities.find((a) => a.id === id);
          if (!authority) return s;

          /* Revoking a role does NOT mark its children revoked, and that is
             deliberate rather than an omission. A capability hanging off a
             withdrawn role is still a valid credential in the holder's
             wallet — what has changed is that the chain above it is broken,
             which is what the verification service discovers when it walks
             it. Cascading a status onto the children would hide the very
             mechanism Act 5 exists to show, and would also be a lie about
             what the holder's wallet contains. */
          const reference = `AP-${new Date().getFullYear()}-${Math.floor(
            1000 + Math.random() * 8999,
          )}`;

          return {
            ...s,
            delegatedAuthorities: s.delegatedAuthorities.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: "REVOKED",
                    endedAt: today(),
                    endedReason: reason,
                    appealReference: reference,
                  }
                : a,
            ),
            /* The holder is notified with a reason and an appeal reference.
               Withdrawal without a route to challenge it is the thing the
               appeal right exists to prevent, so the notice is created here
               rather than being something an operator remembers to send. */
            appeals: [
              {
                id: rid("ap"),
                reference,
                subjectId: authority.recipientId,
                againstKind: "authority" as const,
                againstId: authority.id,
                againstTitle: authority.title,
                noticeReason: reason,
                noticeIssuedAt: today(),
                submittedAt: null,
                submission: null,
                state: "notice_issued" as const,
                windowWorkingDays: 10,
                decisionWorkingDays: 5,
                evidence: [],
              },
              ...s.appeals,
            ],
            auditEntries: appendAudit(s, {
              operation: "authority:revoke",
              summary: `Revoked ${authority.title} held by ${
                s.people.find((p) => p.id === authority.recipientId)?.name ?? "the holder"
              }`,
              actorId: s.harness.persona,
              relationId: authority.relationId,
            }),
          };
        }),

      runVerification: (input) => {
        /* Derived from state at the moment of asking, which is the whole
           point of the act: revoking a role a second earlier changes the
           answer. Derived outside the updater, so the same decision is both
           returned and stored exactly once. */
        const decision: VerificationDecision = verifyAuthority(stateRef.current, input);
        setState((s) => ({ ...s, decisions: [decision, ...s.decisions] }));
        return decision;
      },

      submitAppeal: (id, submission) =>
        setState((s) => ({
          ...s,
          appeals: s.appeals.map((a) =>
            a.id === id
              ? { ...a, submittedAt: today(), submission, state: "under_review" }
              : a,
          ),
        })),

      decideAppeal: (id, outcome) =>
        setState((s) => {
          const appeal = s.appeals.find((a) => a.id === id);
          if (!appeal) return s;
          return {
            ...s,
            appeals: s.appeals.map((a) => (a.id === id ? { ...a, state: outcome } : a)),
            /* Upholding an appeal reinstates what was withdrawn. An appeal
               process that concluded in someone's favour and left the
               authority revoked would be a complaints box, not a remedy. */
            delegatedAuthorities:
              outcome === "upheld_reinstated" && appeal.againstKind === "authority"
                ? s.delegatedAuthorities.map((d) =>
                    d.id === appeal.againstId
                      ? { ...d, status: "ACTIVE", endedAt: null, endedReason: null }
                      : d,
                  )
                : s.delegatedAuthorities,
            auditEntries: appendAudit(s, {
              operation: outcome === "upheld_reinstated" ? "appeal:uphold" : "appeal:reject",
              summary:
                outcome === "upheld_reinstated"
                  ? `Upheld appeal ${appeal.reference} — ${appeal.againstTitle} reinstated`
                  : `Rejected appeal ${appeal.reference}`,
              actorId: s.harness.persona,
              relationId: null,
            }),
          };
        }),

      startSignup: (email) =>
        setState((s) => ({
          ...s,
          /* A new sign-up replaces any earlier one: this is one browser, one
             person at a time, and a half-finished session for a different
             address is exactly what "change the address" throws away. The
             return path survives, because an invitee who corrects their
             address is still on their way back to the invitation. A
             finished sign-up's return path is spent, though: carried over,
             it sent the next person in this browser to someone else's
             invitation. */
          signup: {
            email,
            stage: "check_email",
            sends: [Date.now()],
            linkUsed: false,
            name: "",
            memberships: [],
            returnTo: s.signup && s.signup.stage !== "done" ? s.signup.returnTo : null,
            createdAt: null,
          },
        })),

      resendSignupMail: () =>
        setState((s) =>
          s.signup
            ? {
                ...s,
                /* A resend issues a fresh link, so the old one being used is
                   no longer a reason to refuse — E2's "a new token is issued
                   and the old one stays dead". */
                signup: { ...s.signup, sends: [...s.signup.sends, Date.now()], linkUsed: false },
              }
            : s,
        ),

      consumeSignupLink: () => {
        const current = stateRef.current.signup;
        if (!current || current.linkUsed) return false;
        setState((s) =>
          s.signup
            ? { ...s, signup: { ...s.signup, linkUsed: true, stage: "set_password" } }
            : s,
        );
        return true;
      },

      completeSignup: (name) => {
        setState((s) =>
          s.signup
            ? {
                ...s,
                signup: { ...s.signup, name, stage: "done", createdAt: today() },
              }
            : s,
        );
        /* Q5: the creation is recorded with its route. The password is not,
           and never could be — it was never given to this store. */
        log("Account created (self-service)");
      },

      addSignupMembership: (orgId, role) =>
        setState((s) =>
          s.signup && !s.signup.memberships.some((m) => m.orgId === orgId)
            ? { ...s, signup: { ...s.signup, memberships: [...s.signup.memberships, { orgId, role }] } }
            : s,
        ),

      setSignupReturn: (path, email) =>
        setState((s) => ({
          ...s,
          /* An invitation arriving for a different address than the one in
             progress starts a fresh session — the half-finished one belonged
             to someone else. */
          signup:
            s.signup && (!email || s.signup.email === email || s.signup.email === "")
            ? { ...s.signup, returnTo: path, email: email ?? s.signup.email }
            : {
                email: email ?? "",
                stage: "check_email",
                sends: [],
                linkUsed: false,
                name: "",
                memberships: [],
                returnTo: path,
                createdAt: null,
              },
        })),

      clearSignup: () => setState((s) => ({ ...s, signup: null })),

      inviteToOrganisation: ({ email, role }) => {
        const s0 = stateRef.current;
        const inviter = s0.people.find((p) => p.id === s0.harness.persona);
        /* E1 — the screen only offers the form to an owner or admin, but the
           check is here too, because the screen is not the boundary. The
           role is the one held in this organisation. */
        const inviterRole = roleIn(s0.organizations.find((o) => o.id === s0.activeOrgId), inviter);
        if (!inviter || (inviterRole !== "Owner" && inviterRole !== "Admin")) {
          return { ok: false, error: "E1" };
        }
        const address = email.trim().toLowerCase();
        /* E3 — already a member of *this* organisation, or already invited to
           it and not yet answered. A second live invitation to the same
           address would leave two links that each grant membership. Only
           this organisation's membership counts: whether the address holds
           an account anywhere else is never disclosed (S8), and a person may
           belong to several organisations (AC-10). */
        const org = s0.organizations.find((o) => o.id === s0.activeOrgId);
        const member = s0.people.find(
          (p) => p.email.toLowerCase() === address && Boolean(org?.memberIds.includes(p.id)) && p.hasAccount !== false,
        );
        if (member) return { ok: false, error: "E3", member: member.name };
        const waiting = s0.orgInvitations.some(
          (i) =>
            i.kind === "M" &&
            i.orgId === s0.activeOrgId &&
            i.email.toLowerCase() === address &&
            (i.state === "PENDING" || i.state === "PENDING_APPROVAL"),
        );
        if (waiting) return { ok: false, error: "waiting" };
        const id = rid("inv");
        setState((s) => ({
          ...s,
          orgInvitations: [
            {
              id,
              kind: "M",
              email: email.trim(),
              orgId: s.activeOrgId,
              role,
              legalName: null,
              legalIdentity: null,
              purpose: null,
              needsSecondApproval: false,
              invitedBy: s.harness.persona,
              approvedBy: null,
              createdAt: today(),
              sentAt: today(),
              expiresAt: inDays(INVITATION_DAYS.M),
              state: "PENDING",
              delivery: "delivered",
              decidedAt: null,
              acceptedName: null,
            },
            ...s.orgInvitations,
          ],
        }));
        log(`Invitation sent to ${email.trim()} (member)`);
        return { ok: true, id };
      },

      proposeOrganisation: ({ email, legalName, legalIdentity, purpose, needsSecondApproval }) => {
        /* P2, S9: a named platform admin. The root account issues no member
           or agency invitation — refused here as well as hidden on the
           screen, because the screen isn't the boundary (as E13, E14). */
        const proposer = stateRef.current.people.find((p) => p.id === stateRef.current.harness.persona);
        if (proposer?.platformRole !== "admin") {
          if (proposer?.platformRole === "root") log("Control failure — the root account tried to invite an organisation", NDI_ORG);
          return { ok: false, error: "E1" };
        }
        /* P7, E12: a second approval needs a second named admin to give it.
           Refused up front rather than left waiting for nobody. */
        if (needsSecondApproval && activeAdmins(stateRef.current).length < 2) {
          log("Invitation refused — fewer than two administrators to approve it");
          return { ok: false, error: "E12" };
        }
        const id = rid("inv");
        setState((s) => ({
          ...s,
          orgInvitations: [
            {
              id,
              kind: "O",
              email: email.trim(),
              orgId: null,
              role: null,
              legalName,
              legalIdentity,
              purpose,
              needsSecondApproval,
              invitedBy: s.harness.persona,
              approvedBy: null,
              createdAt: today(),
              /* A designation waiting on a second administrator has not been
                 sent, and nothing about it reaches the invitee until it is
                 (AC-04). */
              sentAt: needsSecondApproval ? null : today(),
              expiresAt: needsSecondApproval ? null : inDays(INVITATION_DAYS.O),
              state: needsSecondApproval ? "PENDING_APPROVAL" : "PENDING",
              delivery: needsSecondApproval ? "not_sent" : "delivered",
              decidedAt: null,
              acceptedName: null,
            },
            ...s.orgInvitations,
          ],
        }));
        log(
          needsSecondApproval
            ? `Designation of ${legalName} proposed — awaiting a second administrator`
            : `Invitation sent to ${email.trim()} to register ${legalName}`,
        );
        return { ok: true, id };
      },

      approveInvitation: (id) => {
        const s0 = stateRef.current;
        const inv = s0.orgInvitations.find((i) => i.id === id);
        /* S2: proposer and approver must be distinct principals, and the
           record cannot leave PENDING_APPROVAL while they are the same. The
           screen shows the control disabled with the reason (UXD-03) — this
           is the check that would hold even if it did not. The attempt is
           recorded as a control failure, not silently ignored. */
        /* E13: the root account approves nothing — not even in an
           emergency. SCR-INV-02 isn't offered to it; this holds regardless. */
        if (s0.people.find((p) => p.id === s0.harness.persona)?.platformRole === "root") {
          log("Control failure — the root account tried to approve an invitation", NDI_ORG);
          return { ok: false, error: "E13" };
        }
        if (!inv || inv.invitedBy === s0.harness.persona) {
          log("Control failure — an administrator tried to approve their own invitation", NDI_ORG);
          return { ok: false, error: "E11" };
        }
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id
              ? {
                  ...i,
                  state: "PENDING",
                  approvedBy: s.harness.persona,
                  decidedAt: today(),
                  sentAt: today(),
                  expiresAt: inDays(inv.kind === "A" ? INVITATION_DAYS.A : INVITATION_DAYS.O),
                  delivery: "delivered",
                }
              : i,
          ),
        }));
        log(
          inv.kind === "A"
            ? `Invitation to ${inv.email} as a platform administrator approved and sent`
            : `Designation of ${inv.legalName} approved and sent`,
        );
        return { ok: true };
      },

      refuseInvitation: (id) =>
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id ? { ...i, state: "REFUSED", decidedAt: today(), approvedBy: s.harness.persona } : i,
          ),
        })),

      withdrawInvitation: (id, rootReason) => {
        const s0 = stateRef.current;
        /* The root account may revoke only what it issued, and each use is
           logged as a root-account use, with the reason when one is given
           (S9; the reason is optional since 14 Oct). */
        if (s0.people.find((p) => p.id === s0.harness.persona)?.platformRole === "root") {
          const inv = s0.orgInvitations.find((i) => i.id === id);
          if (!inv || inv.invitedBy !== "root") return;
          log(
            `Root account used — revoked the invitation to ${inv.email}${rootReason?.trim() ? `. Reason: ${rootReason.trim()}` : ""}`,
            NDI_ORG,
          );
        }
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id ? { ...i, state: "REVOKED", decidedAt: today() } : i,
          ),
        }));
      },

      resendInvitation: (id) => {
        const s0 = stateRef.current;
        /* The root account may resend only what it issued, logged as a
           root-account use like every other (S9). */
        if (s0.people.find((p) => p.id === s0.harness.persona)?.platformRole === "root") {
          const inv = s0.orgInvitations.find((i) => i.id === id);
          if (!inv || inv.invitedBy !== "root") return;
          log(`Root account used — resent the invitation to ${inv.email}`, NDI_ORG);
        }
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id ? { ...i, delivery: "delivered", sentAt: today() } : i,
          ),
        }));
      },

      acceptInvitation: (id) => {
        const s0 = stateRef.current;
        const inv = s0.orgInvitations.find((i) => i.id === id);
        if (!inv) return { ok: false, error: "E5" };
        /* Step 8 re-checks everything at acceptance, not only at issue — an
           invitation is not a bearer grant (S4). */
        /* A member invitation runs the one re-check every member acceptance
           shares, and acts on every answer it gives — not only E6, which let a
           declined invitation be accepted once the screen was forced back
           to its default face. */
        if (inv.kind === "M") {
          const refusal = memberInvitationRefusal(s0, inv);
          if (refusal) {
            setState((s) => markRefused(s, id, refusal));
            return { ok: false, error: refusal };
          }
        }
        if (inv.state === "ACCEPTED") return { ok: false, error: "E7" };
        if (
          inv.state === "REVOKED" ||
          inv.state === "REFUSED" ||
          inv.state === "PENDING_APPROVAL" ||
          inv.state === "DECLINED"
        ) {
          return { ok: false, error: "E5" };
        }
        if (inv.state === "EXPIRED" || (inv.expiresAt !== null && inv.expiresAt < today())) {
          return { ok: false, error: "E4" };
        }
        const inviter = s0.people.find((p) => p.id === inv.invitedBy);
        const inviterStillMay =
          inv.kind === "A"
            ? /* Step 8: a root-issued invitation still needs S9 to hold —
                 once two admins are active it is void (E6, AC-16). An
                 admin's needs its inviter still to be one. */
              inviter?.platformRole === "root"
              ? activeAdmins(s0).length < 2
              : isPlatformAdmin(inviter)
            : inv.kind === "W"
              ? isPlatformAdmin(inviter)
              : inv.kind === "O"
                ? Boolean(inviter)
                : memberInvitationRefusal(s0, inv) !== "E6";
        if (!inviterStillMay || inv.state === "VOID") {
          setState((s) => ({
            ...s,
            orgInvitations: s.orgInvitations.map((i) => (i.id === id ? { ...i, state: "VOID" } : i)),
          }));
          return { ok: false, error: "E6" };
        }
        /* The account being made in this browser counts only when it is the
           invited address's — otherwise the owner's own sign-up, still in
           the session, named the colleague who accepted. */
        const account = s0.signup?.email.toLowerCase() === inv.email.toLowerCase() ? s0.signup : null;
        const invitee = s0.people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase());
        const name = account?.name || invitee?.name || "New member";
        if (inv.kind === "A" || inv.kind === "W") {
          /* SCR-INV-04 asks for the person to be signed in as the invited
             address, whatever kind of invitation it is. Only member
             invitations checked it, so an administrator's or an
             organisation's invitation opened while driving as someone else
             — root, Dorji — could be accepted in the invitee's name, and the
             screen then switched the session to them. */
          const hasAccount = Boolean(account) || Boolean(invitee && invitee.hasAccount !== false);
          if (!hasAccount) return { ok: false, error: "no_account" };
          const me = s0.people.find((p) => p.id === s0.harness.persona);
          const signedInAsInvitee = Boolean(account) || me?.email.toLowerCase() === inv.email.toLowerCase();
          if (!signedInAsInvitee) return { ok: false, error: "wrong_person" };
          setState((s) => ({
            ...s,
            orgInvitations: s.orgInvitations.map((i) =>
              i.id === id ? { ...i, state: "ACCEPTED" as const, decidedAt: today(), acceptedName: name } : i,
            ),
            /* A: the person becomes an administrator, and now has the account
               they made on the way here. W: nothing yet — the wallet exists
               only once the register has confirmed them (Flow 2). */
            people:
              inv.kind === "A"
                ? s.people.map((p) =>
                    p.email.toLowerCase() === inv.email.toLowerCase()
                      ? { ...p, platformRole: "admin" as const, hasAccount: true }
                      : p,
                  )
                : s.people,
            /* An administrator joins NDI's own organisation, which is where
               their console is. */
            organizations:
              inv.kind === "A" && invitee
                ? s.organizations.map((o) =>
                    o.id === NDI_ORG && !o.memberIds.includes(invitee.id)
                      ? { ...o, memberIds: [...o.memberIds, invitee.id], members: o.members + 1 }
                      : o,
                  )
                : s.organizations,
          }));
          log(`Invitation accepted by ${name}`);
          return { ok: true };
        }
        if (inv.kind !== "M" || !inv.orgId) {
          setState((s) => ({
            ...s,
            orgInvitations: s.orgInvitations.map((i) =>
              i.id === id ? { ...i, state: "ACCEPTED" as const, decidedAt: today(), acceptedName: name } : i,
            ),
          }));
          log(`Invitation accepted by ${name}`);
          return { ok: true };
        }
        /* Accepting needs an account already held by the invited address,
           and the person signed in as it (SCR-INV-04: "signed in as the
           invited address"). Without these checks a forced face could
           accept for an address with no account — making one with no name
           and no password — or let whoever was signed in accept for someone
           else. An address with no account sets one up instead (setUpMember). */
        const hasAccount = Boolean(account) || Boolean(invitee && invitee.hasAccount !== false);
        if (!hasAccount) return { ok: false, error: "no_account" };
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const signedInAsInvitee =
          Boolean(account) || me?.email.toLowerCase() === inv.email.toLowerCase();
        if (!signedInAsInvitee) return { ok: false, error: "wrong_person" };
        /* Q4: a member at the named role, with no authority to act for the
           entity — see joinOrganisation. */
        const memberId = account && !invitee ? rid("person") : (invitee?.id ?? rid("person"));
        const orgId = inv.orgId;
        setState((s) => {
          const joined = joinOrganisation(s, inv, name, memberId);
          return {
            ...joined,
            signup: joined.signup
              ? {
                  ...joined.signup,
                  memberships: joined.signup.memberships.some((m) => m.orgId === orgId)
                    ? joined.signup.memberships
                    : [...joined.signup.memberships, { orgId, role: inv.role ?? "Member" }],
                }
              : joined.signup,
          };
        });
        return { ok: true };
      },

      setUpMember: (invitationId, nameIn) => {
        const s0 = stateRef.current;
        const inv = s0.orgInvitations.find((i) => i.id === invitationId);
        const name = nameIn.trim();
        if (!name) return { ok: false, error: "invalid" };
        /* The same re-checks as any acceptance (step 8) — the screen showing
           the form is not the boundary. */
        const refusal = memberInvitationRefusal(s0, inv);
        if (refusal || !inv) {
          if (refusal) setState((s) => markRefused(s, invitationId, refusal));
          return { ok: false, error: refusal ?? "E5" };
        }
        /* Setting up is only for an address with no account. One that has an
           account — platform administrators always do — signs in and accepts
           instead, so the two ways in cannot disagree about who may join. */
        const known = s0.people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase());
        if (known && known.hasAccount !== false) return { ok: false, error: "has_account" };
        const personId = known?.id ?? rid("person");
        setState((s) => ({
          ...joinOrganisation(s, inv, name, personId),
          activeOrgId: inv.orgId as string,
          harness: { ...s.harness, persona: personId },
        }));
        return { ok: true, personId };
      },

      declineInvitation: (id) =>
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id ? { ...i, state: "DECLINED", decidedAt: today() } : i,
          ),
        })),

      startOrgOnboarding: (kind, invitationId, existingOrgId) =>
        setState((s) => ({
          ...s,
          orgOnboarding: {
            kind,
            identifier: null,
            stage: "started",
            provedName: null,
            provedPersonId: null,
            authoritativeName: null,
            notify: false,
            invitationId: invitationId ?? null,
            existingOrgId: existingOrgId ?? null,
          },
        })),

      submitIdentifier: (identifier) => {
        const s0 = stateRef.current;
        const ob = s0.orgOnboarding;
        if (!ob) return { ok: false, error: "E3" };
        /* P3 is checked again here, not only on SCR-ORG-01: a type that
           was connected when the page loaded may not be by the time the
           form is sent, and the server is what decides. */
        if (!connectedKinds(s0).includes(ob.kind)) return { ok: false, error: "E1" };
        const id = identifier.trim().toUpperCase();
        /* E3 — already verified here. Recorded for support, refused with a
           message that does not say whether the registration exists. */
        if (REGISTER_RECORDS.some((r) => r.identifier === id && r.verifiedOnPlatform)) {
          return { ok: false, error: "E3" };
        }
        setState((s) =>
          s.orgOnboarding ? { ...s, orgOnboarding: { ...s.orgOnboarding, identifier: id, stage: "proof_requested" } } : s,
        );
        return { ok: true };
      },

      recordIdentityProof: (name, personId) =>
        setState((s) =>
          s.orgOnboarding
            ? { ...s, orgOnboarding: { ...s.orgOnboarding, provedName: name, provedPersonId: personId, stage: "checking" } }
            : s,
        ),

      checkWithAuthority: () => {
        const ob = stateRef.current.orgOnboarding;
        /* The authority's own question, asked of its own records: is this
           person a representative of the entity with this identifier? An
           unknown identifier, a deregistered entity and a person who is not
           a representative all come back as one answer — the authority may
           tell them apart, the platform keeps nothing that could (S6). */
        const record = REGISTER_RECORDS.find((r) => r.identifier === ob?.identifier && r.kind === ob?.kind);
        const approved = Boolean(
          ob?.provedPersonId && record && record.active && record.representatives.includes(ob.provedPersonId),
        );
        setState((s) =>
          s.orgOnboarding
            ? {
                ...s,
                orgOnboarding: {
                  ...s.orgOnboarding,
                  stage: approved ? "setting_up" : "not_confirmed",
                  authoritativeName: approved ? (record?.legalName ?? null) : null,
                },
              }
            : s,
        );
        if (!approved) log("An organisation verification was not confirmed by the authority");
        return approved ? "approved" : "not_confirmed";
      },

      setVerificationNotify: (on) =>
        setState((s) => (s.orgOnboarding ? { ...s, orgOnboarding: { ...s.orgOnboarding, notify: on } } : s)),

      cancelOrgOnboarding: () => setState((s) => ({ ...s, orgOnboarding: null })),

      recordOrgInterest: (kind, email) =>
        setState((s) => ({
          ...s,
          orgInterests: [
            ...s.orgInterests.filter((i) => !(i.kind === kind && i.email === email)),
            { kind, email, recordedAt: today() },
          ],
        })),

      completeOrgOnboarding: () => {
        const s0 = stateRef.current;
        const ob = s0.orgOnboarding;
        if (!ob || ob.stage !== "setting_up") return;
        const inv = s0.orgInvitations.find((i) => i.id === ob.invitationId);
        const existingId = ob.existingOrgId ?? (inv?.kind === "W" ? inv.orgId : null);
        if (existingId) {
          /* Kind E: the organisation already exists — Bank of Bhutan, which
             issues and verifies — and step 9 provisions it rather than
             creating another. It gains the holder capability and its
             registration in its own wallet; the person the authority
             confirmed becomes its root authority. Its issuing and verifying
             are untouched throughout. */
          const orgId = existingId;
          const personId =
            ob.provedPersonId ??
            s0.people.find((p) => p.email.toLowerCase() === inv?.email.toLowerCase())?.id ??
            "yeshey";
          const seedCred = SEED.heldCredentials.find((c) => c.orgId === orgId && c.isFoundational);
          const seedRel = SEED.relations.find((r) => r.orgId === orgId && r.isRootAuthority);
          const now = today();
          setState((s) => ({
            ...s,
            organizations: s.organizations.map((o) =>
              o.id === orgId
                ? { ...o, kind: ob.kind, capabilities: o.capabilities.includes("holder") ? o.capabilities : [...o.capabilities, "holder" as const] }
                : o,
            ),
            heldCredentials: seedCred
              ? [...s.heldCredentials.filter((c) => c.id !== seedCred.id), { ...seedCred, receivedAt: now }]
              : s.heldCredentials,
            relations: seedRel
              ? [
                  ...s.relations.filter((r) => r.id !== seedRel.id),
                  /* Created waiting for the representative to accept
                     responsibility (FLOW-DEL-02 step 1), not in force. */
                  { ...seedRel, personId, state: "PENDING_ACCEPTANCE" as const, createdAt: now, acceptedAt: null, activatedAt: null, scope: { ...seedRel.scope, validFrom: now } },
                ]
              : s.relations,
            responsibilities: [...s.responsibilities.filter((r) => r.orgId !== orgId), { orgId, state: "PENDING", at: now }],
            /* Step 11 writes the account's identity anchor (FLOW-ORG-01 v0.13):
               from here a different wallet is refused with E13. */
            people: s.people.map((p) => (p.id === personId ? anchored(p) : p)),
            harness: { ...s.harness, persona: personId },
            orgOnboarding: s.orgOnboarding ? { ...s.orgOnboarding, stage: "verified" } : s.orgOnboarding,
            activeOrgId: orgId,
          }));
          return;
        }
        /* Lands on Pelden's first day, not on the story's three-months-in
           seed — see firstRunState. Nothing is logged to the activity feed
           for the same reason: nothing has been done in the console yet. */
        setState((s) => {
          const first = firstRunState(s);
          return {
          ...first,
          organizations: first.organizations.map((o) => (o.id === PELDEN ? { ...o, kind: s.orgOnboarding?.kind ?? "company" } : o)),
          /* The representative's authority is created waiting for them to
             accept responsibility on SCR-DEL-01 (FLOW-DEL-02 step 1). The
             first-run state, which other walks start from, has it already
             accepted; a verification that just finished has not. */
          relations: first.relations.map((r) =>
            inOrg(PELDEN)(r) && r.isRootAuthority ? { ...r, state: "PENDING_ACCEPTANCE" as const, acceptedAt: null, activatedAt: null } : r,
          ),
          responsibilities: [...first.responsibilities.filter((r) => r.orgId !== PELDEN), { orgId: PELDEN, state: "PENDING", at: today() }],
          /* The account that verified Pelden is Dorji's, and from here the
             console acts as the representative the authority confirmed —
             who alone can accept responsibility on SCR-DEL-01. */
          harness: { ...first.harness, persona: "dorji" },
          orgOnboarding: s.orgOnboarding ? { ...s.orgOnboarding, stage: "verified" } : s.orgOnboarding,
          /* The account that did this now belongs to the organisation, as its
             owner — the first row of SCR-ONB-05's list. */
          signup:
            s.signup && s.signup.stage === "done" && !s.signup.memberships.some((m) => m.orgId === "org-pelden")
              ? { ...s.signup, memberships: [...s.signup.memberships, { orgId: "org-pelden", role: "Owner" }] }
              : s.signup,
          };
        });
      },

      restoreStoryState: () =>
        setState((s) => {
          if (!s.firstRun) return s;
          /* Everything the first-run state emptied comes back from the seed.
             What the presenter did in the onboarding flows is kept: the
             account, anyone waiting on an authority, and any invitation
             they sent. */
          const seeded = new Set(SEED.orgInvitations.map((i) => i.id));
          return {
            ...SEED,
            signup: s.signup,
            orgOnboarding: s.orgOnboarding,
            orgInterests: s.orgInterests,
            orgInvitations: [...s.orgInvitations.filter((i) => !seeded.has(i.id)), ...SEED.orgInvitations],
            accreditations: s.accreditations,
            /* Accreditations are kept, so what they changed on the
               organisation is kept with them: the public identity one was
               listed under, and the capability a completed listing switched
               on. Restoring the seed's organisations alone left the status
               page saying "listed" beside an organisation page saying it
               can't verify. */
            organizations: SEED.organizations.map((o) => {
              const now = s.organizations.find((x) => x.id === o.id);
              const live = s.accreditations.filter((a) => a.orgId === o.id && ["ACTIVE", "HELD"].includes(a.state));
              if (!now || (!live.length && now.publicDid === o.publicDid && now.pendingDid === o.pendingDid)) return o;
              return {
                ...o,
                publicDid: now.publicDid ?? o.publicDid,
                pendingDid: now.pendingDid,
                capabilities: [...new Set([...o.capabilities, ...live.map((a) => a.capability)])],
              };
            }),
            harness: s.harness,
            firstRun: false,
          };
        }),

      signIn: (email) => {
        const s0 = stateRef.current;
        const address = email.trim().toLowerCase();
        const person = s0.people.find((p) => p.hasAccount !== false && p.email.toLowerCase() === address);
        if (person && ((PERSONAS as string[]).includes(person.id) || person.joinedBy)) {
          const id = person.id;
          setState((s) => {
            const home = s.organizations.find((o) => o.memberIds.includes(id));
            return { ...s, activeOrgId: home?.id ?? s.activeOrgId, harness: { ...s.harness, persona: id } };
          });
          return { ok: true, personId: id };
        }
        /* An account made in this browser by sign-up, not yet acting as
           anyone the story knows — its home is the welcome screen. */
        if (s0.signup?.stage === "done" && s0.signup.email.toLowerCase() === address) {
          return { ok: true, personId: null };
        }
        return { ok: false };
      },

      startDayZero: () => setState((s) => ({ ...dayZeroState(SEED), harness: { ...SEED.harness, persona: "yeshey", guideStep: s.harness.guideStep } })),

      /* Day zero with Pelden registered on it — exactly what the onboarding
         walk leaves behind, so walking the member invitations on their own
         starts from the same first day the full walk reaches. */
      startPlatformReady: () =>
        setState((s) => ({
          ...platformReadyState(SEED),
          activeOrgId: NDI_ORG,
          harness: { ...SEED.harness, persona: "root", guideStep: s.harness.guideStep },
        })),

      startFirstDay: () =>
        setState((s) => ({
          ...firstRunState(platformReadyState(SEED)),
          activeOrgId: PELDEN,
          harness: { ...SEED.harness, persona: "dorji", guideStep: s.harness.guideStep },
        })),

      /* The first day, plus the two invitations the guide sends in chapters
         5 and 7, accepted — each through the same joinOrganisation every
         acceptance uses, so the state is the one the guide would reach. */
      startTeamReady: () =>
        setState((s) => {
          let next: DemoState = {
            ...firstRunState(platformReadyState(SEED)),
            activeOrgId: PELDEN,
            harness: { ...SEED.harness, persona: "dorji", guideStep: s.harness.guideStep },
          };
          for (const [personId, email, name] of [
            ["ugyen", "ugyen.phuntsho@peldentrading.bt", "Ugyen Phuntsho"],
            ["pema", "pema.choden@druksharpa.bt", "Pema Choden"],
          ] as const) {
            const inv: OrgInvitation = {
              id: `inv-${personId}-team`,
              kind: "M",
              email,
              orgId: PELDEN,
              role: "Member",
              legalName: null,
              legalIdentity: null,
              purpose: null,
              needsSecondApproval: false,
              invitedBy: "dorji",
              approvedBy: null,
              createdAt: today(),
              sentAt: today(),
              expiresAt: inDays(INVITATION_DAYS.M),
              state: "PENDING",
              delivery: "delivered",
              decidedAt: null,
              acceptedName: null,
            };
            next = joinOrganisation({ ...next, orgInvitations: [inv, ...next.orgInvitations] }, inv, name, personId);
          }
          return next;
        }),


      invitePlatformAdmin: (emailIn, root) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const asRoot = me?.platformRole === "root";
        /* P2: a platform admin, or the root account — refused here, not
           merely hidden on the screen, because the screen is not the
           boundary. */
        if (!asRoot && !isPlatformAdmin(me)) return { ok: false, error: "E1" };
        const email = emailIn.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "invalid" };
        const person = s0.people.find((p) => p.email.toLowerCase() === email);
        if (
          isPlatformAdmin(person) ||
          s0.orgInvitations.some(
            (i) => i.kind === "A" && i.email.toLowerCase() === email && (i.state === "PENDING" || i.state === "PENDING_APPROVAL"),
          )
        ) {
          return { ok: false, error: "E3" };
        }
        if (asRoot) {
          /* P8, E14: only under S9, and only with the custodians named —
             the reason is optional (revised 14 Oct). Refused, logged and
             alerted otherwise. */
          if (rootInviteBlock(s0) || !root?.custodians.trim()) {
            log("Control failure — the root account tried to add an administrator outside its emergency rule", NDI_ORG);
            return { ok: false, error: "E14" };
          }
        } else if (activeAdmins(s0).length < 2) {
          /* P7, E12: an admin's invitation needs a second admin to approve. */
          log("Invitation refused — fewer than two administrators to approve it", NDI_ORG);
          return { ok: false, error: "E12" };
        }
        const id = rid("inv");
        setState((s) => ({
          ...s,
          orgInvitations: [
            {
              id,
              kind: "A",
              email,
              orgId: null,
              role: null,
              legalName: null,
              legalIdentity: null,
              purpose: "Platform administrator",
              /* S2: every Kind A needs a second named admin — except the
                 root account's, which S9 checks and logs instead. */
              needsSecondApproval: !asRoot,
              rootReason: asRoot ? root!.reason.trim() || null : null,
              rootCustodians: asRoot ? root!.custodians.trim() : null,
              invitedBy: s.harness.persona,
              approvedBy: null,
              createdAt: today(),
              sentAt: asRoot ? today() : null,
              expiresAt: asRoot ? inDays(INVITATION_DAYS.A) : null,
              state: asRoot ? "PENDING" : "PENDING_APPROVAL",
              delivery: asRoot ? "delivered" : "not_sent",
              decidedAt: null,
              acceptedName: null,
            },
            ...s.orgInvitations,
          ],
        }));
        log(
          asRoot
            ? `Root account used — invited ${email} as a platform administrator. Custodians: ${root!.custodians.trim()}${root!.reason.trim() ? `. Reason: ${root!.reason.trim()}` : ""}`
            : `${email} proposed as a platform administrator — awaiting a second administrator`,
          NDI_ORG,
        );
        return { ok: true, id, queued: !asRoot };
      },

      adminStatus: () => {
        const s0 = stateRef.current;
        return { active: activeAdmins(s0).length, rootBlock: rootInviteBlock(s0) };
      },

      setUpPlatformAdmin: (invitationId, nameIn) => {
        const s0 = stateRef.current;
        const inv = s0.orgInvitations.find((i) => i.id === invitationId);
        const name = nameIn.trim();
        const inviter = inv ? s0.people.find((p) => p.id === inv.invitedBy) : undefined;
        /* The same re-checks as any acceptance, each with its own answer so
           the screen can say which one it was (UX-EW-01 §3.5): still
           pending, not expired, and root still root.
           The expiry is compared as a date, the way member and Entity
           Wallet invitations compare it. `new Date("YYYY-MM-DD")` is
           midnight at the start of that day, so the old comparison refused
           an admin invitation on its last day while the others still took
           theirs. */
        if (!inv || inv.kind !== "A") return { ok: false, error: "E5" };
        if (inv.state === "ACCEPTED") return { ok: false, error: "E7" };
        if (inv.state === "EXPIRED" || (inv.expiresAt !== null && inv.expiresAt < today())) {
          return { ok: false, error: "E4" };
        }
        if (inv.state !== "PENDING") return { ok: false, error: "E5" };
        /* Step 8: the root account's invitation still needs S9 to hold;
           an admin's needs its inviter still to be one (E6). */
        const stillMay = inviter?.platformRole === "root" ? activeAdmins(s0).length < 2 : isPlatformAdmin(inviter);
        if (!stillMay) {
          setState((s) => ({
            ...s,
            orgInvitations: s.orgInvitations.map((i) => (i.id === invitationId ? { ...i, state: "VOID" as const } : i)),
          }));
          return { ok: false, error: "E6" };
        }
        if (!name) return { ok: false, error: "invalid" };
        /* Someone the story already knows (Kinzang, Tshendu) keeps their
           record; anyone else gets a record of their own. They all used to
           share one "newadmin" slot, so a second new admin replaced the
           first, who could then no longer sign in — and now that admins
           invite admins, a demo does invite more than one. The same fix
           setUpMember has. */
        const known = s0.people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase());
        /* An address that already has an account never gets a second set-up.
           SCR-INV-04 requires the person to be signed in as the invited
           address; setting up here would let whoever opened the link rename
           that account and make it an administrator without signing in as
           it. They sign in and accept instead, as a member invitation does
           (setUpMember's has_account). */
        if (known && known.hasAccount !== false) return { ok: false, error: "has_account" };
        const personId: PersonId = known?.id ?? rid("person");
        setState((s) => {
          const people = known
            ? s.people.map((p) =>
                p.id === known.id ? { ...p, name, platformRole: "admin" as const, hasAccount: true } : p,
              )
            : [
                ...s.people,
                {
                  id: personId,
                  /* Listed by the persona switcher, like an invited member. */
                  joinedBy: invitationId,
                  name,
                  cid: "—",
                  email: inv.email,
                  title: "Platform admin · Bhutan NDI",
                  cidVerified: false,
                  platformRole: "admin" as const,
                  hasAccount: true,
                },
              ];
          return {
            ...s,
            people,
            orgInvitations: s.orgInvitations.map((i) =>
              i.id === invitationId
                ? { ...i, state: "ACCEPTED" as const, decidedAt: today(), acceptedName: name }
                : i,
            ),
            /* Their console is NDI's own organisation. */
            organizations: s.organizations.map((o) =>
              o.id === NDI_ORG
                ? {
                    ...o,
                    memberIds: [...o.memberIds.filter((m) => m !== personId), personId],
                    members: o.memberIds.includes(personId) ? o.members : o.members + 1,
                  }
                : o,
            ),
            activeOrgId: NDI_ORG,
            harness: { ...s.harness, persona: personId },
          };
        });
        log(`${name} set up their account and became a platform administrator`);
        return { ok: true, personId };
      },

      proposeAccreditation: (input) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const refused = namedAdminRefusal(me, log);
        if (refused) return refused;
        /* P4: a scope, a purpose, an agreement reference and — for an
           issuer — one legal basis covering every type (D23). The agreement
           is required here, not on a business's request: NDI proposes to an
           organisation it already has an agreement with, so a proposal
           without one has skipped a step. */
        if (
          !input.orgName.trim() ||
          !input.purpose.trim() ||
          !input.agreementRef.trim() ||
          (input.capability === "verifier" ? !input.ask.length : !input.issue.length || !input.legalBasis.trim())
        )
          return { ok: false, error: "invalid" };
        /* E12 (FLOW-ONB-02 P7): a proposal needs a second named admin to
           decide it, so with fewer than two active it is refused up front
           rather than left waiting for someone who doesn't exist. */
        if (activeAdmins(s0).length < 2) return { ok: false, error: "E12" };
        /* E10, Kind N against the platform: an institution "not on the
           platform yet" whose legal name matches one that is, on the name
           alone, whatever the capability. Inviting it would register it a
           second time; the proposal belongs to Kind E (FLOW-ACC-01 P3,
           AC-14). Matched on the normalised legal name, and on the
           register's name as well as the trading one. */
        const key = normaliseLegalName(input.orgName);
        if (input.door === "NEW") {
          const existing = s0.organizations.find(
            (o) => o.id !== NDI_ORG && [o.name, o.legalName].some((n) => n && normaliseLegalName(n) === key),
          );
          if (existing) return { ok: false, error: "E10_ORG", orgId: existing.id, orgName: existing.legalName ?? existing.name };
        }
        /* E10: a second approval for the same thing is never created
           silently beside the first. Same organisation and capability —
           or, for Kind N, which has no orgId yet, the same normalised legal
           name among open Kind N proposals. Not the officer's email: two
           different institutions can share one (a consultant acting for
           both), and that isn't a duplicate.
           Naming the ACTIVE one it replaces is the way through. That one
           stays ACTIVE until the replacement is (D24), so the organisation
           is never left with neither while the new one waits to be
           accepted and listed — and anything else in progress still blocks,
           including a replacement already on its way. */
        const standing = s0.accreditations.filter(
          (a) =>
            a.capability === input.capability &&
            accInProgress(a) &&
            (input.orgId ? a.orgId === input.orgId : a.door === "NEW" && !a.orgId && normaliseLegalName(a.orgName) === key),
        );
        if (standing.some((a) => !(a.state === "ACTIVE" && input.replaces === a.id))) return { ok: false, error: "E10" };
        const replacesId = standing.length ? input.replaces : null;
        const observed =
          input.door === "RECOGNITION"
            ? OBSERVED_OPERATORS.find((o) => o.orgId === input.orgId && o.capability === input.capability) ?? null
            : null;
        const id = rid("acc");
        setState((s) => ({
          ...s,
          accreditations: [
            {
              id,
              orgId: input.orgId,
              orgName: input.orgName.trim(),
              officerEmail: input.officerEmail,
              door: input.door,
              capability: input.capability,
              purpose: input.purpose.trim(),
              legalBasis: input.capability === "issuer" ? input.legalBasis.trim() : "",
              legalBasisRef: input.capability === "issuer" ? input.legalBasisRef.trim() : "",
              agreementRef: input.agreementRef.trim(),
              ask: input.ask,
              issue: input.issue,
              observed: observed ? { since: observed.since, ask: observed.ask, issue: observed.issue } : null,
              state: "PROPOSED",
              replacesId,
              requestId: null,
              proposedBy: s.harness.persona,
              proposedAt: today(),
              requestedBy: null,
              requestedAt: null,
              recommendation: null,
              decidedBy: null,
              decidedAt: null,
              declineReason: null,
              declinedByOrg: false,
              withdrawal: null,
              acceptedName: null,
              acceptedAt: null,
              listedAt: null,
              /* E14: a proposal nobody decides lapses in 30 days — the one
                 deadline left (D20). */
              expiresAt: inDays(30),
              publicIdentity: null,
              refusals: null,
            },
            ...s.accreditations,
          ],
        }));
        log(`Accreditation proposed for ${input.orgName.trim()}`, NDI_ORG);
        return { ok: true, id };
      },

      decideAccreditation: (id, approve, reason) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const acc = s0.accreditations.find((a) => a.id === id);
        const refused = namedAdminRefusal(me, log);
        if (refused) return refused;
        if (!acc || acc.state !== "PROPOSED") return { ok: false, error: "invalid" };
        /* E14: thirty days without a decision and an NDI proposal lapses; it
           confers nothing and cannot be revived by approving it late. A
           business's recommendation is never late (ACC-02/E12, D20) — it is
           reminded, and decided whenever the second administrator gets to it. */
        if (acc.door !== "REQUEST" && acc.expiresAt && acc.expiresAt < today()) return { ok: false, error: "invalid" };
        /* Dual control. The proposer cannot approve their own proposal, and
           for a business's request the reviewer who recommended it is the
           proposer here — the same rule, with its own words (E1, ACC-02/E5). */
        if (acc.proposedBy === s0.harness.persona) return { ok: false, error: acc.door === "REQUEST" ? "E5" : "E1" };
        /* ACC-02/E11: against a recommendation to decline there is no
           approve, and no send-back either (D21) — only confirming it. The
           business is told the reviewer's reason, verbatim: the reviewer
           wrote it to the business, and the second administrator confirms
           it rather than writing another. A disagreement is settled between
           the two; the reviewer may then withdraw the recommendation. */
        const recommendedDecline = Boolean(acc.recommendation && !acc.recommendation.approve);
        if (approve && recommendedDecline) return { ok: false, error: "E11" };
        const why = recommendedDecline ? acc.recommendation?.reason ?? "" : reason?.trim() ?? "";
        if (!approve && !why) return { ok: false, error: "invalid" };
        setState((s) => ({
          ...s,
          /* ACC-02 step 8: a business asked, and accepted by asking, so
             approval switches its primary DID to the did:ethr made with the
             request — unless an earlier part already did — and the lock
             runs from here. A declined request leaves its primary as it was
             (AC-07). */
          organizations:
            approve && acc.door === "REQUEST"
              ? s.organizations.map((o) => (o.id === acc.orgId ? switchPrimary(o, acc.publicIdentity) : o))
              : s.organizations,
          accreditations: s.accreditations.map((a) =>
            a.id !== id
              ? a
              : approve
                ? {
                    ...a,
                    decidedBy: s.harness.persona,
                    decidedAt: today(),
                    /* A business's approval goes straight to publishing its
                       listing. Anything NDI proposed now waits for the
                       organisation — with reminders, not a deadline (D20). */
                    state: a.door === "REQUEST" ? ("LISTING" as const) : ("PENDING_ACCEPTANCE" as const),
                    expiresAt: null,
                  }
                : {
                    ...a,
                    decidedBy: s.harness.persona,
                    decidedAt: today(),
                    state: "DECLINED" as const,
                    declineReason: why,
                    expiresAt: null,
                  },
          ),
        }));
        log(`Accreditation for ${acc.orgName} ${approve ? "approved" : "declined"}`, NDI_ORG);
        return { ok: true };
      },

      reviewRequest: (id, approve, reason) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const acc = s0.accreditations.find((a) => a.id === id);
        const refused = namedAdminRefusal(me, log);
        if (refused) return refused;
        if (!acc || acc.door !== "REQUEST" || (acc.state !== "SUBMITTED" && acc.state !== "IN_REVIEW"))
          return { ok: false, error: "invalid" };
        /* The reason is addressed to the business and shown to it verbatim
           if the decline is confirmed (UN-32), so declining needs one. */
        if (!approve && !reason?.trim()) return { ok: false, error: "invalid" };
        setState((s) => ({
          ...s,
          accreditations: s.accreditations.map((a) =>
            a.id === id
              ? {
                  ...a,
                  state: "PROPOSED" as const,
                  proposedBy: s.harness.persona,
                  proposedAt: today(),
                  recommendation: { by: s.harness.persona, approve, reason: reason?.trim() || null, at: today() },
                  /* No clock: a recommendation waits for its second
                     administrator, who is reminded after 10 working days
                     (ACC-02/E12, D20). */
                  expiresAt: null,
                }
              : a,
          ),
        }));
        log(`Request from ${acc.orgName} reviewed`, NDI_ORG);
        return { ok: true };
      },

      withdrawRecommendation: (id) => {
        const s0 = stateRef.current;
        const acc = s0.accreditations.find((a) => a.id === id);
        if (!acc || acc.door !== "REQUEST" || acc.state !== "PROPOSED" || !acc.recommendation || acc.recommendation.approve)
          return { ok: false, error: "invalid" };
        /* Only the reviewer takes their own recommendation back. This is not
           the old send-back, which let the second administrator return it
           to someone else and could go round with no end (D21): here the
           person who wrote the reason decides it was wrong. */
        if (acc.recommendation.by !== s0.harness.persona) return { ok: false, error: "not_reviewer" };
        setState((s) => ({
          ...s,
          accreditations: s.accreditations.map((a) =>
            a.id === id ? { ...a, state: "IN_REVIEW" as const, recommendation: null, proposedBy: null, proposedAt: null } : a,
          ),
        }));
        log(`Recommendation on ${acc.orgName}'s request withdrawn, to review again`, NDI_ORG);
        return { ok: true };
      },

      withdrawApproval: (id, reason) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const refused = namedAdminRefusal(me, log);
        if (refused) return refused;
        const acc = s0.accreditations.find((a) => a.id === id);
        /* E2: only an approval still waiting to be accepted, and only with a
           reason — the organisation is told it in NDI's words. Withdrawal is
           an administrator's act, never a silent lapse. Any named
           administrator may: it grants nothing, so dual control has nothing
           to protect. */
        if (!acc || acc.state !== "PENDING_ACCEPTANCE" || !reason.trim()) return { ok: false, error: "invalid" };
        setState((s) => ({
          ...s,
          accreditations: s.accreditations.map((a) =>
            a.id === id
              ? {
                  ...a,
                  state: "WITHDRAWN" as const,
                  withdrawal: { reason: "BY_NDI" as const, note: reason.trim(), by: s.harness.persona, at: today() },
                }
              : a,
          ),
        }));
        log(`Approval for ${acc.orgName} withdrawn before it was accepted`, NDI_ORG);
        return { ok: true };
      },

      prepareAcceptance: (id) => acceptanceCheck(stateRef.current, id),

      acceptAccreditation: (id) => {
        const s0 = stateRef.current;
        const check = acceptanceCheck(s0, id);
        if (!check.ok) return check;
        const acc = s0.accreditations.find((a) => a.id === id)!;
        const org = s0.organizations.find((o) => o.id === acc.orgId)!;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const did = listingDid(s0, org) ?? null;
        setState((s) => ({
          ...s,
          /* Step 8: the acceptance is recorded and, in the same step, the
             identity it covered becomes primary. A recognition keeps the
             primary it has, which is the identity it was accepted under. */
          organizations: s.organizations.map((o) => (o.id === org.id ? switchPrimary(o, did) : o)),
          accreditations: s.accreditations.map((a) =>
            a.id === id
              ? {
                  ...a,
                  state: "LISTING" as const,
                  acceptedName: me?.name ?? null,
                  acceptedAt: today(),
                  publicIdentity: did,
                }
              : a,
          ),
        }));
        log(`${me?.name ?? "The owner"} accepted ${org.name}'s approval to ${acc.capability === "verifier" ? "verify" : "issue"}`, org.id);
        return { ok: true };
      },

      setUpPublicIdentity: (orgId) => {
        const s0 = stateRef.current;
        const org = s0.organizations.find((o) => o.id === orgId);
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        /* Only the owner accepting sets it up, and never over an identity a
           standing approval is listed under (see listedUnder). */
        if (!org || roleIn(org, me) !== "Owner") return { ok: false, error: "not_owner" };
        if (org.publicDid && listedUnder(s0, orgId, org.publicDid)) return { ok: false, error: "listed" };
        /* Step 5: created now, in the officer's session, but not primary.
           If the wallet step then doesn't confirm (E4) nothing the
           organisation does has changed, and the DID is reused on retry. */
        const did = org.pendingDid?.startsWith("did:ethr:") ? org.pendingDid : newDidId("did:ethr");
        setState((s) => ({
          ...s,
          organizations: s.organizations.map((o) => (o.id === orgId ? { ...o, pendingDid: did } : o)),
        }));
        log("Public identity set up", orgId);
        return { ok: true, did };
      },

      declineAccreditationAsOrg: (id) => {
        const s0 = stateRef.current;
        const acc = s0.accreditations.find((a) => a.id === id);
        const org = s0.organizations.find((o) => o.id === acc?.orgId);
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        if (!acc || acc.state !== "PENDING_ACCEPTANCE" || roleIn(org, me) !== "Owner") return;
        setState((s) => ({
          ...s,
          accreditations: s.accreditations.map((a) =>
            a.id === id ? { ...a, state: "DECLINED" as const, declinedByOrg: true } : a,
          ),
        }));
        log(`${acc.orgName} declined its approval`, NDI_ORG);
      },

      completeListing: (id) =>
        setState((s) => {
          const acc = s.accreditations.find((a) => a.id === id);
          if (!acc || acc.state !== "LISTING") return s;
          return {
            ...s,
            organizations: s.organizations.map((o) =>
              o.id === acc.orgId && !o.capabilities.includes(acc.capability)
                ? { ...o, capabilities: [...o.capabilities, acc.capability] }
                : o,
            ),
            accreditations: s.accreditations.map((a) =>
              a.id === id
                ? { ...a, state: "ACTIVE" as const, listedAt: today() }
                : /* The approval this one replaces ends in the same step,
                     never before: until now it was ACTIVE and every gated
                     call kept working (D24, AC-13). It stays on record,
                     WITHDRAWN as REPLACED, under the one that replaced it.
                     The capability itself never left the organisation. */
                  a.id === acc.replacesId && a.state === "ACTIVE"
                  ? {
                      ...a,
                      state: "WITHDRAWN" as const,
                      withdrawal: { reason: "REPLACED" as const, note: null, by: null, at: today() },
                    }
                  : a,
            ),
          };
        }),

      resignAccreditation: (id) => {
        const s0 = stateRef.current;
        const acc = s0.accreditations.find((a) => a.id === id);
        const me = s0.harness.persona;
        /* OWNER for an institution, the Root for a business (SCR-ACC-04) —
           decided by the door it came through. A business's approval is
           its Root's to end, as it was the Root's to ask for: the check
           reads the relation, never the role (ACC-02/S3), so an OWNER who
           is not the Root can't resign it. */
        if (!acc || acc.state !== "ACTIVE" || !mayEndAcc(s0, acc, me)) return;
        setState((s) => ({
          ...s,
          organizations: s.organizations.map((o) =>
            o.id === acc.orgId ? { ...o, capabilities: o.capabilities.filter((c) => c !== acc.capability) } : o,
          ),
          accreditations: s.accreditations.map((a) => (a.id === id ? { ...a, state: "RESIGNED" as const, decidedAt: today() } : a)),
        }));
        log(`${acc.orgName} stopped ${acc.capability === "verifier" ? "verifying" : "issuing"}`, acc.orgId ?? undefined);
      },

      requestCapability: (input) => {
        const s0 = stateRef.current;
        const org = s0.organizations.find((o) => o.id === s0.activeOrgId);
        const root = s0.relations.find((r) => inOrg(org?.id ?? "")(r) && r.isRootAuthority && r.state === "ACTIVE");
        /* P1, P2: only the Root of a verified holder. The dashboard does not
           offer it to anyone else; this is the refusal behind that. */
        if (!org || !org.capabilities.includes("holder") || root?.personId !== s0.harness.persona)
          return { ok: false, error: "E2" };
        /* One part per capability, at most two (D22), each complete: a
           scope, a purpose, and for issuing one legal basis (D23). The
           agreement reference is optional — only if the business has one
           (step 2). */
        const caps = input.parts.map((p) => p.capability);
        if (
          !input.parts.length ||
          new Set(caps).size !== caps.length ||
          input.parts.some(
            (p) => !p.purpose.trim() || (p.capability === "verifier" ? !p.ask.length : !p.issue.length || !p.legalBasis.trim()),
          )
        )
          return { ok: false, error: "invalid" };
        /* E3, per capability: SCR-ACC-06 doesn't offer one already asked
           for or approved; this is the refusal behind that. In progress
           includes an NDI approval waiting for the owner to accept (P3,
           FLOW-ACC-02 v0.4), so the two can never both become ACTIVE.
           Naming the ACTIVE approval a part replaces — "Ask for more" — is
           the way through, as it is for NDI's proposals (E10): that one
           stays ACTIVE until the replacement is listed (AC-10). Anything
           else in progress still blocks, including a replacement already
           on its way. */
        const blocked = input.parts.some((p) =>
          s0.accreditations.some(
            (a) =>
              a.orgId === org.id &&
              a.capability === p.capability &&
              accInProgress(a) &&
              !(a.state === "ACTIVE" && p.replaces === a.id),
          ),
        );
        if (blocked) return { ok: false, error: "E3" };
        /* A part names what it replaces only if that is this organisation's
           ACTIVE approval for the same capability; anything else is dropped
           rather than linked, so completeListing never ends the wrong one. */
        const replacing = (p: (typeof input.parts)[number]) =>
          s0.accreditations.some((a) => a.id === p.replaces && a.orgId === org.id && a.capability === p.capability && a.state === "ACTIVE")
            ? p.replaces
            : null;
        /* Step 4: the public identity it would be listed under is set up
           with the request, so NDI approves a request that can actually be
           listed — and set up *not primary*: it becomes primary only when
           NDI approves (step 8). An existing did:ethr is kept, and so is
           any identity a standing approval is already listed under;
           otherwise a did:ethr waiting from an earlier attempt is reused,
           or a new one made. */
        const did =
          org.publicDid && (org.publicDid.startsWith("did:ethr:") || listedUnder(s0, org.id, org.publicDid))
            ? org.publicDid
            : org.pendingDid?.startsWith("did:ethr:")
              ? org.pendingDid
              : newDidId("did:ethr");
        const requestId = rid("req");
        setState((s) => ({
          ...s,
          organizations: s.organizations.map((o) => (o.id === org.id && did !== o.publicDid ? { ...o, pendingDid: did } : o)),
          accreditations: [
            ...input.parts.map((p) => ({
              id: rid("acc"),
              orgId: org.id,
              orgName: org.legalName ?? org.name,
              officerEmail: null,
              door: "REQUEST" as const,
              capability: p.capability,
              purpose: p.purpose.trim(),
              legalBasis: p.capability === "issuer" ? p.legalBasis.trim() : "",
              legalBasisRef: p.capability === "issuer" ? p.legalBasisRef.trim() : "",
              agreementRef: input.agreementRef.trim(),
              ask: p.capability === "verifier" ? p.ask : [],
              issue: p.capability === "issuer" ? p.issue : [],
              observed: null,
              state: "SUBMITTED" as const,
              replacesId: replacing(p),
              requestId,
              proposedBy: null,
              proposedAt: null,
              requestedBy: s.harness.persona,
              requestedAt: today(),
              recommendation: null,
              decidedBy: null,
              decidedAt: null,
              declineReason: null,
              declinedByOrg: false,
              withdrawal: null,
              acceptedName: null,
              acceptedAt: null,
              listedAt: null,
              expiresAt: null,
              publicIdentity: did,
              refusals: null,
            })),
            ...s.accreditations,
          ],
        }));
        log(
          `Asked NDI for approval to ${caps.map((c) => (c === "verifier" ? "verify" : "issue")).join(" and ")}`,
          org.id,
        );
        return { ok: true, id: requestId };
      },

      withdrawRequest: (id) =>
        setState((s) => {
          /* The Root withdraws the request, not a part of it: every part not
             yet decided goes with it. A part already approved stays — it is
             an approval now, ended by resigning it. Only the Root, as only
             the Root could ask (ACC-02/A1, S3): the status page offers it to
             nobody else, and this is the refusal behind that. */
          const target = s.accreditations.find((a) => a.id === id);
          if (!target || target.door !== "REQUEST" || !mayEndAcc(s, target, s.harness.persona)) return s;
          const open = (a: (typeof s.accreditations)[number]) =>
            a.door === "REQUEST" &&
            (a.id === id || (target.requestId !== null && a.requestId === target.requestId)) &&
            ["SUBMITTED", "IN_REVIEW", "PROPOSED"].includes(a.state);
          return {
            ...s,
            accreditations: s.accreditations.map((a) =>
              open(a)
                ? {
                    ...a,
                    state: "WITHDRAWN" as const,
                    decidedAt: today(),
                    withdrawal: { reason: "REQUESTER" as const, note: null, by: s.harness.persona, at: today() },
                  }
                : a,
            ),
          };
        }),

      proposeDesignation: (input) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        /* A named admin proposes — never the root account, which does no
           routine work (FLOW-ONB-02 S9). */
        if (!isNamedAdmin(me)) {
          if (me?.platformRole === "root") log("Control failure — the root account tried to propose a designation", NDI_ORG);
          return { ok: false, error: "not_admin" };
        }
        const org = s0.organizations.find((o) => o.id === input.orgId);
        if (!org || !input.entityTypes.length || !input.legalBasis.trim()) return { ok: false, error: "invalid" };
        /* E12 (FLOW-ONB-02 P7): a proposal needs a second named admin, so
           with fewer than two active it is refused up front. */
        if (activeAdmins(s0).length < 2) return { ok: false, error: "E12" };
        if (s0.designations.some((d) => d.orgId === org.id && designationInProgress(d))) return { ok: false, error: "exists" };
        /* P6 — a kind of business another authority already confirms can't
           be proposed: replacing an incumbent isn't supported yet (E5, a
           later flow). The form disables the box, but a draft resumed from
           storage could still carry it, and it would then pass proposal and
           approval only to fail at activation after three people had acted.
           So it's refused here, where it counts. */
        if (
          input.entityTypes.some((k) =>
            s0.designations.some((d) => d.orgId !== org.id && designationInProgress(d) && d.state !== "PROPOSED" && d.entityTypes.includes(k)),
          )
        )
          return { ok: false, error: "covered" };
        const id = rid("dsg");
        setState((s) => ({
          ...s,
          designations: [
            {
              id,
              orgId: org.id,
              orgName: org.legalName ?? org.name,
              kind: "E",
              entityTypes: input.entityTypes,
              legalBasis: input.legalBasis.trim(),
              legalRef: input.legalRef.trim(),
              state: "PROPOSED",
              proposedBy: s.harness.persona,
              proposedAt: today(),
              approvedBy: null,
              approvedAt: null,
              acceptedBy: null,
              acceptedAt: null,
              declinedBy: null,
              declinedReason: null,
              withdrawnBy: null,
              withdrawnAt: null,
              withdrawnReason: null,
              withdrawnFrom: null,
              expiredReason: null,
              /* E13 — 30 days for a second administrator to decide. */
              expiresAt: inDays(30),
              infoRequests: [],
              activatedAt: null,
              publishingDid: null,
              didMethodAtActivation: null,
              suspendedReason: null,
              checks: null,
              checkedAt: null,
              ndiGrant: null,
              ndiAccess: null,
              ndiAccessChangedBy: null,
              ndiAccessChangedAt: null,
            },
            ...s.designations,
          ],
        }));
        log(`Designation proposed for ${org.legalName ?? org.name}`, NDI_ORG);
        return { ok: true, id };
      },

      decideDesignation: (id, approve, reason) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const d = s0.designations.find((x) => x.id === id);
        if (!isNamedAdmin(me)) {
          if (me?.platformRole === "root") log("Control failure — the root account tried to approve a designation", NDI_ORG);
          return { ok: false, error: "not_admin" };
        }
        if (!d || d.state !== "PROPOSED") return { ok: false, error: "invalid" };
        /* E7 — the proposer cannot approve their own. The screen doesn't
           offer it; reaching here anyway is a control failure, logged. */
        if (d.proposedBy === s0.harness.persona) {
          log("Control failure — a designation's proposer tried to approve it", NDI_ORG);
          return { ok: false, error: "E7" };
        }
        if (!approve && !reason?.trim()) return { ok: false, error: "invalid" };
        setState((s) => ({
          ...s,
          designations: s.designations.map((x) =>
            x.id !== id
              ? x
              : approve
                ? { ...x, state: "PENDING" as const, approvedBy: s.harness.persona, approvedAt: today(), expiresAt: inDays(30) }
                : /* E12 — DECLINED with the approver's reason, for the proposer. */
                  { ...x, state: "DECLINED" as const, declinedBy: s.harness.persona, declinedReason: reason?.trim() ?? null, expiresAt: null },
          ),
        }));
        log(
          approve
            ? `Designation for ${d.orgName} approved — waiting for it to accept`
            : `${me?.name ?? "The second administrator"} declined the designation for ${d.orgName}: ${reason?.trim()}`,
          NDI_ORG,
        );
        return { ok: true };
      },

      askForMoreInformation: (id, note) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const d = s0.designations.find((x) => x.id === id);
        if (!isNamedAdmin(me)) return { ok: false, error: "not_admin" };
        if (!d || d.state !== "PROPOSED" || !note.trim()) return { ok: false, error: "invalid" };
        /* Asking is the approver's move, so the proposer can't ask themselves. */
        if (d.proposedBy === s0.harness.persona) return { ok: false, error: "E7" };
        /* A note on the record and a message to the proposer — the state and
           the 30-day window are untouched (A1: "which changes nothing"). */
        setState((s) => ({
          ...s,
          designations: s.designations.map((x) =>
            x.id === id ? { ...x, infoRequests: [...x.infoRequests, { by: s.harness.persona, at: today(), note: note.trim() }] } : x,
          ),
        }));
        log(`${me?.name ?? "An administrator"} asked for more information about the designation for ${d.orgName}`, NDI_ORG);
        return { ok: true };
      },

      withdrawDesignation: (id, reason) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const d = s0.designations.find((x) => x.id === id);
        if (!isNamedAdmin(me)) {
          if (me?.platformRole === "root") log("Control failure — the root account tried to withdraw a designation", NDI_ORG);
          return { ok: false, error: "not_admin" };
        }
        /* A3 is for a designation that hasn't activated. Ending an ACTIVE one
           is a different act with its own consequences, not walked here. */
        if (!d || !["PROPOSED", "PENDING", "ACCEPTED"].includes(d.state) || !reason.trim()) return { ok: false, error: "invalid" };
        /* Before approval only its proposer withdraws it — the approver's
           "no" is E12, with its own record. */
        if (d.state === "PROPOSED" && d.proposedBy !== s0.harness.persona) return { ok: false, error: "not_proposer" };
        const told = d.state === "PENDING" || d.state === "ACCEPTED";
        setState((s) => ({
          ...s,
          designations: s.designations.map((x) =>
            x.id === id
              ? {
                  ...x,
                  state: "WITHDRAWN" as const,
                  withdrawnBy: s.harness.persona,
                  withdrawnAt: today(),
                  withdrawnReason: reason.trim(),
                  withdrawnFrom: x.state,
                  expiresAt: null,
                }
              : x,
          ),
        }));
        log(`Withdrew the designation for ${d.orgName}: ${reason.trim()}`, NDI_ORG);
        /* The authority is told only if the proposal had reached it. */
        if (told) log(`NDI has withdrawn this designation: ${reason.trim()}`, d.orgId);
        return { ok: true };
      },

      acceptDesignation: (id) => {
        const s0 = stateRef.current;
        const d = s0.designations.find((x) => x.id === id);
        const org = s0.organizations.find((o) => o.id === d?.orgId);
        if (!d || !org || d.state !== "PENDING") return { ok: false, error: "invalid" };
        /* E6 — thirty days without acceptance and it confers nothing. */
        if (d.expiresAt && d.expiresAt < today()) {
          setState((s) => ({
            ...s,
            designations: s.designations.map((x) => (x.id === id ? { ...x, state: "EXPIRED" as const, expiredReason: "NOT_ACCEPTED" as const } : x)),
          }));
          return { ok: false, error: "E6" };
        }
        /* Only an OWNER of the authority's own organisation (A2). */
        if (roleIn(org, s0.people.find((p) => p.id === s0.harness.persona)) !== "Owner") return { ok: false, error: "not_owner" };
        /* A2 — accepting is also the grant: the OWNER issues NDI's service
           principal its VERIFIER invitation, in their own session. It confers
           nothing until step 4 accepts it, after every check passes. */
        const accepted: Designation = {
          ...d,
          state: "ACCEPTED",
          acceptedBy: s0.harness.persona,
          acceptedAt: today(),
          expiresAt: null,
          ndiGrant: { by: s0.harness.persona, at: today() },
        };
        const s1 = { ...s0, designations: s0.designations.map((x) => (x.id === id ? accepted : x)) };
        setState((s) => ({ ...s, designations: s.designations.map((x) => (x.id === id ? accepted : x)) }));
        log(`${d.orgName} accepted its designation`, NDI_ORG);
        log("Accepted the designation as foundational issuer, and granted NDI's service account its access", org.id);
        /* Step 3: activation is submitted and checked at once — through the
           same path a re-run takes, so the audit trail records "designated"
           whichever way it got there. */
        return { ok: true, active: runActivation(s1, accepted, setState, log) };
      },

      grantNdiAccess: (id) => {
        const s0 = stateRef.current;
        const d = s0.designations.find((x) => x.id === id);
        const org = s0.organizations.find((o) => o.id === d?.orgId);
        /* Kind N, step 2: accepted by the invitation, and the grant is still
           to come. Already granted is nothing to do. */
        if (!d || !org || d.state !== "ACCEPTED" || d.ndiGrant) return { ok: false, error: "invalid" };
        if (roleIn(org, s0.people.find((p) => p.id === s0.harness.persona)) !== "Owner") return { ok: false, error: "not_owner" };
        const granted: Designation = { ...d, ndiGrant: { by: s0.harness.persona, at: today() } };
        const s1 = { ...s0, designations: s0.designations.map((x) => (x.id === id ? granted : x)) };
        setState((s) => ({ ...s, designations: s.designations.map((x) => (x.id === id ? granted : x)) }));
        log("Granted NDI's service account its access", org.id);
        return { ok: true, active: runActivation(s1, granted, setState, log) };
      },

      declineDesignation: (id) => {
        const s0 = stateRef.current;
        const d = s0.designations.find((x) => x.id === id);
        const org = s0.organizations.find((o) => o.id === d?.orgId);
        if (!d || !org || d.state !== "PENDING") return { ok: false, error: "invalid" };
        if (roleIn(org, s0.people.find((p) => p.id === s0.harness.persona)) !== "Owner") return { ok: false, error: "not_owner" };
        /* AC-13 — DECLINED, and no grant to NDI's service principal exists. */
        setState((s) => ({
          ...s,
          designations: s.designations.map((x) =>
            x.id === id ? { ...x, state: "DECLINED" as const, declinedBy: s.harness.persona, expiresAt: null } : x,
          ),
        }));
        log(`${d.orgName} declined its designation`, NDI_ORG);
        return { ok: true };
      },

      rerunActivation: (id) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const d = s0.designations.find((x) => x.id === id);
        if (!isNamedAdmin(me)) return { ok: false, error: "not_admin" };
        if (!d || (d.state !== "ACCEPTED" && d.state !== "PENDING")) return { ok: false, error: "invalid" };
        return { ok: true, active: runActivation(s0, d, setState, log) };
      },

      grantEntitlements: (orgId) => {
        const s0 = stateRef.current;
        if (!isNamedAdmin(s0.people.find((p) => p.id === s0.harness.persona))) return;
        const org = s0.organizations.find((o) => o.id === orgId);
        /* Already granted: nothing to do, and nothing to log twice. */
        if (!org || ISSUER_ENTITLEMENTS.every((e) => org.entitlements?.includes(e))) return;
        const granted = { ...org, entitlements: Array.from(new Set([...(org.entitlements ?? []), ...ISSUER_ENTITLEMENTS])) };
        const s1 = { ...s0, organizations: s0.organizations.map((o) => (o.id === orgId ? granted : o)) };
        setState((s) => ({ ...s, organizations: s.organizations.map((o) => (o.id === orgId ? granted : o)) }));
        log("Granted the entitlements a foundational issuer needs", NDI_ORG);
        /* And the checks run again at once, so the E4 failure and its button
           don't stay on screen describing something already fixed. */
        const d = s1.designations.find((x) => x.orgId === orgId && x.state === "ACCEPTED");
        if (d) runActivation(s1, d, setState, log);
      },

      setNdiAccess: (designationId, on) => {
        const s0 = stateRef.current;
        const d = s0.designations.find((x) => x.id === designationId);
        const org = s0.organizations.find((o) => o.id === d?.orgId);
        /* The authority's own control, without asking NDI (UN-24) — so no
           NDI role can reach it. */
        if (!d || !org || roleIn(org, s0.people.find((p) => p.id === s0.harness.persona)) !== "Owner") return { ok: false, error: "not_owner" };
        /* Removing needs a member to remove. Restoring (A4) needs the
           designation ACTIVE — a suspended one reads no authorisation. */
        if (on ? d.state !== "ACTIVE" || d.ndiAccess !== "REMOVED" : d.ndiAccess !== "ACTIVE") return { ok: false, error: "invalid" };
        const me = s0.harness.persona;
        /* A4 writes a new row for each entity type whose adoption set is
           ACTIVE; the WITHDRAWN rows stay as they are, never reactivated. */
        const fresh: Authorisation[] = on
          ? s0.adoptions
              .filter((a) => a.designationId === d.id && a.state === "ACTIVE")
              .map((a) => ({
                id: rid("auth"),
                designationId: d.id,
                orgId: org.id,
                entityType: a.entityType,
                principal: NDI_SERVICE_PRINCIPAL,
                permittedPurpose: draftFor(a.entityType).purpose,
                grantedBy: me,
                grantedAt: today(),
                state: "ACTIVE" as const,
                withdrawnBy: null,
                withdrawnAt: null,
              }))
          : [];
        setState((s) => ({
          ...s,
          designations: s.designations.map((x) =>
            x.id === designationId
              ? {
                  ...x,
                  ndiAccess: on ? ("ACTIVE" as const) : ("REMOVED" as const),
                  ndiAccessChangedBy: me,
                  ndiAccessChangedAt: today(),
                  /* Restoring is the OWNER granting again, as at step 2 —
                     the service only accepts it (S5). */
                  ndiGrant: on ? { by: me, at: today() } : x.ndiGrant,
                }
              : x,
          ),
          /* Pausing moves every ACTIVE authorisation under the designation
             to WITHDRAWN in the same act, whichever entry point was used —
             membership is organisation-wide, so the pause is too. */
          authorisations: [
            ...s.authorisations.map((z) =>
              !on && z.designationId === designationId && z.state === "ACTIVE"
                ? { ...z, state: "WITHDRAWN" as const, withdrawnBy: me, withdrawnAt: today() }
                : z,
            ),
            ...fresh,
          ],
        }));
        log(
          on ? "Granted NDI's service account its access again" : "Removed NDI's service account — it can no longer send in your name",
          org.id,
        );
        /* E8 to NDI: the permission withdrawn, never an outage. */
        if (!on) log(`${d.orgName} has withdrawn the platform's permission to request proofs in its name`, NDI_ORG);
        return { ok: true };
      },

      setPrimaryDid: (orgId, did) => {
        const s0 = stateRef.current;
        const org = s0.organizations.find((o) => o.id === orgId);
        if (!org || !did || org.issuingDid === did) return;
        /* E10 — compared with publishingDid, the DID itself, so a switch to
           another did:ethr is caught as surely as a change of method. Any
           member may change it (FLOW-ORG-02 §7.2), so the store checks on
           every change rather than trusting who made it. Putting the
           recorded DID back lifts an E10 suspension, and only that one. */
        const changed = s0.designations.filter((d) => d.orgId === orgId && d.state === "ACTIVE" && d.publishingDid && d.publishingDid !== did);
        const restored = s0.designations.filter(
          (d) => d.orgId === orgId && d.state === "SUSPENDED" && d.suspendedReason === "IDENTITY_CHANGED" && d.publishingDid === did,
        );
        setState((s) => ({
          ...s,
          organizations: s.organizations.map((o) => (o.id === orgId ? { ...o, issuingDid: did } : o)),
          designations: s.designations.map((d) =>
            changed.some((c) => c.id === d.id)
              ? { ...d, state: "SUSPENDED" as const, suspendedReason: "IDENTITY_CHANGED" as const }
              : restored.some((r) => r.id === d.id)
                ? { ...d, state: "ACTIVE" as const, suspendedReason: null }
                : d,
          ),
        }));
        for (const d of changed) {
          const text = `${d.orgName}'s issuing identity has changed since it was designated. New verifications have stopped until this is put back`;
          log(text, NDI_ORG);
          log(text, orgId);
        }
        for (const d of restored) {
          log(`${d.orgName}'s issuing identity is back to the one it was designated under. New verifications can resume`, NDI_ORG);
          log("Your issuing identity is back to the one you were designated under. New verifications can resume", orgId);
        }
      },

      objectToArtefacts: (designationId, entityType, item, note) => {
        const s0 = stateRef.current;
        const d = s0.designations.find((x) => x.id === designationId);
        const org = s0.organizations.find((o) => o.id === d?.orgId);
        if (!d || !org || roleIn(org, s0.people.find((p) => p.id === s0.harness.persona)) !== "Owner") return { ok: false, error: "not_owner" };
        if (!note.trim()) return { ok: false, error: "invalid" };
        /* One open objection at a time for what it covers — a second would
           only repeat the hold. */
        const kinds = entityType ? [entityType] : d.entityTypes;
        if (kinds.some((k) => openObjectionFor(s0.artefactObjections, designationId, k))) return { ok: false, error: "invalid" };
        setState((s) => ({
          ...s,
          artefactObjections: [
            ...s.artefactObjections,
            {
              id: rid("obj"),
              designationId,
              entityType,
              item: entityType ? item : null,
              note: note.trim(),
              by: s.harness.persona,
              at: today(),
              closedAt: null,
              closedHow: null,
            },
          ],
        }));
        log(`Objected to NDI's draft${entityType ? ` for ${entityType.replace(/_/g, " ")}s` : ""} — adopting it is on hold`, org.id);
        log(`${d.orgName} objected to the draft${entityType ? ` for ${entityType.replace(/_/g, " ")}s` : ""}: ${note.trim()}`, NDI_ORG);
        return { ok: true };
      },

      withdrawObjection: (objectionId) => {
        const s0 = stateRef.current;
        const o = s0.artefactObjections.find((x) => x.id === objectionId);
        const d = s0.designations.find((x) => x.id === o?.designationId);
        const org = s0.organizations.find((x) => x.id === d?.orgId);
        if (!o || !d || !org || o.closedAt) return { ok: false, error: "invalid" };
        /* The officer's own objection, theirs to release. */
        if (roleIn(org, s0.people.find((p) => p.id === s0.harness.persona)) !== "Owner") return { ok: false, error: "not_owner" };
        setState((s) => ({
          ...s,
          artefactObjections: s.artefactObjections.map((x) =>
            x.id === objectionId ? { ...x, closedAt: today(), closedHow: "WITHDRAWN" as const } : x,
          ),
        }));
        log("Withdrew your objection to NDI's draft", org.id);
        log(`${d.orgName} withdrew its objection to the draft`, NDI_ORG);
        return { ok: true };
      },

      reviseDraft: (objectionId) => {
        const s0 = stateRef.current;
        const o = s0.artefactObjections.find((x) => x.id === objectionId);
        const d = s0.designations.find((x) => x.id === o?.designationId);
        if (!o || !d || o.closedAt) return;
        /* NDI answers with a new draft for everything the objection covers.
           Where the objection named an item, the revision leaves it out;
           where it didn't, the prototype can't know what NDI would change,
           so the revision carries the same items as a fresh draft to
           review. Either way the objection closes, and the officer reads the
           new draft before adopting it. */
        const kinds = o.entityType ? [o.entityType] : d.entityTypes;
        const revisions = kinds.map((k) => {
          const prior = s0.draftRevisions.filter((r) => r.designationId === d.id && r.entityType === k);
          const asked = draftAsked(s0.draftRevisions, d.id, k);
          return {
            designationId: d.id,
            entityType: k,
            revision: prior.reduce((n, r) => Math.max(n, r.revision), 1) + 1,
            at: today(),
            asked: o.item ? asked.filter((a) => a.item !== o.item) : asked,
            objectionId,
          };
        });
        setState((s) => ({
          ...s,
          draftRevisions: [...s.draftRevisions, ...revisions],
          artefactObjections: s.artefactObjections.map((x) =>
            x.id === objectionId ? { ...x, closedAt: today(), closedHow: "REVISED" as const } : x,
          ),
        }));
        log(`NDI revised the draft for ${d.orgName}`, NDI_ORG);
        log("NDI revised its draft in answer to your objection. Review it before adopting", d.orgId);
      },

      adoptArtefacts: (designationId, entityType, newVersion) => {
        const s0 = stateRef.current;
        const d = s0.designations.find((x) => x.id === designationId);
        const org = s0.organizations.find((o) => o.id === d?.orgId);
        if (!d || !org) return { ok: false, error: "invalid" };
        /* P2 — the authority's OWNER, in its own organisation. No NDI role
           has a route here (EW-FLOW5-SD/D7). */
        if (roleIn(org, s0.people.find((p) => p.id === s0.harness.persona)) !== "Owner") return { ok: false, error: "not_owner" };
        if (d.state === "SUSPENDED") return { ok: false, error: "E5" };
        if (d.state !== "ACTIVE") return { ok: false, error: "invalid" };
        if (!d.entityTypes.includes(entityType)) return { ok: false, error: "E1" };
        const live = s0.adoptions.find((a) => a.designationId === designationId && a.entityType === entityType && a.state === "ACTIVE");
        if (live && !newVersion) return { ok: false, error: "E7" };
        /* A5 — an open objection, against this type or the whole draft,
           holds adoption until NDI revises the draft or the officer
           withdraws it. Nothing is adopted over it, and nothing is taken
           out of the draft by the officer alone. */
        if (openObjectionFor(s0.artefactObjections, designationId, entityType)) return { ok: false, error: "objection_open" };
        const draft = draftFor(entityType);
        const asked = draftAsked(s0.draftRevisions, designationId, entityType);
        const prior = s0.adoptions.filter((a) => a.designationId === designationId && a.entityType === entityType);
        const version = prior.reduce((n, a) => Math.max(n, a.version), 0) + 1;
        /* The third part of the set — the authorisation — is written with the
           adoption (step 5). A new version keeps the one already standing.
           While NDI's access is paused none is written: the pause covers the
           whole designation, and restoring (A4) writes one for every live
           type, this one included. */
        const authorised = s0.authorisations.some(
          (z) => z.designationId === designationId && z.entityType === entityType && z.state === "ACTIVE",
        );
        const grant: Authorisation[] =
          authorised || d.ndiAccess !== "ACTIVE"
            ? []
            : [
                {
                  id: rid("auth"),
                  designationId,
                  orgId: org.id,
                  entityType,
                  principal: NDI_SERVICE_PRINCIPAL,
                  permittedPurpose: draft.purpose,
                  grantedBy: s0.harness.persona,
                  grantedAt: today(),
                  state: "ACTIVE",
                  withdrawnBy: null,
                  withdrawnAt: null,
                },
              ];
        setState((s) => ({
          ...s,
          adoptions: [
            ...s.adoptions.map((a) =>
              a.designationId === designationId && a.entityType === entityType && a.state === "ACTIVE"
                ? { ...a, state: "SUPERSEDED" as const }
                : a,
            ),
            {
              id: rid("ado"),
              designationId,
              orgId: org.id,
              entityType,
              version,
              state: "ACTIVE",
              adoptedBy: s.harness.persona,
              adoptedAt: today(),
              asked,
              purpose: draft.purpose,
              stoppedBy: null,
              stoppedAt: null,
            },
          ],
          authorisations: [...s.authorisations, ...grant],
        }));
        log(`Adopted what people will be asked — version ${version}`, org.id);
        return { ok: true, version };
      },

      mayOperate: (orgId, op, credentialType) => {
        const s0 = stateRef.current;
        return mayOperate(s0, s0.harness.persona, orgId, op, credentialType);
      },

      askForCredential: (offeringId) => {
        const s0 = stateRef.current;
        const org = s0.organizations.find((o) => o.id === s0.activeOrgId);
        const offering = s0.offerings.find((o) => o.id === offeringId);
        /* P1 — a verified holder. The option is absent otherwise (E1). */
        if (!org || !org.capabilities.includes("holder")) return { ok: false, error: "E1" };
        /* P2 — the asker's preset carries credential:receive (E2). */
        if (!mayOperate(s0, s0.harness.persona, org.id, "credential:receive", offering?.credential)) return { ok: false, error: "E2" };
        /* P3 — still offered, and the issuer may still issue it (E3). */
        if (!offering || offering.status !== "ACTIVE" || !offering.covered) return { ok: false, error: "E3" };
        /* And offered to this kind of business. The catalogue only lists what
           is, but a direct link reaches any offering, so it's checked here. */
        if (!offering.eligibleKinds.includes(org.kind ?? "company")) return { ok: false, error: "not_eligible" };
        /* Only what can be shared counts: a superseded credential is the
           record, not something presented. */
        const held = s0.heldCredentials.filter((c) => (c.orgId ?? PELDEN) === org.id && c.status === "active" && !c.supersededBy);
        /* P4 — the prerequisite is held (E4). */
        if (!held.some((c) => c.type === offering.prerequisite.credential)) return { ok: false, error: "E4" };
        /* P5 — nothing in flight, and not held unless renewable (E5). The
           two halves are told apart: one is "here's where it stands", the
           other "your organisation already has this". */
        if (s0.credentialRequests.some((r) => r.orgId === org.id && r.offeringId === offeringId && requestInFlight(r)))
          return { ok: false, error: "E5" };
        if (!offering.renewable && held.some((c) => c.type === offering.credential)) return { ok: false, error: "E5_held" };
        const id = rid("crq");
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const isRoot = s0.relations.some(
          (r) => r.personId === s0.harness.persona && (r.orgId ?? PELDEN) === org.id && r.isRootAuthority && r.state === "ACTIVE",
        );
        setState((s) => ({
          ...s,
          credentialRequests: [
            {
              id,
              orgId: org.id,
              offeringId,
              offeringVersion: offering.version,
              credential: offering.credential,
              issuerName: offering.issuerName,
              issuerOrgId: offering.issuerOrgId,
              requestedBy: s.harness.persona,
              requestedAt: today(),
              state: "AWAITING_PROOF",
              consented: offering.prerequisite,
              askedMore: null,
              consentBy: null,
              answerBy: null,
              declined: null,
              offer: null,
              answeredBy: null,
              answeredAt: null,
              failReason: null,
            },
            ...s.credentialRequests,
          ],
        }));
        log(`Asked ${offering.issuerName} for ${offering.credential}`, org.id);
        /* UXD-39 — a request made by anyone but the Root tells the Root at
           once; it doesn't wait for the Root's approval. */
        if (!isRoot)
          log(
            `${me?.name ?? "Someone"} asked ${offering.issuerName} for your ${offering.credential} and shared your ${offering.prerequisite.credential}`,
            org.id,
          );
        return { ok: true, id };
      },

      deliverPrerequisite: (requestId) =>
        setState((s) => {
          const r = s.credentialRequests.find((x) => x.id === requestId);
          const offering = s.offerings.find((o) => o.id === r?.offeringId);
          if (!r || r.state !== "AWAITING_PROOF") return s;
          /* E16 — the presentation runs on the requester's credential:receive,
             re-checked as it runs (DA-CORE §5 step 3). If their relation has
             ended, nothing is presented: the request is withdrawn and the
             Root told. After this point nothing more runs on their authority. */
          if (!mayOperate(s, r.requestedBy, r.orgId, "credential:receive", r.credential)) {
            const who = s.people.find((p) => p.id === r.requestedBy)?.name ?? "The person who asked";
            const org = s.organizations.find((o) => o.id === r.orgId);
            const failReason = `This request was withdrawn because ${who} can no longer act for ${org ? shortOrgName(org.name) : "your organisation"}. Nothing was shared. You can ask again.`;
            return {
              ...s,
              credentialRequests: s.credentialRequests.map((x) =>
                x.id === requestId ? { ...x, state: "WITHDRAWN" as const, failCode: "REQUESTER_ENDED" as const, failReason } : x,
              ),
              activity: [{ id: rid("a"), text: failReason, at: today(), orgId: r.orgId }, ...s.activity].slice(0, 20),
            };
          }
          /* Step 5 — an offering the system answers is delivered to it. */
          const route = routeToIssuer(s.integration, offering, r.issuerOrgId);
          return {
            ...s,
            integration: route.integration,
            credentialRequests: s.credentialRequests.map((x) =>
              x.id === requestId
                ? { ...x, state: "WITH_ISSUER" as const, answerBy: inDays(offering?.answerWindowDays ?? 5), system: route.system }
                : x,
            ),
          };
        }),

      /* NEEDS_CONSENT is reached only from AWAITING_PROOF, before anything
         is presented (EW-FLOW6-SD §5.1, D10). Once the prerequisite has gone
         the request's one use is spent: a later proof request isn't part of
         it, so a request with the issuer can't be asked for more. */
      simulateAskForMore: (requestId) =>
        setState((s) => ({
          ...s,
          credentialRequests: s.credentialRequests.map((x) =>
            x.id === requestId && x.state === "AWAITING_PROOF"
              ? {
                  ...x,
                  state: "NEEDS_CONSENT" as const,
                  askedMore: { credential: "Bank account", items: ["Account holder", "Account number", "Bank"] },
                  consentBy: inDays(7),
                }
              : x,
          ),
        })),

      answerAskForMore: (requestId, share) => {
        const s0 = stateRef.current;
        const r = s0.credentialRequests.find((x) => x.id === requestId);
        if (!r || r.state !== "NEEDS_CONSENT") return;
        /* E4 — past the date the issuer stopped waiting, there's nothing left to answer. */
        if (crdEnding(r, today())) return;
        if (!mayOperate(s0, s0.harness.persona, r.orgId, "credential:receive", r.credential)) return;
        setState((s) => ({
          ...s,
          credentialRequests: s.credentialRequests.map((x) =>
            x.id !== requestId
              ? x
              : share
                ? /* What was shared beyond the first consent is recorded with the
                     request, so the record and the officer's panel both show it. */
                  { ...x, state: "AWAITING_PROOF" as const, consentBy: null, alsoShared: x.askedMore }
                : { ...x, state: "WITHDRAWN" as const, consentBy: null },
          ),
        }));
        log(share ? `Agreed to share more with ${r.issuerName}` : `Withdrew the request to ${r.issuerName}`, r.orgId);
      },

      withdrawCredentialRequest: (requestId) => {
        const s0 = stateRef.current;
        const r = s0.credentialRequests.find((x) => x.id === requestId);
        /* A2 — whoever may ask may withdraw, until the issuer has replied. */
        if (!r || !["AWAITING_PROOF", "NEEDS_CONSENT", "WITH_ISSUER"].includes(r.state)) return;
        if (!mayOperate(s0, s0.harness.persona, r.orgId, "credential:receive", r.credential)) return;
        setState((s) => ({
          ...s,
          credentialRequests: s.credentialRequests.map((x) => (x.id === requestId ? { ...x, state: "WITHDRAWN" as const } : x)),
        }));
        log(`Withdrew the request to ${r.issuerName} for ${r.credential}`, r.orgId);
      },

      issueOnRequest: (requestId, attributes) => {
        const s0 = stateRef.current;
        const r = s0.credentialRequests.find((x) => x.id === requestId);
        const issuer = s0.organizations.find((o) => o.id === r?.issuerOrgId);
        /* The OrgRoles.ISSUER user role in the issuer's own organisation. */
        if (!r || !issuer || !issuer.memberIds.includes(s0.harness.persona)) return { ok: false, error: "not_issuer" };
        if (r.state !== "WITH_ISSUER") return { ok: false, error: "E10" };
        /* Not on the queue: the system has it, and an officer answers only
           what the queue shows (E6 with fallback off). */
        if (!inOfficerQueue(r, s0.integration.queueFallback)) return { ok: false, error: "with_system" };
        if (r.answerBy && r.answerBy < today()) return { ok: false, error: "E7" };
        setState((s) => ({
          ...s,
          credentialRequests: s.credentialRequests.map((x) =>
            x.id === requestId
              ? {
                  ...x,
                  state: "OFFER_READY" as const,
                  answeredBy: s.harness.persona,
                  answeredAt: today(),
                  offer: { attributes, validUntil: null, offeredAt: today(), expiresAt: inDays(30) },
                }
              : x,
          ),
        }));
        log(`Issued ${r.credential} on request`, issuer.id);
        log(`${r.issuerName} has replied — review it`, r.orgId);
        return { ok: true };
      },

      declineOnRequest: (requestId, code, message) => {
        const s0 = stateRef.current;
        const r = s0.credentialRequests.find((x) => x.id === requestId);
        const issuer = s0.organizations.find((o) => o.id === r?.issuerOrgId);
        if (!r || !issuer || !issuer.memberIds.includes(s0.harness.persona)) return { ok: false, error: "not_issuer" };
        if (r.state !== "WITH_ISSUER") return { ok: false, error: "E10" };
        if (!inOfficerQueue(r, s0.integration.queueFallback)) return { ok: false, error: "with_system" };
        setState((s) => ({
          ...s,
          credentialRequests: s.credentialRequests.map((x) =>
            x.id === requestId
              ? { ...x, state: "DECLINED_BY_ISSUER" as const, answeredBy: s.harness.persona, answeredAt: today(), declined: { code, message: message.trim() } }
              : x,
          ),
        }));
        log(`Declined a request for ${r.credential}`, issuer.id);
        return { ok: true };
      },

      acceptCredentialOffer: (id) => {
        const s0 = stateRef.current;
        const now = today();
        const r = s0.credentialRequests.find((x) => x.id === id);
        const o = r ? undefined : s0.offers.find((x) => x.id === id);
        /* The two routes differ only in where the offer is kept: a request
           (FLOW-CRD-01) or the inbox (FLOW-CRD-02). Everything else — who
           may accept, the expiry, C2 run again, storing and superseding,
           the audit row — is the same, because SCR-CRD-04 is the same. */
        const item = r
          ? r.state === "OFFER_READY" && r.offer
            ? { orgId: r.orgId, type: r.credential, issuer: r.issuerName, recheck: r.simulatedRecheck, expiresAt: r.offer.expiresAt }
            : null
          : o && o.state === "pending"
            ? { orgId: o.orgId ?? PELDEN, type: o.type, issuer: o.issuer, recheck: o.simulatedRecheck, expiresAt: o.expiresAt }
            : null;
        if (!item) return { ok: false, error: "invalid" };
        if (!mayOperate(s0, s0.harness.persona, item.orgId, "credential:accept", item.type)) return { ok: false, error: "not_permitted" };
        const patch = (change: { state: string; failReason?: string | null; failCode?: string | null; simulatedRecheck?: null }) =>
          setState((s) => ({
            ...s,
            credentialRequests: s.credentialRequests.map((x) => (x.id === id ? ({ ...x, ...change } as typeof x) : x)),
            offers: s.offers.map((x) => (x.id === id ? ({ ...x, ...change } as typeof x) : x)),
          }));
        /* E13 / FLOW-CRD-02 E4 — 30 days have passed. */
        if (item.expiresAt < now) {
          patch(
            r
              ? { state: "EXPIRED", failReason: `This offer from ${item.issuer} expired. You can ask again.` }
              : { state: "expired" },
          );
          return { ok: false, error: "E13" };
        }
        /* C2 again, at the moment of accepting (FLOW-CRD-01 step 11, E19;
           FLOW-CRD-02 step 4, E9). Unreachable is a pause: nothing is sent
           and the offer waits. Delisted is a refusal: the offer is declined
           and the issuer told. */
        if (item.recheck === "unreachable") {
          /* The list answers again next time — the prototype's way of
             letting Try again succeed. */
          patch({ state: r ? "OFFER_READY" : "pending", simulatedRecheck: null });
          return { ok: false, error: "E19_unreachable" };
        }
        if (item.recheck === "delisted") {
          const failReason = `${item.issuer} is no longer on NDI's list of trusted organisations, so this can't be added.`;
          patch({ state: r ? "FAILED" : "failed", failReason, failCode: "ISSUER_NOT_TRUSTED", simulatedRecheck: null });
          log(`${item.type} from ${item.issuer} wasn't added: ${item.issuer} is no longer on NDI's list of trusted organisations`, item.orgId);
          return { ok: false, error: "E19_delisted" };
        }
        const issuerDid = r ? (s0.organizations.find((x) => x.id === r.issuerOrgId)?.publicDid ?? "") : (o?.issuerDid ?? "");
        const attributes = r?.offer?.attributes ?? o?.attributes ?? [];
        const validUntil = r ? (r.offer?.validUntil ?? null) : (o?.attributes.find((a) => a.name === "valid_until")?.value ?? null);
        setState((s) => {
          const relation = s.relations.find(
            (x) => x.personId === s.harness.persona && (x.orgId ?? PELDEN) === item.orgId && x.state === "ACTIVE",
          );
          return {
            ...s,
            heldCredentials: storeAccepted(s.heldCredentials, {
              orgId: item.orgId,
              type: item.type,
              issuer: item.issuer,
              issuerDid,
              attributes,
              expiresAt: validUntil,
            }),
            credentialRequests: s.credentialRequests.map((x) => (x.id === id ? { ...x, state: "ISSUED" as const } : x)),
            /* Q2 — the inbox item is closed as accepted, with the accepter. */
            offers: s.offers.map((x) =>
              x.id === id ? { ...x, state: "accepted" as const, decidedBy: s.harness.persona, decidedAt: now } : x,
            ),
            /* Step 9 — the issuer's system is told what it answered was
               issued (Q3). Only a system's answer: an officer's isn't
               delivered to a webhook. */
            integration: r?.answeredBySystem ? withLogRow(s.integration, "credential-request.issued", 200) : s.integration,
            auditEntries: appendAudit(s, {
              operation: "credential:accept",
              summary: `Accepted ${item.type} from ${item.issuer}`,
              actorId: s.harness.persona,
              relationId: relation?.id ?? null,
              scopeVersion: relation?.scope.version ?? null,
            }),
          };
        });
        log(`Added ${item.type} from ${item.issuer} to your credentials`, item.orgId);
        return { ok: true };
      },

      declineCredentialOffer: (id) => {
        const s0 = stateRef.current;
        const r = s0.credentialRequests.find((x) => x.id === id);
        const o = r ? undefined : s0.offers.find((x) => x.id === id);
        if (r) {
          if (r.state !== "OFFER_READY") return;
          if (!mayOperate(s0, s0.harness.persona, r.orgId, "credential:accept", r.credential)) return;
          setState((s) => ({
            ...s,
            credentialRequests: s.credentialRequests.map((x) => (x.id === id ? { ...x, state: "DECLINED_BY_HOLDER" as const } : x)),
          }));
          log(`Declined ${r.credential} from ${r.issuerName}. Nothing was added`, r.orgId);
          return;
        }
        /* FLOW-CRD-02 A1 — declined with a problem report; the issuer is told. */
        if (!o || o.state !== "pending") return;
        const orgId = o.orgId ?? PELDEN;
        if (!mayOperate(s0, s0.harness.persona, orgId, "credential:accept", o.type)) return;
        setState((s) => ({
          ...s,
          offers: s.offers.map((x) => (x.id === id ? { ...x, state: "declined" as const, decidedBy: s.harness.persona, decidedAt: today() } : x)),
        }));
        log(`Declined ${o.type} from ${o.issuer}. Nothing was added`, orgId);
      },

      simulateIssuerRecheck: (id, outcome) =>
        setState((s) => ({
          ...s,
          credentialRequests: s.credentialRequests.map((x) =>
            x.id === id && x.state === "OFFER_READY" ? { ...x, simulatedRecheck: outcome } : x,
          ),
          offers: s.offers.map((x) => (x.id === id && x.state === "pending" ? { ...x, simulatedRecheck: outcome } : x)),
        })),

      setOfferingStatus: (offeringId, status) => {
        const s0 = stateRef.current;
        const o = s0.offerings.find((x) => x.id === offeringId);
        if (!o || !issuerOwner(s0, o.issuerOrgId)) return;
        setState((s) => ({ ...s, offerings: s.offerings.map((x) => (x.id === offeringId ? { ...x, status } : x)) }));
        log(`${status === "PAUSED" ? "Paused" : status === "RETIRED" ? "Retired" : "Resumed"} ${o.credential}`, o.issuerOrgId);
      },

      publishOfferingVersion: (offeringId, changes) => {
        const s0 = stateRef.current;
        const o0 = s0.offerings.find((x) => x.id === offeringId);
        if (!o0 || !issuerOwner(s0, o0.issuerOrgId)) return;
        log(`Published version ${o0.version + 1} of ${o0.credential}`, o0.issuerOrgId);
        setState((s) => ({
          ...s,
          offerings: s.offerings.map((o) =>
            o.id === offeringId
              ? {
                  ...o,
                  version: o.version + 1,
                  answerWindowDays: changes.answerWindowDays,
                  renewable: changes.renewable,
                  prerequisite: { ...o.prerequisite, uses: changes.uses },
                }
              : o,
          ),
        }));
      },

      setWebhook: (url) =>
        issuerOwner(stateRef.current, stateRef.current.integration.orgId) &&
        setState((s) => ({ ...s, integration: { ...s.integration, webhookUrl: url.trim() || null, secretRotatedAt: s.integration.secretRotatedAt ?? today() } })),

      rotateSecret: () =>
        issuerOwner(stateRef.current, stateRef.current.integration.orgId) &&
        setState((s) => ({ ...s, integration: { ...s.integration, secretRotatedAt: today() } })),

      createClient: (name) =>
        issuerOwner(stateRef.current, stateRef.current.integration.orgId) &&
        setState((s) => ({
          ...s,
          integration: { ...s.integration, clients: [...s.integration.clients, { id: rid("cli"), name: name.trim(), createdAt: today() }] },
        })),

      setQueueFallback: (on) =>
        issuerOwner(stateRef.current, stateRef.current.integration.orgId) &&
        setState((s) => ({ ...s, integration: { ...s.integration, queueFallback: on } })),

      sendTestEvent: () =>
        issuerOwner(stateRef.current, stateRef.current.integration.orgId) &&
        setState((s) => {
          /* A delivery that works again hands over what it missed (E5, E6):
             the system gets those requests now and answers them, unless an
             officer got there first. */
          const missed = s.integration.failingSince
            ? s.credentialRequests.filter((x) => x.state === "WITH_ISSUER" && x.system?.state === "MISSED").map((x) => x.id)
            : [];
          let integration = withLogRow({ ...s.integration, failingSince: null, lastError: null }, "test.ping", 200);
          missed.forEach(() => {
            integration = withLogRow(integration, "credential-request.received", 200, 2);
          });
          return {
            ...s,
            integration,
            credentialRequests: s.credentialRequests.map((x) =>
              missed.includes(x.id) && x.system ? { ...x, system: { ...x.system, state: "WAITING" as const, plan: "answer" as const } } : x,
            ),
          };
        }),

      setSystemNextAnswer: (next) =>
        issuerOwner(stateRef.current, stateRef.current.integration.orgId) &&
        setState((s) => ({ ...s, integration: { ...s.integration, nextAnswer: next } })),

      simulateSystemAnswer: (requestId) => setState((s) => (systemConnected(s.integration) ? systemAnswers(s, requestId, true) : s)),

      stopEntityType: (designationId, entityType) => {
        const s0 = stateRef.current;
        const d = s0.designations.find((x) => x.id === designationId);
        const org = s0.organizations.find((o) => o.id === d?.orgId);
        if (!d || !org || roleIn(org, s0.people.find((p) => p.id === s0.harness.persona)) !== "Owner") return { ok: false, error: "not_owner" };
        /* A2 — the whole set for this type stops, its authorisation with
           it; other types and NDI's membership are untouched. */
        setState((s) => ({
          ...s,
          adoptions: s.adoptions.map((a) =>
            a.designationId === designationId && a.entityType === entityType && a.state === "ACTIVE"
              ? { ...a, state: "WITHDRAWN" as const, stoppedBy: s.harness.persona, stoppedAt: today() }
              : a,
          ),
          authorisations: s.authorisations.map((z) =>
            z.designationId === designationId && z.entityType === entityType && z.state === "ACTIVE"
              ? { ...z, state: "WITHDRAWN" as const, withdrawnBy: s.harness.persona, withdrawnAt: today() }
              : z,
          ),
        }));
        log("Stopped an entity type. Businesses already verified are not affected", org.id);
        return { ok: true };
      },

      /* ---- Presenting a credential (Flow 7) ---- */

      shareVerdict: (requestId) => {
        const s0 = stateRef.current;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        return r ? sharing.shareVerdict(s0, s0.harness.persona, r) : null;
      },

      matchRequest: (requestId) => {
        const s0 = stateRef.current;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        return r ? sharing.matchRequest(s0, r) : [];
      },

      whoApproves: (requestId) => {
        const s0 = stateRef.current;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        if (!r) return [];
        return sharing.approversFor(s0, r.orgId ?? PELDEN, r.initiatedBy ?? s0.harness.persona);
      },

      canManageReturnAddresses: () => {
        const s0 = stateRef.current;
        const org = s0.organizations.find((o) => o.id === s0.activeOrgId);
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        return Boolean(org && sharing.listedVerifier(s0, org.id) && roleIn(org, me) === "Owner");
      },

      sharingOrgs: () => {
        const s0 = stateRef.current;
        return sharing.holdersActedFor(s0, s0.harness.persona);
      },

      startPresentationSession: (verifierOrgId, displayReference) => {
        const s0 = stateRef.current;
        /* The capability gate on the verifier's side (§7.1 step 1): only an
           organisation with an ACTIVE VERIFIER source gets a link at all. */
        if (!sharing.listedVerifier(s0, verifierOrgId)) return null;
        const id = `ps_${Math.random().toString(36).slice(2, 12)}`;
        const session: PresentationSession = {
          id,
          verifierOrgId,
          asked: [{ id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number", "entity_type"] }],
          purpose: "To open a business current account we check your company's registration against the Registrar's record.",
          returnUrlId: "ekyb-return",
          state: `app_${Math.random().toString(36).slice(2, 10)}`,
          displayReference,
          status: "CREATED",
          createdAt: Date.now(),
          firstLoadedAt: null,
          redeemedAt: null,
          boundOrgId: null,
          requestId: null,
        };
        setState((s) => ({ ...s, presentationSessions: [session, ...s.presentationSessions] }));
        return id;
      },

      openPresentationSession: (sessionId) => {
        const s0 = stateRef.current;
        const session = s0.presentationSessions.find((x) => x.id === sessionId);
        /* E1 — no session: nothing is known, so no return is offered. */
        if (!session) return { kind: "unknown" };
        /* The name NDI lists, read from the platform's record — never from
           the link (UXD-41, §8 "where the name comes from before V1"). */
        const verifierName = s0.organizations.find((o) => o.id === session.verifierOrgId)?.name ?? "the website you came from";
        /* E3 — already redeemed. Its status to the organisation it's bound
           to, nothing to anyone else (S7). */
        if (session.boundOrgId) {
          const bound = sharing.holdersActedFor(s0, s0.harness.persona).some((o) => o.id === session.boundOrgId);
          return { kind: "used", verifierName, requestId: bound ? session.requestId : null, sessionId };
        }
        if (session.status === "DECLINED" || session.status === "FAILED") return { kind: "used", verifierName, requestId: null, sessionId };
        /* E2 — past either window. */
        if (session.status === "EXPIRED" || sharing.sessionLapsed(session)) {
          if (session.status !== "EXPIRED")
            setState((s) => ({ ...s, presentationSessions: s.presentationSessions.map((x) => (x.id === sessionId ? { ...x, status: "EXPIRED" as const } : x)) }));
          return { kind: "expired", verifierName, sessionId };
        }
        /* The first load starts the 30 minutes; a reload during sign-in is
           not a second use (P1). */
        if (session.firstLoadedAt === null)
          setState((s) => ({
            ...s,
            presentationSessions: s.presentationSessions.map((x) => (x.id === sessionId && x.firstLoadedAt === null ? { ...x, firstLoadedAt: Date.now() } : x)),
          }));
        return { kind: "ready", verifierName, displayReference: session.displayReference, sessionId };
      },

      redeemPresentationSession: (sessionId, orgId, opts) => {
        const s0 = stateRef.current;
        const session = s0.presentationSessions.find((x) => x.id === sessionId);
        if (!session) return { ok: false, error: "E1" };
        if (session.boundOrgId) return { ok: false, error: "E3", requestId: session.boundOrgId === orgId ? session.requestId : null };
        const setSession = (patch: Partial<PresentationSession>) =>
          setState((s) => ({ ...s, presentationSessions: s.presentationSessions.map((x) => (x.id === sessionId ? { ...x, ...patch } : x)) }));
        if (session.status === "EXPIRED" || sharing.sessionLapsed(session)) {
          setSession({ status: "EXPIRED" });
          return { ok: false, error: "E2" };
        }
        /* P2/E4 — only an organisation this person acts for, verified and
           holding. A direct call naming another is refused like the list. */
        if (!sharing.holdersActedFor(s0, s0.harness.persona).some((o) => o.id === orgId)) {
          setSession({ status: "DECLINED" });
          return { ok: false, error: "E4" };
        }
        /* Steps 4–6. The invitation is received, the request arrives on it,
           and V1 reads the verifier from the session — never from the
           request (§6). A verifier no longer listed is BLOCKED (E7). */
        const verifier = sharing.listedVerifier(s0, session.verifierOrgId);
        const listed = s0.organizations.find((o) => o.id === session.verifierOrgId);
        /* E8 — NDI's list can't be reached at V1: held RECEIVED and checked
           again, never passed unchecked. The person may go back pending, and
           finds it on Waiting as "Checking …" (UX-EW-04 v0.3). */
        const held = Boolean(opts?.registryDown);
        const id = rid("pr");
        const request: PresentationRequest = {
          id,
          orgId,
          verifierOrgId: session.verifierOrgId,
          verifierName: listed?.name ?? "Unknown",
          verifierDid: listed ? sharing.verifierDidOf(listed) : "",
          purpose: session.purpose,
          asked: session.asked,
          sessionId,
          displayReference: session.displayReference,
          status: held ? "RECEIVED" : verifier ? "OPEN" : "BLOCKED",
          blockedReason: held || verifier ? null : "VERIFIER_NOT_TRUSTED",
          openedBy: s0.harness.persona,
          receivedAt: today(),
          expiresAt: sharing.expiresFromToday(),
        };
        setState((s) => ({
          ...s,
          presentationRequests: [request, ...s.presentationRequests],
          presentationSessions: s.presentationSessions.map((x) =>
            x.id === sessionId ? { ...x, boundOrgId: orgId, redeemedAt: Date.now(), requestId: id, status: "OPENED" as const } : x,
          ),
        }));
        if (held) return { ok: false, error: "E8", requestId: id };
        return verifier ? { ok: true, requestId: id } : { ok: false, error: "E7", requestId: id };
      },

      shareRequest: (requestId, chosen) => {
        const s0 = stateRef.current;
        const me = s0.harness.persona;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        /* Compare-and-set on OPEN: two people sharing at once send once, and
           the second sees who answered (E10, AC-09). */
        if (!r || sharing.statusOf(r) !== "OPEN") return { ok: false, error: "E10" };
        const verdict = sharing.shareVerdict(s0, me, r);
        /* Refused through the API as well as on the screen, and recorded
           (§10): no proof:present (E4/E10), or outside the reach (E5). */
        if (verdict.kind === "no_permission" || verdict.kind === "outside_reach") {
          setState((s) => refusedOnRecord(s, me, r, verdict.kind === "no_permission" ? "sharing without Share" : "sharing outside the reach the Root set"));
          return { ok: false, error: verdict.kind === "no_permission" ? "E4" : "E5" };
        }
        if (verdict.kind === "no_approver") return { ok: false, error: "E13" };
        const matches = sharing.matchRequest(s0, r);
        if (!sharing.satisfiable(matches)) return { ok: false, error: "E3" };
        /* D18 — the newest valid credential unless the person chose another
           that still answers the descriptor. */
        const pick: Record<string, string> = {};
        for (const m of matches) {
          const wanted = chosen[m.descriptor.id];
          pick[m.descriptor.id] = m.options.some((c) => c.id === wanted) ? wanted : m.options[0].id;
        }
        const orgId = r.orgId ?? PELDEN;
        const myName = s0.people.find((p) => p.id === me)?.name ?? "Someone";
        const types = typesOf(r);

        if (verdict.kind === "auto") {
          /* V1/V2 again, immediately before sending (§6). */
          if (!sharing.listedVerifier(s0, r.verifierOrgId)) {
            const failure = `${r.verifierName} can't receive this any more. Nothing has been shared.`;
            setState((s) => ({ ...s, presentationRequests: s.presentationRequests.map((x) => (x.id === requestId ? { ...x, status: "FAILED" as const, failure } : x)) }));
            return { ok: false, error: "E8" };
          }
          setState((s) => applyShare(s, requestId, pick, me, null));
          /* D20 — someone other than the Root shared: the Root is told at once. */
          const root = sharing.rootOf(s0, orgId);
          if (root && root !== me) {
            const rootName = s0.people.find((p) => p.id === root)?.name ?? "The representative";
            log(`To ${rootName}: ${NOTICE.rootTold(myName, orgNameOf(s0, orgId), types, r.verifierName, null)}`, orgId);
          }
          return { ok: true, status: "SHARED" };
        }

        /* SINGLE_APPROVER (A1). The share waits as a parked operation, so it
           sits in the Approvals queue beside everything else that waits, and
           approveOperation — which never lets anyone approve their own — is
           the one way it runs. */
        const relation = s0.relations.find((x) => x.personId === me && (x.orgId ?? PELDEN) === orgId && x.state === "ACTIVE");
        const opId = rid("park");
        setState((s) => ({
          ...s,
          presentationRequests: s.presentationRequests.map((x) =>
            x.id === requestId
              ? {
                  ...x,
                  status: "AWAITING_APPROVAL" as const,
                  chosen: pick,
                  initiatedBy: me,
                  initiatedAt: today(),
                  approvalId: opId,
                  rejection: null,
                  lapsedSharer: null,
                  failure: null,
                }
              : x,
          ),
          parkedOperations: [
            {
              id: opId,
              orgId: r.orgId,
              operation: "proof:present" as const,
              summary: `Share ${types} with ${r.verifierName}`,
              requestedBy: me,
              relationId: relation?.id ?? "",
              scopeVersion: relation?.scope.version ?? 1,
              targetId: requestId,
              targetRelyingParty: r.verifierName,
              payloadHash: `sha256:${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
              policy: "SINGLE_APPROVER" as const,
              requiredSignatures: 1,
              signatures: [],
              state: "parked" as const,
              decisionReason: null,
              createdAt: today(),
              expiresAt: r.expiresAt,
            },
            ...s.parkedOperations,
          ],
          auditEntries: appendAudit(s, {
            operation: "proof:present",
            summary: `Chose to share ${types} with ${r.verifierName} — sent for approval`,
            actorId: me,
            relationId: relation?.id ?? null,
            scopeVersion: relation?.scope.version ?? null,
            relyingPartyDid: r.verifierDid,
          }),
        }));
        log(`To ${namesOf(verdict.approvers.map((id) => s0.people.find((p) => p.id === id)?.name ?? id))}: ${NOTICE.approve(myName, types, r.verifierName)}`, orgId);
        return { ok: true, status: "AWAITING_APPROVAL", approvers: verdict.approvers };
      },

      declineRequest: (requestId) => {
        const s0 = stateRef.current;
        const me = s0.harness.persona;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        if (!r || sharing.statusOf(r) !== "OPEN") return { ok: false, error: "E10" };
        /* Declining answers the bank, so it needs what sharing needs —
           proof:present for this verifier (FLOW-PRS-02 §7.2). It doesn't
           need an approver: refusing sends nothing. */
        const verdict = sharing.shareVerdict(s0, me, r);
        if (verdict.kind === "no_permission") return { ok: false, error: "E4" };
        if (verdict.kind === "outside_reach") return { ok: false, error: "E5" };
        const relation = s0.relations.find((x) => x.personId === me && (x.orgId ?? PELDEN) === (r.orgId ?? PELDEN) && x.state === "ACTIVE");
        setState((s) => ({
          ...s,
          presentationRequests: s.presentationRequests.map((x) =>
            x.id === requestId ? { ...x, status: "DECLINED" as const, decidedBy: me, decidedAt: today() } : x,
          ),
          auditEntries: appendAudit(s, {
            operation: "proof:present",
            summary: `Declined ${r.verifierName}'s request for ${typesOf(r)}`,
            actorId: me,
            relationId: relation?.id ?? null,
            scopeVersion: relation?.scope.version ?? null,
            relyingPartyDid: r.verifierDid,
          }),
        }));
        return { ok: true };
      },

      passRequest: (requestId) => {
        const s0 = stateRef.current;
        const me = s0.harness.persona;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        if (!r || sharing.statusOf(r) !== "OPEN") return { ok: false, error: "E10" };
        const orgId = r.orgId ?? PELDEN;
        if (!mayOperate(s0, me, orgId, "credential:list")) return { ok: false, error: "not_permitted" };
        const to = sharing.whoCanShare(s0, r, me);
        const myName = s0.people.find((p) => p.id === me)?.name ?? "Someone";
        const relation = s0.relations.find((x) => x.personId === me && (x.orgId ?? PELDEN) === orgId && x.state === "ACTIVE");
        setState((s) => ({
          ...s,
          presentationRequests: s.presentationRequests.map((x) =>
            x.id === requestId ? { ...x, passedBy: [...(x.passedBy ?? []).filter((p) => p !== me), me] } : x,
          ),
          /* A pass is on the record like consent and decline (§10). */
          auditEntries: appendAudit(s, {
            operation: "credential:list",
            summary: `Passed ${r.verifierName}'s request for ${typesOf(r)} to ${namesOf(to.map((id) => s0.people.find((p) => p.id === id)?.name ?? id)) || "nobody"}`,
            actorId: me,
            relationId: relation?.id ?? null,
            scopeVersion: relation?.scope.version ?? null,
            relyingPartyDid: r.verifierDid,
          }),
        }));
        if (to.length)
          log(`To ${namesOf(to.map((id) => s0.people.find((p) => p.id === id)?.name ?? id))}: ${NOTICE.passed(myName, r.verifierName, r.expiresAt)}`, orgId);
        return { ok: true, to };
      },

      keepForLater: (requestId) => {
        const s0 = stateRef.current;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        if (!r || sharing.statusOf(r) !== "OPEN") return;
        setState((s) => ({
          ...s,
          presentationSessions: s.presentationSessions.map((x) => (x.id === r.sessionId ? { ...x, returnedPending: true } : x)),
        }));
        /* A3 — kept, so the people who may answer are told now rather than
           after ten undecided minutes. */
        tellUndecided(s0, r, s0.harness.persona);
      },

      remindUndecided: (requestId) => {
        const s0 = stateRef.current;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        if (!r || !r.sessionId || sharing.statusOf(r) !== "OPEN" || r.undecidedToldAt) return;
        tellUndecided(s0, r, r.openedBy ?? null);
      },

      returnToVerifier: (sessionId) => {
        const s0 = stateRef.current;
        const session = s0.presentationSessions.find((x) => x.id === sessionId);
        if (!session) return { url: null, status: "failed" };
        const request = s0.presentationRequests.find((x) => x.id === session.requestId);
        /* Going back without a final answer is what makes the session
           PENDING (§5.1) — the verifier's page must not say it has it. */
        const pending = request ? sharing.isLive(sharing.statusOf(request)) : false;
        if (pending && !session.returnedPending)
          setState((s) => ({ ...s, presentationSessions: s.presentationSessions.map((x) => (x.id === sessionId ? { ...x, returnedPending: true } : x)) }));
        const status = sharing.sessionStatusOf({ ...session, returnedPending: session.returnedPending || pending }, request).toLowerCase();
        /* Only a registered address, matched by identifier (D9). One that
           has been removed means no link at all (E15). */
        const address = s0.returnAddresses.find((a) => a.orgId === session.verifierOrgId && a.returnUrlId === session.returnUrlId && !a.removedAt);
        if (!address) return { url: null, status };
        return { url: `/simulated/bank/return?session=${session.id}&state=${session.state}&status=${status}`, status };
      },

      withdrawPresentationRequest: (requestId) =>
        setState((s) => {
          const r = s.presentationRequests.find((x) => x.id === requestId);
          if (!r || !sharing.isLive(sharing.statusOf(r))) return s;
          return {
            ...s,
            presentationRequests: s.presentationRequests.map((x) => (x.id === requestId ? { ...x, status: "WITHDRAWN" as const } : x)),
            /* E7 — approvers' pending items are removed, not left to be decided. */
            parkedOperations: s.parkedOperations.filter((p) => p.id !== r.approvalId),
          };
        }),

      simulateIncomingRequest: (kind) => {
        const s0 = stateRef.current;
        const active = s0.organizations.find((o) => o.id === s0.activeOrgId);
        const orgId = active?.capabilities.includes("holder") ? active.id : PELDEN;
        const bob = s0.organizations.find((o) => o.id === "org-bob");
        const id = rid("pr");
        const base = {
          id,
          orgId,
          sessionId: null,
          displayReference: null,
          receivedAt: today(),
          expiresAt: sharing.expiresFromToday(),
        };
        let request: PresentationRequest;
        if (kind === "untrusted") {
          /* E1 — the sender isn't on the platform, so the name is only what
             it claimed. BLOCKED, on Refused, and nobody is told. */
          request = {
            ...base,
            verifierOrgId: null,
            verifierName: "Druk Express Finance",
            verifierDid: "did:polygon:0x5e1b0c77d9a34f2c8e60b1d47a29f3c58e0d6b12",
            purpose: "Pre-approved business loan — confirm your details.",
            asked: [{ id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number"] }],
            status: "BLOCKED",
            blockedReason: "VERIFIER_NOT_TRUSTED",
          };
        } else {
          const asked = [{ id: "registration", credentialType: "Business Registration", fields: ["registered_name", "registration_number", "status"] }];
          const purpose = kind === "bank_recheck" ? "Annual re-check that a business customer is registered and active." : "Updating a business customer's registered details.";
          /* E12 — identical to one already OPEN: its own request, marked. */
          const repeat = s0.presentationRequests.find(
            (x) =>
              (x.orgId ?? PELDEN) === orgId &&
              x.verifierOrgId === "org-bob" &&
              x.purpose === purpose &&
              sharing.statusOf(x) === "OPEN",
          );
          request = {
            ...base,
            verifierOrgId: "org-bob",
            verifierName: bob?.name ?? "Bank of Bhutan",
            verifierDid: bob ? sharing.verifierDidOf(bob) : "",
            purpose,
            asked,
            /* E2 — NDI's list can't be reached: held RECEIVED, never passed
               unchecked, and nobody is told until it passes. */
            status: kind === "registry_down" ? "RECEIVED" : "OPEN",
            repeatOf: repeat?.id ?? null,
          };
        }
        setState((s) => ({ ...s, presentationRequests: [request, ...s.presentationRequests] }));
        if (request.status === "OPEN") {
          const to = sharing.answerersFor(s0, request);
          if (to.length)
            log(
              `To ${namesOf(to.map((pid) => s0.people.find((p) => p.id === pid)?.name ?? pid))}: ${NOTICE.ready(request.verifierName, orgNameOf(s0, orgId), request.purpose, request.expiresAt)}`,
              orgId,
            );
        }
        return id;
      },

      resolveRegistryCheck: (requestId) => {
        const s0 = stateRef.current;
        const r = s0.presentationRequests.find((x) => x.id === requestId);
        if (!r || sharing.statusOf(r) !== "RECEIVED") return;
        const passes = Boolean(sharing.listedVerifier(s0, r.verifierOrgId));
        setState((s) => ({
          ...s,
          presentationRequests: s.presentationRequests.map((x) =>
            x.id === requestId ? { ...x, status: passes ? ("OPEN" as const) : ("BLOCKED" as const), blockedReason: passes ? null : "VERIFIER_NOT_TRUSTED" } : x,
          ),
        }));
        if (passes) {
          const to = sharing.answerersFor(s0, r);
          if (to.length)
            log(
              `To ${namesOf(to.map((id) => s0.people.find((p) => p.id === id)?.name ?? id))}: ${NOTICE.ready(r.verifierName, orgNameOf(s0, r.orgId ?? PELDEN), r.purpose, r.expiresAt)}`,
              r.orgId ?? PELDEN,
            );
        }
      },

      addReturnAddress: (url) => {
        const s0 = stateRef.current;
        const org = s0.organizations.find((o) => o.id === s0.activeOrgId);
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        /* The verifier's OWNER, of an organisation approved to verify (SCR-PRS-06). */
        if (!org || !sharing.listedVerifier(s0, org.id) || roleIn(org, me) !== "Owner") return { ok: false, error: "not_owner" };
        const value = url.trim();
        if (!value.toLowerCase().startsWith("https://")) return { ok: false, error: "not_https" };
        if (value.includes("*")) return { ok: false, error: "wildcard" };
        let parsed: URL;
        try {
          parsed = new URL(value);
        } catch {
          return { ok: false, error: "not_full" };
        }
        if (!parsed.hostname.includes(".") || parsed.pathname === "/" || /\s/.test(value)) return { ok: false, error: "not_full" };
        if (s0.returnAddresses.some((a) => a.orgId === org.id && a.url === value && !a.removedAt)) return { ok: false, error: "duplicate" };
        const slug = parsed.pathname.split("/").filter(Boolean).join("-").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "return";
        setState((s) => ({
          ...s,
          returnAddresses: [
            ...s.returnAddresses,
            { id: rid("ra"), orgId: org.id, returnUrlId: `${slug}-${Math.random().toString(36).slice(2, 6)}`, url: value, addedBy: s.harness.persona, addedAt: today() },
          ],
        }));
        /* §7.3 — every change goes to all of the verifier's owners and to NDI at once. */
        log(`Return address added: ${value}. Sent to every owner and to NDI`, org.id);
        return { ok: true };
      },

      removeReturnAddress: (id) => {
        const s0 = stateRef.current;
        const org = s0.organizations.find((o) => o.id === s0.activeOrgId);
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const address = s0.returnAddresses.find((a) => a.id === id);
        if (!org || !address || address.orgId !== org.id || roleIn(org, me) !== "Owner") return;
        setState((s) => ({
          ...s,
          returnAddresses: s.returnAddresses.map((a) => (a.id === id ? { ...a, removedAt: today(), removedBy: s.harness.persona } : a)),
        }));
        log(`Return address removed: ${address.url}. Sent to every owner and to NDI`, org.id);
      },

      setPersona: (persona) =>
        setState((s) => {
          /* Driving as someone puts you in their organisation — Yeshey's
             console is Bank of Bhutan's, never Pelden's. Administrators
             belong to none, so the workspace stays where it was. */
          const home = s.organizations.find((o) => o.memberIds.includes(persona));
          return { ...s, activeOrgId: home?.id ?? s.activeOrgId, harness: { ...s.harness, persona } };
        }),

      setAct: (act) => setState((s) => ({ ...s, harness: { ...s.harness, act } })),

      setRunnerOpen: (runnerOpen) =>
        setState((s) => ({ ...s, harness: { ...s.harness, runnerOpen } })),

      setGuideStep: (guideStep) =>
        setState((s) => ({ ...s, harness: { ...s.harness, guideStep } })),

      setSelfServiceSignup: (selfServiceSignup) =>
        setState((s) => ({ ...s, harness: { ...s.harness, selfServiceSignup } })),

      setStateOverride: (screen, override) =>
        setState((s) => {
          const next = { ...s.harness.stateOverrides };
          /* null removes the key rather than storing it, so "no override"
             and "overridden to nothing" cannot be confused downstream. */
          if (override === null) delete next[screen];
          else next[screen] = override;
          return { ...s, harness: { ...s.harness, stateOverrides: next } };
        }),

      clearStateOverrides: () =>
        setState((s) => ({ ...s, harness: { ...s.harness, stateOverrides: {} } })),

      resetDemo: () => {
        setState(FRESH);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* nothing to clear */
        }
      },
    }),
    [hydrated, log, tellUndecided],
  );

  /**
   * People lookups are derived from state, so they live here rather than in
   * the actions memo — that one is deliberately state-free so callbacks stay
   * stable across renders.
   *
   * `personById` returns a placeholder rather than undefined for an unknown
   * id. Dual attribution appears on every audit row and approval record, and
   * a missing name there should read as a data problem in one row, not throw
   * and take the whole trail down.
   */
  const derived = useMemo<DemoDerived>(() => {
    const find = (id: string): Person =>
      state.people.find((p) => p.id === id) ?? {
        id,
        name: "Unknown person",
        cid: "—",
        email: "—",
        title: "No longer on record",
        cidVerified: false,
      };
    return { currentPerson: find(state.harness.persona), personById: find, connectedKinds: connectedKinds(state) };
  }, [state]);

  const value = useMemo<DemoContextValue>(
    () => ({ ...state, ...actions, ...derived }),
    [state, actions, derived],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
