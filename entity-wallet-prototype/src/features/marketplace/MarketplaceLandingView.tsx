"use client";

import Link from "next/link";
import { useState } from "react";

import { Atmosphere } from "@/components/layout/Atmosphere";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GradientButton } from "@/components/ui/GradientButton";
import { Panel } from "@/components/ui/Panel";
import { Icon, type IconName } from "@/components/ui/icons";
import { LEGAL } from "@/features/legal/legalContent";

const INCLUDED: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "issue",
    title: "Issue credentials",
    body: "By connection, email, QR code or bulk upload, against schemas you define.",
  },
  {
    icon: "verify",
    title: "Request proofs",
    body: "Ask for exactly the attributes you need. The rest stays in the holder's wallet.",
  },
  {
    icon: "fingerprint",
    title: "Anchor your identity",
    body: "Create and manage the DIDs and x509 certificates that sign what you issue.",
  },
  {
    icon: "ecosystems",
    title: "Work in ecosystems",
    body: "Govern schemas and trust across several organizations under one framework.",
  },
];

const PLAN = [
  "1,000 credentials issued per month",
  "1,000 verifications per month",
  "25 schemas, unlimited credential definitions",
  "10 members, unlimited connections",
];

/**
 * Where a marketplace listing lands someone before they have an account.
 *
 * Accepting the terms is a checkbox rather than an implied consequence of
 * clicking Continue: the subscription is a contract, and burying the
 * acceptance in a button is the part that gets challenged later.
 */
export function MarketplaceLandingView() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <Atmosphere />
      <div className="relative z-[1] flex min-h-dvh flex-col">
        <AuthHeader />

        <main className="mx-auto w-full flex-1 max-w-[1100px] px-4 py-10 min-[641px]:px-6 min-[901px]:py-16">
          <div className="flex flex-col gap-8">
            <div className="max-w-[62ch]">
              <p className="m-0 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                — Marketplace
              </p>
              <h1 className="mt-3 font-display text-[clamp(30px,4.4vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em] text-strong [text-wrap:balance]">
                Activate <span className="ndi-wave-text">NDI Studio</span>
              </h1>
              <p className="mt-4 text-[17px] leading-[1.62] text-muted [text-wrap:pretty]">
                Your subscription is ready to link. Set up an organization, or attach it to one you
                already run, and you can issue your first credential or request your first proof in a few
                minutes.
              </p>
            </div>

            <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
              {INCLUDED.map((f) => (
                <Panel key={f.title}>
                  <div className="relative z-[4] flex flex-col gap-3">
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-grid text-accent"
                      style={{ background: "var(--ndi-mint-04)" }}
                    >
                      <Icon name={f.icon} size={19} strokeWidth={1.7} />
                    </span>
                    <h2 className="m-0 font-display text-[15.5px] font-semibold tracking-[-0.01em] text-strong">
                      {f.title}
                    </h2>
                    <p className="m-0 text-[13.5px] leading-[1.55] text-muted">{f.body}</p>
                  </div>
                </Panel>
              ))}
            </div>

            <div className="grid gap-5 min-[901px]:grid-cols-[1.2fr_1fr]">
              <Panel>
                <div className="relative z-[4] flex flex-col gap-4">
                  <div>
                    <p className="m-0 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                      Your plan
                    </p>
                    <p className="m-0 mt-2 font-display text-[24px] font-semibold tracking-[-0.02em] text-strong">
                      Starter
                    </p>
                  </div>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {PLAN.map((line) => (
                      <li key={line} className="flex items-center gap-2.5">
                        <Icon
                          name="check"
                          size={15}
                          strokeWidth={2.4}
                          className="flex-none text-accent"
                        />
                        <span className="text-[14px] text-body">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>

              <Panel>
                <div className="relative z-[4] flex h-full flex-col gap-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="ndi-check mt-0.5 flex-none"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    <span className="text-[13.5px] leading-[1.6] text-muted">
                      I have read and accept the{" "}
                      <Link href="/legal/terms-of-use" className="ndi-plainlink text-accent">
                        terms of use
                      </Link>{" "}
                      and the{" "}
                      <Link href="/legal/privacy-policy" className="ndi-plainlink text-accent">
                        privacy policy
                      </Link>
                      , last updated {LEGAL.lastUpdated}.
                    </span>
                  </label>

                  <div className="mt-auto flex flex-col gap-2.5">
                    {accepted ? (
                      <Link href="/marketplace/onboarding">
                        <GradientButton className="w-full">
                          Continue to setup
                          <Icon name="arrowRight" size={16} strokeWidth={2} />
                        </GradientButton>
                      </Link>
                    ) : (
                      <GradientButton disabled className="w-full">
                        Continue to setup
                        <Icon name="arrowRight" size={16} strokeWidth={2} />
                      </GradientButton>
                    )}
                    <p className="m-0 text-center text-[12.5px] text-faint">
                      Accept the terms to continue.
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </main>

        <SiteFooter>
          <Link href="/legal/support" className="ndi-plainlink">
            Support
          </Link>
        </SiteFooter>
      </div>
    </div>
  );
}
