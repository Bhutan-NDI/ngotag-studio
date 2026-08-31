'use client'

import {
  FIELD_BLOCK_CLASS,
  FIELD_CLASS,
  LABEL_CLASS,
} from '@/components/ngotag/ui/formStyles'
import type { FormikErrors, FormikTouched } from 'formik'
import type {
  OrgLocationOption,
  OrgProfileFormValues,
} from './NgotagOrganizationProfile'

import { AuthAlert } from '@/components/ngotag/ui/AuthAlert'
import { GradientButton } from '@/components/ngotag/ui/GradientButton'
import { HairlineButton } from '@/components/ngotag/ui/HairlineButton'
import { Icon } from '@/components/ngotag/ui/icons'
import Loader from '@/components/Loader'
import { NgotagLogoUploader } from '@/components/ngotag/ui/LogoUploader'
import { Select as NgotagSelect } from '@/components/ngotag/ui/Select'
import { PageHeader } from '@/components/ngotag/ui/PageHeader'
import { Panel } from '@/components/ngotag/ui/Panel'
import React from 'react'
import { Stepper } from '@/components/ngotag/ui/Stepper'
import { pathRoutes } from '@/config/pathRoutes'
import { stepLabels } from '@/config/CommonConstant'

/**
 * Same visibility copy and radio-card pattern as the BhutanNDI_Studio
 * reference's CreateOrganizationView — adapted to the ngotag CSS tokens
 * (`.ndi-lift` / `.ndi-check` from ngotag-effects.css already carry the
 * reference's hover-lift and mint-check treatment 1:1).
 */
const VISIBILITY_OPTIONS: {
  id: 'public' | 'private'
  label: string
  hint: string
}[] = [
  {
    id: 'public',
    label: 'Public',
    hint: 'Listed in the ecosystem directory. Other organizations can find you and invite you.',
  },
  {
    id: 'private',
    label: 'Private',
    hint: 'Reachable only by invitation. Nothing about the organization is listed.',
  },
]

interface NgotagCreateOrganizationProps {
  values: OrgProfileFormValues
  errors: FormikErrors<OrgProfileFormValues>
  touched: FormikTouched<OrgProfileFormValues>
  setFieldValue: (field: string, value: string | number | null) => void
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void

  countries: OrgLocationOption[]
  states: OrgLocationOption[]
  cities: OrgLocationOption[]
  onCountryChange: (countryId: number) => void
  onStateChange: (stateId: number) => void
  onCityChange: (cityId: number) => void

  logoPreview: string
  setLogoPreview: (val: string) => void
  imgError: string
  setImgError: (val: string) => void

  /** Local UI selection only — the real create API call does not take a
   * visibility flag today (only update does), so this never changes the
   * create payload; it just lets the user pre-express a preference the
   * same way the reference design does. See CreateOrganizationModal.tsx. */
  isPublic?: boolean
  onSelectVisibility: (isPublic: boolean) => void

  onCreate: () => void
  createDisabled: boolean
  createLoading: boolean

  onCancel: () => void
  cancelLoading: boolean

  success: string | null
  failure: string | null
  onDismissSuccess: () => void
  onDismissFailure: () => void
}

/**
 * The ngotag-themed "Create organization" page — same fields, validation
 * and submit/cancel logic as the original Card/Stepper form
 * (CreateOrganizationModal.tsx owns all of that); this component is
 * presentation only. Mirrors NgotagOrganizationProfile.tsx's field
 * markup (Name/Description/Website/Location cascading Select) for create
 * mode, and swaps the edit page's single "Make private" toggle for the
 * two-card Public/Private picker the create screenshot calls for — the
 * edit page's toggle exists because an org already IS public or private
 * and you're flipping it, whereas creation has no current value yet, so
 * a pick-one card pair reads better than a toggle with no starting state.
 */
