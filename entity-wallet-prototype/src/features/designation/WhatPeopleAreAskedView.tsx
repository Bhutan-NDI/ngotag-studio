"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { draftAsked, draftFor, openObjectionFor, type ArtefactObjection, type OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { AskedList, kindPlural, kindSingular, kindTitle, kindsInWords, useAuthority } from "./shared";

/**
 * SCR-ADO-01 — What people will be asked. FLOW-ORG-03 step 3: the officer
 * reads, in plain words, exactly what a citizen will be shown — before
 * agreeing to it being asked in the authority's name (UN-20).
 *
 * FROM THE CITIZEN'S SIDE
 *
 * Second person, item by item, with why each is needed and the purpose the
 * wallet will show. It reads as the request a person receives, not as a
 * definition an engineer wrote.
 *
 * REVIEW IS NOT THEATRE
 *
 * NDI may have drafted this, and the authority is the one adopting it —
 * its name is on it (EW-FLOW5-SD/D7), so the screen says so. And there is
 * an objection route on the item it concerns: the sole proprietorship draft
 * asks for the date of birth, which confirming a licence holder doesn't
 * need (P5). It doesn't have to be agreed today.
 *
 * AN OBJECTION HOLDS, AND ONLY TWO THINGS RELEASE IT
 *
 * FLOW-ORG-03 A5: the officer's objection — against this entity type, or
 * the whole draft — holds adoption of what it covers until NDI revises the
 * draft (a new draft to read, which closes it) or the officer withdraws it.
 * The officer can't take an item out alone, and NDI can't close it alone,
 * so the screen offers exactly those two ways out: "Withdraw the
 * objection", and a dashed stand-in for NDI's revision, which the prototype
 * has no NDI side for.
 *
 * For a type already live, this is where its current version is read, and
 * where a change — a new version — starts.
 */
type Face = "live" | "default" | "loading" | "empty" | "error" | "objection_open" | "offline" | "no_permission";

