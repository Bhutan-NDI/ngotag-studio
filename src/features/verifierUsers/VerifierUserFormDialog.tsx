'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { AlertComponent } from '@/components/AlertComponent'
import { JSX } from 'react'

export interface VerifierRoleOption {
  id: string
  role: string
}

export interface VerifierUserFormState {
  firstName: string
  lastName: string
  username: string
  foundationID: string
  email: string
  verifierRoleId: string
  isEdit: boolean
  creating: boolean
  success: string | null
  failure: string | null
}

export interface VerifierUserFormHandlers {
  setFirstName: (value: string) => void
  setLastName: (value: string) => void
  setUsername: (value: string) => void
  setFoundationID: (value: string) => void
  setEmail: (value: string) => void
  setVerifierRoleId: (value: string) => void
  setSuccess: (val: string | null) => void
  setFailure: (val: string | null) => void
  handleSubmit: () => void
  resetFormState: () => void
}

interface VerifierUserFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  formState: VerifierUserFormState
  handlers: VerifierUserFormHandlers
  roles: VerifierRoleOption[]
}

const VerifierUserFormDialog = ({
  open,
  setOpen,
  formState,
  handlers,
  roles,
}: VerifierUserFormDialogProps): JSX.Element => {
  const {
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
  } = formState
  const {
    setFirstName,
    setLastName,
    setUsername,
    setFoundationID,
    setEmail,
    setVerifierRoleId,
    setSuccess,
    setFailure,
    handleSubmit,
    resetFormState,
  } = handlers

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    username.trim() &&
    foundationID.trim() &&
    email.trim() &&
    verifierRoleId.trim()

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
            {isEdit ? 'Update Verifier User' : 'Create Verifier User'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Sonam"
                className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Dorji"
                className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">User ID *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. user1"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Foundation ID *</label>
            <input
              type="text"
              value={foundationID}
              onChange={(e) => setFoundationID(e.target.value)}
              placeholder="e.g. 123"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. verifier@example.com"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Role *</label>
            <Select value={verifierRoleId} onValueChange={setVerifierRoleId}>
              <SelectTrigger className="w-full rounded-md border px-3 py-2 text-sm">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.length === 0 ? (
                  <div className="text-muted-foreground px-2 py-1.5 text-sm">
                    No roles available
                  </div>
                ) : (
                  roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.role}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
              disabled={creating || !isValid}
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

export default VerifierUserFormDialog
