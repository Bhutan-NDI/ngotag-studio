import type { ReactNode } from "react";

import { Icon } from "./icons";

/**
 * A step the prototype cannot perform, performed by hand — and visibly so.
 *
 * WHY THIS EXISTS
 *
 * Several flows cross something no front end can reach: an email arriving, a
 * link opened on another device, a message from another organisation. The
 * demo still has to get past them, so there has to be a control. The risk is
 * that the control reads as product — a "verify email" button next to a sign-
 * up form is exactly what a real product might have, and the audience would
 * conclude the email step is optional.
 *
 * So these are drawn unlike anything in the product: a dashed border, the
 * warning-dot the prototype marker uses, and a label that says what is being
 * stood in for. The same treatment everywhere, so that after the first one
 * the room recognises the second.
 */
export function SimulatedStep({
  standsFor,
  children,
  action,
}: {
  /** What the real product would do here, e.g. "The verification email". */
  standsFor: string;
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <div
      className="relative z-[4] flex flex-col gap-3 rounded-[12px] border border-dashed px-4 py-3.5"
      style={{ borderColor: "var(--border-strong)", background: "rgb(var(--tint) / 0.03)" }}
    >
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 flex-none rounded-full"
          style={{ background: "var(--ndi-warning)" }}
        />
        Prototype · stands in for {standsFor}
      </p>
      <div className="text-[12.5px] leading-[1.55] text-muted">{children}</div>
      <div className="flex flex-wrap items-center gap-2.5">{action}</div>
    </div>
  );
}

/** The action inside a SimulatedStep: plain, so it cannot be mistaken for a primary. */
export function SimulatedAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ndi-hairline-btn inline-flex h-10 items-center gap-2 rounded-[10px] px-3.5 font-display text-[13px] font-medium"
    >
      {children}
      <Icon name="arrowRight" size={14} strokeWidth={2} />
    </button>
  );
}

/**
 * The inline form, for a table row: the same dashed treatment in a pill, for
 * standing in for "the invitee opens the link in their inbox" beside the
 * product's own row actions without being mistaken for one of them.
 */
export function SimulatedLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Prototype — stands in for the invitee opening the link in their email"
      className="inline-flex min-h-[32px] items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed px-2.5 text-[12px] font-medium text-muted hover:text-body"
      style={{ borderColor: "var(--border-strong)" }}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ndi-warning)" }} />
      {children}
    </button>
  );
}
