"use client";

import { Icon } from "@/components/ui/icons";
import { roleIn, type ActivationCheck, type AskedItem, type Designation, type OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * What the designation and adoption screens share (UX-EW-02, Flow 5).
 *
 * WORDS FOR THE AUTHORITY, NOT THE PLATFORM
 *
 * The authority officer understands the consequence and not the system; the
 * administrator the reverse (UX-EW-02 §1.1). So everything an officer reads
 * is in outcome terms — "confirms sole proprietorships", "what people will
 * be asked" — and the platform's own words (DID, schema, proof request,
 * endorse, revoke) never reach them (§2.4, UXD-19). SCR-DSG-04 is the one
 * exception, because an engineer acts on it; its words live on that screen,
 * not here.
 */

/** An entity type in running text — "sole proprietorships", "a company". */
export const kindPlural = (k: OrgKind) =>
  k === "company" ? "companies" : k === "sole_proprietorship" ? "sole proprietorships" : "partnerships";
export const kindSingular = (k: OrgKind) =>
  k === "company" ? "company" : k === "sole_proprietorship" ? "sole proprietorship" : "partnership";
export const kindTitle = (k: OrgKind) =>
  k === "company" ? "Companies" : k === "sole_proprietorship" ? "Sole proprietorships" : "Partnerships";

/** "sole proprietorships and partnerships" */
export const kindsInWords = (kinds: OrgKind[]) => {
  const words = kinds.map(kindPlural);
  return words.length <= 1 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
};

/**
 * Whole days from today to a date, never negative — 0 on the date itself.
 * Counted between calendar dates, not from this instant: `new Date("YYYY-MM-DD")`
 * is UTC midnight, already past by the morning of the last day, which made
 * the last day read as none left.
 */
export const daysLeft = (date: string | null) =>
  date ? Math.max(0, Math.round((Date.parse(date) - Date.parse(new Date().toISOString().slice(0, 10))) / 86_400_000)) : 0;

/**
 * A designation's state as a pill, worded for whoever reads it. Waiting on
 * someone is pending — the process, not a fault; activation checks that
 * have not passed warn, because someone has to act.
 */
export function dsgPill(d: Pick<Designation, "state">, audience: "admin" | "authority") {
  const admin = audience === "admin";
  switch (d.state) {
    case "PROPOSED":
      return { status: "pending_approval", label: "Waiting for a second administrator" };
    case "PENDING":
      return { status: "pending_acceptance", label: admin ? "Waiting for the organisation" : "Waiting for you" };
    case "ACCEPTED":
      return { status: "held", label: admin ? "Checks not passing" : "NDI is finishing set-up" };
    case "ACTIVE":
      return { status: "active", label: "Designated" };
    case "REFUSED":
      return { status: "refused", label: "Refused" };
    case "DECLINED":
      return { status: "declined", label: "Declined" };
    case "EXPIRED":
      return { status: "lapsed", label: "Expired" };
    case "SUSPENDED":
      return { status: "suspended", label: "Suspended" };
  }
}

/**
 * The sentence UX-EW-02 asks to appear wherever a stop is visible (UXD-20):
 * the misreading it prevents forms before anyone reaches a confirmation.
 */
export const NOTHING_UNVERIFIED = "None of these un-verifies a business. A business you've already confirmed stays confirmed.";

/**
 * What a person will be asked, item by item, as their wallet will show it
 * (SCR-ADO-01). An item NDI's draft added that the register doesn't need
 * is marked on the item itself, where the objection is made (E4).
 */
