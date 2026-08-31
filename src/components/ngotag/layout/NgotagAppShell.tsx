'use client'

import React, { type ReactNode, useState } from 'react'

import { NgotagSidebar } from './NgotagSidebar'
import { NgotagTopBar } from './NgotagTopBar'

interface NgotagAppShellProps {
  children: ReactNode
}

/**
 * The signed-in chrome for the ngotag theme: a fixed top bar, a sidebar that
 * becomes a drawer below 901px, and the scrolling content column beside it.
 * Ported from the reference's AppShell (src/components/layout/AppShell.tsx),
 * wired to this app's real session/org data via NgotagTopBar/NgotagSidebar
 * rather than the reference's demo store.
 */
export function NgotagAppShell({
  children,
}: NgotagAppShellProps): React.JSX.Element {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-[var(--ngotag-surface-canvas)]">
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

      <NgotagTopBar
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
      />
      <NgotagSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="relative z-[1] flex h-dvh flex-col overflow-y-auto pt-16 min-[901px]:pl-[248px]">
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 min-[641px]:px-6 min-[901px]:px-8 min-[901px]:py-8">
          {children}
        </main>
        <footer className="text-ngotag-faint py-6 text-center text-[12px]">
          © 2026 Bhutan NDI · All rights reserved.
        </footer>
      </div>
    </div>
  )
}
