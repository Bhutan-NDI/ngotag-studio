'use client'
/* eslint-disable sort-imports */

import { Eyebrow } from '@/components/ngotag/ui/Eyebrow'
import { Icon } from '@/components/ngotag/ui/icons'
import DynamicApplicationLogo from '@/features/components/DynamicLogo'
import Footer from '@/components/Footer'
import React, { type ReactNode } from 'react'
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle'

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE?.trim() || 'Studio'

interface NgotagAuthShellProps {
  children: ReactNode
  /** The left rail's headline; one emphasised phrase, per the design system. */
  title: ReactNode
  lead: string
  scene: ReactNode
}

/**
 * Page shell for the signed-out flow, ported from BhutanNDI_Studio's
 * AuthShell/AuthHeader: the logo header, a two-column body that collapses to
 * one below 901px, and the real app footer. The form itself is passed in as
 * `children` — this component only supplies the chrome and the bordered card
 * frame around it, matching how the reference's AuthShell wraps its steps.
 */
export function NgotagAuthShell({
  children,
  title,
  lead,
  scene,
}: NgotagAuthShellProps): React.JSX.Element {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--ngotag-surface-canvas)]">
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

      <header className="relative z-[60]">
        <div className="flex h-16 w-full items-center px-4 min-[641px]:px-6">
          <DynamicApplicationLogo />
          <span className="ml-auto">
            <ModeToggle />
          </span>
        </div>
      </header>

      <main className="relative z-[1] mx-auto flex w-full max-w-[1200px] flex-1 items-center px-5 py-14 min-[641px]:px-8 min-[901px]:py-20">
        <div className="grid w-full items-center gap-12 min-[901px]:grid-cols-[1.05fr_1fr] min-[901px]:gap-20">
          {/* Left rail — hidden on phones, where the form is the whole job. */}
          <section className="hidden min-[901px]:block">
            <div className="mb-10 max-w-[440px]">{scene}</div>
            <Eyebrow>— {appTitle}</Eyebrow>
            <h1 className="text-ngotag-strong font-display mt-4 max-w-[460px] text-[clamp(30px,3.4vw,42px)] leading-[1.08] font-semibold tracking-[-0.03em] [text-wrap:balance]">
              {title}
            </h1>
            <p className="text-ngotag-muted mt-5 max-w-[440px] text-[17px] leading-[1.62] [text-wrap:pretty]">
              {lead}
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {['Verified credentials', 'End-to-end encrypted'].map((label) => (
                <span
                  key={label}
                  className="border-ngotag-grid text-ngotag-accent font-ngotag-mono inline-flex items-center gap-2 rounded-full border bg-[var(--ngotag-fill-sunk)] px-3 py-2 text-[10px] tracking-[0.14em] uppercase"
                >
                  <Icon name="check" size={12} strokeWidth={2.4} />
                  {label}
                </span>
              ))}
            </div>
          </section>

          {/* Right — the form panel. */}
          <section className="w-full justify-self-center min-[901px]:justify-self-end">
            <div
              data-ngotag-panel="1"
              className="border-ngotag-grid relative mx-auto w-full max-w-[440px] rounded-[16px] border p-5 min-[561px]:p-7 min-[901px]:rounded-[20px] min-[901px]:p-8"
            >
              {children}
            </div>
          </section>
        </div>
      </main>

      <div className="relative z-[1]">
        <Footer />
      </div>
    </div>
  )
}
