import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The Single Window's own website, drawn as what it is in the prototype: a
 * stand-in for another organisation's system.
 *
 * WHY A DASHED FRAME AROUND THE WHOLE SITE
 *
 * SCR-AUT-07 is BNSW's screen, not the Entity Wallet's (UX-EW-06 §0.2): the
 * specification states what it must show and say, and BNSW designs it. The
 * page before Flow 9's specification avoided the Studio's chrome for that
 * reason, and still read as product. So everything BNSW's is inside the
 * same dashed border and warning dot every simulated step in the prototype
 * uses, labelled with what it stands in for, and there is no NDI lockup,
 * sidebar or Studio navigation anywhere on it. Its own header is plain and
 * deliberately unlike the console's.
 */
export function BnswFrame({ children, signedIn, onSignOut }: { children: ReactNode; signedIn?: string | null; onSignOut?: () => void }) {
  return (
    <div className="min-h-dvh px-4 py-6 min-[641px]:px-6" style={{ background: "var(--surface-sunken)" }}>
      <div
        className="mx-auto flex max-w-[1040px] flex-col gap-0 overflow-hidden rounded-[14px] border border-dashed"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-canvas)" }}
      >
        <p className="flex items-center gap-2 border-b border-dashed px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted" style={{ borderColor: "var(--border-strong)" }}>
          <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--ndi-warning)" }} />
          Prototype · stands in for the Bhutan National Single Window&rsquo;s website — another organisation&rsquo;s system, not NDI&rsquo;s
        </p>

        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-4 py-3.5 min-[641px]:px-6">
          <Link href="/simulated/bnsw" className="flex items-center gap-3 no-underline">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-[8px] font-display text-[13px] font-bold"
              style={{ background: "var(--ndi-info)", color: "var(--ndi-ink-900)" }}
            >
              SW
            </span>
            <span className="flex flex-col">
              <span className="font-display text-[14px] font-semibold leading-tight text-strong">Bhutan National Single Window</span>
              <span className="text-[11.5px] leading-tight text-faint">Customs declarations</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px]">
            <Link href="/simulated/bnsw" className="ndi-plainlink text-muted">
              Declare
            </Link>
            <Link href="/simulated/bnsw/register" className="ndi-plainlink text-muted">
              Register a company
            </Link>
            {signedIn ? (
              <span className="flex items-center gap-2 text-faint">
                Signed in as <span className="text-body">{signedIn}</span>
                {onSignOut ? (
                  <button type="button" onClick={onSignOut} className="ndi-plainlink text-muted">
                    Sign out
                  </button>
                ) : null}
              </span>
            ) : null}
          </nav>
        </header>

        <main className="flex flex-col gap-5 px-4 py-6 min-[641px]:px-6">{children}</main>
      </div>
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
