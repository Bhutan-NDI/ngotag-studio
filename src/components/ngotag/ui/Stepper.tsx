import { Icon } from './icons'

import type React from 'react'

export interface Step {
  label: string
}

/**
 * The progress rail above a multi-step flow — choose a schema, choose a
 * definition, fill the attributes, send.
 *
 * Steps already passed get a tick rather than their number: the number tells
 * you where you are, and once you are past it the only thing worth saying is
 * that it is done. Below 641px the labels drop and the rail becomes dots, since
 * four labels across a phone either wrap into nonsense or truncate to nothing.
 */
export function Stepper({
  steps,
  current,
}: {
  steps: Step[]
  current: number
}): React.JSX.Element {
  return (
    <ol
      className="relative z-[4] m-0 flex list-none items-center gap-2 p-0 min-[641px]:gap-3"
      aria-label="Progress"
    >
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={step.label}
            className="flex min-w-0 items-center gap-2 min-[641px]:gap-3"
          >
            <span
              aria-current={active ? 'step' : undefined}
              className="font-ngotag-mono inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border text-[11px]"
              style={{
                borderColor:
                  done || active
                    ? 'var(--ngotag-border-strong)'
                    : 'var(--ngotag-border-grid)',
                background:
                  done || active
                    ? 'var(--ngotag-mint-12)'
                    : 'rgb(var(--ngotag-tint) / 0.03)',
                color:
                  done || active
                    ? 'var(--ngotag-accent)'
                    : 'var(--ngotag-text-faint)',
              }}
            >
              {done ? <Icon name="check" size={13} strokeWidth={2.4} /> : i + 1}
            </span>

            <span
              className={`hidden truncate text-[13px] min-[641px]:inline ${
                active ? 'text-ngotag-strong font-medium' : 'text-ngotag-muted'
              }`}
            >
              {step.label}
            </span>

            {i < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="h-px w-4 flex-none min-[641px]:w-8"
                style={{ background: 'var(--ngotag-border-subtle)' }}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
