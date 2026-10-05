"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthShell } from "@/components/layout/AuthShell";
import { Countdown } from "@/components/ui/Countdown";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Icon } from "@/components/ui/icons";
import { SecureSignInScene } from "@/components/ui/scenes";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { AuthCardHeader, AuthNotice } from "@/features/auth/AuthCard";

type Face =
  | "default"
  | "no_account"
  | "wrong_person"
  | "expired"
  | "revoked"
  | "void"
  | "already_accepted"
  | "declined"
  | "offline";

/**
 * SCR-INV-04 — Review invitation. FLOW-ONB-02 steps 5–8.
 *
 * INFORMED CONSENT, OR IT IS NOT CONSENT
 *
 * The invitee must be able to say who invited them and what they will get
 * before they accept (UN-05, UC-05 targets 90%). So the screen names a
 * person, not a system — "{Inviter} has invited you" — and it says what the
 * invitation will not do as plainly as what it will. For a member that is
 * the sentence that stops someone believing they can now act for the
 * business (Q4).
 *
 * THE REFUSAL THAT MUST NOT READ AS A REJECTION
 *
 * Step 8 re-checks at acceptance: the inviter may have lost their authority
 * since sending (E6). When that happens the person has just consented and is
 * being turned away — the highest-risk copy in UX-EW-01 — so it reads as the
 * invitation lapsing, and names who can send a new one, and never implies
 * the person did anything wrong. A revoked invitation (E5) deliberately does
 * not say why: the reason is between the inviter and nobody else.
 *
 * NO ACCOUNT, NO DEAD END
 *
 * Someone without an account is sent to create one and promised the way
 * back (A1) — because leaving an invitation to sign up is exactly where
 * invitees are lost. The sign-up is pre-filled with the invited address, so
 * the account is created for the address the invitation was sent to.
 */
