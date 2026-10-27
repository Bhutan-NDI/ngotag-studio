// Dummy data for the wallet migration screens, shaped exactly like the
// platform's responses (PUBLIC_MIGRATION_FIELDS, org-migration branch), so the
// screens behave the same with NEXT_PUBLIC_WALLET_MIGRATION_MOCK=false.
//
// The move is kept in localStorage per org (never the API key) and moves on a
// compressed timeline: rehearsal ~6 s, move day ~25 s from scheduling, the
// "first 48 hours" ~30 s and connection updates ~30 s.
//
// Demo triggers — put one of these words in the agent admin address:
//   not-pristine   first checks fail with TARGET_NOT_PRISTINE
//   old-release    first checks fail with RELEASE_MISMATCH
//   unreachable    first checks fail with AGENT_UNREACHABLE
//   rehearsal-fail first rehearsal fails (JOB_FAILED during export)
//   slot-missed    first booked slot is missed (back to REHEARSED, SLOT_MISSED)
//   verify-fail    move day fails at VERIFYING (VERIFICATION_FAILED:RELAY_PROBE)
//   slow           move day fails with FREEZE_BUDGET_EXCEEDED during import
//   disaster       ends in DISASTER_RESTORED during the first 48 hours
// A re-run of the checks or rehearsal, or a new booking, then succeeds.

import {
  IMigration,
  IMigrationWithPreflight,
  IPreflightCheck,
  IPreflightReport,
  IStartMovePayload,
  MigrationPhase,
  MigrationResult,
  MigrationStatus,
  PreflightCheckId,
} from './types'

const REHEARSAL_MS = 6_000
const START_DELAY_MS = 8_000
const STEP_MS = 4_000
const STABILISE_MS = 30_000
const WEBHOOK_CONFIRM_MS = 6_000
const ROTATE_MS = 30_000
const LATENCY_MS = 400
const TOTAL_CONNECTIONS = 1240

const CHECK_IDS: PreflightCheckId[] = [
  'ORG_IS_SHARED',
  'AGENT_REACHABLE',
  'TOKEN_IS_ROOT',
  'ENDPOINT_MATCHES',
  'RELEASE_MATCHES',
  'CONFIG_MATCHES',
  'TARGET_PRISTINE',
  'DIDCOMM_REACHABLE',
  'NO_BULK_JOB',
  'WEBHOOK_DELIVERS',
  'DOWNLOAD_METHOD',
  'NO_OUT_OF_SCOPE_ARTEFACTS',
  'NO_WEBSOCKET_ENDPOINTS',
  'SHARED_REDIS',
  'BACKUPS_CONFIRMED',
]

const FAILING_CHECK: Record<
  string,
  { id: PreflightCheckId; code: string; detail?: IPreflightCheck['detail'] }
> = {
  'not-pristine': { id: 'TARGET_PRISTINE', code: 'TARGET_NOT_PRISTINE' },
  'old-release': {
    id: 'RELEASE_MATCHES',
    code: 'RELEASE_MISMATCH',
    detail: { found: '0.5.6', required: '0.6.1' },
  },
  unreachable: { id: 'AGENT_REACHABLE', code: 'AGENT_UNREACHABLE' },
}

// Checks that can't run once the agent is unreachable.
const NEEDS_AGENT: PreflightCheckId[] = [
  'TOKEN_IS_ROOT',
  'ENDPOINT_MATCHES',
  'RELEASE_MATCHES',
  'CONFIG_MATCHES',
  'TARGET_PRISTINE',
  'WEBHOOK_DELIVERS',
  'DOWNLOAD_METHOD',
]

interface IMockRecord {
  id: string
  orgId: string
  targetAdminEndpoint: string
  targetDidcommEndpoint: string
  createDateTime: string
  backupsConfirmed: boolean
  preflightRuns: number
  preflight: IPreflightReport | null
  rehearsalRuns: number
  rehearsalStartedAt: number | null
  bookings: number
  bookedAt: number | null
  scheduledFor: string | null
  /** Set once the owner cancels; the move is kept, like on the platform. */
  cancelledAt: string | null
}

const storageKey = (orgId: string): string => `walletMigrationMock:${orgId}`

