import { describe, expect, it } from 'vitest'

import { staleLimitText } from './staleLimit'

describe('staleLimitText', () => {
  it.each([
    [2592000, '30 days'],
    [604800, '7 days'],
    [86400, '1 day'],
    [43200, '12 hours'],
    [3600, '1 hour'],
    [129600, '36 hours'],
    [1200, '20 minutes'],
    [5400, '90 minutes'],
    [60, '1 minute'],
    [90, '2 minutes'],
    [20, '1 minute'],
  ])('reads %i seconds as "%s"', (seconds, text) => {
    expect(staleLimitText(seconds)).toBe(text)
  })

  it.each([undefined, null, 0, -60, Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back to 30 days for %p',
    (seconds) => {
      expect(staleLimitText(seconds)).toBe('30 days')
    },
  )
})
