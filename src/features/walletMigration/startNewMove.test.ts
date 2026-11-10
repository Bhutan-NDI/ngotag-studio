import { describe, expect, it } from 'vitest'

import { IMigration } from './types'
import { MoveDashboard } from './components/MoveDashboard'
import { canStartNewMove } from './config'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const restored = {
  id: 'm1',
  orgId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  status: 'DISASTER_RESTORED',
  error: null,
  rotation: null,
  stabilisationEndsAt: null,
  completedAt: null,
} as unknown as IMigration

const renderRestored = (onStartNewMove?: () => void): string =>
  renderToStaticMarkup(
    createElement(MoveDashboard, { migration: restored, onStartNewMove }),
  )

describe('canStartNewMove', () => {
  it('lets only the owner of an org on the shared agent start over', () => {
    expect(canStartNewMove(true, 'shared')).toBe(true)
    expect(canStartNewMove(true, 'dedicated')).toBe(false)
    expect(canStartNewMove(true, null)).toBe(false)
    expect(canStartNewMove(false, 'shared')).toBe(false)
  })
})

describe('the restored card', () => {
  it('offers a new move, and help from support, when the owner can start over', () => {
    const html = renderRestored(() => undefined)
    expect(html).toContain('Restored to the shared agent')
    expect(html).toContain('need to reconnect')
    expect(html).toContain('Start a new move')
    expect(html).toContain(
      'Contact support if you need help, or start a new move.',
    )
    expect(html).not.toContain('Please contact support.')
  })

  it('only points to support for everyone else', () => {
    const html = renderRestored()
    expect(html).toContain('Restored to the shared agent')
    expect(html).toContain('need to reconnect')
    expect(html).toContain('Please contact support.')
    expect(html).not.toContain('Start a new move')
  })
})
