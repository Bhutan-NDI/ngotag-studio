import {
  ProofRequestState,
  REQUEST_EXPIRED_ERROR_PREFIX,
} from '@/features/common/enum'

/**
 * Expired and declined requests both end as abandoned; only the errorMessage
 * the holder's problem report leaves behind tells them apart.
 */
export const isExpiredProofRequest = (
  state: string,
  errorMessage?: string | null,
): boolean =>
  state === ProofRequestState.abandoned &&
  Boolean(errorMessage?.startsWith(REQUEST_EXPIRED_ERROR_PREFIX))
