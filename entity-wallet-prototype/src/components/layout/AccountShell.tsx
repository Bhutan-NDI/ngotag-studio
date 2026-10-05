import Link from "next/link";
import type { ReactNode } from "react";

import { Lockup } from "./Lockup";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The chrome for a signed-in person who is not yet acting for an
 * organisation: SCR-ONB-05, and the moments either side of choosing one.
 *
 * Not the app shell. The app shell's sidebar is a map of an organisation's
 * workspace, and showing it to an account that belongs to none would promise
 * a workspace that does not exist — the empty dashboard UXD-01 was written
 * to prevent, where a functional-looking screen with nothing in it reads as
 * the platform being broken. Here the person's name is on screen, and the
 * only way on is the one the page offers.
 */
export function AccountShell({ name, children }: { name?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-subtle">
        <div className="mx-auto flex w-full max-w-[900px] items-center justify-between gap-4 px-4 py-4 min-[641px]:px-6">
          <Lockup className="block h-7 w-auto" />
          <div className="flex items-center gap-3">
            {name ? (
              <span className="hidden text-[13px] text-muted min-[561px]:inline">
                Signed in as <span className="font-medium text-body">{name}</span>
              </span>
            ) : null}
            <ThemeToggle />
            <Link href="/sign-in" className="ndi-plainlink text-[13px] font-medium text-muted">
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 py-8 min-[641px]:px-6 min-[901px]:py-14">
        {children}
      </main>
    </div>
  );
}
