import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icons";

const SHAPE =
  "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[9px] border px-3 font-display text-[12.5px] font-semibold";

/**
 * A row's way in: Open, Manage, View records. A small outlined button in
 * mint with an arrow, not a faint word at the end of the row, so it reads as
 * something to press. Disabled (offline, say), it keeps its shape in grey and
 * goes nowhere.
 */
export function OpenLink({
  href,
  children = "Open",
  disabled = false,
  "aria-label": ariaLabel,
}: {
  href: string;
  children?: ReactNode;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  if (disabled)
    return (
      <span aria-disabled="true" className={`${SHAPE} border-grid text-faint`}>
        {children}
      </span>
    );
  return (
    <Link href={href} aria-label={ariaLabel} className={`ndi-hairline-btn ${SHAPE} border-[var(--ndi-mint-40)] text-accent`}>
      {children}
      <Icon name="arrowRight" size={13} strokeWidth={2.2} />
    </Link>
  );
}
