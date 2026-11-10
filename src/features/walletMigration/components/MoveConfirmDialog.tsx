'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { formatBtt } from '../config'

interface MoveConfirmDialogProps {
  open: boolean
  orgName: string
  /** Null when the move starts at once ("Start now"). */
  scheduledFor: string | null
  /** The rehearsal's predicted pause, e.g. "12 minutes"; null without one. */
  expectedPause: string | null
  loading: boolean
  onOpenChange: (open: boolean) => void
  /** Called with what the owner typed; the platform checks it again. */
  onConfirm: (confirmationName: string) => void
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
  expectedPause,
  loading,
  onOpenChange,
  onConfirm,
}: Readonly<MoveConfirmDialogProps>): React.JSX.Element {
  const [typed, setTyped] = useState('')
  // Start empty every time the dialog opens, however it was last closed, so
  // the typed confirmation can never become a single click (P-02).
  useEffect(() => {
    if (open) {
      setTyped('')
    }
  }, [open])
  // Same rule as the platform: trimmed, otherwise exact.
  const matches = typed.trim() !== '' && typed.trim() === orgName.trim()

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
            {scheduledFor
              ? `Scheduled for ${formatBtt(scheduledFor)}.`
              : 'Starts once the final checks pass.'}
          </DialogDescription>
        </DialogHeader>

        {!scheduledFor && (
          <p
            role="alert"
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
          >
            The move starts within a minute once the final checks pass. Issuing
            and verifying then pause
            {expectedPause ? `, for about ${expectedPause}` : ''}. Don&apos;t
            restart your dedicated agent until the move finishes.
          </p>
        )}

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
            onClick={() => onConfirm(typed.trim())}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {scheduledFor
              ? 'Confirm and schedule the move'
              : 'Confirm and start the move'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
