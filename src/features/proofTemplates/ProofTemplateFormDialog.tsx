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
import { MultiSelect } from '@/components/ui/multi-select'

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
  // false when an edited template's current roles could not be loaded
  rolesLoaded: boolean
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
    rolesLoaded,
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
            <label
              htmlFor="proof-template-template-id"
              className="text-sm font-medium"
            >
              Template ID *
            </label>
            <input
              id="proof-template-template-id"
              type="text"
              value={templateId}
              disabled={isEdit}
              onChange={(e) => setTemplateId(e.target.value)}
              placeholder="e.g. foundational-id-v1"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="proof-template-name"
              className="text-sm font-medium"
            >
              Name *
            </label>
            <input
              id="proof-template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Foundational ID"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            {/* required on create (the API rejects an empty one); optional on update */}
            <label
              htmlFor="proof-template-description"
              className="text-sm font-medium"
            >
              Description{isEdit ? '' : ' *'}
            </label>
            <textarea
              id="proof-template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="proof-template-version"
              className="text-sm font-medium"
            >
              Version *
            </label>
            <input
              id="proof-template-version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          {isEdit && !rolesLoaded ? (
            <div className="space-y-1">
              <label className="text-sm font-medium">Verifier Roles</label>
              <p className="text-muted-foreground text-xs">
                The roles currently assigned to this template could not be
                loaded, so they will be left unchanged.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <label
                htmlFor="proof-template-verifier-roles"
                className="text-sm font-medium"
              >
                Verifier Roles
              </label>
              {availableRoles.length === 0 ? (
                <p className="text-muted-foreground rounded-md border p-2 text-sm">
                  No verifier roles yet — create one first.
                </p>
              ) : (
                <MultiSelect
                  id="proof-template-verifier-roles"
                  options={availableRoles.map((r) => ({
                    value: r.id,
                    label: r.role,
                  }))}
                  selected={verifierRoleIds}
                  onChange={(next) => {
                    // One role is added or removed per change.
                    const changed =
                      next.find((id) => !verifierRoleIds.includes(id)) ??
                      verifierRoleIds.find((id) => !next.includes(id))
                    if (changed) {
                      toggleVerifierRoleId(changed)
                    }
                  }}
                  placeholder="Select roles"
                  searchPlaceholder="Search roles"
                  emptyText="No roles match."
                />
              )}
              {isEdit && (
                <p className="text-muted-foreground text-xs">
                  Saving replaces this template&apos;s role assignments with the
                  roles selected above.
                </p>
              )}
            </div>
          )}

          <div
            role="group"
            aria-labelledby="proof-template-schemas-label"
            className="space-y-1"
          >
            <span
              id="proof-template-schemas-label"
              className="text-sm font-medium"
            >
              Proof Request Schemas & Attributes *
            </span>
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
                (!isEdit && !description.trim()) ||
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