export function NgotagCreateOrganization({
  values,
  errors,
  touched,
  setFieldValue,
  handleBlur,
  countries,
  states,
  cities,
  onCountryChange,
  onStateChange,
  onCityChange,
  logoPreview,
  setLogoPreview,
  imgError,
  setImgError,
  isPublic,
  onSelectVisibility,
  onCreate,
  createDisabled,
  createLoading,
  onCancel,
  cancelLoading,
  success,
  failure,
  onDismissSuccess,
  onDismissFailure,
}: NgotagCreateOrganizationProps): React.JSX.Element {
  return (
    <div className="p-6">
      <PageHeader
        crumbs={[
          { label: 'Organizations', href: pathRoutes.organizations.root },
          { label: 'Create' },
        ]}
        title="Create organization"
      />

      <p className="text-ngotag-muted m-0 mt-4 max-w-[62ch] text-[15px] leading-[1.6]">
        An organization owns the schemas, credential definitions, connections
        and wallet you issue under. You become its owner.
      </p>

      {/* Same real step sequence as the original <Stepper currentStep={1}
          totalSteps={totalSteps} /> (src/components/StepperComponent.tsx,
          driven by src/config/CommonConstant.ts's stepLabels) also shown on
          WalletSetup/CreateDid/DidDetails — this is step 1 of that same
          real flow, not a new/invented sequence. */}
      <div className="mt-6">
        <Stepper steps={stepLabels.map((label) => ({ label }))} current={0} />
      </div>

      {success ? (
        <div className="mt-6">
          <AuthAlert
            variant="success"
            message={success}
            onDismiss={onDismissSuccess}
          />
        </div>
      ) : null}
      {failure ? (
        <div className="mt-6">
          <AuthAlert
            variant="danger"
            message={failure}
            onDismiss={onDismissFailure}
          />
        </div>
      ) : null}

      <Panel className="mt-6">
        <div className="flex flex-col gap-6">
          <NgotagLogoUploader
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
            setFieldValue={setFieldValue}
            imgError={imgError}
            setImgError={setImgError}
          />

          <div className="grid gap-4 min-[641px]:grid-cols-2">
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Name</span>
              <input
                name="name"
                value={values.name}
                onChange={(e) => setFieldValue('name', e.target.value)}
                onBlur={handleBlur}
                className={`${FIELD_CLASS} h-12`}
                placeholder="Ministry of Health"
              />
              {errors.name && touched.name ? (
                <p
                  className="text-[12px]"
                  style={{ color: 'var(--ngotag-text-danger)' }}
                >
                  {errors.name}
                </p>
              ) : null}
            </label>

            <div className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Location</span>
              <div className="grid grid-cols-3 gap-2">
                <NgotagSelect
                  label="Country"
                  placeholder="Country"
                  value={values.countryId ? String(values.countryId) : ''}
                  onChange={(value) => onCountryChange(Number(value))}
                  options={countries.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  className="w-full"
                />
                <NgotagSelect
                  label="State"
                  placeholder="State"
                  value={values.stateId ? String(values.stateId) : ''}
                  onChange={(value) => onStateChange(Number(value))}
                  options={states.map((s) => ({
                    value: String(s.id),
                    label: s.name,
                  }))}
                  disabled={!values.countryId}
                  className="w-full"
                />
                <NgotagSelect
                  label="City"
                  placeholder="City"
                  value={values.cityId ? String(values.cityId) : ''}
                  onChange={(value) => onCityChange(Number(value))}
                  options={cities.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  disabled={!values.stateId}
                  className="w-full"
                />
              </div>
              {errors.countryId && touched.countryId ? (
                <p
                  className="text-[12px]"
                  style={{ color: 'var(--ngotag-text-danger)' }}
                >
                  {errors.countryId}
                </p>
              ) : null}
            </div>
          </div>

          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Description</span>
            <input
              name="description"
              value={values.description}
              onChange={(e) => setFieldValue('description', e.target.value)}
              onBlur={handleBlur}
              className={`${FIELD_CLASS} h-12`}
              placeholder="What this organization issues or verifies"
            />
            {errors.description && touched.description ? (
              <p
                className="text-[12px]"
                style={{ color: 'var(--ngotag-text-danger)' }}
              >
                {errors.description}
              </p>
            ) : null}
          </label>

          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Website</span>
            <input
              name="website"
              value={values.website}
              onChange={(e) => setFieldValue('website', e.target.value)}
              onBlur={handleBlur}
              className={`${FIELD_CLASS} h-12`}
              placeholder="https://example.bt"
            />
            {errors.website && touched.website ? (
              <p
                className="text-[12px]"
                style={{ color: 'var(--ngotag-text-danger)' }}
              >
                {errors.website}
              </p>
            ) : null}
          </label>

          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className={`${LABEL_CLASS} p-0`}>Visibility</legend>
            <div className="grid gap-2.5 min-[641px]:grid-cols-2">
              {VISIBILITY_OPTIONS.map((v) => {
                const checked =
                  v.id === 'public' ? isPublic === true : isPublic === false
                return (
                  <label
                    key={v.id}
                    className="ndi-lift flex cursor-pointer items-start gap-3 rounded-xl border p-3.5"
                    style={{
                      borderColor: checked
                        ? 'var(--ngotag-border-strong)'
                        : 'var(--ngotag-border-subtle)',
                      background: checked
                        ? 'var(--ngotag-mint-08)'
                        : 'rgb(var(--ngotag-tint) / 0.02)',
                    }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      className="ndi-check mt-0.5 flex-none"
                      checked={checked}
                      onChange={() => onSelectVisibility(v.id === 'public')}
                    />
                    <span className="min-w-0">
                      <span className="font-display text-ngotag-strong block text-[14px] font-medium">
                        {v.label}
                      </span>
                      <span className="text-ngotag-muted mt-1 block text-[12.5px] leading-[1.5]">
                        {v.hint}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="border-ngotag-subtle flex flex-wrap items-center gap-2.5 border-t pt-5">
            <GradientButton onClick={onCreate} disabled={createDisabled}>
              {createLoading ? (
                <Loader />
              ) : (
                <>
                  <Icon name="check" size={16} strokeWidth={2.2} />
                  Create organization
                </>
              )}
            </GradientButton>
            <HairlineButton onClick={onCancel} disabled={cancelLoading}>
              {cancelLoading ? <Loader /> : 'Cancel'}
            </HairlineButton>
          </div>
        </div>
      </Panel>
    </div>
  )
}
