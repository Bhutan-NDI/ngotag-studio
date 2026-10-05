import type { DelegatedAuthority, ScopeFilter } from "@/lib/demoData";

/**
 * The vocabulary of Pattern B constraints — the public part of an authority.
 *
 * Kept out of the components for the same reason the scope grammar is: this
 * wording appears on the issuance form, the register, the holder's own view
 * and the verifier's decision, and those four must not describe the same
 * constraint four different ways. A verifier reading "Nu. 500,000 per
 * declaration" and an Owner reading "cap: 500000" are looking at the same
 * credential, and the demo's whole claim is that both can read it.
 */

/**
 * Task scopes the entity can grant, in the form they take on the credential.
 *
 * The machine-readable name is what a verifier matches against, so it is the
 * canonical value; the label is what a person reads. Both are needed on the
 * issuance screen, because an Owner should see what a counterparty will
 * actually check.
 */
export const TASK_SCOPES: { value: string; label: string; hint: string }[] = [
  {
    value: "customs:declaration",
    label: "Submit customs declarations",
    hint: "File a declaration with customs on the entity's behalf.",
  },
  {
    value: "customs:amendment",
    label: "Amend a declaration",
    hint: "Correct a declaration already filed.",
  },
  {
    value: "payments:release",
    label: "Release payments",
    hint: "Instruct the entity's bank to release a payment.",
  },
  {
    value: "warehouse:receipt",
    label: "Receive goods",
    hint: "Sign for goods arriving at a bonded facility.",
  },
];

export function taskScopeLabel(value: string): string {
  return TASK_SCOPES.find((t) => t.value === value)?.label ?? value;
}

export const formatNu = (amount: number) => `Nu. ${amount.toLocaleString("en-US")}`;

function filterWords(filter: ScopeFilter): string {
  return filter.mode === "any" ? "any counterparty" : filter.values.join(" and ");
}

/**
 * A one-line summary for a register row.
 *
 * Ordered by what stops a transaction most often: the cap, then who it may be
 * used with, then what it is for. An Owner scanning this column is looking
 * for the thing they granted too generously, and that is almost always the
 * cap.
 */
export function describeConstraints(authority: DelegatedAuthority): string {
  const parts: string[] = [];

  if (authority.valueCap) {
    parts.push(
      `${formatNu(authority.valueCap.amount)} ${
        authority.valueCap.perTransaction ? "per transaction" : "in total"
      }`,
    );
  } else {
    parts.push("No value cap");
  }

  parts.push(filterWords(authority.counterparties));

  if (authority.taskScopes.length === 1) {
    parts.push(taskScopeLabel(authority.taskScopes[0]).toLowerCase());
  } else {
    parts.push(`${authority.taskScopes.length} tasks`);
  }

  return parts.join(" · ");
}
