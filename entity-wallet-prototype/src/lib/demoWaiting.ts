import { inOrg, PELDEN, type DemoState } from "./demoData";

/**
 * What is waiting for one person, for the notification bell.
 *
 * WHY THE BELL NEEDS ITS OWN LIST
 *
 * The prototype has no notifications to send, but some of what waits for a
 * person has no other way in: an appointee reaches their appointment only
 * from the representative's "open it as …" (which stands in for a
 * notification), and the issuer's queue has no dashboard entry. So the bell
 * lists, for whoever is signed in, what is waiting for them and where it is
 * answered. The wallet's own "Needs you" rules are followed for approvals,
 * requests and offers (NeedsAttention); appointments and the issuer's queue
 * are added.
 */
export interface WaitingItem {
  key: string;
  label: string;
  href: string;
  /** The organisation the screen belongs to, made active before going. */
  orgId?: string;
}

type WaitingState = Pick<
  DemoState,
  | "people"
  | "organizations"
  | "relations"
  | "parkedOperations"
  | "presentationRequests"
  | "offers"
  | "credentialRequests"
  | "authorityGrants"
>;

export function waitingFor(s: WaitingState, personId: string): WaitingItem[] {
  const person = s.people.find((p) => p.id === personId);
  if (!person) return [];
  const today = new Date().toISOString().slice(0, 10);
  const orgsOf = s.organizations.filter((o) => o.memberIds.includes(personId)).map((o) => o.id);
  const orgName = (id?: string) => s.organizations.find((o) => o.id === (id ?? PELDEN))?.name ?? "the organisation";
  const items: WaitingItem[] = [];

  /* An appointment to accept or decline (SCR-DEL-03). */
  for (const r of s.relations.filter((x) => x.personId === personId && x.state === "PENDING_ACCEPTANCE")) {
    items.push({
      key: r.id,
      label: `Accept or decline the appointment to act for ${orgName(r.orgId)}`,
      href: `/appointments/${r.id}`,
      orgId: r.orgId ?? PELDEN,
    });
  }

  for (const orgId of orgsOf) {
    const here = inOrg(orgId);
    const canDecide = s.relations
      .filter(here)
      .some((r) => r.personId === personId && r.state === "ACTIVE" && r.scope.grants.some((g) => g.operation === "approval:decide"));
    /* Somebody else is waiting on a decision — never one's own. */
    if (canDecide) {
      for (const op of s.parkedOperations.filter(here).filter((p) => p.state === "parked" && p.requestedBy !== personId)) {
        const share = op.operation === "proof:present" && op.targetId;
        items.push({
          key: op.id,
          label: `Approve or refuse: ${op.summary}`,
          href: share ? `/wallet/sharing/${op.targetId}/approve` : `/approvals/${op.id}`,
          orgId,
        });
      }
    }
    /* An organisation is asking for credentials (Flow 7). */
    for (const v of s.presentationRequests.filter(here).filter((v) => v.status === "OPEN" && v.expiresAt >= today)) {
      items.push({ key: v.id, label: `Answer ${v.verifierName}'s request`, href: `/wallet/sharing/${v.id}`, orgId });
    }
    /* A credential offered, or one this organisation asked for that is ready. */
    for (const o of s.offers.filter(here).filter((o) => o.state === "pending")) {
      items.push({ key: o.id, label: `Review ${o.type} from ${o.issuer}`, href: `/wallet/requests/${o.id}`, orgId });
    }
    for (const c of s.credentialRequests.filter((c) => c.orgId === orgId && (c.state === "OFFER_READY" || c.state === "NEEDS_CONSENT"))) {
      items.push({ key: c.id, label: `Review what ${c.issuerName} sent`, href: "/wallet/requests", orgId });
    }
    /* A request still being sent: the prototype moves it on only while its
       page is open (useSimulatedDelivery), so switching away too soon leaves
       it here until someone looks again. */
    for (const c of s.credentialRequests.filter((c) => c.orgId === orgId && c.state === "AWAITING_PROOF")) {
      items.push({ key: c.id, label: `Finish sending the request to ${c.issuerName}`, href: `/wallet/requests/${c.id}`, orgId });
    }
    /* The issuer's queue (Deki at the tax office). */
    for (const c of s.credentialRequests.filter((c) => c.issuerOrgId === orgId && c.state === "WITH_ISSUER")) {
      items.push({ key: c.id, label: `Answer ${orgName(c.orgId)}'s request`, href: `/issuer/requests/${c.id}`, orgId });
    }
  }

  return items;
}

