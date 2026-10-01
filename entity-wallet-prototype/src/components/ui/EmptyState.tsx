import type { ReactNode } from "react";

import { Icon, type IconName } from "./icons";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  action?: ReactNode;
  /** Zero-results reads differently from nothing-created-yet. */
  tone?: "empty" | "filtered";
}

export function EmptyState({ icon, title, message, action, tone = "empty" }: EmptyStateProps) {
  return (
    <div className="relative z-[4] flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span
        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-grid text-accent"
        style={{
          background: tone === "empty" ? "var(--ndi-mint-04)" : "rgb(var(--tint) / 0.03)",
        }}
      >
        <Icon name={icon} size={24} strokeWidth={1.7} />
      </span>

      <div>
        <h2 className="m-0 font-display text-[19px] font-semibold leading-[1.3] tracking-[-0.02em] text-strong">
          {title}
        </h2>
        <p className="m-0 mt-2 max-w-[42ch] text-[14px] leading-[1.6] text-muted">{message}</p>
      </div>

      {action}
    </div>
  );
}
