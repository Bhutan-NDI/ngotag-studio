/**
 * The scope grammar — structured authority rendered as English.
 *
 * This is the product's conceptual core. If someone cannot read a scope and
 * tell you what a person may and may not do, nothing else in the Entity
 * Wallet matters, so the formatter is a pure function kept apart from any
 * component: it is the thing that gets iterated twenty times, and it should
 * be possible to change a word without touching JSX.
 *
 * WHAT WRITING THE SENTENCES BY HAND TAUGHT US
 *
 * Six were drafted before any of this existed, and three of them broke the
 * model that seemed obvious at the time:
 *
 *  1. "Rinzin may present proofs using Business Registration credentials to
 *      BNSW and Bank of Bhutan, until 31 Dec 2026. Every presentation needs
 *      one approver."
 *      — fine. This is the shape everything else was measured against.
 *
 *  2. "Rinzin may accept credential offers of any type, until 31 Dec 2026.
 *      Accepting happens straight away, with no approver."
 *      — broke the first model. The approval clause is per operation, not per
 *      relation: accepting is automatic while presenting needs a signature.
 *      A single trailing sentence about approval can only ever be true when
 *      every operation agrees, which is the uncommon case. Hence one sentence
 *      per grant, and `describeRelation` returning a list.
 *
 *  3. "Dorji may do anything the entity can do, with no end date."
 *      — broke it again. Enumerating six operations, each "of any type, to
 *      any relying party", is technically the same information and useless to
 *      read. Full scope is a special case with its own sentence.
 *
 *  4. "Rinzin may create connections with anyone, until 31 Dec 2026."
 *      — fine, and confirmed that operations with no meaningful credential or
 *      relying-party dimension must not print empty clauses about them.
 *
 *  5. "Karma may present proofs using Tax Clearance Certificate credentials
 *      to Bank of Bhutan, until 31 Dec 2026. Every presentation needs two
 *      approvers."
 *      — fine, but note the status is nowhere in the sentence. Karma's
 *      relation is terminated. Lifecycle state belongs to a `StatusPill`
 *      beside the sentence, never inside it: a sentence that says "may" while
 *      the relation is dead is a sentence that lies, and the fix is to put the
 *      state where it cannot be missed rather than to bury a negation in the
 *      prose.
 *
 *  6. "Rinzin may not present proofs to anyone else."
 *      — the negative. Deliberately NOT generated: an authority is defined by
 *      what it permits, and a UI that tries to enumerate everything a person
 *      cannot do will be wrong the moment the operation list grows. The
 *      "only" in `describeGrant`'s relying-party clause carries this instead,
 *      and denial gets stated concretely at the point of denial — where the
 *      server has told us which rule bit.
 *
 * Everything here is presentation. Nothing in this file decides whether an
 * operation is permitted; that answer arrives from the server as a
 * `ScopeDecision`.
 */

import type {
  ApprovalPolicy,
  ControllerOperation,
  LegalBasis,
  Scope,
  ScopeGrant,
} from "@/lib/demoData";

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

/**
 * Each operation, with its own way of talking about itself.
 *
 * An earlier version shared one clause template across every operation and
 * produced "may accept credential offers using Business Registration
 * credentials" and "may see the credentials the entity holds of any type".
 * Both are wrong English, and the shared template was why: the credential
 * dimension is a *filter on what is accepted* for one operation and a
 * *choice of what to show* for another, so it cannot share a preposition.
 *
 * `gateable` marks the operations an approval policy can meaningfully hold
 * back. Being sent an offer and reading a list are not decisions anybody
 * approves, and "each view happens straight away, with no approver" is a
 * sentence that makes the reader wonder what they missed.
 */
const OPERATIONS: Record<
  ControllerOperation,
  {
    verb: string;
    /** The thing an approval gates, for "every ___ needs one approver". */
    noun: string;
    label: string;
    /** Credential-type clause. null means this operation does not print one. */
    typeAny: string | null;
    typeList: ((types: string) => string) | null;
    /** Relying-party clause. */
    partyAny: string | null;
    partyList: ((parties: string) => string) | null;
    gateable: boolean;
  }
> = {
  "credential:receive": {
    verb: "be sent credential offers",
    noun: "offer",
    label: "Receive offers",
    typeAny: null,
    typeList: (types) => `for ${types}`,
    partyAny: null,
    partyList: null,
    gateable: false,
  },
  "credential:accept": {
    verb: "accept offers",
    noun: "acceptance",
    label: "Accept offers",
    typeAny: "of any credential type",
    typeList: (types) => `of ${types}`,
    partyAny: null,
    partyList: null,
    gateable: true,
  },
  "credential:list": {
    verb: "see the credentials the entity holds",
    noun: "view",
    label: "View held credentials",
    typeAny: null,
    typeList: (types) => `, limited to ${types}`,
    partyAny: null,
    partyList: null,
    gateable: false,
  },
  "proof:present": {
    verb: "present proofs",
    noun: "presentation",
    label: "Present proofs",
    typeAny: "using any credential the entity holds",
    typeList: (types) => `using ${types} credentials`,
    partyAny: "to any relying party",
    /* "only" is what makes a narrow grant read as narrow. Without it the
       sentence lists two counterparties and leaves the reader to infer the
       boundary — exactly the inference the Owner is afraid of getting wrong. */
    partyList: (parties) => `to ${parties} only`,
    gateable: true,
  },
  "connection:create": {
    verb: "create connections",
    noun: "connection",
    label: "Create connections",
    typeAny: null,
    typeList: null,
    partyAny: null,
    partyList: (parties) => `with ${parties} only`,
    gateable: true,
  },
  "approval:decide": {
    verb: "decide approvals raised by other controllers",
    noun: "decision",
    label: "Decide approvals",
    typeAny: null,
    typeList: null,
    partyAny: null,
    partyList: null,
    gateable: false,
  },
};

