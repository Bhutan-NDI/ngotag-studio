"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { attrLabel as baseLabel } from "@/features/receive/shared";
import type { BlockedReason, HeldCredential, PresentationRequest, PresentationStatus } from "@/lib/demoData";
import { namesOf, statusOf, type DescriptorMatch } from "@/lib/sharing";

/**
 * What the sharing screens have in common (UX-EW-04, Flow 7).
 *
 * THE BUSINESS SHARES; NOBODY "PRESENTS"
 *
 * §2.4 binds every word here: the verifier is the organisation's listed
 * name, never "verifier" or "relying party"; the person *shares*, the
 * approver *approves* (UXD-44); there is no session, no redirect, no proof
 * request on a screen. The code says proof:present because the server does.
 */

/** An attribute's label, with the acronyms people know kept as acronyms. */
export const attrLabel = (name: string) => (name === "tpn" ? "TPN" : baseLabel(name));

/** Whole sentences per state — SCR-PRS-05's content table (UX-EW-04 v0.3). */
export function stateWords(
  r: PresentationRequest,
  names: { person: (id: string | null | undefined) => string; approvers: string[] },
): { status: string; label: string; sentence: string } {
  const st: PresentationStatus = statusOf(r);
  switch (st) {
    case "RECEIVED":
      /* Listed on Waiting with no Answer, and only when it came through a
         website session (FLOW-PRS-01 E8) — `onWaiting` decides that. Nobody
         can act on it until NDI's list confirms the sender. */
      return { status: "received", label: "Checking", sentence: `Checking ${r.verifierName} — you can't answer this yet` };
    case "OPEN":
      return { status: "open", label: "Waiting", sentence: `${r.verifierName} is asking — answer by ${formatDate(r.expiresAt)}` };
    case "AWAITING_APPROVAL":
      return { status: "awaiting_approval", label: "Waiting for approval", sentence: `Waiting for ${namesOf(names.approvers) || "someone"} to approve` };
    case "SHARED":
      return {
        status: "shared",
        label: "Shared",
        sentence: `Shared on ${formatDate(r.decidedAt ?? r.receivedAt)} by ${names.person(r.initiatedBy ?? r.decidedBy)}${
          r.approvedBy ? `, approved by ${names.person(r.approvedBy)}` : ""
        }`,
      };
    case "DECLINED":
      return { status: "declined", label: "Declined", sentence: `Declined on ${formatDate(r.decidedAt ?? r.receivedAt)} by ${names.person(r.decidedBy)}` };
    case "EXPIRED":
      return { status: "expired", label: "Expired", sentence: `Expired on ${formatDate(r.expiresAt)} — nothing shared` };
    case "WITHDRAWN":
      return { status: "withdrawn", label: "Cancelled", sentence: `${r.verifierName} cancelled this` };
    case "FAILED":
      return { status: "failed", label: "Couldn't be shared", sentence: "Couldn't be shared — nothing was sent" };
    case "BLOCKED":
      return { status: "blocked", label: "Refused", sentence: refusedSentence(r) };
  }
}

/** FLOW-PRS-02 E1 on *Refused* — "claiming", because the name is unproven. */
export function refusedSentence(r: Pick<PresentationRequest, "verifierName" | "blockedReason">) {
  const reason: Record<BlockedReason, string> = {
    VERIFIER_NOT_TRUSTED: "not on NDI's list of trusted organisations",
    OUT_OF_SCOPE: "asked for more than it's approved to",
    UNSUPPORTED_FORMAT: "not a request we can answer",
    NO_CHALLENGE: "not a request we can answer",
    NO_PURPOSE: "not a request we can answer",
  };
  return `Request claiming to be from ${r.verifierName} refused — ${reason[r.blockedReason ?? "VERIFIER_NOT_TRUSTED"]}.`;
}

/** The verifier's reason, quoted and labelled as theirs (SCR-PRS-02 "Reason"). */
export function VerifierReason({ r }: { r: Pick<PresentationRequest, "verifierName" | "purpose"> }) {
  return (
    <p className="m-0 text-[14px] leading-[1.6] text-body">
      {r.verifierName}&rsquo;s reason: &ldquo;{r.purpose}&rdquo;
    </p>
  );
}

/**
 * The verifier's reference check (UXD-46, D21). Above the first action, on
 * SCR-PRS-01 before sign-in and again on SCR-PRS-02. A bare reference isn't
 * compared; the sentence tells the person to compare it, which is the one
 * defence a forwarded link meets at the moment it matters.
 */
export function ReferenceCheck({ verifier, reference }: { verifier: string; reference: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
      <Icon name="shieldCheck" size={16} strokeWidth={1.9} className="mt-[3px] flex-none text-accent" />
      <p className="m-0 text-[13.5px] leading-[1.6] text-body">
        {verifier}&rsquo;s reference: <span className="font-mono text-[13px] font-semibold text-strong">{reference}</span>. Only continue if you started this
        on {verifier}&rsquo;s website just now and see this reference there.
      </p>
    </div>
  );
}

