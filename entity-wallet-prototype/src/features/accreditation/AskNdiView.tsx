"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff } from "@/components/ui/WalletHandoff";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import {
  VERIFICATION_ORG_NAME,
  accInProgress,
  inOrg,
  type AccCapability,
  type AccRequestPart,
  type AskItem,
  type IssueType,
} from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

import { IssueTypesEditor, ItemChooser, LegalBasisFields, scopeSentence } from "./shared";

/**
 * SCR-ACC-06 — Verify customers or issue credentials. FLOW-ACC-02 steps 1–5.
 *
 * TWO CHOICES, EACH WITH AN EXAMPLE — EITHER OR BOTH
 *
 * A business owner does not arrive knowing what "verify" means on NDI. Each
 * choice says what it is in a sentence and gives an example a shopkeeper
 * would recognise — checking someone is over 18; giving people a training
 * certificate. Either may be asked for, or both at once (EW-FLOW4-SD/D22,
 * UXD-59): asking for the second only after the first was decided made a
 * slow two-step for a business that wants both. Each capability is still
 * its own part of the request, with its own scope and purpose, and NDI
 * decides each on its own — one can be approved and the other declined.
 * A capability already asked for, or approved, is not offered (E3); the
 * page says where it stands instead.
 *
 * ONE PURPOSE AND ONE LEGAL BASIS FOR ISSUING
 *
 * Issuing names its credential types in words, then gives one purpose and
 * one legal basis for all of them (D23), not a basis for each type —
 * which asked "why can you issue this?" twice.
 *
 * WRITTEN BY THE BUSINESS, DECIDED AS WRITTEN
 *
 * The page says before sending that NDI will approve or decline the
 * request exactly as written and won't change it (UXD-30), and that
 * approval puts the business on NDI's public list (UXD-29). If NDI
 * declines, its reason comes back in its own words and "change and ask
 * again" reopens this page with that part as it was.
 */
type Face =
  | "live"
  | "default"
  | "choosing_verify"
  | "choosing_issue"
  | "choosing_both"
  | "step_up"
  | "loading"
  | "submitted"
  | "already_asked"
  | "error"
  | "offline"
  | "no_permission";

const DRAFT_KEY = "ndi-acc-request-draft";

interface Draft {
  caps: AccCapability[];
  verifyPurpose: string;
  issuePurpose: string;
  ask: AskItem[];
  issue: IssueType[];
  legalBasis: string;
  legalBasisRef: string;
}

const EMPTY: Draft = { caps: [], verifyPurpose: "", issuePurpose: "", ask: [], issue: [], legalBasis: "", legalBasisRef: "" };

