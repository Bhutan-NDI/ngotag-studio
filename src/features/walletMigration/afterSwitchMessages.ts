// Problems the platform notes in a move's `error` after the switch. During
// the first 48 hours that is a webhook check or, once the window has ended,
// SWITCHOVER_DEFERRED:<blocker> while the switch-over is held back. While
// connections update it is an agent, purge or rotation problem. A webhook
// problem the switch-over went ahead with stays on the move, through to
// COMPLETED. The platform clears each one once it's resolved.

export interface IAfterSwitchIssue {
  message: string
  recovery: string
  /** The owner has to fix something on their agent; otherwise it's ours. */
  ownerAction: boolean
  /** What connection updates wait for, while the switch-over is held back. */
  waitingFor: string
}

const OURS = "We're looking into it. You don't need to do anything."

const WEBHOOKS = 'webhooks from your agent to reach us'

const ISSUES: Record<string, IAfterSwitchIssue> = {
  // Webhook check (the owner's agent)
  WEBHOOK_NOT_CONFIGURED: {
    message: "Your new agent's webhook address isn't set.",
    recovery: "Set your agent's webhook address to {webhookUrl}.",
    ownerAction: true,
    waitingFor: WEBHOOKS,
  },
  WEBHOOK_UNREACHABLE: {
    message: "Webhooks from your new agent aren't reaching our platform.",
    recovery:
      "Check that your agent's webhook address is {webhookUrl} and that its firewall lets it reach us.",
    ownerAction: true,
    waitingFor: WEBHOOKS,
  },
  WEBHOOK_REJECTED: {
    message: 'Our platform is rejecting webhooks from your new agent.',
    recovery:
      "Check that your agent's webhook address is exactly {webhookUrl}.",
    ownerAction: true,
    waitingFor: WEBHOOKS,
  },
  WEBHOOK_PROBE_UNSUPPORTED: {
    message: "Your new agent's release can't run the webhook check.",
    recovery: 'Install the required agent release.',
    ownerAction: true,
    waitingFor: 'your agent to run the required release',
  },
  WEBHOOK_CHECK_BUSY: {
    message: 'A webhook check is already running.',
    recovery: OURS,
    ownerAction: false,
    waitingFor: 'a webhook check to finish',
  },
  // The owner's agent
  DEDICATED_AGENT_UNREACHABLE: {
    message: "We can't reach your new agent's admin address.",
    recovery:
      'Check that the agent is running and that its firewall still allows our IP addresses.',
    ownerAction: true,
    waitingFor: 'your agent to be reachable',
  },
  DEDICATED_AGENT_NOT_READY: {
    message: "Your new agent is running but hasn't finished starting up.",
    recovery: "Check the agent's logs, and restart it if it stays like this.",
    ownerAction: true,
    waitingFor: 'your agent to finish starting up',
  },
  // Platform side
  DEDICATED_AGENT_UNAVAILABLE: {
    message: "We can't use your new agent's connection details just now.",
    recovery: OURS,
    ownerAction: false,
    waitingFor: "your agent's connection details",
  },
  SHARED_AGENT_UNAVAILABLE: {
    message: 'The shared agent is temporarily unavailable.',
    recovery: OURS,
    ownerAction: false,
    waitingFor: 'the shared agent to be available',
  },
  RELAY_NOT_FORWARDING: {
    message: "Message forwarding to your new agent isn't confirmed.",
    recovery: OURS,
    ownerAction: false,
    waitingFor: 'message forwarding to be confirmed',
  },
  PURGE_FAILED: {
    message:
      "Removing your wallet's old copy from the shared agent didn't work yet. It's being retried.",
    recovery: OURS,
    ownerAction: false,
    waitingFor: "the old copy's removal",
  },
  PURGE_REFUSED: {
    message:
      "The shared agent hasn't let us remove your wallet's old copy yet. It's being retried.",
    recovery: OURS,
    ownerAction: false,
    waitingFor: "the old copy's removal",
  },
  ROTATION_START_FAILED: {
    message: "Connection updates couldn't start yet. They're being retried.",
    recovery: OURS,
    ownerAction: false,
    waitingFor: 'connection updates to start',
  },
  ROTATION_STATUS_UNAVAILABLE: {
    message: "We couldn't get the latest connection update progress.",
    recovery: OURS,
    ownerAction: false,
    waitingFor: 'connection update progress',
  },
  ROTATION_STALLED: {
    message: "Some connections haven't answered the update for several days.",
    recovery:
      "These are usually phones that are offline or no longer have the app, and their connections keep working through message forwarding. We're looking into it. You don't need to do anything.",
    ownerAction: false,
    waitingFor: 'connections to answer',
  },
}

const UNKNOWN: IAfterSwitchIssue = {
  message: 'Something needs attention on your move.',
  recovery: OURS,
  ownerAction: false,
  waitingFor: 'a problem to be resolved',
}

export interface IAfterSwitchProblem extends IAfterSwitchIssue {
  /** SWITCHOVER_DEFERRED: the switch-over is held back by this problem. */
  deferred: boolean
}

/**
 * The problem in a move's `error` after the switch, worded for the owner,
 * with the webhook address filled in. Null when there's none.
 */
export const describeAfterSwitch = (
  error: string | null | undefined,
  webhookUrl: string,
): IAfterSwitchProblem | null => {
  if (!error) {
    return null
  }
  const deferred = error.startsWith('SWITCHOVER_DEFERRED:')
  const code = deferred ? error.slice('SWITCHOVER_DEFERRED:'.length) : error
  // PURGE_REFUSED:<agent reason> shares its base's text.
  const issue = ISSUES[code] ?? ISSUES[code.split(':')[0]] ?? UNKNOWN
  return {
    ...issue,
    recovery: issue.recovery.replace('{webhookUrl}', webhookUrl),
    deferred,
  }
}