const load = (orgId: string): IMockRecord | null => {
  try {
    const raw = localStorage.getItem(storageKey(orgId))
    return raw ? (JSON.parse(raw) as IMockRecord) : null
  } catch {
    return null
  }
}

const save = (record: IMockRecord): void => {
  try {
    localStorage.setItem(storageKey(record.orgId), JSON.stringify(record))
  } catch {
    // Private mode / storage blocked: the demo just won't survive a reload.
  }
}

const wait = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

const trigger = (record: IMockRecord, word: string): boolean =>
  record.targetAdminEndpoint.toLowerCase().includes(word)

const iso = (ms: number): string => new Date(ms).toISOString()

const runPreflight = (record: IMockRecord): IPreflightReport => {
  const failing =
    record.preflightRuns === 1
      ? Object.entries(FAILING_CHECK).find(([word]) =>
          trigger(record, word),
        )?.[1]
      : undefined
  const checks: IPreflightCheck[] = CHECK_IDS.map((id) => {
    if (failing && id === failing.id) {
      return { id, status: 'FAIL', code: failing.code, detail: failing.detail }
    }
    if (id === 'BACKUPS_CONFIRMED' && !record.backupsConfirmed) {
      return { id, status: 'FAIL', code: 'BACKUPS_NOT_CONFIRMED' }
    }
    if (failing?.id === 'AGENT_REACHABLE' && NEEDS_AGENT.includes(id)) {
      return { id, status: 'SKIPPED' }
    }
    if (id === 'DOWNLOAD_METHOD') {
      return { id, status: 'PASS', detail: { method: 'PULL' } }
    }
    return { id, status: 'PASS' }
  })
  return {
    ranAt: iso(Date.now()),
    passed: checks.every((c) => c.status !== 'FAIL'),
    checks,
  }
}

const blank = (record: IMockRecord): IMigration => ({
  id: record.id,
  createDateTime: record.createDateTime,
  lastChangedDateTime: iso(Date.now()),
  orgId: record.orgId,
  status: 'CREATED',
  phase: 'PREPARE',
  startedBy: 'mock-owner',
  targetAdminEndpoint: record.targetAdminEndpoint,
  targetDidcommEndpoint: record.targetDidcommEndpoint,
  counts: null,
  releaseVersion: '0.6.1',
  storageVersion: null,
  rehearsalDurationMs: null,
  predictedFreezeMs: null,
  scheduledFor: null,
  freezeDeadline: null,
  stabilisationEndsAt: null,
  purgedAt: null,
  error: null,
  backupsConfirmedAt: record.backupsConfirmed ? record.createDateTime : null,
  preflight: record.preflight,
  rehearsalStatus: null,
  rehearsalStartedAt: null,
  rehearsal: null,
  rotation: null,
  webhookConfirmedAt: null,
  downloadMethod: record.preflight ? 'PULL' : null,
  completedAt: null,
})

const failed = (m: IMigration, error: string): IMigration => ({
  ...m,
  status: 'FAILED',
  phase: 'CANCELLED',
  error,
})

const at = (
  m: IMigration,
  status: MigrationStatus,
  phase: MigrationPhase,
): IMigration => ({ ...m, status, phase })

