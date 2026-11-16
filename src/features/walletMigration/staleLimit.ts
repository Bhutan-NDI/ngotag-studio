const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** The agent's default: a connection that never answers is inactive after 30 days. */
export const DEFAULT_STALE_AFTER_SECONDS = 30 * DAY

const plural = (count: number, unit: string): string =>
  `${count} ${unit}${count === 1 ? '' : 's'}`

/**
 * How long a connection may go without answering the address change before
 * it counts as inactive, in words ("30 days", "12 hours", "20 minutes").
 * Uses the largest unit that divides it exactly, falling back to minutes.
 *
 * The limit is set per dedicated agent. Moves polled before it was reported,
 * completed moves and agents on an older image don't carry it, so a missing
 * or unusable value means the 30-day default.
 */
export const staleLimitText = (staleAfterSeconds?: number | null): string => {
  const seconds =
    typeof staleAfterSeconds === 'number' &&
    Number.isFinite(staleAfterSeconds) &&
    staleAfterSeconds > 0
      ? staleAfterSeconds
      : DEFAULT_STALE_AFTER_SECONDS

  if (seconds % DAY === 0) {
    return plural(seconds / DAY, 'day')
  }
  if (seconds % HOUR === 0) {
    return plural(seconds / HOUR, 'hour')
  }
  return plural(Math.max(1, Math.round(seconds / MINUTE)), 'minute')
}
