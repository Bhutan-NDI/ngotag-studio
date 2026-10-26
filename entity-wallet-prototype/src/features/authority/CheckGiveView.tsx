"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Icon } from "@/components/ui/icons";
import { digitsOnly, ending, statement } from "@/lib/authority";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";
import { namesOf } from "@/lib/sharing";

import { Notice, Statement, WhatTheyCarry } from "./shared";

/**
 * SCR-AUT-03 — Check and give. FLOW-AUT-01 steps 3–4; A3 was settled on
 * the form.
 *
 * THE ONE DECISION
 *
 * Everything the grantor chose, as one sentence (UXD-48) — who will be able
 * to do what, for whom, where, under which licence, up to what, until when —
 * then what the person will carry and, said outright, what they won't
 * (UXD-49), with the sentence that must survive review unchanged. Where the
 * grantor's *Give authority to act* needs approval, the people who will be
 * asked are named before anything is pressed (§3.4, "approver named before
 * acting").
 *
 * *Give authority* is the same words whether it goes at once or to an
 * approver (§3.2: "Give authority (sends for approval)"): the grantor is
 * giving it either way, and the next screen says which happened.
 */
type Face = "live" | "default_auto" | "default_approval" | "loading" | "error" | "offline" | "no_permission";

export function CheckGiveView() {
  const router = useRouter();
  const { hydrated, authorityDraft, organizations, activeOrgId, personById, giveVerdict, giveAuthority } = useDemo();
  const forced = useScreenState("SCR-AUT-03", ["live", "default_auto", "default_approval", "loading", "error", "offline", "no_permission"]) as Face;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const orgName = organizations.find((o) => o.id === activeOrgId)?.name ?? "your organisation";
  const d = authorityDraft;
  const verdict = giveVerdict();

  if (!d || d.orgId !== activeOrgId) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
          <PageHeader crumbs={[{ label: "Authority", href: "/authority-to-act" }, { label: "Check and give" }]} title="Nothing to check yet" />
          <Notice role="status">Fill in who and what first.</Notice>
          <div>
            <GradientButton onClick={() => router.push("/authority-to-act/give")}>Give authority</GradientButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const name = d.name.trim() || "They";
  const text = statement(
    { organizations },
    {
      orgId: d.orgId,
      tasks: d.tasks,
      counterparties: [d.counterparty],
      licenceNumbers: d.licences,
      valueCapNu: Number(digitsOnly(d.limit)) || 0,
      validUntil: d.until,
      delegateName: null,
      name,
    },
  );

  const approvers = verdict.kind === "may" ? verdict.approvers.map((id) => personById(id).name) : [];
  const natural: Face = busy
    ? "loading"
    : error
      ? "error"
      : verdict.kind !== "may"
        ? "no_permission"
        : verdict.policy === "AUTO"
          ? "default_auto"
          : "default_approval";
  const face: Face = forced === "live" ? natural : forced;
  const showApproval = face === "default_approval" || (face !== "default_auto" && approvers.length > 0);

  const give = () => {
    if (forced !== "live") return;
    setBusy(true);
    window.setTimeout(() => {
      const res = giveAuthority();
      setBusy(false);
      if (res.ok) {
        router.push(`/authority-to-act/${res.grantId}`);
        return;
      }
      const copy: Record<typeof res.error, string> = {
        E1: `You can't give authority for ${ending(orgName)}`,
        E2: `${orgName} can't give authority at the moment.`,
        E5: `${organizations.find((o) => o.id === d.counterparty)?.name ?? "That organisation"} can't accept authority from the NDI Entity Wallet at the moment.`,
        E6: "Something on the form needs changing.",
        A3: `${name} already has authority for this. Go back to say whether to give another.`,
        no_approver: "Nobody else here can approve authority you give, so you can't give it yet.",
        no_draft: "Fill in who and what first.",
      };
      setError(copy[res.error]);
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "Authority", href: "/authority-to-act" }, { label: "Check and give" }]} title={`Give ${name} authority?`} />

        {face === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. Nothing has been given.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}
        {face === "error" ? (
          <Notice role="alert" tone="warning">
            {error ?? "Licence BL-PLG-2025-00871 can't be used: the ministry has revoked it."}
          </Notice>
        ) : null}
        {face === "no_permission" ? (
          <Notice role="alert" tone="warning">
            You can&rsquo;t give authority for {ending(orgName)}
          </Notice>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <Statement>{text}</Statement>
            <WhatTheyCarry name={name} orgName={orgName} licences={d.licences} />

            {showApproval ? (
              <p className="m-0 flex items-start gap-2 text-[14px] leading-[1.6] text-body">
                <Icon name="userCheck" size={15} strokeWidth={2} className="mt-[3px] flex-none text-accent" />
                {approvers.length ? namesOf(approvers) : "Someone who can approve"} will be asked to approve before the link is ready.
              </p>
            ) : null}

            {face !== "no_permission" ? (
              <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-4">
                <GradientButton onClick={give} disabled={face === "loading" || face === "offline" || face === "error"}>
                  {face === "loading" ? "Giving authority…" : "Give authority"}
                </GradientButton>
                <HairlineButton onClick={() => router.push("/authority-to-act/give")}>Change</HairlineButton>
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
