import { MigrationStatus } from './types'

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

/** The platform only accepts a cancel before the move starts. */
export const CANCELLABLE_STATUSES: MigrationStatus[] = ['CREATED', 'REHEARSED']

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
