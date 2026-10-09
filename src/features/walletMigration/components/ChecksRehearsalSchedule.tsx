'use client'

import { CheckCircle2, Circle, Loader2, RotateCw, XCircle } from 'lucide-react'
import { IMigration, MigrationResult } from '../types'
import React, { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepCard, StepState } from './StepCard'
import { getCheckError, getMigrationError } from '../errorMessages'
import {
  rerunPreflight,
  runRehearsal,
  scheduleMigration,
} from '@/app/api/walletMigration'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoveConfirmDialog } from './MoveConfirmDialog'
import { formatBtt } from '../config'

// Off-peak suggestions, Bhutan time (spec SCR-WM-04).
const SLOT_TIMES = [
  '21:00',
  '22:00',
  '23:00',
  '00:00',
  '01:00',
  '02:00',
  '05:00',
]

const DAY_MS = 86_400_000

const bttDate = (offsetDays: number): string => {
  const offsetMs = offsetDays * DAY_MS
  return new Date(Date.now() + offsetMs).toLocaleDateString('en-CA', {
    timeZone: 'Asia/Thimphu',
  })
}

const CheckIcon = ({ state }: { state: string }): React.JSX.Element => {
  if (state === 'passed') {
    return <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
  }
  if (state === 'failed') {
    return <XCircle className="text-destructive h-4 w-4" aria-hidden />
  }
  if (state === 'running') {
    return <Loader2 className="text-primary h-4 w-4 animate-spin" aria-hidden />
  }
  return <Circle className="text-muted-foreground h-4 w-4" aria-hidden />
}

const CHECK_STATE_LABEL: Record<string, string> = {
  passed: 'Passed',
  failed: 'Failed',
  running: 'Checking',
  waiting: 'Waiting',
}

const Reference = ({ id }: { id?: string }): React.JSX.Element | null => {
  if (!id) {
    return null
  }
  return <p className="text-muted-foreground mt-1 text-xs">Reference: {id}</p>
}

interface ChecksRehearsalScheduleProps {
  orgId: string
  orgName: string
  migration: IMigration
  isOwner: boolean
  onResult: (result: MigrationResult<IMigration>) => void
}

