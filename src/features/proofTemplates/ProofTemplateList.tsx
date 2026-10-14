'use client'

import { JSX, useEffect, useState } from 'react'
import { MOBILE_VERIFIER_ROLES, useHasOrgRole } from '@/lib/useOrgRoleAccess'
import { Plus, RefreshCw } from 'lucide-react'
import ProofTemplateFormDialog, {
  ProofTemplateFormHandlers,
  ProofTemplateFormState,
} from './ProofTemplateFormDialog'
import {
  ProofTemplateRow,
  useProofTemplateColumns,
} from './useProofTemplateColumns'
import {
  createProofTemplate,
  deleteProofTemplate,
  getRoleProofTemplates,
  updateProofTemplate,
} from '@/app/api/proofTemplates'

import { AxiosResponse } from 'axios'
import ConfirmationModal from '@/components/confirmation-modal'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import { DifPayloadEntry } from './DifSchemaPicker'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getVerifierRoles } from '@/app/api/verifierRoles'
import { useAppSelector } from '@/lib/hooks'

interface VerifierRoleOption {
  id: string
  role: string
}

interface PaginationState {
  pageIndex: number
  pageSize: number
  pageCount: number
  searchTerm: string
}

// The API may return the stored payload as a JSON string (stored stringified) or an object.
const parseTemplatePayload = (payload: unknown): DifPayloadEntry[] => {
  try {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload
    return Array.isArray(parsed?.data) ? parsed.data : []
  } catch {
    return []
  }
}

