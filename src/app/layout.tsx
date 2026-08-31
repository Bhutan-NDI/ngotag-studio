import './globals.css'
import './theme.css'
import type { Metadata, Viewport } from 'next'

import { getActiveFaviconPath, getActiveTheme } from '@/lib/active-theme'

import { FaviconUpdater } from '@/components/FaviconUpdater'
import { HardNavigationBoundary } from '@/components/HardNavigationBoundary'
import { Session as NextAuthSession } from 'next-auth'
import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import PageLayout from '@/components/PageLayout'
import Providers from '@/components/layout/providers'
import React from 'react'
import { SessionManager } from '@/features/components/SessionManager'
import StoreProvider from './StoreProvider'
import { Toaster } from '@/components/ui/sonner'
import { authOptions } from '@/utils/authOptions'
import { cn } from '@/lib/utils'
import { fontVariables } from '@/lib/font'
import { getServerSession } from 'next-auth/next'
import { ngotagFontVariables } from '@/lib/ngotag-fonts'

// Create a new type extending Session to guarantee expires is defined
type SessionWithExpires = NextAuthSession & { expires: string }

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
}
const SESSION_FALLBACK_DURATION_MS = 1000 * 60 * 30

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: META_THEME_COLORS.light,
}

const activeFaviconPath = getActiveFaviconPath()
const activeFaviconType = activeFaviconPath.endsWith('.ico')
  ? 'image/x-icon'
  : 'image/png'

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_TITLE?.trim() || 'PHENIX ID',
  icons: {
    icon: [{ url: activeFaviconPath, type: activeFaviconType }],
    shortcut: [{ url: activeFaviconPath, type: activeFaviconType }],
    apple: [{ url: activeFaviconPath, type: activeFaviconType }],
  },
}

export default async function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}): Promise<React.JSX.Element> {
  // Get the session raw
  const sessionRaw = (await getServerSession(
    authOptions,
  )) as SessionWithExpires | null

  const session: SessionWithExpires | null = sessionRaw
    ? {
        ...sessionRaw,
        expires:
          sessionRaw.expires ??
          new Date(Date.now() + SESSION_FALLBACK_DURATION_MS).toISOString(),
      }
    : null

  const activeTheme = getActiveTheme()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-hidden overscroll-none font-sans antialiased',
          `theme-${activeTheme}`,
          fontVariables,
          // Host Grotesk / Inter / DM Mono, additive alongside the shared
          // fontVariables above — only wired up under their own
          // `font-display` / `font-ngotag-*` utilities, so this is a no-op
          // for every other theme. See src/lib/ngotag-fonts.ts.
          activeTheme === 'ngotag' ? ngotagFontVariables : '',
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <StoreProvider>
            <Providers session={session}>
              <SessionManager>
                <Toaster />
                <FaviconUpdater />
                <HardNavigationBoundary>
                  <PageLayout>{children}</PageLayout>
                </HardNavigationBoundary>
              </SessionManager>
            </Providers>
          </StoreProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
