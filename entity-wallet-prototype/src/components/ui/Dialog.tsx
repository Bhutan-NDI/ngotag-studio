"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { Icon } from "./icons";

/**
 * A modal dialog. There was no dialog of any kind in this app before.
 *
 * Built on the native `<dialog>` element and `showModal()`, which is the one
 * decision here worth defending. It gives, from the platform: the top layer
 * (so no z-index arithmetic against the sidebar, the harness bar and the
 * atmosphere), a real focus trap, focus restored to whatever opened it on
 * close, Escape, `aria-modal` semantics, and inert content behind. Every
 * div-based modal reimplements those six things; this repo has no library to
 * borrow them from, and a hand-rolled focus trap is exactly the kind of code
 * that looks finished and fails for keyboard users.
 *
 * The one thing the element does not give us is a click-outside close, since
 * a click on the backdrop lands on the dialog itself. Hence the `::backdrop`
 * check below.
 *
 * `tone="danger"` is for terminate and revoke. It changes the confirm button
 * and nothing else — the weight belongs on the action, not on a red panel
 * that makes the whole decision feel like an error state. What actually
 * carries the seriousness is `consequences`: an irreversible action gets a
 * list of exactly what it will stop, because "are you sure?" asks a question
 * the person cannot answer without that list.
 */
export function Dialog({
  open,
  onClose,
  title,
  lead,
  consequences,
  confirmLabel,
  onConfirm,
  cancelLabel = "Cancel",
  tone = "default",
  children,
  confirmDisabled = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  lead?: string;
  /** "What this will immediately stop" — required for irreversible actions. */
  consequences?: string[];
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  tone?: "default" | "danger";
  children?: ReactNode;
  confirmDisabled?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* Guarded: calling showModal on an already-open dialog throws, and React
       may re-run this effect without `open` having changed. */
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  /* The element fires `close` for Escape and for any close() we did not
     initiate, so the parent's state has to follow it rather than the other
     way round. Without this, Escape leaves the dialog visually shut and the
     parent still believing it is open. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => onClose();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      /* The backdrop is styled in ndi-effects.css: a ::backdrop rule cannot
         be expressed as a utility class. */
      className="ndi-dialog w-[calc(100vw-2rem)] max-w-[520px] rounded-[16px] border border-grid p-0 text-body backdrop:bg-[var(--scrim)]"
      onClick={(e) => {
        /* A click on the backdrop has the dialog as its target, because the
           backdrop is not a node. Anything inside the panel stops here. */
        if (e.target === ref.current) onClose();
      }}
    >
      <div data-cta-form="1" className="relative overflow-hidden rounded-[16px] p-5 min-[641px]:p-6">
        <div className="relative z-[4] flex items-start justify-between gap-4">
          <h2 className="font-display text-[17px] font-semibold leading-[1.3] text-strong">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ndi-navrow -mr-1.5 -mt-1.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-[9px]"
            data-active="0"
          >
            <Icon name="close" size={16} strokeWidth={2} />
          </button>
        </div>

        {lead ? (
          <p className="relative z-[4] mt-2 text-[13.5px] leading-[1.6] text-muted">{lead}</p>
        ) : null}

        {consequences && consequences.length > 0 ? (
          <div className="relative z-[4] mt-4 rounded-[12px] border border-grid px-3.5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              What this stops
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {consequences.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[13px] leading-[1.5] text-body">
                  <Icon
                    name="arrowRight"
                    size={13}
                    strokeWidth={2}
                    className="mt-[3px] flex-none text-faint"
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {children ? <div className="relative z-[4] mt-4">{children}</div> : null}

        <div className="relative z-[4] mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="ndi-hairline-btn inline-flex h-11 items-center rounded-[10px] px-4 font-display text-[13.5px] font-medium"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="ndi-dialog-confirm inline-flex h-11 items-center rounded-[10px] px-4 font-display text-[13.5px] font-semibold disabled:opacity-55"
            data-tone={tone}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
