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
  PAUSED_STATUSES,
  isWalletMigrationEnabled,
} from '../config'
import React, { useEffect, useRef, useState } from 'react'
import { describeMigrationError, findMigrationError } from '../errorMessages'
import { useIsOrgOwner, useMigrationStatus } from '../useMigrationStatus'

import type { AxiosResponse } from 'axios'
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
import { getOrganizationById } from '@/app/api/organization'
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

  const [startingNew, setStartingNew] = useState(false)
  const [showMoveDayResult, setShowMoveDayResult] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  // 'shared' | 'dedicated' | 'none' once loaded; a move only makes sense from
  // the shared agent, so the page must not offer it otherwise.
  const [agentType, setAgentType] = useState<string | null>(null)
  const [agentTypeError, setAgentTypeError] = useState(false)

  useEffect(() => {
    if (!orgId || !isWalletMigrationEnabled) {
      return
    }
    setAgentType(null)
    setAgentTypeError(false)
    getOrganizationById(orgId).then((response) => {
      if (typeof response === 'string') {
        setAgentTypeError(true)
        return
      }
      const agents = (response as AxiosResponse)?.data?.data?.org_agents ?? []
      const agent = agents[0]?.org_agent_type?.agent as string | undefined
      setAgentType(agent ? agent.toLowerCase() : 'none')
    })
  }, [orgId])
  const sawMoveDay = useRef(false)
  const initialOrgId = useRef(orgId)

  // A move belongs to one organisation. If the user switches organisation
  // from the dropdown while here, take them to the Dashboard instead of
  // showing the other org's move page.
  useEffect(() => {
    if (!initialOrgId.current) {
      initialOrgId.current = orgId
      return
    }
    if (orgId && orgId !== initialOrgId.current) {
      router.replace('/dashboard')
    }
  }, [orgId, router])

  const status = migration?.status

  // Keep showing the move-day success panel once the switch finishes, until
  // the owner opens the dashboard (SCR-WM-05 → SCR-WM-06).
  useEffect(() => {
    if (status && PAUSED_STATUSES.includes(status)) {
      sawMoveDay.current = true
    }
    if (status === 'STABILISING' && sawMoveDay.current) {
      sawMoveDay.current = false
      setShowMoveDayResult(true)
    }
  }, [status])

  const confirmCancel = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    setCancelling(true)
    setCancelError(null)
    const result = await cancelMigration(orgId)
    setCancelling(false)
    if (!result.ok) {
      // Keep the dialog open: the move is still planned on the server.
      setCancelError(
        `The move wasn't cancelled and is still planned. ${describeMigrationError(
          result.code,
          result.message,
        )}`,
      )
      return
    }
    setCancelOpen(false)
    applyResult({ ok: true, data: result.data })
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
    if (!migration || startingNew) {
      if (agentTypeError) {
        return (
          <Alert variant="destructive">
            <AlertDescription>
              Couldn&apos;t load your organisation&apos;s agent details. Refresh
              to try again.
            </AlertDescription>
          </Alert>
        )
      }
      if (agentType === null) {
        return <Skeleton className="h-32 w-full" />
      }
      if (agentType !== 'shared') {
        return (
          <Card className="text-muted-foreground p-6 text-sm">
            {agentType === 'dedicated'
              ? "This organisation already runs on its own dedicated agent. There's nothing to move."
              : "This organisation doesn't have a wallet yet. Moving applies only to organisations on the shared agent."}
          </Card>
        )
      }
      return isOwner ? (
        <StartMoveForm
          orgId={orgId}
          onStarted={(data) => {
            setStartingNew(false)
            applyResult({ ok: true, data: data.migration })
          }}
          onCancel={() => {
            if (startingNew) {
              setStartingNew(false)
            } else {
              router.push('/dashboard')
            }
          }}
        />
      ) : (
        <Card className="text-muted-foreground p-6 text-sm">
          No move is in progress. Only the organisation owner can start a move.
        </Card>
      )
    }

    const { status: current } = migration
    const startNew = (): void => setStartingNew(true)

    if (current === 'FAILED') {
      // The platform keeps a cancelled or failed move; a new move starts over.
      if (
        migration.error === 'CANCELLED_BY_OWNER' ||
        !migration.freezeDeadline
      ) {
        // Ended before move day. The code's own recovery (re-run the checks,
        // pick a new time) applies to a live move, not this one, so only its
        // message is shown.
        const ended =
          migration.error === 'CANCELLED_BY_OWNER'
            ? 'The move was cancelled. Nothing changed.'
            : (findMigrationError(migration.error)?.message ??
              "The move couldn't go ahead and was cancelled. Nothing changed.")
        return (
          <Card className="p-6 text-sm">
            <p className="font-medium">{ended}</p>
            <p className="text-muted-foreground mt-1">
              Your organisation stays on the shared agent. Start a new move when
              you&apos;re ready.
            </p>
            {migration.error && migration.error !== 'CANCELLED_BY_OWNER' && (
              <p className="text-muted-foreground mt-1 text-xs">
                Reference: {migration.error}
              </p>
            )}
            {isOwner && agentType === 'shared' && (
              <Button size="sm" className="mt-4" onClick={startNew}>
                Start a new move
              </Button>
            )}
          </Card>
        )
      }
      return (
        <MoveDayProgress
          migration={migration}
          isOwner={isOwner && agentType === 'shared'}
          onStartNewMove={startNew}
          onOpenDashboard={() => undefined}
        />
      )
    }
    if (PAUSED_STATUSES.includes(current) || showMoveDayResult) {
      return (
        <MoveDayProgress
          migration={migration}
          isOwner={isOwner}
          onStartNewMove={startNew}
          onOpenDashboard={() => setShowMoveDayResult(false)}
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
        onResult={(updated) => applyResult({ ok: true, data: updated })}
      />
    )
  }

  const canCancel =
    isOwner && migration && CANCELLABLE_STATUSES.includes(migration.status)

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-3xl px-4 pt-2 pb-12">
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

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
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

        {(canCancel ||
          (MOCK_MIGRATION_API &&
            isWalletMigrationEnabled &&
            isOwner &&
            migration)) && (
          <div className="border-border mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            {MOCK_MIGRATION_API &&
            isWalletMigrationEnabled &&
            isOwner &&
            orgId &&
            migration ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  resetMockMigration(orgId)
                  applyResult({ ok: true, data: null })
                }}
              >
                Reset demo data
              </Button>
            ) : (
              <span />
            )}
            {canCancel && (
              <Button variant="outline" onClick={() => setCancelOpen(true)}>
                Cancel move
              </Button>
            )}
          </div>
        )}
      </div>

      {/* P-02 low severity: plain confirm. */}
      <AlertDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open)
          setCancelError(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel the move?</AlertDialogTitle>
            <AlertDialogDescription>
              Nothing has changed yet. Your organisation stays on the shared
              agent, and you can start a new move later.
            </AlertDialogDescription>
            {cancelError && (
              <p role="alert" className="text-destructive text-sm">
                {cancelError}
              </p>
            )}
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
