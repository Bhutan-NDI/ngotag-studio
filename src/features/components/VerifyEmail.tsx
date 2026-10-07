'use client'

import { ArrowRight, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { IEmailVerifyData, verifyUserMail } from '@/app/api/Auth'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { apiStatusCodes } from '@/config/CommonConstant'
import { isBhutanndiTheme } from '@/lib/active-theme'
import { validEmail } from '@/utils/TextTransform'

export default function VerifyEmailPage(): React.JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')

  const hasVerifiedRef = useRef(false)
  useEffect(() => {
    if (hasVerifiedRef.current) {
      return
    }
    hasVerifiedRef.current = true

    const verificationCode = searchParams.get('verificationCode') || ''
    const rawEmail = searchParams.get('email') || ''
    const validatedEmail = validEmail(rawEmail)

    const payload: IEmailVerifyData = {
      verificationCode,
      email: validatedEmail,
    }

    setEmail(validatedEmail)

    if (!verificationCode || !validatedEmail) {
      setError(true)
      setMessage('This verification link is invalid or incomplete.')
      setLoading(false)
      return
    }

    const verifyEmail = async (): Promise<void> => {
      try {
        const response = await verifyUserMail(payload)
        // On failure the API wrapper returns the error message as a string.
        if (typeof response === 'string') {
          setError(true)
          setMessage(response || 'Verification failed. Please try again.')
          return
        }
        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setError(false)
          setMessage(data?.message)
        } else {
          setError(true)
          setMessage(data?.message || 'Verification failed. Please try again.')
        }
      } catch (err) {
        setError(true)
        setMessage(
          'An error occurred during verification. Please try again later.',
        )
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleRedirect = (): void => {
    const redirectTo = searchParams.get('redirectTo')
    const clientAlias = searchParams.get('clientAlias')
    const invitationId = searchParams.get('invitationId')

    const params = new URLSearchParams({ email })
    if (redirectTo) {
      params.set('redirectTo', redirectTo)
    }
    if (clientAlias) {
      params.set('clientAlias', clientAlias)
    }
    if (invitationId) {
      params.set('invitationId', invitationId)
    }

    router.push(`/sign-up?${params.toString()}`)
  }

  return (
    <div
      className={`flex items-center justify-center overflow-y-auto p-4 ${
        isBhutanndiTheme()
          ? 'min-h-full'
          : 'h-screen bg-[image:var(--card-gradient)]'
      }`}
    >
      <div className="bg-card border-border w-full max-w-md overflow-hidden rounded-xl border p-8 shadow-xl">
        <div className="text-center">
          <div className="space-y-6">
            {loading ? (
              <>
                <div className="flex justify-center">
                  <Loader2 className="text-muted-foreground h-16 w-16 animate-spin" />
                </div>
                <h2 className="text-muted-foreground text-xl">
                  Verifying your email...
                </h2>
              </>
            ) : error ? (
              <>
                <div className="flex justify-center">
                  <div className="inline-block rounded-full p-3">
                    <XCircle
                      className="text-destructive h-16 w-16"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold">Verification failed</h1>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-muted-foreground text-sm">
                  The link may be invalid, expired or already used. Go back to
                  sign up to request a new verification email.
                </p>
                <Button
                  onClick={handleRedirect}
                  className="flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 font-medium"
                >
                  Back to Sign Up
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="inline-block rounded-full p-3">
                    <CheckCircle
                      className="h-16 w-16 text-[var(--color-green)]"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold">Congratulations!</h1>
                <h2 className="text-muted-foreground text-xl">
                  Email verified successfully
                </h2>
                <Button
                  onClick={handleRedirect}
                  className="flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 font-medium"
                >
                  Continue to Sign Up
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
