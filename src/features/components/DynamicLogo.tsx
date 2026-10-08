'use client'

import {
  appLogoAltText,
  appLogoDarkPath,
  appLogoHeight,
  appLogoPath,
  appLogoWidth,
  bhutanndiLogoAltText,
  bhutanndiLogoDarkPath,
  bhutanndiLogoHeight,
  bhutanndiLogoLightPath,
  bhutanndiLogoWidth,
  credeblLogoAltText,
  credeblLogoDarkPath,
  credeblLogoHeight,
  credeblLogoLightPath,
  credeblLogoWidth,
  sovioLogoAltText,
  sovioLogoDarkPath,
  sovioLogoHeight,
  sovioLogoLightPath,
  sovioLogoWidth,
} from '@/config/CommonConstant'
// eslint-disable-next-line sort-imports
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import { getActiveTheme } from '@/lib/active-theme'
import { useTheme } from 'next-themes'

// Per-brand logo marks, keyed by NEXT_PUBLIC_ACTIVE_THEME (see
// src/lib/active-theme.ts). Any theme not listed here (e.g. the default
// Phenix build) falls through to the light/dark Phenix marks below. All
// theme-specific marks here are .svg — see the `unoptimized` note below.
const THEME_LOGOS: Record<
  string,
  {
    light: string
    dark: string
    alt: string
    width: number
    height: number
  }
> = {
  bhutanndi: {
    light: bhutanndiLogoLightPath,
    dark: bhutanndiLogoDarkPath,
    alt: bhutanndiLogoAltText,
    width: bhutanndiLogoWidth,
    height: bhutanndiLogoHeight,
  },
  credebl: {
    light: credeblLogoLightPath,
    dark: credeblLogoDarkPath,
    alt: credeblLogoAltText,
    width: credeblLogoWidth,
    height: credeblLogoHeight,
  },
  sovio: {
    light: sovioLogoLightPath,
    dark: sovioLogoDarkPath,
    alt: sovioLogoAltText,
    width: sovioLogoWidth,
    height: sovioLogoHeight,
  },
}

function DynamicApplicationLogo(): React.JSX.Element {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const brandLogo = THEME_LOGOS[getActiveTheme()]

  const logoSrc = brandLogo
    ? isDark
      ? brandLogo.dark
      : brandLogo.light
    : isDark
      ? appLogoDarkPath
      : appLogoPath
  const alt = brandLogo?.alt ?? appLogoAltText
  const width = brandLogo?.width ?? appLogoWidth
  const height = brandLogo?.height ?? appLogoHeight

  return (
    <div className="max-h-24">
      <Image
        height={height}
        width={width}
        alt={alt}
        src={logoSrc}
        // next.config.js doesn't set dangerouslyAllowSVG, so brand marks that
        // are .svg must bypass Next's image optimizer rather than be
        // rejected by it; the default Phenix marks are PNGs, unaffected.
        unoptimized={Boolean(brandLogo)}
        className="mx-0 h-10 w-fit object-contain px-2 md:h-20 md:w-50"
      />
    </div>
  )
}

export default DynamicApplicationLogo
