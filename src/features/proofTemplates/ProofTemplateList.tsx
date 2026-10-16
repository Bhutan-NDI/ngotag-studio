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
  getProofTemplateById,
  getProofTemplates,
  getRoleProofTemplates,
  updateProofTemplate,
} from '@/app/api/proofTemplates'
import {
  getResultMessage,
  getResultStatusCode,
  isNotFoundMessage,
} from '@/lib/mobileVerifierResponse'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
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
  // roles the template had when the edit form was opened
  const [originalRoleIds, setOriginalRoleIds] = useState<string[]>([])
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null)

  // a failed load (403, 502, ...) shown above the table; "not found" is just an empty list
  const [listError, setListError] = useState<string | null>(null)

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
    setOriginalRoleIds([])
  }

  const fetchRoles = async (): Promise<void> => {
    const response = await getVerifierRoles({ orgId, page: 1, pageSize: 100 })
    const { data } = (response as AxiosResponse) ?? {}
    // An org with no roles comes back as a non-success (404), so always replace the
    // list; otherwise the previous org's roles would stay selectable for this one.
    const list: VerifierRoleOption[] =
      data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
        ? (data?.data ?? [])
        : []
    if (typeof response === 'string' && !isNotFoundMessage(response)) {
      setListError(response)
    }
    setRoles(list)
    // '' means "All roles" (every template of the org); keep a still-valid role filter.
    setSelectedRoleId((prev) => (list.some((r) => r.id === prev) ? prev : ''))
  }

  const fetchTemplates = async (reload = false): Promise<void> => {
    setListError(null)
    if (reload) {
      setReloading(true)
    } else {
      setLoading(true)
    }

    try {
      const query = {
        orgId,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: pagination.searchTerm,
      }
      // "All roles" lists every template of the org; picking a role filters to its templates.
      const response = selectedRoleId
        ? await getRoleProofTemplates({ ...query, roleId: selectedRoleId })
        : await getProofTemplates(query)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        // The org-wide list wraps its rows as [total, rows]; the per-role list returns the rows.
        const rows: ProofTemplateRow[] = Array.isArray(data?.data?.[1])
          ? data.data[1]
          : (data?.data ?? [])
        setTemplateList(rows)
        const total = data?.pagination?.total ?? 0
        setPagination((prev) => ({
          ...prev,
          pageCount: Math.max(1, Math.ceil(total / prev.pageSize)),
        }))
      } else {
        setTemplateList([])
        if (typeof response === 'string' && !isNotFoundMessage(response)) {
          setListError(response)
        }
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
    // drop the previous org's roles/templates immediately on org switch
    setRoles([])
    setSelectedRoleId('')
    setTemplateList([])

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

  const openEdit = async (template: ProofTemplateRow): Promise<void> => {
    setSuccess(null)
    setFailure(null)
    setIsEdit(true)
    setEditTemplateId(template.id)
    setTemplateId(template.templateId)
    setName(template.name)
    setDescription(template.description ?? '')
    setVersion(template.version)
    setPayloadData(parseTemplatePayload(template.payload))

    // The per-role list does not carry the role mapping, so fetch the template itself.
    let mappings = template.verifierRoleToProofTemplates
    if (!mappings) {
      const response = await getProofTemplateById(orgId, template.id)
      if (getResultStatusCode(response) === apiStatusCodes.API_STATUS_SUCCESS) {
        mappings =
          (response as AxiosResponse).data.data?.verifierRoleToProofTemplates ??
          []
      } else {
        setFailure(
          getResultMessage(
            response,
            'Could not load the roles currently assigned to this template',
          ),
        )
      }
    }
    const currentRoleIds = (mappings ?? [])
      .map((mapping) => mapping.verifierRoleId)
      .filter((id): id is string => Boolean(id))
    setVerifierRoleIds(currentRoleIds)
    setOriginalRoleIds(currentRoleIds)
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
        // The API replaces the template's roles with the list it receives and cannot clear them,
        // so a template that has roles must keep at least one.
        if (verifierRoleIds.length === 0 && originalRoleIds.length > 0) {
          setFailure('Select at least one verifier role')
          setCreating(false)
          return
        }
        const res = await updateProofTemplate(editTemplateId, orgId, {
          name,
          description,
          version,
          payload,
          ...(verifierRoleIds.length > 0 ? { verifierRoleIds } : {}),
        })

        if (getResultStatusCode(res) === apiStatusCodes.API_STATUS_SUCCESS) {
          setSuccess(
            getResultMessage(res, 'Proof template updated successfully'),
          )
          fetchTemplates(true)
        } else {
          setFailure(getResultMessage(res, 'Failed to update proof template'))
        }
        return
      }

      const res = await createProofTemplate({
        templateId,
        name,
        orgId,
        description,
        version,
        payload,
        ...(verifierRoleIds.length > 0 ? { verifierRoleIds } : {}),
      })

      if (getResultStatusCode(res) === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(getResultMessage(res, 'Proof template created successfully'))
        fetchTemplates(true)
      } else {
        setFailure(getResultMessage(res, 'Failed to create proof template'))
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

  const column = useProofTemplateColumns(openEdit, canManage)

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
            <option value="">All roles</option>
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

        {listError && (
          <AlertComponent
            message={listError}
            type="failure"
            onAlertClose={() => setListError(null)}
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
