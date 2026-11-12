import {
  ProofRequestState,
  REQUEST_EXPIRED_PROBLEM_CODE,
} from '@/features/common/enum'

/**
 * Expired and declined requests both end as abandoned; only the holder's
 * problem-report code (stored as errorMessage) tells them apart.
 */
export const isExpiredProofRequest = (
  state: string,
  errorMessage?: string | null,
): boolean =>
  state === ProofRequestState.abandoned &&
  Boolean(errorMessage?.startsWith(REQUEST_EXPIRED_PROBLEM_CODE))
