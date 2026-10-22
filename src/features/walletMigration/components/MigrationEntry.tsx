'use client'

import { useIsOrgOwner, useMigrationStatus } from '../useMigrationStatus'

import { Button } from '@/components/ui/button'
import { MigrationStatusChip } from './MigrationStatusChip'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { isWalletMigrationEnabled } from '../config'
import { useRouter } from 'next/navigation'

interface MigrationEntryProps {
  orgId: string
  /** org_agent_type.agent, e.g. "shared" or "dedicated". */
  agentType?: string
}

function MigrationEntryInner({
  orgId,
  agentType,
}: Readonly<MigrationEntryProps>): React.JSX.Element | null {
  const router = useRouter()
  const isOwner = useIsOrgOwner()
  const { migration, loading, error, refresh } = useMigrationStatus(orgId)
  const isShared = agentType?.toLowerCase() === 'shared'

  if (loading) {
    return <Skeleton className="h-6 w-48" />
  }
  if (error && !migration) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          Couldn&apos;t load move status. Refresh to try again.
        </span>
        <Button size="sm" variant="outline" onClick={refresh}>
          Retry
        </Button>
      </div>
    )
  }

  if (migration) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <MigrationStatusChip migration={migration} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push('/wallet-migration')}
        >
          {migration.status === 'COMPLETED'
            ? 'View summary'
            : 'View move progress'}
        </Button>
      </div>
    )
  }

  // No move yet: only the owner of a shared-agent org can start one.
  if (isShared && isOwner) {
    return (
      <Button size="sm" onClick={() => router.push('/wallet-migration')}>
        Move to dedicated agent
      </Button>
    )
  }
  return null
}

/** SCR-WM-01: move entry button and status chip on the Wallet tab. */
export function MigrationEntry(
  props: Readonly<MigrationEntryProps>,
): React.JSX.Element | null {
  if (!isWalletMigrationEnabled) {
    return null
  }
  return <MigrationEntryInner {...props} />
}
