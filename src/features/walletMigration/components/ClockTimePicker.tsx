'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

// A 24-hour clock dial: hours 1-12 on the outer ring and 00, 13-23 on the
// inner ring, then minutes, like the Android time picker.
const SIZE = 256
const CENTER = SIZE / 2
const OUTER = 104
const INNER = 70
const OUTER_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const INNER_HOURS = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const MINUTE_LABELS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

type Mode = 'hours' | 'minutes'

const pad = (value: number): string => String(value).padStart(2, '0')

/** Where a value sits on the dial, `step` degrees apart from 12 o'clock. */
const position = (
  index: number,
  radius: number,
  step: number,
): { x: number; y: number } => {
  const angle = (index * step * Math.PI) / 180
  const dx = radius * Math.sin(angle)
  const dy = radius * Math.cos(angle)
  return { x: CENTER + dx, y: CENTER - dy }
}

const hourPosition = (hour: number): { x: number; y: number } => {
  const onInner = hour === 0 || hour > 12
  return position(hour % 12, onInner ? INNER : OUTER, 30)
}

/** The hour or minute under a click or drag on the dial. */
const valueAt = (
  event: React.PointerEvent<SVGSVGElement>,
  mode: Mode,
): number => {
  const rect = event.currentTarget.getBoundingClientRect()
  const scale = SIZE / rect.width
  const x = (event.clientX - rect.left) * scale
  const y = (event.clientY - rect.top) * scale
  const dx = x - CENTER
  const dy = y - CENTER
  const signedDegrees = (Math.atan2(dx, -dy) * 180) / Math.PI
  const degrees = (signedDegrees + 360) % 360
  if (mode === 'minutes') {
    return Math.round(degrees / 6) % 60
  }
  const slot = Math.round(degrees / 30) % 12
  const inner = Math.hypot(dx, dy) < (OUTER + INNER) / 2
  if (inner) {
    return slot === 0 ? 0 : slot + 12
  }
  return slot === 0 ? 12 : slot
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
  const [mode, setMode] = useState<Mode>('hours')
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

  const hand =
    mode === 'hours' ? hourPosition(hour) : position(minute, OUTER, 6)

  const label = (
    text: string,
    x: number,
    y: number,
    selected: boolean,
    small = false,
  ): React.JSX.Element => (
    <text
      key={`${text}-${x}`}
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      className={`pointer-events-none select-none ${small ? 'text-[13px]' : 'text-[15px]'} ${
        selected ? 'fill-primary-foreground font-semibold' : 'fill-foreground'
      }`}
    >
      {text}
    </text>
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
          {(['hours', 'minutes'] as Mode[]).map((part, i) => (
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
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
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
            setDragging(false)
            // Like Android: picking the hour moves on to the minutes.
            if (mode === 'hours') {
              setMode('minutes')
            }
          }}
        >
          <line
            x1={CENTER}
            y1={CENTER}
            x2={hand.x}
            y2={hand.y}
            className="stroke-primary"
            strokeWidth={2}
          />
          <circle cx={CENTER} cy={CENTER} r={3} className="fill-primary" />
          <circle cx={hand.x} cy={hand.y} r={17} className="fill-primary" />
          {mode === 'hours' && (
            <>
              {OUTER_HOURS.map((h, i) => {
                const p = position(i, OUTER, 30)
                return label(String(h), p.x, p.y, h === hour)
              })}
              {INNER_HOURS.map((h, i) => {
                const p = position(i, INNER, 30)
                return label(pad(h), p.x, p.y, h === hour, true)
              })}
            </>
          )}
          {mode === 'minutes' &&
            MINUTE_LABELS.map((m, i) => {
              const p = position(i, OUTER, 30)
              return label(pad(m), p.x, p.y, m === minute)
            })}
        </svg>

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
