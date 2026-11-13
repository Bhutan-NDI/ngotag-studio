'use client'

import { Check, ChevronsUpDown, X } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  id?: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

/**
 * Pick any number of options from a searchable list. Each option toggles on
 * and off; the chosen ones show as chips below, each with its own remove
 * button. Fully usable by keyboard: Enter or Space opens the list, the arrow
 * keys move, Enter toggles, typing filters and Escape closes.
 */
export function MultiSelect({
  id,
  options,
  selected,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'Nothing found.',
  className,
}: Readonly<MultiSelectProps>): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const chosen = options.filter((option) => selected.includes(option.value))

  const toggle = (value: string): void => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    )
  }

  let summary = placeholder
  if (chosen.length === 1) {
    summary = chosen[0].label
  } else if (chosen.length > 1) {
    summary = `${chosen.length} selected`
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Modal so the list takes its own scroll lock: inside a modal Dialog the
          portaled list would otherwise ignore the mouse wheel. */}
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span
              className={cn(
                'truncate',
                !chosen.length && 'text-muted-foreground',
              )}
            >
              {summary}
            </span>
            <ChevronsUpDown
              className="h-4 w-4 shrink-0 opacity-50"
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      keywords={[option.label]}
                      onSelect={() => toggle(option.value)}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-sm border',
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'opacity-60',
                        )}
                        aria-hidden
                      >
                        {isSelected && (
                          <Check className="text-primary-foreground h-3 w-3" />
                        )}
                      </span>
                      {option.label}
                      {/* cmdk owns aria-selected (it marks the highlighted
                          item), so the chosen state goes in the name. */}
                      {isSelected && (
                        <span className="sr-only">, selected</span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {chosen.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected">
          {chosen.map((option) => (
            <li
              key={option.value}
              className="bg-muted flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-xs"
            >
              {option.label}
              <button
                type="button"
                onClick={() => toggle(option.value)}
                aria-label={`Remove ${option.label}`}
                className="hover:bg-background focus-visible:ring-ring rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
