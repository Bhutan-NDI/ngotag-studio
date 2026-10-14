'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { AlertComponent } from '@/components/AlertComponent'
import { JSX } from 'react'

export interface VerifierRoleFormState {
  role: string
  isEdit: boolean
  creating: boolean
  success: string | null
  failure: string | null
}

export interface VerifierRoleFormHandlers {
  setRole: (value: string) => void
  setSuccess: (val: string | null) => void
  setFailure: (val: string | null) => void
  handleSubmit: () => void
  resetFormState: () => void
}

interface VerifierRoleFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  formState: VerifierRoleFormState
  handlers: VerifierRoleFormHandlers
}

const VerifierRoleFormDialog = ({
  open,
  setOpen,
  formState,
  handlers,
}: VerifierRoleFormDialogProps): JSX.Element => {
  const { role, isEdit, creating, success, failure } = formState
  const { setRole, setSuccess, setFailure, handleSubmit, resetFormState } =
    handlers

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
      <DialogContent className="sm:max-w-[500px]">
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
            {isEdit ? 'Update Verifier Role' : 'Create Verifier Role'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Role Name *</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Manager"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
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
              disabled={creating || !role.trim()}
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

export default VerifierRoleFormDialog
