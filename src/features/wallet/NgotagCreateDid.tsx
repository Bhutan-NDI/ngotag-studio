'use client'

import { Check, Copy, Download } from 'lucide-react'
import React, { type ReactNode } from 'react'

import { AuthAlert } from '@/components/ngotag/ui/AuthAlert'
import { Checkbox } from '@/components/ui/checkbox'
import { GradientButton } from '@/components/ngotag/ui/GradientButton'
import { Icon } from '@/components/ngotag/ui/icons'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { Select as NgotagSelect } from '@/components/ngotag/ui/Select'
import { PageHeader } from '@/components/ngotag/ui/PageHeader'
import { Panel } from '@/components/ngotag/ui/Panel'
import SetDomainValueInput from './SetDomainValueInput'
import { Stepper } from '@/components/ngotag/ui/Stepper'
import { pathRoutes } from '@/config/pathRoutes'
import { stepLabels } from '@/config/CommonConstant'

interface OptionCardData {
  id: string
  title: string
  desc: string
  icon?: ReactNode
  disabled?: boolean
  tooltip?: string
}

/**
 * A single selectable/informational card in the protocol or credential
 * format grid — same 3 render modes CreateDid.tsx's original inline JSX
 * had (disabled "Coming Soon", the only-one-active non-interactive
 * pre-selected card, and the normal interactive card), just carrying the
 * ngotag ndi-lift/mint-selected look instead of shadcn Card colors.
 */
function SelectableCard({
  option,
  selected,
  soleActive,
  onSelect,
}: {
  option: OptionCardData
  selected: boolean
  /** True when this is the only non-disabled option in its group — rendered
   * non-interactive and pre-selected, same as the original. */
  soleActive: boolean
  onSelect: () => void
}): React.JSX.Element {
  const interactive = !option.disabled && !soleActive
  const showSelected = selected || soleActive

  const body = (
    <>
      {option.disabled ? (
        <span
          className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            background: 'rgb(var(--ngotag-tint) / 0.06)',
            color: 'var(--ngotag-text-faint)',
          }}
        >
          Coming Soon
        </span>
      ) : null}
      {option.icon ? <div className="mb-4">{option.icon}</div> : null}
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-display text-ngotag-strong text-[14.5px] font-semibold">
          {option.title}
        </h3>
        {showSelected ? (
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{
              background: 'var(--ngotag-mint-12)',
              color: 'var(--ngotag-accent)',
            }}
          >
            Selected
          </span>
        ) : null}
      </div>
      <p className="text-ngotag-muted text-[13px] leading-[1.5]">
        {option.desc}
      </p>
    </>
  )

  const sharedClass = 'relative rounded-2xl border p-5 text-left'
  const style = {
    borderColor: showSelected
      ? 'var(--ngotag-border-strong)'
      : 'var(--ngotag-border-subtle)',
    background: showSelected
      ? 'var(--ngotag-mint-08)'
      : 'rgb(var(--ngotag-tint) / 0.02)',
    opacity: option.disabled ? 0.6 : 1,
  }

  if (!interactive) {
    return (
      <div
        className={`${sharedClass} ${option.disabled ? 'cursor-not-allowed' : 'cursor-default'}`}
        style={style}
      >
        {body}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`ndi-lift ${sharedClass} cursor-pointer`}
      style={style}
    >
      {body}
    </button>
  )
}

interface NgotagCreateDidProps {
  step: number
  totalSteps: number

  activeProtocols: OptionCardData[]
  protocolOptions: OptionCardData[]
  selectedProtocol: string | null
  onSelectProtocol: (id: string) => void

  selectedProtocolTitle?: string
  subOptions: OptionCardData[]
  activeSubOptions: OptionCardData[]
  selectedOption: string | null
  onSelectOption: (id: string) => void

  didOptions: string[]
  selectedDid: string | null
  didExample?: string
  onSelectDid: (value: string) => void

  isDidWeb: boolean
  domainValue: string
  domainError: string | null
  onDomainChange: (value: string) => void

  polygonConfig: ReactNode | null
  ethereumConfig: ReactNode | null

  didWebHosting: {
    domainValue: string
    generatedDidDoc: Record<string, unknown>
    didDocCopied: boolean
    onCopy: () => void
    onDownload: () => void
    isHostingConfirmed: boolean
    onHostingConfirmedChange: (checked: boolean) => void
  } | null

