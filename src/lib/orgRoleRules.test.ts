import { describe, expect, it } from 'vitest'
import {
  isMobileVerifierAdmin,
  isMobileVerifierMember,
  isMobileVerifierOnly,
  isMobileVerifierOnlyPath,
  mobileVerifierHome,
} from './orgRoleRules'

const MMV = 'ALLOW_VERIFIER'
const PROOF = 'ALLOW_PROOF_TEMPLATE'

describe('isMobileVerifierOnly', () => {
  it.each([
    [['member', MMV]],
    [['admin', MMV]],
    [['member', MMV, PROOF]],
    [['admin', MMV, PROOF]],
    [[MMV]],
  ])('restricts %j', (roles) => {
    expect(isMobileVerifierOnly(roles)).toBe(true)
  })

  it.each([
    [[]],
    [['member']],
    [['admin', 'member']],
    [['member', PROOF]],
    [['owner', MMV]],
    [['issuer', 'member', MMV]],
    [['verifier', 'member', MMV]],
    [['platform_admin', 'member', MMV]],
  ])('leaves %j on normal Studio', (roles) => {
    expect(isMobileVerifierOnly(roles)).toBe(false)
  })
})

describe('mobile verifier admin and member', () => {
  it('splits on admin', () => {
    expect(isMobileVerifierAdmin(['admin', MMV])).toBe(true)
    expect(isMobileVerifierMember(['admin', MMV])).toBe(false)
    expect(isMobileVerifierAdmin(['member', MMV])).toBe(false)
    expect(isMobileVerifierMember(['member', MMV])).toBe(true)
  })

  it('is neither outside the mobile verifier view', () => {
    expect(isMobileVerifierAdmin(['admin', 'member'])).toBe(false)
    expect(isMobileVerifierMember(['member'])).toBe(false)
    expect(isMobileVerifierMember(['owner', MMV])).toBe(false)
  })
})

describe('isMobileVerifierOnlyPath', () => {
  it.each([
    '/organizations',
    '/mobile-verifier',
    '/mobile-verifier/proof-templates',
    '/mobile-verifier/verifier-users',
    '/invitations',
    '/developers-setting',
    '/profile',
  ])('opens %s to a member', (path) => {
    expect(isMobileVerifierOnlyPath(path)).toBe(true)
  })

  it.each([
    '/dashboard',
    '/connections',
    '/credentials',
    '/schemas',
    '/organizations/billing',
    '/users',
    '/create-organization',
    '/mobile-verifierx',
    '/',
  ])('closes %s to a member', (path) => {
    expect(isMobileVerifierOnlyPath(path)).toBe(false)
  })

  it('opens Users and Create organisation to an admin only', () => {
    for (const path of [
      '/users',
      '/users/invitations',
      '/create-organization',
    ]) {
      expect(isMobileVerifierOnlyPath(path, true)).toBe(true)
      expect(isMobileVerifierOnlyPath(path, false)).toBe(false)
    }
    expect(isMobileVerifierOnlyPath('/connections', true)).toBe(false)
    expect(isMobileVerifierOnlyPath('/organizations/billing', true)).toBe(false)
  })
})

describe('mobileVerifierHome', () => {
  it('lands on Proof Templates with Create Proof Templates', () => {
    expect(mobileVerifierHome(['member', MMV, PROOF])).toBe(
      '/mobile-verifier/proof-templates',
    )
  })

  it('lands on Verifier Users otherwise', () => {
    expect(mobileVerifierHome(['member', MMV])).toBe(
      '/mobile-verifier/verifier-users',
    )
  })
})
