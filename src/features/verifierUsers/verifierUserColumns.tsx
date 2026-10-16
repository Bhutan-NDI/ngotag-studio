import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Send, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IColumnData } from '@/components/ui/generic-table-component/columns'

export interface VerifierUser {
  id: string
  email: string
  orgId: string
  roleId?: string | null
  role?: { id: string; role: string } | null
  holderDid?: string | null
  revocationStatus?: string | null
  createdAt?: string
  // Fields returned by the org's registered verifier-user webhook (external client
  // system), fetched instead of the platform's own DB — see verifier-webhook.
  username?: string | null
  foundationID?: string | null
  firstName?: string | null
  lastName?: string | null
  verifierRoleId?: string | null
  verifierRoleName?: string | null
  inviteId?: string | null
  relationshipDID?: string | null
  holderDID?: string | null
  statusId?: number | null
}

// The client's own system returns a numeric statusId rather than a status name.
const VERIFIER_USER_STATUS_BY_ID: Record<number, string> = {
  1: 'CREATED',
  2: 'INVITED',
  3: 'ACTIVE',
  4: 'SUSPENDED',
  5: 'REVOKED',
}

export const getVerifierUserStatus = (verifierUser: VerifierUser): string =>
  VERIFIER_USER_STATUS_BY_ID[verifierUser.statusId ?? -1] ??
  verifierUser.revocationStatus ??
  'CREATED'

// Issuing a fresh credential to a suspended or revoked user would undo the revocation.
const isIssuanceBlocked = (verifierUser: VerifierUser): boolean => {
  const status = getVerifierUserStatus(verifierUser)
  return status === 'SUSPENDED' || status === 'REVOKED'
}

interface GetVerifierUserColumnDataParams {
  invitingId: string | null
  issuingId: string | null
  canManage: boolean
  onInvite: (verifierUser: VerifierUser) => void
  onIssue: (verifierUser: VerifierUser) => void
  onEdit: (verifierUser: VerifierUser) => void
  onStatus: (verifierUser: VerifierUser) => void
}

export const getVerifierUserColumnData = ({
  invitingId,
  issuingId,
  canManage,
  onInvite,
  onIssue,
  onEdit,
  onStatus,
}: GetVerifierUserColumnDataParams): IColumnData[] => [
  {
    id: 'foundationID',
    title: 'Foundation ID',
    accessorKey: 'foundationID',
    cell: ({ row }) => <span>{row.original.foundationID ?? 'NA'}</span>,
    columnFunction: [],
  },
  {
    id: 'username',
    title: 'Username',
    accessorKey: 'username',
    cell: ({ row }) => <span>{row.original.username ?? 'NA'}</span>,
    columnFunction: [],
  },
  {
    id: 'email',
    title: 'Email',
    accessorKey: 'email',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.email || 'NA'}</span>
    ),
    columnFunction: [],
  },
  {
    id: 'role',
    title: 'Role',
    accessorKey: 'verifierRoleName',
    // The role name is kept on the client's own record. Users created before it was stored there
    // have none: show it empty (never the role id) until the user is edited and it gets saved.
    cell: ({ row }) => <span>{row.original.verifierRoleName ?? ''}</span>,
    columnFunction: [],
  },
  {
    id: 'status',
    title: 'Status',
    accessorKey: 'revocationStatus',
    cell: ({ row }) => <span>{getVerifierUserStatus(row.original)}</span>,
    columnFunction: [],
  },
  {
    id: 'invite',
    title: 'Invite',
    accessorKey: 'invite',
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        disabled={!canManage || invitingId === row.original.id}
        onClick={() => onInvite(row.original)}
      >
        {invitingId === row.original.id ? 'Inviting...' : 'Invite'}
      </Button>
    ),
    columnFunction: [],
  },
  {
    id: 'actions',
    title: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            disabled={!canManage}
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={
              !canManage ||
              issuingId === row.original.id ||
              isIssuanceBlocked(row.original)
            }
            title={
              isIssuanceBlocked(row.original)
                ? 'A suspended or revoked user cannot be issued a credential'
                : undefined
            }
            onClick={() => onIssue(row.original)}
          >
            <Send className="mr-2 h-4 w-4" />
            {issuingId === row.original.id ? 'Sending...' : 'Send credential'}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!canManage}
            onClick={() => onStatus(row.original)}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    columnFunction: [],
  },
]
