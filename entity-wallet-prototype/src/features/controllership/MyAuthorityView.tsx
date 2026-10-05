"use client";

import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { EmptyState } from "@/components/ui/EmptyState";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { DetailLayout } from "@/components/ui/DetailLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ScopeSummary } from "@/components/ui/ScopeSummary";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { formatDate, legalBasisLabel } from "./scopeModel";

/**
 * B2 — a Controller's own view of what they may do. Read-only, and the fact
 * that it is read-only is the point.
 *
 * There is no edit affordance anywhere on this screen, not even a disabled
 * one. A Controller can never change their own scope, and a greyed-out "edit"
 * button would tell them that self-service is a thing that exists and they
 * merely lack the permission — which is the wrong model of the whole product.
 * What replaces it is a request that goes to the owner.
 *
 * The screen answers three questions in order: what may I do, why can I do it,
 * and what have I done. The middle one matters more than it looks — a
 * Controller who can see the board resolution their authority rests on
 * understands their position very differently from one who just has buttons.
 */
export function MyAuthorityView() {
  const { relations, auditEntries, currentPerson, harness } = useDemo();

  const screenState = useScreenState("B2", [
    "active",
    "expiring_soon",
    "suspended",
    "expired",
    "no_authority",
  ]);

  const [requested, setRequested] = useState(false);

  const relation = relations.find(
    (r) => r.personId === harness.persona && r.state !== "TERMINATED",
  );

  /* Pema holds no controllership at all — she acts on credentials in her own
     wallet. Landing here should explain that rather than look broken, which
     is the §9 "suspended or expired mid-session" requirement generalised:
     every dead end gets a reason and a way onward. */
  if (screenState === "no_authority" || !relation) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader crumbs={[{ label: "My authority" }]} title="You hold no authority here" />
          <Panel padded={false}>
            <EmptyState
              icon="lockRounded"
              title="Nothing has been granted to you"
              message="You do not act for this entity through the console. If you hold a role or capability credential, it lives in your own wallet and is checked wherever you use it."
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  /* The state shown is the switcher's when it is driving, otherwise the
     relation's own. Normalised to lower case in one place, because the
     relation's lifecycle values are upper case and the switcher's are not —
     comparing both spellings at every call site is how one of them gets
     missed and a suspended authority renders as live.

     Expiring-soon is not a stored state: it is a reading of the end date, and
     the only one of these the fixtures cannot hold. */
  const shown = (screenState === "active" ? relation.state : screenState).toLowerCase();
  const expiringSoon = screenState === "expiring_soon";
  const stopped = shown === "suspended" || shown === "expired";

  const myActions = auditEntries.filter((e) => e.actorId === harness.persona);

  /* Where the authority came from is what you check the sentences against,
     not part of reading them — so it sits beside them once there is room. */
  const provenance = (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-1">
        <h2 className="font-display text-[15px] font-semibold text-strong">
          Why I can do it
        </h2>
      </div>
      <div className="relative z-[4]">
        <DetailList
          items={[
            { label: "Legal basis", value: legalBasisLabel(relation.legalBasis) },
            {
              label: "Signed instrument",
              value: relation.instrument
                ? `${relation.instrument.fileName} · ${relation.instrument.reference}`
                : "None attached",
            },
            {
              label: "Accepted by me",
              value: relation.acceptedAt ? formatDate(relation.acceptedAt) : "Not yet",
            },
            {
              label: "In force",
              value: relation.scope.validUntil
                ? `${formatDate(relation.scope.validFrom)} until ${formatDate(
                    relation.scope.validUntil,
                  )}`
                : `${formatDate(relation.scope.validFrom)}, with no end date`,
            },
            { label: "Scope version", value: `Version ${relation.scope.version}` },
          ]}
        />
      </div>
    </Panel>
  );

  return (
    <AppShell>
      <DetailLayout
        header={
          <PageHeader
            crumbs={[{ label: "My authority" }]}
            title="What I may do"
            actions={<StatusPill status={expiringSoon ? "expiring" : shown} />}
          />
        }
        side={provenance}
      >
        {stopped ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon
                name="shieldAlert"
                size={18}
                strokeWidth={2}
                className="mt-0.5 flex-none"
                style={{ color: "var(--ndi-danger)" }}
              />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  {shown === "expired"
                    ? "This authority has ended"
                    : "This authority is suspended"}
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {shown === "expired"
                    ? "It reached its end date, so nothing below is in force. The owner can grant a new authority, which would come back to you to accept."
                    : "The owner has paused it. Nothing below is in force while it is paused, and no action you attempt will go through. Suspension can be lifted — ask the owner, or appeal it."}
                </p>
              </div>
            </div>
          </Panel>
        ) : null}

        {expiringSoon && relation.scope.validUntil ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl border border-grid px-3.5 py-3 text-[13px] leading-[1.5]"
            style={{ background: "rgb(var(--tint) / 0.05)", color: "var(--text-body)" }}
          >
            <Icon
              name="info"
              size={14}
              strokeWidth={2}
              className="mt-px flex-none"
              style={{ color: "var(--ndi-warning)" }}
            />
            <span>
              This authority ends on {formatDate(relation.scope.validUntil)}. After
              that, everything below stops until the owner grants it again.
            </span>
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              Acting for Pelden Trading Pvt. Ltd.
            </h2>
            <p className="text-[12.5px] leading-[1.5] text-faint">
              Not as it. Everything you do is recorded as the entity&rsquo;s
              action, carried out by you.
            </p>
          </div>
          <div
            className="relative z-[4] mt-4"
            /* Dimmed when the authority is not in force, so the sentences
               cannot be read as currently true. */
            style={{ opacity: stopped ? 0.55 : 1 }}
          >
            <ScopeSummary
              personName={currentPerson.name}
              scope={relation.scope}
              isRootAuthority={relation.isRootAuthority}
            />
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              What I have done
            </h2>
            <p className="text-[12.5px] leading-[1.5] text-faint">
              Your own actions, as the entity&rsquo;s permanent record holds them.
            </p>
          </div>

          <div className="relative z-[4] mt-3">
            {myActions.length === 0 ? (
              <p className="text-[13px] text-faint">
                Nothing recorded against you yet.
              </p>
            ) : (
              <ul className="flex flex-col">
                {myActions.slice(0, 6).map((entry, i) => (
                  <li
                    key={entry.id}
                    className={`flex flex-wrap items-baseline justify-between gap-3 py-2.5 ${
                      i > 0 ? "border-t border-subtle" : ""
                    }`}
                  >
                    <span className="text-[13px] leading-[1.5] text-body">{entry.summary}</span>
                    <span className="text-[12px] text-faint">
                      {formatDate(entry.at)}
                      {entry.approvedById ? " · approved" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        {/* ---- The only action on the screen ---- */}
        {requested ? (
          <p
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-xl border border-grid bg-[var(--ndi-mint-08)] px-3.5 py-3 text-[13px] leading-[1.5] text-accent"
          >
            <Icon name="check" size={14} strokeWidth={2.2} className="mt-px flex-none" />
            <span>
              Your request has gone to Dorji Wangchuk. If he changes this
              authority, it comes back to you to accept before it takes effect.
            </span>
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2.5">
              <HairlineButton onClick={() => setRequested(true)}>
                <Icon name="send" size={14} strokeWidth={2} />
                Request a change
              </HairlineButton>
            </div>
            <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
              You cannot change your own authority — that is the point of it.
              A request goes to the owner, and anything they change comes back
              to you to accept.
            </p>
          </div>
        )}
      </DetailLayout>
    </AppShell>
  );
}
