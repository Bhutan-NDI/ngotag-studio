'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  WifiOff,
  XCircle,
} from 'lucide-react'
import {
  DEADLINE_STATUSES,
  MOVE_DAY_STEPS,
  PAUSED_STATUSES,
  failedMoveDayStep,
  formatBtt,
  isCutoverStuck,
} from '../config'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IMigration } from '../types'
import { findMigrationError } from '../errorMessages'

const useOnline = (): boolean => {
  const [online, setOnline] = useState(true)
  useEffect(() => {
    const update = (): void => setOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return online
}

type StepView = 'done' | 'running' | 'stuck' | 'failed' | 'waiting'

interface MoveDayProgressProps {
  migration: IMigration
  isOwner: boolean
  onStartNewMove: () => void
  onOpenDashboard: () => void
}

/**
 * SCR-WM-05: live progress during the pause. There is deliberately no cancel
 * button once the move starts; before the switch the platform aborts on its
 * own (UXD-05), and after it the platform only finishes. A failed move is
 * final: recovering means starting a new move.
 */
export function MoveDayProgress({
  migration,
  isOwner,
  onStartNewMove,
  onOpenDashboard,
}: Readonly<MoveDayProgressProps>): React.JSX.Element {
  const online = useOnline()
  const { status, error } = migration
  const failed = status === 'FAILED'
  const running = PAUSED_STATUSES.includes(status)
  const finished = !failed && !running
  const beforeSwitch = DEADLINE_STATUSES.includes(status)
  const stuck = isCutoverStuck(migration)
  const current = failed
    ? failedMoveDayStep(error)
    : MOVE_DAY_STEPS.findIndex((step) => step.status === status)
  const failure = failed ? findMigrationError(error) : null
  const stuckContent = stuck ? findMigrationError(error) : null

  const stepView = (i: number): StepView => {
    if (finished) {
      return 'done'
    }
    if (failed) {
      // Unknown step (e.g. the time limit): mark nothing as failed.
      if (current < 0) {
        return 'waiting'
      }
      return i < current ? 'done' : i === current ? 'failed' : 'waiting'
    }
    if (i === current) {
      return stuck ? 'stuck' : 'running'
    }
    return i < current ? 'done' : 'waiting'
  }

  const label: Record<StepView, string> = {
    done: 'Done',
    running: 'In progress',
    stuck: 'Taking longer than expected',
    failed: 'Failed',
    waiting: 'Waiting',
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Move day</h2>

      {!online && (
        <Alert className="mt-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Connection lost. The move continues on the server. This page will
            update when you&apos;re back online.
          </AlertDescription>
        </Alert>
      )}

      {running && !stuck && (
        <div aria-live="polite" className="mt-2 space-y-1 text-sm">
          <p className="text-muted-foreground">
            Citizens&apos; messages are being held safely.
          </p>
          {status === 'CUTOVER' && (
            <p>
              Your organisation is switching to its new agent. This last step
              always finishes, and issuing and verifying resume as soon as
              it&apos;s done.
            </p>
          )}
          {migration.predictedFreezeMs !== null && (
            <p>
              Expected pause: about{' '}
              <span className="font-medium">
                {Math.max(1, Math.round(migration.predictedFreezeMs / 60_000))}{' '}
                minutes
              </span>
              .
            </p>
          )}
          {beforeSwitch && migration.freezeDeadline && (
            <p>
              If it isn&apos;t finished by{' '}
              <span className="font-medium">
                {formatBtt(migration.freezeDeadline, false)}
              </span>
              , it cancels itself and nothing changes.
            </p>
          )}
        </div>
      )}

      {stuck && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
        >
          <p className="font-medium">{stuckContent?.message}</p>
          <p className="mt-1">{stuckContent?.recovery}</p>
          <p className="mt-1">
            Citizens&apos; messages are being held safely. You don&apos;t need
            to do anything.
          </p>
          {error && <p className="mt-1 text-xs">Reference: {error}</p>}
        </div>
      )}

      <ol className="mt-5 space-y-3">
        {MOVE_DAY_STEPS.map((step, i) => {
          const view = stepView(i)
          return (
            <li key={step.status} className="flex items-center gap-3 text-sm">
              {view === 'done' && (
                <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />
              )}
              {view === 'running' && (
                <Loader2
                  className="text-primary h-5 w-5 animate-spin"
                  aria-hidden
                />
              )}
              {view === 'stuck' && (
                <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
              )}
              {view === 'failed' && (
                <XCircle className="text-destructive h-5 w-5" aria-hidden />
              )}
              {view === 'waiting' && (
                <Circle className="text-muted-foreground h-5 w-5" aria-hidden />
              )}
              <span
                className={
                  view === 'running' || view === 'stuck' ? 'font-semibold' : ''
                }
              >
                {step.label}
              </span>
              <span className="text-muted-foreground ml-auto text-xs">
                {label[view]}
              </span>
            </li>
          )
        })}
      </ol>

      {finished && (
        <div className="mt-6 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
          Your organisation now runs on its own agent. Issuing and verifying are
          available again. For the next 48 hours a backup stays on our side,
          then your citizens&apos; connections start updating automatically.
          <div className="mt-3">
            <Button size="sm" onClick={onOpenDashboard}>
              Go to move dashboard
            </Button>
          </div>
        </div>
      )}

      {failed && (
        <div className="border-destructive/30 bg-destructive/5 mt-6 rounded-md border px-4 py-3 text-sm">
          <p className="font-medium">
            {failure?.message ??
              "The move couldn't be completed and was cancelled automatically."}
          </p>
          <p className="text-muted-foreground mt-1">
            Your organisation is back on the shared agent.{' '}
            {failure?.recovery ??
              'Nothing changed. Start a new move when ready.'}
          </p>
          {error && (
            <p className="text-muted-foreground mt-1 text-xs">
              Reference: {error}
            </p>
          )}
          {isOwner && (
            <Button size="sm" className="mt-3" onClick={onStartNewMove}>
              Start a new move
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