export function operationLabel(operation: ControllerOperation): string {
  return OPERATIONS[operation].label;
}

/** Every operation, in the order the builder lists them. */
export const ALL_OPERATIONS = Object.keys(OPERATIONS) as ControllerOperation[];

/** What granting an operation actually lets someone do, for the checklist. */
export function operationDescription(operation: ControllerOperation): string {
  const op = OPERATIONS[operation];
  /* Built from the same verb the sentence uses, so the checklist and the
     preview cannot describe the same grant two different ways. */
  return `They may ${op.verb}.`;
}

/** Whether the credential-type filter means anything for this operation. */
export function takesCredentialTypes(operation: ControllerOperation): boolean {
  return OPERATIONS[operation].typeList !== null;
}

/** Whether the relying-party filter means anything for this operation. */
export function takesRelyingParties(operation: ControllerOperation): boolean {
  return OPERATIONS[operation].partyList !== null;
}

/** Whether an approval policy can meaningfully hold this operation back. */
export function isGateable(operation: ControllerOperation): boolean {
  return OPERATIONS[operation].gateable;
}

/**
 * The legal ground a relation stands on, in words rather than enum values.
 *
 * No statute numbers in the label. The Act is what makes these three the
 * options, but a person reading "Entity consent (s.111(2)(a))" learns nothing
 * they can act on — they need to know whether a board resolution counts.
 */
export function legalBasisLabel(basis: LegalBasis): string {
  switch (basis) {
    case "entity_consent":
      return "Entity consent";
    case "court_order":
      return "Court order";
    case "governance_prescribed":
      return "Prescribed by the governance framework";
  }
}

export function legalBasisHint(basis: LegalBasis): string {
  switch (basis) {
    case "entity_consent":
      return "The entity decided this itself — usually a board resolution naming the person and what they may do.";
    case "court_order":
      return "A court directed that this person may act for the entity.";
    case "governance_prescribed":
      return "The governance framework requires this role to exist for an entity of this kind.";
  }
}

/** How many signatures a policy collects. Used for "1 of 2" progress. */
export function requiredSignatures(policy: ApprovalPolicy): number {
  return policy === "DUAL_CONTROL" ? 2 : policy === "SINGLE_APPROVER" ? 1 : 0;
}

