"use client";

import Link from "next/link";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { DetailLayout } from "@/components/ui/DetailLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ScopeSummary } from "@/components/ui/ScopeSummary";
import { StatusPill } from "@/components/ui/StatusPill";
import { DetailList } from "@/components/ui/DetailList";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";
import { PERSONAS } from "@/lib/demoData";

import { formatDate, legalBasisLabel } from "./scopeModel";

/**
 * C4 — the Controller's informed acceptance. A trust-defining moment, and
 * the screen the plan says to run the comprehension test on.
 *
 * WHAT MAKES THIS NOT A TERMS CHECKBOX
 *
 * The authority comes first and in full, before any duty or any button. A
 * person cannot meaningfully accept duties attached to an authority they have
 * not read, and putting the summary below the fold, or behind a "view
 * details" link, turns this into the thing every user has learned to click
 * past. The order is: here is exactly what you may do, here is what you take
 * on by accepting, now decide.
 *
 * Declining is a real, equal option — a button of the same weight, not a grey
 * link. If the only easy path is acceptance then the acceptance means
 * nothing, and this is precisely the record that has to mean something later.
 *
 * No statute numbers anywhere in the copy. The duties come from the Act, and
 * a reader who needs the citation is not the reader this screen is for; a
 * person deciding whether to take on an obligation needs to know what the
 * obligation is in words they can act on.
 */
const DUTIES = [
  {
    icon: "shieldCheck" as const,
    title: "Act only within this authority",
    body: "Only the operations above, only for the entity's purposes. If you need to do something outside it, ask for the authority to be changed — never work around it.",
  },
  {
    icon: "lock" as const,
    title: "Keep what you learn to yourself",
    body: "What you see acting for the entity is the entity's, not yours. Use it for the task in front of you and nothing else.",
  },
  {
    icon: "eyeOff" as const,
    title: "Disclose as little as will do",
    body: "When a relying party asks for a proof, share what they actually need. The console will default to the minimum; do not widen it without a reason you could give out loud.",
  },
  {
    icon: "fileText" as const,
    title: "Let your actions be checked",
    body: "Everything done under this authority is recorded against you and the entity together, permanently, and can be reviewed.",
  },
  {
    icon: "bell" as const,
    title: "Say something when something is wrong",
    body: "If you see an action you did not take, or you can no longer carry this responsibility, tell the owner promptly.",
  },
];

