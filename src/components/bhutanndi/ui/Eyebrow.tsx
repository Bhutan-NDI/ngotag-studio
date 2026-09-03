import React, { type ReactNode } from 'react'

/** The mono uppercase "— Label" that opens every section. */
export function Eyebrow({
  children,
}: {
  children: ReactNode
}): React.JSX.Element {
  return (
    <div className="font-bhutanndi-mono text-bhutanndi-accent text-[11px] tracking-[0.18em] uppercase">
      {children}
    </div>
  )
}
