import {
  setOrgId,
  setOrgInfo,
  setOrgRoles,
  setSelectedOrgId,
  setTenantData,
} from './orgSlice'

import { AppDispatch } from './store'
import { AxiosResponse } from 'axios'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationRoles } from '@/app/api/organization'

export interface SwitchableOrg {
  id: string
  name: string
  logoUrl?: string
  description?: string
  appLaunchDetails?: object[]
  // The user's roles in this organisation, from the organisation list.
  userOrgRoles?: { orgRole: { name: string } }[]
}

/**
 * The one real "switch active organization" sequence: set the org as
 * active, mirror its tenant summary into redux, and refresh the caller's
 * roles for it. Both the sidebar's org switcher (org-switcher.tsx) and the
 * bhutanndi Organizations list (OrganizationList.tsx) call this rather than
 * each keeping their own copy, so a future change to the sequence can't
 * silently drift between the two.
 */
export async function switchOrganization(
  dispatch: AppDispatch,
  org: SwitchableOrg,
): Promise<void> {
  dispatch(setOrgId(org.id))
  dispatch(setSelectedOrgId(org.id))
  dispatch(setTenantData({ id: org.id, name: org.name, logoUrl: org.logoUrl }))
  // Stored with the switch, so nothing goes on using the previous
  // organisation's roles until the top bar fetches the list again.
  if (org.userOrgRoles) {
    dispatch(
      setOrgInfo({
        id: org.id,
        name: org.name,
        description: org.description,
        logoUrl: org.logoUrl,
        appLaunchDetails: org.appLaunchDetails,
        roles: org.userOrgRoles.map((role) => role.orgRole.name),
      }),
    )
  }

  try {
    const response = await getOrganizationRoles(org.id)
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      dispatch(setOrgRoles(data?.data ?? []))
    }
  } catch (error) {
    console.error('Error fetching organization roles:', error)
  }
}
