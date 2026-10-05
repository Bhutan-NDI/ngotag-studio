"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Icon } from "./icons";

export interface SelectOption {
  value: string;
  label: string;
  /** A second line under the label, for ids and qualifiers. */
  hint?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Accessible name. Required — a select with no name is unusable by ear. */
  label: string;
  /** Shown when nothing is selected, or when there is nothing to select. */
  placeholder?: string;
  disabled?: boolean;
  /** Sizing and width for the trigger; the popup matches the trigger's width. */
  className?: string;
}

/**
 * The design system's select.
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
  placeholder = "Select",
  disabled = false,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();

  const selected = options.findIndex((o) => o.value === value);
  const current = selected >= 0 ? options[selected] : undefined;
  const empty = options.length === 0;

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const commit = (i: number) => {
    const opt = options[i];
    if (!opt) return;
    onChange(opt.value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    /* Opening lands on the current value, not the top of the list — arrowing
       from somewhere other than where you are is disorienting. */
    setActive(selected >= 0 ? selected : 0);
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open || !list.current) return;
    list.current.querySelector<HTMLElement>('[data-active="1"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || empty) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(active);
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div className={`relative ${className.includes("w-full") ? "w-full" : ""}`} ref={wrap}>
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
        <span className={`min-w-0 flex-1 truncate text-left ${current ? "" : "text-faint"}`}>
          {current ? current.label : placeholder}
        </span>
        <Icon
          name="chevronDown"
          size={15}
          strokeWidth={2}
          className="flex-none opacity-60 transition-transform duration-200 ease-ndi"
          style={{ transform: `rotate(${open ? 180 : 0}deg)` }}
        />
      </button>

      {open ? (
        <div
          id={`${id}-list`}
          ref={list}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          className="absolute left-0 top-[calc(100%+6px)] z-[80] max-h-[264px] w-full min-w-[180px] overflow-y-auto rounded-xl border p-1.5"
          style={{
            borderColor: "var(--border-grid)",
            background: "var(--surface-menu)",
            boxShadow:
              "0 20px 48px rgb(var(--shade) / 0.45), inset 0 1px 0 rgb(var(--gloss) / 0.06)",
          }}
        >
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              data-active={i === active ? "1" : "0"}
              onMouseEnter={() => setActive(i)}
              onClick={() => commit(i)}
              className="ndi-navrow flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">{o.label}</span>
                {o.hint ? (
                  <span className="mt-0.5 block truncate font-mono text-[11px] text-faint">
                    {o.hint}
                  </span>
                ) : null}
              </span>
              {o.value === value ? (
                <Icon name="check" size={15} strokeWidth={2.2} className="flex-none text-accent" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
