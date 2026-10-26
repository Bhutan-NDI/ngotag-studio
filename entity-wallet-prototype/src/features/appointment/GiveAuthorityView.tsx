"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/Checkbox";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { inOrg, roleIn, shortOrgName, standsNow, type AppointmentDocument, type PresetId, type ShareReach } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { PRESETS, describeGrant, shareTargets } from "./presets";

/**
 * SCR-DEL-02 — Appoint someone. FLOW-DEL-01 steps 1–4.
 *
 * Named *Appoint someone* since UX-EW-01 v0.23, so that appointing a
 * Controller is not confused with the *Give authority to act* box or with
 * Flow 8's *Give authority*, which gives someone authority in their own
 * wallet (UX-EW-05 SCR-AUT-02).
 *
 * ONE SCREEN, FOUR BOXES
 *
 * This replaced a two-screen proposal — a legal-basis choice and a required
 * signed instrument, then a page of operations ticked one at a time. The
 * specification has neither. The representative chooses a member and ticks
 * one or more of four presets (UXD-58, EW-FLOW3-SD/D18). A single choice
 * forced the commonest roles — an accountant who receives certificates and
 * sends them on — into *Everything*, which also made them an approver; so
 * the presets combine, and *Everything* is gone.
 *
 * Each box says what it allows. What the person *won't* be able to do is
 * computed from the boxes left unticked, because each preset's own limits
 * contradict the others' once two are ticked. The whole grant still reads
 * back in one sentence (UC-20), and the screen shows that sentence.
 *
 * THE STATEMENT IS REQUIRED; THE DOCUMENT IS NOT
 *
 * What makes the appointment stand is the representative's own statement
 * that they are authorised to make it — recorded with their name and the
 * time (EW-FLOW3-SD/D5). A board resolution or power of attorney may be
 * cited, and need not be: NDI never sees or checks it, so requiring it adds
 * effort and no control. It is offered collapsed, because expanded fields
 * read as required whatever their label says (UXD-26), and a proprietor
 * who thinks they need a board resolution to let their accountant receive
 * a certificate will stop here. The file picker says the file stays on the
 * device; only its fingerprint would be kept.
 *
 * WHAT IS REFUSED, AND WHERE
 *
 * Only the representative appoints (DEL-01/E1); someone who already can
 * act is shown but not offered (E3); *Share* to named organisations with
 * none named can't be sent (E12), and nor can nothing ticked (E13). The
 * screen says each of these up front, and the store refuses them anyway —
 * the screen is not the boundary. Two things are allowed but said before
 * submitting: approval falling to the representative (A1), and an approver
 * who also shares or gives authority never approving their own (A2).
 */
type Face =
  | "default"
  | "no_one_to_choose"
  | "already_has_authority"
  | "approval_falls_to_you"
  | "approves_and_shares"
  | "nothing_to_share_with"
  | "nothing_chosen"
  | "not_representative"
  | "offline";

const DOCUMENT_TYPES = [
  { value: "board_resolution", label: "Board resolution" },
  { value: "power_of_attorney", label: "Power of attorney" },
  { value: "other", label: "Other written authority" },
];

