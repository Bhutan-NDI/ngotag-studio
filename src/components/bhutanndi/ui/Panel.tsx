import React, { type ReactNode } from 'react'

/**
 * The glass surface every content region sits on — the same material as
 * the reference's contact panel, via the [data-bhutanndi-panel] rule in
 * src/styles/bhutanndi-effects.css.
 */
export function Panel({
  children,
  className = '',
  padded = true,
  id,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
  /** For anchor-scroll targets (e.g. linking straight to a danger-zone section). */
  id?: string
}): React.JSX.Element {
  return (
    <section
      id={id}
      data-bhutanndi-panel="1"
      className={`border-bhutanndi-grid relative overflow-hidden rounded-[16px] border ${
        padded ? 'p-5 min-[641px]:p-6' : ''
      } ${className}`.trim()}
    >
      {children}
    </section>
  )
}
