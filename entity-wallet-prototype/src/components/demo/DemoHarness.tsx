"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";
import { ACTS, FLOW_ENTRIES, actByNumber } from "@/lib/demoStory";
import { PERSONAS } from "@/lib/demoData";

import { useScreenRegistry } from "./screenState";

/**
 * The demo harness: the marker, the persona switcher, the story runner, the
 * state switcher and reset, in one bar.
 *
 * Deliberately not part of the product chrome. It sits in its own fixed bar
 * rather than in the top bar or the sidebar, because the audience for this
 * demo includes people signing the thing off, and a persona switcher that
 * looks like a product feature invites the question "so users can become
 * other users?". Everything here is visibly scaffolding.
 *
 * Collapsed by default. The marker stays visible either way — that part is
 * not a control, it is a disclosure, and it does not get to be dismissed.
 */
export function DemoHarness() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    harness,
    people,
    setPersona,
    setAct,
    setStateOverride,
    clearStateOverrides,
    resetDemo,
    restoreStoryState,
    setSelfServiceSignup,
    hydrated,
  } = useDemo();
  const { registered } = useScreenRegistry();
  const [open, setOpen] = useState(false);

  /* The auth screens are pre-sign-in and have no persona. Showing a switcher
     there would suggest the choice matters before anyone is signed in.
     /welcome is signed in, but as the account being created in FLOW-ONB-01,
     which is not a persona — the switcher would offer to become someone the
     screen is not about. */
  const onAuthScreen =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/verify-email-success") ||
    /* The invitee opening their link is not a persona either: whether they
       have an account at all is the question SCR-INV-04 is answering. */
    pathname.startsWith("/invitation/");

  /** In story order, from the one list of who is drivable. The id is kept
   *  alongside so the switcher passes a PersonaId rather than a bare string. */
  const personas = PERSONAS.flatMap((id) => {
    const person = people.find((p) => p.id === id);
    return person ? [{ id, person }] : [];
  });

  const act = actByNumber(harness.act);

  const goToAct = (n: number) => {
    const target = actByNumber(n);
    if (!target) return;
    /* Acts 2–6 are Pelden three months in. Arriving from a freshly onboarded
       Pelden, the story skips ahead to that — it never builds act 2 on top
       of a first-day organisation that has no Rinzin and no history. */
    if (n >= 2) restoreStoryState();
    setAct(n);
    setPersona(target.persona);
    router.push(target.route);
  };

  /* The marker renders on the server along with everything else, and is not
     gated on hydration. It is a disclosure rather than a control: a claim
     about what this page is that should survive slow JavaScript, a failed
     bundle and a screenshot taken before the client caught up.

     The panel is, in effect, gated anyway — `open` starts false, so nothing
     that reads persisted persona or act state can paint before the store has
     been read. The one thing worth waiting for is the act summary, which
     would otherwise show act 1 as Dorji for a frame before swapping to
     whichever act the story was left on. */
  return (
    /* `ndi-demo-harness` insets the bar past the sidebar on desktop. The bar
       is fixed to the viewport, so without it the marker and the panel sat on
       top of the nav rail rather than beside it — and the rail is exactly
       where somebody's eye is when they go looking for the demo controls.
       Which screens have a rail is not knowable from here (the verifier,
       onboarding and the what's-real page all render without one), so the
       rule keys off the shell's own presence in the document rather than a
       list of routes that would rot. */
    <div className="ndi-demo-harness pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-start gap-2 p-3 min-[641px]:p-4">
      {open && hydrated ? (
        <div className="pointer-events-auto w-full max-w-[560px] rounded-2xl border border-grid bg-[var(--chrome-fill-strong)] p-3.5 shadow-[var(--shadow-card)] backdrop-blur-[20px] backdrop-saturate-[140%]">
          {/* ---- Story runner ---- */}
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
              Story
            </p>
            {act ? (
              <p className="font-display text-[12px] font-medium text-muted">
                Act {act.number} of {ACTS.length}
              </p>
            ) : (
              <p className="font-display text-[12px] font-medium text-faint">Not started</p>
            )}
          </div>

          <p className="mt-1.5 font-display text-[14px] font-semibold leading-[1.35] text-body">
            {act ? act.title : "Six acts, one entity"}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-muted">
            {act
              ? act.learns
              : "Start the story to be put on the right screen as the right person."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => goToAct(Math.max(1, harness.act - 1))}
              disabled={harness.act <= 1}
              className="ndi-hairline-btn inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 font-display text-[13px] font-medium disabled:opacity-40"
            >
              <Icon name="arrowLeft" size={14} strokeWidth={2} />
              Back
            </button>
            <button
              type="button"
              onClick={() => goToAct(harness.act === 0 ? 1 : Math.min(ACTS.length, harness.act + 1))}
              disabled={harness.act >= ACTS.length}
              className="ndi-hairline-btn inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 font-display text-[13px] font-medium disabled:opacity-40"
            >
              {harness.act === 0 ? "Start" : "Next"}
              <Icon name="arrowRight" size={14} strokeWidth={2} />
            </button>

            {/* Direct jumps, because a demo never runs in a straight line the
                second time — somebody always asks to see act 5 again. */}
            <div className="ml-auto flex items-center gap-1">
              {ACTS.map((a) => (
                <button
                  key={a.number}
                  type="button"
                  onClick={() => goToAct(a.number)}
                  aria-label={`Act ${a.number}: ${a.title}`}
                  aria-current={a.number === harness.act ? "step" : undefined}
                  className="ndi-navrow h-7 w-7 rounded-[8px] font-display text-[12px] font-semibold"
                  data-active={a.number === harness.act ? "1" : "0"}
                >
                  {a.number}
                </button>
              ))}
            </div>
          </div>

          {/* ---- Gate 2 flows ---- */}
          <div className="my-3 h-px bg-[var(--border-subtle)]" />
          <p className="font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
            Walk a flow
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {([1, 2] as const).map((flow) => (
              <div key={flow} className="flex flex-wrap items-center gap-1.5">
                <span className="w-[52px] flex-none font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  Flow {flow}
                </span>
                {FLOW_ENTRIES.filter((f) => f.flow === flow).map((f) => (
                  <button
                    key={f.route}
                    type="button"
                    onClick={() => {
                      if (f.persona) setPersona(f.persona);
                      if (f.selfService !== undefined) setSelfServiceSignup(f.selfService);
                      setOpen(false);
                      router.push(f.route);
                    }}
                    className="ndi-navrow rounded-[9px] px-2.5 py-1.5 font-display text-[12.5px] font-medium"
                    data-active="0"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* ---- Deployment ---- */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p id="self-service-label" className="text-[12.5px] leading-[1.5] text-muted">
              Deployment: self-service sign-up is{" "}
              <strong className="font-medium text-body">{harness.selfServiceSignup ? "on" : "off"}</strong>
              {harness.selfServiceSignup
                ? " — businesses sign up themselves."
                : " — NDI invites each business."}
            </p>
            <button
              type="button"
              role="switch"
              aria-checked={harness.selfServiceSignup}
              aria-labelledby="self-service-label"
              onClick={() => setSelfServiceSignup(!harness.selfServiceSignup)}
              className="ndi-hairline-btn inline-flex h-8 items-center rounded-full px-3 font-display text-[12px] font-medium"
            >
              Switch {harness.selfServiceSignup ? "off" : "on"}
            </button>
          </div>

          {/* ---- Persona ---- */}
          {!onAuthScreen ? (
            <>
              <div className="my-3 h-px bg-[var(--border-subtle)]" />
              <p className="font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
                Driving as
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {personas.map(({ id, person }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPersona(id)}
                    aria-pressed={harness.persona === id}
                    className="ndi-navrow flex flex-col items-start rounded-[10px] px-2.5 py-1.5 text-left"
                    data-active={harness.persona === id ? "1" : "0"}
                  >
                    <span className="font-display text-[13px] font-medium">{person.name}</span>
                    <span className="text-[11.5px] leading-tight text-faint">{person.title}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {/* ---- State switcher ---- */}
          <div className="my-3 h-px bg-[var(--border-subtle)]" />
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
              This screen&rsquo;s states
            </p>
            {Object.keys(harness.stateOverrides).length > 0 ? (
              <button
                type="button"
                onClick={clearStateOverrides}
                className="ndi-plainlink font-display text-[12px] font-medium text-muted"
              >
                Clear all
              </button>
            ) : null}
          </div>

          {registered ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {registered.states.map((s, i) => {
                const active = (harness.stateOverrides[registered.screen] ?? registered.states[0]) === s;
                return (
                  <button
                    key={s}
                    type="button"
                    /* The first entry is the natural state, so choosing it
                       removes the override rather than pinning it. */
                    onClick={() => setStateOverride(registered.screen, i === 0 ? null : s)}
                    aria-pressed={active}
                    className="ndi-navrow rounded-[9px] px-2.5 py-1.5 font-display text-[12.5px] font-medium"
                    data-active={active ? "1" : "0"}
                  >
                    {s.replace(/_/g, " ")}
                    {i === 0 ? <span className="text-faint"> · default</span> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-1.5 text-[12.5px] leading-[1.5] text-faint">
              This screen has not declared any states yet.
            </p>
          )}

          {/* ---- Reset ---- */}
          <div className="my-3 h-px bg-[var(--border-subtle)]" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] leading-[1.5] text-faint">
              Every register, approval and decision here is a fixture.
            </p>
            <button
              type="button"
              onClick={() => {
                resetDemo();
                router.push("/dashboard");
              }}
              className="ndi-hairline-btn inline-flex h-9 flex-none items-center gap-1.5 rounded-[10px] px-3 font-display text-[13px] font-medium"
            >
              <Icon name="refresh" size={14} strokeWidth={2} />
              Reset demo
            </button>
          </div>
        </div>
      ) : null}

      {/* ---- The marker, and the way in ---- */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* A link, not a label. The marker's whole job is to stop somebody
            concluding that the register integration exists, and "prototype"
            on its own does not tell them which parts are simulated — the
            page behind it does. One click from every screen. */}
        <Link
          href="/whats-real"
          className="ndi-navrow inline-flex items-center gap-2 rounded-full border border-grid bg-[var(--chrome-fill-strong)] px-3 py-1.5 backdrop-blur-[20px]"
          data-active="0"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: "var(--ndi-warning)" }}
          />
          <span className="font-display text-[11.5px] font-medium tracking-[0.02em]">
            Prototype · data simulated
          </span>
          <Icon name="arrowRight" size={11} strokeWidth={2.2} className="flex-none opacity-60" />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="ndi-hairline-btn inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-display text-[12px] font-medium"
        >
          {open ? "Hide" : "Demo controls"}
          <Icon
            name="chevronDown"
            size={13}
            strokeWidth={2}
            className="transition-transform duration-200 ease-ndi"
            style={{ transform: `rotate(${open ? 0 : 180}deg)` }}
          />
        </button>
      </div>
    </div>
  );
}
