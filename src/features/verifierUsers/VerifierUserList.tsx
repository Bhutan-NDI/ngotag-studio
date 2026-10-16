'use client'

import {
  ITableMetadata,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { MOBILE_VERIFIER_ROLES, useHasOrgRole } from '@/lib/useOrgRoleAccess'
import { Plus, RefreshCw } from 'lucide-react'
import React, { JSX, useEffect, useState } from 'react'
import {
  VerifierUser,
  getVerifierUserColumnData,
  getVerifierUserStatus,
} from './verifierUserColumns'
import VerifierUserFormDialog, {
  VerifierRoleOption,
  VerifierUserFormHandlers,
  VerifierUserFormState,
} from './VerifierUserFormDialog'
import VerifierUserStatusDialog, {
  VERIFIER_USER_STATUS_OPTIONS,
} from './VerifierUserStatusDialog'
import {
  createVerifierUser,
  getVerifierUsers,
  inviteVerifierUser,
  updateVerifierUser,
  updateVerifierUserStatus,
} from '@/app/api/verifierUsers'

import {
  getResultMessage,
  getResultStatusCode,
  isNotFoundMessage,
} from '@/lib/mobileVerifierResponse'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import Link from 'next/link'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getVerifierRoles } from '@/app/api/verifierRoles'
import { toast } from 'sonner'
import { useAppSelector } from '@/lib/hooks'

interface PaginationState {
  pageIndex: number
  pageSize: number
  pageCount: number
}

