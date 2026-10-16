import { AxiosResponse } from 'axios'

// A failed mobile-verifier request. `HandleResponse` attaches the HTTP status to the
// error it throws; the API wrappers keep it here so callers can branch on the status
// instead of matching message text.
export interface MobileVerifierError {
  message: string
  statusCode?: number
}

// The mobile-verifier API wrappers never throw: they return the AxiosResponse, or the
// error of a failed request.
export type MobileVerifierResult = AxiosResponse | MobileVerifierError

export const toMobileVerifierError = (error: unknown): MobileVerifierError => {
  const err = error as { message?: string; statusCode?: number } | undefined
  return {
    message: err?.message ?? 'Something went wrong, please try later...',
    statusCode: err?.statusCode,
  }
}

export const isMobileVerifierError = (
  result: MobileVerifierResult | undefined,
): result is MobileVerifierError => Boolean(result) && !('status' in result!)

export const getResultStatusCode = (
  result: MobileVerifierResult | undefined,
): number | undefined => {
  if (!result || isMobileVerifierError(result)) {
    return undefined
  }
  return result.data?.statusCode
}

export const getResultMessage = (
  result: MobileVerifierResult | undefined,
  fallback: string,
): string => {
  if (!result) {
    return fallback
  }
  if (isMobileVerifierError(result)) {
    return result.message || fallback
  }
  return result.data?.message || fallback
}

// "Nothing here yet" (e.g. an org with no roles) is a 404; any other failure (401, 403,
// 502, network) is a real error that must not be shown as an empty list.
export const isNotFoundError = (
  result: MobileVerifierResult | undefined,
): boolean => isMobileVerifierError(result) && result.statusCode === 404
