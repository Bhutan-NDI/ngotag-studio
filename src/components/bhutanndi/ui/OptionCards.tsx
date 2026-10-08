import { Icon, type IconName } from './icons'

import Link from 'next/link'

import type React from 'react'

export interface MethodOption {
  heading: string
  description: string
  href: string
  icon: IconName
  /** The short qualifier under the heading — "No connection needed". */
  tag: string
  recommended?: boolean
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
export function OptionCards({
  options,
}: {
  options: MethodOption[]
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
      {options.map((o) => (
        <Link
          key={o.heading}
          href={o.href}
          data-bhutanndi-panel="1"
          className="ndi-lift border-bhutanndi-grid relative flex flex-col gap-3 overflow-hidden rounded-[16px] border p-5 min-[641px]:p-6"
        >
          <div className="relative z-[4] flex items-center gap-3">
            <span
              className="border-bhutanndi-grid text-bhutanndi-accent inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border"
              style={{ background: 'var(--bhutanndi-mint-04)' }}
            >
              <Icon name={o.icon} size={19} strokeWidth={1.7} />
            </span>
            {o.recommended ? (
              <span
                className="border-bhutanndi-grid font-bhutanndi-mono text-bhutanndi-accent ml-auto inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase"
                style={{ background: 'var(--bhutanndi-mint-08)' }}
              >
                Recommended
              </span>
            ) : null}
          </div>

          <div className="relative z-[4]">
            <h2 className="font-display text-bhutanndi-strong m-0 text-[17px] leading-[1.25] font-semibold tracking-[-0.01em]">
              {o.heading}
            </h2>
            <p className="font-bhutanndi-mono text-bhutanndi-faint m-0 mt-1 text-[10px] tracking-[0.14em] uppercase">
              {o.tag}
            </p>
            <p className="text-bhutanndi-muted m-0 mt-3 text-[13.5px] leading-[1.55]">
              {o.description}
            </p>
          </div>

          <span className="text-bhutanndi-accent relative z-[4] mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-medium">
            Continue
            <Icon name="arrowRight" size={15} strokeWidth={2} />
          </span>
        </Link>
      ))}
    </div>
  )
}
