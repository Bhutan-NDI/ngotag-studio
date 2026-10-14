import { axiosGet, axiosPatch, axiosPost } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
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
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.mobileVerifier.verifierUser}?orgId=${params.orgId}&page=${params.page}&pageSize=${params.pageSize}`
  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const createVerifierUser = async (
  payload: IVerifierUserPayload,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: apiRoutes.mobileVerifier.verifierUserCreate,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const updateVerifierUser = async (
  id: string,
  payload: IVerifierUserPayload,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.verifierUser}/${id}`,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPatch(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const updateVerifierUserStatus = async (
  id: string,
  orgId: string,
  status: string,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.verifierUser}/${id}/status?orgId=${orgId}`,
    payload: { status },
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPatch(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const inviteVerifierUser = async (
  email: string,
  orgId: string,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.verifierUser}/invite?orgId=${orgId}`,
    payload: { email },
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
