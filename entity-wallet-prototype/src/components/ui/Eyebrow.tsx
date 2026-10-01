import type { ReactNode } from "react";

/** The mono uppercase "— Label" that opens every section. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{children}</div>
  );
}
