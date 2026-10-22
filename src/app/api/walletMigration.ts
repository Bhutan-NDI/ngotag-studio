import {
  IMigration,
  IStartMovePayload,
  MigrationResult,
} from '@/features/walletMigration/types'
import { axiosDelete, axiosGet, axiosPost } from '@/services/apiRequests'
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

// Organisation wallet migration API (SAD-NGOTAG-WM-01 §3.2).
// The platform endpoints don't exist yet: every call uses dummy data unless
// NEXT_PUBLIC_WALLET_MIGRATION_MOCK=false. The real calls below follow the
// planned routes and only need the response shape confirmed.

type ApiError = Error & { statusCode?: number; code?: string }

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
      code: err?.code ?? (err?.statusCode === 404 ? 'NOT_FOUND' : undefined),
    }
  }
}

export const getMigration = async (
  orgId: string,
): Promise<MigrationResult<IMigration | null>> => {
  if (MOCK_MIGRATION_API) {
    return mockGetMigration(orgId)
  }
  const result = await call<IMigration>(() =>
    axiosGet({
      url: migrationUrl(orgId, apiRoutes.walletMigration.status),
      config: getHeaderConfigs(),
    }),
  )
  // No move yet is a normal state, not an error.
  if (!result.ok && result.code === 'NOT_FOUND') {
    return { ok: true, data: null }
  }
  return result
}

export const startMigration = async (
  orgId: string,
  payload: IStartMovePayload,
  stepUpToken: string,
): Promise<MigrationResult<IMigration>> => {
  if (MOCK_MIGRATION_API) {
    return mockStartMigration(orgId, payload)
  }
  return call<IMigration>(() =>
    axiosPost({
      url: migrationUrl(orgId),
      payload: { ...payload, stepUpToken },
      config: getHeaderConfigs(),
    }),
  )
}

export const rerunPreflight = async (
  orgId: string,
): Promise<MigrationResult<IMigration>> => {
  if (MOCK_MIGRATION_API) {
    return mockRerunPreflight(orgId)
  }
  return call<IMigration>(() =>
    axiosPost({
      url: migrationUrl(orgId, apiRoutes.walletMigration.preflight),
      config: getHeaderConfigs(),
    }),
  )
}

export const runRehearsal = async (
  orgId: string,
): Promise<MigrationResult<IMigration>> => {
  if (MOCK_MIGRATION_API) {
    return mockRunRehearsal(orgId)
  }
  return call<IMigration>(() =>
    axiosPost({
      url: migrationUrl(orgId, apiRoutes.walletMigration.rehearsal),
      config: getHeaderConfigs(),
    }),
  )
}

export const scheduleMigration = async (
  orgId: string,
  scheduledFor: string,
): Promise<MigrationResult<IMigration>> => {
  if (MOCK_MIGRATION_API) {
    return mockScheduleMigration(orgId, scheduledFor)
  }
  return call<IMigration>(() =>
    axiosPost({
      url: migrationUrl(orgId, apiRoutes.walletMigration.schedule),
      payload: { scheduledFor },
      config: getHeaderConfigs(),
    }),
  )
}

export const cancelMigration = async (
  orgId: string,
): Promise<MigrationResult<null>> => {
  if (MOCK_MIGRATION_API) {
    return mockCancelMigration(orgId)
  }
  return call<null>(() =>
    axiosDelete({
      url: migrationUrl(orgId),
      config: getHeaderConfigs(),
    }),
  )
}

/**
 * Step-up sign-in before "Start move" (UXD-06, SAD §7.2). Verifies the owner's
 * password again and returns a short-lived token; it does not replace the
 * NextAuth session.
 */
export const stepUpSignIn = async (
  email: string,
  password: string,
): Promise<MigrationResult<{ token: string }>> => {
  if (MOCK_MIGRATION_API) {
    return mockStepUpSignIn(password)
  }
  const encrypted = await passwordValueEncryption(password)
  return call<{ token: string }>(() =>
    axiosPost({
      url: apiRoutes.walletMigration.stepUp,
      payload: { email, password: encrypted },
      config: getHeaderConfigs(),
    }),
  )
}
