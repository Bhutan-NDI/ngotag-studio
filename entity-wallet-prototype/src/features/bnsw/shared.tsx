import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The Single Window's own website, drawn as what it is in the prototype: a
 * stand-in for another organisation's system.
 *
 * WHY IT LOOKS LIKE A GOVERNMENT SITE, NOT THE WALLET
 *
 * SCR-AUT-07 is BNSW's screen, not the Entity Wallet's (UX-EW-06 §0.2): the
 * specification states what it must show and say, and BNSW designs it. A
 * dashed frame inside the wallet's dark chrome still read as one more wallet
 * screen in front of an audience, and the point of Flow 9 is that a
 * different system checks the authority. So BNSW's pages carry their own
 * palette (`.bnsw-site` in globals.css: white, government navy, GovTech's
 * saffron), a header naming the Single Window and the agency building it,
 * and no NDI lockup, sidebar or Studio navigation anywhere. BNSW has no
 * logo yet, so the header sets its name as a wordmark beside GovTech's.
 *
 * The strip across the top still says it is a stand-in, so nobody takes it
 * for the real Single Window — the same strip the bank's page carries.
 */
export function BnswFrame({ children, signedIn, onSignOut }: { children: ReactNode; signedIn?: string | null; onSignOut?: () => void }) {
  return (
    <div className="bnsw-site flex min-h-dvh flex-col" style={{ fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* ---- The disclosure: this is a stand-in ---- */}
      <p
        className="m-0 flex items-center justify-center gap-2 border-b border-dashed px-4 py-1.5 text-center font-mono text-[10.5px] uppercase tracking-[0.12em]"
        style={{ background: "#fff8e6", borderColor: "#e6c470", color: "#7a5a12" }}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: "#e0a100" }} />
        Prototype · stands in for the Bhutan National Single Window&rsquo;s website — another organisation&rsquo;s system, not NDI&rsquo;s
      </p>

      {/* ---- BNSW's header: its name, and who builds it ---- */}
      <header className="border-b border-subtle bg-white">
        <div className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center justify-between gap-3 px-4 py-3 min-[641px]:px-6">
          <Link href="/simulated/bnsw" className="flex items-center gap-3 no-underline">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-[10px] text-[13px] font-extrabold leading-none text-white"
              style={{ background: "var(--bnsw-navy)", boxShadow: "inset 0 -4px 0 var(--bnsw-saffron)" }}
            >
              BNSW
            </span>
            <span className="flex flex-col">
              <span className="text-[16px] font-bold leading-tight" style={{ color: "var(--bnsw-navy)" }}>
                Bhutan National Single Window
              </span>
              <span className="text-[12px] leading-tight text-faint">Imports, exports and transit · Royal Government of Bhutan</span>
            </span>
          </Link>
          <span className="flex items-center gap-2 text-[11px] text-faint">
            Developed by
            <img src="/media/logos/govtech-bhutan.png" alt="GovTech Bhutan" className="h-7 w-auto" />
          </span>
        </div>
      </header>

      {/* ---- Its navigation ---- */}
      <nav aria-label="Single Window" style={{ background: "var(--bnsw-navy)" }}>
        <div className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center gap-x-1 gap-y-1 px-2 min-[641px]:px-4">
          <Link href="/simulated/bnsw" className="px-3 py-2.5 text-[13px] font-semibold text-white no-underline hover:underline">
            Declare
          </Link>
          <Link href="/simulated/bnsw/register" className="px-3 py-2.5 text-[13px] font-semibold text-white no-underline hover:underline">
            Register a company
          </Link>
          {signedIn ? (
            <span className="ml-auto flex items-center gap-2 px-3 py-2.5 text-[12.5px]" style={{ color: "rgba(255,255,255,0.8)" }}>
              Signed in as <span className="font-semibold text-white">{signedIn}</span>
              {onSignOut ? (
                <button type="button" onClick={onSignOut} className="font-semibold underline" style={{ color: "var(--bnsw-saffron)" }}>
                  Sign out
                </button>
              ) : null}
            </span>
          ) : null}
        </div>
      </nav>
      <div aria-hidden="true" className="h-1" style={{ background: "var(--bnsw-saffron)" }} />

      <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col gap-5 px-4 py-7 min-[641px]:px-6">
        <div className="flex flex-col gap-5 rounded-[8px] border border-subtle bg-white px-5 py-6 shadow-[0_1px_3px_rgba(12,27,51,0.08)] min-[641px]:px-7">
          {children}
        </div>
      </main>

      <footer className="border-t border-subtle bg-white">
        <p className="m-0 mx-auto w-full max-w-[1040px] px-4 py-4 text-[12px] text-faint min-[641px]:px-6">
          Bhutan National Single Window, developed by GovTech Agency — simulated for the NDI Entity Wallet prototype. Nothing is declared.
        </p>
      </footer>
    </div>
  );
}

/** A message on BNSW's page — always words, never colour alone (SC 3.3.1). */
export function BnswMessage({ children, tone = "info", role = "status" }: { children: ReactNode; tone?: "info" | "warning" | "success"; role?: "status" | "alert" }) {
  const dot = tone === "warning" ? "var(--ndi-warning)" : tone === "success" ? "var(--ndi-success)" : "var(--ndi-info)";
  return (
    <div role={role} className="flex items-start gap-2.5 rounded-[10px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body">
      <span aria-hidden="true" className="mt-[7px] h-2 w-2 flex-none rounded-full" style={{ background: dot }} />
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
    </div>
  );
}

/** A labelled fact on BNSW's page. */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</dt>
      <dd className="m-0 text-[13.5px] text-body">{children}</dd>
    </div>
  );
}