export function approvalLabel(policy: ApprovalPolicy): string {
  switch (policy) {
    case "AUTO":
      return "No approval";
    case "SINGLE_APPROVER":
      return "One approver";
    case "DUAL_CONTROL":
      return "Two approvers";
  }
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * "A", "A and B", "A, B and C".
 *
 * Serial comma deliberately omitted — the rest of the product's copy reads
 * British, and a scope sentence is read aloud in demos more than most UI text.
 */
export function joinList(values: string[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

/** "31 Dec 2026". Fixed format, not locale-dependent: a demo should read the
 *  same on every machine in the room. */
export function formatDate(iso: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = iso.slice(0, 10).split("-");
  const month = months[Number(m) - 1];
  if (!month) return iso;
  return `${Number(d)} ${month} ${y}`;
}

/** "Nu. 500,000" — the ngultrum, grouped, as it is written locally. */
export function formatNu(amount: number): string {
  return `Nu. ${amount.toLocaleString("en-US")}`;
}

/* ------------------------------------------------------------------ */
/* The grammar                                                         */
/* ------------------------------------------------------------------ */

/**
 * One grant as a pair of sentences: what is permitted, and how it is gated.
 *
 * Returned as parts rather than one string so the UI can weight the operative
 * words without this file knowing anything about markup. The caller renders
 * `text` and may emphasise the substrings in `emphasise`.
 */
export interface GrantSentence {
  /** The permission, as a full sentence ending in a full stop. */
  text: string;
  /** The approval clause. Empty when nothing could gate this operation. */
  approval: string;
  /** Substrings of `text` worth setting in a stronger weight. */
  emphasise: string[];
}

export function describeGrant(
  personName: string,
  grant: ScopeGrant,
  scope: Scope,
): GrantSentence {
  const op = OPERATIONS[grant.operation];
  const emphasise: string[] = [op.verb];

  const parts: string[] = [`${personName} may ${op.verb}`];

  const typeClause =
    grant.credentialTypes.mode === "any"
      ? op.typeAny
      : (op.typeList?.(joinList(grant.credentialTypes.values)) ?? null);
  if (typeClause) {
    parts.push(typeClause);
    if (grant.credentialTypes.mode === "list") {
      emphasise.push(joinList(grant.credentialTypes.values));
    }
  }

  const partyClause =
    grant.relyingParties.mode === "any"
      ? op.partyAny
      : (op.partyList?.(joinList(grant.relyingParties.values)) ?? null);
  if (partyClause) {
    parts.push(partyClause);
    if (grant.relyingParties.mode === "list") {
      emphasise.push(joinList(grant.relyingParties.values));
    }
  }

  let text = parts.join(" ");

  /* The type clause for credential:list starts with a comma, so it is already
     punctuated when it arrives — joining with a space would give ", limited
     to X" a leading space before the comma. */
  text = text.replace(/ ,/g, ",");

  if (scope.validUntil) {
    const until = formatDate(scope.validUntil);
    text += `, until ${until}`;
    emphasise.push(until);
  } else {
    text += ", with no end date";
  }

  text += ".";

  /* AUTO gets a sentence, rather than silence, wherever the operation is
     something an approval could have held back: "no approval needed" is a
     choice the Owner is accountable for, and leaving it blank reads as an
     unanswered question. Where nothing could gate the operation, saying so
     is noise.

     A non-AUTO policy always prints, gateable or not — if the data says an
     operation is gated, the reader needs to know that more than we need our
     vocabulary to be tidy. */
  let approval = "";
  if (grant.approval !== "AUTO") {
    approval = `Every ${op.noun} needs ${
      grant.approval === "DUAL_CONTROL" ? "two approvers" : "one approver"
    }.`;
  } else if (op.gateable) {
    approval = `Each ${op.noun} happens straight away, with no approver.`;
  }

  return { text, approval, emphasise };
}

/**
 * A whole relation in read mode — the sentences someone checks in five
 * seconds, on the acceptance screen, the authority viewer and the builder's
 * preview panel.
 *
 * Root authority collapses to one sentence. Enumerating "may do X of any
 * type with any relying party" six times is the same information rendered
 * unreadably, and the Owner's own full-scope relation is the one scope nobody
 * needs to audit line by line.
 */
export function describeRelation(
  personName: string,
  scope: Scope,
  isRootAuthority: boolean,
): GrantSentence[] {
  if (isRootAuthority) {
    const ending = scope.validUntil
      ? `, until ${formatDate(scope.validUntil)}`
      : ", with no end date";
    return [
      {
        text: `${personName} may do anything the entity can do${ending}.`,
        approval: "Nothing needs an approver.",
        emphasise: ["anything the entity can do"],
      },
    ];
  }

  return scope.grants.map((grant) => describeGrant(personName, grant, scope));
}

/**
 * A one-line summary for a register row, where a paragraph will not fit.
 * "Present proofs, accept offers +2 more" beats a truncated sentence.
 */
export function summariseScope(scope: Scope, isRootAuthority: boolean): string {
  if (isRootAuthority) return "Full authority";
  if (scope.grants.length === 0) return "No operations granted";

  const labels = scope.grants.map((g) => operationLabel(g.operation));
  const shown = labels.slice(0, 2).join(", ");
  const rest = labels.length - 2;
  return rest > 0 ? `${shown} +${rest} more` : shown;
}

/**
 * Whether any grant is gated, for the "this relation needs approvals" hint on
 * a register row.
 */
export function hasApprovalGate(scope: Scope): boolean {
  return scope.grants.some((g) => g.approval !== "AUTO");
}

/**
 * The over-broad warning C3 shows while building.
 *
 * Advisory only, and worth being clear about why: this does not block
 * anything and is not a policy check. It is a nudge against the Owner's
 * stated fear — accidentally granting more than intended — at the moment the
 * grant is being written. The server decides what is permissible; this only
 * notices what looks wider than someone probably meant.
 */
export function overBroadWarnings(scope: Scope, isRootAuthority: boolean): string[] {
  if (isRootAuthority) return [];
  const warnings: string[] = [];

  for (const grant of scope.grants) {
    /* Only presentations get the breadth warning. An unrestricted
       connection list is ordinary, and a warning that fires on the ordinary
       case teaches the Owner to ignore the warnings that matter. */
    if (grant.operation === "proof:present") {
      if (grant.relyingParties.mode === "any") {
        warnings.push(
          "Proofs may be presented to any relying party. Naming the counterparties keeps the grant as narrow as it sounds.",
        );
      }
      if (grant.credentialTypes.mode === "any") {
        warnings.push(
          "Any credential the entity holds may be presented, including its Business Registration.",
        );
      }
      if (grant.approval === "AUTO") {
        warnings.push(
          "Presentations go out with no approver. Anything disclosed this way leaves no approval record behind it.",
        );
      }
    }
  }

  if (!scope.validUntil) {
    warnings.push("This authority has no end date. An expiry is the simplest protection there is.");
  }

  return warnings;
}
