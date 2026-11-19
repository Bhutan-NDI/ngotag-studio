import type { AxiosResponse } from 'axios'

/** The platform rejects a larger pageSize on GET /orgs. */
export const ORGANIZATIONS_MAX_PAGE_SIZE = 100

/** Guards against a platform that reports a runaway totalPages. */
const MAX_PAGES = 50

type FetchPage = (
  pageNumber: number,
  pageSize: number,
) => Promise<AxiosResponse | string>

/**
 * Fetches every page of the user's organisations and returns the first page's
 * response with all of them in `data.data.organizations`, so callers read it
 * exactly like a single getOrganizations() page.
 *
 * Anything that needs the user's full list (the organisation switcher, and
 * the checks that the selected organisation is still one of theirs) must use
 * this: reading only the first page hides every organisation after it, and
 * makes those checks fall back to the first organisation.
 *
 * Returns the error string of the first page that fails, like
 * getOrganizations() does.
 */
export const collectAllOrganizations = async (
  fetchPage: FetchPage,
): Promise<AxiosResponse | string> => {
  const first = await fetchPage(1, ORGANIZATIONS_MAX_PAGE_SIZE)
  if (typeof first === 'string') {
    return first
  }

  const firstData = first?.data?.data
  const totalPages = Math.min(Number(firstData?.totalPages) || 1, MAX_PAGES)
  if (!Array.isArray(firstData?.organizations) || totalPages <= 1) {
    return first
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage(index + 2, ORGANIZATIONS_MAX_PAGE_SIZE),
    ),
  )
  const failed = rest.find((page) => typeof page === 'string')
  if (typeof failed === 'string') {
    return failed
  }

  const organizations = [
    ...firstData.organizations,
    ...(rest as AxiosResponse[]).flatMap(
      (page) => page?.data?.data?.organizations ?? [],
    ),
  ]
  return {
    ...first,
    data: { ...first.data, data: { ...firstData, organizations } },
  }
}
