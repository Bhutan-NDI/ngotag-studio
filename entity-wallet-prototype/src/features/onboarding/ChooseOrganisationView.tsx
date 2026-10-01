"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { REGISTER_LISTINGS } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS, REGISTER_CHECK_MS, ROUND_TRIP_MS, SKIP_AFTER_MS } from "@/lib/demoTiming";

import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

type Stage = "looking_up" | "listed" | "none_found" | "register_unavailable" | "confirming" | "provisioning" | "review_form";

/**
 * Flow 2 step 3 — the register lists what you represent, and you choose.
 *
 * LIST, THEN SELECT (decided 24 Sep 2026)
 *
 * The register is asked, about the person the wallet proof just
 * established, which organisations it lists them against. They pick one. The
 * organisation is a selection — an opaque reference the register returned —
 * not a registration number someone typed, so nobody can claim a company by
 * knowing its number, and a typo cannot send a real person's identity to be
 * checked against the wrong company. Verification then runs on the chosen
 * pair.
 *
 * THE ONE WAIT THAT IS NOT COMPRESSED
 *
 * Asking the register is where the platform admits it cannot assert an
 * organisation's identity by itself. Every other wait in the demo is about
 * two seconds; this one is four, on purpose, so the most important
 * architectural fact in the product does not slide past. It can be skipped,
 * and the presenter's guide asks that it is not.
 *
 * NO MATCH IS A REVIEW, NOT A DEAD END (decided 24 Sep 2026)
 *
 * When the register lists nothing — or not the organisation the person
 * expected — the person asks NDI to review it instead, sending what shows
 * they represent it. Until that is approved the organisation stays an
 * ordinary one: it can hold nothing. An unreachable register is different:
 * that is a fault to retry, not a reason to route around the check.
 *
 * AN ORGANISATION ALREADY HERE IS NOT REGISTERED TWICE
 *
 * The second listing is on the platform already, added by another director.
 * Registering it again would be re-onboarding, which the Flow 1 design calls
 * a defect wherever it appears; the way in is an invitation from them.
 */
