'use client'

import { useEffect, useState } from 'react'

import { isWalletMigrationEnabled } from './config'
import { listMigrations } from '@/app/api/walletMigration'
import { useAppSelector } from '@/lib/hooks'

// One question per signed-in session and page load, shared by every caller.
let lookup: { token: string; result: Promise<boolean> } | null = null

/**
 * Whether the user may open the Wallet moves page: only platform admins can
 * list moves across organisations, and the platform is what decides that.
 * False until the answer comes back, and whenever the feature is off.
 */
export const useCanSeeAllMigrations = (): boolean => {
  const token = useAppSelector((state) => state.auth.token)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!isWalletMigrationEnabled || !token) {
      setAllowed(false)
      return undefined
    }
    if (lookup?.token !== token) {
      lookup = {
        token,
        result: listMigrations({ pageSize: 1 }).then((result) => result.ok),
      }
    }
    let cancelled = false
    lookup.result.then((ok) => {
      if (!cancelled) {
        setAllowed(ok)
      }
    })
    return () => {
      cancelled = true
    }
  }, [token])

  return allowed
}