const derive = (record: IMockRecord, now: number): IMigration => {
  let m = blank(record)

  // Rehearsal
  if (record.rehearsalStartedAt !== null) {
    m.rehearsalStartedAt = iso(record.rehearsalStartedAt)
    const done = now - record.rehearsalStartedAt >= REHEARSAL_MS
    if (!done) {
      m.rehearsalStatus = 'RUNNING'
    } else if (
      record.rehearsalRuns === 1 &&
      trigger(record, 'rehearsal-fail')
    ) {
      m.rehearsalStatus = 'FAILED'
      m.rehearsal = { step: 'EXPORT', code: 'JOB_FAILED', finishedAt: iso(now) }
    } else {
      m = {
        ...at(m, 'REHEARSED', 'PREPARE'),
        rehearsalStatus: 'DONE',
        rehearsalDurationMs: 12 * 60_000,
        predictedFreezeMs: 18 * 60_000,
        storageVersion: '1.0',
        counts: { entries: 48_210, keys: 3, skipped: 0 },
        rehearsal: {
          downloadMethod: 'PULL',
          exportMs: 5 * 60_000,
          importMs: 7 * 60_000,
          exportCleanup: 'DELETED',
          finishedAt: iso(record.rehearsalStartedAt + REHEARSAL_MS),
        },
      }
    }
  }

  if (record.cancelledAt) {
    return failed(m, 'CANCELLED_BY_OWNER')
  }
  if (m.status !== 'REHEARSED' || record.bookedAt === null) {
    return m
  }

  // Booked: move day starts START_DELAY_MS after booking, whatever slot was
  // picked, so the demo doesn't wait for the real date.
  m = { ...m, phase: 'SCHEDULED', scheduledFor: record.scheduledFor }
  const sinceBooking = now - record.bookedAt
  if (sinceBooking < START_DELAY_MS) {
    return m
  }
  if (record.bookings === 1 && trigger(record, 'slot-missed')) {
    return { ...m, phase: 'PREPARE', scheduledFor: null, error: 'SLOT_MISSED' }
  }

  const frozenAt = record.bookedAt + START_DELAY_MS
  const freezeBudgetMs = 30 * 60_000
  m.freezeDeadline = iso(frozenAt + freezeBudgetMs)
  const moveT = now - frozenAt
  const step = Math.floor(moveT / STEP_MS)
  const steps: MigrationStatus[] = [
    'FROZEN',
    'EXPORTING',
    'IMPORTING',
    'VERIFYING',
    'CUTOVER',
  ]
  const firstMove = record.bookings === 1
  if (firstMove && trigger(record, 'slow') && step >= 2) {
    return failed(m, 'FREEZE_BUDGET_EXCEEDED')
  }
  if (firstMove && trigger(record, 'verify-fail') && step >= 3) {
    return failed(m, 'VERIFICATION_FAILED:RELAY_PROBE')
  }
  if (step < steps.length) {
    return at(m, steps[step], 'MOVE')
  }

  // After the switch
  const moveDayMs = steps.length * STEP_MS
  const switchedAt = frozenAt + moveDayMs
  const afterSwitch = now - switchedAt
  m.stabilisationEndsAt = iso(switchedAt + STABILISE_MS)
  if (afterSwitch >= WEBHOOK_CONFIRM_MS) {
    m.webhookConfirmedAt = iso(switchedAt + WEBHOOK_CONFIRM_MS)
  }
  if (afterSwitch < STABILISE_MS) {
    if (trigger(record, 'disaster') && afterSwitch >= STABILISE_MS / 2) {
      return at(m, 'DISASTER_RESTORED', 'RESTORED')
    }
    // Show "48 hours" counting down on the compressed clock.
    const left = (STABILISE_MS - afterSwitch) / STABILISE_MS
    const leftMs = left * 48 * 3_600_000
    return {
      ...at(m, 'STABILISING', 'FIRST_48_HOURS'),
      stabilisationEndsAt: iso(now + leftMs),
    }
  }

  const rotateT = afterSwitch - STABILISE_MS
  const share = Math.min(1, rotateT / ROTATE_MS)
  const updated = Math.round(TOTAL_CONNECTIONS * 0.95 * share)
  const refused = Math.round(12 * share)
  const stale = Math.round(41 * share)
  const rotation = {
    job: {
      status: share >= 1 ? 'COMPLETED' : 'RUNNING',
      startedAt: iso(switchedAt + STABILISE_MS),
    },
    counts: {
      total: TOTAL_CONNECTIONS,
      updated,
      refused,
      stale,
      failed: 0,
      retrying: 0,
      waiting: 0,
      pending: TOTAL_CONNECTIONS - updated - refused - stale,
    },
    polledAt: iso(now),
  }
  if (rotateT < ROTATE_MS) {
    return { ...at(m, 'ROTATING', 'CHANGE_OF_ADDRESS'), rotation }
  }
  return {
    ...at(m, 'COMPLETED', 'COMPLETE'),
    rotation,
    completedAt: iso(switchedAt + STABILISE_MS + ROTATE_MS),
  }
}

const notFound = (): MigrationResult<never> => ({
  ok: false,
  message: 'No move found for this organisation.',
})

const isActive = (m: IMigration): boolean =>
  !['COMPLETED', 'FAILED', 'DISASTER_RESTORED'].includes(m.status)

export const mockGetMigration = async (
  orgId: string,
): Promise<MigrationResult<IMigration | null>> => {
  await wait()
  const record = load(orgId)
  return { ok: true, data: record ? derive(record, Date.now()) : null }
}

