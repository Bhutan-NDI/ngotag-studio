"use client";

/**
 * A switch, for settings that take effect as themselves rather than on submit
 * — D2's per-transaction toggle being the one this exists for.
 *
 * `role="switch"` on a button, not a checkbox: a checkbox says "this will be
 * included when you submit", a switch says "this is on now". D2's value cap
 * genuinely changes meaning the moment it flips (a cap per transaction rather
 * than across the whole authority), so the affordance should say so.
 *
 * The label is a real element beside the control rather than an aria-label,
 * so it is clickable and readable. Both are wired to the same handler.
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Needed to tie the visible label to the control. */
  id: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <label
          htmlFor={id}
          className={`font-display text-[13.5px] font-medium leading-[1.4] text-body ${
            disabled ? "opacity-55" : "cursor-pointer"
          }`}
        >
          {label}
        </label>
        {description ? (
          <span className="text-[12.5px] leading-[1.5] text-faint">{description}</span>
        ) : null}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        /* 44px of touch target around a 20px track: the control is small, the
           thing you have to hit is not. */
        className="ndi-switch relative inline-flex h-11 w-[52px] flex-none items-center justify-center disabled:opacity-55"
      >
        <span
          aria-hidden="true"
          className="relative block h-[20px] w-[36px] rounded-full border transition-colors duration-200 ease-ndi"
          style={{
            borderColor: checked ? "var(--ndi-mint)" : "var(--border-grid)",
            background: checked ? "var(--ndi-mint-25)" : "rgb(var(--tint) / 0.06)",
          }}
        >
          <span
            className="absolute top-[2px] block h-[14px] w-[14px] rounded-full transition-all duration-200 ease-ndi"
            style={{
              left: checked ? "19px" : "3px",
              background: checked ? "var(--ndi-mint)" : "var(--text-faint)",
            }}
          />
        </span>
      </button>
    </div>
  );
}
