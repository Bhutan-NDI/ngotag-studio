import { PAUSED_STATUSES, isWalletMigrationEnabled } from './config'

import { MigrationStatus } from './types'

// While the selected org is paused for its wallet move (SCR-WM-08), writes that
// would touch its agent are refused before they leave the browser. The server
// enforces this with 423 too; this also keeps demo data from issuing or
// verifying on the shared agent mid-move.
const PAUSED_WRITE_PATHS = [
  '/credentials',
  '/proofs',
  '/connections',
  '/agents/did',
  '/dids',
  '/primary-did',
  '/create-keys',
]

export const MIGRATION_PAUSED_MESSAGE =
  'Issuing and verifying are paused while your organisation moves to its own agent.'

interface IPauseState {
  orgId: string | null
  status: MigrationStatus | null
  pausedByServer: boolean
}

export const isMigrationWriteBlocked = (
  url: string,
  migration: IPauseState,
  currentOrgId: string | null,
  enabled = isWalletMigrationEnabled,
): boolean => {
  if (!enabled) {
    return false
  }
  const paused =
    migration.pausedByServer ||
    (migration.orgId === currentOrgId &&
      migration.status !== null &&
      PAUSED_STATUSES.includes(migration.status))
  return paused && PAUSED_WRITE_PATHS.some((path) => url.includes(path))
}
