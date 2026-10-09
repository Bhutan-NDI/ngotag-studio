// Dummy data for the wallet migration screens until the platform API exists.
//
// A move is kept in localStorage per org (never the API key) and its status is
// derived from the time elapsed, on a compressed timeline: checks take seconds,
// move day ~25 s, the "first 48 hours" ~30 s and connection updates ~30 s.
//
// Demo triggers — put one of these words in the agent admin address:
//   not-pristine  first checks run fails with TARGET_NOT_PRISTINE
//   old-version   first checks run fails with STORAGE_VERSION_MISMATCH
//   unreachable   first checks run fails with AGENT_UNREACHABLE
//   rehearsal-fail first rehearsal fails with EXPORT_FAILED
//   verify-fail   first move day aborts at "Verify your new agent"
//   slow          first move day aborts with BUDGET_EXCEEDED
//   disaster      ends in DISASTER_RESTORED instead of COMPLETED
// A re-run or reschedule then succeeds, as if the owner fixed the problem.

import {
  IMigration,
  IPreflightCheck,
  IStartMovePayload,
  MigrationErrorCode,
  MigrationResult,
} from './types'
import { MOVE_DAY_STEPS } from './config'

const CHECK_MS = 1_200
const REHEARSAL_MS = 6_000
const START_DELAY_MS = 8_000
const STEP_MS = 3_000
const STABILISE_MS = 30_000
const ROTATE_MS = 30_000
const LATENCY_MS = 400

const EXPECTED_MINUTES = 20
const LIMIT_MINUTES = 30
const TOTAL_CONNECTIONS = 1240

const PREFLIGHT_CHECKS: { key: string; label: string }[] = [
  { key: 'reachable', label: 'Agent admin address reachable' },
  { key: 'public', label: 'Public DIDComm address reachable' },
  { key: 'version', label: 'Agent version' },
  { key: 'pristine', label: 'New agent wallet is empty' },
  { key: 'features', label: 'Organisation features supported' },
  { key: 'jobs', label: 'No bulk issuance running' },
]

const FAILING_CHECK: Record<
  string,
  { key: string; code: MigrationErrorCode; detail?: Record<string, string> }
> = {
  'not-pristine': { key: 'pristine', code: 'TARGET_NOT_PRISTINE' },
  'old-version': {
    key: 'version',
    code: 'STORAGE_VERSION_MISMATCH',
    detail: { found: '0.5.6', required: '0.6.1' },
  },
  unreachable: { key: 'reachable', code: 'AGENT_UNREACHABLE' },
}

type Stage = 'preflight' | 'rehearsal' | 'scheduled'

