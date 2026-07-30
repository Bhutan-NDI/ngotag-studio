'use client'

import * as yup from 'yup'

import { Field, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { setAgentConfigDetails } from '@/app/api/Agent'

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

const DedicatedAgentForm = ({
  orgId,
  onSuccess,
  disabled,
}: DedicatedAgentFormProps): React.JSX.Element => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orgName, setOrgName] = useState<string>('')

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    try {
      const response = await getOrganizationById(orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const name = data?.data?.name || ''
        setOrgName(name)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const generateWalletName = (orgName: string): string => {
    if (!orgName) {
      return 'Wallet'
    }

    const words = orgName.split(/\s+/).filter(Boolean)

    const first = words[0] || ''
    const second = words[1]?.substring(0, 5) || ''

    const name = `${first}${second}Wallet`

    return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25)
  }

  useEffect(() => {
    fetchOrganizationDetails()
  }, [orgId])

  const validationSchema = yup.object({
    walletName: yup.string().required('Wallet name is required'),
    agentEndpoint: yup.string().required('Agent endpoint is required'),
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
      const res = (await setAgentConfigDetails(payload, orgId)) as AxiosResponse

      const { data } = res
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        onSuccess?.(data)
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong while creating dedicated wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <Formik
        enableReinitialize
        initialValues={{
          walletName: generateWalletName(orgName),
          agentEndpoint: '',
          apiKey: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <Label htmlFor="walletName">Wallet Name</Label>
              <p className="text-muted-foreground mt-1 text-sm">
                This name is auto-generated based on your organization name. You
                can edit it if needed.
              </p>
              <Field
                as={Input}
                id="walletName"
                name="walletName"
                placeholder="Enter wallet name"
                className="mt-2"
                disabled={disabled}
              />
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
                <p className="text-destructive mt-1 text-sm">{errors.apiKey}</p>
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
        )}
      </Formik>
    </div>
  )
}

export default DedicatedAgentForm
