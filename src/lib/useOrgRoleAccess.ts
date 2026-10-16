import { useAppSelector } from '@/lib/hooks'

// Mirrors the backend's Keycloak client-role check (assertRole in mobile-verifier): these
// roles are granted explicitly, owner/admin alone do not imply them.
export const MOBILE_VERIFIER_ROLES = {
  PROOF_TEMPLATE: 'ALLOW_PROOF_TEMPLATE',
  VERIFIER: 'ALLOW_VERIFIER',
} as const

export const useHasOrgRole = (role: string): boolean =>
  useAppSelector((state) => state.organization.orgInfo?.roles || []).includes(
    role,
  )
