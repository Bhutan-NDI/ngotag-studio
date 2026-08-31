'use client'
/* eslint-disable sort-imports */

import { Icon } from '@/components/ngotag/ui/icons'
import AppLauncher from '@/components/AppLauncher'
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle'
import { OrgSwitcher } from '@/components/org-switcher'
import { SidebarContext, SidebarContextProps } from '@/components/ui/sidebar'
import { UserNav } from '@/components/layout/user-nav'
import { Organisation } from '@/features/dashboard/type/organization'
import { currentPageNumber, itemPerPage } from '@/config/CommonConstant'
import { getOrganizations } from '@/app/api/organization'
import {
  setOrgId,
  setOrgInfo,
  setSelectedOrgId,
  setTenantData,
} from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import React, { useEffect, useState } from 'react'
import { Lockup } from './Lockup'

const enableAppLauncher = process.env.NEXT_PUBLIC_ENABLE_APP_LAUNCHER === 'true'

// OrgSwitcher's markup is built from Sidebar* primitives (SidebarMenuButton
// calls useSidebar() internally), because it's normally rendered inside the
// real desktop sidebar's <SidebarProvider>. The ngotag top bar has no
// sidebar, so it isn't wrapped in one — mounting a real SidebarProvider here
// instead would add a min-h-svh wrapper div (breaks the bar's layout), a
// sidebar_state cookie write, and a Ctrl/Cmd+B keyboard listener, none of
// which apply to this chrome. This static context value only exists to
// satisfy useSidebar()'s "must be inside a provider" check — the values
// themselves are never read for anything but tooltip visibility, which
// OrgSwitcher's SidebarMenuButton usage here doesn't use.
/* eslint-disable no-empty-function -- inert stub, see comment above */
const STATIC_SIDEBAR_CONTEXT: SidebarContextProps = {
  state: 'expanded',
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: false,
  toggleSidebar: () => {},
}
/* eslint-enable no-empty-function */

interface NgotagTopBarProps {
  navOpen: boolean
  onToggleNav: () => void
}

/**
 * The fixed signed-in bar, restyled to the ngotag glass chrome. The
 * organization list fetch + default-tenant dispatch is ported verbatim from
 * the shared Header (src/components/layout/header.tsx) — the org switcher,
 * user menu and theme toggle underneath are this app's real widgets
 * (OrgSwitcher, UserNav, ModeToggle), embedded as-is rather than
 * reimplemented, since they carry real role-fetching and sign-out logic.
 */
export function NgotagTopBar({
  navOpen,
  onToggleNav,
}: NgotagTopBarProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const [orgList, setOrgList] = useState<Organisation[]>([])
  const tenantId = useAppSelector((state) => state.organization.orgId)

  useEffect(() => {
    const fetchOrganizations = async (): Promise<void> => {
      try {
        const response = await getOrganizations(currentPageNumber, itemPerPage)
        if (
          typeof response !== 'string' &&
          response?.data?.data?.organizations
        ) {
          const orgs = response.data.data.organizations
          setOrgList(orgs)

          if (orgs.length > 0) {
            const defaultOrg =
              orgs.find((org: { id: string }) => org.id === tenantId) || orgs[0]

            dispatch(setOrgId(defaultOrg.id))
            dispatch(setSelectedOrgId(defaultOrg.id))
            dispatch(
              setTenantData({
                id: defaultOrg.id,
                name: defaultOrg.name,
                logoUrl: defaultOrg.logoUrl,
              }),
            )
            dispatch(
              setOrgInfo({
                id: defaultOrg.id,
                name: defaultOrg.name,
                description: defaultOrg.description,
                logoUrl: defaultOrg.logoUrl,
                appLaunchDetails: defaultOrg.appLaunchDetails,
                roles:
                  defaultOrg.userOrgRoles?.map(
                    (role: { orgRole: { name: string } }) =>
                      role?.orgRole?.name,
                  ) || [],
              }),
            )
          }
        } else {
          setOrgList([])
        }
      } catch (err) {
        console.error('Error fetching organizations:', err)
      }
    }

    fetchOrganizations()
  }, [dispatch, tenantId])

  return (
    <header className="fixed inset-x-0 top-0 z-[60] h-16 bg-[var(--ngotag-chrome-fill)] backdrop-blur-[20px] backdrop-saturate-[140%]">
      <div className="border-ngotag-subtle pointer-events-none absolute inset-x-0 bottom-0 h-px border-t min-[901px]:left-[248px]" />
      <div className="border-ngotag-subtle pointer-events-none absolute inset-y-0 left-[247px] hidden w-px border-l min-[901px]:block" />

      <div className="flex h-full items-center gap-3 px-4 min-[641px]:px-6">
        <button
          type="button"
          onClick={onToggleNav}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={navOpen}
          className="ndi-navrow inline-flex h-10 w-10 flex-none items-center justify-center rounded-[10px] min-[901px]:hidden"
          data-active="0"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path
              d={
                navOpen ? 'M18 6 6 18 M6 6l12 12' : 'M4 6h16 M4 12h16 M4 18h16'
              }
            />
          </svg>
        </button>

        <Lockup className="flex-none" />

        <div className="ml-auto flex items-center gap-2">
          <SidebarContext.Provider value={STATIC_SIDEBAR_CONTEXT}>
            <OrgSwitcher
              tenants={orgList.map((org) => ({
                id: org.id,
                name: org.name,
                logoUrl: org.logoUrl,
              }))}
              defaultTenant={orgList.length > 0 ? orgList[0] : undefined}
            />
          </SidebarContext.Provider>

          {enableAppLauncher && <AppLauncher />}

          <button
            type="button"
            aria-label="Notifications"
            className="ndi-navrow inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
            data-active="0"
          >
            <Icon name="bell" size={17} strokeWidth={1.7} />
          </button>

          <ModeToggle />

          <UserNav />
        </div>
      </div>
    </header>
  )
}
