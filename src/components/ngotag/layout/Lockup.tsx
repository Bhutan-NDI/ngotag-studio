'use client'
/* eslint-disable sort-imports */

import {
  ngotagLogoAltText,
  ngotagLogoDarkPath,
  ngotagLogoLightPath,
} from '@/config/CommonConstant'
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import { useTheme } from 'next-themes'

/**
 * The ngotag ("Bhutan NDI") logo mark, sized for the ngotag top bar. This
 * component only ever renders inside the ngotag-themed shell (see
 * NgotagTopBar.tsx), so it always uses the ngotag-specific light/dark marks
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
      ? ngotagLogoDarkPath
      : ngotagLogoLightPath

  return (
    <Image
      src={src}
      alt={ngotagLogoAltText}
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
