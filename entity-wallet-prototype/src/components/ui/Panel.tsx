import type { ReactNode } from "react";

/**
 * The glass surface every content region sits on — the same material as the
 * website's contact panel, via the [data-cta-form] rule in ndi-effects.css.
 */
export function Panel({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      data-cta-form="1"
      className={`relative overflow-hidden rounded-[16px] border border-grid ${
        padded ? "p-5 min-[641px]:p-6" : ""
      } ${className}`.trim()}
    >
      {children}
    </section>
  );
}
