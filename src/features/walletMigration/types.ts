// Organisation wallet migration (UX-NGOTAG-WM-01 v0.6).
// Mirrors what the platform returns from GET /orgs/:orgId/agents/migrate
// (PUBLIC_MIGRATION_FIELDS in agent-service, org-migration branch).

export type MigrationStatus =
  | 'CREATED'
  | 'REHEARSED'
  | 'SCHEDULED'
  | 'FROZEN'
  | 'EXPORTING'
  | 'IMPORTING'
  | 'VERIFYING'
  | 'CUTOVER'
  | 'STABILISING'
  | 'ROTATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'DISASTER_RESTORED'

export type PreflightCheckId =
  | 'ORG_IS_SHARED'
  | 'AGENT_REACHABLE'
  | 'TOKEN_IS_ROOT'
  | 'ENDPOINT_MATCHES'
  | 'RELEASE_MATCHES'
  | 'CONFIG_MATCHES'
  | 'TARGET_PRISTINE'
  | 'DIDCOMM_REACHABLE'
  | 'NO_BULK_JOB'
  | 'WEBHOOK_DELIVERS'
  | 'DOWNLOAD_METHOD'
  | 'NO_OUT_OF_SCOPE_ARTEFACTS'
  | 'NO_WEBSOCKET_ENDPOINTS'
  | 'SHARED_REDIS'
  | 'BACKUPS_CONFIRMED'

export type PreflightCheckStatus = 'PASS' | 'FAIL' | 'SKIPPED'

export interface IPreflightCheck {
  id: PreflightCheckId
  status: PreflightCheckStatus
  /** Stable code mapped to a message; never raw error text. */
  code?: string
  /** Non-secret facts, e.g. the version found and the one required. */
  detail?: Record<string, string | number | boolean | string[]>
}

export interface IPreflightReport {
  ranAt: string
  passed: boolean
  checks: IPreflightCheck[]
}

export type DownloadMethod = 'PULL' | 'PUSH'

export interface IRehearsalRecord {
  step?: 'EXPORT' | 'IMPORT'
  code?: string
  downloadMethod?: DownloadMethod
  exportMs?: number
  importMs?: number
  exportCleanup?: 'DELETED' | 'FAILED'
  finishedAt?: string
}

export interface IRotationProgress {
  job: { status: string; startedAt?: string; completedAt?: string }
  /** total, pending, retrying, failed, waiting, stale, refused, updated */
  counts: Record<string, number>
  polledAt: string
}

export interface IMigration {
  id: string
  createDateTime: string
  lastChangedDateTime: string
  orgId: string
  status: MigrationStatus
  startedBy: string
  targetAdminEndpoint: string | null
  targetDidcommEndpoint: string | null
  counts: { entries?: number; keys?: number; skipped?: number } | null
  releaseVersion: string | null
  storageVersion: string | null
  rehearsalDurationMs: number | null
  predictedFreezeMs: number | null
  scheduledFor: string | null
  freezeDeadline: string | null
  stabilisationEndsAt: string | null
  purgedAt: string | null
  /** Why the move failed or was put back, e.g. SLOT_MISSED. Empty for an owner's cancel. */
  error: string | null
  backupsConfirmedAt: string | null
  preflight: IPreflightReport | null
  rehearsalStatus: 'RUNNING' | 'DONE' | 'FAILED' | null
  rehearsalStartedAt: string | null
  rehearsal: IRehearsalRecord | null
  rotation: IRotationProgress | null
  webhookConfirmedAt: string | null
  downloadMethod: DownloadMethod | null
  // Only platforms with the completedAt column send it (ngotag-platform #130).
  completedAt?: string | null
}

/** Body of POST /orgs/:orgId/agents/migrate (CreateOrgAgentMigrationDto). */
export interface IStartMovePayload {
  targetAdminEndpoint: string
  targetDidcommEndpoint: string
  apiKey: string
  backupsConfirmed: boolean
}

/** create and preflight answer with the move plus the report they just ran. */
export interface IMigrationWithPreflight {
  migration: IMigration
  preflight: IPreflightReport | null
}

export type MigrationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: string; statusCode?: number }
