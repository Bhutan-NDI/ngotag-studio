'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IMigration, MigrationStatus } from '../types'
import { Loader2, RefreshCw } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { disasterRestore, listMigrations } from '@/app/api/walletMigration'
import { formatBtt, isWalletMigrationEnabled } from '../config'

import { Breadcrumb } from '@/components/bhutanndi/ui/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { MigrationStatusChip } from './MigrationStatusChip'
import PageContainer from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { isBhutanndiTheme } from '@/lib/active-theme'
import { toast } from 'sonner'

const PAGE_SIZE = 20
const ALL_STATUSES = 'ALL'

const STATUSES: MigrationStatus[] = [
  'CREATED',
  'REHEARSED',
  'SCHEDULED',
  'FROZEN',
  'EXPORTING',
  'IMPORTING',
  'VERIFYING',
  'CUTOVER',
  'STABILISING',
  'ROTATING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'DISASTER_RESTORED',
]

const statusLabel = (status: MigrationStatus): string =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')

/** The platform restores only in the first 48 hours, while the old wallet is kept. */
const canRestore = (migration: IMigration): boolean =>
  migration.status === 'STABILISING' && !migration.purgedAt

interface RestoreDialogProps {
  migration: IMigration | null
  loading: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * The platform refuses a restore without acknowledgeLosses, so the admin
 * ticks what is lost before the button turns on.
 */
function RestoreDialog({
  migration,
  loading,
  onOpenChange,
  onConfirm,
}: Readonly<RestoreDialogProps>): React.JSX.Element {
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    setAcknowledged(false)
  }, [migration?.id])

  return (
    <Dialog open={migration !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore to the shared agent</DialogTitle>
          <DialogDescription>
            Only for an organisation whose new agent is lost for good. It goes
            back to the shared agent and the wallet it kept there.
          </DialogDescription>
        </DialogHeader>
        {migration && (
          <div className="space-y-3 text-sm">
            <p>
              Organisation{' '}
              <span className="font-mono text-xs">{migration.orgId}</span>
              {migration.stabilisationEndsAt &&
                `, first 48 hours end ${formatBtt(migration.stabilisationEndsAt)}`}
              .
            </p>
            <Alert variant="destructive">
              <AlertDescription>
                Everything the new agent recorded since the switch is lost, and
                connections made since then stop working. Citizens have to
                connect again.
              </AlertDescription>
            </Alert>
            <div className="flex items-start gap-2">
              <Checkbox
                id="acknowledge-losses"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
              />
              <Label htmlFor="acknowledge-losses" className="leading-snug">
                I understand what this restore loses.
              </Label>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Keep the new agent
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!acknowledged || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Platform admins: every organisation's wallet move, and the disaster restore
 * for a move whose new agent was lost. The platform refuses anyone else.
 */
export function AllMigrations(): React.JSX.Element {
  const [status, setStatus] = useState<string>(ALL_STATUSES)
  const [pageNumber, setPageNumber] = useState(1)
  const [migrations, setMigrations] = useState<IMigration[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState<IMigration | null>(null)
  const [restoreLoading, setRestoreLoading] = useState(false)

  const load = useCallback(async (): Promise<void> => {
    setLoading(true)
    const result = await listMigrations({
      status: status === ALL_STATUSES ? undefined : (status as MigrationStatus),
      pageNumber,
      pageSize: PAGE_SIZE,
    })
    setLoading(false)
    if (!result.ok) {
      setError(
        result.statusCode === 403
          ? 'Only platform admins can see wallet moves across organisations.'
          : result.message || "Couldn't load wallet moves.",
      )
      return
    }
    setError(null)
    setMigrations(result.data.migrations)
    setTotal(result.data.total)
  }, [status, pageNumber])

  useEffect(() => {
    if (isWalletMigrationEnabled) {
      load()
    }
  }, [load])

  const confirmRestore = async (): Promise<void> => {
    if (!restoring) {
      return
    }
    setRestoreLoading(true)
    const result = await disasterRestore(restoring.orgId)
    setRestoreLoading(false)
    if (!result.ok) {
      toast.error(result.message || "The organisation couldn't be restored.")
      return
    }
    toast.success('Restored to the shared agent.')
    setRestoring(null)
    load()
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
    if (error) {
      return (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }
    if (loading && migrations.length === 0) {
      return <Skeleton className="h-48 w-full" />
    }
    if (migrations.length === 0) {
      return (
        <Card className="text-muted-foreground p-6 text-sm">
          No wallet moves
          {status === ALL_STATUSES ? ' yet' : ' with this status'}.
        </Card>
      )
    }
    return (
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organisation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Last change</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {migrations.map((migration) => (
              <TableRow key={migration.id}>
                <TableCell className="font-mono text-xs">
                  {migration.orgId}
                </TableCell>
                <TableCell>
                  <MigrationStatusChip migration={migration} />
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {formatBtt(migration.createDateTime)}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {formatBtt(migration.lastChangedDateTime)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {migration.error ?? '—'}
                </TableCell>
                <TableCell className="text-right">
                  {canRestore(migration) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRestoring(migration)}
                    >
                      Restore
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    )
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-6xl px-4 pt-2 pb-12">
        {isBhutanndiTheme() && (
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Wallet moves' },
              ]}
            />
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Wallet moves</h1>
            <p className="text-muted-foreground text-sm">
              Every organisation&apos;s move to a dedicated agent.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                setPageNumber(1)
              }}
            >
              <SelectTrigger className="w-48" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                {STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {statusLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={load}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {renderBody()}

        {!error && total > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-end gap-2 text-sm">
            <span className="text-muted-foreground">
              Page {pageNumber} of {pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={pageNumber <= 1 || loading}
              onClick={() => setPageNumber((page) => page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pageNumber >= pages || loading}
              onClick={() => setPageNumber((page) => page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <RestoreDialog
        migration={restoring}
        loading={restoreLoading}
        onOpenChange={(open) => {
          if (!open && !restoreLoading) {
            setRestoring(null)
          }
        }}
        onConfirm={confirmRestore}
      />
    </PageContainer>
  )
}
