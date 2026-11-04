"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { AuthShell } from "@/components/layout/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SecureSignInScene } from "@/components/ui/scenes";
import { useDemo } from "@/lib/demoStore";

import { AuthCardHeader, AuthNotice } from "@/features/auth/AuthCard";

import { IdentityScan, type IdentityScanStage } from "./IdentityScan";

const STATES = ["live", "idle", "wallet", "proved", "declined", "no_wallet"];
const pinned = (s: string): IdentityScanStage | null => (s === "live" ? null : (s as IdentityScanStage));

/**
 * Confirm it's you — the set-up scan at sign-up (ADR-001, FLOW-ONB-01).
 *
 * It comes straight after the email is confirmed and before the password,
 * so the name on the account is the one on the citizen ID: the password
 * screen shows it from the proof rather than asking for it. Without a
 * wallet they go on anyway, type their own name, and are a member who
 * isn't yet appointable.
 *
 * AHEAD OF ITS SCREEN SPEC
 *
 * ADR-001 is accepted, but FLOW-ONB-01 and UX-EW-01 haven't been updated
 * with this screen's states and copy yet. The copy here is the ADR's: what
 * is asked (name and citizenship ID number only) and its privacy sentence.
 * It is listed on the what's-real page as built ahead of its spec.
 */
export function SignUpConfirmIdentityView() {
  const router = useRouter();
  const { signup, people, anchorSignup, hydrated } = useDemo();
  const forced = pinned(useScreenState("SCR-ONB-ID", STATES));

  /* Set when the scan on this screen succeeds, so its own confirmation is
     shown rather than the arrived-already-confirmed notice. */
  const [justProved, setJustProved] = useState(false);
  /* Reached with the email confirmed (set_password), or later from
     verifying an organisation, with the account made (done). */
  const ready = signup?.stage === "set_password" || signup?.stage === "done";
  const next = signup?.stage === "set_password" ? "/sign-up/password" : (signup?.returnTo ?? "/welcome");
  /* Who the wallet answers as. The prototype has no phone: someone the story
     knows by that address, otherwise Dorji, who signs up in the story. */
  const answeredAs =
    people.find((p) => p.email.toLowerCase() === signup?.email.toLowerCase())?.name ?? (signup?.name || "Dorji Wangchuk");

  return (
    <AuthShell
      scene={<SecureSignInScene />}
      title={
        <>
          One account, one <span className="ndi-wave-text">person</span>
        </>
      }
      lead="Your account is tied to you with one scan of your Bhutan NDI Wallet. Many people share a name; nobody shares a citizenship ID — so this account can only ever be yours, and nobody can set one up in your name."
    >
      <AuthCardHeader title="Confirm it's you" subtitle="One scan with your Bhutan NDI Wallet" />
      <div className="relative z-[4] flex flex-col gap-4">
        {hydrated && !ready && !forced ? (
          <>
            <AuthNotice>We need to confirm your email address before you can confirm who you are.</AuthNotice>
            <Link href="/sign-up" className="block">
              <GradientButton block>Start again</GradientButton>
            </Link>
          </>
        ) : hydrated && signup?.anchoredName && !forced && !justProved ? (
          <>
            <AuthNotice>Your account is already confirmed as {signup.anchoredName}.</AuthNotice>
            <GradientButton block onClick={() => router.push(next)}>
              Continue
            </GradientButton>
          </>
        ) : (
          <IdentityScan
            verifiedName={answeredAs}
            forced={forced}
            onProved={(name) => {
              setJustProved(true);
              anchorSignup(name);
            }}
            onContinue={() => router.push(next)}
            onWithout={() => {
              anchorSignup(null);
              router.push(next);
            }}
          />
        )}
      </div>
    </AuthShell>
  );
}

/**
 * Confirm your identity — in account settings, for a personal account set
 * up without the scan (ADR-001 Decision 5). The same request as at set-up,
 * and the only other place an anchor is written. Offered only to an
 * unanchored personal account; the root account is a role account and is
 * never anchored.
 */
export function AccountConfirmIdentityView() {
  const router = useRouter();
  const { currentPerson, confirmIdentity, hydrated } = useDemo();
  const forced = pinned(useScreenState("SCR-ACC-ID", STATES));
  const roleAccount = currentPerson.platformRole === "root";
  const [justProved, setJustProved] = useState(false);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Profile", href: "/profile" }, { label: "Confirm your identity" }]} title="Confirm your identity" />
        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            {hydrated && roleAccount && !forced ? (
              <p className="m-0 text-[13.5px] leading-[1.6] text-muted">
                The root account is a role account. It isn&rsquo;t tied to one person, so it is never confirmed with a
                wallet.
              </p>
            ) : hydrated && currentPerson.cidVerified && !forced && !justProved ? (
              <>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                  Your account is confirmed as <strong className="text-strong">{currentPerson.name}</strong>. Nothing more to
                  do.
                </p>
                <div>
                  <Link href="/profile">
                    <GradientButton>Back to your profile</GradientButton>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="m-0 max-w-[64ch] text-[13.5px] leading-[1.6] text-muted">
                  Until you confirm who you are, you can be a member of an organisation, but you can&rsquo;t verify one or
                  be appointed to act for one. One scan with your Bhutan NDI Wallet does it.
                </p>
                <IdentityScan
                  verifiedName={currentPerson.name}
                  forced={forced}
                  onProved={() => {
                    setJustProved(true);
                    confirmIdentity(currentPerson.id);
                  }}
                  onContinue={() => router.push("/profile")}
                  cardVerb="Confirm"
                  cancelLabel="Not now"
                  onCancel={() => router.push("/profile")}
                />
              </>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
