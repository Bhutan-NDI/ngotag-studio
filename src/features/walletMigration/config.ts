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

/** Statuses where a step is actively running and the page should poll fast. */
export const RUNNING_STATUSES: MigrationStatus[] = [
  'PREFLIGHT_RUNNING',
  'REHEARSING',
  'FROZEN',
  'CUTOVER',
]

/** Issuing and verifying are paused (SCR-WM-08). */
export const PAUSED_STATUSES: MigrationStatus[] = ['FROZEN', 'CUTOVER']

/** Before move day the owner can still cancel the move. */
export const CANCELLABLE_STATUSES: MigrationStatus[] = [
  'PREFLIGHT_RUNNING',
  'PREFLIGHT_FAILED',
  'PREFLIGHT_PASSED',
  'REHEARSING',
  'REHEARSAL_FAILED',
  'REHEARSED',
  'SCHEDULED',
]

/** Move-day steps (SAD Annex E.3), shown in this order on SCR-WM-05. */
export const MOVE_DAY_STEPS = [
  'Pause issuing and verifying',
  'Hold incoming messages',
  'Export wallet',
  'Import into your agent',
  'Verify your new agent',
  'Switch to your agent',
  'Forward held messages',
  'Resume',
]

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
