'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  FIELD_BLOCK_CLASS,
  FIELD_CLASS,
  LABEL_CLASS,
} from '@/components/bhutanndi/ui/formStyles'
import type { FormikErrors, FormikTouched } from 'formik'

import { AuthAlert } from '@/components/bhutanndi/ui/AuthAlert'
import { AvatarBadge } from '@/components/bhutanndi/ui/AvatarBadge'
import { BhutanndiLogoUploader } from '@/components/bhutanndi/ui/LogoUploader'
import { Select as BhutanndiSelect } from '@/components/bhutanndi/ui/Select'
import { GradientButton } from '@/components/bhutanndi/ui/GradientButton'
import { HairlineButton } from '@/components/bhutanndi/ui/HairlineButton'
import { Icon } from '@/components/bhutanndi/ui/icons'
import Loader from '@/components/Loader'
import { PageHeader } from '@/components/bhutanndi/ui/PageHeader'
import { Panel } from '@/components/bhutanndi/ui/Panel'
import React from 'react'
import { dateConversion } from '@/utils/DateConversion'
import { pathRoutes } from '@/config/pathRoutes'

export interface OrgLocationOption {
  id: number
  name: string
}

/** The subset of the real edit-form's Formik values this page renders. */
export interface OrgProfileFormValues {
  name: string
  description: string
  countryId: string | null
  stateId: string | null
  cityId: string | null
  website: string
}

interface BhutanndiOrganizationProfileProps {
  orgId: string
  orgName: string
  orgLogoUrl?: string | null
  /** "owner", "admin" … — the real userOrgRoles for this org, already resolved by the caller. */
  roleLabels: string[]
  /** org.createDateTime from getOrganizationById — omitted upstream (not rendered) if absent. */
  createDateTime?: string

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

  isPublic?: boolean
  onTogglePublic: () => void

  onSave: () => void
  saveDisabled: boolean
  saveLoading: boolean

  success: string | null
  failure: string | null
  onDismissSuccess: () => void
  onDismissFailure: () => void

  /** Real counts from getOrgDashboard — same source as OrganizationAtAGlance. */
  membersCount?: number
  schemasCount?: number
  credentialsCount?: number

  /** Delete safety — mirrors DeleteOrganization.tsx's real blocking checks. */
  canDeleteNow: boolean
  blockedReason: string | null
  showDeleteConfirm: boolean
  onOpenDeleteConfirm: () => void
  onCloseDeleteConfirm: () => void
  onConfirmDelete: () => void
  deleteLoading: boolean
  deleteError: string | null
  onDismissDeleteError: () => void
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: 'users' | 'layers' | 'credentials'
  value?: number
  label: string
}): React.JSX.Element {
  return (
    <Panel className="flex items-center gap-3.5">
      <span
        className="border-bhutanndi-grid text-bhutanndi-accent inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border"
        style={{ background: 'var(--bhutanndi-mint-04)' }}
      >
        <Icon name={icon} size={19} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="font-bhutanndi-mono text-bhutanndi-strong text-[22px] leading-none font-semibold">
          {typeof value === 'number' ? value : '—'}
        </p>
        <p className="text-bhutanndi-muted mt-1.5 truncate text-[12.5px]">
          {label}
        </p>
      </div>
    </Panel>
  )
}

/**
 * The unified bhutanndi "Organization profile" page: stats, org identity,
 * an edit form for the real fields (name, description, location,
 * website, public/private), and a danger-zone delete panel — replacing
 * the two separate /create-organization?orgId= and
 * /delete-organization?orgId= flows the org card's Settings menu used to
 * link to. All state, validation and API calls are owned by the caller
 * (CreateOrganizationModal.tsx); this component is presentation only.
 */
