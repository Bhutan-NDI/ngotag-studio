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

import { JSX } from 'react'

export const VERIFIER_USER_STATUS_OPTIONS = [
  'ACTIVE',
  'SUSPENDED',
  'REVOKED',
] as const

interface VerifierUserStatusDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  status: string
  setStatus: (status: string) => void
  updating: boolean
  onSubmit: () => void
}

const VerifierUserStatusDialog = ({
  open,
  setOpen,
  status,
  setStatus,
  updating,
  onSubmit,
}: VerifierUserStatusDialogProps): JSX.Element => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Update Status</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {VERIFIER_USER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
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
            onClick={onSubmit}
            disabled={updating}
            className="bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm"
          >
            {updating && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Update
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

export default VerifierUserStatusDialog
