import { IPreflightCheck } from './types'

export interface IMigrationErrorContent {
  message: string
  recovery: string
}

const RECHECK = 'Fix it, then re-run the checks.'
const SUPPORT = 'Contact support.'
const NEW_MOVE =
  'Nothing changed. Start a new move when ready; if the import had begun, reset your new agent to an empty wallet first.'

// UX spec §3.5, keyed by the platform's codes. Codes arrive in
// preflight.checks[].code, rehearsal.code, the move's `error`, or an API
// error's `error` field. The raw code is only ever shown next to this text as
// a support reference (spec §2.4), never on its own.
const ERROR_CONTENT: Record<string, IMigrationErrorContent> = {
  // Preflight checks
  ORG_NOT_SHARED: {
    message:
      "This organisation isn't on the shared agent, so there's nothing to move.",
    recovery: SUPPORT,
  },
  AGENT_UNREACHABLE: {
    message: "We couldn't reach your agent's admin address.",
    recovery:
      'Check the address, firewall allow-list and certificate, then re-run the checks.',
  },
  AGENT_TOKEN_REJECTED: {
    message: 'Your agent did not accept the API key.',
    recovery:
      'Check the API key on your agent, then start again with the right key.',
  },
  API_KEY_REQUIRED: {
    message: 'The API key for your agent is needed again.',
    recovery: 'Re-run the checks and enter the API key.',
  },
  AGENT_NOT_INITIALIZED: {
    message: "Your agent hasn't finished setting up.",
    recovery:
      'Finish the agent setup from the checklist, then re-run the checks.',
  },
  TOKEN_NOT_ROOT: {
    message: "The API key doesn't give full access to your agent.",
    recovery: 'Use the agent’s root API key, then re-run the checks.',
  },
  ENDPOINT_MISMATCH: {
    message:
      "Your agent's configured public address doesn't match the address you entered.",
    recovery: RECHECK,
  },
  RELEASE_MISMATCH: {
    message: 'Your agent runs a different release from the one required.',
    recovery: 'Install the required release, then re-run the checks.',
  },
  STORAGE_VERSION_MISMATCH: {
    message:
      'Your agent uses a different wallet storage version from the one required.',
    recovery: 'Update the agent, then re-run the checks.',
  },
  CONFIG_MISMATCH: {
    message: "Some of your agent's settings don't match what the move needs.",
    recovery: RECHECK,
  },
  CONFIG_UNAVAILABLE: {
    message: "We couldn't read your agent's settings.",
    recovery: 'Make sure the agent is running, then re-run the checks.',
  },
  TARGET_NOT_PRISTINE: {
    message:
      'Your new agent already contains wallet data. A move needs a freshly installed agent.',
    recovery:
      'Reinstall the agent with an empty wallet, then re-run the checks.',
  },
  DIDCOMM_UNREACHABLE: {
    message:
      "Citizens' wallets wouldn't be able to reach your agent's public address.",
    recovery:
      'Check that the public DIDComm address is reachable over HTTPS with a valid certificate.',
  },
  ORG_BULK_JOB_ACTIVE: {
    message:
      'A bulk issuance is still running for this organisation. You can move once it finishes.',
    recovery: 'Re-run the checks once the bulk issuance has finished.',
  },
  OUT_OF_SCOPE_ARTEFACTS: {
    message:
      "This organisation uses features that can't be moved yet (OpenID4VC or AnonCreds).",
    recovery: SUPPORT,
  },
  RELAY_WS_UNSUPPORTED: {
    message:
      "This organisation's connections use a connection type that can't be moved yet.",
    recovery: SUPPORT,
  },
  RELAY_REQUIRES_SHARED_REDIS: {
    message: "The platform isn't ready to run moves right now.",
    recovery: 'Try again later. Platform admins have been notified.',
  },
  SHARED_AGENT_UNAVAILABLE: {
    message: "The shared agent couldn't be reached to check your organisation.",
    recovery: 'Try again in a few minutes.',
  },
  BUCKET_NOT_CONFIGURED: {
    message: "The platform's export storage isn't set up yet.",
    recovery: 'Try again later. Platform admins have been notified.',
  },
  BACKUPS_NOT_CONFIRMED: {
    message:
      "You haven't confirmed that your new agent's wallet database is backed up.",
    recovery: 'Confirm your backups, then re-run the checks.',
  },
  CHECK_FAILED: {
    message: "This check couldn't be completed.",
    recovery: 'Re-run the checks. Contact support if it repeats.',
  },
  // Webhook check
  WEBHOOK_NOT_CONFIGURED: {
    message: "Your agent's webhook address isn't set.",
    recovery:
      'Set the webhook address from the checklist, then re-run the checks.',
  },
  WEBHOOK_UNREACHABLE: {
    message: "Your agent's webhooks aren't reaching our platform.",
    recovery: 'Check the webhook address and firewall, then re-run the checks.',
  },
  WEBHOOK_REJECTED: {
    message: 'Our platform rejected a webhook from your agent.',
    recovery:
      'Check the webhook address from the checklist, then re-run the checks.',
  },
  WEBHOOK_CHECK_BUSY: {
    message: 'A webhook check is already running.',
    recovery: 'Wait a minute, then re-run the checks.',
  },
  WEBHOOK_PROBE_UNSUPPORTED: {
    message: "Your agent's release can't run the webhook check.",
    recovery: 'Install the required release, then re-run the checks.',
  },
  AGENT_UNAVAILABLE: {
    message: "We couldn't use your agent or the shared agent just now.",
    recovery: 'Try again in a few minutes.',
  },
  // Rehearsal
  JOB_FAILED: {
    message: "The rehearsal didn't finish. Nothing was changed.",
    recovery: 'Run the rehearsal again. Contact support if it repeats.',
  },
  DOWNLOAD_FAILED: {
    message: "Your agent couldn't download the wallet file.",
    recovery: 'Check your agent can reach the platform, then try again.',
  },
  REHEARSAL_TIMEOUT: {
    message:
      'The rehearsal took too long and was stopped. Nothing was changed.',
    recovery: 'Run the rehearsal again. Contact support if it repeats.',
  },
  ALERT_FAILED: {
    message:
      "The security alert for the key export couldn't be sent, so nothing ran.",
    recovery: 'Try again later. Platform admins have been notified.',
  },
  // Move outcomes (the move's `error`)
  CANCELLED_BY_OWNER: {
    message: 'The move was cancelled. Nothing changed.',
    recovery:
      'Your organisation stays on the shared agent. You can start a new move later.',
  },
  SLOT_MISSED: {
    message: "The move didn't start at its booked time. Nothing changed.",
    recovery: 'Pick a new time.',
  },
  FREEZE_BUDGET_EXCEEDED: {
    message:
      'The move took longer than the time limit and was cancelled automatically.',
    recovery: NEW_MOVE,
  },
  EXPORT_FAILED: {
    message:
      "The wallet export didn't finish, so the move was cancelled automatically.",
    recovery: NEW_MOVE,
  },
  IMPORT_FAILED: {
    message:
      "The import into your agent didn't finish, so the move was cancelled automatically.",
    recovery: NEW_MOVE,
  },
  VERIFICATION_FAILED: {
    message:
      "Your new agent didn't pass the final checks ({check}), so the move was cancelled automatically.",
    recovery: NEW_MOVE,
  },
  CUTOVER_FAILED: {
    message:
      "The switch to your agent didn't complete, so the move was cancelled automatically.",
    recovery: NEW_MOVE,
  },
  INVITATION_FAILED: {
    message:
      "Your connections couldn't be prepared for the switch, so the move was cancelled automatically.",
    recovery: NEW_MOVE,
  },
  RELAY_FAILED: {
    message:
      "Incoming messages couldn't be held safely, so the move was cancelled automatically.",
    recovery: NEW_MOVE,
  },
  MOVE_INTERRUPTED: {
    message: 'The move was interrupted and cancelled automatically.',
    recovery: NEW_MOVE,
  },
  MOVE_FAILED: {
    message: "The move couldn't be completed and was cancelled automatically.",
    recovery: NEW_MOVE,
  },
  // API errors
  STEP_UP_REQUIRED: {
    message: 'Please sign in again to start the move.',
    recovery: 'Sign in, then start the move within five minutes.',
  },
  ORG_AGENT_MIGRATING: {
    message:
      'Issuing and verifying are paused while your organisation moves to its own agent.',
    recovery: 'View move progress.',
  },
}