export function ReviewInvitationView({ id }: { id: string }) {
  const router = useRouter();
  const { orgInvitations, organizations, personById, signup, acceptInvitation, declineInvitation, setSignupReturn, clearSignup, hydrated } =
    useDemo();

  const forced = useScreenState("SCR-INV-04", [
    "live",
    "loading",
    "default",
    "no_account",
    "wrong_person",
    "expired",
    "revoked",
    "void",
    "already_accepted",
    "declined",
    "offline",
  ]);

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Face | null>(null);

  const inv = orgInvitations.find((i) => i.id === id);
  const inviter = inv ? personById(inv.invitedBy) : null;
  const org = inv?.orgId ? organizations.find((o) => o.id === inv.orgId) : null;
  const target = inv?.kind === "M" ? (org?.name ?? "the organisation") : (inv?.legalName ?? "the organisation");
  const account = signup?.stage === "done" ? signup : null;

  const natural: Face | "loading" = !hydrated
    ? "loading"
    : !inv || inv.state === "REVOKED" || inv.state === "REFUSED" || inv.state === "PENDING_APPROVAL"
      ? "revoked"
      : inv.state === "ACCEPTED"
        ? "already_accepted"
        : inv.state === "DECLINED"
          ? "declined"
          : inv.state === "VOID"
            ? "void"
            : inv.state === "EXPIRED"
              ? "expired"
              : !account
                ? "no_account"
                : account.email.toLowerCase() !== inv.email.toLowerCase()
                  ? "wrong_person"
                  : "default";

  const face = forced !== "live" ? (forced as Face | "loading") : (result ?? natural);
  const loading = busy || face === "loading";

  const createAccount = () => {
    if (!inv) return;
    if (account && account.email.toLowerCase() !== inv.email.toLowerCase()) clearSignup();
    setSignupReturn(`/invitation/${id}`, inv.email);
    router.push("/sign-up");
  };

  const accept = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const r = acceptInvitation(id);
      if (r.ok) {
        router.push(`/invitation/${id}/accepted`);
        return;
      }
      setResult(
        r.error === "E4" ? "expired" : r.error === "E6" ? "void" : r.error === "E7" ? "already_accepted" : "revoked",
      );
    }, ROUND_TRIP_MS);
  };

  const inviterName = inviter?.name ?? "the person who invited you";

  return (
    <AuthShell
      scene={<SecureSignInScene />}
      title={
        <>
          You&rsquo;ve been <span className="ndi-wave-text">invited</span>
        </>
      }
      lead="Read what it gives you before you accept. Joining an organisation lets you see it; acting for it is a separate step someone has to set up for you."
    >
      {face === "loading" ? (
        <>
          <AuthCardHeader title="Opening your invitation" />
          <p role="status" className="relative z-[4] m-0 text-center text-[14px] text-muted">One moment…</p>
        </>
      ) : null}

      {face === "default" || face === "no_account" || face === "wrong_person" || face === "offline" ? (
        <>
          <AuthCardHeader
            title={
              inv?.kind === "O"
                ? `${inviterName} has invited you to register ${target}`
                : `${inviterName} has invited you to ${target}`
            }
          />
          <div className="relative z-[4] flex flex-col gap-4">
            <div className="flex flex-col gap-2.5 rounded-[12px] border border-grid px-4 py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What you&rsquo;ll be able to do</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                {inv?.kind === "O"
                  ? `Register ${target} on the platform and become its owner. Its identity here is created by your own action, not by NDI.`
                  : inv?.role === "Admin"
                    ? `Sign in and see ${target}'s information, and invite and remove its members.`
                    : `Sign in and see ${target}'s information.`}
              </p>
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What this does not do</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                {inv?.kind === "O"
                  ? inv.needsSecondApproval
                    ? `${target} won't be able to issue anything until NDI activates its designation.`
                    : `This doesn't confirm ${target} by itself — the register is still asked to confirm you represent it.`
                  : `This does not let you act for ${target}. If that's needed, they'll set it up separately.`}
              </p>
            </div>

            {inv?.expiresAt ? (
              <p className="m-0 flex items-center gap-2 text-[12.5px] text-faint">
                Invitation expires <Countdown expiresAt={inv.expiresAt} />
              </p>
            ) : null}

            {face === "offline" ? (
              <AuthNotice role="alert" tone="warning">
                We couldn&rsquo;t complete this. Your link still works — try again shortly.
              </AuthNotice>
            ) : null}

            {face === "no_account" ? (
              <>
                <AuthNotice>
                  You&rsquo;ll need an account to accept this. It takes a minute — we&rsquo;ll bring
                  you straight back here.
                </AuthNotice>
                <GradientButton block onClick={createAccount}>
                  Create an account
                  <Icon name="arrowRight" size={16} strokeWidth={2} />
                </GradientButton>
              </>
            ) : null}

            {face === "wrong_person" ? (
              <>
                <AuthNotice tone="warning">
                  This invitation is for <strong className="text-strong">{inv?.email}</strong>, and
                  you&rsquo;re signed in as {account?.email}.
                </AuthNotice>
                <GradientButton block onClick={createAccount}>
                  Continue as {inv?.email}
                </GradientButton>
              </>
            ) : null}

            {face === "default" || face === "offline" ? (
              <div className="flex flex-col gap-2.5">
                <GradientButton block onClick={accept} disabled={loading}>
                  {loading ? "Accepting…" : "Accept"}
                </GradientButton>
                {/* Plainly findable and full-size — equal weight is not
                    required, but a decline you have to hunt for is not a
                    real choice. */}
                <HairlineButton
                  onClick={() => {
                    declineInvitation(id);
                    setResult("declined");
                  }}
                  disabled={loading}
                >
                  Decline
                </HairlineButton>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {face === "expired" ? (
        <Outcome title="This invitation has expired" body={`Ask ${inviterName} to send you a new one.`} />
      ) : null}
      {face === "revoked" ? (
        <Outcome title="This invitation is no longer valid" body={`If you think you should still have it, ask ${inviterName}.`} />
      ) : null}
      {face === "void" ? (
        <Outcome
          title="This invitation can no longer be accepted"
          body={`It has lapsed since it was sent — nothing you did caused that. Ask ${target}'s administrator to send you a new one.`}
        />
      ) : null}
      {face === "already_accepted" ? (
        <Outcome title="You've already accepted this invitation" body={`You're a member of ${target}.`}>
          <GradientButton block onClick={() => router.push(`/invitation/${id}/accepted`)}>
            Go to {target}
          </GradientButton>
        </Outcome>
      ) : null}
      {face === "declined" ? (
        <Outcome title="You've declined this invitation" body={`${inviterName} has been told. Nothing was added to your account.`}>
          <HairlineButton onClick={() => router.push("/sign-in")}>Sign out</HairlineButton>
        </Outcome>
      ) : null}
    </AuthShell>
  );
}

function Outcome({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <>
      <AuthCardHeader title={title} />
      <div className="relative z-[4] flex flex-col gap-4">
        <p role="status" className="m-0 text-center text-[14px] leading-[1.6] text-muted">
          {body}
        </p>
        {children}
      </div>
    </>
  );
}
