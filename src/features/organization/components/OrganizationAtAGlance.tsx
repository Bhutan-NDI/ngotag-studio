import { IssueCredential, IssueCredentialUserText } from '@/common/enums'
import { IssuedCredential } from '../connectionIssuance/type/Issuance'

import { Organisation as OrgListItem } from '@/features/dashboard/type/organization'
import React from 'react'
import { StatCard } from '@/components/ngotag/ui/StatCard'

/** A schema's real name + version, as returned by getAllSchemasByOrgId. */
export interface SchemaPreviewItem {
  name: string
  version: string
  schemaLedgerId: string
}

/** One row inside a StatCard's preview list: a name, and a secondary label. */
function PreviewRow({
  primary,
  secondary,
}: {
  primary: string
  secondary: string
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ngotag-body min-w-0 truncate text-[13.5px] font-medium">
        {primary}
      </span>
      <span className="font-ngotag-mono text-ngotag-faint flex-none text-[12px]">
        {secondary}
      </span>
    </div>
  )
}

/**
 * Maps an issued credential's real exchange state to the same user-facing
 * word the Credentials list page shows (StatusCellForCredential in
 * CredentialTableCells.tsx) — kept in sync with that switch rather than
 * reusing its JSX, since this card renders plain text, not a badge.
 */
function credentialStateLabel(state: string): string {
  switch (state) {
    case IssueCredential.offerSent:
      return IssueCredentialUserText.offerSent
    case IssueCredential.done:
      return IssueCredentialUserText.done
    case IssueCredential.abandoned:
      return IssueCredentialUserText.abandoned
    case IssueCredential.requestReceived:
      return IssueCredentialUserText.received
    case IssueCredential.proposalReceived:
      return IssueCredentialUserText.proposalReceived
    default:
      return IssueCredentialUserText.credIssued
  }
}

interface OrganizationAtAGlanceProps {
  orgList: OrgListItem[]
  schemasCount: number
  schemaPreview: SchemaPreviewItem[]
  credentialsCount: number
  issuedCredPreview: IssuedCredential[]
}

/**
 * The "at a glance" cards on the ngotag Overview tab: Organizations, Schemas
 * and Credentials issued — each a title, an info hint, a real count badge,
 * and a preview of the first few real rows (StatCard, from the design
 * system, handles the empty state when a card's count is 0). Every count and
 * row here comes from a real API response the caller (OrganizationDashboard)
 * fetched — nothing in this component is invented placeholder data.
 */
export function OrganizationAtAGlance({
  orgList,
  schemasCount,
  schemaPreview,
  credentialsCount,
  issuedCredPreview,
}: OrganizationAtAGlanceProps): React.JSX.Element {
  return (
    <div className="mb-10 grid grid-cols-1 gap-5 min-[640px]:grid-cols-3">
      <StatCard
        title="Organizations"
        count={orgList.length}
        hint="Organizations you belong to, and your role in each."
        emptyIcon="building"
        emptyMessage="You don't belong to any organizations yet."
      >
        {orgList.slice(0, 3).map((org) => (
          <PreviewRow
            key={org.id}
            primary={org.name}
            secondary={org.userOrgRoles?.[0]?.orgRole?.name ?? '—'}
          />
        ))}
      </StatCard>

      <StatCard
        title="Schemas"
        count={schemasCount}
        hint="Schemas created by your organization."
        emptyIcon="layers"
        emptyMessage="No schemas created yet."
      >
        {schemaPreview.slice(0, 3).map((schema) => (
          <PreviewRow
            key={schema.schemaLedgerId}
            primary={schema.name}
            secondary={`v${schema.version}`}
          />
        ))}
      </StatCard>

      <StatCard
        title="Credentials issued"
        count={credentialsCount}
        hint="Credentials issued to your connections."
        emptyIcon="credentials"
        emptyMessage="No credentials issued yet."
      >
        {issuedCredPreview.slice(0, 3).map((cred) => (
          <PreviewRow
            key={cred.credentialExchangeId}
            primary={cred.connections?.theirLabel ?? 'Not Available'}
            secondary={credentialStateLabel(cred.state)}
          />
        ))}
      </StatCard>
    </div>
  )
}
