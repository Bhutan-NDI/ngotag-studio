"use client";

import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "./formStyles";

/**
 * A validity window — valid from, valid until.
 *
 * Two native `input[type=date]`s rather than a calendar widget. A date picker
 * is the single most common reason a project like this acquires a dependency,
 * and the native control already brings a locale-correct calendar, a keyboard
 * path, and the platform's own mobile behaviour. What it does not bring is
 * consistent styling across browsers, which is a price worth paying here.
 *
 * `allowOpenEnded` exists for the scope builder. An authority with no expiry
 * is a real and occasionally correct choice — the Owner's own root authority
 * has none — but it should be a choice someone makes on purpose rather than
 * the result of leaving a field alone, so it is a checkbox that clears the
 * field rather than an empty field that quietly means "forever".
 *
 * `min` on the end date is wired to the start date, so the browser refuses
 * the inverted range rather than the UI having to explain it afterwards.
 */
export function DateRangeField({
  from,
  until,
  onFromChange,
  onUntilChange,
  fromLabel = "Valid from",
  untilLabel = "Valid until",
  allowOpenEnded = false,
  disabled = false,
}: {
  from: string;
  /** Empty string means open-ended, when that is allowed. */
  until: string;
  onFromChange: (value: string) => void;
  onUntilChange: (value: string) => void;
  fromLabel?: string;
  untilLabel?: string;
  allowOpenEnded?: boolean;
  disabled?: boolean;
}) {
  const openEnded = until === "";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 min-[641px]:grid-cols-2">
        <label className={FIELD_BLOCK_CLASS}>
          <span className={LABEL_CLASS}>{fromLabel}</span>
          <input
            type="date"
            value={from}
            disabled={disabled}
            onChange={(e) => onFromChange(e.target.value)}
            className={`${FIELD_CLASS} h-11`}
          />
        </label>

        <label className={FIELD_BLOCK_CLASS}>
          <span className={LABEL_CLASS}>{untilLabel}</span>
          <input
            type="date"
            value={until}
            min={from || undefined}
            disabled={disabled || openEnded}
            onChange={(e) => onUntilChange(e.target.value)}
            /* An open-ended range shows the word rather than an empty box, so
               the state is legible without reading the checkbox below. */
            placeholder={openEnded ? "No end date" : undefined}
            className={`${FIELD_CLASS} h-11 ${openEnded ? "opacity-55" : ""}`}
          />
        </label>
      </div>

      {allowOpenEnded ? (
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={openEnded}
            disabled={disabled}
            /* Unchecking has to put something back, or the field returns
               empty and still means open-ended. */
            onChange={(e) => onUntilChange(e.target.checked ? "" : from)}
            className="h-4 w-4 flex-none accent-[var(--ndi-mint)]"
          />
          <span className="text-[13px] leading-[1.5] text-muted">
            No end date
            <span className="text-faint"> — this authority stays valid until it is withdrawn</span>
          </span>
        </label>
      ) : null}
    </div>
  );
}
