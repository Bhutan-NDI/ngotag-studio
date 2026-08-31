'use client'

import React, { type ReactNode } from 'react'

interface NgotagBareShellProps {
  children: ReactNode
}

/**
 * Minimal ngotag chrome for standalone pages that sit outside the signed-in
 * app shell (auth-adjacent screens, marketplace, legal docs): the same depth
 * gradient + atmosphere background and copyright footer as NgotagAppShell /
 * NgotagAuthShell, without the top bar or sidebar those carry.
 */
export function NgotagBareShell({
  children,
}: NgotagBareShellProps): React.JSX.Element {
  return (
    <div className="relative flex h-dvh flex-col overflow-y-auto bg-[var(--ngotag-surface-canvas)]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'var(--ngotag-grad-depth)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage: 'var(--ngotag-atmos-pools)' }}
      />

      <main className="relative z-[1] flex-1">{children}</main>

      <footer className="text-ngotag-faint relative z-[1] py-6 text-center text-[12px]">
        © 2026 Bhutan NDI · All rights reserved.
      </footer>
    </div>
  )
}
