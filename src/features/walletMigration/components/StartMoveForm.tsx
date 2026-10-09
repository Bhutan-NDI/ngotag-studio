'use client'

import * as yup from 'yup'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DOMAIN_REGEX,
  HOST_PORT_REGEX,
} from '@/features/wallet/DedicatedAgentForm'
import { Download, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Field, FieldProps, Form, Formik, FormikHelpers } from 'formik'
import { IMigration, IStartMovePayload } from '../types'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepUpSignInDialog } from './StepUpSignInDialog'
import { getMigrationError } from '../errorMessages'
import { startMigration } from '@/app/api/walletMigration'

interface IStartMoveValues extends IStartMovePayload {
  setupConfirmed: boolean
  backupsConfirmed: boolean
}

const initialValues: IStartMoveValues = {
  adminUrl: '',
  publicUrl: '',
  apiKey: '',
  setupConfirmed: false,
  backupsConfirmed: false,
}

// Same host rules as the dedicated-agent form, but HTTPS only and no
// localhost: the platform reaches this agent over the internet.
const isHttpsAgentUrl = (value?: string): boolean =>
  Boolean(value) &&
  /^https:\/\//i.test(value as string) &&
  !/^https:\/\/localhost/i.test(value as string) &&
  (HOST_PORT_REGEX.test(value as string) || DOMAIN_REGEX.test(value as string))

const validationSchema = yup.object({
  adminUrl: yup
    .string()
    .trim()
    .required('Agent admin address is required')
    .test(
      'https',
      'Enter an HTTPS address, e.g. https://agent.example.bt',
      isHttpsAgentUrl,
    ),
  publicUrl: yup
    .string()
    .trim()
    .required('Agent public DIDComm address is required')
    .test(
      'https',
      'Enter an HTTPS address, e.g. https://didcomm.example.bt',
      isHttpsAgentUrl,
    )
    .notOneOf(
      [yup.ref('adminUrl')],
      'Must be different from the admin address',
    ),
  apiKey: yup.string().required('API key is required'),
  setupConfirmed: yup
    .boolean()
    .oneOf([true], 'Please confirm the agent is set up'),
  backupsConfirmed: yup.boolean().oneOf([true], 'Please confirm your backups'),
})

// Placeholder until the real checklist (network flows N1–N6 and hosting,
// SAD §5.3) is published.
const downloadChecklist = (): void => {
  const content = [
    '# Dedicated agent setup checklist',
    '',
    'Complete every item before starting the move. Full details: SAD-NGOTAG-WM-01 §5.3.',
    '',
    '## Network',
    '- [ ] N1 Admin address reachable over HTTPS from the platform IP addresses only',
    '- [ ] N2 Public DIDComm address reachable over HTTPS from the internet',
    '- [ ] N3 Valid TLS certificate on both addresses',
    '- [ ] N4 Outbound HTTPS to the platform allowed',
    '- [ ] N5 Webhook delivery to the platform allowed',
    '- [ ] N6 Wallet file download from the platform allowed',
    '',
    '## Hosting',
    '- [ ] Agent runs the required version',
    '- [ ] Wallet database is empty (freshly installed agent)',
    '- [ ] Wallet database backups are scheduled and tested',
  ].join('\n')
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/markdown' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'dedicated-agent-setup-checklist.md'
  link.click()
  URL.revokeObjectURL(url)
}

interface StartMoveFormProps {
  orgId: string
  onStarted: (migration: IMigration) => void
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

  const onStepUpVerified = async (token: string): Promise<void> => {
    setStepUpOpen(false)
    if (!pending) {
      return
    }
    const { values, helpers } = pending
    helpers.setSubmitting(true)
    const result = await startMigration(
      orgId,
      {
        adminUrl: values.adminUrl.trim(),
        publicUrl: values.publicUrl.trim(),
        apiKey: values.apiKey,
      },
      token,
    )
    // Never keep the API key around after submitting (P-05).
    helpers.setFieldValue('apiKey', '')
    helpers.setSubmitting(false)
    setPending(null)
    if (!result.ok) {
      const content = getMigrationError(result.code)
      setError(
        result.code ? `${content.message} ${content.recovery}` : result.message,
      )
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

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={downloadChecklist}
      >
        <Download className="mr-2 h-4 w-4" />
        Download setup checklist
      </Button>

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
                The address our platform uses to manage your agent. Allow only
                our IP addresses.
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
                The address citizens&apos; wallets send messages to.
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
                  I have set up the agent using the checklist, and it runs the
                  required version.
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
