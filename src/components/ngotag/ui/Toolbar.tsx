import React, { type ReactNode } from 'react'

/**
 * The strip along the top of a panel: a count or a search on the left, the
 * controls that act on the list on the right. It sits inside a `padded={false}`
 * Panel and draws its own bottom rule, so the table below meets it flush.
 */
export function Toolbar({
  left,
  right,
}: {
  left?: ReactNode
  right?: ReactNode
}): React.JSX.Element {
  return (
    <div className="border-ngotag-subtle relative z-[4] flex flex-wrap items-center gap-2.5 border-b p-4 min-[641px]:px-6">
      {left}
      {right ? (
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          {right}
        </div>
      ) : null}
    </div>
  )
}

/** The "0 members" line that opens most toolbars. */
export function ToolbarCount({
  children,
}: {
  children: ReactNode
}): React.JSX.Element {
  return <p className="text-ngotag-faint m-0 text-[13px]">{children}</p>
}
