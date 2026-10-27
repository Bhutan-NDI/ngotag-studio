'use client'

import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'
import { IPreflightCheck, PreflightCheckId } from '../types'
import { findMigrationError, formatCheckDetail } from '../errorMessages'

import React from 'react'

// Check labels, icons and the failure box used on the Checks and Rehearsal
// cards (SCR-WM-04).
export const CHECK_LABELS: Record<PreflightCheckId, string> = {
  ORG_IS_SHARED: 'Organisation is on the shared agent',
  AGENT_REACHABLE: 'Agent admin address reachable',
  TOKEN_IS_ROOT: 'API key gives full access',
  ENDPOINT_MATCHES: "Agent's public address matches",
  RELEASE_MATCHES: 'Agent release',
  CONFIG_MATCHES: 'Agent settings',
  TARGET_PRISTINE: 'New agent wallet is empty',
  DIDCOMM_REACHABLE: 'Public DIDComm address reachable',
  NO_BULK_JOB: 'No bulk issuance running',
  WEBHOOK_DELIVERS: 'Webhooks reach the platform',
  DOWNLOAD_METHOD: 'Wallet file download',
  NO_OUT_OF_SCOPE_ARTEFACTS: 'Organisation features supported',
  NO_WEBSOCKET_ENDPOINTS: 'Connection types supported',
  SHARED_REDIS: 'Platform ready for moves',
  BACKUPS_CONFIRMED: 'Backups confirmed',
}

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

/** Failure box: the spec message, the fix, any detail, and the code as a reference. */
export const Failure = ({
  code,
  detail,
}: {
  code?: string | null
  detail?: IPreflightCheck['detail']
}): React.JSX.Element => {
  const content = findMigrationError(code)
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
