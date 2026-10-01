import Link from "next/link";

import { Icon, type IconName } from "./icons";

export interface MethodOption {
  heading: string;
  description: string;
  href: string;
  icon: IconName;
  /** The short qualifier under the heading — "No connection needed". */
  tag: string;
  recommended?: boolean;
}

/**
 * The fork at the top of issuance and verification: pick how you want to reach
 * the holder.
 *
 * Cards rather than a select, because the choice is not a preference — each
 * route has a different precondition (an existing connection, an email
 * address, a scannable screen), and the description is what makes that
 * decidable. The grid sizes off the cards rather than the viewport, so three
 * options sit in a row on a wide screen and stack cleanly once they cannot.
 */
export function OptionCards({ options }: { options: MethodOption[] }) {
  return (
    <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
      {options.map((o) => (
        <Link
          key={o.heading}
          href={o.href}
          data-cta-form="1"
          className="ndi-lift relative flex flex-col gap-3 overflow-hidden rounded-[16px] border border-grid p-5 min-[641px]:p-6"
        >
          <div className="relative z-[4] flex items-center gap-3">
            <span
              className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-grid text-accent"
              style={{ background: "var(--ndi-mint-04)" }}
            >
              <Icon name={o.icon} size={19} strokeWidth={1.7} />
            </span>
            {o.recommended ? (
              <span
                className="ml-auto inline-flex items-center rounded-full border border-grid px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent"
                style={{ background: "var(--ndi-mint-08)" }}
              >
                Recommended
              </span>
            ) : null}
          </div>

          <div className="relative z-[4]">
            <h2 className="m-0 font-display text-[17px] font-semibold leading-[1.25] tracking-[-0.01em] text-strong">
              {o.heading}
            </h2>
            <p className="m-0 mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {o.tag}
            </p>
            <p className="m-0 mt-3 text-[13.5px] leading-[1.55] text-muted">{o.description}</p>
          </div>

          <span className="relative z-[4] mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-medium text-accent">
            Continue
            <Icon name="arrowRight" size={15} strokeWidth={2} />
          </span>
        </Link>
      ))}
    </div>
  );
}
