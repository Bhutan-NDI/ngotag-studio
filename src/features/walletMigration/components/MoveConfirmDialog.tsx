'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { formatBtt } from '../config'

interface MoveConfirmDialogProps {
  open: boolean
  orgName: string
  scheduledFor: string
  loading: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * SCR-WM-07: typed confirmation before move day (P-02, high severity).
 * The confirm button stays disabled until the org name is typed exactly, and
 * focus starts on the input, not the destructive button.
 */
export function MoveConfirmDialog({
  open,
  orgName,
  scheduledFor,
  loading,
  onOpenChange,
  onConfirm,
}: Readonly<MoveConfirmDialogProps>): React.JSX.Element {
  const [typed, setTyped] = useState('')
  const matches = typed === orgName

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setTyped('')
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Confirm the move: no going back after the switch
          </DialogTitle>
          <DialogDescription>
            Scheduled for {formatBtt(scheduledFor)}.
          </DialogDescription>
        </DialogHeader>

        <ul className="text-muted-foreground my-2 list-disc space-y-2 pl-5 text-sm">
          <li>
            On move day your organisation switches to its own agent. Final
            checks run first, and if any fails, the move cancels itself and
            nothing changes.
          </li>
          <li>
            After the switch you can&apos;t move back to the shared agent.
            Problems are fixed on your new agent.
          </li>
          <li>
            A backup stays on our side for 48 hours, only in case your new agent
            is completely lost. After that, your own wallet backups are your
            recovery.
          </li>
          <li>Citizens don&apos;t need to do anything.</li>
        </ul>

        <div className="space-y-1.5">
          <Label htmlFor="confirmOrgName">
            Type <span className="font-semibold">{orgName}</span> to confirm
          </Label>
          <Input
            id="confirmOrgName"
            value={typed}
            autoFocus
            autoComplete="off"
            onChange={(e) => setTyped(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!matches || loading}
            onClick={onConfirm}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm and schedule the move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
