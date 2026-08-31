import { IAttributes, ISchemaData } from '../type/schemas-interface'
import CustomCheckbox from '@/components/CustomCheckbox'
import DateTooltip from '@/components/DateTooltip'
import { HairlineButton } from '@/components/ngotag/ui/HairlineButton'
import { ISchemaData as ICheckboxSchemaData } from '@/common/interface'
import { Icon } from '@/components/ngotag/ui/icons'
import Loader from '@/components/Loader'
import React from 'react'
import { dateConversion } from '@/utils/DateConversion'

export interface NgotagSchemaCardProps {
  className?: string
  schemaName: string
  version: string
  schemaId: string
  created: string
  issuerName?: string
  /** Resolved Polygon/Ethereum/other ledger label from the issuer DID — see
   * SchemaCard.tsx's `ledgerDisplay`. Undefined when it can't be resolved. */
  ledgerDisplay?: string
  /** Same `props.noLedger` gate the original card uses to hide the row
   * entirely for DID methods that don't carry a ledger. */
  noLedger?: boolean
  w3cSchema?: boolean
  displayedAttributes: IAttributes[]
  extraCount: number
  hasNestedAttributes: boolean
  isInteractive: boolean
  isSelectable: boolean
  isSelected: boolean
  isNavigable: boolean
  showIssueButton?: boolean
  isLoading: boolean
  onCardClick: () => void
  onIssueClick: (e: React.MouseEvent) => void
  onTitleClick?: (e: React.MouseEvent) => void
  showCheckbox?: boolean
  onCheckboxChange: (checked: boolean, schemaData?: ISchemaData) => void
  checkboxSchemaData: ICheckboxSchemaData
}

/**
 * Presentational ngotag shell for a schema card — the dark "obsidian" card
 * from the reference: type badge + relative date, name, version, a clickable
 * "ID:" row (opens the real Schema Details side panel via `onTitleClick`,
 * same as the original card), Issuer/Ledger rows, bordered mono attribute
 * pills, a divider, then a footer whose content depends on which real mode
 * the caller is in. All state/handlers are computed by SchemaCard.tsx and
 * passed straight through: no business logic (selection, navigation, the
 * Issue dispatch, the nested-attribute gate, ledger resolution) lives here.
 *
 * Footer priority mirrors SchemaCard's own priority (selectable > navigable
 * > issue > plain): only one of those four states is ever true for a given
 * caller. The plain case (e.g. CredDefSelection's non-interactive context
 * card) renders nothing here — same as the original, which only ever put an
 * interactive-state indicator in the footer, never the ID or date.
 */
