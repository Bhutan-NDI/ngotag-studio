"use client";

import type { AuthorityChainLink } from "@/lib/demoData";

import { Icon } from "./icons";
import { StatusPill } from "./StatusPill";

/**
 * The authority chain a verification walks, and which link failed.
 *
 * This is the component Act 5 turns on. A capability is only as good as
 * everything above it, and that sentence means nothing until someone sees a
 * chain of four links with the third one struck through. The same capability,
 * the same person, the same counterparty — and a FAIL, because a role above
 * it was withdrawn. No diagram explains delegated authority better, which is
 * why the plan says to build this one properly.
 *
 * Drawn as a vertical chain rather than a horizontal breadcrumb: the labels
 * are long ("Business Registration", "Declaration authority"), the statuses
 * need room, and a horizontal version either truncates or scrolls sideways —
 * on the one screen where nothing may be hidden.
 *
 * The broken link is marked three ways over: the status pill names it, the
 * connector above it changes colour, and the row carries an icon. Colour
 * alone would put the entire point of the screen in a channel some readers do
 * not receive, and this is the least acceptable place in the product for that.
 */
const KIND_LABEL: Record<AuthorityChainLink["kind"], string> = {
  foundational: "Foundational credential",
  relation: "Controllership relation",
  role: "Role credential",
  capability: "Capability credential",
};

export function AuthorityChain({ chain }: { chain: AuthorityChainLink[] }) {
  if (chain.length === 0) {
    return (
      <p className="relative z-[4] text-[13.5px] leading-[1.6] text-muted">
        No chain was walked — the Authority Verification API could not be reached, so
        nothing was checked.
      </p>
    );
  }

  return (
    <ol className="relative z-[4] m-0 flex flex-col">
      {chain.map((link, i) => {
        const broken = link.status !== "valid";
        /* The chain is severed *at* the broken link, so everything below it is
           unreachable regardless of its own status. Marking the connectors
           that way is what turns a list of statuses into a chain: the
           capability at the bottom is perfectly valid and still worthless. */
        const severedAbove = chain.slice(0, i).some((l) => l.status !== "valid");

        return (
          <li key={link.id} className="flex gap-3">
            {/* Rail: the connector, then the node. */}
            <div className="flex w-[18px] flex-none flex-col items-center">
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  className="h-3 w-px flex-none"
                  style={{
                    background: severedAbove ? "var(--ndi-danger)" : "var(--border-grid)",
                    /* A dashed connector below the break reads as "no longer
                       carries anything". */
                    opacity: severedAbove ? 0.5 : 1,
                  }}
                />
              ) : (
                <span aria-hidden="true" className="h-3 flex-none" />
              )}

              <span
                aria-hidden="true"
                className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border"
                style={{
                  borderColor: broken ? "var(--ndi-danger)" : "var(--ndi-mint-40)",
                  background: broken ? "rgb(225 73 62 / 0.12)" : "var(--ndi-mint-12)",
                }}
              >
                <Icon
                  name={broken ? "close" : "check"}
                  size={10}
                  strokeWidth={3}
                  style={{ color: broken ? "var(--ndi-danger)" : "var(--accent)" }}
                />
              </span>

              {i < chain.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="w-px flex-1"
                  style={{
                    background: broken || severedAbove ? "var(--ndi-danger)" : "var(--border-grid)",
                    opacity: broken || severedAbove ? 0.5 : 1,
                  }}
                />
              ) : null}
            </div>

            <div className={`flex min-w-0 flex-1 flex-col gap-0.5 pb-4 ${i === 0 ? "pt-2" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="font-display text-[13.5px] font-medium leading-[1.4]"
                  style={{
                    color: broken ? "var(--text-muted)" : "var(--text-body)",
                    textDecoration: broken ? "line-through" : undefined,
                  }}
                >
                  {link.label}
                </span>
                <StatusPill status={link.status} />
              </div>
              <span className="text-[12.5px] leading-[1.5] text-faint">
                {KIND_LABEL[link.kind]} · held by {link.heldBy}
              </span>
              {severedAbove && !broken ? (
                <span
                  className="mt-0.5 text-[12.5px] leading-[1.5]"
                  style={{ color: "var(--ndi-danger)" }}
                >
                  Valid in itself, but unreachable — the chain is broken above it.
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
