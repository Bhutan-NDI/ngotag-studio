'use client'

import React, { type ReactNode } from 'react'

import { Icon } from '@/components/ngotag/ui/icons'

interface AuthAlertProps {
  /** Danger mirrors NgotagLoginCard's `alert` bar; success mirrors its `success` bar. */
  variant: 'danger' | 'success'
  message: ReactNode
  onDismiss: () => void
}

/**
 * The inline status bar used across the ngotag auth cards — extracted from
 * the danger/success banners NgotagLoginCard.tsx first inlined twice, now
 * shared with the sign-up cards which need the same two variants again.
 */
export function AuthAlert({
  variant,
  message,
  onDismiss,
}: AuthAlertProps): React.JSX.Element {
  const danger = variant === 'danger'

  return (
    <p
      role={danger ? 'alert' : 'status'}
      aria-live={danger ? undefined : 'polite'}
      className={`relative z-[4] m-0 mb-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-[1.5] ${
        danger
          ? ''
          : 'border-ngotag-grid text-ngotag-accent bg-[var(--ngotag-mint-08)]'
      }`}
      style={
        danger
          ? {
              borderColor: 'var(--ngotag-text-danger)',
              background: 'rgb(var(--ngotag-tint) / 0.03)',
              color: 'var(--ngotag-text-danger)',
            }
          : undefined
      }
    >
      <Icon
        name={danger ? 'shieldAlert' : 'check'}
        size={danger ? 15 : 14}
        strokeWidth={danger ? 2 : 2.2}
        className="mt-px flex-none"
      />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ndi-plainlink text-ngotag-faint -mr-1 flex-none"
      >
        <Icon name="close" size={14} strokeWidth={2} />
      </button>
    </p>
  )
}
