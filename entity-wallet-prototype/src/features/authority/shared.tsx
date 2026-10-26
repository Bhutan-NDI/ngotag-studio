"use client";

import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icons";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { namesOf } from "@/lib/sharing";

/**
 * What Flow 8's screens have in common (UX-EW-05).
 *
 * THE WORDS (§2.4)
 *
 * The grantor *gives authority*; the approver *approves*; the person
 * receiving it *collects* it. Never "delegate", "delegated authority",
 * "capability", "counterparty", "claim" or "grant" as a noun, never a scope
 * string — the vocabulary's labels and the organisation's listed name
 * instead. The code says grant, capability and counterparty because the
 * record does.
 */

/**
 * The authority statement (UX-EW-05 §3.4, UXD-48): the terms as one
 * sentence, never a table. A grantor checks a sentence; a table is skimmed.
 */
export function Statement({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 max-w-[64ch] font-display text-[17px] font-medium leading-[1.55] tracking-[-0.005em] text-strong">{children}</p>
  );
}

/**
 * *What they carry* (UX-EW-05 §3.4, UXD-49, UC-37).
 *
 * Grantors arrive expecting to hand their agent the company's licence and
 * TPN, because that is what a paper letter of authority came with (§1.4).
 * Saying only what *is* carried would leave that belief in place, so the
 * panel says, explicitly, what isn't. The first sentence must survive
 * review unchanged (§2.4).
 */
export function WhatTheyCarry({ name, orgName, licences }: { name: string; orgName: string; licences: string[] }) {
  return (
    <section aria-labelledby="aut-carry" className="flex flex-col gap-3">
      <h2 id="aut-carry" className={`${LABEL_CLASS} m-0`}>
        What they carry
      </h2>
      <p className="m-0 max-w-[64ch] text-[14.5px] leading-[1.6] text-body">
        {name} will carry this authority in their own Bhutan NDI app. It names which of your licences they may use, but does not include your
        licence or your TPN.
      </p>
      <div className="grid gap-3 min-[641px]:grid-cols-2">
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13.5px] text-body" aria-label="What it includes">
          {[
            `That it is from ${orgName}`,
            licences.length ? `Licence ${namesOf(licences)} — the number only` : null,
            "What they may do, where, up to what, until when",
            `${name}'s own name`,
          ]
            .filter(Boolean)
            .map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Icon name="check" size={13} strokeWidth={2.4} className="mt-[4px] flex-none text-accent" />
                {line}
              </li>
            ))}
        </ul>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13.5px] text-muted" aria-label="What it doesn't include">
          {["Your licence itself", "Your TPN", "Your registration details", "Who gave it"].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <Icon name="close" size={13} strokeWidth={2.2} className="mt-[4px] flex-none text-faint" />
              Not {line.charAt(0).toLowerCase() + line.slice(1)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** A message in the screen's own voice — an error, a status, a note. */
export function Notice({ children, tone = "info", role }: { children: ReactNode; tone?: "info" | "warning" | "success"; role?: "alert" | "status" }) {
  const dot = tone === "warning" ? "var(--ndi-warning)" : tone === "success" ? "var(--ndi-success)" : "var(--ndi-info)";
  return (
    <p role={role} className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body">
      <span aria-hidden="true" className="mt-[7px] h-2 w-2 flex-none rounded-full" style={{ background: dot }} />
      <span>{children}</span>
    </p>
  );
}

/** Small labelled fact. */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className={`${LABEL_CLASS} m-0`}>{label}</p>
      <div className="text-[13.5px] text-body">{children}</div>
    </div>
  );
}
