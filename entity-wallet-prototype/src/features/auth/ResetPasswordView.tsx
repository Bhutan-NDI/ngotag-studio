"use client";

import Link from "next/link";
import { useState } from "react";

import { Atmosphere } from "@/components/layout/Atmosphere";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GradientButton } from "@/components/ui/GradientButton";
import { Panel } from "@/components/ui/Panel";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";

/**
 * Asking for a reset link.
 *
 * The confirmation says the same thing whether or not the address has an
 * account behind it. Telling someone "no account with that email" turns the
 * form into a way of finding out who has one.
 */
export function ResetPasswordView() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (!email.includes("@")) return setError("Enter the email address you sign in with.");
    setError("");
    setSent(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Atmosphere />
      <div className="relative z-[1] flex min-h-dvh flex-col">
        <AuthHeader />

        <main className="mx-auto flex w-full max-w-[520px] flex-1 items-center px-4 py-10 min-[641px]:px-6">
          <Panel className="w-full">
            {sent ? (
              <div className="relative z-[4] flex flex-col items-center gap-4 py-3 text-center">
                <span
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-grid text-accent"
                  style={{ background: "var(--ndi-mint-08)" }}
                >
                  <Icon name="mail" size={24} strokeWidth={1.7} />
                </span>
                <div>
                  <h1 className="m-0 font-display text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-strong">
                    Check your email
                  </h1>
                  <p className="m-0 mt-2.5 max-w-[42ch] text-[14.5px] leading-[1.6] text-muted">
                    If an account exists for{" "}
                    <span className="text-body">{email.trim()}</span>, a reset link is on its way.
                    It expires in 30 minutes.
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
                  <Link href="/sign-in">
                    <GradientButton>Back to sign in</GradientButton>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="ndi-plainlink text-[13px] text-muted"
                  >
                    Use a different address
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-[4] flex flex-col gap-5">
                <div>
                  <h1 className="m-0 font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
                    Reset your password
                  </h1>
                  <p className="m-0 mt-2 text-[14.5px] leading-[1.6] text-muted">
                    We will email you a link to set a new one.
                  </p>
                </div>

                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Your email</span>
                  <input
                    type="email"
                    className={`${FIELD_CLASS} h-12`}
                    placeholder="name@company.bt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                </label>

                {error ? (
                  <p
                    role="alert"
                    className="m-0 flex items-center gap-2 text-[13px] text-[var(--text-danger)]"
                  >
                    <Icon name="shieldAlert" size={15} strokeWidth={2} />
                    {error}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href="/sign-in" className="ndi-plainlink text-[13px] text-accent">
                    Back to sign in
                  </Link>
                  <GradientButton onClick={submit}>
                    Send reset link
                    <Icon name="arrowRight" size={16} strokeWidth={2} />
                  </GradientButton>
                </div>
              </div>
            )}
          </Panel>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
