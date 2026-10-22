'use client'

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  PauseCircle,
} from 'lucide-react'
import { MOVED_CHIP_DAYS, formatBtt, hoursUntil } from '../config'

import { Badge } from '@/components/ui/badge'
import { IMigration } from '../types'
import React from 'react'

// P-06 status chip: text, icon and colour (never colour alone).
const chipFor = (
  migration: IMigration,
): { label: string; icon: React.ReactNode; className: string } | null => {
  const info =
    'border-primary/30 bg-primary/10 text-primary hover:bg-primary/10'
  const warn =
    'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400'
  const ok =
    'border-green-300 bg-green-50 text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-green-950 dark:text-green-400'
  const spin = <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />

  switch (migration.status) {
    case 'PREFLIGHT_RUNNING':
    case 'PREFLIGHT_PASSED':
    case 'REHEARSING':
    case 'REHEARSED':
      return {
        label: 'Move in progress: preparing',
        icon: spin,
        className: info,
      }
    case 'PREFLIGHT_FAILED':
    case 'REHEARSAL_FAILED':
      return {
        label: 'Move needs attention',
        icon: <AlertTriangle className="h-3.5 w-3.5" aria-hidden />,
        className: warn,
      }
    case 'SCHEDULED':
      return {
        label: `Move scheduled: ${migration.scheduledFor ? formatBtt(migration.scheduledFor) : ''}`,
        icon: <Clock className="h-3.5 w-3.5" aria-hidden />,
        className: info,
      }
    case 'FROZEN':
    case 'CUTOVER':
      return {
        label: 'Moving now: issuing and verifying paused',
        icon: <PauseCircle className="h-3.5 w-3.5" aria-hidden />,
        className: warn,
      }
    case 'STABILISING':
      return {
        label: `Move in progress: first 48 hours (${
          migration.stabilisationEndsAt
            ? hoursUntil(migration.stabilisationEndsAt)
            : 48
        } hours left)`,
        icon: spin,
        className: info,
      }
    case 'ROTATING':
      return {
        label: 'Move in progress: updating connections',
        icon: spin,
        className: info,
      }
    case 'FAILED':
      return {
        label: 'Move cancelled automatically: reschedule',
        icon: <AlertTriangle className="h-3.5 w-3.5" aria-hidden />,
        className: warn,
      }
    case 'COMPLETED': {
      const completed = migration.completedAt
        ? new Date(migration.completedAt)
        : null
      const recent =
        completed &&
        Date.now() - completed.getTime() < MOVED_CHIP_DAYS * 24 * 3_600_000
      return recent
        ? {
            label: `Moved on ${completed.toLocaleDateString('en-GB', { timeZone: 'Asia/Thimphu' })}`,
            icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
            className: ok,
          }
        : null
    }
    case 'DISASTER_RESTORED':
      return {
        label: 'Restored to shared agent',
        icon: <AlertTriangle className="h-3.5 w-3.5" aria-hidden />,
        className: warn,
      }
    default:
      return null
  }
}

export function MigrationStatusChip({
  migration,
}: Readonly<{ migration: IMigration }>): React.JSX.Element | null {
  const chip = chipFor(migration)
  if (!chip) {
    return null
  }
  return (
    <Badge className={`gap-1.5 text-xs whitespace-normal ${chip.className}`}>
      {chip.icon}
      {chip.label}
    </Badge>
  )
}
