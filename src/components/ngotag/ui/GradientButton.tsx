'use client'

import React, { type ButtonHTMLAttributes, type ReactNode } from 'react'

/**
 * The primary CTA fill. A token rather than a literal, because the ramp the
 * reference ships ends in a dark teal: against ink that is depth, against
 * paper it is a smudge. The light theme carries a shorter ramp of its own.
 */
export const GRADIENT = 'var(--ngotag-grad-cta)'

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Renders full-width, as the reference's form submits do. */
  block?: boolean
}

/** Filled mint CTA, ported from BhutanNDI_Studio's GradientButton. */
export function GradientButton({
  children,
  className = '',
  block = false,
  type = 'button',
  disabled,
  ...props
}: GradientButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`ndi-sweepbtn font-display relative inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xl px-6 text-[14.5px] font-semibold disabled:cursor-not-allowed ${
        block ? 'w-full' : ''
      } ${className}`.trim()}
      /* Disabled drops the gradient entirely rather than fading it: mint at
         reduced opacity still reads as the live, pressable control. */
      style={
        disabled
          ? {
              background: 'var(--ngotag-surface-raised)',
              color: 'var(--ngotag-text-faint)',
              border: '1px solid var(--ngotag-border-subtle)',
              boxShadow: 'none',
            }
          : {
              background: GRADIENT,
              color: 'var(--ngotag-text-on-mint)',
              border: '1px solid transparent',
              boxShadow: 'var(--ngotag-glow-sm)',
            }
      }
      {...props}
    >
      <span className="ndi-store-sweep" />
      <span className="ndi-store-glow" />
      <span className="relative z-[1] inline-flex items-center gap-2.5">
        {children}
      </span>
    </button>
  )
}
