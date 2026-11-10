'use client'

import {
  DIAL_CENTER,
  DIAL_SIZE,
  DialMode,
  INNER_RADIUS,
  OUTER_RADIUS,
  dialPosition,
  hourPosition,
  isOffPeakHour,
  minutePosition,
  valueAtPoint,
} from '../clockDial'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

const OUTER_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const INNER_HOURS = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const MINUTE_LABELS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

const pad = (value: number): string => String(value).padStart(2, '0')

/** The hour or minute under a click or drag, from screen to dial units. */
const valueAt = (
  event: React.PointerEvent<SVGSVGElement>,
  mode: DialMode,
): number => {
  const rect = event.currentTarget.getBoundingClientRect()
  const scale = DIAL_SIZE / rect.width
  return valueAtPoint(
    {
      x: (event.clientX - rect.left) * scale,
      y: (event.clientY - rect.top) * scale,
    },
    mode,
  )
}

interface ClockTimePickerProps {
  id?: string
  /** "HH:MM", 24-hour. */
  value: string
  onChange: (value: string) => void
}

/** A time field that opens a clock dial. Changes apply on OK. */
export function ClockTimePicker({
  id,
  value,
  onChange,
}: Readonly<ClockTimePickerProps>): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<DialMode>('hours')
  const [hour, setHour] = useState(0)
  const [minute, setMinute] = useState(0)
  const [dragging, setDragging] = useState(false)

  const openPicker = (next: boolean): void => {
    if (next) {
      const [h, m] = value.split(':').map(Number)
      setHour(Number.isFinite(h) ? h : 0)
      setMinute(Number.isFinite(m) ? m : 0)
      setMode('hours')
    }
    setOpen(next)
  }

  const pick = (picked: number): void => {
    if (mode === 'hours') {
      setHour(picked)
    } else {
      setMinute(picked)
    }
  }

  const hand = mode === 'hours' ? hourPosition(hour) : minutePosition(minute)
  const endDrag = (): void => setDragging(false)

  const label = (
    text: string,
    x: number,
    y: number,
    selected: boolean,
    { small = false, offPeak = false } = {},
  ): React.JSX.Element => (
    <g key={`${text}-${x}`} className="pointer-events-none select-none">
      {offPeak && !selected && (
        <circle cx={x} cy={y} r={small ? 13 : 15} className="fill-primary/10" />
      )}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        className={`${small ? 'text-[13px]' : 'text-[15px]'} ${
          selected ? 'fill-primary-foreground font-semibold' : 'fill-foreground'
        }`}
      >
        {text}
      </text>
    </g>
  )

  return (
    <Popover open={open} onOpenChange={openPicker}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="w-32 justify-between font-normal"
          aria-label={`Time ${value}, change`}
        >
          {value}
          <Clock className="text-muted-foreground h-4 w-4" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="mb-3 flex items-center justify-center gap-1.5 text-xl font-semibold">
          {(['hours', 'minutes'] as DialMode[]).map((part, i) => (
            <React.Fragment key={part}>
              {i === 1 && <span aria-hidden>:</span>}
              <button
                type="button"
                onClick={() => setMode(part)}
                onKeyDown={(event) => {
                  // Arrow keys step the value, for keyboard users.
                  const delta = { ArrowUp: 1, ArrowDown: -1 }[event.key]
                  if (!delta) {
                    return
                  }
                  event.preventDefault()
                  if (part === 'hours') {
                    setHour((h) => (h + delta + 24) % 24)
                  } else {
                    setMinute((m) => (m + delta + 60) % 60)
                  }
                }}
                aria-pressed={mode === part}
                aria-label={part === 'hours' ? 'Hours' : 'Minutes'}
                className={`rounded-md border px-2.5 py-1 tabular-nums ${
                  mode === part
                    ? 'border-primary text-primary'
                    : 'text-muted-foreground border-transparent'
                }`}
              >
                {pad(part === 'hours' ? hour : minute)}
              </button>
            </React.Fragment>
          ))}
        </div>

        <svg
          width={DIAL_SIZE}
          height={DIAL_SIZE}
          viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
          className="bg-muted/40 touch-none rounded-full"
          role="img"
          aria-label={mode === 'hours' ? 'Hour dial' : 'Minute dial'}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            setDragging(true)
            pick(valueAt(event, mode))
          }}
          onPointerMove={(event) => {
            if (dragging) {
              pick(valueAt(event, mode))
            }
          }}
          onPointerUp={() => {
            // Like Android: picking the hour moves on to the minutes. A drag
            // the browser cancelled hasn't picked anything, so it stays.
            if (dragging && mode === 'hours') {
              setMode('minutes')
            }
            endDrag()
          }}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <line
            x1={DIAL_CENTER}
            y1={DIAL_CENTER}
            x2={hand.x}
            y2={hand.y}
            className="stroke-primary"
            strokeWidth={2}
          />
          <circle
            cx={DIAL_CENTER}
            cy={DIAL_CENTER}
            r={3}
            className="fill-primary"
          />
          <circle cx={hand.x} cy={hand.y} r={17} className="fill-primary" />
          {mode === 'hours' && (
            <>
              {OUTER_HOURS.map((h, i) => {
                const p = dialPosition(i, OUTER_RADIUS, 30)
                return label(String(h), p.x, p.y, h === hour, {
                  offPeak: isOffPeakHour(h),
                })
              })}
              {INNER_HOURS.map((h, i) => {
                const p = dialPosition(i, INNER_RADIUS, 30)
                return label(pad(h), p.x, p.y, h === hour, {
                  small: true,
                  offPeak: isOffPeakHour(h),
                })
              })}
            </>
          )}
          {mode === 'minutes' &&
            MINUTE_LABELS.map((m, i) => {
              const p = dialPosition(i, OUTER_RADIUS, 30)
              return label(pad(m), p.x, p.y, m === minute)
            })}
        </svg>

        {mode === 'hours' && (
          <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5 text-xs">
            <span
              aria-hidden
              className="bg-primary/20 h-2.5 w-2.5 rounded-full"
            />
            Off-peak (21:00 to 05:00 BTT)
          </p>
        )}

        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onChange(`${pad(hour)}:${pad(minute)}`)
              setOpen(false)
            }}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
