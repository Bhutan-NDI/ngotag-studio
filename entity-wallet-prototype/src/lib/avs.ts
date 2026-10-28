import { taskLabel } from "./authority";
import {
  PELDEN,
  inOrg,
  type AuthorityChainLink,
  type AuthorityGrant,
  type ConstraintCheck,
  type DemoState,
  type VerificationDecision,
} from "./demoData";

/**
 * A STAND-IN for the Authority Verification Service.
 *
 * READ THIS BEFORE CHANGING ANYTHING HERE.
 *
 * The standing rule in CLAUDE.md is that the UI renders server decisions and
 * never invents them — allow, deny and park arrive as values, and no screen
 * computes whether something is permitted. This file is the one deliberate
 * exception, and it is confined here on purpose.
 *
 * Act 5 of the demo needs a PASS and then a FAIL on the *same* authority,
 * where the FAIL is caused by an owner revoking a role a moment earlier. A
 * seeded pair cannot do that — it would show two canned screens with no
 * causal link, which is exactly the thing the act exists to demonstrate. So
 * something has to derive a decision from current state.
 *
 * What keeps that honest:
 *
 *  - It lives in the data layer, not in a component. No screen branches on a
 *    scope, a status or a value cap; screens render a `VerificationDecision`
 *    and nothing else. The UI is still not the authority boundary.
 *  - It is named for what it stands in for. In a real deployment this
 *    function is an HTTP call to the verification service, and the return
 *    type is already the shape that service returns.
 *  - It walks the chain the way the real thing must: every ancestor's live
 *    status, then the constraints. It does not take shortcuts that a real
 *    implementation could not take.
 *  - It fails closed. Anything it cannot establish is a FAIL, never a pass
 *    with a warning.
 *
 * If this file starts being imported by a component, something has gone
 * wrong: the store owns it, and the store hands screens the result.
 */

/**
 * What an authority rests on, from the entity's foundational credential
 * down to the grant itself.
 *
 * Two links, not a chain of relations and roles. Since Flow 8's
 * specification the authority is the organisation's (EW-FLOW8-SD D15) — it
 * doesn't depend on the relation of whoever granted it — and there is no
 * Role above a Capability and no re-delegation (D1, D3). This is the
 * minimum that keeps Flow 9's stand-in page working; Flow 9 itself
 * (EW-FLOW9-SD, the checks through `client-service`) is rebuilt on its own.
 */
function walkChain(state: DemoState, authority: AuthorityGrant): AuthorityChainLink[] {
  const links: AuthorityChainLink[] = [];

  const entity = state.organizations.find((o) => o.id === authority.orgId)?.name ?? "The entity";

  const foundational = state.heldCredentials.filter(inOrg(authority.orgId)).find((c) => c.isFoundational);
  if (foundational) {
    links.push({
      id: foundational.id,
      label: foundational.type,
      kind: "foundational",
      heldBy: entity,
      status:
        foundational.status === "active"
          ? "valid"
          : foundational.status === "revoked"
            ? "revoked"
            : "expired",
    });
  }

  links.push({
    id: authority.id,
    label: `Authority to act for ${entity.replace(/ (Pvt\. )?Ltd\.$/, "")}`,
    kind: "capability",
    heldBy: authority.delegateName ?? authority.name,
    status:
      authority.status === "ACTIVE"
        ? "valid"
        : authority.status === "SUSPENDED"
          ? "suspended"
          : authority.status === "EXPIRED"
            ? "expired"
            : "revoked",
  });

  return links;
}

const formatNu = (amount: number) => `Nu. ${amount.toLocaleString("en-US")}`;

/**
 * How a broken link is named in a refusal.
 *
 * Written for the person who has just been refused at a counterparty, so it
 * says what kind of thing failed and uses the word a person would use.
 * "Customs broker is revoked" made the reader work out what Customs broker
 * even was; "the Customs broker role ... has been withdrawn" does not.
 */
const LINK_NOUN: Record<AuthorityChainLink["kind"], string> = {
  foundational: "registration",
  relation: "controllership",
  role: "role",
  capability: "capability",
};

const LINK_VERB: Record<Exclude<AuthorityChainLink["status"], "valid">, string> = {
  revoked: "has been withdrawn",
  suspended: "is suspended",
  expired: "has expired",
};

