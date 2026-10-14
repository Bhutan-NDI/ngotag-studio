'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import DifSchemaPicker, { DifPayloadEntry } from './DifSchemaPicker'

import { AlertComponent } from '@/components/AlertComponent'
import { JSX } from 'react'

interface VerifierRoleOption {
  id: string
  role: string
}

export interface ProofTemplateFormState {
  templateId: string
  name: string
  description: string
  version: string
  payloadData: DifPayloadEntry[]
  verifierRoleIds: string[]
  isEdit: boolean
  creating: boolean
  success: string | null
  failure: string | null
}

export interface ProofTemplateFormHandlers {
  setTemplateId: (value: string) => void
  setName: (value: string) => void
  setDescription: (value: string) => void
  setVersion: (value: string) => void
  setPayloadData: (value: DifPayloadEntry[]) => void
  toggleVerifierRoleId: (roleId: string) => void
  setSuccess: (val: string | null) => void
  setFailure: (val: string | null) => void
  handleSubmit: () => void
  resetFormState: () => void
}

interface ProofTemplateFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  formState: ProofTemplateFormState
  handlers: ProofTemplateFormHandlers
  availableRoles: VerifierRoleOption[]
}

const ProofTemplateFormDialog = ({
  open,
  setOpen,
  formState,
  handlers,
  availableRoles,
}: ProofTemplateFormDialogProps): JSX.Element => {
  const {
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
  } = formState
  const {
    setTemplateId,
    setName,
    setDescription,
    setVersion,
    setPayloadData,
    toggleVerifierRoleId,
    setSuccess,
    setFailure,
    handleSubmit,
    resetFormState,
  } = handlers

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          resetFormState()
        }
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          {success && (
            <AlertComponent
              message={success}
              type="success"
              onAlertClose={() => setSuccess(null)}
            />
          )}
          {failure && (
            <AlertComponent
              message={failure}
              type="failure"
              onAlertClose={() => setFailure(null)}
            />
          )}
          <DialogTitle>
            {isEdit ? 'Update Proof Template' : 'Create Proof Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Template ID *</label>
            <input
              type="text"
              value={templateId}
              disabled={isEdit}
              onChange={(e) => setTemplateId(e.target.value)}
              placeholder="e.g. foundational-id-v1"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Foundational ID"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Version *</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Verifier Roles</label>
              <div className="flex flex-wrap gap-3 rounded-md border p-2">
                {availableRoles.length === 0 && (
                  <span className="text-muted-foreground text-sm">
                    No verifier roles yet — create one first.
                  </span>
                )}
                {availableRoles.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={verifierRoleIds.includes(r.id)}
                      onChange={() => toggleVerifierRoleId(r.id)}
                    />
                    {r.role}
                  </label>
                ))}
              </div>
            </div>
          )}
          {isEdit && (
            <p className="text-muted-foreground text-xs">
              Verifier role assignment can only be set when creating a template
              — updating leaves existing role mappings unchanged.
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Proof Request Schemas & Attributes *
            </label>
            <DifSchemaPicker value={payloadData} onChange={setPayloadData} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                creating ||
                !name.trim() ||
                !templateId.trim() ||
                payloadData.length === 0
              }
              className="bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm"
            >
              {creating && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProofTemplateFormDialog
