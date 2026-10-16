import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IColumnData,
  ITableMetadata,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { MoreVertical, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { JSX } from 'react'

export interface ProofTemplateRow {
  id: string
  templateId: string
  name: string
  description?: string
  version: string
  orgId: string
  payload?: unknown
  createdAt: string
  // present on the org-wide list only (not on the per-role list)
  verifierRoleToProofTemplates?: {
    verifierRoleId?: string
    verifierRole?: { role: string } | null
  }[]
}

const roleNamesOf = (template: ProofTemplateRow): string[] =>
  (template.verifierRoleToProofTemplates ?? [])
    .map((mapping) => mapping.verifierRole?.role)
    .filter((name): name is string => Boolean(name))

export const useProofTemplateColumns = (
  onEdit: (template: ProofTemplateRow) => void,
  canManage: boolean,
): ColumnDef<ProofTemplateRow>[] => {
  const actionCell = ({
    row,
  }: {
    row: { original: ProofTemplateRow }
  }): JSX.Element => (
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
          Update
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const columnData: IColumnData[] = [
    {
      id: 'templateId',
      title: 'Template ID',
      accessorKey: 'templateId',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.templateId}</span>
      ),
      columnFunction: [],
    },
    {
      id: 'name',
      title: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => <span>{row.original.name}</span>,
      columnFunction: [],
    },
    {
      id: 'roles',
      title: 'Roles',
      accessorKey: 'verifierRoleToProofTemplates',
      cell: ({ row }): JSX.Element => (
        <span>{roleNamesOf(row.original).join(', ') || '-'}</span>
      ),
      columnFunction: [],
    },
    {
      id: 'version',
      title: 'Version',
      accessorKey: 'version',
      cell: ({ row }) => <span>{row.original.version}</span>,
      columnFunction: [],
    },
    {
      id: 'createdAt',
      title: 'Created On',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span>
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : 'NA'}
        </span>
      ),
      columnFunction: [],
    },
    {
      id: 'actions',
      title: 'Actions',
      accessorKey: 'actions',
      cell: actionCell,
      columnFunction: [],
    },
  ]

  const metadata: ITableMetadata = { enableSelection: false }
  const tableStyling: TableStyling = { metadata, columnData }
  return getColumns<ProofTemplateRow>(tableStyling)
}
