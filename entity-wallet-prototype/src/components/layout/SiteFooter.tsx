import type { ReactNode } from "react";

/**
 * The one footer. It was copied into six shells, which is how five of them
 * drifted out of alignment and two stopped sitting at the bottom of the page.
 *
 * `flex-none` matters: every shell that holds this to the foot of a short page
 * does it by being a `min-h-dvh` flex column with a `flex-1` main, and without
 * this the footer would be a flex item free to absorb the slack itself.
 */
export function SiteFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="flex-none px-4 py-4 text-xs text-faint min-[641px]:px-6 min-[901px]:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
        <span>© 2019 – 2026 Bhutan NDI · All rights reserved.</span>
        {children}
      </div>
    </footer>
  );
}
