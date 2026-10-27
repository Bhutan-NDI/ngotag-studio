import {
  IMigration,
  IMigrationWithPreflight,
  IStartMovePayload,
  MigrationResult,
} from '@/features/walletMigration/types'
import { axiosGet, axiosPost } from '@/services/apiRequests'
import {
  mockCancelMigration,
  mockGetMigration,
  mockRerunPreflight,
  mockRunRehearsal,
  mockScheduleMigration,
  mockStartMigration,
  mockStepUpSignIn,
} from '@/features/walletMigration/mockMigrationApi'

import { AxiosResponse } from 'axios'
import { MOCK_MIGRATION_API } from '@/features/walletMigration/config'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'
import { passwordValueEncryption } from '@/utils/passwordEncryption'

// Organisation wallet migration API (platform org-migration gateway routes).
// Every call uses dummy data unless NEXT_PUBLIC_WALLET_MIGRATION_MOCK=false.

type ApiError = Error & {
  statusCode?: number
  code?: string
  errorCode?: string
}

// Platform domain codes are upper snake case, sometimes with a ":" suffix
// (VERIFICATION_FAILED:RELAY_PROBE). Nest's generic `error` ("Bad Request")
// is not a code.
const CODE_PATTERN = /^[A-Z][A-Z0-9_]*(:[A-Z0-9_]+)?$/
const asCode = (value?: string): string | undefined => {
  if (value && CODE_PATTERN.test(value)) {
    return value
  }
  return undefined
}

const migrationUrl = (orgId: string, path = ''): string =>
  `${apiRoutes.organizations.root}/${orgId}${apiRoutes.walletMigration.root}${path}`

const call = async <T>(
  request: () => Promise<AxiosResponse>,
): Promise<MigrationResult<T>> => {
  try {
    const response = await request()
    return { ok: true, data: response?.data?.data as T }
  } catch (error) {
    const err = error as ApiError
    return {
      ok: false,
      message: err?.message,
      code: asCode(err?.code) ?? asCode(err?.errorCode),
      statusCode: err?.statusCode,
    }
  }
}

/**
 * The active move, or the latest finished one; null when the org never moved.
 * Older platforms answer "never moved" with a 404 instead of null.
 */
export const getMigration = async (
  orgId: string,
): Promise<MigrationResult<IMigration | null>> => {
  if (MOCK_MIGRATION_API) {
    return mockGetMigration(orgId)
  }
  const result = await call<IMigration | null>(() =>
    axiosGet({ url: migrationUrl(orgId), config: getHeaderConfigs() }),
  )
  if (!result.ok && result.statusCode === 404) {
    return { ok: true, data: null }
  }
  return result
}

export interface IStepUpSession {
  accessToken: string
  sessionId?: string
}

/**
 * Step-up sign-in (UXD-06, SAD §7.2). Creating a move needs a session signed
 * in within the last five minutes, so this signs in again with email and
 * password and returns that new session's token for the create call only.
 */
export const stepUpSignIn = async (
  email: string,
  password: string,
): Promise<MigrationResult<IStepUpSession>> => {
  if (MOCK_MIGRATION_API) {
    return mockStepUpSignIn(password)
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.sinIn}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: await passwordValueEncryption(password),
          isPasskey: false,
        }),
      },
    )
    const body = await res.json().catch(() => ({}))
    const accessToken = body?.data?.access_token
    if (!res.ok || !accessToken) {
      return {
        ok: false,
        message: body?.message || 'Sign in failed. Please try again.',
      }
    }
    return {
      ok: true,
      data: { accessToken, sessionId: body?.data?.sessionId },
    }
  } catch {
    return {
      ok: false,
      message: 'Unable to connect to the server. Please try again.',
    }
  }
}

/** Sign the extra step-up session out again, so it doesn't linger. Best effort. */
export const endStepUpSession = async (
  session: IStepUpSession,
): Promise<void> => {
  if (MOCK_MIGRATION_API || !session.sessionId) {
    return
  }
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.signOut}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({ sessions: [session.sessionId] }),
  }).catch(() => undefined)
}

/**
 * Create the move and run the first checks. Sent with the step-up session's
 * token: the platform's StepUpAuthGuard checks how recently that session
 * signed in. The API key travels in this body only.
 */
export const startMigration = async (
  orgId: string,
  payload: IStartMovePayload,
  session: IStepUpSession,
): Promise<MigrationResult<IMigrationWithPreflight>> => {
  if (MOCK_MIGRATION_API) {
    return mockStartMigration(orgId, payload)
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${migrationUrl(orgId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    )
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        message: body?.message || 'The move could not be started.',
        code: asCode(body?.code) ?? asCode(body?.error),
      }
    }
    return { ok: true, data: body?.data as IMigrationWithPreflight }
  } catch {
    return {
      ok: false,
      message: 'Unable to connect to the server. Please try again.',
    }
  } finally {
    await endStepUpSession(session)
  }
}

/** Run every check again. The API key is only needed to replace the kept token. */
export const rerunPreflight = async (
  orgId: string,
  body: { apiKey?: string; backupsConfirmed?: boolean } = {},
): Promise<MigrationResult<IMigrationWithPreflight>> => {
  if (MOCK_MIGRATION_API) {
    return mockRerunPreflight(orgId, body)
  }
  return call<IMigrationWithPreflight>(() =>
    axiosPost({
      url: migrationUrl(orgId, apiRoutes.walletMigration.preflight),
      payload: body,
      config: getHeaderConfigs(),
    }),
  )
}

/** Starts the rehearsal in the background; poll the move for the result. */
export const runRehearsal = async (
  orgId: string,
): Promise<MigrationResult<IMigration>> => {
  if (MOCK_MIGRATION_API) {
    return mockRunRehearsal(orgId)
  }
  return call<IMigration>(() =>
    axiosPost({
      url: migrationUrl(orgId, apiRoutes.walletMigration.rehearse),
      config: getHeaderConfigs(),
    }),
  )
}

/**
 * Confirm the move with the typed org name and book its slot (within 14
 * days). Without a slot the move starts at once. Confirming again before the
 * slot moves it.
 */
export const scheduleMigration = async (
  orgId: string,
  confirmationName: string,
  scheduledFor?: string,
): Promise<MigrationResult<IMigration>> => {
  if (MOCK_MIGRATION_API) {
    return mockScheduleMigration(orgId, confirmationName, scheduledFor)
  }
  return call<IMigration>(() =>
    axiosPost({
      url: migrationUrl(orgId, apiRoutes.walletMigration.start),
      payload: { confirmationName, ...(scheduledFor ? { scheduledFor } : {}) },
      config: getHeaderConfigs(),
    }),
  )
}

/** Call the move off before it starts. It ends as FAILED / CANCELLED_BY_OWNER. */
export const cancelMigration = async (
  orgId: string,
): Promise<MigrationResult<IMigration>> => {
  if (MOCK_MIGRATION_API) {
    return mockCancelMigration(orgId)
  }
  return call<IMigration>(() =>
    axiosPost({
      url: migrationUrl(orgId, apiRoutes.walletMigration.cancel),
      config: getHeaderConfigs(),
    }),
  )
}