export function ChooseOrganisationView() {
  const { hydrated } = useDemo();
  /* The body's first stage is worked out from saved state — which kind, and
     whether a refused case is coming back — and the store reads that after
     mount. Computing it before then would start a register lookup for a
     civil society organisation on every hard reload. */
  if (!hydrated) {
    return (
      <OnboardingShell current={2}>
        <div aria-hidden="true" className="h-56 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }
  return <ChooseOrganisation />;
}

function ChooseOrganisation() {
  const router = useRouter();
  const { orgOnboarding, manualReviews, orgInvitations, selectOrganisation, submitManualReview } = useDemo();

  const screenState = useScreenState("A3", [
    "live",
    "looking_up",
    "listed",
    "none_found",
    "register_unavailable",
    "confirming",
    "review_form",
  ]);

  const kind = kindOf(orgOnboarding?.kind);
  const proved = orgOnboarding?.provedName;

  /* INVITED BY NDI (FLOW-ONB-02 Kind O, self-service off). The invitation
     already names the organisation, so there is nothing to choose — but the
     invitation is not the trust decision either. The register is asked the
     narrower question, "does it list this person against this one?", and
     the answer decides exactly as it does on the self-service route. */
  const invitation = orgOnboarding?.invitationId
    ? orgInvitations.find((i) => i.id === orgOnboarding.invitationId)
    : undefined;
  const invitedName = invitation?.legalName ?? null;
  const namedListing = invitedName
    ? REGISTER_LISTINGS.find((l) => l.legalName.toLowerCase() === invitedName.toLowerCase() && !l.onPlatform)
    : undefined;

  /* A refused case comes back here to be sent again with more, so it opens
     on the form with what was sent before — not on a fresh register lookup
     that would only list nothing a second time. */
  const refused = manualReviews.find((m) => m.id === orgOnboarding?.reviewId && m.state === "REFUSED");

  const [stage, setStage] = useState<Stage>(kind.register && !refused ? "looking_up" : "review_form");
  const [skippable, setSkippable] = useState(false);
  const [choice, setChoice] = useState<string>(REGISTER_LISTINGS.find((l) => !l.onPlatform)?.ref ?? "");
  const [reviewReason, setReviewReason] = useState<"none" | "not_listed" | "no_register">(
    kind.register ? "none" : "no_register",
  );
  const [legalName, setLegalName] = useState(refused?.legalName ?? "");
  const [number, setNumber] = useState(refused?.registrationNumber ?? "");
  const [files, setFiles] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const outcome = useRef<"listed" | "none_found">("listed");

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* The lookup starts on arrival: the person has already proved who they
     are, and there is nothing to ask them before the register answers. */
  const finishLookup = () => {
    if (invitedName && outcome.current === "listed") {
      if (namedListing) confirmRef(namedListing.ref);
      else setStage("none_found");
      return;
    }
    setStage(outcome.current);
  };

  const lookUp = () => {
    setSkippable(false);
    setStage("looking_up");
    timers.current.push(setTimeout(() => setSkippable(true), SKIP_AFTER_MS));
    timers.current.push(setTimeout(finishLookup, REGISTER_CHECK_MS));
  };

  useEffect(() => {
    if (!kind.register || !proved || refused) return;
    lookUp();
    // Once, on arrival — a later change to the case must not re-ask the register.
  }, [kind.register, proved]);

  const shown: Stage = screenState === "live" ? stage : (screenState as Stage);

  if (!proved && screenState === "live") {
    return (
      <OnboardingShell current={2}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="font-display text-[15px] font-semibold text-strong">Prove who you are first</p>
            <p className="text-[13px] leading-[1.6] text-muted">
              The register is asked about the person the wallet proof established, so that has to
              come first.
            </p>
            <div>
              <Link href="/onboarding/prove">
                <GradientButton>Prove who you are</GradientButton>
              </Link>
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  const register = kind.register ?? "register";
  const selected = REGISTER_LISTINGS.find((l) => l.ref === choice);

  const confirm = () => {
    if (selected) confirmRef(selected.ref);
  };

  function confirmRef(ref: string) {
    selectOrganisation(ref);
    setChoice(ref);
    setStage("confirming");
    timers.current.push(
      setTimeout(() => {
        setStage("provisioning");
        timers.current.push(setTimeout(() => router.push("/onboarding/foundational"), LOCAL_MS + 400));
      }, ROUND_TRIP_MS),
    );
  }

  const toReview = (why: "none" | "not_listed") => {
    setReviewReason(why);
    /* When the register lists nothing, the organisation is almost always the
       one the story is about — Pelden, whose register entry is behind — so
       the form starts with it, and the presenter is not typing on stage. A
       listed-but-not-this-one case is a different organisation by
       definition, so that form starts empty. */
    if (why === "none" && !legalName) {
      setLegalName(invitedName ?? "Pelden Trading Pvt. Ltd.");
      setNumber(invitedName && !invitedName.startsWith("Pelden") ? "" : "CRA-2019-04477");
    }
    setStage("review_form");
  };

  const registerAnswer =
    reviewReason === "no_register"
      ? "No register can confirm this kind of organisation automatically."
      : reviewReason === "not_listed"
        ? `The ${register} listed ${REGISTER_LISTINGS.length} organisations for this person, but not this one.`
        : `The ${register} listed no organisations for this person.`;

  const submit = () => {
    if (!legalName.trim() || !number.trim() || files.length === 0) return;
    setBusy(true);
    timers.current.push(
      setTimeout(() => {
        submitManualReview({
          legalName: legalName.trim(),
          registrationNumber: number.trim(),
          evidence: files,
          note: note.trim(),
          registerAnswer,
        });
        router.push("/onboarding/review");
      }, LOCAL_MS),
    );
  };

  return (
    <OnboardingShell current={2}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          {shown === "review_form"
            ? "Ask NDI to review your organisation"
            : invitedName
              ? `Confirm you represent ${invitedName}`
              : "Choose your organisation"}
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          {shown === "review_form"
            ? reviewReason === "no_register"
              ? "There's no register that can confirm this kind of organisation automatically, so a person at NDI checks it instead. Tell us which organisation it is and send what shows you represent it."
              : "The register couldn't confirm this one, so a person at NDI checks it instead. Tell us which organisation it is and send what shows you represent it."
            : invitedName
              ? `Your invitation from NDI names ${invitedName}. That isn't the confirmation — the ${register} is asked whether it lists ${proved ?? "you"} as representing it.`
              : `The ${register} is asked which organisations it lists ${proved ?? "you"} as representing. You choose from what it returns — you don't type a registration number.`}
        </p>
      </div>

      {shown === "looking_up" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status" aria-live="polite">
            <p className="flex items-center gap-2.5 font-display text-[14.5px] font-semibold text-strong">
              <Icon name="refresh" size={15} strokeWidth={2.2} className="animate-spin text-accent" />
              Asking the {register}
            </p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              {invitedName
                ? `We're asking whether the register lists ${proved ?? "you"} as representing ${invitedName}.`
                : `We're asking which organisations the register lists ${proved ?? "you"} against.`}{" "}
              This is a lookup against an outside body, and it takes as long as it takes — the platform
              can&rsquo;t answer this itself.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {skippable ? (
                <button
                  type="button"
                  onClick={() => {
                    timers.current.forEach(clearTimeout);
                    finishLookup();
                  }}
                  className="ndi-plainlink text-[12.5px] font-medium text-muted"
                >
                  Skip the wait
                </button>
              ) : null}
              {/* Walkable, not only in the switcher: "what if the register
                  finds nothing?" gets asked, and the answer is a click. */}
              <button
                type="button"
                onClick={() => {
                  outcome.current = "none_found";
                  timers.current.forEach(clearTimeout);
                  timers.current.push(setTimeout(() => setStage("none_found"), ROUND_TRIP_MS));
                }}
                className="ndi-plainlink text-[12.5px] font-medium text-muted"
              >
                Show what happens if the register lists nothing
              </button>
            </div>
          </div>
        </Panel>
      ) : null}

      {shown === "listed" ? (
        <>
          <Panel>
            <fieldset className="relative z-[4] m-0 flex flex-col gap-2 border-0 p-0">
              <legend className={`${LABEL_CLASS} mb-2 p-0`}>
                The {register} lists you against {REGISTER_LISTINGS.length} organisations
              </legend>
              {REGISTER_LISTINGS.map((l) => {
                const on = choice === l.ref;
                return (
                  <label
                    key={l.ref}
                    className={`flex items-start gap-3 rounded-[11px] border px-3.5 py-3 ${l.onPlatform ? "cursor-not-allowed" : "cursor-pointer"}`}
                    style={{
                      borderColor: on ? "var(--ndi-mint-40)" : "var(--border-grid)",
                      background: on ? "var(--ndi-mint-08)" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="listing"
                      checked={on}
                      disabled={l.onPlatform}
                      onChange={() => setChoice(l.ref)}
                      className="mt-0.5 h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className={`font-display text-[14px] font-semibold ${l.onPlatform ? "text-muted" : "text-strong"}`}>
                        {l.legalName}
                      </span>
                      <span className="text-[12.5px] leading-[1.5] text-faint">
                        {l.registrationNumber} · {l.entityType} · you are listed as {l.capacity.toLowerCase()}
                      </span>
                      {l.onPlatform ? (
                        <span className="mt-1 text-[12.5px] leading-[1.5] text-muted">
                          Already on the platform — another director added it. Ask them to invite you;
                          it isn&rsquo;t registered twice.
                        </span>
                      ) : null}
                    </span>
                    {l.onPlatform ? <StatusPill status="active" label="Already here" /> : null}
                  </label>
                );
              })}
            </fieldset>
          </Panel>
          <div className="flex flex-wrap items-center gap-3">
            <GradientButton onClick={confirm} disabled={!selected || selected.onPlatform}>
              Add {selected?.legalName ?? "this organisation"}
              <Icon name="arrowRight" size={15} strokeWidth={2} />
            </GradientButton>
            <button type="button" onClick={() => toReview("not_listed")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
              My organisation isn&rsquo;t listed
            </button>
          </div>
        </>
      ) : null}

      {shown === "confirming" || shown === "provisioning" ? (
        <Panel>
          <ol className="relative z-[4] m-0 flex list-none flex-col gap-3 p-0" aria-live="polite">
            <Step
              label={`The ${register} confirms you represent ${selected?.legalName ?? invitedName ?? "the organisation"}`}
              detail="Checked on the pair you chose — you, and this organisation."
              state={shown === "confirming" ? "active" : "done"}
            />
            <Step
              label="The organisation's wallet is set up"
              detail="Its keys are created and kept on the platform. Nobody — not you, not NDI staff — is given a copy."
              state={shown === "provisioning" ? "active" : "waiting"}
            />
          </ol>
        </Panel>
      ) : null}

      {shown === "none_found" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="font-display text-[14.5px] font-semibold text-strong">
              {invitedName
                ? `The register doesn't list you as representing ${invitedName}`
                : "The register doesn't list you against any organisation"}
            </p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              Your identity was proved — that part worked. The {register} simply has no organisation
              recorded with you as its representative. That happens when a register is behind, or
              when records were kept on paper.
            </p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              You can ask NDI to review it instead. Until a person there approves it, the organisation
              stays an ordinary one and can&rsquo;t hold anything.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <GradientButton onClick={() => toReview("none")}>Ask NDI to review it</GradientButton>
              <Link href="/welcome">
                <HairlineButton>Not now</HairlineButton>
              </Link>
            </div>
          </div>
        </Panel>
      ) : null}

      {shown === "register_unavailable" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="alert">
            <p className="font-display text-[14.5px] font-semibold text-strong">The {register} can&rsquo;t be reached</p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              So nothing can be confirmed right now, and nothing has been created. This isn&rsquo;t a
              reason to skip the check — try again in a little while.
            </p>
            <div>
              <HairlineButton onClick={lookUp}>
                <Icon name="refresh" size={14} strokeWidth={2} />
                Try again
              </HairlineButton>
            </div>
          </div>
        </Panel>
      ) : null}

      {shown === "review_form" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <p className="rounded-[10px] border border-grid px-3.5 py-3 text-[12.5px] leading-[1.55] text-muted" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              <span className="font-medium text-body">What the register said: </span>
              {registerAnswer} This goes to the reviewer with your request.
            </p>
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Organisation&rsquo;s name</span>
              <input className={`${FIELD_CLASS} h-12`} value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="As it appears on its registration" />
            </label>
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Its registration or licence number</span>
              <input className={`${FIELD_CLASS} h-12`} value={number} onChange={(e) => setNumber(e.target.value)} placeholder={orgOnboarding?.kind === "licensed" ? "BL-PARO-2011-0387" : "CRA-2024-02291"} />
            </label>
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>What shows you represent it</span>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
                className="text-[13px] text-muted"
              />
              <span className="text-[12.5px] leading-[1.5] text-faint">
                For example a certificate of incorporation and the resolution appointing you, or your
                licence and its latest renewal. Only the file names are kept in this prototype.
              </span>
            </label>
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Anything the reviewer should know</span>
              <textarea className={`${FIELD_CLASS} resize-y py-3`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why the register may not have it yet" />
            </label>
            <div className="flex flex-wrap items-center gap-3 border-t border-subtle pt-4">
              <GradientButton onClick={submit} disabled={busy || !legalName.trim() || !number.trim() || files.length === 0}>
                <Icon name="send" size={15} strokeWidth={2} />
                {busy ? "Sending…" : "Send for review"}
              </GradientButton>
              {kind.register ? (
                <HairlineButton onClick={() => setStage("listed")}>Back to the list</HairlineButton>
              ) : null}
            </div>
          </div>
        </Panel>
      ) : null}
    </OnboardingShell>
  );
}

function Step({ label, detail, state }: { label: string; detail: string; state: "waiting" | "active" | "done" }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border"
        style={{
          borderColor: state === "waiting" ? "var(--border-grid)" : "var(--ndi-mint-40)",
          background: state === "waiting" ? "transparent" : "var(--ndi-mint-12)",
        }}
      >
        {state === "active" ? (
          <Icon name="refresh" size={12} strokeWidth={2.4} className="animate-spin text-accent" />
        ) : state === "done" ? (
          <Icon name="check" size={12} strokeWidth={3} className="text-accent" />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-display text-[13.5px] font-medium leading-[1.4]" style={{ color: state === "waiting" ? "var(--text-faint)" : "var(--text-body)" }}>
          {label}
        </span>
        <span className="text-[12.5px] leading-[1.5] text-faint">{detail}</span>
      </span>
    </li>
  );
}
