'use client'
/* eslint-disable sort-imports */

import { Icon, type IconName } from '@/components/bhutanndi/ui/icons'
import { NavItem } from '../../../../types'
import { Organization } from '@/features/dashboard/type/organization'
import { currentPageNumber, itemPerPage } from '@/config/CommonConstant'
import { getOrganizations } from '@/app/api/organization'
import { navItems } from '@/constants/data'
import {
  resetOrgState,
  setOrgId,
  setOrgInfo,
  setSelectedOrgId,
  setTenantData,
} from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

/**
 * This app's real nav icon keys (see src/constants/data.ts / src/components/icons.tsx)
 * mapped onto the bhutanndi icon set. Anything unmapped falls back to `dashboard`
 * rather than throwing — a stricter map would break the sidebar the moment a
 * new nav item is added upstream without this file being touched.
 */
const ICON_MAP: Record<string, IconName> = {
  dashboard: 'dashboard',
  connections: 'connections',
  billing: 'creditCard',
  schemas: 'layers',
  users: 'users',
  userPen: 'issue',
  login: 'verify',
  world: 'ecosystems',
  mail: 'mail',
  key: 'key',
  fileText: 'fileText',
  organization: 'building',
}

function iconFor(name?: string): IconName {
  return (name && ICON_MAP[name]) || 'dashboard'
}

/**
 * Yours rather than the organization's — same rationale as the reference's
 * ACCOUNT block. Both routes are real pages in this app already.
 */
const ACCOUNT_LINKS: { label: string; href: string; icon: IconName }[] = [
  { label: 'Invitations', href: '/invitations', icon: 'mail' },
  { label: 'Developer settings', href: '/developers-setting', icon: 'key' },
]

interface BhutanndiSidebarProps {
  open?: boolean
  onClose?: () => void
}

/**
 * The signed-in nav rail, restyled to the bhutanndi glass/mint language. The
 * data underneath — nav items, the default-organization effect, the
 * ecosystem toggle — is ported verbatim from the shared AppSidebar
 * (src/components/layout/app-sidebar.tsx) rather than re-derived, since this
 * app's real org/ecosystem state lives behind those exact calls.
 */
