import {
  MobileVerifierResult,
  toMobileVerifierError,
} from '@/lib/mobileVerifierResponse'

import { axiosGet, axiosPatch, axiosPost } from '@/services/apiRequests'

import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export interface IVerifierUserPayload {
  firstName: string
  lastName: string
  username: string
  foundationID: string
  email: string
  verifierRoleId: string
  orgId: string
}

export interface IGetVerifierUsersParams {
  orgId: string
  page: number
  pageSize: number
}

export const getVerifierUsers = async (
  params: IGetVerifierUsersParams,
): Promise<MobileVerifierResult> => {
  const url = `${apiRoutes.mobileVerifier.verifierUser}?orgId=${params.orgId}&page=${params.page}&pageSize=${params.pageSize}`
  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    return toMobileVerifierError(error)
  }
}

export const createVerifierUser = async (
  payload: IVerifierUserPayload,
): Promise<MobileVerifierResult> => {
  const axiosPayload = {
    url: apiRoutes.mobileVerifier.verifierUserCreate,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    return toMobileVerifierError(error)
  }
}

export const updateVerifierUser = async (
  id: string,
  payload: IVerifierUserPayload,
): Promise<MobileVerifierResult> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.verifierUser}/${id}`,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPatch(axiosPayload)
  } catch (error) {
    return toMobileVerifierError(error)
  }
}

export const updateVerifierUserStatus = async (
  id: string,
  orgId: string,
  status: string,
): Promise<MobileVerifierResult> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.verifierUser}/${id}/status?orgId=${orgId}`,
    payload: { status },
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPatch(axiosPayload)
  } catch (error) {
    return toMobileVerifierError(error)
  }
}

// Sends the Mobile Verifier credential offer to the verifier user's email.
export const sendVerifierUserIssuance = async (
  id: string,
  orgId: string,
): Promise<MobileVerifierResult> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.verifierUser}/${id}/send-issuance?orgId=${orgId}`,
    payload: {},
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    return toMobileVerifierError(error)
  }
}

export const inviteVerifierUser = async (
  email: string,
  orgId: string,
): Promise<MobileVerifierResult> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.verifierUser}/invite?orgId=${orgId}`,
    payload: { email },
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    return toMobileVerifierError(error)
  }
}
