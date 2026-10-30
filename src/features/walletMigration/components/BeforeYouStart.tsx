'use client'

import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { webhookUrlFor } from '../config'

// Per-environment values the owner needs to set up their agent (UX spec v1.1,
// SCR-WM-02). Set them in the environment; they aren't secrets.
const EXPORT_BUCKET = process.env.NEXT_PUBLIC_WALLET_MIGRATION_EXPORT_BUCKET
const AGENT_RELEASE = process.env.NEXT_PUBLIC_WALLET_MIGRATION_AGENT_RELEASE
const PLATFORM_IPS = (
  process.env.NEXT_PUBLIC_WALLET_MIGRATION_PLATFORM_IPS ?? ''
)
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean)

const NOT_SET = 'Not configured for this environment. Ask the platform team.'

const CopyValue = ({ value }: { value?: string }): React.JSX.Element => {
  const [copied, setCopied] = useState(false)
  if (!value) {
    return <span className="text-muted-foreground text-sm">{NOT_SET}</span>
  }
  return (
    <div className="flex min-w-0 items-center gap-2">
      <code className="bg-muted min-w-0 flex-1 rounded px-2 py-1 text-xs break-all">
        {value}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        aria-label={copied ? 'Copied' : 'Copy'}
        onClick={() => {
          navigator.clipboard?.writeText(value).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          })
        }}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

/**
 * "Before you start": the values the owner configures on their agent, and
 * what the checks can't verify. The webhook URL matters most: it's specific
 * to this organisation and without it preflight fails WEBHOOK_NOT_CONFIGURED.
 */
export function BeforeYouStart({
  orgId,
}: Readonly<{ orgId: string }>): React.JSX.Element {
  const webhookUrl = webhookUrlFor(orgId)
  const rows: { label: string; hint: string; value?: string }[] = [
    {
      label: 'Webhook URL',
      hint: "Set this as your agent's webhook URL. It's specific to this organisation.",
      value: webhookUrl,
    },
    {
      label: 'Export bucket',
      hint: 'Set as AWS_WALLET_EXPORT_BUCKET on your agent.',
      value: EXPORT_BUCKET,
    },
    {
      label: 'Required agent-controller release',
      hint: 'Your agent must run exactly this release.',
      value: AGENT_RELEASE,
    },
    {
      label: 'Platform IP addresses',
      hint: "Allow only these addresses to reach your agent's admin port.",
      value: PLATFORM_IPS.length ? PLATFORM_IPS.join(', ') : undefined,
    },
  ]

  return (
    <section
      aria-labelledby="before-you-start"
      className="bg-muted/30 mt-5 rounded-lg border p-4"
    >
      <h3 id="before-you-start" className="text-sm font-semibold">
        Before you start
      </h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Configure your new agent with these values.
      </p>
      <dl className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1">
            <dt className="text-sm font-medium">{row.label}</dt>
            <dd className="space-y-1">
              <CopyValue value={row.value} />
              <p className="text-muted-foreground text-xs">{row.hint}</p>
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 border-t pt-4">
        <p className="text-sm font-medium">
          Also make sure of these. The checks can&apos;t verify them:
        </p>
        <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            The admin API accepts traffic only from the IP addresses above.
          </li>
          <li>The agent runs on an encrypted disk.</li>
          <li>
            The agent can reach citizens&apos; mediators, the ledgers, resolvers
            and the schema server.
          </li>
        </ul>
      </div>
    </section>
  )
}
