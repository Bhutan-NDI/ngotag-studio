import { selectSelectedOrgRoles, setIsPlatformAdmin } from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useEffect, useState } from 'react'

import { AxiosResponse } from 'axios'
import { PlatformRoles } from '@/features/common/enum'
import { getUserProfile } from '@/app/api/Auth'
import { usePathname } from 'next/navigation'

// Mirrors the backend's Keycloak client-role check (assertRole in mobile-verifier): these
// roles are granted explicitly, owner/admin alone do not imply them.
export const MOBILE_VERIFIER_ROLES = {
  PROOF_TEMPLATE: 'ALLOW_PROOF_TEMPLATE',
  VERIFIER: 'ALLOW_VERIFIER',
} as const

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

const MOBILE_VERIFIER_ONLY_ROLES: string[] = [
  'member',
  'admin',
  ...Object.values(MOBILE_VERIFIER_ROLES),
]

/**
 * A user who was given Manage Mobile Verifier with only Admin or Member in
 * this organisation (Create Proof Templates may come with it). They see just
 * the mobile verifier and their organisations. Without Manage Mobile
 * Verifier, or with any other role (owner, issuer, verifier), Studio works as
 * usual.
 */
export const isMobileVerifierOnly = (roles: string[]): boolean =>
  roles.includes(MOBILE_VERIFIER_ROLES.VERIFIER) &&
  roles.every((role) => MOBILE_VERIFIER_ONLY_ROLES.includes(role))

/**
 * A mobile verifier admin (with Admin) can also create organisations and
 * manage users; a mobile verifier member (with Member) can't.
 */
export const isMobileVerifierAdmin = (roles: string[]): boolean =>
  isMobileVerifierOnly(roles) && roles.includes('admin')

export const isMobileVerifierMember = (roles: string[]): boolean =>
  isMobileVerifierOnly(roles) && !roles.includes('admin')

/** For the selected organisation: roles are per organisation. */
export const useIsMobileVerifierOnly = (): boolean =>
  isMobileVerifierOnly(useSelectedOrgRoles())

export const useIsMobileVerifierAdmin = (): boolean =>
  isMobileVerifierAdmin(useSelectedOrgRoles())

/** Everyone but a mobile verifier member can create organisations. */
export const useCanCreateOrganization = (): boolean =>
  !isMobileVerifierMember(useSelectedOrgRoles())

// Pages a mobile-verifier-only user can open. /organizations is matched
// exactly so its sub-pages (billing) stay closed; the rest include sub-pages.
const ORGANIZATIONS_PATH = '/organizations'
const MOBILE_VERIFIER_ONLY_PREFIXES = [
  '/mobile-verifier',
  '/invitations',
  '/developers-setting',
  '/profile',
]
// /create-organization also holds an organisation's Edit settings (?orgId=).
const MOBILE_VERIFIER_ADMIN_PREFIXES = ['/users', '/create-organization']

export const isMobileVerifierOnlyPath = (
  pathname: string,
  isAdmin = false,
): boolean => {
  const prefixes = isAdmin
    ? [...MOBILE_VERIFIER_ONLY_PREFIXES, ...MOBILE_VERIFIER_ADMIN_PREFIXES]
    : MOBILE_VERIFIER_ONLY_PREFIXES
  return (
    pathname === ORGANIZATIONS_PATH ||
    prefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  )
}

/** Where a mobile-verifier-only user lands: the first page they can manage. */
export const mobileVerifierHome = (roles: string[]): string => {
  if (roles.includes(MOBILE_VERIFIER_ROLES.PROOF_TEMPLATE)) {
    return '/mobile-verifier/proof-templates'
  }
  return '/mobile-verifier/verifier-users'
}