const ProofTemplateList = (): JSX.Element => {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const canManage = useHasOrgRole(MOBILE_VERIFIER_ROLES.PROOF_TEMPLATE)

  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [templateList, setTemplateList] = useState<ProofTemplateRow[]>([])
  const [roles, setRoles] = useState<VerifierRoleOption[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState('')

  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [templateId, setTemplateId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('1.0.0')
  const [payloadData, setPayloadData] = useState<DifPayloadEntry[]>([])
  const [verifierRoleIds, setVerifierRoleIds] = useState<string[]>([])
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProofTemplateRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
    searchTerm: '',
  })

  const closeForm = (): void => {
    setOpenCreate(false)
    setIsEdit(false)
    setEditTemplateId(null)
    setTemplateId('')
    setName('')
    setDescription('')
    setVersion('1.0.0')
    setPayloadData([])
    setVerifierRoleIds([])
  }

  const fetchRoles = async (): Promise<void> => {
    const response = await getVerifierRoles({ orgId, page: 1, pageSize: 100 })
    const { data } = (response as AxiosResponse) ?? {}
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const list: VerifierRoleOption[] = data?.data ?? []
      setRoles(list)
      if (!selectedRoleId && list.length > 0) {
        setSelectedRoleId(list[0].id)
      }
    }
  }

  const fetchTemplates = async (reload = false): Promise<void> => {
    if (!selectedRoleId) {
      setTemplateList([])
      setLoading(false)
      return
    }

    if (reload) {
      setReloading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await getRoleProofTemplates({
        orgId,
        roleId: selectedRoleId,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: pagination.searchTerm,
      })
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setTemplateList(data?.data ?? [])
        const total = data?.pagination?.total ?? 0
        setPagination((prev) => ({
          ...prev,
          pageCount: Math.max(1, Math.ceil(total / prev.pageSize)),
        }))
      } else {
        setTemplateList([])
      }
    } catch {
      setTemplateList([])
    } finally {
      if (reload) {
        setReloading(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!orgId) {
      setLoading(false)
      return
    }
    fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

  useEffect(() => {
    if (!orgId) {
      return
    }
    fetchTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orgId,
    selectedRoleId,
    pagination.pageIndex,
    pagination.pageSize,
    pagination.searchTerm,
  ])

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
        closeForm()
      }
      if (showConfirmModal) {
        setShowConfirmModal(false)
        setSelectedTemplate(null)
      }
    }, 3000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, failure])

  const resetFormState = (): void => {
    setSuccess(null)
    setFailure(null)
    closeForm()
  }

  const handleCreate = (): void => {
    resetFormState()
    setOpenCreate(true)
  }

  const openEdit = (template: ProofTemplateRow): void => {
    setSuccess(null)
    setFailure(null)
    setIsEdit(true)
    setEditTemplateId(template.id)
    setTemplateId(template.templateId)
    setName(template.name)
    setDescription(template.description ?? '')
    setVersion(template.version)
    setPayloadData(parseTemplatePayload(template.payload))
    setVerifierRoleIds([])
    setOpenCreate(true)
  }

  const toggleVerifierRoleId = (roleId: string): void => {
    setVerifierRoleIds((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId)
      }
      return [...prev, roleId]
    })
  }

  const handleSubmitTemplate = async (): Promise<void> => {
    if (!orgId) {
      setFailure('No organization selected')
      return
    }
    setSuccess(null)
    setFailure(null)

    if (!name.trim() || !templateId.trim()) {
      setFailure('Template ID and name are required')
      return
    }

    if (payloadData.length === 0) {
      setFailure('Select at least one schema attribute')
      return
    }
    const payload = { type: 'dif', data: payloadData }

    setCreating(true)

    try {
      if (isEdit && editTemplateId) {
        const res = (await updateProofTemplate(editTemplateId, {
          name,
          description,
          version,
          payload,
        })) as AxiosResponse

        if (res?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setSuccess(
            res?.data?.message || 'Proof template updated successfully',
          )
          fetchTemplates(true)
        } else {
          setFailure(res?.data?.message || 'Failed to update proof template')
        }
        return
      }

      const res = (await createProofTemplate({
        templateId,
        name,
        orgId,
        description,
        version,
        payload,
        ...(verifierRoleIds.length > 0 ? { verifierRoleIds } : {}),
      })) as AxiosResponse

      if (res?.data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(res?.data?.message || 'Proof template created successfully')
        fetchTemplates(true)
      } else {
        setFailure(res?.data?.message || 'Failed to create proof template')
      }
    } catch {
      setFailure(
        isEdit
          ? 'Failed to update proof template'
          : 'Failed to create proof template',
      )
    } finally {
      setCreating(false)
    }
  }

  const openDeleteConfirmation = (template: ProofTemplateRow): void => {
    setSuccess(null)
    setFailure(null)
    setSelectedTemplate(template)
    setShowConfirmModal(true)
  }

  const handleConfirmedDelete = async (): Promise<void> => {
    if (!selectedTemplate) {
      return
    }
    setActionLoading(true)
    try {
      const res = (await deleteProofTemplate(
        selectedTemplate.id,
        orgId,
      )) as AxiosResponse
      if (res?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(res?.data?.message || 'Proof template deleted successfully')
        fetchTemplates(true)
      } else {
        setFailure(res?.data?.message || 'Failed to delete proof template')
      }
    } catch {
      setFailure('Something went wrong')
    } finally {
      setActionLoading(false)
    }
  }

  const column = useProofTemplateColumns(
    openEdit,
    openDeleteConfirmation,
    canManage,
  )

  const formState: ProofTemplateFormState = {
    templateId,
    name,
    description,
    version,
    payloadData,
    verifierRoleIds,
    isEdit,
    creating,
    success,
    failure,
  }

  const formHandlers: ProofTemplateFormHandlers = {
    setTemplateId,
    setName,
    setDescription,
    setVersion,
    setPayloadData,
    toggleVerifierRoleId,
    setSuccess,
    setFailure,
    handleSubmit: handleSubmitTemplate,
    resetFormState,
  }

  return (
    <PageContainer>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proof Templates</h2>
          <p className="text-muted-foreground">
            Manage mobile-verifier proof request templates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRoleId}
            onChange={(e) => {
              setSelectedRoleId(e.target.value)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {roles.length === 0 && <option value="">No verifier roles</option>}
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.role}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchTemplates(true)}
            disabled={reloading}
            title="Reload"
            className="bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 ${reloading ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={handleCreate}
            disabled={!canManage}
            title={
              canManage
                ? undefined
                : 'You do not have permission to manage proof templates'
            }
            className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </button>
        </div>
      </div>

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <ProofTemplateFormDialog
          open={openCreate}
          setOpen={setOpenCreate}
          formState={formState}
          handlers={formHandlers}
          availableRoles={roles}
        />

        {showConfirmModal && selectedTemplate && (
          <ConfirmationModal
            openModal={showConfirmModal}
            buttonTitles={['Cancel', 'Delete']}
            loading={actionLoading}
            closeModal={() => {
              setShowConfirmModal(false)
              setSelectedTemplate(null)
            }}
            onSuccess={(confirmed: boolean): void => {
              if (confirmed) {
                handleConfirmedDelete()
              }
            }}
            message="Are you sure you want to delete this proof template?"
            isProcessing={actionLoading}
            success={success}
            failure={failure}
            setSuccess={setSuccess}
            setFailure={setFailure}
          />
        )}

        <DataTable
          isLoading={loading}
          placeHolder="Search by template name"
          data={templateList}
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
          onSearchTerm={(term) =>
            setPagination((prev) => ({
              ...prev,
              searchTerm: term,
              pageIndex: 0,
            }))
          }
        />
      </div>
    </PageContainer>
  )
}

export default ProofTemplateList
