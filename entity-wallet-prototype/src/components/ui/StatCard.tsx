import type { ReactNode } from "react";

import { Icon, type IconName } from "./icons";

interface StatCardProps {
  title: string;
  /** Omitted for cards that carry no count. */
  count?: number;
  /** The info tooltip's copy. */
  hint?: string;
  /** Shown when count is 0 — never a bare zero with nothing to do about it. */
  emptyMessage: string;
  emptyIcon: IconName;
  action?: ReactNode;
  /** A preview of the first few rows, shown instead of the empty state. */
  children?: ReactNode;
}

export function StatCard({
  title,
  count,
  hint,
  emptyMessage,
  emptyIcon,
  action,
  children,
}: StatCardProps) {
  /* A card with a count of zero is empty whatever it was handed, and one with
     rows to show should show them rather than an invitation to create more. */
  const showEmpty = !children || count === 0;

  return (
    <section
      data-cta-form="1"
      className="relative flex min-h-[220px] flex-col rounded-[16px] border border-grid p-5 min-[641px]:p-6"
    >
      <header className="relative z-[4] flex items-center gap-2.5">
        <h2 className="font-display text-[17px] font-semibold leading-[1.25] tracking-[-0.01em] text-strong">
          {title}
        </h2>

        {hint ? (
          <span className="ndi-tip">
            <button
              type="button"
              aria-label={`About ${title}`}
              className="ndi-plainlink inline-flex h-6 w-6 items-center justify-center rounded-md text-faint"
            >
              <Icon name="info" size={14} strokeWidth={1.8} />
            </button>
            <span role="tooltip" className="ndi-tip__bubble">
              {hint}
            </span>
          </span>
        ) : null}

        {count !== undefined ? (
          <span
            className="ml-auto inline-flex h-8 min-w-8 items-center justify-center rounded-[9px] border border-grid px-2.5 font-mono text-[13px] font-medium text-accent"
            style={{ background: "var(--ndi-mint-08)" }}
          >
            {count}
          </span>
        ) : null}
      </header>

      <div className="relative z-[4] mt-4 h-px bg-[var(--border-subtle)]" />

      {showEmpty ? (
        /* Empty state, centred in the remaining space. */
        <div className="relative z-[4] flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-grid text-accent"
            style={{ background: "var(--ndi-mint-04)" }}
          >
            <Icon name={emptyIcon} size={19} strokeWidth={1.7} />
          </span>
          <p className="m-0 max-w-[34ch] text-[13.5px] leading-[1.55] text-muted">{emptyMessage}</p>
          {action}
        </div>
      ) : (
        <div className="relative z-[4] flex flex-1 flex-col gap-3 pt-4">{children}</div>
      )}
    </section>
  );
}
