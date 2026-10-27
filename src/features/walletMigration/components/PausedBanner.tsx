'use client'

import {
  DEADLINE_STATUSES,
  PAUSED_STATUSES,
  formatBtt,
  isCutoverStuck,
  isWalletMigrationEnabled,
} from '../config'
import React, { useEffect } from 'react'
import { useMigrationPoller, useMigrationStatus } from '../useMigrationStatus'

import { IMigration } from '../types'
import Link from 'next/link'
import { PauseCircle } from 'lucide-react'
import { generateAccessToken } from '@/utils/session'
import { useAppSelector } from '@/lib/hooks'
import { usePathname } from 'next/navigation'

const SESSION_KEEPALIVE_MS = 4 * 60_000

// Pages where issuing/verifying actions live (SCR-WM-08).
const BANNER_PATHS = [
  '/credentials',
  '/verification',
  '/connections',
  '/create-did',
  '/dashboard',
]

/** True while the current org is paused for its move (UXD-07). */
export const useMigrationPaused = (): boolean => {
  const { status, pausedByServer, orgId } = useAppSelector(
    (state) => state.walletMigration,
  )
  const currentOrgId = useAppSelector((state) => state.organization.orgId)
  if (!isWalletMigrationEnabled) {
    return false
  }
  return (
    pausedByServer ||
    (orgId === currentOrgId &&
      status !== null &&
      PAUSED_STATUSES.includes(status))
  )
}

/**
 * Banner text. Before the switch the platform gives the latest time the pause
 * can last (after that it cancels itself). From CUTOVER on there is no such
 * limit, because the move only finishes, so no end time is promised.
 */
export const pausedBannerMessage = (migration: IMigration | null): string => {
  if (migration && isCutoverStuck(migration)) {
    return 'Issuing and verifying are still paused: finishing the move to your own agent is taking longer than expected. The platform team has been alerted.'
  }
  if (migration?.status === 'CUTOVER') {
    return 'Issuing and verifying are paused while your organisation finishes switching to its own agent.'
  }
  const latestEnd =
    migration &&
    DEADLINE_STATUSES.includes(migration.status) &&
    migration.freezeDeadline
      ? ` (until ${formatBtt(migration.freezeDeadline, false)} at the latest)`
      : ''
  return `Issuing and verifying are paused while your organisation moves to its own agent${latestEnd}.`
}

// P-03 status banner: can't be dismissed while paused, announced politely.
function PausedBannerInner(): React.JSX.Element | null {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const pathname = usePathname()
  // The only status poller: the layout mounts this banner once on every
  // page, and the migration screens read what it stores.
  useMigrationPoller(orgId)
  const { migration } = useMigrationStatus(orgId)
  const paused = useMigrationPaused()

  // No sign-out mid-move (spec §2.3): renew the token while paused so an idle
  // owner isn't logged out. The sign-in server's absolute session limit still
  // applies; if it ends, the user returns to the move page after signing in.
  useEffect(() => {
    if (!paused) {
      return undefined
    }
    const timer = setInterval(() => {
      void generateAccessToken()
    }, SESSION_KEEPALIVE_MS)
    return () => clearInterval(timer)
  }, [paused])

  const onBannerPage = BANNER_PATHS.some((p) => pathname?.startsWith(p))
  if (!paused || !onBannerPage) {
    return <div aria-live="polite" className="sr-only" />
  }

  const message = pausedBannerMessage(migration)

  return (
    <div aria-live="polite">
      <div
        role="status"
        className="mx-4 mt-4 flex flex-wrap items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
      >
        <PauseCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1">
          {message} Messages from citizens are being held safely.
        </p>
        <Link href="/wallet-migration" className="font-semibold underline">
          View progress
        </Link>
      </div>
    </div>
  )
}

export function PausedBanner(): React.JSX.Element | null {
  if (!isWalletMigrationEnabled) {
    return null
  }
  return <PausedBannerInner />
}
