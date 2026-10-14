import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
} from '@/services/apiRequests'

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
  payload: Partial<IProofTemplatePayload>,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.proofTemplate}/${id}`,
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

export const deleteProofTemplate = async (
  id: string,
  orgId: string,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.proofTemplate}/${id}?orgId=${orgId}`,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosDelete(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
