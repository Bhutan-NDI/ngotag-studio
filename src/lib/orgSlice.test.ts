import { describe, expect, it } from 'vitest'
import orgReducer, {
  selectSelectedOrgRoles,
  setIsPlatformAdmin,
  setOrgId,
  setOrgInfo,
} from './orgSlice'

type OrgState = ReturnType<typeof orgReducer>

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'

const stateWith = (
  ...actions: Parameters<typeof orgReducer>[1][]
): { organization: OrgState } => ({
  organization: actions.reduce(orgReducer, orgReducer(undefined, { type: '' })),
})

describe('selectSelectedOrgRoles', () => {
  it('is unknown with no organisation stored', () => {
    expect(selectSelectedOrgRoles(stateWith())).toBeNull()
  })

  it("returns the selected organisation's roles", () => {
    const state = stateWith(
      setOrgId(A),
      setOrgInfo({ id: A, roles: ['member', 'ALLOW_VERIFIER'] }),
    )
    expect(selectSelectedOrgRoles(state)).toEqual(['member', 'ALLOW_VERIFIER'])
  })

  it('is unknown while orgInfo still describes the previous organisation', () => {
    const state = stateWith(
      setOrgId(A),
      setOrgInfo({ id: A, roles: ['owner'] }),
      setOrgId(B),
    )
    expect(selectSelectedOrgRoles(state)).toBeNull()
  })

  it('uses orgInfo when no organisation id is set yet', () => {
    const state = stateWith(setOrgInfo({ id: A, roles: ['member'] }))
    expect(selectSelectedOrgRoles(state)).toEqual(['member'])
  })

  it("adds a platform admin's roles without duplicates", () => {
    const state = stateWith(
      setOrgId(A),
      setOrgInfo({ id: A, roles: ['member', 'ALLOW_VERIFIER'] }),
      setIsPlatformAdmin(true),
    )
    expect(selectSelectedOrgRoles(state)).toEqual([
      'member',
      'ALLOW_VERIFIER',
      'owner',
      'ALLOW_PROOF_TEMPLATE',
    ])
  })

  it("never writes a platform admin's roles into the store", () => {
    const state = stateWith(
      setOrgId(A),
      setOrgInfo({ id: A, roles: ['member'] }),
      setIsPlatformAdmin(true),
    )
    expect(state.organization.orgInfo?.roles).toEqual(['member'])
  })

  it('drops them as soon as the flag is cleared', () => {
    const state = stateWith(
      setOrgId(A),
      setOrgInfo({ id: A, roles: ['member', 'ALLOW_VERIFIER'] }),
      setIsPlatformAdmin(true),
      setIsPlatformAdmin(false),
    )
    expect(selectSelectedOrgRoles(state)).toEqual(['member', 'ALLOW_VERIFIER'])
  })

  it('returns the same array while nothing changes', () => {
    const state = stateWith(
      setOrgId(A),
      setOrgInfo({ id: A, roles: ['member'] }),
      setIsPlatformAdmin(true),
    )
    expect(selectSelectedOrgRoles(state)).toBe(selectSelectedOrgRoles(state))
  })
})
