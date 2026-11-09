'use client'

import { BookedSlot, PutBackNotice } from './ScheduleParts'
import { Busy, stepStates } from './stepStates'
import { CHECK_LABELS, describeMigrationError } from '../errorMessages'
import { CHECK_STATUS_LABEL, CheckIcon, Failure } from './PreflightParts'
import { IMigration, MigrationResult } from '../types'
import { Loader2, RotateCw } from 'lucide-react'
import {
  REHEARSAL_MAX_AGE_DAYS,
  formatBtt,
  isPutBack,
  isRehearsalStale,
  isRehearsed,
} from '../config'
import React, { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  rerunPreflight,
  runRehearsal,
  scheduleMigration,
} from '@/app/api/walletMigration'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoveConfirmDialog } from './MoveConfirmDialog'
import { StepCard } from './StepCard'

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

const minutes = (ms: number | null): string => {
  if (ms === null) {
    return '—'
  }
  return `${Math.max(1, Math.round(ms / 60_000))} minutes`
}

// Failed checks that need something from the owner on the re-run.
const NEEDS_API_KEY = ['API_KEY_REQUIRED', 'AGENT_TOKEN_REJECTED']

interface ChecksRehearsalScheduleProps {
  orgId: string
  orgName: string
  migration: IMigration
  isOwner: boolean
  onResult: (migration: IMigration) => void
}

