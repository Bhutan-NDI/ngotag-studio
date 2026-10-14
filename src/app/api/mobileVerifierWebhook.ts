import { axiosGet, axiosPost } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export interface IWebhookAuthenticationV1 {
  url: string
  grantType: string
  clientId: string
  clientSecret: string
}

export interface IWebhookAuthenticationV2 {
  token: string
}

export interface IWebhookPayload {
  webhookId: string
  webhookUrl: string
  authentication: {
    type: 'OAuth2'
    version: 'v1' | 'v2'
    data: IWebhookAuthenticationV1 | IWebhookAuthenticationV2
  }
}

export const getWebhook = async (
  orgId: string,
  webhookId?: string,
): Promise<string | AxiosResponse> => {
  const url = webhookId
    ? `${apiRoutes.mobileVerifier.webhook}?orgId=${orgId}&webhookId=${encodeURIComponent(webhookId)}`
    : `${apiRoutes.mobileVerifier.webhook}?orgId=${orgId}`
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

export const registerWebhook = async (
  payload: IWebhookPayload,
  orgId: string,
): Promise<string | AxiosResponse> => {
  const axiosPayload = {
    url: `${apiRoutes.mobileVerifier.webhookRegister}?orgId=${orgId}`,
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
