'use client'

import { Icon, type IconName } from './icons'

import React, { useRef } from 'react'

export interface TabItem {
  id: string
  label: string
  icon?: IconName
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
  label: string
}

/**
 * The design system's segmented tabs, not an underline row: below 641px the
 * control is full width and distributes its spare space; from 641px it goes
 * inline-flex and hugs its content, because distributing at tablet width
 * pushes the tabs so far apart they stop reading as one control.
 *
 * Implements the ARIA APG tabs pattern's roving tabindex: only the active
 * tab is in the regular tab order, and Left/Right/Home/End move both focus
 * and selection (automatic activation) across the set.
 */
export function Tabs({
  tabs,
  active,
  onChange,
  label,
}: TabsProps): React.JSX.Element {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const activate = (id: string): void => {
    onChange(id)
    tabRefs.current[id]?.focus()
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    const nextIndex =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : null

    if (nextIndex === null) {
      return
    }
    event.preventDefault()
    activate(tabs[nextIndex].id)
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className="border-bhutanndi-grid flex w-full rounded-xl border bg-[rgb(var(--bhutanndi-tint)/0.03)] p-1 min-[641px]:inline-flex min-[641px]:w-auto"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el
            }}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => activate(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className="ndi-tab font-display inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[9px] px-4 text-[13.5px] font-semibold min-[641px]:flex-none"
            data-active={isActive ? '1' : '0'}
          >
            {tab.icon ? (
              <Icon
                name={tab.icon}
                size={15}
                strokeWidth={1.8}
                /* Icons show on the active tab always, and on all tabs from
                   641px, where there is room. */
                className={
                  isActive ? 'flex-none' : 'hidden flex-none min-[641px]:inline'
                }
              />
            ) : null}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
