import { AxiosResponse } from 'axios'

// The mobile-verifier API wrappers never throw: on a failed request they return the
// backend's error message as a plain string, otherwise the AxiosResponse.
export type MobileVerifierResult = string | AxiosResponse

export const getResultStatusCode = (
  result: MobileVerifierResult | undefined,
): number | undefined => {
  if (typeof result === 'string') {
    return undefined
  }
  return result?.data?.statusCode
}

export const getResultMessage = (
  result: MobileVerifierResult | undefined,
  fallback: string,
): string => {
  if (typeof result === 'string') {
    return result || fallback
  }
  return result?.data?.message || fallback
}

// A "nothing here yet" answer (e.g. an org with no roles) comes back as a 404 error
// message; callers use this to tell that apart from a real failure such as a 403 or 502.
export const isNotFoundMessage = (message: string): boolean =>
  /not found/i.test(message)
