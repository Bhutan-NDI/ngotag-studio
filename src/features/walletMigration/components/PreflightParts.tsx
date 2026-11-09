'use client'

import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'
import {
  findMigrationError,
  findRehearsalError,
  formatCheckDetail,
} from '../errorMessages'

import { IPreflightCheck } from '../types'
import React from 'react'

// Check icons and the failure box used on the Checks and Rehearsal cards
// (SCR-WM-04). Check names are in errorMessages (CHECK_LABELS).
export const CHECK_STATUS_LABEL = {
  PASS: 'Passed',
  FAIL: 'Failed',
  SKIPPED: 'Skipped',
}

export const CheckIcon = ({
  status,
}: {
  status: IPreflightCheck['status']
}): React.JSX.Element => {
  if (status === 'PASS') {
    return <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
  }
  if (status === 'FAIL') {
    return <XCircle className="text-destructive h-4 w-4" aria-hidden />
  }
  return <MinusCircle className="text-muted-foreground h-4 w-4" aria-hidden />
}

/**
 * Failure box: the spec message, the fix, any detail, and the code as a
 * reference. `rehearsal` reads codes the rehearsal shares with move day as a
 * rehearsal failure.
 */
export const Failure = ({
  code,
  detail,
  rehearsal = false,
}: {
  code?: string | null
  detail?: IPreflightCheck['detail']
  rehearsal?: boolean
}): React.JSX.Element => {
  const content = rehearsal
    ? findRehearsalError(code)
    : findMigrationError(code)
  const facts = formatCheckDetail(detail)
  return (
    <div className="border-destructive/30 bg-destructive/5 mt-2 rounded-md border px-3 py-2.5 text-sm">
      <p className="font-medium">
        {content?.message ?? "This check didn't pass."}
      </p>
      {content?.recovery && (
        <p className="text-muted-foreground mt-1">{content.recovery}</p>
      )}
      {facts && <p className="text-muted-foreground mt-1 text-xs">{facts}</p>}
      {code && (
        <p className="text-muted-foreground mt-1 text-xs">Reference: {code}</p>
      )}
    </div>
  )
}
