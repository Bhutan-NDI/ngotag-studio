'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Circle, Loader2, WifiOff, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IMigration } from '../types'
import { MOVE_DAY_STEPS } from '../config'
import { getMigrationError } from '../errorMessages'

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

interface MoveDayProgressProps {
  migration: IMigration
  isOwner: boolean
  onReschedule: () => void
  onOpenDashboard: () => void
}

/**
 * SCR-WM-05: live progress during the pause. There is deliberately no cancel
 * button once the move starts; the server aborts on its own (UXD-05).
 */
export function MoveDayProgress({
  migration,
  isOwner,
  onReschedule,
  onOpenDashboard,
}: Readonly<MoveDayProgressProps>): React.JSX.Element {
  const online = useOnline()
  const { status, moveDay } = migration
  const failed = status === 'FAILED'
  const finished = !failed && !['FROZEN', 'CUTOVER'].includes(status)
  const current = moveDay?.currentStep ?? 0
  const error = failed
    ? getMigrationError(migration.errorCode, {
        check: moveDay?.failedCheck ?? 'a final check',
      })
    : null

  const stepState = (i: number): 'done' | 'running' | 'failed' | 'waiting' => {
    if (finished || i < current) {
      return 'done'
    }
    if (i === current) {
      return failed ? 'failed' : 'running'
    }
    return 'waiting'
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

      <div aria-live="polite" className="mt-2">
        {!finished && !failed && (
          <p className="text-muted-foreground text-sm">
            Citizens&apos; messages are being held safely.
          </p>
        )}
        {moveDay && !finished && (
          <p className="mt-1 text-sm font-medium">
            Elapsed {moveDay.elapsedMinutes} min of expected{' '}
            {moveDay.expectedMinutes} (limit {moveDay.limitMinutes})
          </p>
        )}
      </div>

      <ol className="mt-5 space-y-3">
        {MOVE_DAY_STEPS.map((label, i) => {
          const state = stepState(i)
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              {state === 'done' && (
                <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />
              )}
              {state === 'running' && (
                <Loader2
                  className="text-primary h-5 w-5 animate-spin"
                  aria-hidden
                />
              )}
              {state === 'failed' && (
                <XCircle className="text-destructive h-5 w-5" aria-hidden />
              )}
              {state === 'waiting' && (
                <Circle className="text-muted-foreground h-5 w-5" aria-hidden />
              )}
              <span className={state === 'running' ? 'font-semibold' : ''}>
                {label}
              </span>
              <span className="text-muted-foreground ml-auto text-xs">
                {state === 'done'
                  ? 'Done'
                  : state === 'running'
                    ? 'In progress'
                    : state === 'failed'
                      ? 'Failed'
                      : 'Waiting'}
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

      {error && (
        <div className="border-destructive/30 bg-destructive/5 mt-6 rounded-md border px-4 py-3 text-sm">
          <p className="font-medium">{error.message}</p>
          <p className="text-muted-foreground mt-1">
            Your organisation is back on the shared agent. {error.recovery}
          </p>
          {migration.referenceId && (
            <p className="text-muted-foreground mt-1 text-xs">
              Reference: {migration.referenceId}
            </p>
          )}
          {isOwner && (
            <Button size="sm" className="mt-3" onClick={onReschedule}>
              Reschedule
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
