import {
  MOBILE_VERIFIER_ROLES,
  isMobileVerifierAdmin,
  isMobileVerifierMember,
  isMobileVerifierOnly,
  isMobileVerifierOnlyPath,
  mobileVerifierHome,
} from '@/lib/orgRoleRules'
import { selectSelectedOrgRoles, setIsPlatformAdmin } from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useEffect, useState } from 'react'

import { AxiosResponse } from 'axios'
import { PlatformRoles } from '@/features/common/enum'
import { getUserProfile } from '@/app/api/Auth'
import { usePathname } from 'next/navigation'

export {
  MOBILE_VERIFIER_ROLES,
  isMobileVerifierAdmin,
  isMobileVerifierMember,
  isMobileVerifierOnly,
  isMobileVerifierOnlyPath,
  mobileVerifierHome,
}

// One shared empty list, so the selector returns the same value while no
// organisation is loaded instead of a new [] on every store update.
const NO_ROLES: string[] = []

/**
 * The selected organisation's roles, with a platform admin's added. Empty
 * while they aren't known, for example just after switching organisation.
 */
export const useSelectedOrgRoles = (): string[] =>
  useAppSelector(selectSelectedOrgRoles) ?? NO_ROLES

export const useHasOrgRole = (role: string): boolean =>
  useSelectedOrgRoles().includes(role)

/**
 * null until the user's profile has been checked. A session saved before the
 * flag existed has no value at all, which also means not checked yet.
 */
export const useIsPlatformAdmin = (): boolean | null =>
  useAppSelector((state) => state.organization.isPlatformAdmin ?? null)

// The profile lookup in flight, so components asking at once share it.
let platformAdminLookup: {
  token: string
  result: Promise<boolean | null>
} | null = null
// The token whose answer this page load has already confirmed. A stored
// answer is used meanwhile, but checked again on every full load, so a
// removed platform_admin role doesn't linger until sign-out.
let confirmedToken: string | null = null

const lookUpPlatformAdmin = async (token: string): Promise<boolean | null> => {
  const response = await getUserProfile(token)
  if (typeof response === 'string') {
    return null
  }
  const { data } = response as AxiosResponse
  const userOrgRoles: { orgRole?: { name?: string } }[] =
    data?.data?.userOrgRoles ?? []
  return userOrgRoles.some(
    (role) => role.orgRole?.name === PlatformRoles.platformAdmin,
  )
}

/**
 * Finds out whether the user is a platform admin. platform_admin is on the
 * user's profile, not in the token or an organisation's roles. Returns null
 * while that is unknown. A failed lookup counts as not a platform admin on
 * the page where it failed, and is tried again on the next page.
 */
export const useSyncPlatformAdmin = (): boolean | null => {
  const dispatch = useAppDispatch()
  const pathname = usePathname() ?? ''
  const token = useAppSelector((state) => state.auth.token)
  const isPlatformAdmin = useIsPlatformAdmin()
  const [failedOn, setFailedOn] = useState<string | null>(null)

  useEffect(() => {
    if (!token || confirmedToken === token) {
      return undefined
    }
    let cancelled = false
    if (platformAdminLookup?.token !== token) {
      platformAdminLookup = {
        token,
        result: lookUpPlatformAdmin(token).catch(() => null),
      }
    }
    const lookup = platformAdminLookup
    lookup.result.then((found) => {
      if (platformAdminLookup === lookup) {
        platformAdminLookup = null
      }
      if (found !== null) {
        confirmedToken = token
        dispatch(setIsPlatformAdmin(found))
      } else if (!cancelled) {
        setFailedOn(pathname)
      }
    })
    return () => {
      cancelled = true
    }
  }, [dispatch, pathname, token])

  if (isPlatformAdmin === null && (!token || failedOn === pathname)) {
    return false
  }
  return isPlatformAdmin
}

/** For the selected organisation: roles are per organisation. */
export const useIsMobileVerifierOnly = (): boolean =>
  isMobileVerifierOnly(useSelectedOrgRoles())

export const useIsMobileVerifierAdmin = (): boolean =>
  isMobileVerifierAdmin(useSelectedOrgRoles())

/** Everyone but a mobile verifier member can create organisations. */
export const useCanCreateOrganization = (): boolean =>
  !isMobileVerifierMember(useSelectedOrgRoles())
