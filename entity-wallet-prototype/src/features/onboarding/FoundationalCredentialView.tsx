"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/features/controllership/scopeModel";
import { Icon } from "@/components/ui/icons";
import { useReveal } from "@/components/ui/useReveal";
import { PELDEN, REGISTER_LISTINGS, inOrg } from "@/lib/demoData";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";
import { useDemo } from "@/lib/demoStore";

import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

/**
 * A4 — accept the entity's foundational credential. The milestone.
 *
 * WHY THIS IS ITS OWN SCREEN RATHER THAN A STEP IN A SETUP WIZARD
 *
 * This is the root every later credential and every delegated authority
 * chains back to. When Act 5 shows a verification walking four links up to
 * the company's registration, this is the link at the top. A screen that
 * treated it as one more provisioning step would leave the audience with no
 * idea why the chain has a bottom, so it is marked as an arrival: the entity
 * is now verified, and here is what that means.
 *
 * WHAT THE SCREEN NO LONGER SAYS
 *
 * This one acceptance happens under a bootstrap scope created for exactly
 * this purpose — the only way to accept a credential before any
 * controllership exists. The screen used to explain that in a boxed "Why
 * this one is different" note, beside an "On the trust registry" pill, a
 * "Root of trust" chip on the card and a line under the button about whose
 * act the acceptance is recorded as. In review none of it read as a step:
 * it was four asides about the machinery around a credential the person had
 * not yet been shown properly. The machinery is still real and still the
 * server's; the screen now shows the credential itself, and the done face
 * says what holding it means.
 *
 * TWO WAYS IN, ONE MILESTONE
 *
 * The person arrives either having chosen an organisation the register
 * listed, or with a manual review NDI approved. Whoever issues the
 * credential in the second case is still open for Gate 2 — the register
 * never confirmed the pair — so the prototype names NDI as the issuer after
 * a review rather than implying the register vouched for something it did
 * not. An arrival with neither is sent back: the credential is the reward
 * for a confirmation, and a screen reached by URL must not hand it out.
 */
