// src/lib/orgSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
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

// A platform admin holds every role in every organisation, member or not: the
// platform lets platform_admin through every organisation's role checks. The
// selected organisation's roles carry these too, so each page's own role
// checks treat a platform admin as the owner.
const PLATFORM_ADMIN_ORG_ROLES = [
  'owner',
  'ALLOW_VERIFIER',
  'ALLOW_PROOF_TEMPLATE',
]

const withPlatformAdminRoles = (
  orgInfo: OrgInfo | null,
  isPlatformAdmin: boolean | null,
): OrgInfo | null => {
  if (!orgInfo || !isPlatformAdmin) {
    return orgInfo
  }
  const roles = [...orgInfo.roles]
  PLATFORM_ADMIN_ORG_ROLES.forEach((role) => {
    if (!roles.includes(role)) {
      roles.push(role)
    }
  })
  return { ...orgInfo, roles }
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
      state.orgInfo = withPlatformAdminRoles(
        action.payload,
        state.isPlatformAdmin,
      )
    },
    setIsPlatformAdmin: (state, action: PayloadAction<boolean>) => {
      state.isPlatformAdmin = action.payload
      state.orgInfo = withPlatformAdminRoles(state.orgInfo, action.payload)
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
