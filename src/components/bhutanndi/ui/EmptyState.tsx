import { Icon, type IconName } from './icons'

import React, { type ReactNode } from 'react'

interface EmptyStateProps {
  icon: IconName
  title: string
  message: string
  action?: ReactNode
  /** Zero-results reads differently from nothing-created-yet. */
  tone?: 'empty' | 'filtered'
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  tone = 'empty',
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="relative z-[4] flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span
        className="border-bhutanndi-grid text-bhutanndi-accent inline-flex h-14 w-14 items-center justify-center rounded-2xl border"
        style={{
          background:
            tone === 'empty'
              ? 'var(--bhutanndi-mint-04)'
              : 'rgb(var(--bhutanndi-tint) / 0.03)',
        }}
      >
        <Icon name={icon} size={24} strokeWidth={1.7} />
      </span>

      <div>
        <h2 className="font-display text-bhutanndi-strong m-0 text-[19px] leading-[1.3] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        <p className="text-bhutanndi-muted m-0 mt-2 max-w-[42ch] text-[14px] leading-[1.6]">
          {message}
        </p>
      </div>

      {action}
    </div>
  )
}
