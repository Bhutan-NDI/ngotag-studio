'use client'

import { PAUSED_STATUSES, isWalletMigrationEnabled } from '../config'

import Link from 'next/link'
import { PauseCircle } from 'lucide-react'
import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { useMigrationStatus } from '../useMigrationStatus'
import { usePathname } from 'next/navigation'

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

// P-03 status banner: can't be dismissed while paused, announced politely.
function PausedBannerInner(): React.JSX.Element | null {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const pathname = usePathname()
  // Keeps the slice current on every page, at the idle (60 s) rate.
  const { migration } = useMigrationStatus(orgId)
  const paused = useMigrationPaused()

  const onBannerPage = BANNER_PATHS.some((p) => pathname?.startsWith(p))
  if (!paused || !onBannerPage) {
    return <div aria-live="polite" className="sr-only" />
  }

  const remainingMinutes = migration?.moveDay
    ? Math.max(
        0,
        migration.moveDay.expectedMinutes - migration.moveDay.elapsedMinutes,
      )
    : null
  const remainingMs = (remainingMinutes ?? 0) * 60_000
  const expectedUntil =
    remainingMinutes === null
      ? null
      : new Date(Date.now() + remainingMs).toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Thimphu',
          hour: '2-digit',
          minute: '2-digit',
        })

  return (
    <div aria-live="polite">
      <div
        role="status"
        className="mx-4 mt-4 flex flex-wrap items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
      >
        <PauseCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1">
          Issuing and verifying are paused while your organisation moves to its
          own agent
          {expectedUntil ? ` (expected until about ${expectedUntil} BTT)` : ''}.
          Messages from citizens are being held safely.
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