/**
 * The asked-within-whole list (UX-EW-04 §3.4, UXD-42).
 *
 * WHY EVERYTHING, WITH THE ASKED-FOR ONES MARKED
 *
 * A JSON-LD credential can't be shared in part (D4), so every attribute of
 * each credential goes — the bank that asked for a registration number gets
 * the address and the date of incorporation too. A short list of the asked-
 * for fields with "the rest is also shared" beneath it is not read. So the
 * list is the whole credential, value by value, and "Asked for" is marked
 * beside the attributes the request named — never a separate list, so the
 * rest are visibly *also* sent (UC-33). The sentence above it is one of the
 * two that must survive review unchanged.
 *
 * Where a descriptor can't be answered (V7), its place in the list says why
 * and offers the way to get it (E9/E3, D17). Where more than one held
 * credential answers it, the newest is chosen and the person may change it
 * (D18, A4).
 */
export function CredentialsToShare({
  verifier,
  matches,
  chosen,
  onChoose,
}: {
  verifier: string;
  matches: DescriptorMatch[];
  chosen: Record<string, string>;
  /** Absent on the approver's screen, which shows what the sharer chose. */
  onChoose?: (descriptorId: string, credentialId: string) => void;
}) {
  return (
    <section aria-labelledby="prs-what" className="flex flex-col gap-3">
      <h2 id="prs-what" className="m-0 text-[14.5px] font-semibold leading-[1.5] text-strong">
        {verifier} will receive all of the details below — not only the ones it asked for.
      </h2>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {matches.map((m) => {
          const credential: HeldCredential | undefined =
            m.options.find((c) => c.id === chosen[m.descriptor.id]) ?? m.options[0];
          if (!credential) {
            return (
              <li key={m.descriptor.id} className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3">
                <p className="m-0 text-[14px] font-medium text-strong">{m.descriptor.credentialType}</p>
                <p role="alert" className="m-0 flex items-start gap-2 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="info" size={14} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
                  {m.unshareable
                    ? `${verifier} needs your ${m.descriptor.credentialType}, which can't be shared right now: ${m.unshareable.reason}.`
                    : `${verifier} needs your ${m.descriptor.credentialType}, which your organisation doesn't have yet.`}
                </p>
                <p className="m-0 text-[12.5px] text-faint">Asked for: {m.descriptor.fields.map(attrLabel).join(", ")}</p>
                {onChoose ? (
                  <Link href="/wallet/get" className="ndi-plainlink self-start text-[13px] font-medium text-accent">
                    Get {m.descriptor.credentialType}
                  </Link>
                ) : null}
              </li>
            );
          }
          return (
            <li key={m.descriptor.id} className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="m-0 text-[14px] font-medium text-strong">{credential.type}</p>
                <p className="m-0 text-[12.5px] text-faint">From {credential.issuer} · received {formatDate(credential.receivedAt)}</p>
              </div>
              {m.options.length > 1 ? (
                <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
                  <span>You have more than one {credential.type}. We&rsquo;ve chosen the newest.</span>
                  {onChoose ? (
                    <label className="flex items-center gap-2">
                      <span className="sr-only">Change which {credential.type}</span>
                      <select
                        value={credential.id}
                        onChange={(e) => onChoose(m.descriptor.id, e.target.value)}
                        className="h-8 rounded-[8px] border border-grid bg-transparent px-2 text-[12.5px] text-body"
                      >
                        {m.options.map((c) => (
                          <option key={c.id} value={c.id}>
                            Received {formatDate(c.receivedAt)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
              ) : null}
              <dl className="m-0 flex flex-col">
                {credential.attributes.map((a, i) => {
                  const asked = m.descriptor.fields.includes(a.name);
                  return (
                    <div
                      key={a.name}
                      className={`grid gap-0.5 py-1.5 min-[521px]:grid-cols-[200px_1fr_auto] min-[521px]:items-baseline min-[521px]:gap-4 ${i > 0 ? "border-t border-subtle" : ""}`}
                    >
                      <dt className="text-[12.5px] text-faint">{attrLabel(a.name)}</dt>
                      <dd className="m-0 text-[13px] text-body">{a.value}</dd>
                      <dd className="m-0 text-[11.5px] font-medium">
                        {asked ? (
                          <span className="inline-flex items-center gap-1 text-accent">
                            <Icon name="check" size={11} strokeWidth={2.4} />
                            Asked for
                          </span>
                        ) : (
                          <span className="text-faint">Also shared</span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </li>
          );
        })}
      </ul>
      <p className="m-0 text-[13.5px] text-body">None of your other credentials is shared.</p>
    </section>
  );
}

/** Small labelled fact, as the sharing screens set out who and when. */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className={`${LABEL_CLASS} m-0`}>{label}</p>
      <div className="text-[13.5px] text-body">{children}</div>
    </div>
  );
}
