import Link from "next/link";

import { Atmosphere } from "@/components/layout/Atmosphere";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Panel } from "@/components/ui/Panel";
import { Icon } from "@/components/ui/icons";

import { LEGAL, type LegalSection } from "./legalContent";

const PAGES = [
  { label: "Privacy policy", href: "/legal/privacy-policy" },
  { label: "Terms of use", href: "/legal/terms-of-use" },
  { label: "Support", href: "/legal/support" },
];

interface Props {
  title: string;
  intro: string;
  sections: LegalSection[];
  current: string;
}

/**
 * The shell the three legal pages share.
 *
 * These are reachable signed out — a marketplace listing links straight to
 * them — so they use the auth header rather than the app shell, and carry
 * their own navigation between the three.
 *
 * The placeholder banner is deliberately loud and at the top. Half-written
 * policy that looks finished is the kind that gets published by accident.
 */
export function LegalPage({ title, intro, sections, current }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Atmosphere />
      <div className="relative z-[1] flex min-h-dvh flex-col">
        <AuthHeader />

        <main className="mx-auto w-full flex-1 max-w-[1000px] px-4 py-10 min-[641px]:px-6 min-[901px]:py-14">
          <div className="flex flex-col gap-6">
            <div>
              <p className="m-0 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                — {LEGAL.productName}
              </p>
              <h1 className="mt-3 font-display text-[clamp(28px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.03em] text-strong">
                {title}
              </h1>
              <p className="mt-3 max-w-[62ch] text-[16px] leading-[1.62] text-muted">{intro}</p>
              <p className="mt-2 font-mono text-[11px] text-faint">
                Last updated {LEGAL.lastUpdated}
              </p>
            </div>

            <div
              className="flex flex-wrap items-start gap-3 rounded-xl border p-4"
              style={{ borderColor: "var(--text-danger)", background: "rgb(var(--tint) / 0.03)" }}
            >
              <Icon
                name="shieldAlert"
                size={17}
                strokeWidth={1.9}
                className="mt-0.5 flex-none"
                style={{ color: "var(--text-danger)" }}
              />
              <p className="m-0 min-w-0 flex-1 text-[13.5px] leading-[1.6] text-body">
                <span className="font-semibold">Placeholder copy.</span> The structure here matches
                what a published policy needs, but the wording has not been through counsel and
                several sections name what still has to be filled in. Do not publish this as
                {" "}
                {LEGAL.publisherName}&rsquo;s policy.
              </p>
            </div>

            <nav aria-label="Legal pages" className="flex flex-wrap gap-2">
              {PAGES.map((p) => {
                const on = p.href === current;
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    aria-current={on ? "page" : undefined}
                    className="inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-200"
                    style={{
                      borderColor: on ? "var(--border-strong)" : "var(--border-grid)",
                      background: on ? "var(--ndi-mint-08)" : "rgb(var(--tint) / 0.02)",
                      color: on ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </nav>

            <Panel>
              <div className="relative z-[4] flex flex-col gap-8">
                {sections.map((s, i) => (
                  <section key={s.heading} className={i > 0 ? "border-t border-subtle pt-8" : ""}>
                    <h2 className="m-0 font-display text-[18px] font-semibold leading-[1.3] tracking-[-0.015em] text-strong">
                      <span className="mr-2.5 font-mono text-[12px] font-normal text-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.heading}
                    </h2>
                    <div className="mt-3 flex flex-col gap-2.5">
                      {s.body.map((para) => (
                        <p
                          key={para}
                          className="m-0 max-w-[74ch] text-[14.5px] leading-[1.68] text-muted"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="relative z-[4] flex flex-wrap items-center justify-between gap-4">
                <p className="m-0 text-[13.5px] leading-[1.55] text-muted">
                  Questions about this page? Write to{" "}
                  <a
                    href={`mailto:${LEGAL.supportEmail}`}
                    className="ndi-plainlink text-accent"
                  >
                    {LEGAL.supportEmail}
                  </a>
                  .
                </p>
                <Link href="/" className="ndi-plainlink text-[13px] text-accent">
                  Back to {LEGAL.productName}
                </Link>
              </div>
            </Panel>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
