import { Breadcrumb, type Crumb } from './Breadcrumb'

import React, { type ReactNode } from 'react'

interface PageHeaderProps {
  crumbs: Crumb[]
  title: string
  /** Search fields, create buttons — anything that acts on the whole page. */
  actions?: ReactNode
}

export function PageHeader({
  crumbs,
  title,
  actions,
}: PageHeaderProps): React.JSX.Element {
  return (
    <header className="flex flex-col gap-4">
      <Breadcrumb items={crumbs} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-ngotag-strong text-[26px] leading-[1.15] font-semibold tracking-[-0.025em]">
          {title}
        </h1>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}