export function AskNdiView() {
  const router = useRouter();
  const { organizations, relations, accreditations, activeOrgId, harness, personById, requestCapability, hydrated } = useDemo();
  const forced = useScreenState("SCR-ACC-06", [
    "live",
    "default",
    "choosing_verify",
    "choosing_issue",
    "choosing_both",
    "step_up",
    "loading",
    "submitted",
    "already_asked",
    "error",
    "offline",
    "no_permission",
  ]) as Face;

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState<false | "sending" | "identity">(false);
  const [outcome, setOutcome] = useState<"submitted" | "E2" | "E3" | "E6" | "invalid" | "offline" | null>(null);
  const [saved, setSaved] = useState(false);
  const [stepUp, setStepUp] = useState<"awaiting_scan" | "waiting">("awaiting_scan");
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  /* "Change and ask again" reopens the declined part as it was; a saved
     draft otherwise. Read once from the address. */
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from");
    const prior = from ? accreditations.find((a) => a.id === from) : undefined;
    if (prior) {
      setDraft({
        ...EMPTY,
        caps: [prior.capability],
        verifyPurpose: prior.capability === "verifier" ? prior.purpose : "",
        issuePurpose: prior.capability === "issuer" ? prior.purpose : "",
        ask: prior.ask,
        issue: prior.issue,
        legalBasis: prior.legalBasis,
        legalBasisRef: prior.legalBasisRef,
      });
      return;
    }
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      /* A draft saved before both could be asked for has a single
         `capability` and no `caps`; it is dropped rather than half-read. */
      const d = raw ? (JSON.parse(raw) as Partial<Draft>) : null;
      if (d && Array.isArray(d.caps)) setDraft({ ...EMPTY, ...d });
    } catch {
      /* Nothing to resume. */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const forcedCaps: Partial<Record<Face, AccCapability[]>> = {
      choosing_verify: ["verifier"],
      choosing_issue: ["issuer"],
      choosing_both: ["verifier", "issuer"],
    };
    const next = forcedCaps[forced];
    if (next) setDraft((d) => ({ ...d, caps: next }));
  }, [forced]);

  const org = organizations.find((o) => o.id === activeOrgId);
  const name = org?.name ?? "Your organisation";
  const short = name.replace(/ (Pvt\. )?Ltd\.$/, "");
  const root = relations.find((r) => inOrg(org?.id ?? "")(r) && r.isRootAuthority && r.state === "ACTIVE");
  const rootName = root ? personById(root.personId).name : "its representative";
  /* E3, per capability: one already asked for or approved isn't offered,
     but the other still is. */
  const taken = (c: AccCapability) => accreditations.some((a) => a.orgId === activeOrgId && a.capability === c && accInProgress(a));
  const bothTaken = taken("verifier") && taken("issuer");
  const caps = draft.caps.filter((c) => forced !== "live" || !taken(c));

  const natural: Face =
    root?.personId !== harness.persona || outcome === "E2"
      ? "no_permission"
      : outcome === "submitted"
        ? "submitted"
        : outcome === "E3" || bothTaken
          ? "already_asked"
          : outcome === "E6"
            ? "error"
            : busy
              ? "loading"
              : caps.length === 2
                ? "choosing_both"
                : caps[0] === "verifier"
                  ? "choosing_verify"
                  : caps[0] === "issuer"
                    ? "choosing_issue"
                    : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (
    <PageHeader crumbs={[{ label: name }, { label: "Verify or issue", href: "/verify-or-issue" }, { label: "Ask NDI" }]} title="Verify customers or issue credentials" />
  );
  const message = (text: React.ReactNode, action?: React.ReactNode) => (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">{text}</p>
            {action ? <div>{action}</div> : null}
          </div>
        </Panel>
      </div>
    </AppShell>
  );

  if (face === "no_permission") return message(`Only ${rootName}, who represents ${short}, can ask for this.`);
  if (face === "already_asked")
    return message("You've already asked for this. Here's where it stands.", <GradientButton onClick={() => router.push("/verify-or-issue")}>Go to status</GradientButton>);
  if (face === "submitted")
    return message(
      <>
        <Icon name="check" size={15} strokeWidth={2.4} className="mr-1.5 inline text-accent" />
        Sent. NDI will review it and a second administrator will decide
        {draft.caps.length === 2 ? " — verifying and issuing each on its own" : ""}. You&rsquo;ll see where it stands on your
        status page.
      </>,
      <GradientButton onClick={() => router.push("/verify-or-issue")}>Go to status</GradientButton>,
    );
  if (face === "loading")
    return message(busy === "identity" || forced === "loading" ? "Setting up your organisation's public identity…" : "Sending…");

  const verifying = caps.includes("verifier");
  const issuing = caps.includes("issuer");
  const ready =
    caps.length > 0 &&
    (!verifying || (draft.ask.length > 0 && Boolean(draft.verifyPurpose.trim()))) &&
    (!issuing || (draft.issue.length > 0 && Boolean(draft.issuePurpose.trim()) && Boolean(draft.legalBasis.trim())));

  const send = () => {
    if (!caps.length) return;
    if (face === "offline") {
      setOutcome("offline");
      return;
    }
    setBusy("sending");
    window.setTimeout(() => setBusy("identity"), LOCAL_MS);
    window.setTimeout(() => {
      setBusy(false);
      if (face === "error") {
        setOutcome("E6");
        return;
      }
      const parts: AccRequestPart[] = caps.map((c) =>
        c === "verifier"
          ? { capability: c, purpose: draft.verifyPurpose, ask: draft.ask, issue: [], legalBasis: "", legalBasisRef: "" }
          : { capability: c, purpose: draft.issuePurpose, ask: [], issue: draft.issue, legalBasis: draft.legalBasis, legalBasisRef: draft.legalBasisRef },
      );
      const r = requestCapability({ parts });
      if (r.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* Nothing saved. */
        }
        setOutcome("submitted");
      } else setOutcome(r.error);
    }, LOCAL_MS * 3);
  };

  const choices: { value: AccCapability; title: string; text: string; icon: "verify" | "issue" }[] = [
    {
      value: "verifier",
      title: "Verify customers",
      text: "Ask customers to share information from their NDI wallet — for example, to check they're over 18.",
      icon: "verify",
    },
    {
      value: "issuer",
      title: "Issue credentials",
      text: "Give people credentials they keep in their NDI wallet — for example, training certificates.",
      icon: "issue",
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        {header}

        <p className="m-0 text-[13.5px] text-muted">Choose one, or both.</p>
        <div role="group" aria-label="What you want to do" className="grid gap-4 min-[761px]:grid-cols-2">
          {choices.map((c) => {
            const on = caps.includes(c.value);
            const already = forced === "live" && taken(c.value);
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={on}
                disabled={already}
                onClick={() => set("caps", on ? draft.caps.filter((x) => x !== c.value) : [...draft.caps.filter((x) => x !== c.value), c.value])}
                className="flex flex-col gap-2 rounded-[16px] border p-5 text-left transition-colors duration-150 disabled:cursor-not-allowed"
                style={{
                  borderColor: on ? "var(--accent)" : "var(--border-grid)",
                  background: on ? "var(--ndi-mint-04)" : "transparent",
                }}
              >
                <span className="flex items-center gap-2.5">
                  <Icon name={c.icon} size={18} strokeWidth={1.8} className="text-accent" />
                  <span className="font-display text-[16px] font-semibold text-strong">{c.title}</span>
                  {on ? <Icon name="check" size={15} strokeWidth={2.4} className="ml-auto text-accent" /> : null}
                </span>
                <span className="text-[13.5px] leading-[1.55] text-muted">{c.text}</span>
                {already ? (
                  <span className="text-[13px] leading-[1.55] text-body">
                    You&rsquo;ve already asked for this.{" "}
                    <Link href="/verify-or-issue" className="ndi-plainlink font-medium text-accent">
                      Here&rsquo;s where it stands.
                    </Link>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {face === "step_up" ? (
          <Panel>
            <WalletHandoff
              value="ndi-acc-step-up"
              title={`${VERIFICATION_ORG_NAME} is asking who you are`}
              purpose="Confirm with your NDI wallet. It's been a while since you last did, and this is sent in your name."
              sharing={["Your identity, from your citizen credential"]}
              notSharing={["Anything else in your wallet"]}
              status={stepUp}
              onSimulateScan={() => {
                setStepUp("waiting");
                window.setTimeout(() => setStepUp("awaiting_scan"), WALLET_HANDOFF_MS);
              }}
            />
          </Panel>
        ) : null}

        {caps.length ? (
          <Panel>
            <form
              className="relative z-[4] flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (ready && !busy) send();
              }}
            >
              {verifying ? (
                <section className="flex flex-col gap-4" aria-label="Verify customers">
                  {issuing ? <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Verify customers</h2> : null}
                  <div className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>What you&rsquo;ll ask customers for</span>
                    <p className="m-0 text-[13px] leading-[1.6] text-muted">
                      Ask only for what you need. NDI checks this, and your customers will see what you ask for.
                    </p>
                    <ItemChooser value={draft.ask} onChange={(v) => set("ask", v)} />
                  </div>
                  <label className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>What it&rsquo;s for</span>
                    <textarea
                      className={`${FIELD_CLASS} resize-y py-3`}
                      rows={2}
                      value={draft.verifyPurpose}
                      onChange={(e) => set("verifyPurpose", e.target.value)}
                      placeholder="For example: checking customers are over 18 before selling tobacco"
                    />
                  </label>
                  <p className="m-0 text-[13.5px] leading-[1.6] text-body">{scopeSentence(short, "verifier", draft.ask, [])}</p>
                </section>
              ) : null}

              {issuing ? (
                <section className={`flex flex-col gap-4 ${verifying ? "border-t border-subtle pt-5" : ""}`} aria-label="Issue credentials">
                  {verifying ? <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Issue credentials</h2> : null}
                  <div className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>What you&rsquo;ll issue</span>
                    <IssueTypesEditor value={draft.issue} onChange={(v) => set("issue", v)} />
                  </div>
                  <label className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>What it&rsquo;s for</span>
                    <textarea
                      className={`${FIELD_CLASS} resize-y py-3`}
                      rows={2}
                      value={draft.issuePurpose}
                      onChange={(e) => set("issuePurpose", e.target.value)}
                      placeholder="For example: certificates for people who finish our safety course"
                    />
                  </label>
                  <LegalBasisFields
                    basis={draft.legalBasis}
                    reference={draft.legalBasisRef}
                    onBasis={(v) => set("legalBasis", v)}
                    onReference={(v) => set("legalBasisRef", v)}
                  />
                  <p className="m-0 text-[13.5px] leading-[1.6] text-body">{scopeSentence(short, "issuer", [], draft.issue)}</p>
                </section>
              ) : null}

              <div className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3.5" style={{ background: "rgb(var(--tint) / 0.03)" }} aria-live="polite">
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  NDI checks that {short} is verified, that what you&rsquo;ve said it&rsquo;s for is specific, and that
                  you&rsquo;re asking for no more than that needs
                  {issuing ? ", and that your legal basis covers what you'll issue" : ""}. It aims to decide within 10 working
                  days{verifying && issuing ? ", and decides verifying and issuing each on its own" : ""}.
                </p>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                  If NDI approves, {short} is added to NDI&rsquo;s public list of trusted organisations.
                </p>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                  NDI will approve or decline this as you&rsquo;ve written it. They won&rsquo;t change it.
                </p>
              </div>

              {face === "error" && outcome === "E6" ? (
                <p role="alert" className="m-0 text-[13.5px] text-body">
                  We couldn&rsquo;t set up what your organisation needs to be listed. Nothing has been sent — try again.
                </p>
              ) : face === "error" ? (
                <p role="status" className="m-0 text-[13px] text-muted">
                  (Sending will fail here, to show what that looks like.)
                </p>
              ) : null}
              {outcome === "invalid" ? (
                <p role="alert" className="m-0 text-[13.5px] text-body">
                  Something&rsquo;s missing: for each thing you&rsquo;re asking for, what it&rsquo;s for and at least one item
                  {issuing ? ", and for issuing, your legal basis" : ""}. Nothing has been sent.
                </p>
              ) : null}
              {face === "offline" ? (
                <p role="status" className="m-0 text-[13.5px] text-body">
                  {outcome === "offline"
                    ? "You're offline. Nothing has been sent, and what you entered is still here — try again when you're back."
                    : "You're offline. You can keep writing; sending waits until you're back."}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2.5">
                <GradientButton type="submit" disabled={!ready || Boolean(busy) || face === "step_up"}>
                  {face === "error" && outcome === "E6" ? "Try again" : "Send to NDI"}
                </GradientButton>
                <HairlineButton
                  onClick={() => {
                    try {
                      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                      setSaved(true);
                    } catch {
                      /* Storage unavailable: nothing saved. */
                    }
                  }}
                >
                  Save and resume later
                </HairlineButton>
                <HairlineButton onClick={() => router.push("/verify-or-issue")}>Cancel</HairlineButton>
                {saved ? (
                  <span role="status" className="text-[12.5px] text-muted">
                    Saved in this browser.
                  </span>
                ) : null}
              </div>
            </form>
          </Panel>
        ) : null}
      </div>
    </AppShell>
  );
}
