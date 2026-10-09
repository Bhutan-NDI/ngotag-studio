import { IPreflightCheck, MigrationErrorCode } from './types'

export interface IMigrationErrorContent {
  message: string
  recovery: string
}

// UX spec §3.5. The raw code is only ever shown next to this text as a
// support reference (spec §2.4), never on its own.
const ERROR_CONTENT: Record<MigrationErrorCode, IMigrationErrorContent> = {
  TARGET_NOT_PRISTINE: {
    message:
      'Your new agent already contains wallet data. A move needs a freshly installed agent.',
    recovery: 'Reinstall the agent with an empty wallet, then re-run checks.',
  },
  STORAGE_VERSION_MISMATCH: {
    message:
      'Your agent runs a different version ({found}) from the one required ({required}).',
    recovery: 'Update the agent, then re-run checks.',
  },
  AGENT_UNREACHABLE: {
    message:
      "We couldn't reach your agent's admin address, or the API key was not accepted.",
    recovery:
      'Check the address, API key, firewall allow-list and certificate, then re-run checks.',
  },
  PUBLIC_ENDPOINT_UNREACHABLE: {
    message:
      "Citizens' wallets wouldn't be able to reach your agent's public address.",
    recovery:
      'Check that the public DIDComm address is reachable over HTTPS with a valid certificate.',
  },
  STEP_UP_REQUIRED: {
    message: 'Please sign in again to start the move.',
    recovery: 'Sign in, then start the move.',
  },
  ORG_BULK_JOB_ACTIVE: {
    message:
      'A bulk issuance is still running for this organisation. You can schedule the move once it finishes.',
    recovery: 'Re-run checks once the bulk issuance has finished.',
  },
  UNSUPPORTED_FEATURES: {
    message:
      "This organisation uses features that can't be moved yet (OpenID4VC or AnonCreds).",
    recovery: 'Contact support.',
  },
  RELAY_WS_UNSUPPORTED: {
    message:
      "This organisation's connections use a connection type that can't be moved yet.",
    recovery: 'Contact support.',
  },
  RELAY_REQUIRES_SHARED_REDIS: {
    message: "The platform isn't ready to run moves right now.",
    recovery: 'Try again later. Platform admins have been notified.',
  },
  EXPORT_FAILED: {
    message: "The rehearsal didn't finish. Nothing was changed.",
    recovery: 'Run the rehearsal again. Contact support if it repeats.',
  },
  IMPORT_FAILED: {
    message: "The rehearsal didn't finish. Nothing was changed.",
    recovery: 'Run the rehearsal again. Contact support if it repeats.',
  },
  BUDGET_EXCEEDED: {
    message:
      'The move took longer than the time limit and was cancelled automatically. Nothing changed.',
    recovery: 'Reschedule the move. Consider a longer slot.',
  },
  CUTOVER_FAILED: {
    message:
      "The move couldn't be completed and was cancelled automatically. Nothing changed.",
    recovery: 'Reschedule the move, or contact support.',
  },
  VERIFICATION_FAILED: {
    message:
      "Your new agent didn't pass the final checks ({check}), so the move was cancelled automatically. Nothing changed.",
    recovery: 'Fix the named item on your server, then reschedule.',
  },
  ORG_AGENT_MIGRATING: {
    message:
      'Issuing and verifying are paused while your organisation moves to its own agent.',
    recovery: 'View move progress.',
  },
  MIGRATION_ALREADY_EXISTS: {
    message: 'A move is already in progress for this organisation.',
    recovery: 'View move progress.',
  },
}

const FALLBACK: IMigrationErrorContent = {
  message: 'Something went wrong with the move. Nothing was changed.',
  recovery: 'Try again, or contact support.',
}

const fill = (text: string, values?: Record<string, string>): string =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => values?.[key] ?? '…')

export const getMigrationError = (
  code?: string,
  values?: Record<string, string>,
): IMigrationErrorContent => {
  const content = ERROR_CONTENT[code as MigrationErrorCode] ?? FALLBACK
  return {
    message: fill(content.message, values),
    recovery: fill(content.recovery, values),
  }
}

export const getCheckError = (check: IPreflightCheck): IMigrationErrorContent =>
  getMigrationError(check.errorCode, check.detail)
