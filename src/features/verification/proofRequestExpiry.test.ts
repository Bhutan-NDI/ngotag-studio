import { describe, expect, it } from 'vitest'

import { isExpiredProofRequest } from './proofRequestExpiry'

describe('isExpiredProofRequest', () => {
  it('treats an abandoned request with the request-expired code as expired', () => {
    expect(
      isExpiredProofRequest('abandoned', 'abandoned: request-expired'),
    ).toBe(true)
  })

  it.each([
    null,
    undefined,
    '',
    'abandoned: Proof request declined',
    // The bare description without Credo's code prefix is not what gets stored.
    'request-expired: The proof request has expired',
  ])(
    'treats an abandoned request with errorMessage %p as declined',
    (errorMessage) => {
      expect(isExpiredProofRequest('abandoned', errorMessage)).toBe(false)
    },
  )

  it('never marks a request that is not abandoned as expired', () => {
    expect(isExpiredProofRequest('done', 'abandoned: request-expired')).toBe(
      false,
    )
  })
})
