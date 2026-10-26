"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/Checkbox";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { formatDate } from "@/features/controllership/scopeModel";
import { DEFAULT_DAYS, MAX_DAYS, ending, delegateNameOf, inDays, today, type DraftField } from "@/lib/authority";
import type { AuthorityDraft } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";
import { namesOf } from "@/lib/sharing";

import { Notice } from "./shared";

/**
 * SCR-AUT-02 — Give authority. FLOW-AUT-01 step 2; E4, E5, E6, A3.
 *
 * WHERE FIRST, SO THE REST FOLLOWS (UXD-47)
 *
 * The fields come in the specification's order: who (name, citizen ID
 * number), then where, then what — only the tasks that counterparty's
 * vocabulary entries name — then which licence, then the limit and the end
 * date. A grantor who chose tasks first could build something no
 * counterparty accepts. Every choice is a choice: nothing here is typed
 * that the service would have to interpret (UN-55).
 *
 * UNAVAILABLE IS SHOWN, NOT HIDDEN
 *
 * A licence that can't be named is listed, disabled, with why — expired,
 * revoked, its issuer not trusted, or its issuer not allowing someone acting
 * for the holder to use it (G4) — in E4's words, never "delegable" (§2.4).
 * Where none can be named, the form says so and offers *Get a business
 * licence* (UX-EW-03 SCR-CRD-01). A counterparty that isn't CURRENT on
 * NDI's list isn't offered at all (E5).
 *
 * THE LIMIT IS PER DECLARATION
 *
 * The form offers "Nu, per declaration" and nothing else, as UX-EW-05
 * gives it; every grant is written per transaction. Whether a running total
 * can ever be granted is open in the specification (pr-8 item 1), and the
 * simplest reading consistent with the screen is chosen.
 *
 * WHO MAY OPEN IT
 *
 * authority:issue, read from the relation by the store. Without it the page
 * says why and offers nothing to fill in — the store would refuse the grant
 * anyway, because the form is not the boundary.
 */
type Face =
  | "live"
  | "default"
  | "licence_unavailable"
  | "counterparty_unavailable"
  | "field_error"
  | "duplicate"
  | "loading"
  | "offline"
  | "no_permission";

const blank = (orgId: string): AuthorityDraft => ({
  orgId,
  name: "",
  cid: "",
  counterparty: "",
  tasks: [],
  licences: [],
  limit: "",
  until: inDays(DEFAULT_DAYS),
  duplicateOk: false,
});

