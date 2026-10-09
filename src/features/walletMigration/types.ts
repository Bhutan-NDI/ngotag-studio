// Organisation wallet migration (UX-NGOTAG-WM-01 v0.6).
// Status, phase and error-code names are provisional until the platform API
// is agreed (SAD-NGOTAG-WM-01 §5.2 / §7.6). Keep them in one place so the
// switch from dummy data to the real API only touches this file and the
// API wrappers.

export type MigrationStatus =
  | 'PREFLIGHT_RUNNING'
  | 'PREFLIGHT_FAILED'
  | 'PREFLIGHT_PASSED'
  | 'REHEARSING'
  | 'REHEARSAL_FAILED'
  | 'REHEARSED'
  | 'SCHEDULED'
  | 'FROZEN'
  | 'CUTOVER'
  | 'STABILISING'
  | 'ROTATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'DISASTER_RESTORED'

export type MigrationErrorCode =
  | 'TARGET_NOT_PRISTINE'
  | 'STORAGE_VERSION_MISMATCH'
  | 'AGENT_UNREACHABLE'
  | 'PUBLIC_ENDPOINT_UNREACHABLE'
  | 'STEP_UP_REQUIRED'
  | 'ORG_BULK_JOB_ACTIVE'
  | 'UNSUPPORTED_FEATURES'
  | 'RELAY_WS_UNSUPPORTED'
  | 'RELAY_REQUIRES_SHARED_REDIS'
  | 'EXPORT_FAILED'
  | 'IMPORT_FAILED'
  | 'BUDGET_EXCEEDED'
  | 'CUTOVER_FAILED'
  | 'VERIFICATION_FAILED'
  | 'ORG_AGENT_MIGRATING'
  | 'MIGRATION_ALREADY_EXISTS'

export type CheckState = 'waiting' | 'running' | 'passed' | 'failed'

export interface IPreflightCheck {
  key: string
  label: string
  state: CheckState
  errorCode?: MigrationErrorCode
  /** Extra detail for the message, e.g. the found/required versions. */
  detail?: Record<string, string>
}

export interface IRehearsalResult {
  records: {
    connections: number
    credentials: number
    proofs: number
    dids: number
  }
  durationMinutes: number
  predictedPauseMinutes: number
  downloadMethod: 'direct' | 'platform'
}

export interface IMoveDayProgress {
  /** Index into MOVE_DAY_STEPS of the step currently running (or failed). */
  currentStep: number
  elapsedMinutes: number
  expectedMinutes: number
  limitMinutes: number
  failedCheck?: string
}

export interface IConnectionUpdateProgress {
  updated: number
  waiting: number
  refused: number
  inactive: number
}

export interface IHealthCheck {
  key: string
  label: string
  ok: boolean
}

export interface IMigration {
  id: string
  orgId: string
  status: MigrationStatus
  adminUrl: string
  publicUrl: string
  createdAt: string
  preflight: IPreflightCheck[]
  rehearsal?: IRehearsalResult
  scheduledFor?: string
  moveDay?: IMoveDayProgress
  stabilisationEndsAt?: string
  /** First-48-hours checks: issuing, verifying, webhooks, forwarding. */
  healthChecks?: IHealthCheck[]
  connections?: IConnectionUpdateProgress
  forwardedLast30Days?: number
  completedAt?: string
  errorCode?: MigrationErrorCode
  /** Shown to the user as a support reference, never on its own. */
  referenceId?: string
}

export interface IStartMovePayload {
  adminUrl: string
  publicUrl: string
  apiKey: string
}

export type MigrationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: string }
