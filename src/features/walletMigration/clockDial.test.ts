import {
  DIAL_CENTER,
  INNER_RADIUS,
  OUTER_RADIUS,
  dialPosition,
  hourPosition,
  isOffPeakHour,
  minutePosition,
  valueAtPoint,
} from './clockDial'
import { describe, expect, it } from 'vitest'

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute)

describe('dial positions', () => {
  it('puts 12 o’clock straight up and 3 o’clock to the right', () => {
    const up = dialPosition(0, OUTER_RADIUS, 30)
    const right = dialPosition(3, OUTER_RADIUS, 30)
    expect(up.x).toBeCloseTo(DIAL_CENTER)
    expect(up.y).toBeCloseTo(DIAL_CENTER - OUTER_RADIUS)
    expect(right.x).toBeCloseTo(DIAL_CENTER + OUTER_RADIUS)
    expect(right.y).toBeCloseTo(DIAL_CENTER)
  })

  it('puts 1-12 on the outer ring and 00, 13-23 on the inner ring', () => {
    const radius = (hour: number): number => {
      const { x, y } = hourPosition(hour)
      return Math.hypot(x - DIAL_CENTER, y - DIAL_CENTER)
    }
    expect(radius(3)).toBeCloseTo(OUTER_RADIUS)
    expect(radius(12)).toBeCloseTo(OUTER_RADIUS)
    expect(radius(0)).toBeCloseTo(INNER_RADIUS)
    expect(radius(15)).toBeCloseTo(INNER_RADIUS)
  })
})

describe('valueAtPoint', () => {
  it('reads back every hour from its own position', () => {
    HOURS.forEach((hour) => {
      expect(valueAtPoint(hourPosition(hour), 'hours')).toBe(hour)
    })
  })

  it('reads back every minute from its own position', () => {
    MINUTES.forEach((minute) => {
      expect(valueAtPoint(minutePosition(minute), 'minutes')).toBe(minute)
    })
  })

  it('picks the nearest hour slot for a point between two', () => {
    // 20° past 12 o'clock on the outer ring is nearer 1 than 12.
    expect(valueAtPoint(dialPosition(20, OUTER_RADIUS, 1), 'hours')).toBe(1)
    expect(valueAtPoint(dialPosition(10, OUTER_RADIUS, 1), 'hours')).toBe(12)
  })

  it('splits the rings halfway between them', () => {
    const between = (OUTER_RADIUS + INNER_RADIUS) / 2
    expect(valueAtPoint(dialPosition(3, between + 1, 30), 'hours')).toBe(3)
    expect(valueAtPoint(dialPosition(3, between - 1, 30), 'hours')).toBe(15)
  })

  it('wraps a point just before 12 o’clock to 0 minutes', () => {
    expect(valueAtPoint(dialPosition(359.9, OUTER_RADIUS, 1), 'minutes')).toBe(
      0,
    )
  })
})

describe('isOffPeakHour', () => {
  it('covers 21:00 to 05:59 BTT', () => {
    expect(HOURS.filter(isOffPeakHour)).toEqual([0, 1, 2, 3, 4, 5, 21, 22, 23])
  })
})