export function GiveAuthorityView() {
  const router = useRouter();
  const { organizations, activeOrgId, people, relations, harness, appoint, hydrated } = useDemo();
  const forced = useScreenState("SCR-DEL-02", [
    "live",
    "default",
    "no_one_to_choose",
    "already_has_authority",
    "approval_falls_to_you",
    "approves_and_shares",
    "nothing_to_share_with",
    "nothing_chosen",
    "not_representative",
    "offline",
  ]);

  const org = organizations.find((o) => o.id === activeOrgId);
  const orgName = org?.name ?? "the organisation";
  const short = shortOrgName(orgName);
  const root = relations.find((r) => inOrg(activeOrgId)(r) && r.isRootAuthority && r.state === "ACTIVE");
  /* Named from the representative's relation whatever its state, so the
     refusal never falls back to a name from the story. */
  const representative = people.find(
    (p) => p.id === relations.find((r) => inOrg(activeOrgId)(r) && r.isRootAuthority)?.personId,
  );
  const members = people.filter((p) => p.id !== root?.personId && p.hasAccount !== false && roleIn(org, p));
  const today = new Date().toISOString().slice(0, 10);
  /* An offer past its 14 days no longer counts (DEL-01/E4), so it doesn't
     block appointing the same person again. The store applies the same rule. */
  const holds = (id: string) =>
    relations.some((r) => inOrg(activeOrgId)(r) && r.personId === id && !r.isRootAuthority && standsNow(r, today));
  /* Whether anyone but the representative can approve. If nobody can, a
     share or a grant that needs approval falls to the representative
     (DEL-01/A1). */
  const otherApprover = relations.some(
    (r) =>
      inOrg(activeOrgId)(r) &&
      !r.isRootAuthority &&
      r.state === "ACTIVE" &&
      r.scope.grants.some((g) => g.operation === "approval:decide"),
  );

  const [personId, setPersonId] = useState<string>(members.find((m) => !holds(m.id))?.id ?? "");
  /* Who a named reach can name: organisations approved to verify. */
  const verifiers = shareTargets(organizations, activeOrgId);
  const [presets, setPresets] = useState<PresetId[]>(["receive"]);
  /* Named is the narrower reach, so it is where the choice starts. */
  const [shareReach, setShareReach] = useState<ShareReach>("named");
  const [shareWith, setShareWith] = useState<string[]>([]);
  /* §4.2: presenting and giving authority both default to one approver. */
  const [needsApproval, setNeedsApproval] = useState(true);
  const [issueNeedsApproval, setIssueNeedsApproval] = useState(true);
  const [until, setUntil] = useState("");
  const [attested, setAttested] = useState(false);
  /* The statement confirms authority to appoint *this person on these
     terms* (EW-FLOW3-SD §4.4). Change the person or the terms and it no
     longer says what was ticked, so it is cleared and must be given again. */
  const changeTerms = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setAttested(false);
  };
  const [docOpen, setDocOpen] = useState(false);
  const [doc, setDoc] = useState<AppointmentDocument>({ type: "board_resolution", date: "", reference: "", fileName: null });
  const [busy, setBusy] = useState(false);
  const [refused, setRefused] = useState<string | null>(null);

  const chosen = members.find((m) => m.id === personId);
  const chosenName = chosen?.name.split(" ")[0] ?? "they";
  const isRepresentative = Boolean(root && root.personId === harness.persona);

  const natural: Face = !isRepresentative ? "not_representative" : members.length === 0 ? "no_one_to_choose" : "default";
  const face: Face = forced === "live" ? natural : (forced as Face);
  /* The state switcher's faces tick what they need, so each is reachable
     from any starting point; live, it is what the representative ticked. */
  const ticked: PresetId[] =
    face === "nothing_chosen"
      ? []
      : face === "nothing_to_share_with" || face === "approval_falls_to_you"
        ? ["share"]
        : face === "approves_and_shares"
          ? ["share", "approve"]
          : presets;
  const reach: ShareReach = face === "nothing_to_share_with" ? "named" : shareReach;
  const named = face === "nothing_to_share_with" ? [] : shareWith;
  const on = (id: PresetId) => ticked.includes(id);
  const toggle = (id: PresetId, c: boolean) =>
    changeTerms(setPresets)(c ? [...presets.filter((p) => p !== id), id] : presets.filter((p) => p !== id));

  const showE13 = ticked.length === 0;
  const showE12 = on("share") && reach === "named" && named.length === 0;
  /* A1: what needs approval, with nobody but the representative to give it. */
  const a1Share = on("share") && needsApproval && (face === "approval_falls_to_you" || !otherApprover);
  const a1Issue = on("give_authority") && issueNeedsApproval && !otherApprover;
  /* A2: an approver who also shares or gives authority (§4.2). */
  const showA2 = on("approve") && (on("share") || on("give_authority"));
  const grant = describeGrant(ticked, {
    name: chosenName === "they" ? "They" : chosenName,
    orgName: short,
    shareWith: on("share") && reach === "named" ? named : null,
  });

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (
    <PageHeader crumbs={[{ label: "People who can act" }, { label: "Appoint someone" }]} title="Appoint someone" />
  );

  if (face === "not_representative") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <p className="relative z-[4] m-0 text-[14px] leading-[1.6] text-body" role="status">
              Only {representative?.name ?? "Dorji Wangchuk"}, who is recorded as {orgName}&rsquo;s
              representative, can give people authority to act for it.
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "no_one_to_choose") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p className="m-0 text-[14px] leading-[1.6] text-body">
                {orgName} has no other members yet. Invite someone first — being a member doesn&rsquo;t
                let them act for {short}.
              </p>
              <div>
                <Link href="/members/invite">
                  <GradientButton>Invite someone</GradientButton>
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const canSubmit = Boolean(chosen) && !holds(personId) && attested && !showE13 && !showE12 && face !== "offline";

  const submit = () => {
    if (!canSubmit) return;
    setBusy(true);
    window.setTimeout(() => {
      const r = appoint({
        personId,
        presets: ticked,
        shareReach: reach,
        shareWith: on("share") && reach === "named" ? named : [],
        shareNeedsApproval: needsApproval,
        issueNeedsApproval,
        validUntil: until || null,
        document: docOpen && (doc.reference || doc.fileName || doc.date) ? doc : null,
      });
      setBusy(false);
      if (r.ok) router.push("/people-who-can-act");
      else setRefused(r.error);
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Being a member lets someone see {short}. This lets them act for it — within what you choose
          here. They have to accept it with their own NDI wallet before it takes effect.
        </p>

        {/* ---- Who ---- */}
        <Panel>
          <fieldset className="relative z-[4] m-0 flex flex-col gap-2 border-0 p-0">
            <legend className={`${LABEL_CLASS} mb-2 p-0`}>Who</legend>
            {members.map((m) => {
              const taken = holds(m.id) || (face === "already_has_authority" && m.id === members[0]?.id);
              const on = personId === m.id && !taken;
              return (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 rounded-[11px] border px-3.5 py-3 ${taken ? "cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ borderColor: on ? "var(--ndi-mint-40)" : "var(--border-grid)", background: on ? "var(--ndi-mint-08)" : "transparent" }}
                >
                  <input
                    type="radio"
                    name="appointee"
                    checked={on}
                    disabled={taken}
                    onChange={() => changeTerms(setPersonId)(m.id)}
                    className="mt-0.5 h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={`font-display text-[13.5px] font-medium ${taken ? "text-muted" : "text-body"}`}>{m.name}</span>
                    <span className="text-[12.5px] text-faint">{m.email}</span>
                    {taken ? (
                      <span className="mt-1 text-[12.5px] leading-[1.5] text-muted">
                        {m.name} can already act for {short}. Changing what they can do comes in a later
                        release.
                      </span>
                    ) : null}
                  </span>
                  {taken ? <StatusPill status="active" label="Can act" /> : null}
                </label>
              );
            })}
          </fieldset>
        </Panel>

        {/* ---- What they can do ---- */}
        <Panel>
          <fieldset className="relative z-[4] m-0 flex flex-col gap-2 border-0 p-0">
            <legend className={`${LABEL_CLASS} mb-2 p-0`}>What {chosenName} can do — tick one or more</legend>
            {PRESETS.map((p) => {
              const checked = on(p.id);
              return (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 rounded-[11px] border px-3.5 py-3"
                  style={{ borderColor: checked ? "var(--ndi-mint-40)" : "var(--border-grid)", background: checked ? "var(--ndi-mint-08)" : "transparent" }}
                >
                  <Checkbox checked={checked} onChange={(c) => toggle(p.id, c)} label={p.label} description={p.allows} />

                  {/* Share's reach and approval sit with the box they belong to. */}
                  {p.id === "share" && checked ? (
                    <div className="ml-7 flex flex-col gap-3 border-t border-subtle pt-3">
                      <div role="radiogroup" aria-label={`Who ${chosenName} may share with`} className="flex flex-col gap-2">
                        {(
                          [
                            ["named", "Only organisations I name"],
                            ["any", "Any organisation that asks"],
                          ] as const
                        ).map(([value, label]) => (
                          <label key={value} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-body">
                            <input
                              type="radio"
                              name="share-reach"
                              checked={reach === value}
                              onChange={() => changeTerms(setShareReach)(value)}
                              className="h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                      {reach === "named" ? (
                        <div className="flex flex-col gap-2">
                          <p className="m-0 text-[12.5px] leading-[1.5] text-faint">
                            Only organisations NDI has approved to verify can be named.
                          </p>
                          <div className="grid gap-2 min-[641px]:grid-cols-2">
                            {verifiers.map((t) => (
                              <Checkbox
                                key={t}
                                checked={named.includes(t)}
                                onChange={(c) => changeTerms(setShareWith)(c ? [...shareWith, t] : shareWith.filter((x) => x !== t))}
                                label={t}
                              />
                            ))}
                          </div>
                          {showE12 ? (
                            <p role="status" className="m-0 text-[12.5px] leading-[1.5] text-muted">
                              Choose at least one organisation {chosenName} may share credentials with.
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      <Checkbox
                        checked={needsApproval}
                        onChange={changeTerms(setNeedsApproval)}
                        label="Each share needs someone to approve it"
                        description="Recommended, and on unless you turn it off."
                      />
                      {a1Share ? (
                        <div role="status" className="flex flex-col gap-1.5">
                          <p className="m-0 text-[13px] leading-[1.6] text-body">
                            You&rsquo;ll be asked to approve each time {chosenName} {chosen ? "shares" : "share"} a credential.
                          </p>
                          <button type="button" onClick={() => changeTerms(setNeedsApproval)(false)} className="ndi-plainlink self-start text-[12.5px] font-medium text-accent">
                            Allow it without approval
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {p.id === "give_authority" && checked ? (
                    <div className="ml-7 flex flex-col gap-3 border-t border-subtle pt-3">
                      <Checkbox
                        checked={issueNeedsApproval}
                        onChange={changeTerms(setIssueNeedsApproval)}
                        label="Each grant of authority needs someone to approve it"
                        description="Recommended, and on unless you turn it off."
                      />
                      {a1Issue ? (
                        <div role="status" className="flex flex-col gap-1.5">
                          <p className="m-0 text-[13px] leading-[1.6] text-body">
                            You&rsquo;ll be asked to approve each time {chosenName} {chosen ? "gives" : "give"} someone authority to act.
                          </p>
                          <button type="button" onClick={() => changeTerms(setIssueNeedsApproval)(false)} className="ndi-plainlink self-start text-[12.5px] font-medium text-accent">
                            Allow it without approval
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </fieldset>

          {showE13 ? (
            <p role="status" className="relative z-[4] mt-3 mb-0 text-[12.5px] leading-[1.5] text-muted">
              Choose at least one thing {chosenName} can do.
            </p>
          ) : null}

          {showA2 ? (
            <p role="status" className="relative z-[4] mt-3 mb-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] leading-[1.6] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              {chosen ? chosenName : "They"} can approve what others share, but never what they share themselves.
            </p>
          ) : null}

          {/* The read-back, computed from what is ticked (UC-20). */}
          {ticked.length ? (
            <div className="relative z-[4] mt-4 flex flex-col gap-2 border-t border-subtle pt-4">
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">{grant.sentence}</p>
              <p className={`${LABEL_CLASS} m-0 mt-1`}>{chosenName} won&rsquo;t be able to</p>
              {grant.wont.map((w) => (
                <span key={w} className="flex items-start gap-2 text-[12.5px] leading-[1.5] text-muted">
                  <Icon name="close" size={12} strokeWidth={2.6} className="mt-[4px] flex-none" style={{ color: "var(--text-faint)" }} />
                  {w}
                </span>
              ))}
            </div>
          ) : null}
        </Panel>

        {/* ---- Until, the statement, the optional document ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <label className={`${FIELD_BLOCK_CLASS} max-w-[260px]`}>
              <span className={LABEL_CLASS}>Until (optional)</span>
              <input type="date" className={`${FIELD_CLASS} h-11`} value={until} onChange={(e) => changeTerms(setUntil)(e.target.value)} />
              <span className="text-[12.5px] text-faint">{until ? "" : "No end date. You can end it at any time."}</span>
            </label>

            <Checkbox
              checked={attested}
              onChange={setAttested}
              label={`I confirm I'm authorised to give ${chosen?.name ?? "this person"} authority to act for ${orgName} on these terms.`}
              description="Required. It's recorded with your name and the time."
            />

            <div className="flex flex-col gap-3 border-t border-subtle pt-4">
              <button
                type="button"
                aria-expanded={docOpen}
                onClick={() => setDocOpen((o) => !o)}
                className="ndi-plainlink inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-muted"
              >
                <Icon name="chevronDown" size={13} strokeWidth={2} className={docOpen ? "rotate-180" : ""} />
                Cite the document behind this (optional)
              </button>
              {docOpen ? (
                <div className="flex flex-col gap-4">
                  <p className="m-0 max-w-[62ch] text-[12.5px] leading-[1.55] text-faint">
                    Useful if your authority to appoint might be questioned later — for example a
                    board resolution. Not needed to continue.
                  </p>
                  <div className="grid gap-4 min-[641px]:grid-cols-3">
                    <div className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>Type</span>
                      <Select
                        label="Type of document"
                        value={doc.type}
                        onChange={(v) => setDoc((d) => ({ ...d, type: v as AppointmentDocument["type"] }))}
                        options={DOCUMENT_TYPES}
                        className="h-11 w-full"
                      />
                    </div>
                    <label className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>Date</span>
                      <input type="date" className={`${FIELD_CLASS} h-11`} value={doc.date} onChange={(e) => setDoc((d) => ({ ...d, date: e.target.value }))} />
                    </label>
                    <label className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>Where the original is kept</span>
                      <input className={`${FIELD_CLASS} h-11`} value={doc.reference} onChange={(e) => setDoc((d) => ({ ...d, reference: e.target.value }))} placeholder="Company secretary's file" />
                    </label>
                  </div>
                  <label className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>The file (optional)</span>
                    <input
                      type="file"
                      onChange={(e) => setDoc((d) => ({ ...d, fileName: e.target.files?.[0]?.name ?? null }))}
                      className="text-[13px] text-muted"
                    />
                    <span className="text-[12.5px] leading-[1.5] text-faint">
                      The file stays on this device. Only a fingerprint of it is kept, so it can be matched
                      to the original later.
                    </span>
                  </label>
                  <SimulatedStep
                    standsFor="choosing a signed document"
                    action={
                      <SimulatedAction
                        onClick={() =>
                          setDoc({ type: "board_resolution", date: new Date().toISOString().slice(0, 10), reference: "PT/BR/2026/014", fileName: "board-resolution-sample.pdf" })
                        }
                      >
                        Attach a sample resolution
                      </SimulatedAction>
                    }
                  >
                    Fills the fields above with a sample. Nothing is uploaded.
                  </SimulatedStep>
                  {doc.fileName ? <p className="m-0 text-[12.5px] text-muted">Selected: {doc.fileName}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        </Panel>

        {face === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
            You&rsquo;re offline. When you&rsquo;re back, this page will say whether the appointment was made —
            it won&rsquo;t guess.
          </p>
        ) : null}
        {refused ? (
          <p role="alert" className="m-0 text-[13px] text-body">
            {refused === "E3"
              ? `${chosen?.name ?? "They"} can already act for ${short}.`
              : refused === "E12"
                ? `Choose at least one organisation ${chosenName} may share credentials with.`
                : refused === "E13"
                  ? `Choose at least one thing ${chosenName} can do.`
                  : `Only the representative can appoint people to act for ${short}.`}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2.5">
          <GradientButton onClick={submit} disabled={!canSubmit || busy}>
            {busy ? "Sending…" : "Appoint"}
          </GradientButton>
          <Link href="/members/invite">
            <HairlineButton>Invite someone first</HairlineButton>
          </Link>
          <button type="button" onClick={() => router.push("/people-who-can-act")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
            Cancel
          </button>
        </div>
      </div>
    </AppShell>
  );
}
