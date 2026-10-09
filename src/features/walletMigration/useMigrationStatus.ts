'use client'

import { IMigration, MigrationResult } from './types'
import {
  POLL_IDLE_MS,
  POLL_RUNNING_MS,
  RUNNING_STATUSES,
  isWalletMigrationEnabled,
} from './config'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Roles } from '@/common/enums'
import { getMigration } from '@/app/api/walletMigration'
import { setMigrationStatus } from '@/lib/walletMigrationSlice'

interface IMigrationStatusState {
  migration: IMigration | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  /** Apply the result of an action (start, schedule, …) without waiting for the next poll. */
  applyResult: (result: MigrationResult<IMigration | null>) => boolean
}

/**
 * Polls the current org's move status (P-04): every 5 s while a step is
 * running, every 60 s otherwise. The move runs on the server, so this only
 * reflects state and never drives it (UXD-04).
 */
export const useMigrationStatus = (
  orgId?: string | null,
): IMigrationStatusState => {
  const dispatch = useAppDispatch()
  const [migration, setMigration] = useState<IMigration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyResult = useCallback(
    (result: MigrationResult<IMigration | null>): boolean => {
      if (!result.ok) {
        setError(result.message || "Couldn't load move status.")
        return false
      }
      setError(null)
      setMigration(result.data)
      if (orgId) {
        dispatch(
          setMigrationStatus({ orgId, status: result.data?.status ?? null }),
        )
      }
      return true
    },
    [dispatch, orgId],
  )

  const refresh = useCallback(async (): Promise<void> => {
    if (!orgId || !isWalletMigrationEnabled) {
      setLoading(false)
      return
    }
    applyResult(await getMigration(orgId))
    setLoading(false)
  }, [orgId, applyResult])

  useEffect(() => {
    setLoading(true)
    setMigration(null)
    refresh()
  }, [orgId])

  useEffect(() => {
    if (!orgId || !isWalletMigrationEnabled) {
      return undefined
    }
    const running = migration && RUNNING_STATUSES.includes(migration.status)
    // Move-day and the compressed dummy timeline both change quickly after
    // scheduling, so poll fast from SCHEDULED onwards until the move settles.
    const fast =
      running ||
      migration?.status === 'SCHEDULED' ||
      migration?.status === 'STABILISING' ||
      migration?.status === 'ROTATING'
    timer.current = setTimeout(refresh, fast ? POLL_RUNNING_MS : POLL_IDLE_MS)
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [migration, orgId, refresh])

  return { migration, loading, error, refresh, applyResult }
}

/** Owner-only actions (spec SCR-WM-01): ADMIN must not get them. */
export const useIsOrgOwner = (): boolean => {
  const roles = useAppSelector(
    (state) => state.organization.orgInfo?.roles || [],
  )
  return roles.includes(Roles.OWNER)
}
