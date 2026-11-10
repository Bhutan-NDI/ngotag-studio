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
}: {
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
  const [screen, setScreen] = useState<"scan" | "request" | "done">("scan");
  const timer = useRef<number | null>(null);
  useEffect(() => () => (timer.current ? window.clearTimeout(timer.current) : undefined), []);

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
          <StatusBar />
          {screen === "scan" ? (
            <ScanScreen onScan={() => setScreen("request")} />
          ) : screen === "request" ? (
            <RequestScreen
              from={from}
              mark={mark}
              markColor={markColor}
              ask={ask}
              fields={fields}
              answer={answer}
              onAnswer={confirm}
              onDecline={() => {
                setScreen("scan");
                onDecline();
              }}
              onBack={() => setScreen("scan")}
            />
          ) : (
            <DoneScreen title={done.title} detail={done.detail} />
          )}
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
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[18px] pb-2 [scrollbar-width:none]">
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
