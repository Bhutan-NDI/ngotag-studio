'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClockTimePicker } from './ClockTimePicker'
import { IMigration } from '../types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { findMigrationError } from '../errorMessages'
import { formatBtt } from '../config'

// Booking notices on the Checks, rehearsal and schedule page (SCR-WM-04).

const NOTICE =
  'rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300'

/**
 * The platform took the booking back before the move started (missed slot,
 * or final checks that kept failing). Nothing changed; the owner fixes what
 * failed and picks a new time.
 */
export function PutBackNotice({
  error,
}: Readonly<{ error: string }>): React.JSX.Element {
  const content = findMigrationError(error)
  return (
    <div role="status" className={`flex items-start gap-3 ${NOTICE}`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="font-medium">
          {content?.message ??
            "Your booked move didn't start. Nothing changed."}
        </p>
        <p className="mt-1">{content?.recovery ?? 'Pick a new time.'}</p>
        <p className="mt-1 text-xs">Reference: {error}</p>
      </div>
    </div>
  )
}

/** Step 3 once booked: the slot, and the final checks if they're failing. */
export function BookedSlot({
  migration,
  isOwner,
  onChangeTime,
}: Readonly<{
  migration: IMigration
  isOwner: boolean
  onChangeTime: () => void
}>): React.JSX.Element {
  const { scheduledFor, preflight } = migration
  // At the slot the platform reruns the checks and retries failing ones for a
  // while before it takes the booking back.
  const finalChecksFailing = preflight !== null && !preflight.passed
  return (
    <>
      <p className="text-sm">
        Move booked for{' '}
        <span className="font-semibold">
          {scheduledFor ? formatBtt(scheduledFor) : '—'}
        </span>
        . Final checks run just before the move starts. If one fails, the move
        doesn&apos;t start and nothing changes.
      </p>
      {finalChecksFailing && (
        <div role="status" className={`mt-3 ${NOTICE}`}>
          The final checks aren&apos;t passing (see step 1). We keep trying for
          a short while. If they still fail, the move won&apos;t start, nothing
          changes, and you can pick a new time.
        </div>
      )}
      {isOwner && !finalChecksFailing && (
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={onChangeTime}
        >
          Change time
        </Button>
      )}
    </>
  )
}

interface SlotFieldsProps {
  date: string
  time: string
  minDate: string
  maxDate: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
}

/** The move's date and time, in Bhutan time. Off-peak hours are quietest. */
export function SlotFields({
  date,
  time,
  minDate,
  maxDate,
  onDateChange,
  onTimeChange,
}: Readonly<SlotFieldsProps>): React.JSX.Element {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="moveDate">Date</Label>
        <Input
          id="moveDate"
          type="date"
          value={date}
          min={minDate}
          max={maxDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-44"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="moveTime">Time (BTT)</Label>
        <ClockTimePicker id="moveTime" value={time} onChange={onTimeChange} />
      </div>
    </>
  )
}
