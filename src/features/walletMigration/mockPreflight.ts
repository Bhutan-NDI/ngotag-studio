// Preflight reports for the dummy data (mockMigrationApi), shaped like the
// platform's IPreflightReport.

import { IPreflightCheck, IPreflightReport, PreflightCheckId } from './types'

const CHECK_IDS: PreflightCheckId[] = [
  'ORG_IS_SHARED',
  'AGENT_REACHABLE',
  'TOKEN_IS_ROOT',
  'ENDPOINT_MATCHES',
  'RELEASE_MATCHES',
  'CONFIG_MATCHES',
  'TARGET_PRISTINE',
  'DIDCOMM_REACHABLE',
  'NO_BULK_JOB',
  'WEBHOOK_DELIVERS',
  'DOWNLOAD_METHOD',
  'NO_OUT_OF_SCOPE_ARTEFACTS',
  'NO_WEBSOCKET_ENDPOINTS',
  'SHARED_REDIS',
  'BACKUPS_CONFIRMED',
]

interface IFailingCheck {
  id: PreflightCheckId
  code: string
  detail?: IPreflightCheck['detail']
}

// First checks fail when the admin address contains the word.
const FAILING_CHECK: Record<string, IFailingCheck> = {
  'not-pristine': { id: 'TARGET_PRISTINE', code: 'TARGET_NOT_PRISTINE' },
  'old-release': {
    id: 'RELEASE_MATCHES',
    code: 'RELEASE_MISMATCH',
    detail: { found: '0.5.6', required: '0.6.1' },
  },
  unreachable: { id: 'AGENT_REACHABLE', code: 'AGENT_UNREACHABLE' },
}

// Checks that can't run once the agent is unreachable.
const NEEDS_AGENT: PreflightCheckId[] = [
  'TOKEN_IS_ROOT',
  'ENDPOINT_MATCHES',
  'RELEASE_MATCHES',
  'CONFIG_MATCHES',
  'TARGET_PRISTINE',
  'WEBHOOK_DELIVERS',
  'DOWNLOAD_METHOD',
]

export const report = (
  ranAt: string,
  backupsConfirmed: boolean,
  failing?: IFailingCheck,
): IPreflightReport => {
  const checks: IPreflightCheck[] = CHECK_IDS.map((id) => {
    if (failing && id === failing.id) {
      return { id, status: 'FAIL', code: failing.code, detail: failing.detail }
    }
    if (id === 'BACKUPS_CONFIRMED' && !backupsConfirmed) {
      return { id, status: 'FAIL', code: 'BACKUPS_NOT_CONFIRMED' }
    }
    if (failing?.id === 'AGENT_REACHABLE' && NEEDS_AGENT.includes(id)) {
      return { id, status: 'SKIPPED' }
    }
    if (id === 'DOWNLOAD_METHOD') {
      return { id, status: 'PASS', detail: { method: 'PULL' } }
    }
    return { id, status: 'PASS' }
  })
  return { ranAt, passed: checks.every((c) => c.status !== 'FAIL'), checks }
}

/** The owner's checks: the first run fails if a trigger word asks for it. */
export const runPreflight = (record: {
  targetAdminEndpoint: string
  backupsConfirmed: boolean
  preflightRuns: number
}): IPreflightReport => {
  const address = record.targetAdminEndpoint.toLowerCase()
  const failing =
    record.preflightRuns === 1
      ? Object.entries(FAILING_CHECK).find(([word]) =>
          address.includes(word),
        )?.[1]
      : undefined
  return report(
    new Date(Date.now()).toISOString(),
    record.backupsConfirmed,
    failing,
  )
}

/** The final checks at the slot, failing because the agent went away. */
export const finalChecksReport = (
  ranAt: string,
  backupsConfirmed: boolean,
): IPreflightReport =>
  report(ranAt, backupsConfirmed, FAILING_CHECK.unreachable)
