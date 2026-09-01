'use client'
/* eslint-disable sort-imports */

import {
  bhutanndiLogoAltText,
  bhutanndiLogoDarkPath,
  bhutanndiLogoLightPath,
} from '@/config/CommonConstant'
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import { useTheme } from 'next-themes'

/**
 * The bhutanndi ("Bhutan NDI") logo mark, sized for the bhutanndi top bar. This
 * component only ever renders inside the bhutanndi-themed shell (see
 * BhutanndiTopBar.tsx), so it always uses the bhutanndi-specific light/dark marks
 * from src/config/CommonConstant.ts rather than the shared Phenix ones.
 *
 * Mirrors the mounted/resolvedTheme guard already used by the shared
 * AppSidebar's logo swap, so the wrong mark never flashes on first paint.
 */
export function Lockup({
  className = '',
}: {
  readonly className?: string
}): React.JSX.Element {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const src =
    mounted && resolvedTheme === 'dark'
      ? bhutanndiLogoDarkPath
      : bhutanndiLogoLightPath

  return (
    <Image
      src={src}
      alt={bhutanndiLogoAltText}
      height={32}
      width={114}
      priority
      // .svg source — next.config.js doesn't set dangerouslyAllowSVG, so this
      // must bypass Next's image optimizer rather than be rejected by it.
      unoptimized
      className={`h-8 w-auto object-contain ${className}`.trim()}
    />
  )
}
