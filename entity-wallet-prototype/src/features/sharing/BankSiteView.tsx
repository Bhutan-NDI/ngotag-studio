"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { attrLabel } from "./shared";
import { useDemo } from "@/lib/demoStore";
import { sessionStatusOf } from "@/lib/sharing";

/**
 * Partner Bank's website — simulated, and drawn as the bank's own site.
 *
 * WHY IT EXISTS
 *
 * FLOW-PRS-01 starts and ends on someone else's website, and the person's
 * first and last impressions of the flow are there (UX-EW-04 §0.2). UX-EW-04
 * §4.1 makes a mock bank page part of the evaluation instrument, built to
 * EW-FLOW7-VIG §5, so this follows the guide: the button labelled *Share
 * from NDI Entity Wallet*, a line saying the customer will leave to sign in
 * with Bhutan NDI and come back, the application number on the page —
 * which the wallet will show as the bank's reference — and a session
 * created when the button is pressed, not when the page loads.
 *
 * WHY IT LOOKS NOTHING LIKE THE WALLET
 *
 * It used to be a dashed panel inside the Entity Wallet's own chrome, and
 * in front of an audience that read as one more wallet screen. The point
 * of the flow is the hand-off between two organisations' systems, so the
 * bank's page now looks like a bank's: a mark of its own, white and a
 * navy, its own type, and none of the wallet's dark glass. The bank is a
 * made-up one, Partner Bank, with no real bank's name, logo or colours, so
 * the same story can be shown to any bank. It ignores the
 * wallet's theme for the same reason. The strip across the top still says
 * it is a stand-in, so nobody takes it for the bank's real site.
 *
 * THE RETURN PAGE ACTS ON WHAT ITS BACK END FETCHED
 *
 * The address it comes back to carries `status`, which anyone can type.
 * The page checks the returned session and state match the application,
 * fetches the session by the id it stored, and shows what the *fetched*
 * status means, in the guide's words (§5.2) — including "We're waiting for
 * your organisation to finish sharing", never "we have it", for PENDING
 * (UC-35).
 *
 * Everything below the strip is the bank's, not NDI's; the what's-real
 * page lists it.
 */
const BANK_BLUE = "#2c5a8c";
const INK = "#16191d";
const MUTED = "#5b6670";
const LINE = "#dfe6ec";

const STEPS = ["Business type", "Company details", "Signatories", "Review"];

