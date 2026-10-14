import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, ShieldAlert } from 'lucide-react'

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

interface GetVerifierUserColumnDataParams {
  invitingId: string | null
  canManage: boolean
  onInvite: (verifierUser: VerifierUser) => void
  onEdit: (verifierUser: VerifierUser) => void
  onStatus: (verifierUser: VerifierUser) => void
}

export const getVerifierUserColumnData = ({
  invitingId,
  canManage,
  onInvite,
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
    accessorKey: 'verifierRoleId',
    cell: ({ row }) => (
      <span>
        {row.original.verifierRoleName ??
          row.original.role?.role ??
          row.original.verifierRoleId ??
          'NA'}
      </span>
    ),
    columnFunction: [],
  },
  {
    id: 'status',
    title: 'Status',
    accessorKey: 'revocationStatus',
    cell: ({ row }) => (
      <span>{row.original.revocationStatus ?? 'CREATED'}</span>
    ),
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
