import { axiosGet, axiosPatch, axiosPost } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export interface IVerifierRolePayload {
  role: string
  orgId: string
}

export interface IGetVerifierRolesParams {
  orgId: string
  page: number
  pageSize: number
}

export const getVerifierRoles = async (
  params: IGetVerifierRolesParams,
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.mobileVerifier.verifierRole}?orgId=${params.orgId}&page=${params.page}&pageSize=${params.pageSize}`
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

export const createVerifierRole = async (
  payload: IVerifierRolePayload,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: apiRoutes.mobileVerifier.verifierRoleCreate,
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

export const updateVerifierRole = async (
  id: string,
  payload: IVerifierRolePayload,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.verifierRole}/${id}`,
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