export function GiveFormView() {
  const router = useRouter();
  const {
    hydrated,
    activeOrgId,
    organizations,
    authorityDraft,
    personById,
    giveVerdict,
    whoCanGive,
    authorityChoices,
    checkAuthorityDraft,
    saveAuthorityDraft,
    simulateLicenceIssued,
  } = useDemo();
  const forced = useScreenState("SCR-AUT-02", [
    "live",
    "default",
    "licence_unavailable",
    "counterparty_unavailable",
    "field_error",
    "duplicate",
    "loading",
    "offline",
    "no_permission",
  ]) as Face;

  const [d, setD] = useState<AuthorityDraft>(() => blank(activeOrgId));
  const [errors, setErrors] = useState<Partial<Record<DraftField, string>>>({});
  const [duplicateOf, setDuplicateOf] = useState<{ name: string; until: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [down, setDown] = useState<string | null>(null);

  /* *Change* on SCR-AUT-03 comes back to the form as it was left. */
  useEffect(() => {
    if (!hydrated) return;
    if (authorityDraft && authorityDraft.orgId === activeOrgId) setD({ ...authorityDraft, duplicateOk: false });
    // Once, when the saved state has been read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const orgName = organizations.find((o) => o.id === activeOrgId)?.name ?? "your organisation";
  const choices = hydrated ? authorityChoices() : { counterparties: [], tasks: [], licences: [] };
  const verdict = hydrated ? giveVerdict() : null;

  const offered = forced === "counterparty_unavailable" ? [] : choices.counterparties.filter((c) => c.current);
  /* One counterparty at first release — chosen for the grantor, still shown. */
  const counterparty = d.counterparty || (offered.length === 1 ? offered[0].orgId : "");
  const cpName = offered.find((c) => c.orgId === counterparty)?.name ?? "the organisation";
  const tasks = choices.tasks.filter((t) => t.counterparty === counterparty);
  const licences = forced === "licence_unavailable" ? choices.licences.map((l) => ({ ...l, unusable: l.unusable ?? "it has expired" })) : choices.licences;
  const usable = licences.filter((l) => !l.unusable);
  const needsLicence = tasks.some((t) => t.needsLicence);

  const set = <K extends keyof AuthorityDraft>(k: K, v: AuthorityDraft[K]) => {
    setD((x) => ({ ...x, [k]: v, duplicateOk: false }));
    setDuplicateOf(null);
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const toggle = (k: "tasks" | "licences", v: string, on: boolean) => set(k, on ? [...d[k], v] : d[k].filter((x) => x !== v));

  const shownErrors: Partial<Record<DraftField, string>> =
    forced === "field_error"
      ? { until: "Authority can last up to a year.", limit: "Enter a limit above zero.", tasks: "Choose at least one thing they can do." }
      : errors;
  const shownDuplicate = forced === "duplicate" ? { name: d.name || "Pema Choden", until: inDays(59) } : duplicateOf;

  const go = (duplicateOk: boolean) => {
    if (forced !== "live") return;
    /* The organisation being worked in now — the form's first render can
       predate the saved state, which is when it was made. */
    const draft: AuthorityDraft = { ...d, orgId: activeOrgId, counterparty, duplicateOk };
    setChecking(true);
    /* "Checking…" — G4–G7 run on the service. */
    window.setTimeout(() => {
      setChecking(false);
      const check = checkAuthorityDraft(draft);
      setErrors(check.errors);
      setDown(check.counterpartyDown);
      if (Object.keys(check.errors).length || check.counterpartyDown) return;
      if (check.duplicate && !duplicateOk) {
        setDuplicateOf({ name: delegateNameOf(check.duplicate), until: check.duplicate.validUntil });
        return;
      }
      saveAuthorityDraft(draft);
      router.push("/authority-to-act/give/check");
    }, LOCAL_MS);
  };

  const cancel = () => {
    saveAuthorityDraft(null);
    router.push("/authority-to-act");
  };

  const face: Face = forced !== "live" ? forced : checking ? "loading" : "default";
  const mayGive = forced === "no_permission" ? false : verdict?.kind === "may";

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (!mayGive) {
    const can = verdict?.kind === "no_permission" ? verdict.can : whoCanGive();
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
          <PageHeader crumbs={[{ label: "Authority", href: "/authority-to-act" }, { label: "Give authority" }]} title={`Give someone authority to act for ${orgName}`} />
          <Notice role="alert" tone="warning">
            {verdict?.kind === "not_in_standing"
              ? `${orgName} can't give authority at the moment: ${verdict.reason}.`
              : verdict?.kind === "no_approver"
                ? "Nobody else here can approve authority you give, so you can't give it yet."
                : `You can't give authority for ${ending(orgName)}${can.length ? ` ${namesOf(can.map((id) => personById(id).name))} can.` : ""}`}
          </Notice>
          <div>
            <HairlineButton onClick={() => router.push("/authority-to-act")}>Back to Authority</HairlineButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const err = (k: DraftField) =>
    shownErrors[k] ? (
      <span role="alert" className="text-[12.5px] leading-[1.5]" style={{ color: "var(--ndi-danger)" }}>
        {shownErrors[k]}
      </span>
    ) : null;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "Authority", href: "/authority-to-act" }, { label: "Give authority" }]} title={`Give someone authority to act for ${orgName}`} />

        {face === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. Nothing has been given.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}

        <Panel>
          <form
            className="relative z-[4] flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              go(false);
            }}
            noValidate
          >
            {/* ---- Who ---- */}
            <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
              <legend className="mb-3 font-display text-[15px] font-semibold text-strong">Who</legend>
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Their name</span>
                <input className={`${FIELD_CLASS} h-11`} value={d.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" />
                {err("name")}
              </label>
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Their citizen ID number</span>
                <input
                  className={`${FIELD_CLASS} h-11 font-mono`}
                  value={d.cid}
                  onChange={(e) => set("cid", e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-describedby="aut-cid-help"
                />
                <span id="aut-cid-help" className="text-[12.5px] leading-[1.5] text-faint">
                  We use this only to make sure the right person collects the authority. It isn&rsquo;t shown again or included in what they carry, and
                  we delete it when the authority ends.
                </span>
                {err("cid")}
              </label>
            </fieldset>

            {/* ---- Where ---- */}
            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
              <legend className="mb-3 font-display text-[15px] font-semibold text-strong">Where</legend>
              {offered.length === 0 ? (
                <Notice role="status">No organisation accepts authority from the NDI Entity Wallet yet.</Notice>
              ) : (
                offered.map((c) => {
                  const on = counterparty === c.orgId;
                  return (
                    <label
                      key={c.orgId}
                      className="flex cursor-pointer items-center gap-3 rounded-[11px] border px-3.5 py-3"
                      style={{ borderColor: on ? "var(--ndi-mint-40)" : "var(--border-grid)", background: on ? "var(--ndi-mint-08)" : "transparent" }}
                    >
                      <input
                        type="radio"
                        name="counterparty"
                        checked={on}
                        onChange={() => set("counterparty", c.orgId)}
                        className="h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                      />
                      <span className="font-display text-[13.5px] font-medium text-body">{c.name}</span>
                    </label>
                  );
                })
              )}
              {down ? <Notice role="alert" tone="warning">{down} can&rsquo;t accept authority from the NDI Entity Wallet at the moment.</Notice> : null}
            </fieldset>

            {/* ---- What ---- */}
            {counterparty ? (
              <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
                <legend className="mb-2 font-display text-[15px] font-semibold text-strong">What they can do at {cpName}</legend>
                {tasks.map((t) => (
                  <Checkbox key={t.scope} checked={d.tasks.includes(t.scope)} onChange={(on) => toggle("tasks", t.scope, on)} label={t.label} />
                ))}
                {err("tasks")}
              </fieldset>
            ) : null}

            {/* ---- Under which licence ---- */}
            {counterparty && needsLicence ? (
              <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
                <legend className="mb-2 font-display text-[15px] font-semibold text-strong">Under which licence</legend>
                {licences.map((l) => (
                  <Checkbox
                    key={l.credentialId}
                    checked={d.licences.includes(l.number)}
                    disabled={Boolean(l.unusable)}
                    onChange={(on) => toggle("licences", l.number, on)}
                    label={<span className="font-mono text-[13px]">{l.number}</span>}
                    description={l.unusable ? `${l.number} can't be used: ${l.unusable}.` : "Business licence"}
                  />
                ))}
                {usable.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    <Notice role="status" tone="warning">
                      Declaring at {cpName} needs a business licence that someone acting for you can use. You don&rsquo;t have one yet.
                    </Notice>
                    <div>
                      <Link href="/wallet/get" className="ndi-plainlink text-[13px] font-medium text-accent">
                        Get a business licence
                      </Link>
                    </div>
                    {forced === "live" ? (
                      <SimulatedStep
                        standsFor="the ministry issuing Pelden its business licence"
                        action={<SimulatedAction onClick={simulateLicenceIssued}>Have the ministry issue Pelden&rsquo;s business licence</SimulatedAction>}
                      >
                        Getting a licence is Flow 6 — asking the Ministry of Industry, Commerce &amp; Employment and accepting what it sends. The
                        prototype&rsquo;s ministry doesn&rsquo;t offer one on request yet, so this puts it straight into Pelden&rsquo;s wallet.
                      </SimulatedStep>
                    ) : null}
                  </div>
                ) : null}
                {err("licences")}
              </fieldset>
            ) : null}

            {/* ---- Limit and end date ---- */}
            <div className="grid gap-4 min-[641px]:grid-cols-2">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Limit (Nu, per declaration)</span>
                <input
                  className={`${FIELD_CLASS} h-11`}
                  value={d.limit ? Number(d.limit).toLocaleString("en-US") : ""}
                  onChange={(e) => set("limit", e.target.value.replace(/[^0-9]/g, "").slice(0, 12))}
                  inputMode="numeric"
                  aria-describedby="aut-limit-help"
                />
                <span id="aut-limit-help" className="text-[12.5px] leading-[1.5] text-faint">
                  The most they can declare in one declaration.
                </span>
                {err("limit")}
              </label>
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Until</span>
                <input
                  type="date"
                  className={`${FIELD_CLASS} h-11`}
                  value={d.until}
                  min={inDays(1)}
                  max={inDays(MAX_DAYS)}
                  onChange={(e) => set("until", e.target.value)}
                  aria-describedby="aut-until-help"
                />
                <span id="aut-until-help" className="text-[12.5px] leading-[1.5] text-faint">
                  Authority ends on this date. You can give it again.
                </span>
                {err("until")}
              </label>
            </div>

            {shownDuplicate ? (
              <div className="flex flex-col gap-3 rounded-[12px] border border-grid px-4 py-3">
                <p role="alert" className="m-0 text-[14px] leading-[1.6] text-body">
                  {shownDuplicate.name} already has authority for this until {formatDate(shownDuplicate.until)}. Give another anyway?
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <GradientButton onClick={() => go(true)}>Continue anyway</GradientButton>
                  <HairlineButton onClick={() => setDuplicateOf(null)}>Cancel</HairlineButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-4">
                <GradientButton type="submit" disabled={face === "loading" || face === "offline"}>
                  {face === "loading" ? "Checking…" : "Continue"}
                </GradientButton>
                <HairlineButton onClick={cancel}>Cancel</HairlineButton>
                <span className="text-[12.5px] text-faint">Starts today, {formatDate(today())}.</span>
              </div>
            )}
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}
