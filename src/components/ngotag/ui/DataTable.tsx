import React, { type ReactNode } from 'react'

import { EmptyState } from './EmptyState'
import type { IconName } from './icons'

interface DataTableProps {
  columns: string[]
  /** Rows, once there are any. Omitted while the table is still empty. */
  children?: ReactNode
  empty?: {
    icon: IconName
    title: string
    message: string
    action?: ReactNode
  }
}

/**
 * A table that keeps its header row when it has nothing to show.
 *
 * The pattern was already in the connections view: the columns tell you what
 * the data will look like before any exists, which an empty state on its own
 * does not. Every list page wants that, so it lives here rather than being
 * retyped — and the horizontal scroll stays on the table's own wrapper, so a
 * wide table never pushes the page sideways.
 */
export function DataTable({
  columns,
  children,
  empty,
}: DataTableProps): React.JSX.Element {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="ndi-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          {children ? <tbody>{children}</tbody> : null}
        </table>
      </div>

      {!children && empty ? (
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          message={empty.message}
          action={empty.action}
        />
      ) : null}
    </>
  )
}