export function FoundationalCredentialView() {
  const router = useRouter();
  const {
    heldCredentials,
    orgOnboarding,
    orgInvitations,
    manualReviews,
    signup,
    hydrated,
    completeOrgOnboarding,
    setActiveOrg,
    setPersona,
  } = useDemo();

  const screenState = useScreenState("A4", [
    "offer_ready",
    "issuing",
    "verified",
    "issuance_failed",
  ]);

  const [stage, setStage] = useState<"offer" | "issuing" | "done">("offer");

  const listing = REGISTER_LISTINGS.find((l) => l.ref === orgOnboarding?.selectedRef);
  /* Pelden's own registration supplies the full attribute list when Pelden
     is the organisation; anyone else's is drawn from what the register
     returned. */
  const foundational =
    !listing || listing.legalName.startsWith("Pelden")
      ? heldCredentials.filter(inOrg(PELDEN)).find((c) => c.isFoundational)
      : undefined;
  /* An organisation already on NDI, invited to its wallet (kind W), goes to
     its own console afterwards — not to an account's organisation list. */
  const walletInvite = orgInvitations.find((i) => i.id === orgOnboarding?.invitationId && i.kind === "W");
  const review = manualReviews.find((m) => m.id === orgOnboarding?.reviewId && m.state === "APPROVED");
  const kind = kindOf(orgOnboarding?.kind);
  const legalName = listing?.legalName ?? review?.legalName ?? "Pelden Trading Pvt. Ltd.";
  const shortName = legalName.replace(/ (Pvt\. )?Ltd\.$/, "");
  const issuer = review ? "Bhutan NDI" : (kind.register ?? "Bhutan NDI");
  const confirmed = Boolean(listing || review || orgOnboarding?.completed);
  const attributes = (!review && foundational?.attributes) || [
    { name: "registered_name", value: legalName },
    { name: "registration_number", value: review?.registrationNumber ?? listing?.registrationNumber ?? "CRA-2019-04477" },
    { name: "entity_type", value: listing?.entityType ?? kind.label },
    { name: "status", value: "Active" },
  ];

  const shown =
    screenState === "issuing"
      ? "issuing"
      : screenState === "verified"
        ? "done"
        : screenState === "issuance_failed"
          ? "failed"
          : stage;

  /* Accept sits at the bottom of a tall sheet; the confirmation that
     replaces the sheet is short, so the page could be left scrolled past
     its heading. It is brought into view and given focus, since the button
     that was pressed no longer exists. */
  const doneRef = useReveal<HTMLDivElement>(shown === "done", { focus: true });

  const accept = () => {
    setStage("issuing");
    setTimeout(() => {
      completeOrgOnboarding();
      setStage("done");
    }, ROUND_TRIP_MS);
  };

  /* An account that came through sign-up goes back to its list of
     organisations, which now has this one on it (SCR-ONB-05). Run without
     one, the story's console is the natural next room. */
  const accountDone = signup?.stage === "done" && !walletInvite;
  const goOn = () => {
    if (walletInvite?.orgId) {
      setActiveOrg(walletInvite.orgId);
      router.push("/dashboard");
      return;
    }
    if (accountDone) {
      router.push("/welcome");
      return;
    }
    setActiveOrg("org-pelden");
    setPersona("dorji");
    router.push("/dashboard");
  };

  if (hydrated && !confirmed && screenState === "offer_ready") {
    return (
      <OnboardingShell current={3}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="font-display text-[15px] font-semibold text-strong">Choose your organisation first</p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              The registration is offered once the register — or a reviewer at NDI — has confirmed
              you represent the organisation.
            </p>
            <div>
              <HairlineButton onClick={() => router.push("/onboarding")}>Start adding an organisation</HairlineButton>
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  if (shown === "done") {
    return (
      <OnboardingShell current={3}>
        <Panel>
          <div
            ref={doneRef}
            tabIndex={-1}
            className="relative z-[4] flex flex-col items-center gap-4 py-6 text-center outline-none"
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full border"
              style={{
                borderColor: "var(--ndi-mint-40)",
                background: "var(--ndi-mint-12)",
                boxShadow: "var(--glow-sm)",
              }}
            >
              <Icon name="shieldCheck" size={26} strokeWidth={1.9} className="text-accent" />
            </span>

            <div className="flex flex-col gap-2">
              <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
                {shortName} is <span className="ndi-wave-text">verified</span>
              </h1>
              <p className="mx-auto max-w-[54ch] text-[13.5px] leading-[1.65] text-muted">
                The organisation now holds its registration as a credential in
                its own wallet. It can prove things about itself, hold
                credentials others issue to it, and grant scoped authority to
                the people who act for it.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <GradientButton onClick={goOn}>
                {accountDone ? "Back to your organisations" : "Go to the console"}
                <Icon name="arrowRight" size={15} strokeWidth={2} />
              </GradientButton>
              {/* Inviting colleagues, not granting authority: on the day the
                  organisation exists nobody else belongs to it, and authority
                  only goes to someone who does. This used to open the relation
                  form straight from the onboarding shell, as whoever the
                  console was last driven as, onto an empty person list. */}
              {walletInvite ? null : (
                <HairlineButton
                  onClick={() => {
                    setActiveOrg("org-pelden");
                    setPersona("dorji");
                    router.push("/members/invite");
                  }}
                >
                  Invite your colleagues
                </HairlineButton>
              )}
            </div>

            <p className="mx-auto max-w-[56ch] text-[12.5px] leading-[1.55] text-faint">
              You hold the root authority for this organisation. Everything you
              delegate from here traces back to the credential you just
              accepted — if it ever lapsed, nothing beneath it would verify
              anywhere.
            </p>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell current={3}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          Accept the organisation&rsquo;s registration
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          {issuer} has issued {shortName}&rsquo;s registration as a credential. Check what it
          says, then accept it into the organisation&rsquo;s wallet.
        </p>
      </div>

      {shown === "failed" ? (
        <Panel>
          <div className="relative z-[4] flex items-start gap-3">
            <Icon
              name="close"
              size={18}
              strokeWidth={2.2}
              className="mt-0.5 flex-none"
              style={{ color: "var(--ndi-danger)" }}
            />
            <div className="flex flex-col gap-2">
              <p className="font-display text-[14.5px] font-semibold text-strong">
                The credential could not be issued
              </p>
              <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                {review ? "NDI approved the review" : "The register confirmed you"}, but issuing the credential itself
                failed. The organisation exists and you hold its root
                authority — it simply cannot prove anything about itself until
                this is issued, so nothing else will work yet.
              </p>
              <div className="mt-1">
                <HairlineButton onClick={() => setStage("offer")}>
                  <Icon name="refresh" size={14} strokeWidth={2} />
                  Try again
                </HairlineButton>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}

      {/* One sheet, laid out the way a wallet shows a credential it holds:
          the card on the left with the facts about the credential itself —
          who issued it, in what format, for how long — and on the right what
          it certifies about the organisation. The first version stacked the
          card, a boxed attribute grid and a boxed explainer down one column,
          which left the right half of the page empty beside the card and made
          the attributes read as a form summary rather than as the contents
          of a document. */}
      <Panel padded={false}>
        <div className="relative z-[4] grid min-[761px]:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4 border-b border-subtle p-5 min-[641px]:p-6 min-[761px]:border-b-0 min-[761px]:border-r">
            <CredentialCard type="Business Registration" issuer={issuer} status="offered" />
            <dl className="m-0 flex flex-col">
              {[
                { label: "Issued by", value: issuer },
                { label: "Issued to", value: `${shortName}\u2019s wallet` },
                { label: "Format", value: "W3C verifiable credential" },
                { label: "Valid until", value: "Doesn\u2019t expire" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-baseline justify-between gap-4 py-2 ${i > 0 ? "border-t border-subtle" : ""}`}
                >
                  <dt className="flex-none text-[12.5px] text-faint">{row.label}</dt>
                  <dd className="m-0 min-w-0 text-right text-[13px] text-body">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex min-w-0 flex-col p-5 min-[641px]:p-6">
            <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What it certifies</h2>
            <dl className="m-0 mt-2 flex flex-col">
              {attributes.map((attribute, i) => (
                <div
                  key={attribute.name}
                  className={`grid gap-0.5 py-3 min-[521px]:grid-cols-[minmax(0,170px)_minmax(0,1fr)] min-[521px]:items-baseline min-[521px]:gap-5 ${
                    i > 0 ? "border-t border-subtle" : ""
                  }`}
                >
                  <dt className="text-[12.5px] text-faint">{attributeLabel(attribute.name)}</dt>
                  <dd className="m-0 min-w-0 break-words text-[14px] font-medium text-strong">
                    <AttributeValue name={attribute.name} value={attribute.value} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-subtle pt-5">
              {shown === "issuing" ? (
                <p role="status" className="m-0 flex items-center gap-2.5 text-[13px] text-body">
                  <Icon name="refresh" size={15} strokeWidth={2} className="animate-spin text-accent" />
                  Adding it to the organisation&rsquo;s wallet…
                </p>
              ) : (
                <GradientButton onClick={accept}>
                  <Icon name="check" size={15} strokeWidth={2.2} />
                  Accept the registration
                </GradientButton>
              )}
            </div>
          </div>
        </div>
      </Panel>
    </OnboardingShell>
  );
}

/* The payload's own attribute names are snake case — right for the wire,
   wrong on a document. The first version printed them lowercased with the
   underscores swapped for spaces ("registered name"), which read as a debug
   dump of the payload rather than as a registration. */
function attributeLabel(name: string): string {
  const words = name.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* Dates arrive as ISO strings and are written the way the rest of the
   console writes them; the registration number is set in mono because it is
   an identifier people read out and compare character by character; and the
   register's status goes through StatusPill, because a status is never told
   by the word alone in this console either. */
function AttributeValue({ name, value }: { name: string; value: string }) {
  if (name === "status") {
    return <StatusPill status={value.toLowerCase() === "active" ? "active" : "pending"} label={value} />;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return <>{formatDate(value)}</>;
  if (name === "registration_number") return <span className="font-mono text-[13.5px] tabular-nums">{value}</span>;
  return <>{value}</>;
}
