'use client'

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { formatBtt, hoursUntil } from '../config'

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
  if (value <= 0) {
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
 * SCR-WM-06: first 48 hours, updating connections, moved. Read-only for
 * everyone; there is no switch-back (problems are fixed forward).
 */
export function MoveDashboard({
  migration,
}: Readonly<{ migration: IMigration }>): React.JSX.Element {
  const { status, connections } = migration
  const total = connections
    ? connections.updated +
      connections.waiting +
      connections.refused +
      connections.inactive
    : 0

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
          <ul className="space-y-2">
            {(migration.healthChecks ?? []).map((check) => (
              <li key={check.key} className="flex items-center gap-2 text-sm">
                {check.ok ? (
                  <CheckCircle2
                    className="h-4 w-4 text-green-600"
                    aria-hidden
                  />
                ) : (
                  <XCircle className="text-destructive h-4 w-4" aria-hidden />
                )}
                <span className="flex-1">{check.label}</span>
                <span className="text-muted-foreground text-xs">
                  {check.ok ? 'Healthy' : 'Problem'}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm">
            If something isn&apos;t working, contact support. Problems are fixed
            on your new agent.
          </p>
        </div>
      )}

      {(status === 'ROTATING' || status === 'COMPLETED') &&
        connections &&
        total > 0 && (
          <div className="mt-5 space-y-3">
            {status === 'COMPLETED' && (
              <p className="text-sm">
                Your organisation now runs on its own agent. Message forwarding
                stays on, so citizens whose phones were offline can still reach
                you when they return.
              </p>
            )}
            <div
              className="bg-muted flex h-3 w-full overflow-hidden rounded-full"
              role="img"
              aria-label={`${connections.updated} updated, ${connections.waiting} waiting, ${connections.refused} refused, ${connections.inactive} inactive`}
            >
              <Segment
                label="Updated"
                value={connections.updated}
                total={total}
                className="bg-green-500"
              />
              <Segment
                label="Refused"
                value={connections.refused}
                total={total}
                className="bg-destructive"
              />
              <Segment
                label="Inactive"
                value={connections.inactive}
                total={total}
                className="bg-amber-400"
              />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">{connections.updated}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Waiting</dt>
                <dd className="font-medium">{connections.waiting}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Refused</dt>
                <dd className="font-medium">{connections.refused}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Inactive (30 days)</dt>
                <dd className="font-medium">{connections.inactive}</dd>
              </div>
            </dl>
            {status === 'ROTATING' && (
              <p className="text-muted-foreground text-sm">
                Phones that are offline get the update when they next open the
                app.
              </p>
            )}
            {connections.refused > 0 && (
              <p className="text-muted-foreground text-sm">
                {connections.refused} connections refused the update.
                They&apos;ll keep working through message forwarding.
              </p>
            )}
            {connections.inactive > 0 && (
              <p className="text-muted-foreground text-sm">
                {connections.inactive} connections haven&apos;t responded in 30
                days. These citizens may be offline, or may have removed the
                connection or the app. Their connections keep working through
                message forwarding.
              </p>
            )}
            {status === 'COMPLETED' &&
              migration.forwardedLast30Days !== undefined && (
                <p className="text-sm">
                  Messages forwarded in the last 30 days:{' '}
                  <span className="font-semibold">
                    {migration.forwardedLast30Days}
                  </span>
                </p>
              )}
          </div>
        )}
    </Card>
  )
}
