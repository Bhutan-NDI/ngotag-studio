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
//   cleanup-fail   first rehearsal stops because a leftover export can't be
//                  deleted (EXPORT_CLEANUP_FAILED)
//   slot-missed    first booked slot is missed (back to REHEARSED, SLOT_MISSED)
//   rehearsal-stale  the rehearsal is too old at the first slot (back to
//                  REHEARSED, REHEARSAL_STALE); rehearse again to rebook
//   final-checks-fail  final checks fail at the first slot, are retried, then
//                  the booking is taken back (PREFLIGHT_FAILED:AGENT_REACHABLE)
//   checks-unavailable  as above, but the final checks can't run
//                  (PREFLIGHT_FAILED:CHECKS_UNAVAILABLE)
//   cutover-stuck  a step after the switch keeps failing for a while
//                  (CUTOVER + COMPLETION_STEP_FAILED:RELAY_FORWARD), past the
//                  freeze deadline, then the move finishes
//   verify-fail    move day fails at VERIFYING (VERIFICATION_FAILED:RELAY_PROBE)
//   slow           move day fails with FREEZE_BUDGET_EXCEEDED during import
//   disaster       ends in DISASTER_RESTORED during the first 48 hours
// A re-run of the checks or rehearsal, or a new booking, then succeeds.
//
// Statuses follow the platform: REHEARSED → SCHEDULED → FROZEN …, an owner's
// cancel ends as CANCELLED, an automatic abort as FAILED.

import {
  IMigration,
  IMigrationWithPreflight,
  IPreflightReport,
  IStartMovePayload,
  MigrationResult,
  MigrationStatus,
} from './types'
import { finalChecksReport, runPreflight } from './mockPreflight'

const REHEARSAL_MS = 6_000
const START_DELAY_MS = 8_000
const STEP_MS = 4_000
const STABILISE_MS = 30_000
const WEBHOOK_CONFIRM_MS = 6_000
const ROTATE_MS = 30_000
const LATENCY_MS = 400
// How long the final checks are retried before the booking is taken back.
const FINAL_RETRY_MS = 8_000
// How long a step after the switch keeps failing in the cutover-stuck demo.
const STUCK_MS = 16_000
const TOTAL_CONNECTIONS = 1240

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
  /** When the last finished rehearsal ended, while a new one runs. */
  previousRehearsalAt?: string | null
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

const blank = (record: IMockRecord): IMigration => ({
  id: record.id,
  createDateTime: record.createDateTime,
  lastChangedDateTime: iso(Date.now()),
  orgId: record.orgId,
  status: 'CREATED',
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
  error,
})

const at = (m: IMigration, status: MigrationStatus): IMigration => ({
  ...m,
  status,
})

const DAY_MS = 86_400_000
const REHEARSAL_MAX_AGE_MS = 14 * DAY_MS

const rehearsedResults = (finishedAt: string): Partial<IMigration> => ({
  status: 'REHEARSED',
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
    finishedAt,
  },
})

const newest = (
  a: IPreflightReport | null,
  b: IPreflightReport,
): IPreflightReport => (a && a.ranAt > b.ranAt ? a : b)

