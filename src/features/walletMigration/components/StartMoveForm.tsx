'use client'

import * as yup from 'yup'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Field, FieldProps, Form, Formik, FormikHelpers } from 'formik'
import { IMigrationWithPreflight, IStartMovePayload } from '../types'
import { IStepUpSession, startMigration } from '@/app/api/walletMigration'
import { PUBLIC_HOST_MESSAGE, isHttpsUrl, isPublicHost } from '../agentUrl'
import React, { useState } from 'react'

import { BeforeYouStart } from './BeforeYouStart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepUpSignInDialog } from './StepUpSignInDialog'
import { describeMigrationError } from '../errorMessages'

interface IStartMoveValues {
  adminUrl: string
  publicUrl: string
  apiKey: string
  setupConfirmed: boolean
  backupsConfirmed: boolean
}

const originOf = (value?: string): string | null => {
  try {
    return value ? new URL(value.trim()).origin : null
  } catch {
    return null
  }
}

const initialValues: IStartMoveValues = {
  adminUrl: '',
  publicUrl: '',
  apiKey: '',
  setupConfirmed: false,
  backupsConfirmed: false,
}

const validationSchema = yup.object({
  adminUrl: yup
    .string()
    .trim()
    .required('Agent admin address is required')
    .test(
      'https',
      'Enter an HTTPS address, e.g. https://agent.example.bt',
      isHttpsUrl,
    )
    .test('public', PUBLIC_HOST_MESSAGE, isPublicHost),
  publicUrl: yup
    .string()
    .trim()
    .required('Agent public DIDComm address is required')
    .test(
      'https',
      'Enter an HTTPS address, e.g. https://didcomm.example.bt',
      isHttpsUrl,
    )
    .test('public', PUBLIC_HOST_MESSAGE, isPublicHost)
    // The platform needs the two on different origins (scheme, host, port).
    .test(
      'different',
      'Must be a different address from the admin address',
      (value, context) => {
        const admin = originOf(context.parent.adminUrl)
        return !admin || originOf(value) !== admin
      },
    ),
  apiKey: yup.string().required('API key is required'),
  setupConfirmed: yup
    .boolean()
    .oneOf([true], 'Please confirm the agent is set up'),
  backupsConfirmed: yup.boolean().oneOf([true], 'Please confirm your backups'),
})

interface StartMoveFormProps {
  orgId: string
  onStarted: (data: IMigrationWithPreflight) => void
  onCancel: () => void
}

/** SCR-WM-02: the owner enters the new agent's details and starts the move. */
export function StartMoveForm({
  orgId,
  onStarted,
  onCancel,
}: Readonly<StartMoveFormProps>): React.JSX.Element {
  const [showApiKey, setShowApiKey] = useState(false)
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [pending, setPending] = useState<{
    values: IStartMoveValues
    helpers: FormikHelpers<IStartMoveValues>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (
    values: IStartMoveValues,
    helpers: FormikHelpers<IStartMoveValues>,
  ): void => {
    setError(null)
    setPending({ values, helpers })
    setStepUpOpen(true)
  }

  const onStepUpVerified = async (session: IStepUpSession): Promise<void> => {
    setStepUpOpen(false)
    if (!pending) {
      return
    }
    const { values, helpers } = pending
    helpers.setSubmitting(true)
    const payload: IStartMovePayload = {
      targetAdminEndpoint: values.adminUrl.trim(),
      targetDidcommEndpoint: values.publicUrl.trim(),
      apiKey: values.apiKey,
      backupsConfirmed: values.backupsConfirmed,
    }
    // Sent with the fresh session's token: the platform requires a sign-in
    // within the last five minutes for this call.
    const result = await startMigration(orgId, payload, session)
    // Never keep the API key around after submitting (P-05).
    helpers.setFieldValue('apiKey', '')
    helpers.setSubmitting(false)
    setPending(null)
    if (!result.ok) {
      setError(describeMigrationError(result.code, result.message))
      return
    }
    onStarted(result.data)
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">New agent details</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Your organisation&apos;s wallet will move from the shared agent to your
        own agent. First we check your agent and run a rehearsal, which
        doesn&apos;t pause anything. Then you pick a time for the move. Citizens
        don&apos;t need to do anything.
      </p>

      <BeforeYouStart orgId={orgId} />

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => (
          <Form className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="adminUrl">Agent admin address</Label>
              <Field
                as={Input}
                id="adminUrl"
                name="adminUrl"
                placeholder="https://agent-admin.example.bt"
                readOnly={isSubmitting}
              />
              <p className="text-muted-foreground text-xs">
                The HTTPS address that reaches your agent&apos;s admin port (
                <code>adminPort</code>). Our platform uses it to manage your
                agent. Allow only our IP addresses.
              </p>
              {touched.adminUrl && errors.adminUrl && (
                <p className="text-destructive text-sm">{errors.adminUrl}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="publicUrl">Agent public DIDComm address</Label>
              <Field
                as={Input}
                id="publicUrl"
                name="publicUrl"
                placeholder="https://didcomm.example.bt"
                readOnly={isSubmitting}
              />
              <p className="text-muted-foreground text-xs">
                The address citizens&apos; wallets send messages to. Enter it
                exactly as the first <code>endpoint</code> in your agent&apos;s
                configuration.
              </p>
              {touched.publicUrl && errors.publicUrl && (
                <p className="text-destructive text-sm">{errors.publicUrl}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apiKey">API key</Label>
              <Field name="apiKey">
                {({ field }: FieldProps) => (
                  <div className="relative">
                    <Input
                      {...field}
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      autoComplete="off"
                      readOnly={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                      className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </Field>
              {touched.apiKey && errors.apiKey && (
                <p className="text-destructive text-sm">{errors.apiKey}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="setupConfirmed"
                  checked={values.setupConfirmed}
                  onCheckedChange={(checked) =>
                    setFieldValue('setupConfirmed', checked === true)
                  }
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="setupConfirmed"
                  className="leading-snug font-normal"
                >
                  I have set up the agent as described in Before you start, and
                  it runs the required release.
                </Label>
              </div>
              {touched.setupConfirmed && errors.setupConfirmed && (
                <p className="text-destructive text-sm">
                  {errors.setupConfirmed}
                </p>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="backupsConfirmed"
                  checked={values.backupsConfirmed}
                  onCheckedChange={(checked) =>
                    setFieldValue('backupsConfirmed', checked === true)
                  }
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="backupsConfirmed"
                  className="leading-snug font-normal"
                >
                  My new agent&apos;s wallet database is backed up. I understand
                  these backups are our recovery after the first 48 hours.
                </Label>
              </div>
              {touched.backupsConfirmed && errors.backupsConfirmed && (
                <p className="text-destructive text-sm">
                  {errors.backupsConfirmed}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Start move
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      <StepUpSignInDialog
        open={stepUpOpen}
        onOpenChange={(open) => {
          setStepUpOpen(open)
          if (!open && pending) {
            pending.helpers.setSubmitting(false)
            setPending(null)
          }
        }}
        onVerified={onStepUpVerified}
      />
    </Card>
  )
}
