import {
  ORGANIZATIONS_MAX_PAGE_SIZE,
  collectAllOrganizations,
} from './allOrganizations'
import { describe, expect, it, vi } from 'vitest'

import type { AxiosResponse } from 'axios'

const orgs = (from: number, count: number): { id: string }[] =>
  Array.from({ length: count }, (_, index) => ({ id: `org-${from + index}` }))

const page = (
  organizations: { id: string }[],
  totalPages: number,
): AxiosResponse =>
  ({
    status: 200,
    data: { statusCode: 200, data: { totalPages, organizations } },
  }) as AxiosResponse

describe('collectAllOrganizations', () => {
  it('returns a single page as it is, asking for the largest page size', async () => {
    const only = page(orgs(1, 12), 1)
    const fetchPage = vi.fn().mockResolvedValue(only)

    expect(await collectAllOrganizations(fetchPage)).toBe(only)
    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(fetchPage).toHaveBeenCalledWith(1, ORGANIZATIONS_MAX_PAGE_SIZE)
  })

  it('merges every page, in order, into the first response', async () => {
    const fetchPage = vi.fn((pageNumber: number) => {
      const before = (pageNumber - 1) * 100
      return Promise.resolve(
        page(orgs(before + 1, pageNumber < 3 ? 100 : 5), 3),
      )
    })

    const result = await collectAllOrganizations(fetchPage)

    expect(typeof result).not.toBe('string')
    const merged = (result as AxiosResponse).data.data.organizations
    expect(merged).toHaveLength(205)
    expect(merged[0].id).toBe('org-1')
    expect(merged[204].id).toBe('org-205')
    expect((result as AxiosResponse).data.statusCode).toBe(200)
    expect(fetchPage.mock.calls.map(([pageNumber]) => pageNumber)).toEqual([
      1, 2, 3,
    ])
  })

  it('returns the error when the first page fails', async () => {
    const fetchPage = vi.fn().mockResolvedValue('Network Error')

    expect(await collectAllOrganizations(fetchPage)).toBe('Network Error')
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('returns the error when a later page fails, not a partial list', async () => {
    const fetchPage = vi.fn((pageNumber: number) =>
      Promise.resolve(
        pageNumber === 2 ? 'Request failed' : page(orgs(1, 100), 2),
      ),
    )

    expect(await collectAllOrganizations(fetchPage)).toBe('Request failed')
  })

  it('does not page through a response without an organisation list', async () => {
    const empty = {
      status: 200,
      data: { data: { totalPages: 4 } },
    } as AxiosResponse
    const fetchPage = vi.fn().mockResolvedValue(empty)

    expect(await collectAllOrganizations(fetchPage)).toBe(empty)
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })
})