export function AcceptDutiesView({ relationId }: { relationId: string }) {
  const { relations, personById, acceptRelation, declineRelation, harness, setPersona } = useDemo();

  const screenState = useScreenState("C4", ["pending", "accepted", "declined"]);

  const [declineOpen, setDeclineOpen] = useState(false);
  const [asked, setAsked] = useState(false);

  const relation = relations.find((r) => r.id === relationId);

  if (!relation) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader crumbs={[{ label: "Authority" }]} title="Nothing to accept" />
          <Panel>
            <p className="relative z-[4] text-[13.5px] text-muted">
              This authority no longer exists. It may have been reset with the demo.
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const person = personById(relation.personId);
  const firstName = person.name.split(" ")[0];

  /* Only the person the authority was proposed to can accept it. That is a
     product rule, not a demo convenience — an owner who could accept on a
     controller's behalf would make the acceptance record worthless, which is
     the one thing it cannot be.
   
     It is also the story's second hand-off: the owner sends the grant and the
     screen changes hands. Rather than silently showing the owner a page
     written in the second person, the mismatch is named and switching is one
     click, so the demo teaches the hand-off instead of hiding it. */
  const isAddressee = harness.persona === relation.personId;
  const viewer = personById(harness.persona);

  /* Only a drivable persona can be switched to. A relation proposed to
     someone the demo is never driven as (Sonam, say) still shows the mismatch
     notice, just without an offer to become them. */
  const switchable = PERSONAS.find((id) => id === relation.personId);

  /* The screen's own state wins over the stored one, so the switcher can show
     the accepted and declined faces without the demo having to be walked into
     them first. */
  const decided =
    screenState === "accepted"
      ? "accepted"
      : screenState === "declined"
        ? "declined"
        : relation.state === "ACTIVE"
          ? "accepted"
          : relation.state === "TERMINATED"
            ? "declined"
            : null;

  /* The instrument and the legal basis are what somebody deciding whether
     to accept checks the sentences against, so they belong beside them
     rather than between the scope and the duties. */
  const provenance = (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-1">
        <h2 className="font-display text-[15px] font-semibold text-strong">
          Where this authority comes from
        </h2>
      </div>
      <div className="relative z-[4]">
        <DetailList
          items={[
            { label: "Granted by", value: "Pelden Trading Pvt. Ltd." },
            { label: "Legal basis", value: legalBasisLabel(relation.legalBasis) },
            {
              label: "Signed instrument",
              value: relation.instrument
                ? `${relation.instrument.fileName} · ${relation.instrument.reference}`
                : "None attached",
            },
            {
              label: "Document fingerprint",
              value: relation.instrument?.hash ?? "—",
              mono: true,
            },
            {
              label: "In force",
              value: relation.scope.validUntil
                ? `${formatDate(relation.scope.validFrom)} until ${formatDate(
                    relation.scope.validUntil,
                  )}`
                : `${formatDate(relation.scope.validFrom)}, with no end date`,
            },
          ]}
        />
      </div>
    </Panel>
  );

  return (
    <AppShell>
      <DetailLayout
        side={provenance}
        header={
          <PageHeader
            crumbs={[{ label: isAddressee ? "Your authority" : "Controllership" }]}
            /* Tense first, person second. An owner opening a relation that is
               already active must not be told it is "proposed" — it was
               accepted, and the screen is now a record rather than a decision. */
            title={
              decided === "accepted"
                ? isAddressee
                  ? "Your authority is active"
                  : `${person.name}'s authority is active`
                : decided === "declined"
                  ? isAddressee
                    ? "You declined this authority"
                    : `${person.name} declined this authority`
                  : isAddressee
                    ? "Authority proposed to you"
                    : `Authority proposed to ${person.name}`
            }
            actions={
              <StatusPill
                status={
                  decided === "accepted"
                    ? "active"
                    : decided === "declined"
                      ? "terminated"
                      : "pending_acceptance"
                }
              />
            }
          />
        }
      >
        {!isAddressee && !decided ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Icon
                  name="eye"
                  size={17}
                  strokeWidth={1.9}
                  className="mt-0.5 flex-none"
                  style={{ color: "var(--ndi-warning)" }}
                />
                <div className="flex flex-col gap-1">
                  <p className="font-display text-[14.5px] font-semibold text-strong">
                    This is what {person.name} sees
                  </p>
                  <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                    You are signed in as {viewer.name}. Only {firstName} can accept
                    this authority — an acceptance made on someone&rsquo;s behalf
                    would not be worth recording.
                  </p>
                </div>
              </div>
              {switchable ? (
                <div>
                  <HairlineButton onClick={() => setPersona(switchable)}>
                    <Icon name="user" size={14} strokeWidth={2} />
                    Continue as {firstName}
                  </HairlineButton>
                </div>
              ) : null}
            </div>
          </Panel>
        ) : null}

        {decided === "accepted" ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 flex-none text-accent" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  {isAddressee ? "You accepted" : `${firstName} accepted`} this on{" "}
                  {formatDate(relation.acceptedAt ?? new Date().toISOString())}
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {isAddressee
                    ? "You can now act for Pelden Trading within the authority below. You can see it at any time, but you cannot change it — only the owner can."
                    : `${firstName} can now act for Pelden Trading within the authority below, and cannot change any of it.`}
                </p>
                {isAddressee ? (
                  <div className="mt-2">
                    <Link href="/wallet/authority">
                      <HairlineButton>
                        See what I may do
                        <Icon name="arrowRight" size={14} strokeWidth={2} />
                      </HairlineButton>
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </Panel>
        ) : null}

        {decided === "declined" ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon
                name="info"
                size={18}
                strokeWidth={2}
                className="mt-0.5 flex-none"
                style={{ color: "var(--ndi-warning)" }}
              />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  {isAddressee ? "You declined this authority" : `${firstName} declined this authority`}
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {isAddressee
                    ? "Nothing was granted and you cannot act for the entity. The owner has been told. If this was a mistake, they can propose it again."
                    : `Nothing was granted and ${firstName} cannot act for the entity. A new authority would have to be proposed and accepted from the beginning.`}
                </p>
              </div>
            </div>
          </Panel>
        ) : null}

        {/* ---- The authority itself, first and in full ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              {isAddressee ? "What you would be able to do" : `What ${firstName} would be able to do`}
            </h2>
            <p className="text-[12.5px] leading-[1.5] text-faint">
              Acting for Pelden Trading Pvt. Ltd. — never as it. Every action
              is recorded as the entity&rsquo;s, carried out by you.
            </p>
          </div>
          <div className="relative z-[4] mt-4">
            <ScopeSummary
              /* Second person when it is your own authority, the name when
                 somebody else is looking at it. A sentence saying "You may
                 present proofs" to the owner reading a controller's grant is
                 the impersonation the product exists to avoid. */
              personName={isAddressee ? "You" : person.name}
              scope={relation.scope}
              isRootAuthority={relation.isRootAuthority}
            />
          </div>
        </Panel>

        {/* ---- What accepting means ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              {isAddressee ? "What you take on by accepting" : `What ${firstName} takes on by accepting`}
            </h2>
            <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
              These are duties in law, not house rules. They hold for as long as
              {isAddressee ? " you have" : ` ${firstName} has`} this authority.
            </p>
          </div>

          <ul className="relative z-[4] mt-4 flex flex-col gap-3.5">
            {DUTIES.map((duty) => (
              <li key={duty.title} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-[9px] border border-grid"
                  style={{ background: "var(--ndi-mint-08)" }}
                >
                  <Icon name={duty.icon} size={14} strokeWidth={1.9} className="text-accent" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-display text-[13.5px] font-medium leading-[1.4] text-body">
                    {duty.title}
                  </span>
                  <span className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                    {duty.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {!decided ? (
          <>
            {asked ? (
              <p
                role="status"
                aria-live="polite"
                className="flex items-start gap-2 rounded-xl border border-grid bg-[var(--ndi-mint-08)] px-3.5 py-3 text-[13px] leading-[1.5] text-accent"
              >
                <Icon name="check" size={14} strokeWidth={2.2} className="mt-px flex-none" />
                <span>
                  Your question has gone to Dorji Wangchuk. This authority stays
                  waiting until you decide — nothing expires while you ask.
                </span>
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2.5">
              <GradientButton
                onClick={() => acceptRelation(relation.id)}
                disabled={!isAddressee}
              >
                <Icon name="check" size={15} strokeWidth={2.2} />
                Accept these duties
              </GradientButton>
              {/* Same visual weight as accepting. If declining is a grey link,
                  the acceptance it sits beside is not a real choice. */}
              <HairlineButton onClick={() => setDeclineOpen(true)} disabled={!isAddressee}>
                Decline
              </HairlineButton>
              <HairlineButton onClick={() => setAsked(true)}>
                Ask the owner a question
              </HairlineButton>
            </div>
            <p className="text-[12.5px] leading-[1.5] text-faint">
              You cannot change any of this yourself, now or later. Only the
              owner can, and any change comes back to you to accept again.
            </p>
          </>
        ) : null}

        <Dialog
          open={declineOpen}
          onClose={() => setDeclineOpen(false)}
          tone="danger"
          title="Decline this authority?"
          lead="Nothing will be granted and you will not be able to act for Pelden Trading. The owner will be told that you declined."
          consequences={[
            "No authority is granted to you",
            "The owner has to propose a new authority if this was a mistake",
            "Nothing is recorded against you beyond the fact that you declined",
          ]}
          confirmLabel="Decline"
          onConfirm={() => {
            declineRelation(relation.id, `Declined by ${person.name}.`);
            setDeclineOpen(false);
          }}
        />
      </DetailLayout>
    </AppShell>
  );
}