export function BhutanndiSidebar({
  open = false,
  onClose,
}: BhutanndiSidebarProps): React.JSX.Element {
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  const [currentPage] = useState(currentPageNumber)
  const [pageSize] = useState(itemPerPage)
  const [searchTerm] = useState('')
  // Bhutanndi-only: the reference places "Organizations" (a real, already-shipped
  // route — src/app/organizations/page.tsx — that has no menu entry in the
  // shared navItems today) right after Dashboard, and Edit/Delete were moved
  // off the dashboard's org card in favor of managing organizations from
  // here instead. Injected locally rather than into the shared `navItems`
  // constant so Phenix/CREDEBL/SOVIO's nav is unaffected.
  const [managedNavItem, setManagedNavItem] = useState<NavItem[]>(() => {
    const [dashboardItem, ...rest] = navItems
    return [
      dashboardItem,
      {
        title: 'Organizations',
        url: '/organizations',
        icon: 'organization',
        isActive: false,
        shortcut: ['o', 'o'],
        items: [],
      },
      ...rest,
    ]
  })

  const selectedOrgId = useAppSelector((state) => state.organization.orgId)
  const ecosystemEnableStatus = useAppSelector(
    (state) => state.ecosystem.ecosystemEnableStatus,
  )

  const groupHoldsPath = (item: NavItem): boolean =>
    Boolean(item.items?.some((child) => pathname.startsWith(child.url)))

  const [expanded, setExpanded] = useState<string | null>(
    () => managedNavItem.find(groupHoldsPath)?.title ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  )

  // Sibling routes can nest path-wise without being related — e.g.
  // Organizations (/organizations) and Billing (/organizations/billing) —
  // so a plain per-item prefix match lights up both at once on
  // /organizations/billing. Instead, pick the single most specific href
  // among every known nav link that matches the current path, and only
  // that one counts as current.
  const allHrefs = useMemo(() => {
    const hrefs: string[] = []
    for (const item of managedNavItem) {
      if (item.items && item.items.length > 0) {
        for (const child of item.items) {
          hrefs.push(child.url)
        }
      } else {
        hrefs.push(item.url)
      }
    }
    for (const link of ACCOUNT_LINKS) {
      hrefs.push(link.href)
    }
    return hrefs
  }, [managedNavItem])

  const activeHref = useMemo(() => {
    let best: string | null = null
    for (const href of allHrefs) {
      const matches = pathname === href || pathname.startsWith(`${href}/`)
      if (matches && (!best || href.length > best.length)) {
        best = href
      }
    }
    return best
  }, [allHrefs, pathname])

  const isCurrent = (href: string): boolean => href === activeHref

  useEffect(() => {
    const fetchOrganizations = async (): Promise<void> => {
      try {
        const response = await getOrganizations(
          currentPage,
          pageSize,
          searchTerm,
          '',
        )
        if (
          typeof response !== 'string' &&
          response?.data?.data?.organizations
        ) {
          const orgs = response.data.data.organizations

          if (orgs.length === 0) {
            dispatch(resetOrgState())
            return
          }

          const selectedOrg = orgs.find(
            (org: Organization) => org.id === selectedOrgId,
          )
          const [firstOrg]: Organization[] = orgs
          const nextOrg = selectedOrg ?? firstOrg

          if (!selectedOrgId || selectedOrgId !== nextOrg.id) {
            dispatch(setOrgId(nextOrg.id))
            dispatch(setSelectedOrgId(nextOrg.id))
            dispatch(
              setTenantData({
                id: nextOrg.id,
                name: nextOrg.name,
                logoUrl: nextOrg.logoUrl,
              }),
            )
            dispatch(
              setOrgInfo({
                id: nextOrg.id,
                name: nextOrg.name,
                description: nextOrg.description,
                logoUrl: nextOrg.logoUrl,
                roles:
                  nextOrg.userOrgRoles?.map(
                    (role: { orgRole: { name: string } }) =>
                      role?.orgRole?.name,
                  ) || [],
              }),
            )
          }
        }
      } catch (err) {
        console.error('Error fetching organizations:', err)
      }
    }

    fetchOrganizations()
  }, [dispatch, currentPage, pageSize, searchTerm, selectedOrgId])

  useEffect(() => {
    if (ecosystemEnableStatus) {
      setManagedNavItem((prev) => {
        if (prev.some((item) => item.url === '/ecosystems')) {
          return prev
        }
        return [
          ...prev,
          {
            title: 'Ecosystems',
            url: '/ecosystems',
            icon: 'world',
            isActive: false,
            shortcut: ['e', 'e'],
            items: [],
          },
        ]
      })
    }
  }, [ecosystemEnableStatus])

  return (
    <>
      {/* Scrim, mobile only. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[54] backdrop-blur-[5px] transition-opacity duration-[280ms] min-[901px]:hidden"
        style={{
          background: 'var(--bhutanndi-scrim)',
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      <aside
        aria-label="Main"
        data-open={open ? '1' : '0'}
        className="border-bhutanndi-subtle ease-bhutanndi fixed top-16 left-0 z-[55] flex h-[calc(100dvh-4rem)] w-[248px] flex-col overflow-y-auto border-r bg-[var(--bhutanndi-chrome-fill-strong)] px-3 py-5 backdrop-blur-[20px] backdrop-saturate-[140%] transition-transform duration-[260ms] min-[901px]:translate-x-0 min-[901px]:bg-[var(--bhutanndi-chrome-fill)]"
        style={{
          transform: open ? 'translateX(0)' : undefined,
        }}
      >
        <nav className="flex flex-col gap-0.5">
          {managedNavItem.map((item) => {
            const icon = iconFor(item.icon)

            if (item.items && item.items.length > 0) {
              const isOpen = expanded === item.title
              const holdsCurrent = groupHoldsPath(item)
              return (
                <div key={item.title}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : item.title)}
                    aria-expanded={isOpen}
                    className="ndi-navrow font-display flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13.5px] font-medium"
                    data-active={holdsCurrent && !isOpen ? '1' : '0'}
                  >
                    <Icon
                      name={icon}
                      size={18}
                      strokeWidth={1.7}
                      className="flex-none"
                    />
                    <span className="flex-1">{item.title}</span>
                    <Icon
                      name="chevronDown"
                      size={14}
                      strokeWidth={2}
                      className="ease-bhutanndi flex-none opacity-60 transition-transform duration-200"
                      style={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
                    />
                  </button>

                  {isOpen ? (
                    <div className="mt-0.5 flex flex-col gap-0.5 pb-1 pl-[22px]">
                      {item.items.map((child) => (
                        <Link
                          key={child.url}
                          href={child.url}
                          onClick={onClose}
                          aria-current={
                            isCurrent(child.url) ? 'page' : undefined
                          }
                          className="ndi-navrow font-display flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13px] font-medium"
                          data-active={isCurrent(child.url) ? '1' : '0'}
                        >
                          <Icon
                            name={iconFor(child.icon)}
                            size={16}
                            strokeWidth={1.7}
                            className="flex-none"
                          />
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            }

            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={onClose}
                aria-current={isCurrent(item.url) ? 'page' : undefined}
                className="ndi-navrow font-display flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium"
                data-active={isCurrent(item.url) ? '1' : '0'}
              >
                <Icon
                  name={icon}
                  size={18}
                  strokeWidth={1.7}
                  className="flex-none"
                />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="border-bhutanndi-subtle my-4 h-px border-t" />

        <nav aria-label="Account" className="flex flex-col gap-0.5">
          {ACCOUNT_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className="ndi-navrow font-display flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium"
              data-active={isCurrent(item.href) ? '1' : '0'}
            >
              <Icon
                name={item.icon}
                size={18}
                strokeWidth={1.7}
                className="flex-none"
              />
              {item.label}
            </Link>
          ))}
        </nav>

        {process.env.NEXT_PUBLIC_DOCS_URL ? (
          <>
            <div className="border-bhutanndi-subtle my-4 h-px border-t" />
            <nav aria-label="Resources" className="flex flex-col gap-0.5">
              <a
                href={process.env.NEXT_PUBLIC_DOCS_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="ndi-navrow font-display flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium"
                data-active="0"
              >
                <Icon
                  name="fileText"
                  size={18}
                  strokeWidth={1.7}
                  className="flex-none"
                />
                Documentation
              </a>
            </nav>
          </>
        ) : null}
      </aside>
    </>
  )
}
