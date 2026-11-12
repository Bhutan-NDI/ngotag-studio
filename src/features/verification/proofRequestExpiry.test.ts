import { describe, expect, it } from 'vitest'

import { isExpiredProofRequest } from './proofRequestExpiry'

describe('isExpiredProofRequest', () => {
  it('treats an abandoned request with the request-expired code as expired', () => {
    expect(
      isExpiredProofRequest(
        'abandoned',
        'request-expired: The proof request has expired',
      ),
    ).toBe(true)
  })

  it.each([null, undefined, '', 'abandoned: Proof request declined'])(
    'treats an abandoned request with errorMessage %p as declined',
    (errorMessage) => {
      expect(isExpiredProofRequest('abandoned', errorMessage)).toBe(false)
    },
  )

  it('never marks a request that is not abandoned as expired', () => {
    expect(isExpiredProofRequest('done', 'request-expired: late')).toBe(false)
  })
})
