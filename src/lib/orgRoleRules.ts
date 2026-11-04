// Which parts of Studio a set of organisation roles opens. Plain functions,
// kept apart from the hooks in useOrgRoleAccess so they can be unit tested.

// Mirrors the backend's Keycloak client-role check (assertRole in mobile-verifier): these
// roles are granted explicitly, owner/admin alone do not imply them.
export const MOBILE_VERIFIER_ROLES = {
  PROOF_TEMPLATE: 'ALLOW_PROOF_TEMPLATE',
  VERIFIER: 'ALLOW_VERIFIER',
} as const

const MOBILE_VERIFIER_ONLY_ROLES: string[] = [
  'member',
  'admin',
  ...Object.values(MOBILE_VERIFIER_ROLES),
]

/**
 * A user who was given Manage Mobile Verifier with only Admin or Member in
 * this organisation (Create Proof Templates may come with it). They see just
 * the mobile verifier and their organisations. Without Manage Mobile
 * Verifier, or with any other role (owner, issuer, verifier), Studio works as
 * usual.
 */
export const isMobileVerifierOnly = (roles: string[]): boolean =>
  roles.includes(MOBILE_VERIFIER_ROLES.VERIFIER) &&
  roles.every((role) => MOBILE_VERIFIER_ONLY_ROLES.includes(role))

/**
 * A mobile verifier admin (with Admin) can also create organisations and
 * manage users; a mobile verifier member (with Member) can't.
 */
export const isMobileVerifierAdmin = (roles: string[]): boolean =>
  isMobileVerifierOnly(roles) && roles.includes('admin')

export const isMobileVerifierMember = (roles: string[]): boolean =>
  isMobileVerifierOnly(roles) && !roles.includes('admin')

// Pages a mobile-verifier-only user can open. /organizations is matched
// exactly so its sub-pages (billing) stay closed; the rest include sub-pages.
const ORGANIZATIONS_PATH = '/organizations'
const MOBILE_VERIFIER_ONLY_PREFIXES = [
  '/mobile-verifier',
  '/invitations',
  '/developers-setting',
  '/profile',
]
// /create-organization also holds an organisation's Edit settings (?orgId=).
const MOBILE_VERIFIER_ADMIN_PREFIXES = ['/users', '/create-organization']

export const isMobileVerifierOnlyPath = (
  pathname: string,
  isAdmin = false,
): boolean => {
  const prefixes = isAdmin
    ? [...MOBILE_VERIFIER_ONLY_PREFIXES, ...MOBILE_VERIFIER_ADMIN_PREFIXES]
    : MOBILE_VERIFIER_ONLY_PREFIXES
  return (
    pathname === ORGANIZATIONS_PATH ||
    prefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  )
}

/** Where a mobile-verifier-only user lands: the first page they can manage. */
export const mobileVerifierHome = (roles: string[]): string => {
  if (roles.includes(MOBILE_VERIFIER_ROLES.PROOF_TEMPLATE)) {
    return '/mobile-verifier/proof-templates'
  }
  return '/mobile-verifier/verifier-users'
}
