'use client'

import { MOBILE_VERIFIER_ROLES, useHasOrgRole } from '@/lib/useOrgRoleAccess'
import React, { JSX, useState } from 'react'
import { getWebhook, registerWebhook } from '@/app/api/mobileVerifierWebhook'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { useAppSelector } from '@/lib/hooks'

const MobileVerifierWebhookConfig = (): JSX.Element => {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const canManage = useHasOrgRole(MOBILE_VERIFIER_ROLES.VERIFIER)

  const [webhookId, setWebhookId] = useState('')
  const [webhookURL, setWebhookURL] = useState('')
  const [version, setVersion] = useState<'v1' | 'v2'>('v2')
  const [token, setToken] = useState('')
  const [url, setUrl] = useState('')
  const [grantType, setGrantType] = useState('client_credentials')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  const [looking, setLooking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const handleLookup = async (): Promise<void> => {
    if (!orgId) {
      setFailure('No organization selected')
      return
    }
    if (!webhookId.trim()) {
      setFailure('Enter a webhook ID to look up')
      return
    }
    setSuccess(null)
    setFailure(null)
    setLooking(true)

    try {
      const res = (await getWebhook(orgId, webhookId)) as AxiosResponse
      const found = res?.data?.data
      if (
        res?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS &&
        found
      ) {
        setWebhookURL(found.webhookUrl ?? '')
        setSuccess('Existing webhook loaded')
      } else {
        setFailure(
          'No webhook found for this ID — fill in the fields below to register one',
        )
      }
    } catch {
      setFailure('Failed to look up webhook')
    } finally {
      setLooking(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!orgId) {
      setFailure('No organization selected')
      return
    }
    setSuccess(null)
    setFailure(null)

    if (!webhookId.trim() || !webhookURL.trim()) {
      setFailure('Webhook ID and URL are required')
      return
    }
    if (
      version === 'v1' &&
      (!url.trim() || !clientId.trim() || !clientSecret.trim())
    ) {
      setFailure('URL, client ID and client secret are required for OAuth2 v1')
      return
    }
    if (version === 'v2' && !token.trim()) {
      setFailure('Token is required for OAuth2 v2')
      return
    }

    setSaving(true)

    try {
      const res = (await registerWebhook(
        {
          webhookId,
          webhookUrl: webhookURL,
          authentication: {
            type: 'OAuth2',
            version,
            data:
              version === 'v1'
                ? { url, grantType, clientId, clientSecret }
                : { token },
          },
        },
        orgId,
      )) as AxiosResponse

      if (
        res?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS ||
        res?.data?.statusCode === apiStatusCodes.API_STATUS_CREATED
      ) {
        setSuccess(res?.data?.message || 'Webhook saved successfully')
      } else {
        setFailure(res?.data?.message || 'Failed to save webhook')
      }
    } catch {
      setFailure('Failed to save webhook')
    } finally {
      setSaving(false)
    }
  }

  if (!orgId) {
    return (
      <PageContainer>
        <div className="text-muted-foreground">
          No organization selected — select or create an organization first.
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Mobile Verifier Webhook
        </h2>
        <p className="text-muted-foreground">
          Register or view the webhook mobile-verifier notifies for this
          organization
        </p>
      </div>

      {success && (
        <AlertComponent
          message={success}
          type="success"
          onAlertClose={() => setSuccess(null)}
        />
      )}
      {failure && (
        <AlertComponent
          message={failure}
          type="failure"
          onAlertClose={() => setFailure(null)}
        />
      )}

      <div className="max-w-xl space-y-4 rounded-md border p-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Webhook ID *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookId}
              onChange={(e) => setWebhookId(e.target.value)}
              placeholder="e.g. my-org-webhook"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={looking}
              className="rounded-md border px-4 py-2 text-sm whitespace-nowrap"
            >
              {looking ? 'Looking up…' : 'Look up'}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Webhook URL *</label>
          <input
            type="text"
            value={webhookURL}
            onChange={(e) => setWebhookURL(e.target.value)}
            placeholder="https://example.com/webhook"
            className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Authentication</label>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as 'v1' | 'v2')}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="v2">Bearer token (v2)</option>
            <option value="v1">OAuth2 client credentials (v1)</option>
          </select>
        </div>

        {version === 'v2' && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Token *</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
        )}

        {version === 'v1' && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">Token URL *</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Grant Type</label>
              <input
                type="text"
                value={grantType}
                onChange={(e) => setGrantType(e.target.value)}
                className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Client ID *</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Client Secret *</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
          </>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canManage}
            title={
              canManage
                ? undefined
                : 'You do not have permission to manage the webhook'
            }
            className="bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm disabled:opacity-50"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Save Webhook
          </button>
        </div>
      </div>
    </PageContainer>
  )
}

export default MobileVerifierWebhookConfig