export function BhutanndiOrganizationProfile({
  orgId,
  orgName,
  orgLogoUrl,
  roleLabels,
  createDateTime,
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
  onTogglePublic,
  onSave,
  saveDisabled,
  saveLoading,
  success,
  failure,
  onDismissSuccess,
  onDismissFailure,
  membersCount,
  schemasCount,
  credentialsCount,
  canDeleteNow,
  blockedReason,
  showDeleteConfirm,
  onOpenDeleteConfirm,
  onCloseDeleteConfirm,
  onConfirmDelete,
  deleteLoading,
  deleteError,
  onDismissDeleteError,
}: BhutanndiOrganizationProfileProps): React.JSX.Element {
  const roleLabel =
    roleLabels.length > 0
      ? roleLabels
          .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
          .join(' & ')
      : null

  return (
    <div className="p-6" id="danger-zone-page">
      <PageHeader
        crumbs={[
          { label: 'Organizations', href: pathRoutes.organizations.root },
          { label: orgName },
        ]}
        title="Organization profile"
        actions={
          <a href={pathRoutes.organizations.billing}>
            <HairlineButton>
              <Icon name="creditCard" size={16} strokeWidth={1.8} />
              Billing
            </HairlineButton>
          </a>
        }
      />

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

      <div className="mt-6 grid grid-cols-1 gap-4 min-[560px]:grid-cols-3">
        <StatTile icon="users" value={membersCount} label="Members" />
        <StatTile icon="layers" value={schemasCount} label="Schemas" />
        <StatTile
          icon="credentials"
          value={credentialsCount}
          label="Credentials issued"
        />
      </div>

      <Panel className="mt-5">
        <div className="flex items-center gap-4">
          <AvatarBadge name={orgName} src={orgLogoUrl} size={52} />
          <div className="min-w-0">
            <h2 className="font-display text-bhutanndi-strong truncate text-[17px] font-semibold">
              {orgName}
            </h2>
            <p className="text-bhutanndi-muted mt-0.5 truncate text-[13px]">
              {[
                roleLabel,
                createDateTime
                  ? `created ${dateConversion(createDateTime)}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <BhutanndiLogoUploader
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
            setFieldValue={setFieldValue}
            imgError={imgError}
            setImgError={setImgError}
            existingLogoUrl={orgLogoUrl ?? undefined}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 min-[640px]:grid-cols-2">
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Name</span>
            <input
              name="name"
              value={values.name}
              onChange={(e) => setFieldValue('name', e.target.value)}
              onBlur={handleBlur}
              className={`${FIELD_CLASS} h-11`}
              placeholder="Enter organization name"
            />
            {errors.name && touched.name ? (
              <p
                className="text-[12px]"
                style={{ color: 'var(--bhutanndi-text-danger)' }}
              >
                {errors.name}
              </p>
            ) : null}
          </label>

          <div className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Location</span>
            <div className="grid grid-cols-3 gap-2">
              <BhutanndiSelect
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
              <BhutanndiSelect
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
              <BhutanndiSelect
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
                style={{ color: 'var(--bhutanndi-text-danger)' }}
              >
                {errors.countryId}
              </p>
            ) : null}
          </div>

          <label className={`${FIELD_BLOCK_CLASS} min-[640px]:col-span-2`}>
            <span className={LABEL_CLASS}>Description</span>
            <input
              name="description"
              value={values.description}
              onChange={(e) => setFieldValue('description', e.target.value)}
              onBlur={handleBlur}
              className={`${FIELD_CLASS} h-11`}
              placeholder="Enter organization description"
            />
            {errors.description && touched.description ? (
              <p
                className="text-[12px]"
                style={{ color: 'var(--bhutanndi-text-danger)' }}
              >
                {errors.description}
              </p>
            ) : null}
          </label>

          <label className={`${FIELD_BLOCK_CLASS} min-[640px]:col-span-2`}>
            <span className={LABEL_CLASS}>Website</span>
            <input
              name="website"
              value={values.website}
              onChange={(e) => setFieldValue('website', e.target.value)}
              onBlur={handleBlur}
              className={`${FIELD_CLASS} h-11`}
              placeholder="https://example.com"
            />
            {errors.website && touched.website ? (
              <p
                className="text-[12px]"
                style={{ color: 'var(--bhutanndi-text-danger)' }}
              >
                {errors.website}
              </p>
            ) : null}
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <GradientButton onClick={onSave} disabled={saveDisabled}>
            {saveLoading ? (
              <Loader />
            ) : (
              <>
                <Icon name="check" size={16} strokeWidth={2.2} />
                Save changes
              </>
            )}
          </GradientButton>
          <HairlineButton
            onClick={onTogglePublic}
            disabled={isPublic === undefined}
          >
            <Icon name="lockRounded" size={16} strokeWidth={1.8} />
            {isPublic ? 'Make private' : 'Make public'}
          </HairlineButton>
        </div>
      </Panel>

      <Panel className="mt-5" id="danger-zone">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h3
              className="text-[15px] font-semibold"
              style={{ color: 'var(--bhutanndi-text-danger)' }}
            >
              Delete this organization
            </h3>
            <p className="text-bhutanndi-muted mt-1 max-w-[52ch] text-[13px]">
              Removes the organization and everything it owns. This cannot be
              undone.
            </p>
            {!canDeleteNow && blockedReason ? (
              <p
                className="mt-2 text-[12.5px]"
                style={{ color: 'var(--bhutanndi-text-danger)' }}
              >
                {blockedReason}{' '}
                <a
                  href={`/delete-organization?orgId=${orgId}`}
                  className="ndi-plainlink underline"
                >
                  Clear related records
                </a>
              </p>
            ) : null}
          </div>
          <HairlineButton
            onClick={onOpenDeleteConfirm}
            disabled={!canDeleteNow}
            style={{
              borderColor: 'var(--bhutanndi-text-danger)',
              color: 'var(--bhutanndi-text-danger)',
              background: 'transparent',
            }}
          >
            <Icon name="trash" size={16} strokeWidth={1.8} />
            Delete organization
          </HairlineButton>
        </div>
        {deleteError ? (
          <div className="mt-4">
            <AuthAlert
              variant="danger"
              message={deleteError}
              onDismiss={onDismissDeleteError}
            />
          </div>
        ) : null}
      </Panel>

      <AlertDialog open={showDeleteConfirm} onOpenChange={onCloseDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Are you sure you want to delete organization{' '}
                <span className="text-lg font-bold">{orgName}</span>?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              No, cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? 'Processing…' : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
