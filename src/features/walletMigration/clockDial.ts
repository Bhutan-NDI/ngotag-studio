// Geometry of the 24-hour clock dial in ClockTimePicker: hours 1-12 on the
// outer ring and 00, 13-23 on the inner ring, then minutes. Pure, so it can
// be checked without rendering.

export const DIAL_SIZE = 256
export const DIAL_CENTER = DIAL_SIZE / 2
export const OUTER_RADIUS = 104
export const INNER_RADIUS = 70

export type DialMode = 'hours' | 'minutes'

export interface DialPoint {
  x: number
  y: number
}

/** Where a value sits on the dial, `step` degrees apart from 12 o'clock. */
export const dialPosition = (
  index: number,
  radius: number,
  step: number,
): DialPoint => {
  const angle = (index * step * Math.PI) / 180
  const dx = radius * Math.sin(angle)
  const dy = radius * Math.cos(angle)
  return { x: DIAL_CENTER + dx, y: DIAL_CENTER - dy }
}

export const isInnerHour = (hour: number): boolean => hour === 0 || hour > 12

export const hourPosition = (hour: number): DialPoint =>
  dialPosition(hour % 12, isInnerHour(hour) ? INNER_RADIUS : OUTER_RADIUS, 30)

export const minutePosition = (minute: number): DialPoint =>
  dialPosition(minute, OUTER_RADIUS, 6)

/**
 * The hour or minute at a point on the dial, in dial units (0 to DIAL_SIZE).
 * Hours nearer the centre than halfway between the rings are the inner ones.
 */
export const valueAtPoint = (point: DialPoint, mode: DialMode): number => {
  const dx = point.x - DIAL_CENTER
  const dy = point.y - DIAL_CENTER
  const signedDegrees = (Math.atan2(dx, -dy) * 180) / Math.PI
  const degrees = (signedDegrees + 360) % 360
  if (mode === 'minutes') {
    return Math.round(degrees / 6) % 60
  }
  const slot = Math.round(degrees / 30) % 12
  if (Math.hypot(dx, dy) < (OUTER_RADIUS + INNER_RADIUS) / 2) {
    return slot === 0 ? 0 : slot + 12
  }
  return slot === 0 ? 12 : slot
}

/** Off-peak hours, Bhutan time (SCR-WM-04): 21:00 up to 05:59. */
export const isOffPeakHour = (hour: number): boolean => hour >= 21 || hour <= 5
