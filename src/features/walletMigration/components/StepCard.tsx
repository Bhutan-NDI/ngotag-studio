'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, Circle, Loader2, Lock, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import React from 'react'

// P-01 step card. Same layout as DeleteOrganizationCard, with the extra
// running and failed states the move needs. Every state has a text label and
// an icon, never colour alone.
export type StepState =
  | 'done'
  | 'action'
  | 'running'
  | 'waiting'
  | 'failed'
  | 'locked'

const STATE_STYLE: Record<
  StepState,
  { border: string; label: string; badge: string; icon: React.ReactNode }
> = {
  done: {
    border: 'border-l-green-500 opacity-80',
    label: 'Done',
    badge:
      'border-green-300 bg-green-50 text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-green-950 dark:text-green-400',
    icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
  },
  action: {
    border: 'border-l-primary shadow-sm',
    label: 'Ready',
    badge: 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/10',
    icon: <Circle className="h-3.5 w-3.5" aria-hidden />,
  },
  running: {
    border: 'border-l-primary shadow-sm',
    label: 'In progress',
    badge: 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/10',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />,
  },
  waiting: {
    border: 'border-l-muted-foreground/30',
    label: 'Waiting',
    badge: 'bg-muted text-muted-foreground hover:bg-muted',
    icon: <Circle className="h-3.5 w-3.5" aria-hidden />,
  },
  failed: {
    border: 'border-l-destructive shadow-sm',
    label: 'Failed',
    badge:
      'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/10',
    icon: <XCircle className="h-3.5 w-3.5" aria-hidden />,
  },
  locked: {
    border: 'border-l-amber-400 bg-muted/10',
    label: 'Locked',
    badge:
      'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400',
    icon: <Lock className="h-3.5 w-3.5" aria-hidden />,
  },
}

interface StepCardProps {
  step: number
  title: string
  description?: string
  state: StepState
  children?: React.ReactNode
}

export function StepCard({
  step,
  title,
  description,
  state,
  children,
}: Readonly<StepCardProps>): React.JSX.Element {
  const style = STATE_STYLE[state]
  return (
    <Card
      className={`border-border bg-card w-full gap-0 rounded-xl border border-l-4 p-0 ${style.border}`}
    >
      <CardHeader className="space-y-0 px-5 pt-5 pb-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="bg-muted text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {step}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-h-7 flex-wrap items-center gap-2">
              <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
              <Badge className={`gap-1 text-xs ${style.badge}`}>
                {style.icon}
                {style.label}
              </Badge>
            </div>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      {/* Indented to line up with the title (number badge + gap). */}
      {children && (
        <CardContent className="px-5 pt-0 pb-5 sm:pr-6 sm:pl-[3.75rem]">
          {children}
        </CardContent>
      )}
    </Card>
  )
}
