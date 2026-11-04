import { RoleI, applyMemberRule, toggleRole } from './roleSelection'
import { describe, expect, it } from 'vitest'

// The roles the dialog offers: owner and holder are never shown.
const NAMES = [
  'admin',
  'issuer',
  'verifier',
  'member',
  'ALLOW_PROOF_TEMPLATE',
  'ALLOW_VERIFIER',
]

// The dialog as it opens for a user holding these roles.
const open = (...held: string[]): RoleI[] =>
  applyMemberRule(
    NAMES.map((name) => ({
      id: `id-${name}`,
      name,
      checked: held.includes(name),
      disabled: false,
    })),
  )

const tick = (roles: RoleI[], name: string, checked = true): RoleI[] =>
  toggleRole(roles, roles.find((r) => r.name === name) as RoleI, checked)

const ticked = (roles: RoleI[]): string[] =>
  roles.filter((r) => r.checked).map((r) => r.name)

const member = (roles: RoleI[]): RoleI =>
  roles.find((r) => r.name === 'member') as RoleI

describe('Studio roles, without Manage Mobile Verifier', () => {
  it('keeps Member ticked and locked', () => {
    const roles = open('member')
    expect(member(roles)).toMatchObject({ checked: true, disabled: true })
  })

  it('Admin keeps Member and clears the rest', () => {
    const roles = tick(open('member', 'issuer'), 'admin')
    expect(ticked(roles)).toEqual(['admin', 'member'])
    expect(member(roles).disabled).toBe(true)
  })

  it('Issuer or Verifier ticks both with Member and clears the rest', () => {
    const roles = tick(open('member', 'admin', 'ALLOW_VERIFIER'), 'issuer')
    expect(ticked(roles)).toEqual(['issuer', 'verifier', 'member'])
  })

  it('Create Proof Templates alone leaves Member locked', () => {
    const roles = tick(open('member'), 'ALLOW_PROOF_TEMPLATE')
    expect(member(roles)).toMatchObject({ checked: true, disabled: true })
  })
})

describe('Manage Mobile Verifier + Member', () => {
  it('opens with Member ticked and locked', () => {
    const roles = open('member', 'ALLOW_VERIFIER')
    expect(ticked(roles)).toEqual(['member', 'ALLOW_VERIFIER'])
    expect(member(roles).disabled).toBe(true)
  })

  it('ticking Manage Mobile Verifier keeps Member', () => {
    const roles = tick(open('member'), 'ALLOW_VERIFIER')
    expect(ticked(roles)).toEqual(['member', 'ALLOW_VERIFIER'])
  })

  it('ticking Admin unticks and unlocks Member', () => {
    const roles = tick(open('member', 'ALLOW_VERIFIER'), 'admin')
    expect(ticked(roles)).toEqual(['admin', 'ALLOW_VERIFIER'])
    expect(member(roles)).toMatchObject({ checked: false, disabled: false })
  })
})

describe('Manage Mobile Verifier + Admin', () => {
  it('opens with Member unticked and open', () => {
    const roles = open('admin', 'ALLOW_VERIFIER')
    expect(ticked(roles)).toEqual(['admin', 'ALLOW_VERIFIER'])
    expect(member(roles).disabled).toBe(false)
  })

  it('saves without Member', () => {
    const roles = tick(open('member', 'ALLOW_VERIFIER'), 'admin')
    expect(ticked(roles)).not.toContain('member')
  })

  it('ticking Member unticks Admin', () => {
    const roles = tick(open('admin', 'ALLOW_VERIFIER'), 'member')
    expect(ticked(roles)).toEqual(['member', 'ALLOW_VERIFIER'])
    expect(member(roles).disabled).toBe(true)
  })

  it('keeps Create Proof Templates when switching', () => {
    const roles = tick(
      open('admin', 'ALLOW_VERIFIER', 'ALLOW_PROOF_TEMPLATE'),
      'member',
    )
    expect(ticked(roles)).toEqual([
      'member',
      'ALLOW_PROOF_TEMPLATE',
      'ALLOW_VERIFIER',
    ])
  })

  it('unticking Manage Mobile Verifier gives a Studio admin', () => {
    const roles = tick(open('admin', 'ALLOW_VERIFIER'), 'ALLOW_VERIFIER', false)
    expect(ticked(roles)).toEqual(['admin', 'member'])
    expect(member(roles).disabled).toBe(true)
  })
})