export function BankSiteView({ mode, session: returnedSession, state: returnedState, status: returnedStatus }: {
  mode: "start" | "return";
  session?: string | null;
  state?: string | null;
  status?: string | null;
}) {
  const router = useRouter();
  const { presentationSessions, presentationRequests, heldCredentials, startPresentationSession, hydrated } = useDemo();
  /* The application number the bank shows beside its button, and passes as
     the session's displayReference. */
  const [reference, setReference] = useState("");
  /* Made after mount: a random number in the server's HTML would never
     match the browser's. */
  useEffect(() => setReference(`EKYB-${20400 + Math.floor(Math.random() * 500)}`), []);

  const start = () => {
    if (!reference) return;
    const id = startPresentationSession("org-bob", reference);
    if (id) router.push(`/present?session=${id}`);
  };

  const session = presentationSessions.find((x) => x.id === returnedSession);
  const request = presentationRequests.find((x) => x.id === session?.requestId);
  /* §5.2 step 1 — both returned values must match the application. */
  const matches = Boolean(session && returnedState && session.state === returnedState);
  const fetched = session ? sessionStatusOf(session, request) : null;

  const message: Record<string, string> = {
    SHARED: "Thank you. We've received and verified your company's details.",
    PENDING: "We're waiting for your organisation to finish sharing. We'll continue as soon as it arrives.",
    CREATED: "We haven't received your details yet.",
    OPENED: "We haven't received your details yet.",
    /* EW-FLOW7-VIG v0.2 §5.2: the session doesn't say whether a person
       declined or the request was blocked, so nothing suggests trying again. */
    DECLINED: "We didn't receive your details. You can provide them another way.",
    EXPIRED: "That didn't complete. You can try again.",
    FAILED: "That didn't complete. You can try again.",
  };
  const tone = fetched === "SHARED" ? "#e7f6ee" : fetched === "PENDING" ? "#fff6e0" : "#f1f4f7";
  const toneLine = fetched === "SHARED" ? "#9fd8b7" : fetched === "PENDING" ? "#f0d18a" : LINE;

  const shared = fetched === "SHARED" && request?.chosen
    ? Object.values(request.chosen).map((id) => heldCredentials.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c))
    : [];

  /* Step 2 while filling in; on return the details step is done. */
  const current = mode === "start" || fetched !== "SHARED" ? 1 : 2;

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: "#f3f7fa", color: INK, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', colorScheme: "light" }}
    >
      {/* ---- The disclosure: this is a stand-in ---- */}
      <div
        className="flex items-center justify-center gap-2 border-b border-dashed px-4 py-1.5 text-center font-mono text-[10.5px] uppercase tracking-[0.12em]"
        style={{ background: "#fff8e6", borderColor: "#e6c470", color: "#7a5a12" }}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: "#e0a100" }} />
        Prototype · stands in for Partner Bank&rsquo;s website — another organisation&rsquo;s system
      </div>

      {/* ---- The bank's header ---- */}
      <header className="border-b bg-white" style={{ borderColor: LINE }}>
        <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between gap-4 px-4 py-3 min-[641px]:px-6">
          {/* A generic mark: a made-up bank, so no real bank's logo. */}
          <span className="flex items-center gap-2.5">
            <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
              <rect width="40" height="40" rx="10" fill={BANK_BLUE} />
              <path d="M20 9 L31 15 H9 Z" fill="#fff" />
              <rect x="11" y="17" width="3" height="10" fill="#fff" />
              <rect x="18.5" y="17" width="3" height="10" fill="#fff" />
              <rect x="26" y="17" width="3" height="10" fill="#fff" />
              <rect x="9" y="28.5" width="22" height="2.5" fill="#fff" />
            </svg>
            <span className="text-[19px] font-bold tracking-[-0.01em]" style={{ color: INK }}>
              Partner Bank
            </span>
          </span>
          <nav aria-label="Partner Bank" className="hidden items-center gap-6 text-[13.5px] min-[641px]:flex" style={{ color: MUTED }}>
            <span>Personal</span>
            <span style={{ color: INK, fontWeight: 600 }}>Business</span>
            <span>About us</span>
            <span className="rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold" style={{ borderColor: BANK_BLUE, color: BANK_BLUE }}>
              Internet banking
            </span>
          </nav>
        </div>
      </header>

      {/* ---- The application's band ---- */}
      <section style={{ background: BANK_BLUE, color: "#fff" }}>
        <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-4 px-4 py-7 min-[641px]:px-6">
          <div className="flex flex-col gap-1">
            <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.14em] opacity-85">Business banking</p>
            <h1 className="m-0 text-[26px] font-bold leading-[1.2]">Open a business current account</h1>
          </div>
          <ol className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[13px]">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-2" style={{ opacity: i <= current ? 1 : 0.7 }}>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold"
                  style={
                    i < current
                      ? { background: "#fff", color: BANK_BLUE }
                      : i === current
                        ? { background: INK, color: "#fff" }
                        : { border: "1.5px solid rgba(255,255,255,0.8)", color: "#fff" }
                  }
                >
                  {i < current ? "✓" : i + 1}
                </span>
                <span style={{ fontWeight: i === current ? 700 : 400 }}>{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- The page ---- */}
      <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col gap-5 px-4 py-8 min-[641px]:px-6">
        <div className="flex max-w-[640px] flex-col gap-4 rounded-[8px] border bg-white p-6" style={{ borderColor: LINE, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" }}>
          {mode === "start" ? (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="m-0 text-[19px] font-bold">Your company&rsquo;s details</h2>
                <p className="m-0 text-[13.5px]" style={{ color: MUTED }}>
                  Application number <span className="font-mono font-semibold" style={{ color: INK }}>{reference}</span>
                </p>
              </div>
              <p className="m-0 text-[14px] leading-[1.6]">
                Share your company&rsquo;s registration and taxpayer number (TPN) from its NDI Entity Wallet instead of uploading certified copies.
                You&rsquo;ll leave our site to sign in with Bhutan NDI, and come back here. The wallet will show this application
                number — check it matches.
              </p>
              <div>
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex h-12 items-center gap-2.5 rounded-[6px] px-5 text-[14.5px] font-semibold text-white"
                  /* NDI's own button on the bank's page, in NDI's deep green — the
                     same on every site that offers it, so it reads as NDI's. */
                  style={{ background: "#124143", boxShadow: "0 2px 6px rgba(18,65,67,0.35)" }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "#124143" }}>
                    <img src="/media/logos/ndi-mark-mint.png" alt="" width={20} height={20} className="h-5 w-5" />
                  </span>
                  Share from NDI Entity Wallet
                </button>
              </div>
              <p className="m-0 border-t pt-3 text-[12.5px]" style={{ borderColor: LINE, color: MUTED }}>
                Prefer paper? Bring certified copies of your company&rsquo;s registration and TPN certificate to any branch.
              </p>
            </>
          ) : !hydrated ? null : !session || !matches ? (
            <>
              <h2 className="m-0 text-[19px] font-bold">We couldn&rsquo;t use this</h2>
              <p className="m-0 text-[14px] leading-[1.6]">
                We couldn&rsquo;t match this to your application, so we haven&rsquo;t used it. Please start again from your
                application.
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="m-0 text-[19px] font-bold">Your company&rsquo;s details</h2>
                <p className="m-0 text-[13.5px]" style={{ color: MUTED }}>
                  Application number <span className="font-mono font-semibold" style={{ color: INK }}>{session.displayReference}</span>
                </p>
              </div>
              <p role="status" className="m-0 rounded-[6px] border px-4 py-3 text-[14.5px] font-semibold leading-[1.55]" style={{ background: tone, borderColor: toneLine }}>
                {message[fetched ?? "FAILED"]}
              </p>
              {shared.length ? (
                <dl className="m-0 flex flex-col gap-1.5 text-[13.5px]">
                  {/* Each detail once: the registration and the TPN both
                      carry the registered name. */}
                  {shared
                    .flatMap((c) => c.attributes.filter((a) => ["registered_name", "registration_number", "status", "tpn"].includes(a.name)).map((a) => ({ c, a })))
                    .filter(({ a }, i, all) => all.findIndex((x) => x.a.name === a.name) === i)
                    .map(({ c, a }) => (
                      <div key={`${c.id}-${a.name}`} className="flex flex-wrap gap-2">
                        <dt className="min-w-[150px]" style={{ color: MUTED }}>{attrLabel(a.name)}</dt>
                        <dd className="m-0 font-semibold">{a.value}</dd>
                      </div>
                    ))}
                  <div className="flex flex-wrap gap-2">
                    <dt className="min-w-[150px]" style={{ color: MUTED }}>Checked</dt>
                    <dd className="m-0">Signature, holder and issuer on NDI&rsquo;s list — all passed</dd>
                  </div>
                </dl>
              ) : null}
              <p className="m-0 text-[12px]" style={{ color: MUTED }}>
                The address said <span className="font-mono">status={returnedStatus ?? "—"}</span>; the bank acts only on what its own
                system fetched: <span className="font-mono">{fetched}</span>.
              </p>
            </>
          )}
          {mode === "return" ? (
            <div>
              <button
                type="button"
                onClick={() => router.push("/simulated/bank")}
                className="inline-flex h-11 items-center rounded-[6px] border-2 px-4 text-[14px] font-semibold"
                style={{ borderColor: BANK_BLUE, color: BANK_BLUE, background: "#fff" }}
              >
                Start a new application
              </button>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="border-t bg-white" style={{ borderColor: LINE }}>
        <p className="mx-auto m-0 w-full max-w-[1040px] px-4 py-4 text-[12px] min-[641px]:px-6" style={{ color: MUTED }}>
          Partner Bank · A DHI company — simulated for the NDI Entity Wallet prototype. No application is made.
        </p>
      </footer>
    </div>
  );
}
