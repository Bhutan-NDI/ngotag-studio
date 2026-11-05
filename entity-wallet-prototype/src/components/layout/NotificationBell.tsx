"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icons";
import { waitingFor, type WaitingItem } from "@/lib/demoWaiting";
import { useDemo } from "@/lib/demoStore";

/**
 * The bell: what is waiting for whoever is signed in.
 *
 * It used to be decoration, which left an appointee with no way to their
 * appointment unless the representative's "open it as …" brought them there
 * — reach Ugyen any other way and the appointment sat out of sight. A
 * notification is how the product would tell him, so the bell lists the
 * same things the Presentation panel's "Waiting for" does: an appointment to
 * accept or decline, approvals, requests, offers, the issuer's queue.
 */
export function NotificationBell() {
  const router = useRouter();
  const {
    people,
    organizations,
    relations,
    parkedOperations,
    presentationRequests,
    offers,
    credentialRequests,
    authorityGrants,
    harness,
    setActiveOrg,
    hydrated,
  } = useDemo();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const items = hydrated
    ? waitingFor(
        { people, organizations, relations, parkedOperations, presentationRequests, offers, credentialRequests, authorityGrants },
        harness.persona,
      )
    : [];

  const go = (w: WaitingItem) => {
    if (w.orgId) setActiveOrg(w.orgId);
    setOpen(false);
    router.push(w.href);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={items.length ? `Notifications, ${items.length} waiting` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="ndi-navrow relative inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
        data-active={open ? "1" : "0"}
      >
        <Icon name="bell" size={17} strokeWidth={1.7} />
        {items.length ? (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 font-display text-[10px] font-semibold"
            style={{ background: "var(--ndi-mint)", color: "var(--text-on-mint)" }}
          >
            {items.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-12 z-[70] w-[320px] max-w-[calc(100vw-24px)] rounded-2xl border border-grid bg-[var(--chrome-fill-strong)] p-2 shadow-[var(--shadow-card)] backdrop-blur-[20px] backdrop-saturate-[140%]"
        >
          <p className="px-2.5 pb-1.5 pt-2 font-display text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">
            Notifications
          </p>
          {items.length ? (
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {items.map((w) => (
                <li key={w.key}>
                  <button
                    type="button"
                    onClick={() => go(w)}
                    className="ndi-navrow flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-2 text-left"
                    data-active="0"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[7px] h-2 w-2 flex-none rounded-full"
                      style={{ background: "var(--ndi-mint)" }}
                    />
                    <span className="text-[13px] leading-[1.45] text-body">{w.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2.5 pb-3 pt-1 text-[13px] leading-[1.5] text-muted">You&rsquo;re all caught up.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
