'use client'

import React, { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface HairlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  block?: boolean
}

/**
 * Secondary control. The reference has no outline button, so this applies
 * its existing hairline vocabulary — the chip's checked state and the
 * mobile sheet's social tiles: 1px mint border over a near-transparent
 * fill, hover to mint 8% with the small glow.
 */
export function HairlineButton({
  children,
  className = '',
  block = false,
  type = 'button',
  ...props
}: HairlineButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      className={`ndi-hairline-btn border-bhutanndi-grid font-display text-bhutanndi-body inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-xl border bg-[rgb(var(--bhutanndi-tint)/0.03)] px-6 text-[14.5px] font-semibold ${
        block ? 'w-full' : ''
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