// VERIFICATION_FAILED:<check> names the final check that failed.
const VERIFY_CHECKS: Record<string, string> = {
  AGENT: 'agent responds',
  RELAY_PROBE: 'message forwarding',
  SIGN_VERIFY: 'signing and verifying',
  CONFIG: 'agent settings',
  ENDPOINT: 'public address',
  RELEASE: 'agent release',
  COUNTS: 'wallet record counts',
}

const lookup = (
  code: string,
): {
  content: IMigrationErrorContent
  values: Record<string, string>
} | null => {
  const [base, suffix] = code.split(':')
  if (ERROR_CONTENT[base]) {
    return {
      content: ERROR_CONTENT[base],
      values: { check: VERIFY_CHECKS[suffix] ?? 'a final check' },
    }
  }
  // <STEP>_TIMEOUT from the move-day executor, e.g. EXPORT_TIMEOUT.
  if (code.endsWith('_TIMEOUT')) {
    return { content: ERROR_CONTENT.MOVE_INTERRUPTED, values: {} }
  }
  return null
}

const fill = (text: string, values: Record<string, string>): string =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '…')

/** Known code → spec message. Unknown or missing code → null. */
export const findMigrationError = (
  code?: string | null,
): IMigrationErrorContent | null => {
  if (!code) {
    return null
  }
  const found = lookup(code)
  return found
    ? {
        message: fill(found.content.message, found.values),
        recovery: fill(found.content.recovery, found.values),
      }
    : null
}

/**
 * Message for a failed call or outcome. Some platform errors (slot invalid,
 * rehearsal too old, wrong confirmation name) come as a 400 with only a
 * message, so that message is the fallback.
 */
export const describeMigrationError = (
  code?: string | null,
  message?: string | null,
): string => {
  const known = findMigrationError(code)
  if (known) {
    return `${known.message} ${known.recovery}`
  }
  return message || 'Something went wrong with the move. Please try again.'
}

/** Non-secret detail from a check, e.g. "found: 0.5.6 · required: 0.6.1". */
export const formatCheckDetail = (
  detail?: IPreflightCheck['detail'],
): string => {
  if (!detail) {
    return ''
  }
  return Object.entries(detail)
    .map(([key, value]) => {
      const text = Array.isArray(value) ? value.join(', ') : String(value)
      return `${key}: ${text}`
    })
    .join(' · ')
}
