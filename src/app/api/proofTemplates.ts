import { axiosGet, axiosPatch, axiosPost } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export interface IProofTemplatePayload {
  templateId: string
  name: string
  orgId: string
  description: string
  version: string
  payload: Record<string, unknown>
  verifierRoleIds?: string[]
}

export interface IGetRoleProofTemplatesParams {
  orgId: string
  roleId: string
  page: number
  pageSize: number
  search?: string
}

export interface IGetProofTemplatesParams {
  orgId: string
  page: number
  pageSize: number
  search?: string
}

// Every template of the organization, whether or not it is mapped to a verifier role.
export const getProofTemplates = async (
  params: IGetProofTemplatesParams,
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.mobileVerifier.proofTemplate}?orgId=${params.orgId}&page=${params.page}&pageSize=${params.pageSize}&search=${encodeURIComponent(params.search ?? '')}`
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

// One template by id, including the roles it is mapped to.
export const getProofTemplateById = async (
  orgId: string,
  id: string,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.proofTemplate}?orgId=${orgId}&id=${id}`,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getRoleProofTemplates = async (
  params: IGetRoleProofTemplatesParams,
): Promise<string | AxiosResponse> => {
  const url = `${apiRoutes.mobileVerifier.proofTemplateRole}?orgId=${params.orgId}&roleId=${params.roleId}&page=${params.page}&pageSize=${params.pageSize}&search=${encodeURIComponent(params.search ?? '')}`
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

export const createProofTemplate = async (
  payload: IProofTemplatePayload,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: apiRoutes.mobileVerifier.proofTemplate,
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

export const updateProofTemplate = async (
  id: string,
  orgId: string,
  payload: Partial<IProofTemplatePayload>,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.proofTemplate}/${id}?orgId=${orgId}`,
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
