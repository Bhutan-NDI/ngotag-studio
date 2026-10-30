'use client'

import { AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react'
import {
  IAfterSwitchProblem,
  describeAfterSwitch,
} from '../afterSwitchMessages'
import { completedTime, formatBtt, hoursUntil, webhookUrlFor } from '../config'

import { Card } from '@/components/ui/card'
import { IMigration } from '../types'
import React from 'react'

const Segment = ({
  label,
  value,
  total,
  className,
}: {
  label: string
  value: number
  total: number
  className: string
}): React.JSX.Element | null => {
  if (value <= 0 || total <= 0) {
    return null
  }
  return (
    <div
      className={className}
      style={{ width: `${(value / total) * 100}%` }}
      title={`${label}: ${value}`}
    />
  )
}

/**
 * The platform's rotation buckets (total, pending, retrying, failed, waiting,
 * stale, refused, updated), grouped the way the spec words them.
 */
const connectionCounts = (
  counts: Record<string, number> | undefined,
): {
  updated: number
  waiting: number
  refused: number
  inactive: number
  failed: number
  total: number
} | null => {
  if (!counts) {
    return null
  }
  const n = (key: string): number => counts[key] ?? 0
  const grouped = {
    updated: n('updated'),
    waiting: n('pending') + n('retrying') + n('waiting'),
    refused: n('refused'),
    inactive: n('stale'),
    failed: n('failed'),
  }
  const sum =
    grouped.updated +
    grouped.waiting +
    grouped.refused +
    grouped.inactive +
    grouped.failed
  return { ...grouped, total: n('total') || sum }
}

/**
 * A problem the platform noted after the switch. The owner's to fix (their
 * agent or its webhooks) in amber; ours in a quieter note.
 */
const ProblemNotice = ({
  problem,
  code,
  wentAhead,
}: {
  problem: IAfterSwitchProblem
  code: string
  wentAhead: boolean
}): React.JSX.Element => (
  <div
    role="status"
    className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
      problem.ownerAction
        ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300'
        : 'bg-muted/40 text-foreground'
    }`}
  >
    {problem.ownerAction ? (
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
    ) : (
      <Info
        className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0"
        aria-hidden
      />
    )}
    <div className="min-w-0">
      <p className="font-medium">{problem.message}</p>
      {wentAhead && (
        <p className="mt-1">
          The move went ahead without them after waiting, so this still needs
          fixing.
        </p>
      )}
      <p className="mt-1">{problem.recovery}</p>
      <p className="mt-1 text-xs opacity-80">Reference: {code}</p>
    </div>
  </div>
)

/**
 * SCR-WM-06: first 48 hours, updating connections, moved. Read-only for
 * everyone; there is no switch-back (problems are fixed forward). Shows only
 * what the platform records.
 */
export function MoveDashboard({
  migration,
}: Readonly<{ migration: IMigration }>): React.JSX.Element {
  const { status, error } = migration
  const counts = connectionCounts(migration.rotation?.counts)
  const problem = describeAfterSwitch(error, webhookUrlFor(migration.orgId))
  const windowEnded =
    migration.stabilisationEndsAt !== null &&
    Date.parse(migration.stabilisationEndsAt) <= Date.now()
  // A webhook problem the switch-over went ahead with stays on the move.
  const wentAhead =
    status !== 'STABILISING' && Boolean(error?.startsWith('WEBHOOK_'))
  const notice =
    problem && error ? (
      <ProblemNotice problem={problem} code={error} wentAhead={wentAhead} />
    ) : null
  const completedAt = completedTime(migration)

  const phases = [
    { key: 'STABILISING', label: 'First 48 hours' },
    { key: 'ROTATING', label: 'Updating connections' },
    { key: 'COMPLETED', label: 'Moved' },
  ]
  const activeIndex = phases.findIndex((p) => p.key === status)

  if (status === 'DISASTER_RESTORED') {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 text-amber-600"
            aria-hidden
          />
          <div>
            <h2 className="text-xl font-semibold">
              Restored to the shared agent
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Your organisation was restored to the shared agent after its own
              agent was lost. Activity on the new agent since the move
              couldn&apos;t be recovered, and citizens who connected since then
              need to reconnect. Please contact support.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6" aria-live="polite">
      <h2 className="text-xl font-semibold">Move dashboard</h2>

      <ol className="mt-4 flex flex-wrap gap-2 text-xs">
        {phases.map((phase, i) => (
          <li
            key={phase.key}
            className={`rounded-full border px-3 py-1 ${
              i === activeIndex
                ? 'border-primary bg-primary/10 text-primary font-semibold'
                : i < activeIndex
                  ? 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400'
                  : 'text-muted-foreground'
            }`}
            aria-current={i === activeIndex ? 'step' : undefined}
          >
            {i < activeIndex ? '✓ ' : ''}
            {phase.label}
          </li>
        ))}
      </ol>

      {status === 'STABILISING' && (
        <div className="mt-5 space-y-4">
          {windowEnded ? (
            <p className="text-sm">
              <span className="font-semibold">
                The first 48 hours are over.
              </span>{' '}
              {problem?.deferred
                ? `Connection updates are waiting for ${problem.waitingFor}.`
                : "Your citizens' connections start updating shortly."}
            </p>
          ) : (
            <p className="text-sm">
              <span className="font-semibold">
                {migration.stabilisationEndsAt
                  ? hoursUntil(migration.stabilisationEndsAt)
                  : 48}{' '}
                hours left
              </span>
              {migration.stabilisationEndsAt &&
                ` (until ${formatBtt(migration.stabilisationEndsAt)})`}
              . After that, your citizens&apos; connections start updating
              automatically.
            </p>
          )}
          {notice}
          <div className="flex items-center gap-2 text-sm">
            {migration.webhookConfirmedAt ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
                <span>
                  Webhooks from your agent confirmed{' '}
                  {formatBtt(migration.webhookConfirmedAt)}
                </span>
              </>
            ) : (
              <>
                <Clock className="text-muted-foreground h-4 w-4" aria-hidden />
                <span>Waiting for the first webhook from your agent</span>
              </>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            If something isn&apos;t working, contact support. Problems are fixed
            on your new agent.
          </p>
        </div>
      )}

      {(status === 'ROTATING' || status === 'COMPLETED') && (
        <div className="mt-5 space-y-3">
          {notice}
          {status === 'COMPLETED' && (
            <p className="text-sm">
              Your organisation now runs on its own agent
              {completedAt ? ` (moved ${formatBtt(completedAt)})` : ''}. Message
              forwarding stays on, so citizens whose phones were offline can
              still reach you when they return.
            </p>
          )}
          {counts && counts.total > 0 ? (
            <>
              <div
                className="bg-muted flex h-3 w-full overflow-hidden rounded-full"
                role="img"
                aria-label={`${counts.updated} updated, ${counts.waiting} waiting, ${counts.refused} refused, ${counts.inactive} inactive`}
              >
                <Segment
                  label="Updated"
                  value={counts.updated}
                  total={counts.total}
                  className="bg-green-500"
                />
                <Segment
                  label="Refused"
                  value={counts.refused}
                  total={counts.total}
                  className="bg-destructive"
                />
                <Segment
                  label="Inactive"
                  value={counts.inactive}
                  total={counts.total}
                  className="bg-amber-400"
                />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd className="font-medium">{counts.updated}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Waiting</dt>
                  <dd className="font-medium">{counts.waiting}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Refused</dt>
                  <dd className="font-medium">{counts.refused}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Inactive (30 days)</dt>
                  <dd className="font-medium">{counts.inactive}</dd>
                </div>
              </dl>
              {status === 'ROTATING' && (
                <p className="text-muted-foreground text-sm">
                  Phones that are offline get the update when they next open the
                  app.
                </p>
              )}
              {counts.refused > 0 && (
                <p className="text-muted-foreground text-sm">
                  {counts.refused} connections refused the update. They&apos;ll
                  keep working through message forwarding.
                </p>
              )}
              {counts.inactive > 0 && (
                <p className="text-muted-foreground text-sm">
                  {counts.inactive} connections haven&apos;t responded in 30
                  days. These citizens may be offline, or may have removed the
                  connection or the app. Their connections keep working through
                  message forwarding.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Connection update progress will appear here shortly.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