export const mockStartMigration = async (
  orgId: string,
  payload: IStartMovePayload,
): Promise<MigrationResult<IMigrationWithPreflight>> => {
  await wait()
  const existing = load(orgId)
  if (existing && isActive(derive(existing, Date.now()))) {
    return {
      ok: false,
      message: 'A move is already in progress for this organisation.',
    }
  }
  const record: IMockRecord = {
    id: crypto.randomUUID(),
    orgId,
    targetAdminEndpoint: payload.targetAdminEndpoint,
    targetDidcommEndpoint: payload.targetDidcommEndpoint,
    createDateTime: iso(Date.now()),
    backupsConfirmed: payload.backupsConfirmed,
    preflightRuns: 1,
    preflight: null,
    rehearsalRuns: 0,
    rehearsalStartedAt: null,
    bookings: 0,
    bookedAt: null,
    scheduledFor: null,
    cancelledAt: null,
  }
  record.preflight = runPreflight(record)
  save(record)
  const migration = derive(record, Date.now())
  return { ok: true, data: { migration, preflight: migration.preflight } }
}

export const mockRerunPreflight = async (
  orgId: string,
  body: { backupsConfirmed?: boolean },
): Promise<MigrationResult<IMigrationWithPreflight>> => {
  await wait()
  const record = load(orgId)
  if (!record || derive(record, Date.now()).status !== 'CREATED') {
    return notFound()
  }
  const next: IMockRecord = {
    ...record,
    preflightRuns: record.preflightRuns + 1,
    backupsConfirmed: body.backupsConfirmed ?? record.backupsConfirmed,
  }
  next.preflight = runPreflight(next)
  save(next)
  const migration = derive(next, Date.now())
  return { ok: true, data: { migration, preflight: migration.preflight } }
}

export const mockRunRehearsal = async (
  orgId: string,
): Promise<MigrationResult<IMigration>> => {
  await wait()
  const record = load(orgId)
  if (!record) {
    return notFound()
  }
  if (!record.preflight?.passed) {
    return { ok: false, message: 'The move checks have not passed yet.' }
  }
  const next: IMockRecord = {
    ...record,
    rehearsalRuns: record.rehearsalRuns + 1,
    rehearsalStartedAt: Date.now(),
  }
  save(next)
  return { ok: true, data: derive(next, Date.now()) }
}

export const mockScheduleMigration = async (
  orgId: string,
  confirmationName: string,
  scheduledFor?: string,
): Promise<MigrationResult<IMigration>> => {
  await wait()
  const record = load(orgId)
  if (!record) {
    return notFound()
  }
  if (derive(record, Date.now()).status !== 'REHEARSED') {
    return { ok: false, message: 'The move has not been rehearsed yet.' }
  }
  if (!confirmationName.trim()) {
    return { ok: false, message: 'The organisation name does not match.' }
  }
  const next: IMockRecord = {
    ...record,
    bookings: record.bookings + 1,
    bookedAt: Date.now(),
    scheduledFor: scheduledFor ?? iso(Date.now()),
  }
  save(next)
  return { ok: true, data: derive(next, Date.now()) }
}

export const mockCancelMigration = async (
  orgId: string,
): Promise<MigrationResult<IMigration>> => {
  await wait()
  const record = load(orgId)
  if (!record) {
    return notFound()
  }
  const current = derive(record, Date.now())
  if (!['CREATED', 'REHEARSED'].includes(current.status)) {
    return {
      ok: false,
      message: 'The move has already started and can no longer be cancelled.',
    }
  }
  const next = { ...record, cancelledAt: iso(Date.now()) }
  save(next)
  return { ok: true, data: derive(next, Date.now()) }
}

export const mockStepUpSignIn = async (
  password: string,
): Promise<MigrationResult<{ accessToken: string; sessionId?: string }>> => {
  await wait()
  if (!password) {
    return { ok: false, message: 'Password is required' }
  }
  return { ok: true, data: { accessToken: 'mock-step-up-token' } }
}

/** Demo only: forget the dummy move for an org. */
export const resetMockMigration = (orgId: string): void => {
  try {
    localStorage.removeItem(storageKey(orgId))
  } catch {
    // ignore
  }
}
