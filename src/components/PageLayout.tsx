'use client'

import React, { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from './ui/sidebar'

import AppSidebar from './layout/app-sidebar'
import { BhutanndiAppShell } from './bhutanndi/layout/BhutanndiAppShell'
import { BhutanndiBareShell } from './bhutanndi/layout/BhutanndiBareShell'
import Header from './layout/header'
import KBar from './kbar'
import { isBhutanndiTheme } from '@/lib/active-theme'
import { usePathname } from 'next/navigation'

interface PageLayoutProps {
  children: ReactNode
}

// Sign-in/sign-up already wrap themselves in BhutanndiAuthShell (logo header,
// two-column marketing layout, its own background + footer) — skip them here
// so they don't get double-wrapped.
const authShellManagedRoutes = ['/sign-in', '/sign-up']

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const pathname = usePathname()

  // Define routes where PageLayout should be excluded
  const excludeLayoutRoutes = [
    '/sign-in',
    '/sign-up',
    '/verify-email-success',
    '/reset-password',
  ]
  const excludeLayoutPrefixes = ['/marketplace', '/legal']
  const shouldExcludeLayout =
    excludeLayoutRoutes.includes(pathname) ||
    excludeLayoutPrefixes.some((routePrefix) =>
      pathname.startsWith(routePrefix),
    )

  if (shouldExcludeLayout) {
    if (isBhutanndiTheme() && !authShellManagedRoutes.includes(pathname)) {
      return <BhutanndiBareShell>{children}</BhutanndiBareShell>
    }
    return <>{children}</>
  }

  if (isBhutanndiTheme()) {
    return (
      <KBar>
        <BhutanndiAppShell>{children}</BhutanndiAppShell>
      </KBar>
    )
  }

  return (
    <KBar>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  )
}

export default PageLayout
