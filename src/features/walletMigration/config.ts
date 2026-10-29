import { IMigration, MigrationStatus } from './types'

/** Feature flag: hides the entry button, banner and status polling when off. */
export const isWalletMigrationEnabled =
  process.env.NEXT_PUBLIC_ENABLE_WALLET_MIGRATION === 'true'

/**
 * Use dummy data until the platform migration API exists. Defaults to on, so
 * enabling the feature never calls endpoints that aren't deployed yet.
 */
export const MOCK_MIGRATION_API =
  process.env.NEXT_PUBLIC_WALLET_MIGRATION_MOCK !== 'false'

export const POLL_RUNNING_MS = 5_000
export const POLL_IDLE_MS = 60_000

/** Move day: issuing and verifying are paused (SCR-WM-08). Matches the
 * platform's ORG_AGENT_MIGRATION_FROZEN_STATUSES. */
export const PAUSED_STATUSES: MigrationStatus[] = [
  'FROZEN',
  'EXPORTING',
  'IMPORTING',
  'VERIFYING',
  'CUTOVER',
]

/**
 * The move-day statuses before the switch. Only these run against the freeze
 * deadline: from CUTOVER on, the platform finishes the move however long it
 * takes, because the switch can't be undone (SAD E.7).
 */
export const DEADLINE_STATUSES: MigrationStatus[] = [
  'FROZEN',
  'EXPORTING',
  'IMPORTING',
  'VERIFYING',
]

/**
 * A required step after the switch keeps failing (platform #131): the move
 * stays in CUTOVER, paused, with COMPLETION_STEP_FAILED:<step> until it
 * succeeds. Owners and platform admins get the MOVE_STUCK alert.
 */
export const isCutoverStuck = (
  migration: Pick<IMigration, 'status' | 'error'>,
): boolean =>
  migration.status === 'CUTOVER' &&
  (migration.error ?? '').startsWith('COMPLETION_STEP_FAILED')

/**
 * The platform took the booking back (platform #128): a missed slot, a
 * rehearsal gone stale, or final checks that kept failing. The move returns
 * to REHEARSED with the slot cleared and the reason in `error`, which clears
 * once the owner books again.
 */
export const isPutBack = (
  migration: Pick<IMigration, 'status' | 'error'>,
): boolean => migration.status === 'REHEARSED' && Boolean(migration.error)

/** Rehearsed, booked or not: the statuses the rehearsal results belong to. */
export const isRehearsed = (status: MigrationStatus): boolean =>
  status === 'REHEARSED' || status === 'SCHEDULED'

/**
 * A move can only start from a recent rehearsal, measured at the slot (the
 * platform's ORG_MIGRATION_REHEARSAL_MAX_AGE_DAYS, 14 by default). Booking
 * past it is refused, and a slot reached past it is taken back.
 */
export const REHEARSAL_MAX_AGE_DAYS = 14

export const isRehearsalStale = (
  migration: Pick<IMigration, 'rehearsal'>,
  at: number = Date.now(),
): boolean => {
  const finishedAt = migration.rehearsal?.finishedAt
  if (!finishedAt) {
    return true
  }
  const maxAgeMs = REHEARSAL_MAX_AGE_DAYS * 86_400_000
  return at - new Date(finishedAt).getTime() > maxAgeMs
}

/** The platform only accepts a cancel before the move starts. */
export const CANCELLABLE_STATUSES: MigrationStatus[] = [
  'CREATED',
  'REHEARSED',
  'SCHEDULED',
]

/** Move-day steps (SAD Annex E.3) and the platform status that runs each. */
export const MOVE_DAY_STEPS: { status: MigrationStatus; label: string }[] = [
  { status: 'FROZEN', label: 'Pause issuing and verifying, and hold messages' },
  { status: 'EXPORTING', label: 'Export wallet' },
  { status: 'IMPORTING', label: 'Import into your agent' },
  { status: 'VERIFYING', label: 'Verify your new agent' },
  { status: 'CUTOVER', label: 'Switch to your agent and forward messages' },
]

/** Error codes that tell which move-day step failed (the rest aren't step-specific). */
export const failedMoveDayStep = (error: string | null): number => {
  const code = error ?? ''
  if (/^(RELAY_FAILED|ALERT_FAILED)/.test(code)) {
    return 0
  }
  if (/^EXPORT/.test(code)) {
    return 1
  }
  if (/^(IMPORT|DOWNLOAD_FAILED)/.test(code)) {
    return 2
  }
  if (/^VERIFICATION_FAILED/.test(code)) {
    return 3
  }
  if (/^(CUTOVER_FAILED|INVITATION_FAILED)/.test(code)) {
    return 4
  }
  return -1
}

export const MOVED_CHIP_DAYS = 30

/**
 * When a COMPLETED move finished. Platforms without `completedAt` still give
 * the time: COMPLETED is terminal, so the last change is the completion.
 */
export const completedTime = (migration: IMigration): string | null => {
  if (migration.status !== 'COMPLETED') {
    return null
  }
  return migration.completedAt ?? migration.lastChangedDateTime ?? null
}

const BTT = 'Asia/Thimphu'

/** Times are always shown in Bhutan time with the zone label (spec §2.4). */
export const formatBtt = (iso: string, withDate = true): string =>
  `${new Date(iso).toLocaleString('en-GB', {
    timeZone: BTT,
    ...(withDate ? { day: 'numeric', month: 'short', year: 'numeric' } : {}),
    hour: '2-digit',
    minute: '2-digit',
  })} BTT`

export const hoursUntil = (iso: string): number =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 3_600_000))
