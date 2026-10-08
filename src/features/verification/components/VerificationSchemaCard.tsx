'use client'

import { Check } from 'lucide-react'
import DateTooltip from '@/components/DateTooltip'
import { IAttributes } from '@/features/schemas/type/schemas-interface'
import { JSX } from 'react'
import { dateConversion } from '@/utils/DateConversion'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerificationSchemaCardProps {
  schemaName: string
  version: string
  /** Used for display (truncated) and to drive the isSelected check in the parent */
  schemaId: string
  issuerName: string
  attributes: IAttributes[]
  created: string
  isSelected: boolean
  /** True when the org uses a W3C / polygon / key / web DID method */
  isW3c: boolean
  onSelect: () => void
  /** Called when the Schema ID field is clicked — usually opens a side panel */
  onSchemaIdClick?: (e: React.MouseEvent) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const VerificationSchemaCard = ({
  schemaName,
  version,
  schemaId,
  issuerName,
  attributes,
  created,
  isSelected,
  isW3c,
  onSelect,
  onSchemaIdClick,
}: VerificationSchemaCardProps): JSX.Element => (
  <div
    role="button"
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect()
      }
    }}
    className={[
      'group relative flex flex-col rounded-[14px]',
      'border-[0.5px] p-[20px]',
      'bg-card text-card-foreground cursor-pointer',
      'transition-[transform,border-color,box-shadow] duration-200',
      'focus:outline-none focus-visible:ring-2',
      'focus-visible:ring-primary/60 focus-visible:ring-offset-2',
      isSelected
        ? [
            'border-primary/70',
            'shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent),0_8px_32px_color-mix(in_srgb,var(--primary)_18%,transparent)]',
          ].join(' ')
        : [
            'border-[var(--border)]',
            'hover:border-primary/40 hover:-translate-y-[3px]',
            'hover:shadow-[0_12px_30px_color-mix(in_srgb,var(--primary)_12%,transparent)]',
          ].join(' '),
    ].join(' ')}
  >
    {/* Hover radial wash — hidden when the card is selected */}
    {!isSelected && (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse 55% 65% at 100% 0%, color-mix(in srgb, var(--primary) 7%, transparent) 0%, transparent 70%)',
        }}
      />
    )}

    {/* ── Top row: type badge + date ── */}
    <div className="relative flex items-center justify-between gap-2">
      <span
        className={
          isW3c
            ? 'border-primary/20 bg-accent text-accent-foreground rounded-md border px-[7px] py-[2px] text-[10px] font-[700] tracking-[0.05em] uppercase'
            : 'bg-secondary text-secondary-foreground rounded-md border px-[7px] py-[2px] text-[10px] font-[700] tracking-[0.05em] uppercase'
        }
      >
        {isW3c ? 'W3C' : 'INDY'}
      </span>
      <DateTooltip date={created}>
        <span className="text-muted-foreground text-[11px]">
          {dateConversion(created)}
        </span>
      </DateTooltip>
    </div>

    {/* ── Schema name + version ── */}
    <h3 className="text-foreground relative mt-3 font-serif text-[15px] leading-tight font-[700] tracking-[-0.01em]">
      {schemaName}
    </h3>
    <p className="text-muted-foreground relative mt-0.5 text-[11.5px]">
      Version: {version}
    </p>

    {/* ── Schema ID — clicking opens the side panel, NOT the card selection ── */}
    <button
      type="button"
      className="url-link relative mt-3 flex w-full items-center gap-1.5 text-left"
      onClick={(e) => {
        e.stopPropagation()
        onSchemaIdClick?.(e)
      }}
    >
      <strong className="text-foreground shrink-0 text-[12px] font-[600]">
        ID:
      </strong>
      <span className="text-muted-foreground min-w-0 truncate font-mono text-[11px]">
        {schemaId}
      </span>
    </button>

    {/* ── Issuer ── */}
    <p className="text-muted-foreground relative mt-1 text-[12px]">
      <strong className="text-foreground font-[600]">Issuer:</strong>{' '}
      {issuerName}
    </p>

    {/* ── Attributes ── */}
    <div className="relative mt-3 flex flex-wrap gap-1.5">
      {attributes.slice(0, 5).map((attr) => (
        <span
          key={attr.attributeName}
          className="bg-secondary text-secondary-foreground rounded px-2 py-[2px] text-[11px] font-medium"
        >
          {attr.attributeName}
        </span>
      ))}
      {attributes.length > 5 && (
        <span className="text-muted-foreground ml-0.5 text-[11px]">
          +{attributes.length - 5} more
        </span>
      )}
    </div>

    {/* ── Footer ── */}
    <div className="border-primary/8 relative mt-[16px] flex items-center justify-between border-t pt-[12px]">
      <span
        className={`text-[11px] font-[600] transition-colors duration-200 ${
          isSelected
            ? 'text-primary'
            : 'text-muted-foreground/50 group-hover:text-primary'
        }`}
      >
        {isSelected ? 'Selected' : 'Click to select'}
      </span>
      {isSelected ? (
        <span className="bg-primary flex h-[22px] w-[22px] items-center justify-center rounded-full">
          <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
        </span>
      ) : (
        <span className="text-muted-foreground/50 group-hover:text-primary text-[12.5px] font-[600] transition-colors duration-200">
          Select →
        </span>
      )}
    </div>
  </div>
)

export default VerificationSchemaCard
