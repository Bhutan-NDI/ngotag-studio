'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CANCELLABLE_STATUSES,
  MOCK_MIGRATION_API,
  isWalletMigrationEnabled,
} from '../config'
import React, { useEffect, useRef, useState } from 'react'
import { useIsOrgOwner, useMigrationStatus } from '../useMigrationStatus'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/bhutanndi/ui/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChecksRehearsalSchedule } from './ChecksRehearsalSchedule'
import { MigrationStatusChip } from './MigrationStatusChip'
import { MoveDashboard } from './MoveDashboard'
import { MoveDayProgress } from './MoveDayProgress'
import PageContainer from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { StartMoveForm } from './StartMoveForm'
import { cancelMigration } from '@/app/api/walletMigration'
import { isBhutanndiTheme } from '@/lib/active-theme'
import { resetMockMigration } from '../mockMigrationApi'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

/**
 * /wallet-migration: one page for the whole move (UXD-01). The view follows
 * the server status, so the page can be closed and reopened at any time
 * (UXD-04). Org members get the same screens read-only.
 */
export default function MigrationWizard(): React.JSX.Element {
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const orgName =
    useAppSelector((state) => state.organization.orgInfo?.name) ?? ''
  const isOwner = useIsOrgOwner()
  const { migration, loading, error, refresh, applyResult } =
    useMigrationStatus(orgId)

  const [rescheduling, setRescheduling] = useState(false)
  const [showMoveDayResult, setShowMoveDayResult] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const sawMoveDay = useRef(false)

  const status = migration?.status

  // Keep showing the move-day success panel once the switch finishes, until
  // the owner opens the dashboard (SCR-WM-05 → SCR-WM-06).
  useEffect(() => {
    if (status === 'FROZEN' || status === 'CUTOVER') {
      sawMoveDay.current = true
    }
    if (status === 'STABILISING' && sawMoveDay.current) {
      sawMoveDay.current = false
      setShowMoveDayResult(true)
    }
    if (status !== 'FAILED') {
      setRescheduling(false)
    }
  }, [status])

  const confirmCancel = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    setCancelling(true)
    const result = await cancelMigration(orgId)
    setCancelling(false)
    setCancelOpen(false)
    if (result.ok) {
      applyResult({ ok: true, data: null })
    }
  }

  const renderBody = (): React.ReactNode => {
    if (!isWalletMigrationEnabled) {
      return (
        <Alert>
          <AlertDescription>
            Moving to a dedicated agent isn&apos;t available yet.
          </AlertDescription>
        </Alert>
      )
    }
    if (!orgId) {
      return (
        <Alert>
          <AlertDescription>
            Select an organisation to continue.
          </AlertDescription>
        </Alert>
      )
    }
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    }
    if (error && !migration) {
      return (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-4">
            Couldn&apos;t load move status. Refresh to try again.
            <Button size="sm" variant="outline" onClick={refresh}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )
    }
    if (!migration) {
      return isOwner ? (
        <StartMoveForm
          orgId={orgId}
          onStarted={(data) => applyResult({ ok: true, data })}
          onCancel={() => router.push('/dashboard')}
        />
      ) : (
        <Card className="text-muted-foreground p-6 text-sm">
          No move is in progress. Only the organisation owner can start a move.
        </Card>
      )
    }

    const { status: current } = migration
    if (current === 'FROZEN' || current === 'CUTOVER' || showMoveDayResult) {
      return (
        <MoveDayProgress
          migration={migration}
          isOwner={isOwner}
          onReschedule={() => setRescheduling(true)}
          onOpenDashboard={() => setShowMoveDayResult(false)}
        />
      )
    }
    if (current === 'FAILED' && !rescheduling) {
      return (
        <MoveDayProgress
          migration={migration}
          isOwner={isOwner}
          onReschedule={() => setRescheduling(true)}
          onOpenDashboard={() => undefined}
        />
      )
    }
    if (
      ['STABILISING', 'ROTATING', 'COMPLETED', 'DISASTER_RESTORED'].includes(
        current,
      )
    ) {
      return <MoveDashboard migration={migration} />
    }
    return (
      <ChecksRehearsalSchedule
        orgId={orgId}
        orgName={orgName}
        migration={migration}
        isOwner={isOwner}
        onResult={applyResult}
      />
    )
  }

  const canCancel =
    isOwner && migration && CANCELLABLE_STATUSES.includes(migration.status)

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-3xl px-4 pt-2 pb-10">
        {isBhutanndiTheme() && (
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Move to dedicated agent' },
              ]}
            />
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">
              Move to dedicated agent
            </h1>
            {orgName && (
              <p className="text-muted-foreground text-sm">{orgName}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {migration && <MigrationStatusChip migration={migration} />}
            {MOCK_MIGRATION_API && isWalletMigrationEnabled && (
              <Badge variant="outline" className="text-xs">
                Demo data
              </Badge>
            )}
          </div>
        </div>

        {!isOwner && migration && (
          <Alert className="mb-4">
            <AlertDescription>
              You can follow the move here. Only the organisation owner can make
              changes.
            </AlertDescription>
          </Alert>
        )}

        {renderBody()}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {canCancel && (
            <Button variant="outline" onClick={() => setCancelOpen(true)}>
              Cancel move
            </Button>
          )}
          {MOCK_MIGRATION_API &&
            isWalletMigrationEnabled &&
            orgId &&
            migration && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetMockMigration(orgId)
                  applyResult({ ok: true, data: null })
                }}
              >
                Reset demo data
              </Button>
            )}
        </div>
      </div>

      {/* P-02 low severity: plain confirm. */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel the move?</AlertDialogTitle>
            <AlertDialogDescription>
              Nothing has changed yet. Your organisation stays on the shared
              agent, and you can start a new move later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep the move</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelling}
              onClick={(e) => {
                e.preventDefault()
                confirmCancel()
              }}
            >
              Cancel move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
