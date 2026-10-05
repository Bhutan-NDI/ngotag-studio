import Link from "next/link";
import type { ReactNode } from "react";

import { Atmosphere } from "@/components/layout/Atmosphere";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { Icon, type IconName } from "@/components/ui/icons";

interface Props {
  tone: "success" | "error";
  icon: IconName;
  title: string;
  lead: string;
  detail?: ReactNode;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}

/**
 * The end of the onboarding flow, either way.
 *
 * One component for both outcomes: the shape of the page is the same — say
 * what happened, then give the one thing to do next — and only the tone and
 * the destinations differ. Splitting them would mean maintaining the same
 * layout twice and letting them drift.
 */
export function OutcomeView({ tone, icon, title, lead, detail, primary, secondary }: Props) {
  const accent = tone === "success" ? "var(--accent)" : "var(--text-danger)";

  return (
    <div className="flex min-h-dvh flex-col">
      <Atmosphere />
      <div className="relative z-[1] flex min-h-dvh flex-col">
        <AuthHeader />

        <main className="mx-auto flex w-full max-w-[620px] flex-1 items-center px-4 py-10 min-[641px]:px-6">
          <Panel className="w-full">
            <div className="relative z-[4] flex flex-col items-center gap-5 py-4 text-center">
              <span
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border"
                style={{
                  borderColor: accent,
                  color: accent,
                  background:
                    tone === "success" ? "var(--ndi-mint-08)" : "rgb(var(--tint) / 0.03)",
                }}
              >
                <Icon name={icon} size={28} strokeWidth={1.7} />
              </span>

              <div>
                <h1 className="m-0 font-display text-[clamp(24px,3.4vw,30px)] font-semibold leading-[1.15] tracking-[-0.025em] text-strong [text-wrap:balance]">
                  {title}
                </h1>
                <p className="m-0 mt-3 max-w-[46ch] text-[15.5px] leading-[1.62] text-muted [text-wrap:pretty]">
                  {lead}
                </p>
              </div>

              {detail}

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
                <Link href={primary.href}>
                  <GradientButton>
                    {primary.label}
                    <Icon name="arrowRight" size={16} strokeWidth={2} />
                  </GradientButton>
                </Link>
                <Link href={secondary.href}>
                  <HairlineButton className="h-12">{secondary.label}</HairlineButton>
                </Link>
              </div>
            </div>
          </Panel>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
