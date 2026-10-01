"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { WaveBanner } from "@/components/ui/WaveBanner";
import { Icon } from "@/components/ui/icons";
import { NeedsAttention } from "@/features/wallet/NeedsAttention";
import { useDemo } from "@/lib/demoStore";

/**
 * B1 — the landing surface.
 *
 * Two products share this screen, and the order matters. The entity-wallet
 * tasks come first because they are what somebody signing in has come to do;
 * the issuer/verifier panels below are the surrounding product and belong to
 * the owner. A Controller sees only the first part — not a dimmed version of
 * the second, which would advertise capabilities they do not have.
 */
export function DashboardView({ firstName }: { firstName?: string } = {}) {
  const { organizations, schemas, credDefs, credentials, activity, currentPerson, harness, firstRun } =
    useDemo();

  /* The suspended face is a §9 global rather than a fixture state: a
     controller whose authority is pulled mid-session must hit an explained
     dead end, not a dashboard that quietly still works. */
  const screenState = useScreenState("B1", ["has_tasks", "all_clear", "access_suspended"]);

  const name = firstName ?? currentPerson.name.split(" ")[0];
  const isOwner = harness.persona === "dorji";

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {/* A first day is greeted as one. "Welcome back" over an empty
            console reads as data that went missing; "welcome" over the same
            console reads as a beginning. */}
        <WaveBanner
          eyebrow="— Dashboard"
          title={
            <>
              {firstRun ? "Welcome" : "Welcome back"},{" "}
              <span className="ndi-wave-text ndi-wave-tight">{name}</span>
            </>
          }
          lead={
            firstRun
              ? `${organizations[0]?.name ?? "Your organisation"} is verified and holds its registration. Nothing has happened here yet.`
              : "Issue and verify credentials on the Bhutan NDI network."
          }
          action={
            firstRun && isOwner ? (
              <Link href="/controllership/relations/new">
                <GradientButton>
                  <Icon name="userCheck" size={16} strokeWidth={2} />
                  Grant someone authority
                </GradientButton>
              </Link>
            ) : (
              <Link href="/credentials/issue">
                <GradientButton>
                  <Icon name="issue" size={16} strokeWidth={2} />
                  Issue credential
                </GradientButton>
              </Link>
            )
          }
        />

        {firstRun && isOwner && screenState !== "access_suspended" ? <FirstSteps /> : null}

        {screenState === "access_suspended" ? (
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
                  Your access has been suspended
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  Nothing you attempt will go through while it is paused, so
                  there is no point starting anything. The owner can lift it, and
                  you can appeal it.
                </p>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  <Link href="/wallet/authority">
                    <HairlineButton className="h-10 px-4 text-[13px]">
                      See my authority
                    </HairlineButton>
                  </Link>
                  <Link href="/appeals">
                    <HairlineButton className="h-10 px-4 text-[13px]">Appeal it</HairlineButton>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          /* The entity wallet leads. `all_clear` empties the queue so the
             cleared face can be reviewed without deciding everything first. */
          <NeedsAttention key={screenState} allClear={screenState === "all_clear"} />
        )}

        {/* The surrounding issuer/verifier product, owner only. A controller
            shown a dimmed version of this has been told about capabilities
            they do not have. */}
        {!isOwner ? null : (
        <>
        {/* Column count follows the space the cards actually have, not the
            viewport. A viewport breakpoint got this backwards: at 900px the
            drawer is closed and the full width goes to one stretched card,
            then at 901px the sidebar claims 248px and the same content has to
            fit two. Letting the track size drive it also fills a wide display
            with four across instead of two and a lake of empty space. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
          <StatCard
            title="Schemas"
            count={schemas.length}
            hint="A schema names the attributes a credential carries — it is the shape, not the data."
            emptyIcon="fileText"
            emptyMessage="You have no schemas created."
          >
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {schemas.slice(0, 3).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-[13.5px] text-body">{s.name}</span>
                  <span className="flex-none font-mono text-[11px] text-faint">v{s.version}</span>
                </li>
              ))}
            </ul>
          </StatCard>

          <StatCard
            title="Credential definitions"
            count={credDefs.length}
            hint="A credential definition binds one schema to one issuing organization, ready to issue against."
            emptyIcon="credentials"
            emptyMessage="You have no credential definitions created."
          >
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {credDefs.slice(0, 3).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-[13.5px] text-body">{d.tag}</span>
                  <span className="flex-none text-[12px] text-faint">
                    {d.revocable ? "Revocable" : "Fixed"}
                  </span>
                </li>
              ))}
            </ul>
          </StatCard>

          <StatCard
            title="Credentials issued"
            count={credentials.length}
            hint="Every credential this organization has offered, and what became of it."
            emptyIcon="issue"
            emptyMessage="You have not issued any credentials yet."
          >
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {credentials.slice(0, 3).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-[13.5px] text-body">{c.holder}</span>
                  <span className="flex-none text-[12px] capitalize text-faint">{c.state}</span>
                </li>
              ))}
            </ul>
          </StatCard>
        </div>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <h2 className="m-0 font-display text-[17px] font-semibold leading-[1.25] tracking-[-0.01em] text-strong">
              Recent activity
            </h2>
            {activity.length ? (
              <ol className="m-0 flex list-none flex-col p-0">
                {activity.slice(0, 6).map((a, i) => (
                  <li
                    key={a.id}
                    className={`flex flex-wrap items-center justify-between gap-3 py-2.5 ${
                      i > 0 ? "border-t border-subtle" : ""
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 flex-none rounded-full"
                        style={{ background: "var(--accent)" }}
                      />
                      <span className="truncate text-[13.5px] text-body">{a.text}</span>
                    </span>
                    <span className="flex-none text-[12px] text-faint">{a.at}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="m-0 text-[13.5px] text-muted">Looks like there is no activity yet.</p>
            )}
          </div>
        </Panel>
        </>
        )}
      </div>
    </AppShell>
  );
}

/**
 * The three things a new organisation's owner does next, in the order the
 * product expects them. Shown only on the first day, and only to the owner —
 * nobody else can act for the organisation yet.
 */
function FirstSteps() {
  const steps: { icon: "userCheck" | "users" | "credentials"; title: string; body: string; href: string; cta: string }[] = [
    {
      icon: "userCheck",
      title: "Appoint someone to act for it",
      body: "Give a named person scoped authority — what they may do, for whom, and until when. They have to accept it.",
      href: "/controllership/relations/new",
      cta: "Grant authority",
    },
    {
      icon: "users",
      title: "Invite your colleagues",
      body: "Members can see the organisation. Acting for it is set up separately.",
      href: "/members/invite",
      cta: "Invite a member",
    },
    {
      icon: "credentials",
      title: "See its registration",
      body: "The credential it just accepted — the root every later authority traces back to.",
      href: "/wallet/credentials",
      cta: "Open held credentials",
    },
  ];
  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-4">
        <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Start here</h2>
        <ol className="m-0 grid list-none gap-3 p-0 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {steps.map((step, i) => (
            <li key={step.href} className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3.5">
              <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-grid font-mono text-[11px] text-muted">
                  {i + 1}
                </span>
                <span className="font-display text-[13.5px] font-medium text-body">{step.title}</span>
              </span>
              <span className="text-[12.5px] leading-[1.55] text-faint">{step.body}</span>
              <Link href={step.href} className="ndi-plainlink mt-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent">
                {step.cta}
                <Icon name="arrowRight" size={13} strokeWidth={2} />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}
