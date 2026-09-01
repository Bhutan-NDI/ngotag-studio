'use client'

import { BhutanndiAuthShell } from '@/components/bhutanndi/auth/BhutanndiAuthShell'
import DynamicApplicationLogo from './DynamicLogo'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import React from 'react'
import { SecureSignInScene } from '@/components/bhutanndi/auth/scenes'
import UserAuthForm from './user-auth-form'
import { isBhutanndiTheme } from '@/lib/active-theme'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE?.trim() || 'Studio'

export default function SignInPage(): React.JSX.Element {
  if (isBhutanndiTheme()) {
    return (
      <BhutanndiAuthShell
        scene={<SecureSignInScene />}
        title={
          <>
            Your identity, <span className="ndi-wave-text">verified once</span>
          </>
        }
        lead={`${appTitle} is where organizations issue and verify digital credentials.`}
      >
        <UserAuthForm />
      </BhutanndiAuthShell>
    )
  }

  return (
    <div className="relative flex h-screen flex-col overflow-y-auto bg-[image:var(--card-gradient)]">
      <div className="absolute top-1 left-0 z-20 max-h-24 md:top-8 md:left-4">
        <DynamicApplicationLogo />
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <UserAuthForm />
      </div>
      <Footer />
    </div>
  )
}