export function WhatPeopleAreAskedView({ kind }: { kind: OrgKind }) {
  const router = useRouter();
  const params = useSearchParams();
  const changing = params.get("change") === "1";
  const { adoptions, artefactObjections, draftRevisions, currentPerson, personById, objectToArtefacts, withdrawObjection, reviseDraft, hydrated } = useDemo();
  const forced = useScreenState("SCR-ADO-01", ["live", "default", "loading", "empty", "error", "objection_open", "offline", "no_permission"]) as Face;

  const [objecting, setObjecting] = useState(false);
  const [whole, setWhole] = useState(false);
  const [note, setNote] = useState("");

  const { org, active: d, owner } = useAuthority();
  const draft = draftFor(kind);
  const live = adoptions.find((a) => a.designationId === d?.id && a.entityType === kind && a.state === "ACTIVE");
  const viewingLive = Boolean(live) && !changing;
  /* NDI's latest draft for this type — its revision, once it has revised. */
  const current = draftAsked(draftRevisions, d?.id, kind);
  const asked = viewingLive ? live!.asked : current;
  /* The over-broad item is flagged only while the draft still asks for it. */
  const overBroad = draft.overBroad && current.some((a) => a.item === draft.overBroad) ? draft.overBroad : null;
  /* The switcher's open-objection face, for when none is open here. */
  const sampleObjection: ArtefactObjection = {
    id: "sample-objection",
    designationId: d?.id ?? "sample",
    entityType: kind,
    item: overBroad,
    note: "Our register doesn't need the date of birth to answer.",
    by: currentPerson.id,
    at: new Date().toISOString().slice(0, 10),
    closedAt: null,
    closedHow: null,
  };
  const objection = openObjectionFor(artefactObjections, d?.id, kind) ?? (forced === "objection_open" ? sampleObjection : undefined);
  const held = Boolean(objection);
  /* What the open objection holds — this type, or every type in the draft. */
  const heldWords = objection?.entityType === null && d ? kindsInWords(d.entityTypes) : kindPlural(kind);
  /* How the last objection here closed, so a revised draft says why it changed. */
  const lastClosed = artefactObjections
    .filter((o) => o.designationId === d?.id && o.closedAt && (o.entityType === null || o.entityType === kind))
    .sort((a, b) => (b.closedAt ?? "").localeCompare(a.closedAt ?? ""))[0];
  const flagged = viewingLive || objection ? null : overBroad;

  const natural: Face = !d || !d.entityTypes.includes(kind) ? "empty" : !owner ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const offline = face === "offline";
  const canContinue = owner && !offline && face !== "no_permission";

  const header = (
    <PageHeader
      crumbs={[{ label: org?.name ?? "Your organisation" }, { label: "Authority", href: "/authority" }, { label: kindTitle(kind) }]}
      title="What people will be asked"
    />
  );

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (face === "empty") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState icon="fileText" title="There's nothing to review yet." message="NDI is preparing it with you." />
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline, so this is read-only. You can still print it.
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            You can read this. Only your organisation&rsquo;s owner can adopt it.
          </p>
        ) : null}
        {objection ? (
          <div role="status" className="flex flex-col gap-2 rounded-[12px] border px-4 py-3" style={{ borderColor: "var(--ndi-warning)" }}>
            <p className="m-0 text-[13.5px] leading-[1.6] text-body">
              Your objection has gone to NDI. Adopting {heldWords} is on hold until they revise the draft or you
              withdraw your objection.
            </p>
            <p className="m-0 text-[12.5px] leading-[1.55] text-muted">
              Sent to NDI on {formatDate(objection.at)} by {personById(objection.by).name}
              {objection.entityType === null ? ", against the whole draft" : objection.item ? `, about ${objection.item.toLowerCase()}` : ""}: &ldquo;{objection.note}&rdquo;
            </p>
            <div>
              <HairlineButton
                onClick={() => (forced === "live" ? withdrawObjection(objection.id) : undefined)}
                disabled={!canContinue}
              >
                Withdraw the objection
              </HairlineButton>
            </div>
          </div>
        ) : lastClosed && !viewingLive ? (
          <p role="status" className="m-0 flex items-start gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="info" size={14} strokeWidth={2} className="mt-[2px] flex-none" />
            {lastClosed.closedHow === "REVISED"
              ? `NDI revised the draft on ${formatDate(lastClosed.closedAt!)}, in answer to your objection. This is the new draft — read it before adopting.`
              : `You withdrew your objection on ${formatDate(lastClosed.closedAt!)}. This is NDI's draft as it stood.`}
          </p>
        ) : null}
        {objection && forced === "live" ? (
          <SimulatedStep
            standsFor="NDI revising the draft in answer to the objection"
            action={<SimulatedAction onClick={() => reviseDraft(objection.id)}>NDI revises the draft</SimulatedAction>}
          >
            Only NDI can revise its draft, and only the officer can withdraw the objection — neither closes it alone. The
            prototype has no NDI side for drafting, so this stands in for NDI sending a new draft
            {objection.item ? ` without the ${objection.item.toLowerCase()}` : ""}.
          </SimulatedStep>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <p className="m-0 max-w-[66ch] text-[15px] leading-[1.65] text-body">
              This is what a person will see in their NDI wallet when they ask to verify a {kindSingular(kind)} with you.
            </p>

            {viewingLive ? (
              <p className="m-0 text-[13px] text-muted">
                Version {live!.version}, live since {formatDate(live!.adoptedAt)}, adopted by {personById(live!.adoptedBy).name}.
              </p>
            ) : (
              <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-muted">
                Each item is listed with why it&rsquo;s needed to answer your question. If something here isn&rsquo;t
                needed, say so — this doesn&rsquo;t have to be agreed today.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <p className={LABEL_CLASS}>They&rsquo;ll be asked for</p>
              <AskedList asked={asked} flagged={flagged} />
            </div>

            <div className="flex flex-col gap-1.5 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              <p className={LABEL_CLASS}>Why, as their wallet shows it</p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">&ldquo;{draft.purpose}&rdquo;</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className={LABEL_CLASS}>What the {draft.credential} will contain</p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">{draft.contents.join(" · ")}</p>
            </div>

            {viewingLive ? null : (
              <p className="m-0 max-w-[66ch] text-[13px] leading-[1.6] text-muted">
                NDI may have drafted this. You are the one adopting it, and your name is on it.
              </p>
            )}

            {objecting ? (
              <div className="flex flex-col gap-3 rounded-[12px] border border-grid px-4 py-3">
                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>What should change</span>
                  <textarea
                    className={`${FIELD_CLASS} resize-y py-3`}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={overBroad ? `Our register doesn't need the ${overBroad.toLowerCase()} to answer.` : ""}
                  />
                </label>
                {d && d.entityTypes.length > 1 ? (
                  <Checkbox
                    checked={whole}
                    onChange={setWhole}
                    label="Object to the whole draft"
                    description={`Holds adopting ${kindsInWords(d.entityTypes)}, not only ${kindPlural(kind)}.`}
                  />
                ) : null}
                <p className="m-0 text-[12.5px] leading-[1.5] text-muted">
                  Adopting what this covers is on hold until NDI revises the draft or you withdraw the objection.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <GradientButton
                    disabled={!note.trim()}
                    onClick={() => {
                      objectToArtefacts(d!.id, whole ? null : kind, whole ? null : overBroad, note);
                      setObjecting(false);
                      setWhole(false);
                      setNote("");
                    }}
                  >
                    Send back to NDI
                  </GradientButton>
                  <HairlineButton onClick={() => setObjecting(false)}>Cancel</HairlineButton>
                </div>
              </div>
            ) : null}

            {face === "error" ? (
              <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ borderColor: "var(--ndi-warning)" }}>
                This request asks for more than is needed to confirm a representative: {draft.overBroad ?? "Date of birth"}.
                Send it back with a note.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              {viewingLive ? (
                <HairlineButton onClick={() => router.push(`/authority/${kind}?change=1`)} disabled={!canContinue}>
                  Change what people are asked
                </HairlineButton>
              ) : (
                <GradientButton
                  onClick={() => router.push(`/authority/${kind}/adopt${changing ? "?change=1" : ""}`)}
                  disabled={!canContinue || face === "error" || held}
                >
                  Continue to adopt
                  <Icon name="arrowRight" size={16} strokeWidth={2} />
                </GradientButton>
              )}
              {/* An objection route must exist or review is theatre (SCR-ADO-01),
                  so it's on every draft. Hidden only while one is open — the
                  open one is withdrawn above, not stacked on. */}
              {viewingLive || objection ? null : (
                <HairlineButton onClick={() => setObjecting(true)} disabled={!canContinue || objecting}>
                  Raise an objection
                </HairlineButton>
              )}
              <HairlineButton onClick={() => window.print()}>Print</HairlineButton>
              <HairlineButton onClick={() => router.push("/authority")}>Back</HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
