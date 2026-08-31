'use client'

import { FIELD_CLASS } from './formStyles'
import { Icon } from './icons'

import type React from 'react'

interface SearchFieldProps {
  placeholder?: string
  label?: string
  className?: string
  /** Controlled when both are passed; uncontrolled decoration otherwise. */
  value?: string
  onChange?: (value: string) => void
}

/**
 * The design system's search field: a 16px icon at left:16px and the input
 * padded pl-11 to clear it.
 *
 * onChange hands back the string rather than the event — every caller wants
 * the value, and none of them want to know it came from an input.
 */
export function SearchField({
  placeholder = 'Search',
  label = 'Search',
  className = '',
  value,
  onChange,
}: SearchFieldProps): React.JSX.Element {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="text-ngotag-faint pointer-events-none absolute left-4">
        <Icon name="search" size={16} strokeWidth={1.8} />
      </span>
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        className={`${FIELD_CLASS} h-11 pl-11`}
        {...(onChange
          ? {
              value: value ?? '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>): void =>
                onChange(e.target.value),
            }
          : {})}
      />
    </div>
  )
}
