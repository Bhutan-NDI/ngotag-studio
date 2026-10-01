"use client";

/**
 * A small set of mutually exclusive choices, all visible at once.
 *
 * Built for the scope builder's per-operation approval policy, where the
 * three options (automatic / one approver / two approvers) sit on a scale and
 * the whole point is comparing them. A `Select` would hide two of the three
 * behind a click and make the Owner remember what the alternatives were — on
 * the screen the brief calls the highest-stakes in the product.
 *
 * A radiogroup rather than a row of buttons, because that is what it is: one
 * value, several options, arrow keys expected to move between them. Roving
 * tabindex gives that — one tab stop for the group, arrows within it — which
 * is the behaviour a native radio group has and a row of buttons does not.
 */
export interface Segment<T extends string> {
  value: T;
  label: string;
  /** Shown under the row when this segment is selected. */
  hint?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  segments,
  label,
  disabled = false,
}: {
  value: T;
  onChange: (value: T) => void;
  segments: Segment<T>[];
  /** Names the group for assistive tech. Not rendered. */
  label: string;
  disabled?: boolean;
}) {
  const index = segments.findIndex((s) => s.value === value);
  const selected = index >= 0 ? segments[index] : undefined;

  const move = (delta: number) => {
    if (disabled || segments.length === 0) return;
    /* Wraps, as a radio group does. */
    const next = (index + delta + segments.length) % segments.length;
    onChange(segments[next].value);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          }
        }}
        className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-[11px] border border-grid p-1"
        style={{ background: "rgb(var(--tint) / 0.04)" }}
      >
        {segments.map((segment) => {
          const active = segment.value === value;
          return (
            <button
              key={segment.value}
              type="button"
              role="radio"
              aria-checked={active}
              /* Roving tabindex: the group is one tab stop and the arrows
                 move within it. */
              tabIndex={active || (index < 0 && segment === segments[0]) ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(segment.value)}
              className="ndi-navrow min-h-[36px] rounded-[8px] px-3 font-display text-[13px] font-medium disabled:opacity-55"
              data-active={active ? "1" : "0"}
            >
              {segment.label}
            </button>
          );
        })}
      </div>

      {/* The hint sits outside the group so its text is not announced as part
          of an option's label, and so the row does not resize as it changes. */}
      {selected?.hint ? (
        <p className="text-[12.5px] leading-[1.5] text-faint">{selected.hint}</p>
      ) : null}
    </div>
  );
}
