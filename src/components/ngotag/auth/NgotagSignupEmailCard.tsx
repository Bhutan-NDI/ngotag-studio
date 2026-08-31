'use client'
/* eslint-disable sort-imports */

import { Mail } from 'lucide-react'
import React from 'react'

import { AuthAlert } from '@/components/ngotag/ui/AuthAlert'
import {
  FIELD_BLOCK_CLASS,
  FIELD_CLASS,
  LABEL_CLASS,
} from '@/components/ngotag/ui/formStyles'
import { GradientButton } from '@/components/ngotag/ui/GradientButton'
import { Icon } from '@/components/ngotag/ui/icons'

interface NgotagSignupEmailCardProps {
  email: string
  error?: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  onBlur: React.FocusEventHandler<HTMLInputElement>
  locked: boolean
  loading: boolean
  verifyLoader: boolean
  emailSent: boolean
  addFailure: string | null
  onDismissFailure: () => void
  onUseDifferentEmail: () => void
}

/**
 * Sign-up step one: the address the account will belong to. Reskins
 * EmailVerificationForm.tsx's fields only — the Formik instance, the
 * checkUserExist/sendVerificationMail calls, and the auto-send-on-mount
 * effect for locked (marketplace/invitation) emails all stay in that file.
 * Adapted from BhutanNDI_Studio's SignupEmailStep, but the "check your
 * inbox" and locked states are real states that reference doesn't have —
 * they come straight from EmailVerificationForm's own logic.
 */
export function NgotagSignupEmailCard({
  email,
  error,
  onChange,
  onBlur,
  locked,
  loading,
  verifyLoader,
  emailSent,
  addFailure,
  onDismissFailure,
  onUseDifferentEmail,
}: NgotagSignupEmailCardProps): React.JSX.Element {
  const busy = loading || verifyLoader

  return (
    <>
      {addFailure ? (
        <AuthAlert
          variant="danger"
          message={addFailure}
          onDismiss={onDismissFailure}
        />
      ) : null}

      {emailSent ? (
        <div className="border-ngotag-grid relative z-[4] flex flex-col gap-3 rounded-xl border bg-[var(--ngotag-fill-sunk)] px-4 py-3.5">
          <p className="text-ngotag-strong m-0 text-[13.5px] font-medium">
            Check your inbox
          </p>
          <p className="text-ngotag-muted m-0 text-[12.5px] leading-[1.5]">
            We sent a verification link to{' '}
            <span className="text-ngotag-strong font-medium">{email}</span>.
            Open it to continue creating your account — this page reopens
            automatically when you return.
          </p>
          <p className="text-ngotag-faint m-0 text-[11.5px]">
            Don&apos;t see it? Check your spam folder.
          </p>
          {!locked ? (
            <button
              type="button"
              onClick={onUseDifferentEmail}
              className="ndi-plainlink text-ngotag-accent self-start text-[12.5px] font-medium"
            >
              Use a different email
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Your email</span>
            <div className="relative flex items-center">
              <span className="text-ngotag-faint pointer-events-none absolute left-[14px]">
                <Mail className="h-4 w-4" />
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={onChange}
                onBlur={onBlur}
                readOnly={locked}
                disabled={busy}
                className={`${FIELD_CLASS} h-12 pl-[42px] ${locked ? 'opacity-60' : ''}`}
              />
            </div>
            {error ? (
              <span
                className="text-[12px]"
                style={{ color: 'var(--ngotag-text-danger)' }}
              >
                {error}
              </span>
            ) : null}
          </label>

          <GradientButton type="submit" block disabled={busy} className="mt-1">
            {busy ? 'Processing…' : 'Continue with email'}
            {busy ? null : <Icon name="arrowRight" size={16} strokeWidth={2} />}
          </GradientButton>
        </>
      )}
    </>
  )
}
