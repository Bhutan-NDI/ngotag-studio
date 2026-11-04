'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { currentPageNumber, itemPerPage } from '@/config/CommonConstant'
import {
  isMobileVerifierAdmin,
  isMobileVerifierOnly,
  isMobileVerifierOnlyPath,
  mobileVerifierHome,
  useSyncPlatformAdmin,
} from '@/lib/useOrgRoleAccess'
import { usePathname, useRouter } from 'next/navigation'

import { getOrganizations } from '@/app/api/organization'
import { selectSelectedOrgRoles } from '@/lib/orgSlice'
import { useAppSelector } from '@/lib/hooks'

interface LookedUpRoles {
  orgId: string
  roles: string[]
}

/**
 * Keeps a mobile-verifier-only user (see isMobileVerifierOnly) on the pages
 * they can use. Hiding the menu items isn't enough: sign-in lands on
 * /dashboard, and a typed URL or a KBar shortcut reaches any page. Anywhere
 * else sends them to the mobile verifier, without showing the page first.
 *
 * The selected organisation's roles are stored with it on a switch, and come
 * with the organisation list after sign-in. On a first load the list may not
 * have arrived yet, so the page waits and the guard looks the roles up itself
 * rather than rendering a page it might have to take away.
 *
 * A platform admin is never restricted. Whether the user is one is looked up
 * here too, since every page passes through this guard.
 */
export function MobileVerifierRouteGuard({
  children,
}: Readonly<{ children: ReactNode }>): React.JSX.Element | null {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [lookedUp, setLookedUp] = useState<LookedUpRoles | null>(null)
  const isPlatformAdmin = useSyncPlatformAdmin()

  const storedRoles = useAppSelector(selectSelectedOrgRoles)
  const lookedUpRoles = lookedUp?.orgId === orgId ? lookedUp.roles : null
  const roles = storedRoles ?? lookedUpRoles

  useEffect(() => {
    if (storedRoles) {
      return undefined
    }
    let cancelled = false
    const lookUp = async (): Promise<string[]> => {
      try {
        const response = await getOrganizations(currentPageNumber, itemPerPage)
        if (typeof response === 'string') {
          return []
        }
        const orgs: {
          id: string
          userOrgRoles?: { orgRole: { name: string } }[]
        }[] = response?.data?.data?.organizations ?? []
        // With no organisation selected yet, the top bar selects the first.
        // One that isn't on this page isn't judged by another organisation's
        // roles: it counts as unrestricted until the top bar stores its own.
        const org = orgId ? orgs.find((item) => item.id === orgId) : orgs[0]
        return org?.userOrgRoles?.map((role) => role.orgRole.name) ?? []
      } catch {
        // Fail open: the platform still checks every request.
        return []
      }
    }
    lookUp().then((found) => {
      if (!cancelled) {
        setLookedUp({ orgId, roles: found })
      }
    })
    return () => {
      cancelled = true
    }
  }, [orgId, storedRoles])

  const restricted =
    roles !== null &&
    isMobileVerifierOnly(roles) &&
    !isMobileVerifierOnlyPath(pathname, isMobileVerifierAdmin(roles))
  // Only a page that would be taken away waits for the platform admin lookup.
  const blocked = restricted && isPlatformAdmin === false
  const home = roles ? mobileVerifierHome(roles) : ''

  useEffect(() => {
    if (blocked) {
      router.replace(home)
    }
  }, [blocked, home, router])

  if (roles === null || (restricted && !isPlatformAdmin)) {
    return null
  }
  return <>{children}</>
}