  alert: string | null
  onDismissAlert: () => void
  success: string | null
  onDismissSuccess: () => void

  showBackToEdit: boolean
  onBackToEdit: () => void
  onSubmit: () => void
  submitDisabled: boolean
  /** True only while an actual request is in flight — drives the spinner,
   * independent of `submitDisabled` (which can also be true for the
   * did:web hosting-not-confirmed gate, with no request happening). */
  submitting: boolean
  submitLabel: string
}

/**
 * Presentation only — same real protocol/format/DID-method selection state,
 * did:web generate-then-host flow, Polygon/Ethereum key setup and the same
 * real createDid/generateDidWeb submit logic as the non-ngotag CreateDid.tsx.
 * Outer chrome (header, Stepper, protocol/format/DID-method pickers) gets
 * the full ngotag treatment; the Polygon/Ethereum/did:web method-specific
 * sub-forms (passed in as `polygonConfig`/`ethereumConfig`/`didWebHosting`)
 * keep their existing shared-UI presentation — those already inherit the
 * ngotag mint palette via the theme's standard shadcn token layer, and their
 * real balance-check / key-generation logic was left untouched.
 */
export function NgotagCreateDid({
  step,
  activeProtocols,
  protocolOptions,
  selectedProtocol,
  onSelectProtocol,
  selectedProtocolTitle,
  subOptions,
  activeSubOptions,
  selectedOption,
  onSelectOption,
  didOptions,
  selectedDid,
  didExample,
  onSelectDid,
  isDidWeb,
  domainValue,
  domainError,
  onDomainChange,
  polygonConfig,
  ethereumConfig,
  didWebHosting,
  alert,
  onDismissAlert,
  success,
  onDismissSuccess,
  showBackToEdit,
  onBackToEdit,
  onSubmit,
  submitDisabled,
  submitting,
  submitLabel,
}: NgotagCreateDidProps): React.JSX.Element {
  return (
    <div className="p-6">
      <div>
        <PageHeader
          crumbs={[
            { label: 'Organizations', href: pathRoutes.organizations.root },
            { label: 'DID setup' },
          ]}
          title="Wallet type"
        />

        <p className="text-ngotag-muted m-0 mt-4 max-w-[62ch] text-[15px] leading-[1.6]">
          Setup wallet for your organization
        </p>

        <div className="mt-6">
          <Stepper
            steps={stepLabels.map((label) => ({ label }))}
            current={step - 1}
          />
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
        {success ? (
          <div className="mt-6">
            <AuthAlert
              variant="success"
              message={success}
              onDismiss={onDismissSuccess}
            />
          </div>
        ) : null}

        <Panel className="mt-6">
          <div>
            <h2 className="font-display text-ngotag-strong text-[15px] font-semibold">
              Select Protocol
            </h2>
            <p className="text-ngotag-muted mt-1 text-[13px]">
              Choose the protocol to issue your credential.
            </p>

            <div
              className={`mt-5 grid gap-4 ${
                activeProtocols.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'
              }`}
            >
              {protocolOptions.map((option) => (
                <SelectableCard
                  key={option.id}
                  option={option}
                  selected={selectedProtocol === option.id}
                  soleActive={!option.disabled && activeProtocols.length === 1}
                  onSelect={() => onSelectProtocol(option.id)}
                />
              ))}
            </div>

            {selectedProtocol ? (
              <div className="border-ngotag-subtle mt-6 border-t pt-5">
                <p className="text-ngotag-strong mb-3 text-[13.5px] font-medium">
                  Select Credential Format for {selectedProtocolTitle}
                </p>
                <div
                  className={`grid gap-4 ${
                    activeSubOptions.length === 1
                      ? 'grid-cols-1'
                      : 'md:grid-cols-2'
                  }`}
                >
                  {subOptions.map((option) => (
                    <SelectableCard
                      key={option.id}
                      option={option}
                      selected={selectedOption === option.id}
                      soleActive={
                        !option.disabled && activeSubOptions.length === 1
                      }
                      onSelect={() => onSelectOption(option.id)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {selectedOption ? (
              <div className="mt-6">
                <span className="font-ngotag-mono text-ngotag-muted mb-2 block text-[10px] tracking-[0.16em] uppercase">
                  Select DID Method *
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  <NgotagSelect
                    label="DID method"
                    placeholder="Select DID"
                    value={selectedDid ?? ''}
                    onChange={onSelectDid}
                    options={didOptions.map((did) => ({
                      value: did,
                      label: did,
                    }))}
                    className="w-full md:w-1/2"
                  />
                  {selectedDid && didExample ? (
                    <div className="font-ngotag-mono text-ngotag-muted rounded-md px-1 text-[12.5px] whitespace-nowrap">
                      <span>e.g.</span>{' '}
                      <span className="text-ngotag-strong">{didExample}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {isDidWeb ? (
              <div className="mt-6">
                <SetDomainValueInput
                  domainValue={domainValue}
                  setDomainValue={onDomainChange}
                  domainError={domainError}
                />
              </div>
            ) : null}
          </div>
        </Panel>

        {polygonConfig ? (
          <Panel className="mt-6">
            <h2 className="font-display text-ngotag-strong text-[15px] font-semibold">
              Polygon Configuration
            </h2>
            <p className="text-ngotag-muted mt-1 text-[13px]">
              Configure your Polygon DID by setting the private key.
            </p>
            <div className="mt-5">{polygonConfig}</div>
          </Panel>
        ) : null}

        {ethereumConfig ? (
          <Panel className="mt-6">
            <h2 className="font-display text-ngotag-strong text-[15px] font-semibold">
              Ethereum Configuration
            </h2>
            <p className="text-ngotag-muted mt-1 text-[13px]">
              Configure your Ethereum DID by setting the private key.
            </p>
            <div className="mt-5">{ethereumConfig}</div>
          </Panel>
        ) : null}

        {didWebHosting ? (
          <Panel className="mt-6">
            <h2 className="font-display text-ngotag-strong text-[15px] font-semibold">
              Host Your DID Document
            </h2>
            <p className="text-ngotag-muted mt-1 text-[13px] leading-[1.5]">
              Copy or download this file and host it at the URL below. The next
              step will verify it is publicly accessible before saving the DID.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <p className="text-ngotag-strong mb-1 text-[13px] font-medium">
                  Required hosting URL
                </p>
                <div className="border-ngotag-grid bg-ngotag-raised text-ngotag-strong rounded-[10px] border px-3 py-2 font-mono text-[13px] break-all">
                  {`https://${didWebHosting.domainValue}/.well-known/did.json`}
                </div>
              </div>

              <div>
                <p className="text-ngotag-strong mb-1 text-[13px] font-medium">
                  DID Document
                </p>
                <div className="relative">
                  <pre className="border-ngotag-grid bg-ngotag-raised text-ngotag-strong max-h-60 overflow-auto rounded-[10px] border p-4 font-mono text-[11.5px]">
                    {JSON.stringify(didWebHosting.generatedDidDoc, null, 2)}
                  </pre>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={didWebHosting.onCopy}
                      aria-label="Copy DID document"
                      className="ndi-hairline-btn border-ngotag-grid inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border bg-[rgb(var(--ngotag-tint)/0.05)]"
                    >
                      {didWebHosting.didDocCopied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={didWebHosting.onDownload}
                      aria-label="Download DID document"
                      className="ndi-hairline-btn border-ngotag-grid inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border bg-[rgb(var(--ngotag-tint)/0.05)]"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="hosting-confirmed"
                  checked={didWebHosting.isHostingConfirmed}
                  onCheckedChange={(checked) =>
                    didWebHosting.onHostingConfirmedChange(checked === true)
                  }
                />
                <Label
                  htmlFor="hosting-confirmed"
                  className="text-ngotag-body cursor-pointer text-[13px] leading-[1.5]"
                >
                  I have hosted the DID document at{' '}
                  <span className="font-mono text-[12px]">{`https://${didWebHosting.domainValue}/.well-known/did.json`}</span>
                </Label>
              </div>
            </div>
          </Panel>
        ) : null}

        {selectedDid ? (
          <div className="mt-6 flex flex-col items-end gap-2">
            {showBackToEdit ? (
              <button
                type="button"
                onClick={onBackToEdit}
                className="ndi-plainlink text-ngotag-muted text-[13px]"
              >
                ← Back to edit
              </button>
            ) : null}
            <GradientButton onClick={onSubmit} disabled={submitDisabled}>
              {submitting ? (
                <Loader />
              ) : (
                <Icon name="arrowRight" size={16} strokeWidth={2.2} />
              )}
              {submitLabel}
            </GradientButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export type { OptionCardData }
