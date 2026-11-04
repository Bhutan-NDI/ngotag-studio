// src/lib/orgSlice.ts
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
interface Tenant {
  id: string
  name: string
  logoUrl?: string
}
interface OrgInfo {
  id?: string
  name?: string
  description?: string
  logoUrl?: string
  roles: string[]
  appLaunchDetails?: object[]
}

interface OrgState {
  orgId: string
  ledgerId: string
  selectedOrgId: string
  orgInfo: OrgInfo | null
  orgRoles: string[]
  selectedTenant: Tenant | null
  // null until the user's profile has been checked.
  isPlatformAdmin: boolean | null
}

const initialState: OrgState = {
  orgId: '',
  ledgerId: '',
  selectedOrgId: '',
  orgInfo: null,
  orgRoles: [],
  selectedTenant: null,
  isPlatformAdmin: null,
}

const orgSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrgId: (state, action: PayloadAction<string>) => {
      state.orgId = action.payload
    },
    setLedgerId: (state, action: PayloadAction<string>) => {
      state.ledgerId = action.payload
    },
    setOrgInfo: (state, action: PayloadAction<OrgInfo>) => {
      state.orgInfo = action.payload
    },
    setIsPlatformAdmin: (state, action: PayloadAction<boolean>) => {
      state.isPlatformAdmin = action.payload
    },
    setSelectedOrgId: (state, action: PayloadAction<string>) => {
      state.selectedOrgId = action.payload
    },
    setOrgRoles: (state, action: PayloadAction<string[]>) => {
      state.orgRoles = action.payload
    },
    setTenantData: (state, action: PayloadAction<Tenant | null>) => {
      state.selectedTenant = action.payload
    },
    clearOrgId: (state) => {
      state.orgId = ''
    },
    clearLedgerId: (state) => {
      state.ledgerId = ''
    },
    clearOrgInfo: (state) => {
      state.orgInfo = null
    },
    resetOrgState: () => initialState,
  },
})

export const {
  setOrgId,
  setLedgerId,
  setOrgInfo,
  setSelectedOrgId,
  setOrgRoles,
  clearOrgId,
  clearLedgerId,
  clearOrgInfo,
  resetOrgState,
  setTenantData,
  setIsPlatformAdmin,
} = orgSlice.actions
export default orgSlice.reducer

// A platform admin holds every role in every organisation, member or not: the
// platform lets platform_admin through every organisation's role checks.
// Added when the roles are read, never stored, so they go away as soon as the
// flag does.
const PLATFORM_ADMIN_ORG_ROLES = [
  'owner',
  'ALLOW_VERIFIER',
  'ALLOW_PROOF_TEMPLATE',
]

interface OrgRootState {
  organization: OrgState
}

/**
 * The selected organisation's roles, or null while they aren't known:
 * orgInfo is missing, or still describes the previous organisation after
 * orgId has changed.
 */
export const selectSelectedOrgRoles = createSelector(
  [
    (state: OrgRootState): OrgInfo | null => state.organization.orgInfo,
    (state: OrgRootState): string => state.organization.orgId,
    (state: OrgRootState): boolean | null => state.organization.isPlatformAdmin,
  ],
  (orgInfo, orgId, isPlatformAdmin): string[] | null => {
    if (!orgInfo || (orgId && orgInfo.id !== orgId)) {
      return null
    }
    if (!isPlatformAdmin) {
      return orgInfo.roles
    }
    const roles = [...orgInfo.roles]
    PLATFORM_ADMIN_ORG_ROLES.forEach((role) => {
      if (!roles.includes(role)) {
        roles.push(role)
      }
    })
    return roles
  },
)