export function AskedList({ asked, flagged }: { asked: AskedItem[]; flagged?: string | null }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {asked.map((a) => {
        const over = flagged === a.item;
        return (
          <li
            key={a.item}
            className="flex flex-col gap-0.5 rounded-[12px] border px-4 py-3"
            style={{ borderColor: over ? "var(--ndi-warning)" : "var(--border-grid)" }}
          >
            <span className="flex flex-wrap items-baseline gap-x-2 text-[13.5px] font-medium text-body">
              {a.item}
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">from {a.from}</span>
            </span>
            <span className="text-[12.5px] leading-[1.5] text-muted">{a.why}</span>
            {over ? (
              <span className="mt-1 flex items-start gap-1.5 text-[12.5px] leading-[1.5] text-body">
                <Icon name="info" size={13} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
                Not needed to confirm a licence holder. You can send this back before agreeing to it.
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * SCR-DSG-04's check list: every check with a text label, never colour
 * alone (SC 1.4.1), the observed value on failure, and who resolves it.
 */
export function CheckList({ checks }: { checks: ActivationCheck[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-2 p-0">
      {checks.map((c) => (
        <li key={c.id} className="flex items-start gap-3 rounded-[12px] border border-grid px-4 py-3">
          <span
            aria-hidden="true"
            className="mt-[2px] flex h-5 w-5 flex-none items-center justify-center rounded-full border"
            style={{ borderColor: c.pass ? "var(--ndi-success)" : "var(--ndi-danger)" }}
          >
            <Icon name={c.pass ? "check" : "close"} size={11} strokeWidth={2.6} />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13.5px] text-body">
              <span className="font-medium">{c.pass ? "Passed" : "Failed"}</span> — {c.label}
            </span>
            {!c.pass && c.observed ? (
              <span className="text-[12.5px] leading-[1.5] text-muted">
                Observed: <span className="font-mono">{c.observed}</span> · Resolved by{" "}
                {c.resolver === "NDI" ? "NDI" : "the organisation"}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * The authority the screens are about, and who owns it. The organisation
 * being worked in, if it has a designation, else the first one the person
 * belongs to that does — so Kesang lands on the ministry even when the
 * switcher was left on another organisation. One place for it: four screens
 * had a copy each, and copies drift.
 *
 * `designation` is the one that matters now: live or suspended first, then
 * one waiting on the authority, then whatever else there is.
 */
export function useAuthority() {
  const { organizations, designations, activeOrgId, currentPerson, personById } = useDemo();
  const org =
    organizations.find((o) => o.id === activeOrgId && designations.some((d) => d.orgId === o.id)) ??
    organizations.find((o) => o.memberIds.includes(currentPerson.id) && designations.some((d) => d.orgId === o.id));
  /* Only a designation the authority has been shown, and that still stands,
     is theirs to see. A PROPOSED one hasn't reached them (FLOW-ORG-02 A1:
     nothing before the second approval); a REFUSED or an unapproved EXPIRED
     one never did (E12, E13: "nothing reaches the authority"); a DECLINED
     one is their own ended answer. Falling back to whatever row came first
     showed a proposal as theirs, with NDI's process in it. These count as no
     designation, so every authority screen shows its empty state. */
  const mine = designations.filter(
    (d) => d.orgId === org?.id && !["PROPOSED", "REFUSED", "DECLINED", "EXPIRED"].includes(d.state),
  );
  const designation: Designation | undefined =
    mine.find((x) => ["ACTIVE", "SUSPENDED"].includes(x.state)) ?? mine.find((x) => ["PENDING", "ACCEPTED"].includes(x.state));
  const ownerId = org ? Object.entries(org.roles ?? {}).find(([, r]) => r === "Owner")?.[0] : undefined;
  return {
    org,
    designation,
    /** Only an ACTIVE designation can adopt or stop anything. */
    active: designation?.state === "ACTIVE" ? designation : undefined,
    owner: org ? roleIn(org, currentPerson) === "Owner" : false,
    ownerId,
    ownerName: ownerId ? personById(ownerId).name : "Your organisation's owner",
  };
}

/**
 * The designation the state switcher shows when there isn't a real one to
 * show — the ministry, for sole proprietorships and partnerships. Screens
 * override the state (and id) they need; one literal instead of three.
 */
export const SAMPLE_DESIGNATION: Designation = {
  id: "sample",
  orgId: "org-moice",
  orgName: "Ministry of Industry, Commerce & Employment",
  kind: "E",
  entityTypes: ["sole_proprietorship", "partnership"],
  legalBasis: "The licensing of businesses under the Ministry's mandate",
  legalRef: "NDI/DSG/2026/002",
  state: "PENDING",
  proposedBy: "tshering",
  proposedAt: null,
  approvedBy: "tshendu",
  approvedAt: null,
  acceptedBy: null,
  acceptedAt: null,
  refusedReason: null,
  expiresAt: null,
  activatedAt: null,
  didMethodAtActivation: null,
  checks: null,
  checkedAt: null,
  ndiAccess: "ACTIVE",
  ndiAccessChangedBy: null,
  ndiAccessChangedAt: null,
};
