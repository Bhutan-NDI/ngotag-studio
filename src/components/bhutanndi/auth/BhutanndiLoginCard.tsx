'use client'
/* eslint-disable sort-imports */

import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FIELD_CLASS, LABEL_CLASS } from '@/components/bhutanndi/ui/formStyles'
import React from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { GradientButton } from '@/components/bhutanndi/ui/GradientButton'
import { Icon } from '@/components/bhutanndi/ui/icons'
import Link from 'next/link'
import Loader from '@/components/Loader'

interface SignInFormValues {
  email: string
  password: string
}

interface BhutanndiLoginCardProps {
  signInForm: UseFormReturn<SignInFormValues>
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  showPassword: boolean
  onToggleShowPassword: () => void
  alert: string | null
  onDismissAlert: () => void
  success: string | null
  onDismissSuccess: () => void
  forgetPasswordLoading: boolean
  onForgotPassword: () => void
  signUpUrl: string
}

/**
 * The real sign-in card, restyled to the bhutanndi design language. All the
 * logic — the zod-validated react-hook-form instance, the actual
 * `signIn('credentials', ...)` call, forgot-password, loading states — stays
 * in src/features/components/user-auth-form.tsx; this component only
 * receives it and renders it. Presentation is adapted from
 * BhutanNDI_Studio's LoginStep, which assumed a fake single-field error
 * string — here FormField/FormMessage carry the same per-field zod errors
 * the rest of this app's forms already show.
 */
export function BhutanndiLoginCard({
  signInForm,
  onSubmit,
  loading,
  showPassword,
  onToggleShowPassword,
  alert,
  onDismissAlert,
  success,
  onDismissSuccess,
  forgetPasswordLoading,
  onForgotPassword,
  signUpUrl,
}: BhutanndiLoginCardProps): React.JSX.Element {
  return (
    <>
      <header className="relative z-[4] mb-6 flex flex-col items-center gap-3 text-center">
        <div>
          <h1 className="text-bhutanndi-strong font-display m-0 text-[26px] leading-[1.15] font-semibold tracking-[-0.025em]">
            Sign in
          </h1>
          <p className="text-bhutanndi-muted m-0 mt-1.5 text-[14px] leading-[1.5]">
            Sign in to your account to continue
          </p>
        </div>
      </header>

      {alert ? (
        <p
          role="alert"
          className="relative z-[4] m-0 mb-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-[1.5]"
          style={{
            borderColor: 'var(--bhutanndi-text-danger)',
            background: 'rgb(var(--bhutanndi-tint) / 0.03)',
            color: 'var(--bhutanndi-text-danger)',
          }}
        >
          <Icon
            name="shieldAlert"
            size={15}
            strokeWidth={2}
            className="mt-px flex-none"
          />
          <span className="flex-1">{alert}</span>
          <button
            type="button"
            onClick={onDismissAlert}
            aria-label="Dismiss"
            className="ndi-plainlink -mr-1 flex-none"
          >
            <Icon name="close" size={14} strokeWidth={2} />
          </button>
        </p>
      ) : null}

      {success ? (
        <p
          role="status"
          aria-live="polite"
          className="text-bhutanndi-accent border-bhutanndi-grid relative z-[4] mb-5 flex items-start gap-2 rounded-xl border bg-[var(--bhutanndi-mint-08)] px-3.5 py-3 text-[13px] leading-[1.5]"
        >
          <Icon
            name="check"
            size={14}
            strokeWidth={2.2}
            className="mt-px flex-none"
          />
          <span className="flex-1">{success}</span>
          <button
            type="button"
            onClick={onDismissSuccess}
            aria-label="Dismiss"
            className="ndi-plainlink text-bhutanndi-faint -mr-1 flex-none"
          >
            <Icon name="close" size={14} strokeWidth={2} />
          </button>
        </p>
      ) : null}

      <Form {...signInForm}>
        <form
          noValidate
          className="relative z-[4] flex flex-col gap-[18px]"
          onSubmit={onSubmit}
        >
          <FormField
            control={signInForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL_CLASS}>Your email</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <span className="text-bhutanndi-faint pointer-events-none absolute left-[14px]">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      {...field}
                      type="email"
                      placeholder="name@company.com"
                      disabled={loading}
                      className={`${FIELD_CLASS} h-12 pl-[42px]`}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={signInForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <span className="flex items-baseline justify-between gap-3">
                  <FormLabel className={LABEL_CLASS}>Password</FormLabel>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    disabled={forgetPasswordLoading || loading}
                    className="ndi-plainlink text-bhutanndi-accent text-[12.5px] disabled:pointer-events-none disabled:opacity-60"
                  >
                    {forgetPasswordLoading
                      ? 'Send reset link . . .'
                      : 'Forgot password?'}
                  </button>
                </span>
                <FormControl>
                  <div className="relative flex items-center">
                    <span className="text-bhutanndi-faint pointer-events-none absolute left-[14px]">
                      <LockKeyhole className="h-4 w-4" />
                    </span>
                    <input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={loading}
                      className={`${FIELD_CLASS} h-12 pr-[42px] pl-[42px]`}
                    />
                    <button
                      type="button"
                      onClick={onToggleShowPassword}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="ndi-plainlink text-bhutanndi-faint absolute right-[14px]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <GradientButton
            type="submit"
            block
            disabled={loading}
            className="mt-1"
          >
            {loading && <Loader size={20} isExpand={false} />}
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <Icon name="arrowRight" size={16} strokeWidth={2} />}
          </GradientButton>
        </form>
      </Form>

      <p className="text-bhutanndi-muted relative z-[4] m-0 mt-5 text-center text-[13.5px]">
        Don&rsquo;t have an account?{' '}
        <Link
          href={signUpUrl}
          className="ndi-plainlink text-bhutanndi-accent font-medium"
        >
          Create one
        </Link>
      </p>
    </>
  )
}