interface IMockRecord {
  id: string
  orgId: string
  adminUrl: string
  publicUrl: string
  createdAt: string
  stage: Stage
  stageStartedAt: number
  preflightRuns: number
  rehearsalRuns: number
  moveAttempts: number
  scheduledFor?: string
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
  record.adminUrl.toLowerCase().includes(word)

const preflightChecks = (
  record: IMockRecord,
  elapsed: number,
): IPreflightCheck[] => {
  const failing =
    record.preflightRuns === 1
      ? Object.entries(FAILING_CHECK).find(([word]) =>
          trigger(record, word),
        )?.[1]
      : undefined
  const failIndex = failing
    ? PREFLIGHT_CHECKS.findIndex((c) => c.key === failing.key)
    : -1

  return PREFLIGHT_CHECKS.map((check, i) => {
    const done = elapsed >= (i + 1) * CHECK_MS
    const running = !done && elapsed >= i * CHECK_MS
    if (failIndex !== -1 && i > failIndex) {
      return { ...check, state: 'waiting' }
    }
    if (i === failIndex && done) {
      return {
        ...check,
        state: 'failed',
        errorCode: failing?.code,
        detail: failing?.detail,
      }
    }
    return {
      ...check,
      state: done ? 'passed' : running ? 'running' : 'waiting',
    }
  })
}

const allPassed = (): IPreflightCheck[] =>
  PREFLIGHT_CHECKS.map((c) => ({ ...c, state: 'passed' }))

const derive = (record: IMockRecord, now: number): IMigration => {
  const base: IMigration = {
    id: record.id,
    orgId: record.orgId,
    adminUrl: record.adminUrl,
    publicUrl: record.publicUrl,
    createdAt: record.createdAt,
    status: 'PREFLIGHT_RUNNING',
    preflight: allPassed(),
  }
  const elapsed = now - record.stageStartedAt

  if (record.stage === 'preflight') {
    const preflight = preflightChecks(record, elapsed)
    const failed = preflight.find((c) => c.state === 'failed')
    const passed = preflight.every((c) => c.state === 'passed')
    return {
      ...base,
      preflight,
      status: failed
        ? 'PREFLIGHT_FAILED'
        : passed
          ? 'PREFLIGHT_PASSED'
          : 'PREFLIGHT_RUNNING',
      errorCode: failed?.errorCode,
    }
  }

  const rehearsal = {
    records: {
      connections: TOTAL_CONNECTIONS,
      credentials: 3518,
      proofs: 2210,
      dids: 3,
    },
    durationMinutes: 12,
    predictedPauseMinutes: 18,
    downloadMethod: 'direct' as const,
  }

  if (record.stage === 'rehearsal') {
    if (elapsed < REHEARSAL_MS) {
      return { ...base, status: 'REHEARSING' }
    }
    if (record.rehearsalRuns === 1 && trigger(record, 'rehearsal-fail')) {
      return {
        ...base,
        status: 'REHEARSAL_FAILED',
        errorCode: 'EXPORT_FAILED',
        referenceId: `WM-${record.id.slice(0, 8).toUpperCase()}`,
      }
    }
    return { ...base, status: 'REHEARSED', rehearsal }
  }

  // Scheduled: move day starts START_DELAY_MS after scheduling, whatever slot
  // was picked, so the demo doesn't have to wait for the real date.
  const scheduled = { ...base, rehearsal, scheduledFor: record.scheduledFor }
  if (elapsed < START_DELAY_MS) {
    return { ...scheduled, status: 'SCHEDULED' }
  }

  const moveT = elapsed - START_DELAY_MS
  const step = Math.min(MOVE_DAY_STEPS.length, Math.floor(moveT / STEP_MS))
  const elapsedMinutes = Math.round(
    (moveT / (STEP_MS * MOVE_DAY_STEPS.length)) * EXPECTED_MINUTES,
  )
  const moveDay = {
    currentStep: step,
    elapsedMinutes: Math.min(elapsedMinutes, EXPECTED_MINUTES),
    expectedMinutes: EXPECTED_MINUTES,
    limitMinutes: LIMIT_MINUTES,
  }

  const firstAttempt = record.moveAttempts === 1
  const failAt = firstAttempt
    ? trigger(record, 'verify-fail')
      ? { step: 4, code: 'VERIFICATION_FAILED' as const }
      : trigger(record, 'slow')
        ? { step: 3, code: 'BUDGET_EXCEEDED' as const }
        : null
    : null
  if (failAt && step >= failAt.step) {
    return {
      ...scheduled,
      status: 'FAILED',
      errorCode: failAt.code,
      referenceId: `WM-${record.id.slice(0, 8).toUpperCase()}`,
      moveDay: {
        ...moveDay,
        currentStep: failAt.step,
        elapsedMinutes:
          failAt.code === 'BUDGET_EXCEEDED'
            ? LIMIT_MINUTES
            : moveDay.elapsedMinutes,
        failedCheck:
          failAt.code === 'VERIFICATION_FAILED'
            ? 'webhook delivery'
            : undefined,
      },
    }
  }

  if (step < MOVE_DAY_STEPS.length) {
    return { ...scheduled, status: step < 5 ? 'FROZEN' : 'CUTOVER', moveDay }
  }

  const doneMoveDay = { ...moveDay, elapsedMinutes: 17 }
  const moveDayMs = STEP_MS * MOVE_DAY_STEPS.length
  const afterMove = moveT - moveDayMs
  if (afterMove < STABILISE_MS) {
    const remaining = (STABILISE_MS - afterMove) / STABILISE_MS
    const remainingMs = remaining * 48 * 3_600_000
    return {
      ...scheduled,
      status: 'STABILISING',
      moveDay: doneMoveDay,
      stabilisationEndsAt: new Date(now + remainingMs).toISOString(),
      healthChecks: [
        { key: 'issuing', label: 'Issuing works', ok: true },
        { key: 'verifying', label: 'Verifying works', ok: true },
        { key: 'webhooks', label: 'Webhooks arriving', ok: true },
        { key: 'forwarding', label: 'Message forwarding healthy', ok: true },
      ],
    }
  }

  const rotateT = afterMove - STABILISE_MS
  if (rotateT < ROTATE_MS) {
    const share = rotateT / ROTATE_MS
    const updated = Math.round(TOTAL_CONNECTIONS * 0.86 * share)
    const refused = Math.round(12 * share)
    const inactive = Math.round(41 * share)
    return {
      ...scheduled,
      status: 'ROTATING',
      moveDay: doneMoveDay,
      connections: {
        updated,
        refused,
        inactive,
        waiting: TOTAL_CONNECTIONS - updated - refused - inactive,
      },
    }
  }

  if (trigger(record, 'disaster')) {
    return { ...scheduled, status: 'DISASTER_RESTORED', moveDay: doneMoveDay }
  }

  const updated = TOTAL_CONNECTIONS - 12 - 41 - 0
  return {
    ...scheduled,
    status: 'COMPLETED',
    moveDay: doneMoveDay,
    completedAt: new Date(now).toISOString(),
    connections: { updated, waiting: 0, refused: 12, inactive: 41 },
    forwardedLast30Days: 87,
  }
}

const notFound = (): MigrationResult<never> => ({
  ok: false,
  message: 'No move found for this organisation.',
  code: 'NOT_FOUND',
})

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
): Promise<MigrationResult<IMigration>> => {
  await wait()
  if (load(orgId)) {
    return {
      ok: false,
      message: 'A move is already in progress.',
      code: 'MIGRATION_ALREADY_EXISTS',
    }
  }
  const record: IMockRecord = {
    id: crypto.randomUUID(),
    orgId,
    adminUrl: payload.adminUrl,
    publicUrl: payload.publicUrl,
    createdAt: new Date().toISOString(),
    stage: 'preflight',
    stageStartedAt: Date.now(),
    preflightRuns: 1,
    rehearsalRuns: 0,
    moveAttempts: 0,
  }
  save(record)
  return { ok: true, data: derive(record, Date.now()) }
}

