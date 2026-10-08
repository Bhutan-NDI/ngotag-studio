'use client'

import * as yup from 'yup'

import {
  FIELD_BLOCK_CLASS,
  FIELD_CLASS,
  LABEL_CLASS,
} from '@/components/bhutanndi/ui/formStyles'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import React, { useEffect, useRef, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { AuthAlert } from '@/components/bhutanndi/ui/AuthAlert'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/bhutanndi/ui/GradientButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { isBhutanndiTheme } from '@/lib/active-theme'
import { setAgentConfigDetails } from '@/app/api/Agent'
import { useOrgWalletName } from './useOrgWalletName'

// Mirrors AgentConfigureDto (bhutanndi-platform apps/api-gateway/src/agent-service/dto/agent-configure.dto.ts)
const WALLET_NAME_REGEX = /^[a-zA-Z0-9]*$/
const HOST_PORT_REGEX =
  /^(http:\/\/|https:\/\/)?(?:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)):(?:\d{1,5})(\/[^\s]*)?$/
const DOMAIN_REGEX =
  /^(http:\/\/|https:\/\/)?(?:localhost|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(:\d{1,5})?(\/[^\s]*)?$/

interface DedicatedAgentFormProps {
  orgId: string
  onSuccess?: (data?: WalletResponse) => void
  disabled?: boolean
}

export interface WalletData {
  id: string
  orgId: string
  agentSpinUpStatus: number
  agentEndPoint: string
  tenantId: string | null
  walletName: string
}

export interface WalletResponse {
  statusCode: number
  message: string
  data: WalletData
}

interface DedicatedAgentFormValues {
  walletName: string
  agentEndpoint: string
  apiKey: string
}

const DedicatedAgentForm = ({
  orgId,
  onSuccess,
  disabled,
}: DedicatedAgentFormProps): React.JSX.Element => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const walletName = useOrgWalletName(orgId)
  const formikRef = useRef<FormikProps<DedicatedAgentFormValues>>(null)
  const walletNameEditedRef = useRef(false)

  useEffect(() => {
    if (!walletNameEditedRef.current) {
      formikRef.current?.setFieldValue('walletName', walletName)
    }
  }, [walletName])

  const validationSchema = yup.object({
    walletName: yup
      .string()
      .trim()
      .required('Wallet name is required')
      .min(2, 'Minimum length for wallet name must be 2 characters.')
      .max(25, 'Maximum length for wallet must be 25 characters.')
      .matches(
        WALLET_NAME_REGEX,
        'Wallet name must not contain spaces or special characters.',
      ),
    agentEndpoint: yup
      .string()
      .required('Agent endpoint is required')
      .test(
        'is-host-port-or-domain',
        'Invalid host:port or domain format',
        (value) =>
          Boolean(value) &&
          (HOST_PORT_REGEX.test(value) || DOMAIN_REGEX.test(value)),
      ),
    apiKey: yup.string().required('API key is required'),
  })

  const handleSubmit = async (values: {
    walletName: string
    agentEndpoint: string
    apiKey: string
  }): Promise<void> => {
    setError(null)
    setLoading(true)

    const payload = {
      walletName: values.walletName,
      agentEndpoint: values.agentEndpoint,
      apiKey: values.apiKey,
    }

    try {
      const res = await setAgentConfigDetails(payload, orgId)

      if (typeof res === 'string') {
        setError(res || 'Something went wrong while creating dedicated wallet')
        return
      }

      const { data } = res
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        onSuccess?.(data)
      } else {
        const errorMessage = Array.isArray(data?.message)
          ? data.message.join(' ')
          : data?.message
        setError(
          errorMessage ||
            'Something went wrong while creating dedicated wallet',
        )
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong while creating dedicated wallet')
    } finally {
      setLoading(false)
    }
  }

  const bhutanndi = isBhutanndiTheme()

  return (
    <div className="mt-6">
      <Formik
        innerRef={formikRef}
        initialValues={{
          walletName,
          agentEndpoint: '',
          apiKey: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => {
          if (bhutanndi) {
            return (
              <Form className="space-y-6">
                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Wallet Name</span>
                  <p className="text-bhutanndi-muted -mt-0.5 text-[13px] leading-[1.5]">
                    This name is auto-generated based on your organization name.
                    You can edit it if needed.
                  </p>
                  <Field name="walletName">
                    {({
                      field,
                    }: FieldProps<string, DedicatedAgentFormValues>) => (
                      <input
                        {...field}
                        id="walletName"
                        placeholder="Enter wallet name"
                        className={`${FIELD_CLASS} h-12`}
                        disabled={disabled}
                        onChange={(e) => {
                          walletNameEditedRef.current = true
                          field.onChange(e)
                        }}
                      />
                    )}
                  </Field>
                  {errors.walletName && touched.walletName ? (
                    <p
                      className="text-[12px]"
                      style={{ color: 'var(--bhutanndi-text-danger)' }}
                    >
                      {errors.walletName}
                    </p>
                  ) : null}
                </label>

                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Agent Endpoint</span>
                  <Field
                    name="agentEndpoint"
                    placeholder="https://agent.example.com"
                    className={`${FIELD_CLASS} h-12`}
                    disabled={disabled}
                  />
                  {errors.agentEndpoint && touched.agentEndpoint ? (
                    <p
                      className="text-[12px]"
                      style={{ color: 'var(--bhutanndi-text-danger)' }}
                    >
                      {errors.agentEndpoint}
                    </p>
                  ) : null}
                </label>

                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>API Key</span>
                  <Field
                    name="apiKey"
                    placeholder="Enter API key"
                    className={`${FIELD_CLASS} h-12`}
                    disabled={disabled}
                  />
                  {errors.apiKey && touched.apiKey ? (
                    <p
                      className="text-[12px]"
                      style={{ color: 'var(--bhutanndi-text-danger)' }}
                    >
                      {errors.apiKey}
                    </p>
                  ) : null}
                </label>

                {error ? (
                  <AuthAlert
                    variant="danger"
                    message={error}
                    onDismiss={() => setError(null)}
                  />
                ) : null}

                <div className="flex justify-end">
                  <GradientButton type="submit" disabled={loading || disabled}>
                    {loading ? <Loader /> : 'Create Dedicated Wallet'}
                  </GradientButton>
                </div>
              </Form>
            )
          }
          return (
            <Form className="space-y-6">
              <div>
                <Label htmlFor="walletName">Wallet Name</Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  This name is auto-generated based on your organization name.
                  You can edit it if needed.
                </p>
                <Field name="walletName">
                  {({
                    field,
                  }: FieldProps<string, DedicatedAgentFormValues>) => (
                    <Input
                      {...field}
                      id="walletName"
                      placeholder="Enter wallet name"
                      className="mt-2"
                      disabled={disabled}
                      onChange={(e) => {
                        walletNameEditedRef.current = true
                        field.onChange(e)
                      }}
                    />
                  )}
                </Field>
                {errors.walletName && touched.walletName && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.walletName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="agentEndpoint">Agent Endpoint</Label>
                <Field
                  as={Input}
                  id="agentEndpoint"
                  name="agentEndpoint"
                  placeholder="https://agent.example.com"
                  className="mt-2"
                  disabled={disabled}
                />
                {errors.agentEndpoint && touched.agentEndpoint && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.agentEndpoint}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Field
                  as={Input}
                  id="apiKey"
                  name="apiKey"
                  placeholder="Enter API key"
                  className="mt-2"
                  disabled={disabled}
                />
                {errors.apiKey && touched.apiKey && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.apiKey}
                  </p>
                )}
              </div>

              {error && (
                <AlertComponent
                  message={error}
                  type="failure"
                  onAlertClose={() => setError(null)}
                />
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={loading || disabled}>
                  {loading ? <Loader /> : 'Create Dedicated Wallet'}
                </Button>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default DedicatedAgentForm
