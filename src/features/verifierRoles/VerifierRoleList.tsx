'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IColumnData,
  ITableMetadata,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { MOBILE_VERIFIER_ROLES, useHasOrgRole } from '@/lib/useOrgRoleAccess'
import { MoreVertical, Pencil, Plus, RefreshCw } from 'lucide-react'
import React, { JSX, useEffect, useState } from 'react'
import VerifierRoleFormDialog, {
  VerifierRoleFormHandlers,
  VerifierRoleFormState,
} from './VerifierRoleFormDialog'
import {
  createVerifierRole,
  getVerifierRoles,
  updateVerifierRole,
} from '@/app/api/verifierRoles'

import {
  getResultMessage,
  getResultStatusCode,
  isNotFoundMessage,
} from '@/lib/mobileVerifierResponse'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { useAppSelector } from '@/lib/hooks'

interface VerifierRole {
  id: string
  role: string
  orgId: string
}

interface PaginationState {
  pageIndex: number
  pageSize: number
  pageCount: number
}

const VerifierRoleList = (): JSX.Element => {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const canManage = useHasOrgRole(MOBILE_VERIFIER_ROLES.VERIFIER)

  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [roleList, setRoleList] = useState<VerifierRole[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [role, setRole] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [editRoleId, setEditRoleId] = useState<string | null>(null)
  // a failed load (403, 502, ...) shown above the table; "not found" is just an empty list
  const [listError, setListError] = useState<string | null>(null)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
  })

  const fetchRoles = async (reload = false): Promise<void> => {
    setListError(null)
    if (reload) {
      setReloading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await getVerifierRoles({
        orgId,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      })
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setRoleList(data?.data ?? [])
        const total = data?.pagination?.total ?? 0
        setPagination((prev) => ({
          ...prev,
          pageCount: Math.max(1, Math.ceil(total / prev.pageSize)),
        }))
      } else {
        setRoleList([])
        if (typeof response === 'string' && !isNotFoundMessage(response)) {
          setListError(response)
        }
      }
    } catch {
      setRoleList([])
    } finally {
      if (reload) {
        setReloading(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleReload = async (): Promise<void> => {
    await fetchRoles(true)
  }

  useEffect(() => {
    if (!orgId) {
      setLoading(false)
      return
    }
    fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, pagination.pageIndex, pagination.pageSize])

  useEffect(() => {
    if (!success && !failure) {
      return
    }

    const wasSuccess = Boolean(success)
    const timer = setTimeout(() => {
      setSuccess(null)
      setFailure(null)

      // keep the form open on failure so the user can correct their input
      if (openCreate && wasSuccess) {
        setOpenCreate(false)
        setIsEdit(false)
        setEditRoleId(null)
        setRole('')
      }
    }, 3000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, failure])

  const resetFormState = (): void => {
    setSuccess(null)
    setFailure(null)
    setIsEdit(false)
    setEditRoleId(null)
    setRole('')
  }

  const handleCreateRole = (): void => {
    resetFormState()
    setOpenCreate(true)
  }

  const openEdit = (verifierRole: VerifierRole): void => {
    setSuccess(null)
    setFailure(null)
    setIsEdit(true)
    setEditRoleId(verifierRole.id)
    setRole(verifierRole.role)
    setOpenCreate(true)
  }

  const handleSubmitRole = async (): Promise<void> => {
    if (!orgId) {
      setFailure('No organization selected')
      return
    }
    setSuccess(null)
    setFailure(null)

    if (!role.trim()) {
      setFailure('Role name is required')
      return
    }

    setCreating(true)

    try {
      if (isEdit && editRoleId) {
        const res = await updateVerifierRole(editRoleId, {
          role,
          orgId,
        })

        if (getResultStatusCode(res) === apiStatusCodes.API_STATUS_SUCCESS) {
          setSuccess(
            getResultMessage(res, 'Verifier role updated successfully'),
          )
          fetchRoles(true)
        } else {
          setFailure(getResultMessage(res, 'Failed to update verifier role'))
        }
        return
      }

      const res = await createVerifierRole({ role, orgId })

      if (getResultStatusCode(res) === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(getResultMessage(res, 'Verifier role created successfully'))
        fetchRoles(true)
      } else {
        setFailure(getResultMessage(res, 'Failed to create verifier role'))
      }
    } catch {
      setFailure(
        isEdit
          ? 'Failed to update verifier role'
          : 'Failed to create verifier role',
      )
    } finally {
      setCreating(false)
    }
  }

  const actionCell = ({
    row,
  }: {
    row: { original: VerifierRole }
  }): JSX.Element => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          disabled={!canManage}
          onClick={() => openEdit(row.original)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Update
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const columnData: IColumnData[] = [
    {
      id: 'id',
      title: 'Role ID',
      accessorKey: 'id',
      cell: ({ row }) => <span>{row.original.id || 'NA'}</span>,
      columnFunction: [],
    },
    {
      id: 'role',
      title: 'Role',
      accessorKey: 'role',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.role || 'NA'}</span>
      ),
      columnFunction: [],
    },
    {
      id: 'actions',
      title: 'Actions',
      accessorKey: 'actions',
      cell: actionCell,
      columnFunction: [],
    },
  ]

  const metadata: ITableMetadata = { enableSelection: false }
  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<VerifierRole>(tableStyling)

  const formState: VerifierRoleFormState = {
    role,
    isEdit,
    creating,
    success,
    failure,
  }

  const formHandlers: VerifierRoleFormHandlers = {
    setRole,
    setSuccess,
    setFailure,
    handleSubmit: handleSubmitRole,
    resetFormState,
  }

  return (
    <PageContainer>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verifier Roles</h2>
          <p className="text-muted-foreground">
            Manage mobile-verifier roles used to scope proof templates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            disabled={reloading}
            title="Reload"
            className="bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 ${reloading ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={handleCreateRole}
            disabled={!canManage}
            title={
              canManage
                ? undefined
                : 'You do not have permission to manage verifier roles'
            }
            className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <VerifierRoleFormDialog
          open={openCreate}
          setOpen={setOpenCreate}
          formState={formState}
          handlers={formHandlers}
        />

        {listError && (
          <AlertComponent
            message={listError}
            type="failure"
            onAlertClose={() => setListError(null)}
          />
        )}

        <DataTable
          isLoading={loading}
          hideSearch
          placeHolder="Search by role name"
          data={roleList}
          columns={column}
          index={'id'}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          pageCount={pagination.pageCount}
          onPageChange={(index) =>
            setPagination((prev) => ({ ...prev, pageIndex: index }))
          }
          onPageSizeChange={(size) =>
            setPagination((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }))
          }
          onSearchTerm={() => {
            /* backend has no name-search param on GET /verifier-role */
          }}
        />
      </div>
    </PageContainer>
  )
}

export default VerifierRoleList
