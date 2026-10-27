'use client'

import { IMigration, MigrationResult, MigrationStatus } from './types'
import {
  POLL_IDLE_MS,
  POLL_RUNNING_MS,
  RUNNING_STATUSES,
  isWalletMigrationEnabled,
} from './config'
import {
  resetMigration,
  setMigration,
  setMigrationError,
} from '@/lib/walletMigrationSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useCallback, useEffect, useRef } from 'react'

import type { AppDispatch } from '@/lib/store'
import { Roles } from '@/common/enums'
import { getMigration } from '@/app/api/walletMigration'

/** Fetch the org's move once and store the result. */
export const loadMigration = async (
  dispatch: AppDispatch,
  orgId: string,
): Promise<boolean> => {
  const result = await getMigration(orgId)
  if (result.ok) {
    dispatch(setMigration({ orgId, migration: result.data }))
  } else {
    dispatch(
      setMigrationError({
        orgId,
        error: result.message || "Couldn't load move status.",
      }),
    )
  }
  return result.ok
}

// Move day and the compressed dummy timeline change quickly from SCHEDULED
// until the move settles, so poll fast for those too.
const needsFastPolling = (status: MigrationStatus | null): boolean =>
  status !== null &&
  (RUNNING_STATUSES.includes(status) ||
    status === 'SCHEDULED' ||
    status === 'STABILISING' ||
    status === 'ROTATING')

/**
 * The one status poller (P-04), mounted once in the page layout: every 5 s
 * while a step is running, every 60 s otherwise. The next check is always
 * scheduled, whatever the last one returned, so a failed request (e.g. while
 * offline) never stops polling. The move runs on the server, so this only
 * reflects state and never drives it (UXD-04).
 */
export const useMigrationPoller = (orgId?: string | null): void => {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => {
    const { walletMigration } = state
    return walletMigration.orgId === orgId ? walletMigration.status : null
  })
  const statusRef = useRef(status)
  statusRef.current = status

  useEffect(() => {
    if (!orgId || !isWalletMigrationEnabled) {
      return undefined
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined = undefined
    let lastFetch = 0

    dispatch(resetMigration(orgId))

    // Wakes every 5 s and only fetches when due, so a status change made by
    // an action (e.g. "Run rehearsal") switches to fast polling straight away.
    const tick = async (): Promise<void> => {
      try {
        const due =
          needsFastPolling(statusRef.current) ||
          Date.now() - lastFetch >= POLL_IDLE_MS
        if (due) {
          lastFetch = Date.now()
          await loadMigration(dispatch, orgId)
        }
      } catch (error) {
        console.error('Failed to load move status:', error)
      } finally {
        if (!cancelled) {
          timer = setTimeout(tick, POLL_RUNNING_MS)
        }
      }
    }
    tick()

    return () => {
      cancelled = true
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [orgId, dispatch])
}

interface IMigrationStatusState {
  migration: IMigration | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  /**
   * Store the result of an action (start, schedule, …) without waiting for
   * the next poll. Returns false when the action failed; the caller shows
   * the error.
   */
  applyResult: (result: MigrationResult<IMigration | null>) => boolean
}

/** Reads the move kept by useMigrationPoller; never starts its own polling. */
export const useMigrationStatus = (
  orgId?: string | null,
): IMigrationStatusState => {
  const dispatch = useAppDispatch()
  const state = useAppSelector((s) => s.walletMigration)
  const mine = Boolean(orgId) && state.orgId === orgId

  const refresh = useCallback(async (): Promise<void> => {
    if (orgId && isWalletMigrationEnabled) {
      await loadMigration(dispatch, orgId)
    }
  }, [dispatch, orgId])

  const applyResult = useCallback(
    (result: MigrationResult<IMigration | null>): boolean => {
      if (!result.ok || !orgId) {
        return false
      }
      dispatch(setMigration({ orgId, migration: result.data }))
      return true
    },
    [dispatch, orgId],
  )

  return {
    migration: mine ? state.migration : null,
    loading: !mine || !state.loaded,
    error: mine ? state.error : null,
    refresh,
    applyResult,
  }
}

/** Owner-only actions (spec SCR-WM-01): ADMIN must not get them. */
export const useIsOrgOwner = (): boolean => {
  const roles = useAppSelector(
    (state) => state.organization.orgInfo?.roles || [],
  )
  return roles.includes(Roles.OWNER)
}