const update = async (
  orgId: string,
  change: (record: IMockRecord) => IMockRecord,
): Promise<MigrationResult<IMigration>> => {
  await wait()
  const record = load(orgId)
  if (!record) {
    return notFound()
  }
  const next = change(record)
  save(next)
  return { ok: true, data: derive(next, Date.now()) }
}

export const mockRerunPreflight = (
  orgId: string,
): Promise<MigrationResult<IMigration>> =>
  update(orgId, (r) => ({
    ...r,
    stage: 'preflight',
    stageStartedAt: Date.now(),
    preflightRuns: r.preflightRuns + 1,
  }))

export const mockRunRehearsal = (
  orgId: string,
): Promise<MigrationResult<IMigration>> =>
  update(orgId, (r) => ({
    ...r,
    stage: 'rehearsal',
    stageStartedAt: Date.now(),
    rehearsalRuns: r.rehearsalRuns + 1,
  }))

export const mockScheduleMigration = (
  orgId: string,
  scheduledFor: string,
): Promise<MigrationResult<IMigration>> =>
  update(orgId, (r) => ({
    ...r,
    stage: 'scheduled',
    stageStartedAt: Date.now(),
    moveAttempts: r.moveAttempts + 1,
    scheduledFor,
  }))

export const mockCancelMigration = async (
  orgId: string,
): Promise<MigrationResult<null>> => {
  await wait()
  try {
    localStorage.removeItem(storageKey(orgId))
  } catch {
    // ignore
  }
  return { ok: true, data: null }
}

export const mockStepUpSignIn = async (
  password: string,
): Promise<MigrationResult<{ token: string }>> => {
  await wait()
  if (!password) {
    return { ok: false, message: 'Password is required' }
  }
  return { ok: true, data: { token: 'mock-step-up-token' } }
}

/** Demo only: forget the dummy move for an org. */
export const resetMockMigration = (orgId: string): void => {
  try {
    localStorage.removeItem(storageKey(orgId))
  } catch {
    // ignore
  }
}
