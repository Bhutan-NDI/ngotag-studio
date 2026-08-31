'use client'

import DynamicApplicationLogo from './DynamicLogo'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { NgotagAuthShell } from '@/components/ngotag/auth/NgotagAuthShell'
import React from 'react'
import { SecureSignInScene } from '@/components/ngotag/auth/scenes'
import UserAuthForm from './user-auth-form'
import { isNgotagTheme } from '@/lib/active-theme'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE?.trim() || 'Studio'

export default function SignInPage(): React.JSX.Element {
  if (isNgotagTheme()) {
    return (
      <NgotagAuthShell
        scene={<SecureSignInScene />}
        title={
          <>
            Your identity, <span className="ndi-wave-text">verified once</span>
          </>
        }
        lead={`${appTitle} is where organizations issue and verify digital credentials.`}
      >
        <UserAuthForm />
      </NgotagAuthShell>
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
