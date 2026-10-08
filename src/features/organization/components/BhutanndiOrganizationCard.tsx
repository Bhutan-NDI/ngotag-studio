import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { AvatarBadge } from '@/components/bhutanndi/ui/AvatarBadge'
import { Icon } from '@/components/bhutanndi/ui/icons'
import { Organization } from '@/features/dashboard/type/organization'
import { Panel } from '@/components/bhutanndi/ui/Panel'
import React from 'react'
import { Roles } from '@/common/enums'

/**
 * One organization card in the bhutanndi Organizations grid. Settings (Edit /
 * Delete) is reachable from every card via its own org.id — not gated to the
 * currently-active org — since a user must be able to edit/delete an org
 * without first switching into it. "Switch to this" stays a separate action
 * (the status pill) for non-current cards.
 *
 * Settings is further gated to owner/admin roles on *that specific org*
 * (org.userOrgRoles, not the globally-active org's role) — same real-data
 * source and Roles.OWNER/Roles.ADMIN convention already used for this exact
 * check elsewhere (e.g. SchemaList.tsx's `isAdmin`,
 * DisplayUserProfile.tsx's `role.orgRole.name === 'owner'`). A plain member
 * sees only "Members", not an edit/delete menu for an org they don't manage.
 *
 * The reference's card footer also shows "{N} members · {date}" — neither a
 * member count nor a created date is present on the list-endpoint response
 * (`Organization`, from getOrganizations()); both only exist on per-org calls
 * (getOrgDashboard/getOrganizationById) that this multi-org list intentionally
 * doesn't fan out to for every row. That line is omitted rather than invented.
 */
export function BhutanndiOrgCard({
  org,
  isCurrent,
  isSwitching,
  onSwitch,
  onMembers,
  onEdit,
  onDelete,
}: {
  org: Organization
  isCurrent: boolean
  isSwitching: boolean
  onSwitch: () => void
  onMembers: () => void
  onEdit: () => void
  onDelete: () => void
}): React.JSX.Element {
  const roleLabel =
    org.userOrgRoles.length > 0
      ? org.userOrgRoles
          .map((role) => role.orgRole.name)
          .join(', ')
          .toUpperCase()
      : 'NO ROLE'

  const canManageOrg = org.userOrgRoles.some(
    (role) =>
      role.orgRole.name === Roles.OWNER || role.orgRole.name === Roles.ADMIN,
  )

  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <AvatarBadge name={org.name} src={org.logoUrl} size={44} />
            <div className="min-w-0">
              <h3
                className="font-display text-bhutanndi-strong truncate text-[15.5px] font-semibold"
                title={org.name}
              >
                {org.name}
              </h3>
              <p className="font-bhutanndi-mono text-bhutanndi-faint mt-0.5 truncate text-[10.5px] font-medium tracking-[0.08em]">
                {roleLabel}
              </p>
            </div>
          </div>

          {isCurrent ? (
            <span
              className="border-bhutanndi-grid text-bhutanndi-accent inline-flex flex-none items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap"
              style={{ background: 'var(--bhutanndi-mint-08)' }}
            >
              <Icon name="check" size={12} strokeWidth={2.4} />
              Current
            </span>
          ) : (
            <button
              type="button"
              onClick={onSwitch}
              disabled={isSwitching}
              className="ndi-plainlink text-bhutanndi-accent flex-none text-[12.5px] font-medium whitespace-nowrap disabled:opacity-60"
            >
              {isSwitching ? 'Switching…' : 'Switch to this'}
            </button>
          )}
        </div>

        {org.description ? (
          <p
            className="text-bhutanndi-muted truncate text-[13px]"
            title={org.description}
          >
            {org.description}
          </p>
        ) : null}

        <div className="h-px bg-[var(--bhutanndi-border-subtle)]" />

        <div className="flex items-center justify-end gap-3 text-[12.5px]">
          {canManageOrg ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ndi-plainlink text-bhutanndi-muted font-medium"
                  >
                    Settings
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={onEdit}>
                    <Icon name="edit" size={14} strokeWidth={1.8} />
                    Edit organization
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                    <Icon name="trash" size={14} strokeWidth={1.8} />
                    Delete organization
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-bhutanndi-faint">·</span>
            </>
          ) : null}

          <button
            type="button"
            onClick={onMembers}
            className="ndi-plainlink text-bhutanndi-muted font-medium"
          >
            Members
          </button>
        </div>
      </div>
    </Panel>
  )
}
