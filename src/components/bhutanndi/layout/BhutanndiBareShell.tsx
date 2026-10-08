'use client'

import React, { type ReactNode } from 'react'

interface BhutanndiBareShellProps {
  children: ReactNode
}

/**
 * Minimal bhutanndi chrome for standalone pages that sit outside the signed-in
 * app shell (auth-adjacent screens, marketplace, legal docs): the same depth
 * gradient + atmosphere background and copyright footer as BhutanndiAppShell /
 * BhutanndiAuthShell, without the top bar or sidebar those carry.
 */
export function BhutanndiBareShell({
  children,
}: BhutanndiBareShellProps): React.JSX.Element {
  return (
    <div className="relative flex h-dvh flex-col overflow-y-auto bg-[var(--bhutanndi-surface-canvas)]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'var(--bhutanndi-grad-depth)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage: 'var(--bhutanndi-atmos-pools)' }}
      />

      <main className="relative z-[1] flex-1">{children}</main>

      <footer className="text-bhutanndi-faint relative z-[1] py-6 text-center text-[12px]">
        © 2026 Bhutan NDI · All rights reserved.
      </footer>
    </div>
  )
}
