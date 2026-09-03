'use client'

import { Icon, type IconName } from '@/components/bhutanndi/ui/icons'
import React, { type ReactNode } from 'react'

import { GradientButton } from '@/components/bhutanndi/ui/GradientButton'
import { HairlineButton } from '@/components/bhutanndi/ui/HairlineButton'
import Loader from '@/components/Loader'
import { PageHeader } from '@/components/bhutanndi/ui/PageHeader'
import { Panel } from '@/components/bhutanndi/ui/Panel'
import { Stepper } from '@/components/bhutanndi/ui/Stepper'
import { pathRoutes } from '@/config/pathRoutes'
import { stepLabels } from '@/config/CommonConstant'

interface DetailRowProps {
  icon: IconName
  label: string
  children: ReactNode
}

function DetailRow({
  icon,
  label,
  children,
}: DetailRowProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-bhutanndi-muted flex items-center gap-2 text-[12px] font-medium tracking-wide">
        <Icon name={icon} size={15} strokeWidth={2} />
        {label}
      </div>
      <div className="border-bhutanndi-grid bg-bhutanndi-raised text-bhutanndi-strong rounded-[10px] border p-3 font-mono text-[13px] break-all">
        {children}
      </div>
    </div>
  )
}

interface BhutanndiDidDetailsProps {
  protocol: string | null
  credentialType: string | null
  didMethod: string | null
  generatedDid: string | null
  copied: boolean
  onCopy: () => void
  activeAction: 'schema' | 'dashboard' | null
  onSchema: () => void
  onDashboard: () => void
}

/**
 * Presentation only — same real DID details (read straight from the query
 * string by DidDetails.tsx) and the same real "continue to schema" /
 * "go to dashboard" navigation, reskinned as step 4 ("Completed") of the
 * same Panel/Stepper flow as WalletSetup/CreateDid.
 */
export function BhutanndiDidDetails({
  protocol,
  credentialType,
  didMethod,
  generatedDid,
  copied,
  onCopy,
  activeAction,
  onSchema,
  onDashboard,
}: BhutanndiDidDetailsProps): React.JSX.Element {
  return (
    <div className="p-6">
      <div>
        <PageHeader
          crumbs={[
            { label: 'Organizations', href: pathRoutes.organizations.root },
            { label: 'Completed' },
          ]}
          title="DID details"
        />

        <p className="text-bhutanndi-muted m-0 mt-4 max-w-[62ch] text-[15px] leading-[1.6]">
          Your DID has been successfully created. Review the details below.
        </p>

        <div className="mt-6">
          <Stepper steps={stepLabels.map((label) => ({ label }))} current={3} />
        </div>

        <Panel className="mt-6">
          <div className="flex flex-col gap-4">
            <DetailRow icon="verify" label="Protocol">
              {protocol}
            </DetailRow>
            <DetailRow icon="key" label="Credential Type">
              {credentialType}
            </DetailRow>
            <DetailRow icon="key" label="DID Method">
              {didMethod}
            </DetailRow>

            <div className="flex flex-col gap-1.5">
              <div className="text-bhutanndi-muted flex items-center gap-2 text-[12px] font-medium tracking-wide">
                <Icon name="fingerprint" size={15} strokeWidth={2} />
                Generated DID
              </div>
              <div className="flex items-center gap-2">
                <div className="border-bhutanndi-grid bg-bhutanndi-raised text-bhutanndi-strong min-w-0 flex-1 rounded-[10px] border p-3 font-mono text-[13px] font-semibold break-all">
                  {generatedDid}
                </div>
                <button
                  type="button"
                  onClick={onCopy}
                  aria-label="Copy generated DID"
                  className="ndi-hairline-btn border-bhutanndi-grid inline-flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-[10px] border bg-[rgb(var(--bhutanndi-tint)/0.03)]"
                >
                  <Icon
                    name={copied ? 'check' : 'copy'}
                    size={16}
                    strokeWidth={2.2}
                    className={copied ? 'text-bhutanndi-accent' : undefined}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="border-bhutanndi-subtle mt-6 flex flex-wrap justify-center gap-2.5 border-t pt-5">
            <GradientButton onClick={onSchema} disabled={activeAction !== null}>
              {activeAction === 'schema' ? (
                <Loader />
              ) : (
                'Continue to Schema Creation'
              )}
            </GradientButton>
            <HairlineButton
              onClick={onDashboard}
              disabled={activeAction !== null}
            >
              {activeAction === 'dashboard' ? <Loader /> : 'Go to Dashboard'}
            </HairlineButton>
          </div>
        </Panel>
      </div>
    </div>
  )
}
