'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import React, { type ReactNode } from 'react'

import { AuthAlert } from '@/components/ngotag/ui/AuthAlert'
import { GradientButton } from '@/components/ngotag/ui/GradientButton'
import { HairlineButton } from '@/components/ngotag/ui/HairlineButton'
import { Icon } from '@/components/ngotag/ui/icons'
import Loader from '@/components/Loader'
import { PageHeader } from '@/components/ngotag/ui/PageHeader'
import { Panel } from '@/components/ngotag/ui/Panel'
import { Stepper } from '@/components/ngotag/ui/Stepper'
import { pathRoutes } from '@/config/pathRoutes'
import { stepLabels } from '@/config/CommonConstant'

/**
 * Presentation only — same real agentType/dialog/redirect state and the
 * same real DedicatedAgentForm/SharedAgentForm submit logic as the
 * non-ngotag WalletSetup.tsx, just the "Wallet type" (step 2) chrome
 * reskinned to match NgotagCreateOrganization's Panel/Stepper/radio-card
 * language. Typed against the raw 'dedicated' | 'shared' string values
 * (not WalletSetup's local `AgentType` enum) to avoid a circular import —
 * WalletSetup.tsx is the one importing this component.
 */
const AGENT_OPTIONS: {
  id: 'dedicated' | 'shared'
  label: string
  hint: string
  bullets: string[]
}[] = [
  {
    id: 'dedicated',
    label: 'Dedicated Agent',
    hint: 'Private agent instance exclusively for your organization',
    bullets: [
      'Higher performance and reliability',
      'Enhanced privacy and security',
      'Full control over the agent infrastructure',
    ],
  },
  {
    id: 'shared',
    label: 'Shared Agent',
    hint: 'Use our cloud-hosted shared agent infrastructure',
    bullets: [
      'Cost-effective solution',
      'Managed infrastructure',
      'Quick setup with no maintenance',
    ],
  },
]

interface NgotagWalletSetupProps {
  agentType: string
  onSelectAgentType: (type: 'dedicated' | 'shared') => void
  /** Dedicated is unavailable for a marketplace client-initiated flow — same
   * `Boolean(clientAlias)` gate the original RadioGroupItem disabled prop used. */
  dedicatedDisabled: boolean
  /** True once a wallet response has come back — original wrapped the whole
   * form area in pointer-events-none/opacity-60 rather than unmounting it. */
  interactionDisabled: boolean
  alert: string | null
  onDismissAlert: () => void
  /** The real DedicatedAgentForm or SharedAgentForm, chosen by the caller. */
  children: ReactNode

  isDialogOpen: boolean
  /** Same `!redirectTo && !clientAlias` condition driving both the Skip
   * button's presence and the dialog copy in the original. */
  showSkip: boolean
  activeButton: 'skip' | 'continue' | null
  onSkip: () => void
  onContinue: () => void
}

export function NgotagWalletSetup({
  agentType,
  onSelectAgentType,
  dedicatedDisabled,
  interactionDisabled,
  alert,
  onDismissAlert,
  children,
  isDialogOpen,
  showSkip,
  activeButton,
  onSkip,
  onContinue,
}: NgotagWalletSetupProps): React.JSX.Element {
  return (
    <div className="p-6">
      <div>
        <PageHeader
          crumbs={[
            { label: 'Organizations', href: pathRoutes.organizations.root },
            { label: 'Wallet setup' },
          ]}
          title="Wallet type"
        />

        <p className="text-ngotag-muted m-0 mt-4 max-w-[62ch] text-[15px] leading-[1.6]">
          Setup wallet for your organization
        </p>

        <div className="mt-6">
          <Stepper steps={stepLabels.map((label) => ({ label }))} current={1} />
        </div>

        {alert ? (
          <div className="mt-6">
            <AuthAlert
              variant="danger"
              message={alert}
              onDismiss={onDismissAlert}
            />
          </div>
        ) : null}

        <Panel className="mt-6">
          <div
            className={
              interactionDisabled
                ? 'pointer-events-none opacity-60 select-none'
                : ''
            }
          >
            <div
              role="radiogroup"
              aria-label="Wallet agent type"
              className="grid gap-4 min-[641px]:grid-cols-2"
            >
              {AGENT_OPTIONS.map((opt) => {
                const checked = agentType === opt.id
                const disabled = opt.id === 'dedicated' && dedicatedDisabled
                return (
                  <label
                    key={opt.id}
                    htmlFor={`agent-${opt.id}`}
                    className={`ndi-lift flex flex-col gap-3 rounded-2xl border p-5 ${
                      disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    }`}
                    style={{
                      borderColor: checked
                        ? 'var(--ngotag-border-strong)'
                        : 'var(--ngotag-border-subtle)',
                      background: checked
                        ? 'var(--ngotag-mint-08)'
                        : 'rgb(var(--ngotag-tint) / 0.02)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        id={`agent-${opt.id}`}
                        type="radio"
                        name="agentType"
                        className="ndi-check mt-1 flex-none"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => onSelectAgentType(opt.id)}
                      />
                      <div className="min-w-0">
                        <h3 className="font-display text-ngotag-strong text-[15px] font-semibold">
                          {opt.label}
                        </h3>
                        <p className="text-ngotag-muted mt-1 text-[13px] leading-[1.5]">
                          {opt.hint}
                        </p>
                      </div>
                    </div>
                    <ul className="text-ngotag-muted ml-8 list-disc space-y-1 text-[13px]">
                      {opt.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </label>
                )
              })}
            </div>

            <div className="mt-6">{children}</div>
          </div>
        </Panel>
      </div>

      <Dialog open={isDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent
          className="max-w-md rounded-2xl p-8 text-center [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'var(--ngotag-mint-12)' }}
            >
              <Icon
                name="check"
                size={28}
                strokeWidth={2.4}
                className="text-ngotag-accent"
              />
            </div>
          </div>

          <h2 className="font-display text-ngotag-strong mt-4 text-xl font-semibold">
            Wallet created successfully!
          </h2>

          <p className="text-ngotag-muted mt-2">
            {showSkip
              ? 'Would you like to continue with DID creation or skip it for now?'
              : 'Proceed to DID creation to continue your setup.'}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            {showSkip ? (
              <HairlineButton onClick={onSkip} disabled={activeButton !== null}>
                {activeButton === 'skip' ? <Loader /> : 'Skip'}
              </HairlineButton>
            ) : null}

            <GradientButton
              onClick={onContinue}
              disabled={activeButton !== null}
            >
              {activeButton === 'continue' ? <Loader /> : 'Continue'}
            </GradientButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