/** SCR-WM-04: checks, then rehearsal, then booking the move (P-01 cards). */
export function ChecksRehearsalSchedule({
  orgId,
  orgName,
  migration,
  isOwner,
  onResult,
}: Readonly<ChecksRehearsalScheduleProps>): React.JSX.Element {
  const [busy, setBusy] = useState<Busy | null>(null)
  const [date, setDate] = useState(bttDate(1))
  const [time, setTime] = useState(SLOT_TIMES[0])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [changingSlot, setChangingSlot] = useState(false)
  const [actionError, setActionError] = useState<{
    kind: Busy
    message: string
  } | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [backupsConfirmed, setBackupsConfirmed] = useState(false)

  const { status, preflight } = migration
  const failedChecks =
    preflight?.checks.filter((c) => c.status === 'FAIL') ?? []
  const needsApiKey = failedChecks.some((c) =>
    NEEDS_API_KEY.includes(c.code ?? ''),
  )
  const needsBackups = failedChecks.some(
    (c) => c.code === 'BACKUPS_NOT_CONFIRMED',
  )
  const rehearsed = isRehearsed(status)
  const scheduled = status === 'SCHEDULED'
  const putBack = isPutBack(migration)
  const checksPassed = Boolean(preflight?.passed)
  const rehearsalStale =
    status === 'REHEARSED' &&
    migration.rehearsalStatus !== 'RUNNING' &&
    isRehearsalStale(migration)
  // Checks can fail again after the rehearsal (the final checks at the slot);
  // they must pass before a new time is booked. The platform re-runs them in
  // any status before the move starts.
  const changing = changingSlot && checksPassed
  const canRerunChecks =
    status === 'CREATED' || (rehearsed && (putBack || !checksPassed))
  const rehearsalFinished = migration.rehearsal?.finishedAt
  const maxAgeMs = REHEARSAL_MAX_AGE_DAYS * DAY_MS
  const bookBy = rehearsalFinished
    ? new Date(rehearsalFinished).getTime() + maxAgeMs
    : null

  let lockedReason = 'Complete first: the rehearsal must finish.'
  if (rehearsed && !checksPassed) {
    lockedReason = 'Complete first: all checks must pass again.'
  } else if (rehearsalStale) {
    lockedReason = `Complete first: run the rehearsal again. The last one is more than ${REHEARSAL_MAX_AGE_DAYS} days old.`
  }

  const { checksState, rehearsalState, scheduleState } = stepStates(
    migration,
    busy,
    changing,
  )

  // Slot is entered in Bhutan time (UTC+6, no daylight saving).
  const slotTime = useMemo(
    () => new Date(`${date}T${time}:00+06:00`).getTime(),
    [date, time],
  )
  const slotValid = Boolean(date) && !Number.isNaN(slotTime)
  const scheduledFor = slotValid ? new Date(slotTime).toISOString() : ''
  const slotInPast = slotValid && slotTime <= Date.now()
  // YYYY-MM-DD strings compare correctly as text.
  const slotTooFar = slotValid && date > bttDate(14)
  // The platform measures the rehearsal's age at the slot.
  const slotAfterRehearsalLimit =
    slotValid && bookBy !== null && slotTime > bookBy
  let slotError: string | null = null
  if (!slotValid) {
    slotError = 'Pick a date.'
  } else if (slotInPast) {
    slotError = 'Pick a time in the future.'
  } else if (slotTooFar) {
    slotError = 'Pick a date within the next 14 days.'
  } else if (slotAfterRehearsalLimit && bookBy !== null) {
    slotError = `Pick a time before ${formatBtt(new Date(bookBy).toISOString())}, when your rehearsal turns ${REHEARSAL_MAX_AGE_DAYS} days old, or run the rehearsal again.`
  }

  const fail = (
    kind: Busy,
    result: MigrationResult<unknown> & { ok: false },
  ): void =>
    setActionError({
      kind,
      message: describeMigrationError(result.code, result.message),
    })

  const runChecks = async (): Promise<void> => {
    setBusy('checks')
    setActionError(null)
    const result = await rerunPreflight(orgId, {
      ...(apiKey ? { apiKey } : {}),
      ...(backupsConfirmed ? { backupsConfirmed: true } : {}),
    })
    setBusy(null)
    setApiKey('')
    if (!result.ok) {
      fail('checks', result)
      return
    }
    onResult(result.data.migration)
  }

  const rehearse = async (): Promise<void> => {
    setBusy('rehearsal')
    setActionError(null)
    const result = await runRehearsal(orgId)
    setBusy(null)
    if (!result.ok) {
      fail('rehearsal', result)
      return
    }
    onResult(result.data)
  }

  const confirmSchedule = async (confirmationName: string): Promise<void> => {
    setBusy('schedule')
    setActionError(null)
    const result = await scheduleMigration(
      orgId,
      confirmationName,
      scheduledFor,
    )
    setBusy(null)
    setConfirmOpen(false)
    if (!result.ok) {
      fail('schedule', result)
      return
    }
    setChangingSlot(false)
    onResult(result.data)
  }

  const errorFor = (kind: Busy): React.ReactNode => {
    if (actionError?.kind !== kind) {
      return null
    }
    return (
      <p role="alert" className="text-destructive mt-3 text-sm">
        {actionError.message}
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {putBack && migration.error && <PutBackNotice error={migration.error} />}

      <StepCard
        step={1}
        title="Checks"
        description="We check that your new agent is ready to receive the wallet."
        state={checksState}
      >
        {!preflight ? (
          <p className="text-muted-foreground text-sm">
            The checks haven&apos;t run yet.
          </p>
        ) : (
          <>
            <ul className="divide-border/60 divide-y rounded-lg border">
              {preflight.checks.map((check) => (
                <li key={check.id} className="px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <CheckIcon status={check.status} />
                    <span className="flex-1">
                      {CHECK_LABELS[check.id] ?? check.id}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {CHECK_STATUS_LABEL[check.status]}
                    </span>
                  </div>
                  {check.status === 'FAIL' && (
                    <Failure code={check.code} detail={check.detail} />
                  )}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-2 text-xs">
              Last checked {formatBtt(preflight.ranAt)}
            </p>
          </>
        )}

        {isOwner && canRerunChecks && (
          <div className="mt-4 space-y-3">
            {needsApiKey && (
              <div className="max-w-sm space-y-1.5">
                <Label htmlFor="recheckApiKey">API key</Label>
                <Input
                  id="recheckApiKey"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            )}
            {needsBackups && (
              <div className="flex items-start gap-2">
                <Checkbox
                  id="recheckBackups"
                  checked={backupsConfirmed}
                  onCheckedChange={(checked) =>
                    setBackupsConfirmed(checked === true)
                  }
                />
                <Label
                  htmlFor="recheckBackups"
                  className="leading-snug font-normal"
                >
                  My new agent&apos;s wallet database is backed up.
                </Label>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null || (needsApiKey && !apiKey)}
              onClick={runChecks}
            >
              {busy === 'checks' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="mr-2 h-4 w-4" />
              )}
              {preflight ? 'Re-run checks' : 'Run checks'}
            </Button>
          </div>
        )}
        {errorFor('checks')}
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
        {rehearsalState === 'failed' && (
          <Failure
            code={migration.rehearsal?.code ?? 'REHEARSAL_FAILED'}
            rehearsal
          />
        )}
        {rehearsed && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Measured duration</dt>
              <dd className="font-medium">
                {minutes(migration.rehearsalDurationMs)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Expected pause</dt>
              <dd className="font-medium">
                about {minutes(migration.predictedFreezeMs)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Wallet download</dt>
              <dd className="font-medium">
                {migration.downloadMethod === 'PUSH'
                  ? 'Through the platform'
                  : 'Direct to your agent'}
              </dd>
            </div>
            {migration.counts?.entries !== undefined && (
              <div>
                <dt className="text-muted-foreground">Wallet records</dt>
                <dd className="font-medium">
                  {migration.counts.entries.toLocaleString()}
                </dd>
              </div>
            )}
            {migration.counts?.keys !== undefined && (
              <div>
                <dt className="text-muted-foreground">Keys</dt>
                <dd className="font-medium">{migration.counts.keys}</dd>
              </div>
            )}
          </dl>
        )}
        {rehearsalStale && (
          <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
            This rehearsal is more than {REHEARSAL_MAX_AGE_DAYS} days old, so it
            no longer predicts the move. Run it again before you book a time.
          </p>
        )}
        {rehearsed && migration.downloadMethod === 'PUSH' && (
          <p className="text-muted-foreground mt-2 text-sm">
            Your agent couldn&apos;t download the wallet file directly.
            We&apos;ll send it through the platform instead.
          </p>
        )}
        {isOwner &&
          (rehearsalState === 'action' ||
            rehearsalState === 'failed' ||
            (status === 'REHEARSED' && checksPassed)) && (
            <Button
              size="sm"
              variant={rehearsed && !rehearsalStale ? 'outline' : 'default'}
              className="mt-5"
              disabled={busy !== null}
              onClick={rehearse}
            >
              {busy === 'rehearsal' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {rehearsed || rehearsalState === 'failed'
                ? 'Run rehearsal again'
                : 'Run rehearsal'}
            </Button>
          )}
        {errorFor('rehearsal')}
      </StepCard>

      <StepCard
        step={3}
        title="Schedule"
        description="Pick a quiet time. Issuing and verifying pause for the length of the move."
        state={scheduleState}
      >
        {scheduleState === 'locked' && (
          <p className="text-muted-foreground text-sm">{lockedReason}</p>
        )}
        {scheduleState === 'done' && (
          <BookedSlot
            migration={migration}
            isOwner={isOwner}
            onChangeTime={() => setChangingSlot(true)}
          />
        )}
        {scheduleState === 'action' && (
          <>
            <p className="mb-3 text-sm">
              Expected pause: about{' '}
              <span className="font-semibold">
                {minutes(migration.predictedFreezeMs)}
              </span>
              .
            </p>
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
                  disabled={busy !== null || slotError !== null}
                  onClick={() => setConfirmOpen(true)}
                >
                  {scheduled ? 'Move to this time' : 'Schedule move'}
                </Button>
                {changing && (
                  <Button
                    variant="ghost"
                    onClick={() => setChangingSlot(false)}
                  >
                    Keep current time
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                The organisation owner schedules the move.
              </p>
            )}
            {isOwner && slotError && (
              <p className="text-destructive mt-2 text-sm">{slotError}</p>
            )}
          </>
        )}
        {errorFor('schedule')}
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
