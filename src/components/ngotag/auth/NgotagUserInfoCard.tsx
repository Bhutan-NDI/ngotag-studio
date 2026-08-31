'use client'
/* eslint-disable sort-imports */

import { CheckCircle2, Eye, EyeOff, LockKeyhole, User } from 'lucide-react'
import type { FormikErrors, FormikTouched } from 'formik'
import React from 'react'

import { AuthAlert } from '@/components/ngotag/ui/AuthAlert'
import {
  FIELD_BLOCK_CLASS,
  FIELD_CLASS,
  LABEL_CLASS,
} from '@/components/ngotag/ui/formStyles'
import { GradientButton } from '@/components/ngotag/ui/GradientButton'
import { Icon } from '@/components/ngotag/ui/icons'
import Loader from '@/components/Loader'

interface UserInfoValues {
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

interface NgotagUserInfoCardProps {
  email: string
  values: UserInfoValues
  errors: FormikErrors<UserInfoValues>
  touched: FormikTouched<UserInfoValues>
  onChange: React.ChangeEventHandler<HTMLInputElement>
  onBlur: React.FocusEventHandler<HTMLInputElement>
  showPassword: boolean
  onToggleShowPassword: () => void
  showConfirmPassword: boolean
  onToggleShowConfirmPassword: () => void
  success: string | null
  onDismissSuccess: () => void
  failure: string | null
  onDismissFailure: () => void
  onChangeEmail: () => void
  loading: boolean
}

/**
 * Sign-up step two: name and password. Reskins UserInfoForm.tsx's fields
 * only — the Formik instance, the Yup schema (min 8 chars, one upper/lower/
 * number/special char), and the addPasswordDetails() call all stay there.
 *
 * The reference's SignupDetailsStep shows a live client-side password
 * checklist against its own invented rules (>=12 chars, etc) instead of the
 * real backend validation. Per the same reasoning the sign-in port used —
 * real per-field errors over a fake single string — this shows the real
 * Formik/Yup errors.password message instead of reinventing that checklist.
 */
export function NgotagUserInfoCard({
  email,
  values,
  errors,
  touched,
  onChange,
  onBlur,
  showPassword,
  onToggleShowPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword,
  success,
  onDismissSuccess,
  failure,
  onDismissFailure,
  onChangeEmail,
  loading,
}: NgotagUserInfoCardProps): React.JSX.Element {
  return (
    <>
      {success ? (
        <AuthAlert
          variant="success"
          message={success}
          onDismiss={onDismissSuccess}
        />
      ) : null}
      {failure ? (
        <AuthAlert
          variant="danger"
          message={failure}
          onDismiss={onDismissFailure}
        />
      ) : null}

      <span className="border-ngotag-grid text-ngotag-body relative z-[4] inline-flex items-center gap-2.5 self-center rounded-full border bg-[var(--ngotag-mint-04)] px-4 py-2 text-[13px]">
        <CheckCircle2 className="text-ngotag-accent h-3.5 w-3.5" />
        {email}
        <button
          type="button"
          onClick={onChangeEmail}
          className="ndi-plainlink text-ngotag-accent text-[12.5px]"
        >
          Change
        </button>
      </span>

      <div className="flex gap-3">
        <label className={`${FIELD_BLOCK_CLASS} flex-1`}>
          <span className={LABEL_CLASS}>First name</span>
          <div className="relative flex items-center">
            <span className="text-ngotag-faint pointer-events-none absolute left-[14px]">
              <User className="h-4 w-4" />
            </span>
            <input
              name="firstName"
              required
              autoComplete="given-name"
              placeholder="First name"
              value={values.firstName}
              onChange={onChange}
              onBlur={onBlur}
              className={`${FIELD_CLASS} h-12 pl-[42px]`}
            />
          </div>
          {errors.firstName && touched.firstName ? (
            <span
              className="text-[12px]"
              style={{ color: 'var(--ngotag-text-danger)' }}
            >
              {errors.firstName}
            </span>
          ) : null}
        </label>

        <label className={`${FIELD_BLOCK_CLASS} flex-1`}>
          <span className={LABEL_CLASS}>Last name</span>
          <div className="relative flex items-center">
            <span className="text-ngotag-faint pointer-events-none absolute left-[14px]">
              <User className="h-4 w-4" />
            </span>
            <input
              name="lastName"
              required
              autoComplete="family-name"
              placeholder="Last name"
              value={values.lastName}
              onChange={onChange}
              onBlur={onBlur}
              className={`${FIELD_CLASS} h-12 pl-[42px]`}
            />
          </div>
          {errors.lastName && touched.lastName ? (
            <span
              className="text-[12px]"
              style={{ color: 'var(--ngotag-text-danger)' }}
            >
              {errors.lastName}
            </span>
          ) : null}
        </label>
      </div>

      <label className={FIELD_BLOCK_CLASS}>
        <span className={LABEL_CLASS}>Password</span>
        <div className="relative flex items-center">
          <span className="text-ngotag-faint pointer-events-none absolute left-[14px]">
            <LockKeyhole className="h-4 w-4" />
          </span>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Choose a strong password"
            value={values.password}
            onChange={onChange}
            onBlur={onBlur}
            className={`${FIELD_CLASS} h-12 pr-[42px] pl-[42px]`}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="ndi-plainlink text-ngotag-faint absolute right-[14px]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && touched.password ? (
          <span
            className="text-[12px]"
            style={{ color: 'var(--ngotag-text-danger)' }}
          >
            {errors.password}
          </span>
        ) : null}
      </label>

      <label className={FIELD_BLOCK_CLASS}>
        <span className={LABEL_CLASS}>Confirm password</span>
        <div className="relative flex items-center">
          <span className="text-ngotag-faint pointer-events-none absolute left-[14px]">
            <LockKeyhole className="h-4 w-4" />
          </span>
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={onChange}
            onBlur={onBlur}
            className={`${FIELD_CLASS} h-12 pr-[42px] pl-[42px]`}
          />
          <button
            type="button"
            onClick={onToggleShowConfirmPassword}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            className="ndi-plainlink text-ngotag-faint absolute right-[14px]"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && touched.confirmPassword ? (
          <span
            className="text-[12px]"
            style={{ color: 'var(--ngotag-text-danger)' }}
          >
            {errors.confirmPassword}
          </span>
        ) : null}
      </label>

      <GradientButton type="submit" block disabled={loading} className="mt-1">
        {loading && <Loader size={20} isExpand={false} />}
        {loading ? 'Creating account…' : 'Create account'}
        {!loading && <Icon name="arrowRight" size={16} strokeWidth={2} />}
      </GradientButton>
    </>
  )
}
