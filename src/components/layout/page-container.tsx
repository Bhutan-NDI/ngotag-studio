import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { isNgotagTheme } from '@/lib/active-theme'

export default function PageContainer({
  children,
  scrollable = true,
}: {
  children: React.ReactNode
  scrollable?: boolean
}): React.ReactElement {
  // NgotagAppShell's own <main> is already the single scrollable region for
  // this theme (so its footer sits at the true end of page content) — a
  // second, independently-scrolling ScrollArea nested inside it here would
  // fight that: content gets trapped in this fixed-height box, the app
  // footer becomes unreachable, and anything pinned to this box's bottom
  // edge (e.g. a table's pagination row) clips against its rounded corner.
  if (isNgotagTheme()) {
    return (
      <div className="mb-4 flex w-full flex-col p-4 md:px-6">{children}</div>
    )
  }

  const Content = (
    <div className="mb-4 flex min-h-[calc(100dvh-52px)] w-full flex-col p-4 md:px-6">
      {children}
    </div>
  )

  return scrollable ? (
    <ScrollArea className="h-[calc(100dvh-52px)] w-full">{Content}</ScrollArea>
  ) : (
    Content
  )
}
