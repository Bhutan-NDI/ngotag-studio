'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import React, { useEffect, useState } from 'react'
import { getOrganizationRoles, getOrganizations } from '@/app/api/organization'
import {
  setOrgId,
  setOrgRoles,
  setSelectedOrgId,
  setTenantData,
} from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AxiosResponse } from 'axios'
import { BhutanndiOrgCard } from './BhutanndiOrganizationCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/bhutanndi/ui/EmptyState'
import { GradientButton } from '@/components/bhutanndi/ui/GradientButton'
import { Icon } from '@/components/bhutanndi/ui/icons'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import { Organization } from '@/features/dashboard/type/organization'
import { PageHeader } from '@/components/bhutanndi/ui/PageHeader'
import { Panel } from '@/components/bhutanndi/ui/Panel'
import { Plus } from 'lucide-react'
import { SearchField } from '@/components/bhutanndi/ui/SearchField'
import { apiStatusCodes } from '@/config/CommonConstant'
import { hardNavigate } from '@/utils/navigation'
import { isBhutanndiTheme } from '@/lib/active-theme'

export const OrganizationList = (): React.JSX.Element => {
  const [organizationsList, setOrganizationsList] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  // Bhutanndi-only: which card's "Switch to this" is in flight, and the
  // currently-active org (same selector BhutanndiTopBar/BhutanndiSidebar use) that
  // decides which card gets the "Current" pill instead.
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const activeOrgId = useAppSelector((state) => state.organization.orgId)

  const [currentPage, setCurrentPage] = useState({
    pageNumber: 1,
    pageSize: 9,
    total: 0,
    totalCount: 0,
  })

  const getAllOrganizations = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await getOrganizations(
        currentPage.pageNumber,
        currentPage.pageSize,
        searchText,
      )

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const totalPages = data?.data?.totalPages
        const totalCount = data?.data?.totalCount

        const orgList = data?.data?.organizations.map(
          (userOrg: Organization) => {
            const roles: string[] = userOrg.userOrgRoles.map(
              (role) => role.orgRole.name,
            )
            return {
              ...userOrg,
              roles,
            }
          },
        )

        setOrganizationsList(orgList)
        setCurrentPage((prev) => ({
          ...prev,
          total: totalPages,
          totalCount,
        }))
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number): void => {
    setCurrentPage((prev) => ({ ...prev, pageNumber: newPage }))
  }

  const handleCreateOrg = (): void => {
    setIsCreatingOrg(true)

    setTimeout(() => {
      hardNavigate('/create-organization')
    }, 300)
  }

  // Edit and Delete both open the same unified bhutanndi "Organization profile"
  // page (CreateOrganizationModal.tsx's bhutanndi+edit-mode branch, rendering
  // BhutanndiOrganizationProfile) — Delete just deep-links to its danger-zone
  // panel via the #danger-zone anchor instead of the old standalone
  // /delete-organization wizard route. (OrganizationDashboard.tsx's own
  // handleEditOrg/handleDeleteOrg are unrelated — those back the *generic*,
  // non-bhutanndi dashboard's Edit/Delete icon buttons and still use the two
  // separate routes verbatim.)
  const handleEditOrg = (orgId: string): void => {
    hardNavigate(`/create-organization?orgId=${orgId}`)
  }

  const handleDeleteOrg = (orgId: string): void => {
    hardNavigate(`/create-organization?orgId=${orgId}#danger-zone`)
  }

  // Same dispatch sequence as org-switcher.tsx's handleTenantSwitch — reused
  // rather than reimplemented, so switching from this list stays in sync
  // with the sidebar's org switcher.
  const handleSwitchOrg = async (org: Organization): Promise<void> => {
    setSwitchingOrgId(org.id)
    try {
      dispatch(setOrgId(org.id))
      dispatch(setSelectedOrgId(org.id))
      dispatch(
        setTenantData({ id: org.id, name: org.name, logoUrl: org.logoUrl }),
      )

      const response = await getOrganizationRoles(org.id)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        dispatch(setOrgRoles(data?.data ?? []))
      }
    } catch (err) {
      console.error('Error switching organization:', err)
    } finally {
      setSwitchingOrgId(null)
    }
  }

  // The Members page (`/users`) only ever reads the currently-active org
  // from redux — it has no per-org URL override — so viewing a non-current
  // org's members has to switch into it first, reusing the same real
  // switch logic above, rather than inventing a new API call.
  const handleMembersClick = async (org: Organization): Promise<void> => {
    if (org.id !== activeOrgId) {
      await handleSwitchOrg(org)
    }
    hardNavigate('/users')
  }

  useEffect(() => {
    getAllOrganizations()
  }, [currentPage.pageNumber, currentPage.pageSize, searchText])

  if (isBhutanndiTheme()) {
    const paginationBlock =
      organizationsList.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-bhutanndi-muted m-0 text-[13px] whitespace-nowrap">
            Showing {(currentPage.pageNumber - 1) * currentPage.pageSize + 1} to{' '}
            {Math.min(
              currentPage.pageNumber * currentPage.pageSize,
              currentPage.totalCount,
            )}{' '}
            of {currentPage.totalCount} entries
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                currentPage.pageNumber > 1 &&
                handlePageChange(currentPage.pageNumber - 1)
              }
              disabled={currentPage.pageNumber === 1}
              className="ndi-navrow font-display inline-flex h-8 items-center gap-1 rounded-[8px] px-2.5 text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-40"
              data-active="0"
            >
              <Icon
                name="chevronRight"
                size={14}
                strokeWidth={2}
                style={{ transform: 'rotate(180deg)' }}
              />
              Previous
            </button>

            {Array.from({ length: currentPage.total }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePageChange(index + 1)}
                aria-current={
                  currentPage.pageNumber === index + 1 ? 'page' : undefined
                }
                className="ndi-navrow font-display inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] px-2 text-[12.5px] font-medium"
                data-active={currentPage.pageNumber === index + 1 ? '1' : '0'}
              >
                {index + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                currentPage.pageNumber < currentPage.total &&
                handlePageChange(currentPage.pageNumber + 1)
              }
              disabled={currentPage.pageNumber === currentPage.total}
              className="ndi-navrow font-display inline-flex h-8 items-center gap-1 rounded-[8px] px-2.5 text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-40"
              data-active="0"
            >
              Next
              <Icon name="chevronRight" size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : null

    return (
      <div className="p-6">
        <PageHeader
          crumbs={[{ label: 'Organizations' }]}
          title="Organizations"
          actions={
            <>
              <SearchField
                placeholder="Search organizations"
                value={searchText}
                onChange={setSearchText}
                className="w-64"
              />
              <GradientButton
                disabled={currentPage.totalCount >= 10 || isCreatingOrg}
                onClick={handleCreateOrg}
              >
                {isCreatingOrg ? (
                  <Loader />
                ) : (
                  <>
                    <Icon name="plus" size={16} strokeWidth={2} />
                    Create
                  </>
                )}
              </GradientButton>
            </>
          }
        />

        <div className="mt-6 grid grid-cols-1 gap-5 min-[900px]:grid-cols-2 min-[1300px]:grid-cols-3">
          {loading && (
            <div className="col-span-full grid min-h-[40vh] w-full place-items-center">
              <Loader />
            </div>
          )}

          {!loading &&
            organizationsList.length > 0 &&
            organizationsList.map((org) => (
              <BhutanndiOrgCard
                key={org.id}
                org={org}
                isCurrent={org.id === activeOrgId}
                isSwitching={switchingOrgId === org.id}
                onSwitch={() => handleSwitchOrg(org)}
                onMembers={() => handleMembersClick(org)}
                onEdit={() => handleEditOrg(org.id)}
                onDelete={() => handleDeleteOrg(org.id)}
              />
            ))}

          {!loading && organizationsList.length === 0 && (
            <div className="col-span-full">
              <Panel>
                <EmptyState
                  icon="building"
                  title="No organizations found"
                  message={
                    searchText
                      ? 'No organizations match your search.'
                      : 'Get started by creating a new organization.'
                  }
                  tone={searchText ? 'filtered' : 'empty'}
                  action={
                    !searchText ? (
                      <GradientButton
                        disabled={isCreatingOrg}
                        onClick={handleCreateOrg}
                      >
                        {isCreatingOrg ? (
                          <Loader />
                        ) : (
                          <>
                            <Icon name="plus" size={16} strokeWidth={2} />
                            Create Organization
                          </>
                        )}
                      </GradientButton>
                    ) : undefined
                  }
                />
              </Panel>
            </div>
          )}
        </div>

        {paginationBlock}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mx-8 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Button
            disabled={currentPage.totalCount >= 10 || isCreatingOrg}
            onClick={handleCreateOrg}
            className="gap-2"
          >
            {isCreatingOrg ? (
              <Loader />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Organization
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mx-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full mb-4 grid min-h-[50vh] w-full place-items-center">
            <Loader />
          </div>
        )}
        {organizationsList.length > 0 ? (
          organizationsList.map((org) => (
            <Card
              key={org.id}
              className="border-border relative h-full w-full overflow-hidden rounded-xl border p-6 py-4 shadow-xl"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 rounded-md">
                  {org.logoUrl ? (
                    <AvatarImage src={org.logoUrl} alt={org.name} />
                  ) : (
                    <AvatarFallback className="text-2xl font-bold">
                      {org.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3
                    className="text-foreground mb-1 truncate text-base font-semibold"
                    title={org.name}
                  >
                    {org.name}
                  </h3>
                  <p
                    className="text-foreground mb-2 truncate overflow-hidden text-sm"
                    title={org.description}
                  >
                    {org.description}
                  </p>

                  <div className="text-md mt-2 flex flex-wrap items-center gap-1">
                    <span className="mr-1 font-bold">Role(s):</span>
                    {org.userOrgRoles.length > 0 ? (
                      org.userOrgRoles.map((roles, index) => (
                        <span
                          key={`${roles.orgRole.name}-${index}`}
                          className="bg-secondary text-secondary-foreground rounded-md px-3 py-1 text-sm"
                        >
                          {roles.orgRole.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No Roles
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-muted-foreground col-span-full flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg font-semibold">No organizations found.</p>
            <p className="text-sm">
              Get started by creating a new organization.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between px-8">
        <div className="text-muted-foreground text-sm">
          Showing {(currentPage.pageNumber - 1) * currentPage.pageSize + 1} to{' '}
          {Math.min(
            currentPage.pageNumber * currentPage.pageSize,
            currentPage.totalCount,
          )}{' '}
          of {currentPage.totalCount} entries
        </div>

        {organizationsList && organizationsList.length > 0 && (
          <div>
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage.pageNumber > 1 &&
                      handlePageChange(currentPage.pageNumber - 1)
                    }
                    className={
                      currentPage.pageNumber === 1
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>

                {Array.from({ length: currentPage.total }, (_, index) => (
                  <PaginationItem key={index}>
                    <Button
                      variant={
                        currentPage.pageNumber === index + 1
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage.pageNumber < currentPage.total &&
                      handlePageChange(currentPage.pageNumber + 1)
                    }
                    className={
                      currentPage.pageNumber === currentPage.total
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
