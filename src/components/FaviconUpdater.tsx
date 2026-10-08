'use client'

import { JSX, useEffect } from 'react'

import { getActiveFaviconPath } from '@/lib/active-theme'

const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE?.trim()
const activeFaviconPath = getActiveFaviconPath()

const DEFAULT_CONFIG = {
  favicon: activeFaviconPath,
  faviconType: activeFaviconPath.endsWith('.ico')
    ? 'image/x-icon'
    : 'image/png',
  title: APP_TITLE ? APP_TITLE : 'PHENIX ID',
}

export function FaviconUpdater(): JSX.Element | null {
  useEffect(() => {
    // Track the link element we create so we never touch React-owned head nodes.
    // In React 19, <link>/<title> in <head> are HostSingleton fibers. Removing
    // them outside React (e.g. with .remove()) nullifies their parentNode, which
    // causes "Cannot read properties of null (reading 'removeChild')" on the
    // next soft navigation when React tries to reconcile those fibers.
    let managedLink: HTMLLinkElement | null = null

    const updateFaviconAndTitle = (): void => {
      const { favicon, faviconType, title } = DEFAULT_CONFIG

      if (!managedLink) {
        managedLink = document.createElement('link')
        managedLink.rel = 'icon'
        document.head.appendChild(managedLink)
      }
      managedLink.type = faviconType
      managedLink.href = favicon
      document.title = title
    }

    updateFaviconAndTitle()

    const handleThemeChange = (): void => {
      updateFaviconAndTitle()
    }

    window.addEventListener('themeChanged', handleThemeChange)

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange)
      managedLink?.remove()
    }
  }, [])

  return null
}