const shortDate = (iso: string) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${months[Number(m) - 1] ?? m} ${y}`;
};

export interface VerificationRequestInput {
  authorityId: string;
  verifier: string;
  declarationRef: string;
  declaredValue: number;
  task: string;
  /** Set to simulate the service being unreachable. */
  unreachable?: boolean;
}

/**
 * Produce a signed decision for one transaction.
 *
 * The order of checks is the order a reader needs them: the chain first,
 * because a broken chain makes every constraint irrelevant, then the
 * constraints themselves. Reasons are written for the person who has just
 * been refused, and carry no personal attributes beyond who acted.
 */
export function verifyAuthority(
  state: DemoState,
  input: VerificationRequestInput,
): VerificationDecision {
  const authority = state.authorityGrants.find((a) => a.id === input.authorityId);
  const entity = state.organizations.find((o) => o.id === (authority?.orgId ?? PELDEN))?.name ?? "The entity";

  const base = {
    id: `dec-${Math.random().toString(36).slice(2, 8)}`,
    verifier: input.verifier,
    entity,
    actorId: authority?.delegatePersonId ?? "unknown",
    authorityId: input.authorityId,
    declarationRef: input.declarationRef,
    declarationHash: `sha256:${Math.random().toString(16).slice(2, 10)}${Math.random()
      .toString(16)
      .slice(2, 10)}`,
    declaredValue: { amount: input.declaredValue, currency: "BTN" as const },
    decidedAt: new Date().toISOString(),
  };

  /* Fail closed, first and unconditionally. An unreachable service means the
     authority could not be established, and an authority that cannot be
     established is not an authority. There is no partial credit here and no
     spinner that eventually shrugs. */
  if (input.unreachable) {
    return {
      ...base,
      outcome: "SERVICE_UNREACHABLE",
      chain: [],
      checks: [],
      reasons: [
        "The Authority Verification API could not be reached, so nothing could be checked.",
        "An unverifiable authority is treated as no authority.",
      ],
      signature: "",
    };
  }

  if (!authority) {
    return {
      ...base,
      outcome: "FAIL",
      chain: [],
      checks: [],
      reasons: ["No such authority was presented."],
      signature: "",
    };
  }

  const chain = walkChain(state, authority);
  const checks: ConstraintCheck[] = [];
  const reasons: string[] = [];

  /* ---- The chain ---- */
  const brokenLink = chain.find((l) => l.status !== "valid");
  checks.push({
    label: "Authority chain intact",
    detail: brokenLink
      ? `${brokenLink.label} is ${brokenLink.status}`
      : `All ${chain.length} links live at the time of decision`,
    outcome: brokenLink ? "fail" : "pass",
  });
  if (brokenLink && brokenLink.status !== "valid") {
    reasons.push(
      brokenLink.kind === "capability"
        ? `This authority ${LINK_VERB[brokenLink.status]}.`
        : `The ${brokenLink.label} ${LINK_NOUN[brokenLink.kind]} this authority depends on ${LINK_VERB[brokenLink.status]}.`,
      "An authority cannot be relied on once it, or the registration behind it, has stopped being valid.",
    );
  }

  /* ---- Task ---- */
  const taskOk = authority.tasks.includes(input.task);
  checks.push({
    label: "Task in scope",
    detail: taskOk ? `${taskLabel(input.task)} is one of the granted tasks` : `${taskLabel(input.task)} was not granted`,
    outcome: taskOk ? "pass" : "fail",
  });
  if (!taskOk) reasons.push(`This authority does not cover ${taskLabel(input.task).toLowerCase()}.`);

  /* ---- Value limit, per declaration (EW-FLOW8-SD D25) ---- */
  const withinCap = input.declaredValue <= authority.valueCapNu;
  checks.push({
    label: "Value within limit",
    detail: `${formatNu(input.declaredValue)} declared against ${formatNu(authority.valueCapNu)} per declaration`,
    outcome: withinCap ? "pass" : "fail",
  });
  if (!withinCap) reasons.push(`The declared value is more than the ${formatNu(authority.valueCapNu)} this authority allows per declaration.`);

  /* ---- Counterparty ---- */
  const verifierOrg = state.organizations.find((o) => o.name === input.verifier);
  const counterpartyOk = Boolean(verifierOrg && authority.counterparties.includes(verifierOrg.id));
  checks.push({
    label: "Counterparty bound",
    detail: counterpartyOk ? `${input.verifier} matches the bound counterparty` : `${input.verifier} is not a bound counterparty`,
    outcome: counterpartyOk ? "pass" : "fail",
  });
  if (!counterpartyOk) reasons.push("This authority may not be used here.");

  /* ---- Validity window ---- */
  const today = new Date().toISOString().slice(0, 10);
  const withinWindow = today >= authority.validFrom && today <= authority.validUntil;
  checks.push({
    label: "Within validity window",
    detail: `Valid ${shortDate(authority.validFrom)} – ${shortDate(authority.validUntil)}`,
    outcome: withinWindow ? "pass" : "fail",
  });
  if (!withinWindow) {
    reasons.push("This authority is outside its validity window.");
  }

  const failed = checks.some((c) => c.outcome === "fail");

  return {
    ...base,
    outcome: failed ? "FAIL" : "PASS",
    chain,
    checks,
    reasons,
    /* A real decision is signed so a verifier can re-validate it later. This
       one is a random string of the right shape — enough for the screen to
       show that a decision is an artifact, not a colour. */
    signature: failed
      ? ""
      : Array.from({ length: 40 }, () =>
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
            Math.floor(Math.random() * 62),
          ),
        ).join(""),
  };
}
