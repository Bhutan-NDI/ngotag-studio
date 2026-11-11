"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The Bhutan NDI app, on the phone of the person answering — drawn after the
 * app's own request screen ("Notification-Detailed" in the New Bhutan NDI
 * App design file) so the room sees what the person sees: who is asking,
 * each item with the credential it comes from, and Decline or the answer.
 *
 * The app has no screen for a credential offer, so an offer uses the same
 * request screen with "would like to issue you" and Accept.
 *
 * It stands in for the scan. It starts on the app's scan step; a tap opens
 * the request, the answer shows the app's confirmation, and only then does
 * the page move on — so the hand-off reads in order: scan, read, answer.
 * Something sent to the app without a scan (an offer after the person has
 * shown who they are) starts on the request itself: `arrived`.
 *
 * ONE PHONE, SEVERAL REQUESTS
 *
 * The same phone can carry on to the next request without moving: while
 * the page checks an answer it shows `waiting`, and when the request
 * changes (`requestKey`) the new one slides in, under the app's own
 * notification (`banner`). So Pema shares her ID and, in the same place,
 * her phone moves on to the offer — the page around it stays still.
 *
 * The screen is the app's, so it keeps the app's light palette in both
 * themes. It is labelled as a simulation under the frame.
 */
export interface PhoneField {
  label: string;
  value: string;
  /** The credential it comes from, as a small badge at the field's end. */
  source?: { mark: ReactNode; color: string };
  /** Several to choose from: the field cycles through them when tapped. */
  choices?: { key: string; value: string }[];
  onChoose?: (key: string) => void;
}

const APP = {
  paper: "#fffcf8",
  ink: "#3a3a3a",
  muted: "#8a8a8a",
  line: "#9a9a9a",
  mint: "#5ac994",
  back: "#2f4c52",
} as const;