export function NgotagSchemaCard({
  className = '',
  schemaName,
  version,
  schemaId,
  created,
  issuerName,
  ledgerDisplay,
  noLedger,
  w3cSchema,
  displayedAttributes,
  extraCount,
  hasNestedAttributes,
  isInteractive,
  isSelectable,
  isSelected,
  isNavigable,
  showIssueButton,
  isLoading,
  onCardClick,
  onIssueClick,
  onTitleClick,
  showCheckbox,
  onCheckboxChange,
  checkboxSchemaData,
}: Readonly<NgotagSchemaCardProps>): React.JSX.Element {
  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onCardClick}
      onKeyDown={
        isInteractive
          ? (e: React.KeyboardEvent<HTMLDivElement>): void => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onCardClick()
              }
            }
          : undefined
      }
      data-ngotag-panel="1"
      className={[
        'border-ngotag-grid group relative flex flex-col overflow-hidden rounded-[14px] border p-5',
        'transition-[transform,border-color,box-shadow] duration-200',
        isInteractive
          ? 'focus-visible:ring-ngotag-accent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
          : 'cursor-default',
        isSelected && isSelectable
          ? 'border-ngotag-strong shadow-[var(--ngotag-glow-sm)]'
          : isInteractive
            ? 'hover:-translate-y-[3px] hover:shadow-[var(--ngotag-glow-sm)]'
            : '',
        hasNestedAttributes ? 'pointer-events-none opacity-80' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Nested-attribute overlay — schema is API-only, not usable from the UI */}
      {hasNestedAttributes && (
        <div className="bg-ngotag-canvas/80 absolute inset-0 z-10 flex items-center justify-center rounded-[14px]">
          <div className="border-ngotag-grid text-ngotag-muted relative rounded-md border bg-[var(--ngotag-surface-raised)] p-4 text-center text-sm shadow-lg">
            This schema can only be used through the API as it contains nested
            objects.
          </div>
        </div>
      )}

      {/* ── Top row: type badge + date ── */}
      <div className="relative z-[4] flex items-center justify-between gap-2">
        <span
          className={
            w3cSchema
              ? 'border-ngotag-grid text-ngotag-accent inline-flex flex-none items-center rounded-full border px-2.5 py-[3px] text-[10px] font-[700] tracking-[0.05em] uppercase'
              : 'border-ngotag-grid text-ngotag-muted inline-flex flex-none items-center rounded-full border px-2.5 py-[3px] text-[10px] font-[700] tracking-[0.05em] uppercase'
          }
          style={
            w3cSchema ? { background: 'var(--ngotag-mint-08)' } : undefined
          }
        >
          {w3cSchema ? 'W3C' : 'INDY'}
        </span>
        <DateTooltip date={created}>
          <span className="text-ngotag-faint text-[11px]">
            {dateConversion(created)}
          </span>
        </DateTooltip>
      </div>

      {/* ── Schema name + version ── */}
      <h3
        className="font-display text-ngotag-strong relative z-[4] mt-3 truncate text-[15.5px] leading-tight font-semibold tracking-[-0.01em]"
        title={schemaName}
      >
        {schemaName}
      </h3>
      <p className="text-ngotag-faint relative z-[4] mt-0.5 text-[11.5px]">
        Version: v{version}
      </p>

      {/* ── Schema ID — clicking opens the real Schema Details side panel,
          same onTitleClick the original card wires — not a card-click action. ── */}
      <button
        type="button"
        className="ndi-plainlink relative z-[4] mt-3 flex w-full items-center gap-1.5 text-left"
        onClick={(e) => {
          e.stopPropagation()
          onTitleClick?.(e)
        }}
      >
        <strong className="text-ngotag-strong shrink-0 text-[12px] font-[600]">
          ID:
        </strong>
        <span className="text-ngotag-muted font-ngotag-mono min-w-0 truncate text-[11px]">
          {schemaId}
        </span>
      </button>

      {/* ── Issuer ── */}
      <p className="text-ngotag-muted relative z-[4] mt-1 text-[12px]">
        <strong className="text-ngotag-strong font-[600]">Issuer:</strong>{' '}
        {issuerName || ''}
      </p>

      {/* ── Ledger (only for DID methods that carry one) ── */}
      {!noLedger && ledgerDisplay && (
        <p className="text-ngotag-muted relative z-[4] mt-0.5 text-[12px]">
          <strong className="text-ngotag-strong font-[600]">Ledger:</strong>{' '}
          {ledgerDisplay}
        </p>
      )}

      {/* ── Attribute pills ── */}
      <div className="relative z-[4] mt-3.5 flex flex-wrap gap-1.5">
        {displayedAttributes.map((attr: IAttributes) => (
          <span
            key={attr.attributeName}
            className="border-ngotag-grid text-ngotag-muted font-ngotag-mono rounded-md border px-2 py-[3px] text-[11px]"
            style={{ background: 'rgb(var(--ngotag-tint) / 0.03)' }}
          >
            {attr.attributeName}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="text-ngotag-faint font-ngotag-mono ml-0.5 self-center text-[11px]">
            +{extraCount} more
          </span>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="relative z-[4] mt-4 h-px bg-[var(--ngotag-border-subtle)]" />

      {/* ── Footer — exactly one of these four states applies ── */}
      <div className="relative z-[4] mt-3 flex items-center justify-between gap-2">
        {isSelectable ? (
          <>
            <span
              className={`text-[11px] font-[600] transition-colors duration-200 ${
                isSelected ? 'text-ngotag-accent' : 'text-ngotag-faint'
              }`}
            >
              {isSelected ? 'Selected' : 'Click to select'}
            </span>
            {isSelected ? (
              <span
                className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full"
                style={{ background: 'var(--ngotag-accent)' }}
              >
                <Icon
                  name="check"
                  size={12}
                  strokeWidth={2.6}
                  style={{ color: 'var(--ngotag-text-on-mint)' }}
                />
              </span>
            ) : (
              <span className="text-ngotag-faint text-[12.5px] font-[600]">
                Select →
              </span>
            )}
          </>
        ) : isNavigable ? (
          <>
            <span className="text-ngotag-faint text-[11px] font-[600] transition-colors duration-200 group-hover:text-[color:var(--ngotag-accent)]">
              View details
            </span>
            <Icon
              name="chevronRight"
              size={16}
              strokeWidth={2}
              className="text-ngotag-faint flex-none transition-colors duration-200 group-hover:text-[color:var(--ngotag-accent)]"
            />
          </>
        ) : showIssueButton ? (
          <>
            <span />
            <HairlineButton
              onClick={onIssueClick}
              disabled={isLoading}
              className="!h-7 !gap-1.5 !rounded-md !px-2.5 !text-[11px]"
            >
              {isLoading ? (
                <Loader size={14} isExpand={false} />
              ) : (
                <>
                  <Icon name="shieldCheck" size={13} strokeWidth={1.9} />
                  Issue
                </>
              )}
            </HairlineButton>
          </>
        ) : null}
      </div>

      {/* Legacy checkbox — kept for non-verification selection contexts where
          showCheckbox=true is passed directly to SchemaCard. */}
      {showCheckbox && !hasNestedAttributes && (
        <CustomCheckbox
          isSelectedSchema={Boolean(isSelected)}
          onChange={onCheckboxChange}
          showCheckbox={showCheckbox}
          schemaData={checkboxSchemaData}
        />
      )}
    </div>
  )
}

export default NgotagSchemaCard
