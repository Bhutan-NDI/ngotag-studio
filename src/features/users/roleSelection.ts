import { MOBILE_VERIFIER_ROLES } from '@/lib/orgRoleRules'
import { RoleNames } from '@/config/CommonConstant'

// The role dialog's checkbox rules, kept out of EditUserRoleModal so they can
// be unit tested.

export interface RoleI {
  id: string
  name: string
  checked: boolean
  disabled: boolean
}

const isChecked = (roles: RoleI[], name: string): boolean =>
  roles.some((r) => r.name === name && r.checked)

// A mobile verifier (Manage Mobile Verifier, no Issuer/Verifier) is either an
// admin or a member of it, never both: Admin and Member become an either/or.
// Studio users keep Member ticked and locked.
export const isMobileVerifierChoice = (roles: RoleI[]): boolean =>
  isChecked(roles, MOBILE_VERIFIER_ROLES.VERIFIER) &&
  !isChecked(roles, 'issuer') &&
  !isChecked(roles, 'verifier')

export const applyMemberRule = (roles: RoleI[]): RoleI[] => {
  const memberOff = isMobileVerifierChoice(roles) && isChecked(roles, 'admin')
  return roles.map((r) => {
    if (r.name !== RoleNames.MEMBER) {
      return r
    }
    return { ...r, checked: !memberOff, disabled: !memberOff }
  })
}

const handleIssuerOrVerifier = (
  roles: RoleI[],
  role: RoleI,
  checked: boolean,
): RoleI[] =>
  roles.map((r) => {
    if (r.id === role.id) {
      return { ...r, checked }
    }
    if (['verifier', 'issuer', 'member'].includes(r.name)) {
      return { ...r, checked: true }
    }
    return { ...r, checked: false }
  })

const handleAdmin = (roles: RoleI[], role: RoleI, checked: boolean): RoleI[] =>
  roles.map((r) => {
    if (r.id === role.id) {
      return { ...r, checked }
    }
    if (r.name === 'member') {
      return { ...r, checked: true }
    }
    return { ...r, checked: false }
  })

const handleDefault = (
  roles: RoleI[],
  role: RoleI,
  checked: boolean,
): RoleI[] => roles.map((r) => (r.id === role.id ? { ...r, checked } : r))

// Mobile verifier: ticking Member switches from admin to member (Admin is
// unticked, applyMemberRule ticks Member). Ticking Admin needs no handler:
// applyMemberRule unticks Member.
const handleMobileVerifierMember = (roles: RoleI[]): RoleI[] =>
  roles.map((r) => {
    if (r.name === 'admin') {
      return { ...r, checked: false }
    }
    return r
  })

/** The dialog's roles after ticking or unticking one of them. */
export const toggleRole = (
  roles: RoleI[],
  role: RoleI,
  checked: boolean,
): RoleI[] => {
  const mobileVerifier = isMobileVerifierChoice(roles)

  if (['issuer', 'verifier'].includes(role.name) && checked) {
    return applyMemberRule(handleIssuerOrVerifier(roles, role, checked))
  }
  if (mobileVerifier && role.name === RoleNames.MEMBER && checked) {
    return applyMemberRule(handleMobileVerifierMember(roles))
  }
  if (role.name === 'admin' && checked && !mobileVerifier) {
    return applyMemberRule(handleAdmin(roles, role, checked))
  }
  return applyMemberRule(handleDefault(roles, role, checked))
}
