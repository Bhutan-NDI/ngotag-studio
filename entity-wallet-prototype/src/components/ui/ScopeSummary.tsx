"use client";

import {
  approvalLabel,
  describeRelation,
  operationLabel,
  overBroadWarnings,
} from "@/features/controllership/scopeModel";
import type { Scope } from "@/lib/demoData";

import { Icon } from "./icons";
import { StatusPill } from "./StatusPill";

/**
 * "What this person can do", in the two renderings the product needs.
 *
 * The single most important component here. It appears on the scope builder's
 * preview, the acceptance screen, the Controller's own authority viewer and
 * beside audit entries, and if a reader cannot check it in five seconds then
 * nothing else in the Entity Wallet lands. The sentences themselves come from
 * `scopeModel.ts`, which is a pure function on purpose — the wording gets
 * iterated far more often than the markup.
 *
 * READ mode is prose: one sentence per grant, each with its approval clause.
 * That is what someone signs up to on the acceptance screen, and what a
 * Controller checks when they want to know why something was refused.
 *
 * TABLE mode is the same information as rows. Five dimensions per grant do
 * not edit as prose and do not compare as prose either — an Owner auditing a
 * scope wants to run an eye down the approval column, which a paragraph makes
 * impossible. Both render from one model, so they cannot disagree.
 *
 * Lifecycle state is not rendered inside a sentence, ever. A relation that
 * says "Rinzin may present proofs" while it is suspended is a lie in prose
 * form, so the state arrives as a pill beside the block where it cannot be
 * missed. `state` is optional here precisely so a caller has to think about
 * whether the state is already visible in its own header.
 */
export function ScopeSummary({
  personName,
  scope,
  isRootAuthority = false,
  mode = "read",
  state,
  showWarnings = false,
}: {
  personName: string;
  scope: Scope;
  isRootAuthority?: boolean;
  mode?: "read" | "table";
  /** Relation lifecycle, rendered as a pill above the sentences. */
  state?: string;
  /** The builder's advisory nudges. Off elsewhere — they are for authoring. */
  showWarnings?: boolean;
}) {
  const sentences = describeRelation(personName, scope, isRootAuthority);
  const warnings = showWarnings ? overBroadWarnings(scope, isRootAuthority) : [];

  return (
    <div className="relative z-[4] flex flex-col gap-4">
      {state ? (
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={state} />
          <span className="text-[12.5px] text-faint">
            Scope version {scope.version}
          </span>
        </div>
      ) : null}

      {mode === "read" ? (
        <ul className="flex flex-col gap-3">
          {sentences.map((sentence, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Icon
                name="check"
                size={14}
                strokeWidth={2.4}
                className="mt-[5px] flex-none text-accent"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[14px] leading-[1.6] text-body">{sentence.text}</span>
                {sentence.approval ? (
                  <span className="text-[12.5px] leading-[1.5] text-faint">
                    {sentence.approval}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto">
          <table className="ndi-table">
            <thead>
              <tr>
                <th scope="col">Operation</th>
                <th scope="col">Credential types</th>
                <th scope="col">Relying parties</th>
                <th scope="col">Approval</th>
              </tr>
            </thead>
            <tbody>
              {isRootAuthority ? (
                <tr>
                  <td colSpan={4} className="text-muted">
                    Full authority — every operation, with no restriction.
                  </td>
                </tr>
              ) : (
                scope.grants.map((grant) => (
                  <tr key={grant.operation}>
                    <td className="text-body">{operationLabel(grant.operation)}</td>
                    <td>
                      {grant.credentialTypes.mode === "any"
                        ? "Any"
                        : grant.credentialTypes.values.join(", ")}
                    </td>
                    <td>
                      {grant.relyingParties.mode === "any"
                        ? "Any"
                        : grant.relyingParties.values.join(", ")}
                    </td>
                    <td>
                      <StatusPill
                        status={grant.approval.toLowerCase()}
                        label={approvalLabel(grant.approval)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {warnings.length > 0 ? (
        <div className="rounded-[12px] border border-grid px-3.5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Worth a second look
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {warnings.map((w) => (
              <li key={w} className="flex items-start gap-2 text-[13px] leading-[1.5] text-body">
                <Icon
                  name="info"
                  size={13}
                  strokeWidth={2}
                  className="mt-[3px] flex-none"
                  /* Advisory, not an error. These do not block anything and
                     must not look like they do. */
                  style={{ color: "var(--ndi-warning)" }}
                />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
