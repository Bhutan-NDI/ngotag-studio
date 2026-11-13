'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
}

// The last element that had focus. A dialog opened from a dropdown menu item
// opens after the menu has closed and focus has dropped to the page body.
let lastFocused: Element | null = null
if (typeof document !== 'undefined') {
  document.addEventListener(
    'focusin',
    (event) => {
      lastFocused = event.target as Element
    },
    true,
  )
}

/**
 * Where focus goes back to when a dialog closes: the element that had focus
 * when it opened. A dialog opened from a dropdown menu item goes back to the
 * menu's button, since the item itself is gone by then.
 */
function focusReturnTarget(element: Element | null): HTMLElement | null {
  if (!(element instanceof HTMLElement) || element === document.body) {
    return null
  }
  const triggerId = element
    .closest('[role="menu"]')
    ?.getAttribute('aria-labelledby')
  if (triggerId) {
    return document.getElementById(triggerId)
  }
  return element
}

function DialogContent({
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  // Radix returns focus only to a DialogTrigger. Most dialogs here open from
  // state instead, which left focus on the page body after closing, so a
  // keyboard user had to start again from the top of the page.
  // Noted as each opening starts, before focus moves into the dialog. (This
  // component stays mounted while closed, so a mount effect would only see
  // the page load.)
  const openerRef = React.useRef<HTMLElement | null>(null)

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg p-6 shadow-xl duration-200 sm:max-w-lg',
          className,
        )}
        onOpenAutoFocus={(event) => {
          const active = document.activeElement
          openerRef.current = focusReturnTarget(
            active && active !== document.body ? active : lastFocused,
          )
          onOpenAutoFocus?.(event)
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event)
          const opener = openerRef.current
          if (!event.defaultPrevented && opener?.isConnected) {
            event.preventDefault()
            opener.focus()
          }
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
