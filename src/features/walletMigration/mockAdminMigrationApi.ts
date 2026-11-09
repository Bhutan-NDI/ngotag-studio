// Dummy data for the platform admins' routes: every demo move saved in this
// browser, and the disaster restore. Shares the owner demo's records and
// timeline (mockMigrationApi).

import {
  IListMigrationsQuery,
  IMigration,
  IMigrationList,
  MigrationResult,
} from './types'
import {
  IMockRecord,
  derive,
  iso,
  load,
  notFound,
  save,
  storageKey,
  wait,
} from './mockMigrationApi'

export const mockListMigrations = async ({
  targetOrgId,
  status,
  pageNumber = 1,
  pageSize = 20,
}: IListMigrationsQuery): Promise<MigrationResult<IMigrationList>> => {
  await wait()
  const prefix = storageKey('')
  const records: IMockRecord[] = []
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      const record = key?.startsWith(prefix)
        ? load(key.slice(prefix.length))
        : null
      if (record) {
        records.push(record)
      }
    }
  } catch {
    // Storage blocked: no demo moves to list.
  }
  const now = Date.now()
  const migrations = records
    .map((record) => derive(record, now))
    .filter(
      (m) =>
        (!targetOrgId || m.orgId === targetOrgId) &&
        (!status || m.status === status),
    )
    .sort((a, b) => b.createDateTime.localeCompare(a.createDateTime))
  const start = (pageNumber - 1) * pageSize
  return {
    ok: true,
    data: {
      total: migrations.length,
      migrations: migrations.slice(start, start + pageSize),
    },
  }
}

export const mockDisasterRestore = async (
  orgId: string,
): Promise<MigrationResult<IMigration>> => {
  await wait()
  const record = load(orgId)
  if (!record) {
    return notFound()
  }
  const current = derive(record, Date.now())
  if (current.status !== 'STABILISING' || current.purgedAt) {
    return {
      ok: false,
      message:
        'Only a move in its first 48 hours, with the old wallet still kept, can be restored.',
    }
  }
  const next = { ...record, restoredAt: iso(Date.now()) }
  save(next)
  return { ok: true, data: derive(next, Date.now()) }
}
