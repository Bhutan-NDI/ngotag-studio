// Which state each card on the checks, rehearsal and schedule page is in
// (SCR-WM-04). Pure, so it can be checked without rendering.

import { isRehearsalStale, isRehearsed } from '../config'

import { IMigration } from '../types'
import { StepState } from './StepCard'

export type Busy = 'checks' | 'rehearsal' | 'schedule'

/**
 * State of each card. The checks can fail again after the rehearsal (the
 * final checks at the slot), and must pass before a new time is booked; a
 * rehearsal older than the platform allows must be run again first.
 */
export const stepStates = (
  migration: IMigration,
  busy: Busy | null,
  changingSlot: boolean,
): {
  checksState: StepState
  rehearsalState: StepState
  scheduleState: StepState
} => {
  const { status, preflight, rehearsalStatus } = migration
  const rehearsed = isRehearsed(status)
  const scheduled = status === 'SCHEDULED'
  const checksPassed = Boolean(preflight?.passed)
  const rehearsalStale = rehearsed && !scheduled && isRehearsalStale(migration)

  let checksState: StepState = 'action'
  if (busy === 'checks') {
    checksState = 'running'
  } else if (preflight) {
    checksState = checksPassed ? 'done' : 'failed'
  }

  let rehearsalState: StepState = 'action'
  if (rehearsalStatus === 'RUNNING' || busy === 'rehearsal') {
    rehearsalState = 'running'
  } else if (rehearsed) {
    // A stale rehearsal is run again, which needs passing checks.
    rehearsalState = rehearsalStale && checksPassed ? 'action' : 'done'
  } else if (!checksPassed) {
    rehearsalState = 'locked'
  } else if (rehearsalStatus === 'FAILED') {
    rehearsalState = 'failed'
  }

  let scheduleState: StepState = 'action'
  if (!rehearsed) {
    scheduleState = 'locked'
  } else if (scheduled && !changingSlot) {
    scheduleState = 'done'
  } else if (!checksPassed || rehearsalStale) {
    scheduleState = 'locked'
  }

  return { checksState, rehearsalState, scheduleState }
}