export function NdiAppPhone({
  owner,
  from,
  mark,
  markColor,
  ask,
  fields,
  answer,
  done,
  onAnswer,
  onDecline,
  note,
  arrived = false,
  requestKey = "request",
  waiting,
  banner,
}: {
  /** Already in the app — sent there, not scanned: no scan step. */
  arrived?: boolean;
  /** Which request this is. A new key slides the new request in. */
  requestKey?: string;
  /** Shown while the page works on the last answer. */
  waiting?: { title: string; detail: string };
  /** The app's notification as a new request arrives. */
  banner?: string;
  /** Whose phone: "Pema Choden's phone". */
  owner: string;
  /** Who is asking, as the app names them. */
  from: string;
  /** The asker's logo disc: an image or initials. */
  mark: ReactNode;
  markColor: string;
  /** "share" for a proof request, "issue" for an offer. */
  ask: "share" | "issue";
  fields: PhoneField[];
  /** The button: "Share", "Accept". */
  answer: string;
  /** The app's confirmation, shown before the page moves on. */
  done: { title: string; detail: string };
  onAnswer: () => void;
  onDecline: () => void;
  /** A line under the frame, beside the simulation label. */
  note?: string;
}) {
  const start = arrived ? "request" : "scan";
  const [screen, setScreen] = useState<"scan" | "request" | "done">(start);
  /* A new request arrives: the phone moves to it, announced. Adjusted
     during render, so the new screen and its banner come in together. */
  const [seenKey, setSeenKey] = useState(requestKey);
  const [news, setNews] = useState(false);
  if (requestKey !== seenKey) {
    setSeenKey(requestKey);
    setScreen("request");
    setNews(true);
  }
  const timer = useRef<number | null>(null);
  useEffect(() => () => (timer.current ? window.clearTimeout(timer.current) : undefined), []);
  useEffect(() => {
    if (!news) return;
    const t = window.setTimeout(() => setNews(false), 2600);
    return () => window.clearTimeout(t);
  }, [news]);
  const face = waiting && screen === "done" ? "waiting" : screen;

  const confirm = () => {
    setScreen("done");
    timer.current = window.setTimeout(onAnswer, 1400);
  };

  return (
    <figure className="m-0 flex flex-col items-center gap-2.5">
      <div
        className="relative w-[288px] rounded-[44px] p-[10px] shadow-[0_18px_40px_rgb(0_0_0/0.22)]"
        style={{ background: "#16191b" }}
        aria-label={`${owner}: the Bhutan NDI app, simulated`}
        role="group"
      >
        <div
          className="relative flex h-[560px] flex-col overflow-hidden rounded-[34px]"
          style={{ background: APP.paper, color: APP.ink, fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
        >
          <style>{PHONE_MOTION}</style>
          <StatusBar />
          {banner && news ? <Banner text={banner} /> : null}
          <div
            key={`${face}-${seenKey}`}
            className={`flex min-h-0 flex-1 flex-col ${face === "request" && news ? "ndi-phone-slide" : "ndi-phone-fade"}`}
          >
          {face === "scan" ? (
            <ScanScreen onScan={() => setScreen("request")} />
          ) : face === "waiting" && waiting ? (
            <WaitingScreen title={waiting.title} detail={waiting.detail} />
          ) : face === "request" ? (
            <RequestScreen
              from={from}
              mark={mark}
              markColor={markColor}
              ask={ask}
              fields={fields}
              answer={answer}
              onAnswer={confirm}
              onDecline={() => {
                setScreen(start);
                onDecline();
              }}
              onBack={() => setScreen(start)}
            />
          ) : (
            <DoneScreen title={done.title} detail={done.detail} />
          )}
          </div>
        </div>
      </div>
      <figcaption className="flex max-w-[300px] flex-col items-center gap-1 text-center">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--ndi-warning)" }} />
          Prototype · {owner}
        </span>
        <span className="text-[11.5px] leading-[1.45] text-faint">
          {note ?? "The Bhutan NDI app, simulated. Tap through it to answer."}
        </span>
      </figcaption>
    </figure>
  );
}

/** One credential in the app's list. */
export interface WalletCard {
  key: string;
  title: string;
  /** "Self Attested", or who it's for. */
  subtitle?: string;
  /** Issued and verified (dark card, shield) or self-attested (teal card, NDI mark). */
  verified: boolean;
  /** The logo disc; self-attested cards use NDI's mark. */
  mark?: ReactNode;
  markColor?: string;
  /** Just arrived: marked, and drawn in. */
  isNew?: boolean;
}

/**
 * The Bhutan NDI app's Credentials tab ("Creds-All" in the New Bhutan NDI
 * App design file), on the same phone: what the person holds once they
 * have accepted something. Read-only — it shows where the credential went.
 */
export function NdiWalletPhone({ owner, cards, note }: { owner: string; cards: WalletCard[]; note?: string }) {
  const sorted = [...cards].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <figure className="m-0 flex flex-col items-center gap-2.5">
      <div
        className="relative w-[288px] rounded-[44px] p-[10px] shadow-[0_18px_40px_rgb(0_0_0/0.22)]"
        style={{ background: "#16191b" }}
        aria-label={`${owner}: the Bhutan NDI app's credentials, simulated`}
        role="group"
      >
        <div
          className="relative flex h-[560px] flex-col overflow-hidden rounded-[34px]"
          style={{ background: APP.paper, color: APP.ink, fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
        >
          <style>{PHONE_MOTION}</style>
          <StatusBar />
          {/* Search, the title, add */}
          <div className="flex flex-none items-center justify-between px-4 pb-2 pt-1">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke={APP.mint} strokeWidth="2.4" strokeLinecap="round">
              <circle cx="8.5" cy="8.5" r="6" />
              <path d="m13 13 5 5" />
            </svg>
            <span className="text-[15px] font-bold" style={{ color: "#1d1d1d" }}>
              Credentials
            </span>
            <span aria-hidden="true" className="flex h-[20px] w-[20px] items-center justify-center rounded-full" style={{ background: APP.mint }}>
              <svg viewBox="0 0 12 12" className="h-[10px] w-[10px]" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 1.5v9M1.5 6h9" />
              </svg>
            </span>
          </div>
          {/* Filters */}
          <div aria-hidden="true" className="flex flex-none gap-1.5 overflow-hidden px-4 pb-2.5">
            {["All", "Active", "Self Attested", "Suspended", "Revoked"].map((c, i) => (
              <span
                key={c}
                className="flex-none whitespace-nowrap rounded-full px-2.5 py-[3px] text-[10.5px] font-medium"
                style={i === 0 ? { background: APP.mint, color: "#fff" } : { background: "#e2f2e9", color: "#5d6b64" }}
              >
                {c}
              </span>
            ))}
          </div>
          {/* The list, with the app's A–Z index beside it */}
          <div className="relative flex min-h-0 flex-1">
            <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 overflow-y-auto py-0.5 pb-[84px] pl-3 pr-1" style={{ scrollbarWidth: "none" }}>
              {sorted.map((c) => (
                <li
                  key={c.key}
                  className={`relative flex h-[56px] flex-none items-center gap-3 rounded-[8px] px-3 ${c.isNew ? "ndi-phone-slide" : ""}`}
                  style={{
                    background: c.verified ? "#1b1e29" : "#16423d",
                    boxShadow: c.isNew ? `0 0 0 2px ${APP.mint}` : undefined,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-[36px] w-[36px] flex-none items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-white"
                    style={{ background: c.verified ? (c.markColor ?? "#2f6f5e") : "transparent" }}
                  >
                    {c.verified ? c.mark : <img src="/media/logos/ndi-mark-mint.png" alt="" width={32} height={32} className="h-8 w-8" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[12.5px] font-semibold text-white">{c.title}</span>
                    {c.subtitle ? <span className="truncate text-[9.5px] text-white/70">{c.subtitle}</span> : null}
                  </span>
                  <span aria-hidden="true" className="flex flex-none flex-col items-end gap-1">
                    {c.verified ? (
                      <svg viewBox="0 0 16 18" className="h-[13px] w-[12px]">
                        <path d="M8 1 2 3.5v4.6c0 4 2.6 7.3 6 8.4 3.4-1.1 6-4.4 6-8.4V3.5Z" fill={APP.mint} />
                        <path d="m5.3 9 1.9 1.9 3.6-3.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                    <svg viewBox="0 0 20 18" className="h-[13px] w-[14px]" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
                      <path d="M10 16.5S2 11.7 2 6.3A4.2 4.2 0 0 1 10 4a4.2 4.2 0 0 1 8 2.3c0 5.4-8 10.2-8 10.2Z" />
                    </svg>
                  </span>
                  {c.isNew ? (
                    <span className="absolute -top-[7px] left-3 rounded-full px-1.5 py-[1px] text-[8.5px] font-bold uppercase tracking-[0.06em] text-white" style={{ background: APP.mint }}>
                      New
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            <span aria-hidden="true" className="flex w-[14px] flex-none flex-col items-center pr-1 text-[7.5px] leading-[1.28]" style={{ color: "#5d6b64" }}>
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
          </div>
          {/* The app's tab bar, with Scan raised in the middle */}
          <div aria-hidden="true" className="absolute inset-x-2.5 bottom-3 flex h-[52px] items-end justify-between rounded-[14px] px-3 pb-1.5" style={{ background: "#1d2427" }}>
            {[
              { label: "Home", d: "M3 9.5 10 3l7 6.5V17h-4.5v-4.5h-5V17H3Z" },
              { label: "Credentials", d: "M2.5 5h15v10h-15Zm0 3.5h15", active: true },
              { label: "Scan", scan: true },
              { label: "Chat", d: "M3 4h14v9H8l-4 3.5V13H3Z" },
              { label: "More", d: "M3 5h14M3 10h14M3 15h14" },
            ].map((t) =>
              t.scan ? (
                <span key={t.label} className="relative flex w-[44px] flex-col items-center">
                  <span className="absolute -top-[40px] flex h-[42px] w-[42px] items-center justify-center rounded-full border-[3px]" style={{ background: APP.mint, borderColor: APP.paper }}>
                    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                      <path d="M2 6V3.5A1.5 1.5 0 0 1 3.5 2H6M14 2h2.5A1.5 1.5 0 0 1 18 3.5V6M18 14v2.5a1.5 1.5 0 0 1-1.5 1.5H14M6 18H3.5A1.5 1.5 0 0 1 2 16.5V14M6 10h8" />
                    </svg>
                  </span>
                  <span className="text-[8.5px] text-white">{t.label}</span>
                </span>
              ) : (
                <span key={t.label} className="flex w-[44px] flex-col items-center gap-0.5">
                  <svg viewBox="0 0 20 20" className="h-[16px] w-[16px]" fill="none" stroke={t.active ? APP.mint : "#fff"} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                    <path d={t.d} />
                  </svg>
                  <span className="text-[8.5px]" style={{ color: t.active ? APP.mint : "#fff" }}>
                    {t.label}
                  </span>
                </span>
              ),
            )}
          </div>
        </div>
      </div>
      <figcaption className="flex max-w-[300px] flex-col items-center gap-1 text-center">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--ndi-warning)" }} />
          Prototype · {owner}
        </span>
        <span className="text-[11.5px] leading-[1.45] text-faint">{note ?? "The Bhutan NDI app's credentials, simulated."}</span>
      </figcaption>
    </figure>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[38px] flex-none items-center justify-between px-6 pt-1 text-[13px] font-semibold" style={{ color: "#111" }}>
      <span>9:41</span>
      <span aria-hidden="true" className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-[10px] w-[16px]" fill="#111">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[10px] w-[14px]" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round">
          <path d="M1.5 4.2a9.5 9.5 0 0 1 13 0M4 7a6 6 0 0 1 8 0" />
          <circle cx="8" cy="10" r="1" fill="#111" stroke="none" />
        </svg>
        <span className="relative inline-flex h-[11px] w-[22px] items-center rounded-[3px] border border-[#111] p-[1.5px]">
          <span className="h-full w-full rounded-[1.5px] bg-[#111]" />
        </span>
      </span>
    </div>
  );
}

function ScanScreen({ onScan }: { onScan: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-8 text-center">
      <div className="relative h-[150px] w-[150px]">
        {(["left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-[14px]", "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-[14px]", "left-0 bottom-0 border-b-[3px] border-l-[3px] rounded-bl-[14px]", "right-0 bottom-0 border-b-[3px] border-r-[3px] rounded-br-[14px]"] as const).map((c) => (
          <span key={c} aria-hidden="true" className={`absolute h-9 w-9 ${c}`} style={{ borderColor: APP.mint }} />
        ))}
        <img src="/media/logos/ndi-mark-mint.png" alt="" width={44} height={44} className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 opacity-80" />
      </div>
      <p className="m-0 text-[14px] leading-[1.45]" style={{ color: APP.ink }}>
        Point the camera at the code on the screen
      </p>
      <button
        type="button"
        onClick={onScan}
        className="h-11 w-full max-w-[200px] rounded-[8px] text-[14px] font-semibold text-white"
        style={{ background: APP.mint }}
      >
        Scan the code
      </button>
    </div>
  );
}

function RequestScreen({
  from,
  mark,
  markColor,
  ask,
  fields,
  answer,
  onAnswer,
  onDecline,
  onBack,
}: {
  from: string;
  mark: ReactNode;
  markColor: string;
  ask: "share" | "issue";
  fields: PhoneField[];
  answer: string;
  onAnswer: () => void;
  onDecline: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-none px-4 pt-2">
        <button type="button" onClick={onBack} aria-label="Back" className="-ml-1 flex h-8 w-8 items-center justify-center">
          <svg viewBox="0 0 12 20" className="h-[16px] w-[10px]" fill="none" stroke={APP.back} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2 2 10l8 8" />
          </svg>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[18px] pb-2" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col items-center gap-3.5 pt-1 text-center">
          <span
            aria-hidden="true"
            className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full text-[17px] font-bold text-white"
            style={{ background: markColor }}
          >
            {mark}
          </span>
          <p className="m-0 text-[13.5px] leading-[1.4]" style={{ color: APP.ink }}>
            {from} would like to {ask === "share" ? "request you to share the following data" : "issue you the following credential"}
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {fields.map((f) => (
            <Field key={f.label} f={f} />
          ))}
        </div>
      </div>
      <div className="flex flex-none gap-3 px-[18px] pb-6 pt-3">
        <button
          type="button"
          onClick={onDecline}
          className="h-10 flex-1 rounded-[6px] border text-[13.5px] font-medium"
          style={{ borderColor: APP.mint, color: APP.mint, background: "#fff" }}
        >
          Decline
        </button>
        <button type="button" onClick={onAnswer} className="h-10 flex-1 rounded-[6px] text-[13.5px] font-medium text-white" style={{ background: APP.mint }}>
          {answer}
        </button>
      </div>
    </div>
  );
}

function Field({ f }: { f: PhoneField }) {
  const many = f.choices && f.choices.length > 1;
  const at = many ? Math.max(0, f.choices!.findIndex((c) => c.value === f.value)) : 0;
  const body = (
    <>
      <span className="absolute -top-[7px] left-2.5 px-1 text-[9.5px] leading-none" style={{ background: APP.paper, color: APP.muted }}>
        {f.label}
      </span>
      <span className="min-w-0 flex-1 text-left text-[12.5px] leading-[1.35]" style={{ color: APP.muted }}>
        {f.value}
      </span>
      {f.source ? (
        <span
          aria-hidden="true"
          className="flex h-[20px] w-[20px] flex-none items-center justify-center rounded-full text-[8px] font-bold text-white"
          style={{ background: f.source.color }}
        >
          {f.source.mark}
        </span>
      ) : null}
      {many ? (
        <svg aria-hidden="true" viewBox="0 0 8 14" className="h-[11px] w-[7px] flex-none" fill="none" stroke={APP.muted} strokeWidth="1.8" strokeLinecap="round">
          <path d="m1 1 6 6-6 6" />
        </svg>
      ) : null}
    </>
  );
  const box = "relative flex min-h-[40px] w-full items-center gap-2 rounded-[7px] border px-3 py-2";
  if (many)
    return (
      <button
        type="button"
        className={box}
        style={{ borderColor: APP.line }}
        aria-label={`${f.label}: ${f.value}. Tap for the next one`}
        onClick={() => f.onChoose?.(f.choices![(at + 1) % f.choices!.length].key)}
      >
        {body}
      </button>
    );
  return (
    <div className={box} style={{ borderColor: APP.line }}>
      {body}
    </div>
  );
}

function DoneScreen({ title, detail }: { title: string; detail: string }) {
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 px-7 pb-10 text-center">
      <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full" style={{ background: APP.mint }}>
        <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      <p className="m-0 text-[16px] font-semibold" style={{ color: APP.ink }}>
        {title}
      </p>
      <p className="m-0 text-[12.5px] leading-[1.5]" style={{ color: APP.muted }}>
        {detail}
      </p>
    </div>
  );
}

/* Screens change inside the phone: a fade within one request, a slide
   from the right for a new one, and the app's notification dropping in
   from the top. None of it moves under reduced motion. */
const PHONE_MOTION = `
@keyframes ndi-phone-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes ndi-phone-slide { from { opacity: 0.4; transform: translateX(100%); } to { opacity: 1; transform: none; } }
@keyframes ndi-phone-banner { 0% { opacity: 0; transform: translateY(-120%); } 12% { opacity: 1; transform: none; } 85% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-120%); } }
.ndi-phone-fade { animation: ndi-phone-fade 260ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.ndi-phone-slide { animation: ndi-phone-slide 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.ndi-phone-banner { animation: ndi-phone-banner 2600ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .ndi-phone-fade, .ndi-phone-slide { animation: none; }
  .ndi-phone-banner { animation: none; }
}
`;

function Banner({ text }: { text: string }) {
  return (
    <div
      role="status"
      className="ndi-phone-banner absolute inset-x-2.5 top-[40px] z-10 flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 shadow-[0_6px_18px_rgb(0_0_0/0.18)]"
      style={{ background: "rgba(255,255,255,0.97)", color: APP.ink }}
    >
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[7px]" style={{ background: "#16302f" }}>
        <img src="/media/logos/ndi-mark-mint.png" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: APP.muted }}>
          Bhutan NDI · now
        </span>
        <span className="text-[12px] font-medium leading-[1.3]">{text}</span>
      </span>
    </div>
  );
}

function WaitingScreen({ title, detail }: { title: string; detail: string }) {
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 px-7 pb-10 text-center">
      <span
        aria-hidden="true"
        className="h-12 w-12 animate-spin rounded-full border-[3px]"
        style={{ borderColor: `${APP.mint}33`, borderTopColor: APP.mint }}
      />
      <p className="m-0 text-[15px] font-semibold" style={{ color: APP.ink }}>
        {title}
      </p>
      <p className="m-0 text-[12.5px] leading-[1.5]" style={{ color: APP.muted }}>
        {detail}
      </p>
    </div>
  );
}
