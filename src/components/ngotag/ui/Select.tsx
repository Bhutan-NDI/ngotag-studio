'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

import { Icon } from './icons'
import { createPortal } from 'react-dom'

export interface SelectOption {
  value: string
  label: string
  /** A second line under the label, for ids and qualifiers. */
  hint?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  /** Accessible name. Required — a select with no name is unusable by ear. */
  label: string
  /** Shown when nothing is selected, or when there is nothing to select. */
  placeholder?: string
  disabled?: boolean
  /** Sizing and width for the trigger; the popup matches the trigger's width. */
  className?: string
}

/**
 * The design system's select, ported from BhutanNDI_Studio.
 *
 * A native <select> was here first, and its popup is drawn by the operating
 * system: white ground, system highlight, none of the palette. `option`
 * accepts a background and a colour and nothing else — no border, no radius,
 * no shadow — so a themed list is not reachable that way at all. This is a
 * button and a listbox, which gets the same material as the other menus.
 *
 * The keyboard contract of the native control is kept, because that is the
 * part people actually lose when a select is rebuilt: Enter, Space or Down
 * opens, Up and Down move, Home and End jump, Enter or Space commits, Escape
 * closes without committing, and focus returns to the trigger either way.
 */
export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select',
  disabled = false,
  className = '',
}: SelectProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const wrap = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    setMounted(true)
  }, [])

  const selected = options.findIndex((o) => o.value === value)
  const current = selected >= 0 ? options[selected] : undefined
  const empty = options.length === 0

  const close = (refocus = true): void => {
    setOpen(false)
    if (refocus) {
      trigger.current?.focus()
    }
  }

  const commit = (i: number): void => {
    const opt = options[i]
    if (!opt) {
      return
    }
    onChange(opt.value)
    close()
  }

  useEffect(() => {
    if (!open) {
      return
    }
    /* Opening lands on the current value, not the top of the list — arrowing
       from somewhere other than where you are is disorienting. */
    setActive(selected >= 0 ? selected : 0)
  }, [open, selected])

  useEffect(() => {
    if (!open) {
      return
    }
    const onDown = (e: MouseEvent): void => {
      const target = e.target as Node
      const insideTrigger = wrap.current?.contains(target)
      // The option list is portaled to document.body (see render below) so it
      // can escape a Panel's overflow-hidden — it's no longer a DOM
      // descendant of `wrap`, so it needs its own containment check here or
      // every click on an option would look like an outside click and close
      // the menu before the option's own onClick/commit fires.
      const insideList = list.current?.contains(target)
      if (!insideTrigger && !insideList) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return (): void => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Portaled positioning: the trigger stays in normal flow, but the list is
  // rendered into document.body (see below), so its position has to be
  // computed from the trigger's viewport rect rather than relying on CSS
  // `absolute` positioning against an in-tree ancestor.
  useEffect(() => {
    if (!open) {
      return
    }
    const updatePosition = (): void => {
      const rect = trigger.current?.getBoundingClientRect()
      if (rect) {
        setPosition({
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width,
        })
      }
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return (): void => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open || !list.current) {
      return
    }
    list.current
      .querySelector<HTMLElement>('[data-active="1"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (disabled || empty) {
      return
    }
    if (!open) {
      if (
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp'
      ) {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActive(options.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      commit(active)
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  return (
    <div
      className={`relative ${className.includes('w-full') ? 'w-full' : ''}`}
      ref={wrap}
    >
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={label}
        disabled={disabled || empty}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`ndi-select-trigger flex items-center gap-2 ${className}`.trim()}
      >
        <span
          className={`min-w-0 flex-1 truncate text-left ${current ? '' : 'text-ngotag-faint'}`}
        >
          {current ? current.label : placeholder}
        </span>
        <Icon
          name="chevronDown"
          size={15}
          strokeWidth={2}
          className="ease-ngotag flex-none opacity-60 transition-transform duration-200"
          style={{ transform: `rotate(${open ? 180 : 0}deg)` }}
        />
      </button>

      {open && mounted
        ? createPortal(
            // Portaled to document.body — see the positioning effect above —
            // so this list can never be clipped by a Panel's overflow-hidden
            // (or any other ancestor's overflow/stacking context) regardless
            // of where this Select is used.
            <div
              id={`${id}-list`}
              ref={list}
              role="listbox"
              aria-label={label}
              tabIndex={-1}
              className="fixed z-[80] max-h-[264px] min-w-[180px] overflow-y-auto rounded-xl border p-1.5"
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
                borderColor: 'var(--ngotag-border-grid)',
                background: 'var(--ngotag-surface-menu)',
                boxShadow:
                  '0 20px 48px rgb(var(--ngotag-shade) / 0.45), inset 0 1px 0 rgb(var(--ngotag-gloss) / 0.06)',
              }}
            >
              {options.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  data-active={i === active ? '1' : '0'}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(i)}
                  className="ndi-navrow flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.hint ? (
                      <span className="font-ngotag-mono text-ngotag-faint mt-0.5 block truncate text-[11px]">
                        {o.hint}
                      </span>
                    ) : null}
                  </span>
                  {o.value === value ? (
                    <Icon
                      name="check"
                      size={15}
                      strokeWidth={2.2}
                      className="text-ngotag-accent flex-none"
                    />
                  ) : null}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
