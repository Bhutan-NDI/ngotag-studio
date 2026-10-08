'use client'

import React, { type ReactNode, useState } from 'react'

import { BhutanndiSidebar } from './BhutanndiSidebar'
import { BhutanndiTopBar } from './BhutanndiTopBar'

interface BhutanndiAppShellProps {
  children: ReactNode
}

/**
 * The signed-in chrome for the bhutanndi theme: a fixed top bar, a sidebar that
 * becomes a drawer below 901px, and the scrolling content column beside it.
 * Ported from the reference's AppShell (src/components/layout/AppShell.tsx),
 * wired to this app's real session/org data via BhutanndiTopBar/BhutanndiSidebar
 * rather than the reference's demo store.
 */
export function BhutanndiAppShell({
  children,
}: BhutanndiAppShellProps): React.JSX.Element {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-[var(--bhutanndi-surface-canvas)]">
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

      <BhutanndiTopBar
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
      />
      <BhutanndiSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="relative z-[1] flex h-dvh flex-col overflow-y-auto pt-16 min-[901px]:pl-[248px]">
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 min-[641px]:px-6 min-[901px]:px-8 min-[901px]:py-8">
          {children}
        </main>
        <footer className="text-bhutanndi-faint py-6 text-center text-[12px]">
          © 2026 Bhutan NDI · All rights reserved.
        </footer>
      </div>
    </div>
  )
}
