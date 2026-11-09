'use client'

import { Button } from '@/components/ui/button'
import React from 'react'
import { SlotFields } from './ScheduleParts'

interface ScheduleFormProps {
  date: string
  time: string
  minDate: string
  maxDate: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  slotError: string | null
  busy: boolean
  /** Already booked: the owner is moving the slot. */
  scheduled: boolean
  /** Changing a booked slot, which the owner can call off. */
  changing: boolean
  /** Book the picked slot. */
  onSchedule: () => void
  /** Start at once: the platform starts a move booked without a slot. */
  onStartNow: () => void
  onKeepTime: () => void
}

/** The owner's booking form on the Schedule step (SCR-WM-04). */
export function ScheduleForm({
  date,
  time,
  minDate,
  maxDate,
  onDateChange,
  onTimeChange,
  slotError,
  busy,
  scheduled,
  changing,
  onSchedule,
  onStartNow,
  onKeepTime,
}: Readonly<ScheduleFormProps>): React.JSX.Element {
  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <SlotFields
          date={date}
          time={time}
          minDate={minDate}
          maxDate={maxDate}
          onDateChange={onDateChange}
          onTimeChange={onTimeChange}
        />
        <Button disabled={busy || slotError !== null} onClick={onSchedule}>
          {scheduled ? 'Move to this time' : 'Schedule move'}
        </Button>
        <Button variant="outline" disabled={busy} onClick={onStartNow}>
          Start now
        </Button>
        {changing && (
          <Button variant="ghost" onClick={onKeepTime}>
            Keep current time
          </Button>
        )}
      </div>
      {slotError && (
        <p className="text-destructive mt-2 text-sm">{slotError}</p>
      )}
    </>
  )
}
