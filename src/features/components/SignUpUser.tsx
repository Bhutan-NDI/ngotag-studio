'use client'
/* eslint-disable sort-imports */

import React, { useState } from 'react'

import EmailVerificationForm from './EmailVerificationForm'
import Footer from '@/components/Footer'
import Link from 'next/link'
import UserInfoForm from './UserInfoForm'
import { useSearchParams } from 'next/navigation'
import { BhutanndiAuthShell } from '@/components/bhutanndi/auth/BhutanndiAuthShell'
import {
  PasswordScene,
  SecureSignInScene,
} from '@/components/bhutanndi/auth/scenes'
import { Icon } from '@/components/bhutanndi/ui/icons'
import { isBhutanndiTheme } from '@/lib/active-theme'

interface SignUpUserProps {
  invitationVerified?: boolean
}

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE?.trim() || 'Studio'

export default function SignUpUser({
  invitationVerified,
}: SignUpUserProps): React.JSX.Element {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState<string>('')
  const searchParam = useSearchParams()
  const userEmail = searchParam.get('email')
  const redirectTo = searchParam.get('redirectTo')
  const clientAlias = searchParam.get('clientAlias')

  const signInUrl =
    redirectTo && clientAlias
      ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}&clientAlias=${clientAlias}`
      : '/sign-in'

  // Returning from marketplace landing means the user has a purchase token —
  // show the sign-up form. Otherwise SignUpViewPage already handled the gate.
  const cameFromMarketplace = (redirectTo ?? '').includes(
    '/marketplace/landing',
  )
  const marketplaceRequired =
    process.env.NEXT_PUBLIC_MARKETPLACE_REQUIRED === 'true'

  const emailLocked =
    (cameFromMarketplace || Boolean(invitationVerified)) && Boolean(userEmail)

  if (isBhutanndiTheme()) {
    const rail =
      step === 1
        ? {
            scene: <SecureSignInScene />,
            title: (
              <>
                Set up your{' '}
                <span className="ndi-wave-text">{appTitle} account</span>
              </>
            ),
            lead: 'One account, whichever side you are on — issue credentials, ask for proofs, or both.',
          }
        : {
            scene: <PasswordScene />,
            title: (
              <>
                Set a password you{' '}
                <span className="ndi-wave-text">won&rsquo;t reuse</span>
              </>
            ),
            lead: 'It guards every credential you issue and every proof you request, so give it length over cleverness.',
          }

    return (
      <BhutanndiAuthShell
        scene={rail.scene}
        title={rail.title}
        lead={rail.lead}
      >
        <header className="relative z-[4] mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex w-full max-w-[168px] flex-col items-center gap-2">
            <span className="font-bhutanndi-mono text-bhutanndi-faint text-[10px] tracking-[0.16em] uppercase">
              Step {step} <span className="opacity-50">of</span> 2
            </span>
            <span
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={2}
              aria-valuenow={step}
              aria-label={`Step ${step} of 2`}
              className="flex w-full gap-1.5"
            >
              {[1, 2].map((s) => (
                <span
                  key={s}
                  className="h-[3px] flex-1 rounded-full"
                  style={
                    s <= step
                      ? {
                          background: 'var(--bhutanndi-grad-mint)',
                          boxShadow: 'var(--bhutanndi-glow-sm)',
                        }
                      : { background: 'var(--bhutanndi-border-grid)' }
                  }
                />
              ))}
            </span>
          </div>

          <div>
            <h1 className="text-bhutanndi-strong font-display m-0 text-[26px] leading-[1.15] font-semibold tracking-[-0.025em]">
              Create an account
            </h1>
            <p className="text-bhutanndi-muted m-0 mt-1.5 text-[14px] leading-[1.5]">
              {step === 1
                ? 'Start with the address you will sign in with'
                : 'Your name and a password'}
            </p>
          </div>
        </header>

        {!marketplaceRequired ? (
          <p className="border-bhutanndi-grid text-bhutanndi-muted relative z-[4] m-0 mb-5 flex items-start gap-2.5 rounded-xl border bg-[var(--bhutanndi-fill-sunk)] px-3.5 py-3 text-[13px] leading-[1.5]">
            <Icon
              name="info"
              size={15}
              strokeWidth={2}
              className="mt-px flex-none"
            />
            <span className="flex-1">
              You are registering using <strong>Free plan</strong> with limited
              usage. Upgrade to avoid any interruptions.
            </span>
          </p>
        ) : null}

        {step === 1 ? (
          <EmailVerificationForm
            email={userEmail ?? ''}
            setEmail={setEmail}
            goToNext={() => setStep(2)}
            locked={emailLocked}
          />
        ) : null}

        {step === 2 ? (
          <UserInfoForm
            email={email || userEmail || ''}
            goBack={() => setStep(1)}
          />
        ) : null}

        {step === 1 ? (
          <p className="text-bhutanndi-muted relative z-[4] m-0 mt-5 text-center text-[13.5px]">
            Already have an account?{' '}
            <Link
              href={signInUrl}
              className="ndi-plainlink text-bhutanndi-accent font-medium"
            >
              Sign in
            </Link>
          </p>
        ) : null}
      </BhutanndiAuthShell>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Subscription Message — only relevant when there is a free tier */}
      {!marketplaceRequired && (
        <div className="mb-4 w-full max-w-md rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
          <p className="mt-1 text-sm">
            You are registering using <strong>Free plan</strong> with limited
            usage.
            <span className="ml-1">Upgrade to avoid any interruptions.</span>
          </p>
        </div>
      )}
      <div className="bg-card border-border relative z-10 h-full w-[480px] max-w-md overflow-hidden rounded-xl border p-8 shadow-xl transition-transform duration-300">
        <h2 className="mb-2 text-center text-xl font-semibold">
          Create an account
        </h2>

        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} `}
              >
                {s}
              </div>
              {i < 1 && (
                <div
                  className={`h-1 w-6 rounded-full ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <EmailVerificationForm
            email={userEmail ?? ''}
            setEmail={setEmail}
            goToNext={() => setStep(2)}
            locked={emailLocked}
          />
        )}

        {step === 2 && (
          <UserInfoForm
            email={email || userEmail || ''}
            goBack={() => setStep(1)}
          />
        )}

        <div className="text-muted-foreground mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href={signInUrl}>
            <span className="url-link hover:underline">Sign in</span>
          </Link>
        </div>
      </div>
      <Footer fixed={true} />
    </div>
  )
}
