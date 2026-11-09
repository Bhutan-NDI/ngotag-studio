'use client'

import {
  IWebhookAuthenticationV1,
  IWebhookPayload,
  getWebhook,
  registerWebhook,
} from '@/app/api/mobileVerifierWebhook'
import { MOBILE_VERIFIER_ROLES, useHasOrgRole } from '@/lib/useOrgRoleAccess'
import React, { JSX, useEffect, useState } from 'react'
import {
  getResultMessage,
  getResultStatusCode,
  isMobileVerifierError,
  isNotFoundError,
} from '@/lib/mobileVerifierResponse'

import { AlertComponent } from '@/components/AlertComponent'
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

  // Fills the form from a stored webhook. The API masks secrets, so the token and client
  // secret are left empty and have to be entered again to save.
  const applyWebhook = (found: IWebhookPayload): void => {
    setWebhookId(found.webhookId ?? '')
    setWebhookURL(found.webhookUrl ?? '')
    const authVersion = found.authentication?.version === 'v1' ? 'v1' : 'v2'
    setVersion(authVersion)
    setToken('')
    setClientSecret('')
    if (authVersion === 'v1') {
      const data = found.authentication.data as IWebhookAuthenticationV1
      setUrl(data?.url ?? '')
      setGrantType(data?.grantType || 'client_credentials')
      setClientId(data?.clientId ?? '')
    } else {
      setUrl('')
      setGrantType('client_credentials')
      setClientId('')
    }
  }

  // Show the webhook already in use for the selected org, and never carry one org's
  // form over to another.
  useEffect(() => {
    let cancelled = false
    setWebhookId('')
    setWebhookURL('')
    setVersion('v2')
    setToken('')
    setUrl('')
    setGrantType('client_credentials')
    setClientId('')
    setClientSecret('')
    setSuccess(null)
    setFailure(null)

    if (!orgId) {
      return
    }

    const loadCurrent = async (): Promise<void> => {
      const res = await getWebhook(orgId)
      if (cancelled) {
        return
      }
      if (isMobileVerifierError(res)) {
        if (!isNotFoundError(res)) {
          setFailure(res.message)
        }
        return
      }
      if (
        getResultStatusCode(res) === apiStatusCodes.API_STATUS_SUCCESS &&
        res.data?.data
      ) {
        applyWebhook(res.data.data)
      }
    }
    loadCurrent()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

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
      const res = await getWebhook(orgId, webhookId)
      if (isMobileVerifierError(res)) {
        // only a real "not found" means there is nothing registered under this ID; any other
        // failure (401, 500, network) must not suggest registering over a working webhook
        setFailure(
          isNotFoundError(res)
            ? 'No webhook found for this ID — fill in the fields below to register one'
            : res.message,
        )
        return
      }
      if (
        getResultStatusCode(res) === apiStatusCodes.API_STATUS_SUCCESS &&
        res.data?.data
      ) {
        applyWebhook(res.data.data)
        setSuccess(
          'Existing webhook loaded — enter the token or client secret again to save changes',
        )
      } else {
        setFailure(getResultMessage(res, 'Failed to look up webhook'))
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
      const res = await registerWebhook(
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
      )
      const statusCode = getResultStatusCode(res)

      if (
        statusCode === apiStatusCodes.API_STATUS_SUCCESS ||
        statusCode === apiStatusCodes.API_STATUS_CREATED
      ) {
        setSuccess(getResultMessage(res, 'Webhook saved successfully'))
      } else {
        setFailure(getResultMessage(res, 'Failed to save webhook'))
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
              placeholder="Enter the token (stored tokens are never shown)"
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
                placeholder="Enter the secret (stored secrets are never shown)"
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
