'use client'

import React, { JSX, ReactNode, useEffect } from 'react'
import { getActiveTheme } from '@/lib/active-theme'

/** Load CSS file for the active theme */
function loadThemeCSS(theme: string): void {
  if (typeof document === 'undefined') {
    return
  }
  const id = 'dynamic-theme-css'
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  link.href = `/themes/${theme}_theme.css`
}

interface ActiveThemeProviderProps {
  readonly children: ReactNode
}

export function ActiveThemeProvider({
  children,
}: ActiveThemeProviderProps): JSX.Element {
  const activeTheme = getActiveTheme()

  useEffect(() => {
    loadThemeCSS(activeTheme)
    document.body.classList.add(`theme-${activeTheme}`)
  }, [activeTheme])

  return <>{children}</>
}