const derive = (record: IMockRecord, now: number): IMigration => {
  let m = blank(record)

  // Rehearsal
  if (record.rehearsalStartedAt !== null) {
    m.rehearsalStartedAt = iso(record.rehearsalStartedAt)
    const done = now - record.rehearsalStartedAt >= REHEARSAL_MS
    const firstRun = record.rehearsalRuns === 1
    if (!done) {
      // A re-run keeps the move REHEARSED with the last results until it ends.
      if (record.previousRehearsalAt) {
        m = { ...m, ...rehearsedResults(record.previousRehearsalAt) }
      }
      m.rehearsalStatus = 'RUNNING'
    } else if (firstRun && trigger(record, 'rehearsal-fail')) {
      m.rehearsalStatus = 'FAILED'
      m.rehearsal = { step: 'EXPORT', code: 'JOB_FAILED', finishedAt: iso(now) }
    } else if (firstRun && trigger(record, 'cleanup-fail')) {
      m.rehearsalStatus = 'FAILED'
      m.rehearsal = {
        step: 'EXPORT',
        code: 'EXPORT_CLEANUP_FAILED',
        exportCleanup: 'FAILED',
        finishedAt: iso(now),
      }
    } else {
      m = {
        ...m,
        ...rehearsedResults(iso(record.rehearsalStartedAt + REHEARSAL_MS)),
      }
    }
  }

  if (record.cancelledAt) {
    // The owner's cancel: CANCELLED, with no error of its own (#118).
    return at(m, 'CANCELLED')
  }
  if (m.status !== 'REHEARSED' || record.bookedAt === null) {
    return m
  }

  // Booked: move day starts START_DELAY_MS after booking, whatever slot was
  // picked, so the demo doesn't wait for the real date.
  m = { ...at(m, 'SCHEDULED'), scheduledFor: record.scheduledFor }
  const sinceBooking = now - record.bookedAt
  if (sinceBooking < START_DELAY_MS) {
    return m
  }
  const firstMove = record.bookings === 1
  // The scheduler takes the booking back (#128): REHEARSED, slot cleared,
  // reason in `error` until the owner books again.
  const putBack = (error: string): IMigration => ({
    ...at(m, 'REHEARSED'),
    scheduledFor: null,
    error,
  })
  if (firstMove && trigger(record, 'slot-missed')) {
    return putBack('SLOT_MISSED')
  }
  // The first rehearsal has aged past the limit by the slot (the demo ages it
  // rather than waiting 14 days). Rehearsing again gives fresh results.
  if (firstMove && trigger(record, 'rehearsal-stale')) {
    if (record.rehearsalRuns > 1) {
      return putBack('REHEARSAL_STALE')
    }
    const aged = iso(record.bookedAt - REHEARSAL_MAX_AGE_MS - DAY_MS)
    return {
      ...putBack('REHEARSAL_STALE'),
      rehearsal: { ...m.rehearsal, finishedAt: aged },
    }
  }
  // Final checks at the slot (platform #128): retried for a while, then the
  // booking is taken back. A later re-run by the owner replaces the report.
  if (firstMove && trigger(record, 'final-checks-fail')) {
    const finalChecks = finalChecksReport(
      iso(record.bookedAt + START_DELAY_MS),
      record.backupsConfirmed,
    )
    m.preflight = newest(record.preflight, finalChecks)
    return sinceBooking < START_DELAY_MS + FINAL_RETRY_MS
      ? m
      : putBack('PREFLIGHT_FAILED:AGENT_REACHABLE')
  }
  if (firstMove && trigger(record, 'checks-unavailable')) {
    return sinceBooking < START_DELAY_MS + FINAL_RETRY_MS
      ? m
      : putBack('PREFLIGHT_FAILED:CHECKS_UNAVAILABLE')
  }

  const frozenAt = record.bookedAt + START_DELAY_MS
  const stuck = firstMove && trigger(record, 'cutover-stuck')
  // The stuck demo runs past its deadline, which no longer applies after the
  // switch (platform #131).
  const freezeBudgetMs = stuck ? 5 * STEP_MS : 30 * 60_000
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
  if (firstMove && trigger(record, 'slow') && step >= 2) {
    return failed(m, 'FREEZE_BUDGET_EXCEEDED')
  }
  if (firstMove && trigger(record, 'verify-fail') && step >= 3) {
    return failed(m, 'VERIFICATION_FAILED:RELAY_PROBE')
  }
  if (step < steps.length) {
    return at(m, steps[step])
  }
  const cutoverIndex = steps.length - 1
  const stepsMs = steps.length * STEP_MS
  const cutoverEnds = stepsMs + STUCK_MS
  if (stuck && moveT < cutoverEnds) {
    return {
      ...at(m, steps[cutoverIndex]),
      error: 'COMPLETION_STEP_FAILED:RELAY_FORWARD',
    }
  }

  // After the switch (the platform clears the error on the way out)
  const moveDayMs = stepsMs + (stuck ? STUCK_MS : 0)
  const switchedAt = frozenAt + moveDayMs
  const afterSwitch = now - switchedAt
  m.stabilisationEndsAt = iso(switchedAt + STABILISE_MS)
  if (afterSwitch >= WEBHOOK_CONFIRM_MS) {
    m.webhookConfirmedAt = iso(switchedAt + WEBHOOK_CONFIRM_MS)
  }
  if (afterSwitch < STABILISE_MS) {
    if (trigger(record, 'disaster') && afterSwitch >= STABILISE_MS / 2) {
      return at(m, 'DISASTER_RESTORED')
    }
    // Show "48 hours" counting down on the compressed clock.
    const left = (STABILISE_MS - afterSwitch) / STABILISE_MS
    const leftMs = left * 48 * 3_600_000
    return {
      ...at(m, 'STABILISING'),
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
    return { ...at(m, 'ROTATING'), rotation }
  }
  return {
    ...at(m, 'COMPLETED'),
    rotation,
    completedAt: iso(switchedAt + STABILISE_MS + ROTATE_MS),
  }
}

const notFound = (): MigrationResult<never> => ({
  ok: false,
  message: 'No move found for this organisation.',
})

const isActive = (m: IMigration): boolean =>
  !['COMPLETED', 'FAILED', 'CANCELLED', 'DISASTER_RESTORED'].includes(m.status)

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
  // Like the platform: the checks can run again until the move starts.
  const current = record ? derive(record, Date.now()) : null
  if (
    !record ||
    !current ||
    !['CREATED', 'REHEARSED', 'SCHEDULED'].includes(current.status)
  ) {
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
  const current = record ? derive(record, Date.now()) : null
  if (!record || !current) {
    return notFound()
  }
  if (!['CREATED', 'REHEARSED'].includes(current.status)) {
    return { ok: false, message: 'The move can no longer be rehearsed.' }
  }
  if (!current.preflight?.passed) {
    return { ok: false, message: 'The move checks have not passed yet.' }
  }
  const next: IMockRecord = {
    ...record,
    rehearsalRuns: record.rehearsalRuns + 1,
    rehearsalStartedAt: Date.now(),
    previousRehearsalAt:
      current.rehearsalStatus === 'DONE'
        ? (current.rehearsal?.finishedAt ?? null)
        : null,
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
  const current = derive(record, Date.now())
  if (!['REHEARSED', 'SCHEDULED'].includes(current.status)) {
    return { ok: false, message: 'The move has not been rehearsed yet.' }
  }
  // Like the platform: the rehearsal must still be recent at the slot.
  const slot = scheduledFor ? Date.parse(scheduledFor) : Date.now()
  const finishedAt = current.rehearsal?.finishedAt
  if (!finishedAt || slot - Date.parse(finishedAt) > REHEARSAL_MAX_AGE_MS) {
    return {
      ok: false,
      message:
        'The rehearsal is too old to schedule a move from; run a new rehearsal first',
    }
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
  if (!['CREATED', 'REHEARSED', 'SCHEDULED'].includes(current.status)) {
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
