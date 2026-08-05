'use client'

import { useEffect, useState } from 'react'

import type { AxiosResponse } from 'axios'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'

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

// Auto-generates a wallet name/label from the org's name (e.g. "Acme Corp" -> "AcmeCorpWallet"),
// shared by SharedAgentForm and DedicatedAgentForm so both stay in sync.
export const useOrgWalletName = (orgId: string): string => {
  const [orgName, setOrgName] = useState<string>('')

  useEffect(() => {
    if (!orgId) {
      return
    }

    let isMounted = true

    const fetchOrganizationDetails = async (): Promise<void> => {
      try {
        const response = await getOrganizationById(orgId)
        const { data } = response as AxiosResponse

        if (
          isMounted &&
          data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
        ) {
          setOrgName(data?.data?.name || '')
        }
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
    }

    fetchOrganizationDetails()

    return () => {
      isMounted = false
    }
  }, [orgId])

  return generateWalletName(orgName)
}