/** SCR-WM-04: checks, then rehearsal, then booking the move (P-01 cards). */
export function ChecksRehearsalSchedule({
  orgId,
  orgName,
  migration,
  isOwner,
  onResult,
}: Readonly<ChecksRehearsalScheduleProps>): React.JSX.Element {
  const [busy, setBusy] = useState<'checks' | 'rehearsal' | 'schedule' | null>(
    null,
  )
  const [date, setDate] = useState(bttDate(1))
  const [time, setTime] = useState(SLOT_TIMES[0])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const { status } = migration
  const checksPassed = !['PREFLIGHT_RUNNING', 'PREFLIGHT_FAILED'].includes(
    status,
  )
  const rehearsed = ['REHEARSED', 'SCHEDULED', 'FAILED'].includes(status)

  const checksState: StepState =
    status === 'PREFLIGHT_RUNNING'
      ? 'running'
      : status === 'PREFLIGHT_FAILED'
        ? 'failed'
        : 'done'
  const rehearsalState: StepState = !checksPassed
    ? 'locked'
    : status === 'REHEARSING'
      ? 'running'
      : status === 'REHEARSAL_FAILED'
        ? 'failed'
        : rehearsed
          ? 'done'
          : 'action'
  const scheduleState: StepState = !rehearsed
    ? 'locked'
    : status === 'SCHEDULED'
      ? 'done'
      : 'action'

  // Slot is entered in Bhutan time (UTC+6, no daylight saving).
  const scheduledFor = useMemo(
    () => new Date(`${date}T${time}:00+06:00`).toISOString(),
    [date, time],
  )
  const slotInPast = new Date(scheduledFor).getTime() <= Date.now()

  const run = async (
    kind: 'checks' | 'rehearsal',
    action: (id: string) => Promise<MigrationResult<IMigration>>,
  ): Promise<void> => {
    setBusy(kind)
    onResult(await action(orgId))
    setBusy(null)
  }

  const confirmSchedule = async (): Promise<void> => {
    setBusy('schedule')
    setScheduleError(null)
    const result = await scheduleMigration(orgId, scheduledFor)
    setBusy(null)
    if (!result.ok) {
      setScheduleError(getMigrationError(result.code).message)
      setConfirmOpen(false)
      return
    }
    setConfirmOpen(false)
    onResult(result)
  }

  const failedCheck = migration.preflight.find((c) => c.state === 'failed')
  const rehearsalError =
    status === 'REHEARSAL_FAILED'
      ? getMigrationError(migration.errorCode)
      : null

  return (
    <div className="space-y-4">
      <StepCard
        step={1}
        title="Checks"
        description="We check that your new agent is ready to receive the wallet."
        state={checksState}
      >
        <ul className="space-y-2">
          {migration.preflight.map((check) => (
            <li key={check.key} className="flex items-center gap-2 text-sm">
              <CheckIcon state={check.state} />
              <span className="flex-1">{check.label}</span>
              <span className="text-muted-foreground text-xs">
                {CHECK_STATE_LABEL[check.state]}
              </span>
            </li>
          ))}
        </ul>
        {failedCheck && (
          <div className="border-destructive/30 bg-destructive/5 mt-4 rounded-md border px-3 py-2.5 text-sm">
            <p className="font-medium">{getCheckError(failedCheck).message}</p>
            <p className="text-muted-foreground mt-1">
              {getCheckError(failedCheck).recovery}
            </p>
            {failedCheck.errorCode && (
              <p className="text-muted-foreground mt-1 text-xs">
                Reference: {failedCheck.errorCode}
              </p>
            )}
          </div>
        )}
        {isOwner && checksState !== 'running' && status !== 'SCHEDULED' && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={busy !== null}
            onClick={() => run('checks', rerunPreflight)}
          >
            {busy === 'checks' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCw className="mr-2 h-4 w-4" />
            )}
            Re-run checks
          </Button>
        )}
      </StepCard>

      <StepCard
        step={2}
        title="Rehearsal"
        description="A full practice export and import. It doesn't pause your organisation."
        state={rehearsalState}
      >
        {rehearsalState === 'locked' && (
          <p className="text-muted-foreground text-sm">
            Complete first: all checks must pass.
          </p>
        )}
        {rehearsalState === 'running' && (
          <p className="text-sm" aria-live="polite">
            Rehearsing. This doesn&apos;t pause your organisation.
          </p>
        )}
        {rehearsalError && (
          <div className="border-destructive/30 bg-destructive/5 rounded-md border px-3 py-2.5 text-sm">
            <p className="font-medium">{rehearsalError.message}</p>
            <p className="text-muted-foreground mt-1">
              {rehearsalError.recovery}
            </p>
            <Reference id={migration.referenceId} />
          </div>
        )}
        {migration.rehearsal && rehearsed && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Connections</dt>
              <dd className="font-medium">
                {migration.rehearsal.records.connections}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Credentials</dt>
              <dd className="font-medium">
                {migration.rehearsal.records.credentials}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Proofs</dt>
              <dd className="font-medium">
                {migration.rehearsal.records.proofs}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Measured duration</dt>
              <dd className="font-medium">
                {migration.rehearsal.durationMinutes} minutes
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Expected pause</dt>
              <dd className="font-medium">
                about {migration.rehearsal.predictedPauseMinutes} minutes
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Wallet download</dt>
              <dd className="font-medium">
                {migration.rehearsal.downloadMethod === 'direct'
                  ? 'Direct to your agent'
                  : 'Through the platform'}
              </dd>
            </div>
          </dl>
        )}
        {migration.rehearsal?.downloadMethod === 'platform' && (
          <p className="text-muted-foreground mt-2 text-sm">
            Your agent couldn&apos;t download the wallet file directly.
            We&apos;ll send it through the platform instead.
          </p>
        )}
        {isOwner &&
          (rehearsalState === 'action' || rehearsalState === 'failed') && (
            <Button
              size="sm"
              className="mt-4"
              disabled={busy !== null}
              onClick={() => run('rehearsal', runRehearsal)}
            >
              {busy === 'rehearsal' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {rehearsalState === 'failed'
                ? 'Run rehearsal again'
                : 'Run rehearsal'}
            </Button>
          )}
      </StepCard>

      <StepCard
        step={3}
        title="Schedule"
        description="Pick a quiet time. Issuing and verifying pause for the length of the move."
        state={scheduleState}
      >
        {scheduleState === 'locked' && (
          <p className="text-muted-foreground text-sm">
            Complete first: the rehearsal must finish.
          </p>
        )}
        {status === 'SCHEDULED' && migration.scheduledFor && (
          <p className="text-sm">
            Move scheduled for{' '}
            <span className="font-semibold">
              {formatBtt(migration.scheduledFor)}
            </span>
            . Final checks run before the switch, and if any fails, the move
            cancels itself and nothing changes.
          </p>
        )}
        {scheduleState === 'action' && (
          <>
            {migration.rehearsal && (
              <p className="mb-3 text-sm">
                Expected pause: about{' '}
                <span className="font-semibold">
                  {migration.rehearsal.predictedPauseMinutes} minutes
                </span>
                .
              </p>
            )}
            {isOwner ? (
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="moveDate">Date</Label>
                  <Input
                    id="moveDate"
                    type="date"
                    value={date}
                    min={bttDate(0)}
                    max={bttDate(14)}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-44"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="moveTime">Time (BTT)</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger id="moveTime" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOT_TIMES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  disabled={busy !== null || slotInPast}
                  onClick={() => setConfirmOpen(true)}
                >
                  {status === 'FAILED' ? 'Reschedule' : 'Schedule move'}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                The organisation owner schedules the move.
              </p>
            )}
            {slotInPast && (
              <p className="text-destructive mt-2 text-sm">
                Pick a time in the future.
              </p>
            )}
            {scheduleError && (
              <p className="text-destructive mt-2 text-sm">{scheduleError}</p>
            )}
          </>
        )}
      </StepCard>

      <MoveConfirmDialog
        open={confirmOpen}
        orgName={orgName}
        scheduledFor={scheduledFor}
        loading={busy === 'schedule'}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmSchedule}
      />
    </div>
  )
}