const VerifierUserList = (): JSX.Element => {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const canManage = useHasOrgRole(MOBILE_VERIFIER_ROLES.VERIFIER)

  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [userList, setUserList] = useState<VerifierUser[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [foundationID, setFoundationID] = useState('')
  const [email, setEmail] = useState('')
  const [verifierRoleId, setVerifierRoleId] = useState('')
  const [roles, setRoles] = useState<VerifierRoleOption[]>([])
  const [isEdit, setIsEdit] = useState(false)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [invitingId, setInvitingId] = useState<string | null>(null)
  // a failed load (no webhook registered, 403, 502, ...) shown above the table
  const [listError, setListError] = useState<string | null>(null)
  const [openStatus, setOpenStatus] = useState(false)
  const [statusUser, setStatusUser] = useState<VerifierUser | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>(
    VERIFIER_USER_STATUS_OPTIONS[0],
  )
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
  })

  const fetchUsers = async (reload = false): Promise<void> => {
    setListError(null)
    if (reload) {
      setReloading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await getVerifierUsers({
        orgId,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      })
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setUserList(data?.data ?? [])
        const total = data?.pagination?.total ?? 0
        setPagination((prev) => ({
          ...prev,
          pageCount: Math.max(1, Math.ceil(total / prev.pageSize)),
        }))
      } else {
        setUserList([])
        // "not found" is just an empty list; anything else (e.g. no webhook registered) is a real error
        if (typeof response === 'string' && !isNotFoundMessage(response)) {
          setListError(response)
        }
      }
    } catch {
      setUserList([])
    } finally {
      if (reload) {
        setReloading(false)
      } else {
        setLoading(false)
      }
    }
  }

  const fetchRoles = async (): Promise<void> => {
    try {
      const response = await getVerifierRoles({ orgId, page: 1, pageSize: 100 })
      const { data } = response as AxiosResponse
      setRoles(
        data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
          ? (data?.data ?? [])
          : [],
      )
    } catch {
      setRoles([])
    }
  }

  const handleReload = async (): Promise<void> => {
    await fetchUsers(true)
  }

  useEffect(() => {
    if (!orgId) {
      setLoading(false)
      return
    }
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, pagination.pageIndex, pagination.pageSize])

  useEffect(() => {
    if (orgId) {
      fetchRoles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

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
        setFirstName('')
        setLastName('')
        setUsername('')
        setFoundationID('')
        setEmail('')
        setVerifierRoleId('')
        setIsEdit(false)
        setEditUserId(null)
      }
    }, 3000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, failure])

  const resetFormState = (): void => {
    setSuccess(null)
    setFailure(null)
    setFirstName('')
    setLastName('')
    setUsername('')
    setFoundationID('')
    setEmail('')
    setVerifierRoleId('')
    setIsEdit(false)
    setEditUserId(null)
  }

  const handleCreateUser = (): void => {
    resetFormState()
    setOpenCreate(true)
  }

  const openEdit = (verifierUser: VerifierUser): void => {
    setSuccess(null)
    setFailure(null)
    setIsEdit(true)
    setEditUserId(verifierUser.id)
    setFirstName(verifierUser.firstName ?? '')
    setLastName(verifierUser.lastName ?? '')
    setUsername(verifierUser.username ?? '')
    setFoundationID(verifierUser.foundationID ?? '')
    setEmail(verifierUser.email)
    setVerifierRoleId(verifierUser.verifierRoleId ?? '')
    setOpenCreate(true)
  }

  const handleSubmitUser = async (): Promise<void> => {
    if (!orgId) {
      setFailure('No organization selected')
      return
    }
    setSuccess(null)
    setFailure(null)

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !username.trim() ||
      !foundationID.trim() ||
      !email.trim() ||
      !verifierRoleId.trim()
    ) {
      setFailure('All fields are required')
      return
    }

    setCreating(true)

    try {
      const payload = {
        firstName,
        lastName,
        username,
        foundationID,
        email,
        verifierRoleId,
        orgId,
      }

      if (isEdit && editUserId) {
        const res = await updateVerifierUser(editUserId, payload)

        if (getResultStatusCode(res) === apiStatusCodes.API_STATUS_SUCCESS) {
          setSuccess(
            getResultMessage(res, 'Verifier user updated successfully'),
          )
          fetchUsers(true)
        } else {
          setFailure(getResultMessage(res, 'Failed to update verifier user'))
        }
        return
      }

      const res = await createVerifierUser(payload)

      if (getResultStatusCode(res) === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(getResultMessage(res, 'Verifier user created successfully'))
        fetchUsers(true)
      } else {
        setFailure(getResultMessage(res, 'Failed to create verifier user'))
      }
    } catch {
      setFailure(
        isEdit
          ? 'Failed to update verifier user'
          : 'Failed to create verifier user',
      )
    } finally {
      setCreating(false)
    }
  }

  const openStatusDialog = (verifierUser: VerifierUser): void => {
    setStatusUser(verifierUser)
    setSelectedStatus(
      VERIFIER_USER_STATUS_OPTIONS.find(
        (option) => option === getVerifierUserStatus(verifierUser),
      ) ?? VERIFIER_USER_STATUS_OPTIONS[0],
    )
    setOpenStatus(true)
  }

  const handleUpdateStatus = async (): Promise<void> => {
    if (!statusUser) {
      return
    }
    // rows from the client's webhook may not carry orgId, so use the selected org
    if (!orgId) {
      toast.error('No organization selected')
      return
    }

    setUpdatingStatus(true)

    try {
      const res = await updateVerifierUserStatus(
        statusUser.id,
        orgId,
        selectedStatus,
      )

      if (getResultStatusCode(res) === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(getResultMessage(res, 'Status updated successfully'))
        setOpenStatus(false)
        fetchUsers(true)
      } else {
        toast.error(getResultMessage(res, 'Failed to update status'))
      }
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleInvite = async (verifierUser: VerifierUser): Promise<void> => {
    if (!orgId) {
      toast.error('No organization selected')
      return
    }

    setInvitingId(verifierUser.id)

    try {
      const res = await inviteVerifierUser(verifierUser.email, orgId)
      const statusCode = getResultStatusCode(res)

      if (
        statusCode === apiStatusCodes.API_STATUS_SUCCESS ||
        statusCode === apiStatusCodes.API_STATUS_CREATED
      ) {
        toast.success(
          getResultMessage(res, 'Verifier user invited successfully'),
        )
      } else {
        toast.error(getResultMessage(res, 'Failed to invite verifier user'))
      }
    } catch {
      toast.error('Failed to invite verifier user')
    } finally {
      setInvitingId(null)
    }
  }

  const columnData = getVerifierUserColumnData({
    invitingId,
    canManage,
    onInvite: handleInvite,
    onEdit: openEdit,
    onStatus: openStatusDialog,
  })

  const metadata: ITableMetadata = { enableSelection: false }
  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<VerifierUser>(tableStyling)

  const formState: VerifierUserFormState = {
    firstName,
    lastName,
    username,
    foundationID,
    email,
    verifierRoleId,
    isEdit,
    creating,
    success,
    failure,
  }

  const formHandlers: VerifierUserFormHandlers = {
    setFirstName,
    setLastName,
    setUsername,
    setFoundationID,
    setEmail,
    setVerifierRoleId,
    setSuccess,
    setFailure,
    handleSubmit: handleSubmitUser,
    resetFormState,
  }

  return (
    <PageContainer>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verifier Users</h2>
          <p className="text-muted-foreground">
            Manage mobile-verifier users registered under your organization
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
            onClick={handleCreateUser}
            disabled={!canManage}
            title={
              canManage
                ? undefined
                : 'You do not have permission to manage verifier users'
            }
            className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Verifier User
          </button>
        </div>
      </div>

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <VerifierUserFormDialog
          open={openCreate}
          setOpen={setOpenCreate}
          formState={formState}
          handlers={formHandlers}
          roles={roles}
        />

        <VerifierUserStatusDialog
          open={openStatus}
          setOpen={setOpenStatus}
          status={selectedStatus}
          setStatus={setSelectedStatus}
          updating={updatingStatus}
          onSubmit={handleUpdateStatus}
        />

        {listError && (
          <div className="mb-2">
            <AlertComponent
              message={listError}
              type="failure"
              onAlertClose={() => setListError(null)}
            />
            {/webhook/i.test(listError) && (
              <Link
                href="/mobile-verifier/webhook"
                className="text-sm underline"
              >
                Go to Webhook settings
              </Link>
            )}
          </div>
        )}

        <DataTable
          isLoading={loading}
          hideSearch
          placeHolder="Search by email"
          data={userList}
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
            /* backend has no email-search param on GET /verifier-user */
          }}
        />
      </div>
    </PageContainer>
  )
}

export default VerifierUserList
