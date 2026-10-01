"use client";

import type { ReactNode } from "react";

import { Icon } from "./icons";

/**
 * A checkbox with its label, for the scope builder's operation checklist.
 *
 * A real `input[type=checkbox]`, visually hidden and covered by a drawn box,
 * rather than a div with `role="checkbox"`. The native control brings the
 * space key, the label association, form semantics and the platform's own
 * announcement for free, and every hand-rolled version of this has to
 * reimplement all four and usually gets one wrong.
 *
 * `description` exists because the scope builder needs it: an operation name
 * on its own ("Present proofs") does not tell an Owner what they are granting,
 * and a tooltip is the wrong place for information you need before deciding.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={`group flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[10px] px-2.5 py-2.5 transition-colors duration-150 ${
        disabled ? "cursor-not-allowed opacity-55" : "hover:bg-[rgb(var(--tint)/0.04)]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        /* peer, so the drawn box can style off the real control's state and
           focus — including :focus-visible, which cannot be replicated. */
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="mt-px flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] border transition-all duration-150 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ndi-mint)]"
        style={{
          borderColor: checked ? "var(--ndi-mint)" : "var(--border-grid)",
          background: checked ? "var(--ndi-mint)" : "transparent",
        }}
      >
        {checked ? (
          <Icon
            name="check"
            size={12}
            strokeWidth={3}
            /* Against a mint fill, the tick takes the deep ink rather than
               white: white on mint measures below 3:1. */
            className="text-[var(--ndi-ink-900)]"
          />
        ) : null}
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-display text-[13.5px] font-medium leading-[1.4] text-body">
          {label}
        </span>
        {description ? (
          <span className="text-[12.5px] leading-[1.5] text-faint">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
