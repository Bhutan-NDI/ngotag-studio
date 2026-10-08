'use client'

import React, { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

/** Animated conic-gradient CTA (the shadcn ShinyButton), themed to NDI mint. */
export function ShinyButton({
  children,
  className = '',
  type = 'button',
  ...props
}: ShinyButtonProps): React.JSX.Element {
  return (
    <button type={type} className={`shiny-cta ${className}`.trim()} {...props}>
      <span>{children}</span>
    </button>
  )
}
