"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { QrPlaceholder } from "@/components/ui/QrPlaceholder";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { DEFAULT_DAYS, cancellable, delegateNameOf, inDays, statement, stateWords, tabOf } from "@/lib/authority";
import { useDemo } from "@/lib/demoStore";
import { namesOf } from "@/lib/sharing";

import { Fact, Notice, Statement } from "./shared";

/**
 * SCR-AUT-04 — Send to <name>. FLOW-AUT-01 steps 5–8; A1, A4, E3, E14.
 * Also the read-only detail SCR-AUT-01 opens for a grant in any other
 * state (§3.2, SCR-AUT-01 exits).
 *
 * THE PLATFORM SENDS NOTHING
 *
 * The grantor copies the link, or shows it as a QR code, and sends it the
 * way they usually reach the person (UXD-51) — the platform has no contact
 * for someone outside the organisation (D10). So the screen's job is to
 * hand over the link and say what makes passing it on safe enough: only
 * the person whose ID number was entered can collect it (G8). It promises
 * nothing about the channel.
 *
 * WAITING IS WAITING, NOT FAILING
 *
 * Under approval, "Sent to <names> to approve"; on an organisation's first
 * grant, "Setting up <organisation> to give authority…" while NDI's list
 * confirms it (A4) — both with *Cancel this authority*, as any state is
 * until the person accepts (E14). Every ending says nothing was given, in
 * §3.5's words, and offers *Give again*.
 *
 * WITHOUT authority:issue
 *
 * Someone who may only see (credential:list) sees the state but not the
 * link, and can't cancel (§3.2, "Disabled / no permission").
 */
type Face = "live" | "ready" | "waiting_approval" | "setting_up" | "setting_up_long" | "collecting" | "done" | "ended" | "cancelled" | "offline" | "no_permission";

export function GrantView({ grantId }: { grantId: string }) {
  const router = useRouter();
  const {
    hydrated,
    authorityGrants,
    organizations,
    personById,
    mayIssueAuthority,
    grantApprovers,
    cancelGrant,
    saveAuthorityDraft,
    settleAuthorityListing,
    lapseGrant,
    simulateLicenceRevoked,
  } = useDemo();
  const forced = useScreenState("SCR-AUT-04", [
    "live",
    "ready",
    "waiting_approval",
    "setting_up",
    "setting_up_long",
    "collecting",
    "done",
    "ended",
    "cancelled",
    "offline",
    "no_permission",
  ]) as Face;
  const [qr, setQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const g = authorityGrants.find((x) => x.id === grantId);

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (!g) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
          <PageHeader crumbs={[{ label: "Authority", href: "/authority-to-act" }, { label: "Not found" }]} title="Not found" />
          <Notice role="status">
            It may have been reset with the demo.{" "}
            <Link href="/authority-to-act" className="ndi-plainlink text-accent">
              Back to Authority
            </Link>
            .
          </Notice>
        </div>
      </AppShell>
    );
  }

  const org = organizations.find((o) => o.id === g.orgId);
  const orgName = org?.name ?? "your organisation";
  const name = delegateNameOf(g);
  const person = (id: string | null | undefined) => (id ? personById(id).name : "Someone");
  const approvers = grantApprovers(g.id).map(person);
  const words = stateWords(g, { person, approvers, org: orgName });
  const mayIssue = forced === "no_permission" ? false : mayIssueAuthority(g.orgId);
  const link = g.claimRef ? `${origin}/authority/claim/${g.claimRef}` : "";

  const natural: Face =
    g.status === "CLAIMABLE"
      ? "ready"
      : g.status === "AWAITING_APPROVAL"
        ? "waiting_approval"
        : g.status === "AWAITING_LISTING"
          ? "setting_up"
          : g.status === "ISSUING"
            ? "collecting"
            : g.status === "ACTIVE" || g.status === "SUSPENDED"
              ? "done"
              : g.status === "CANCELLED"
                ? "cancelled"
                : "ended";
  const face: Face = forced === "live" || forced === "no_permission" ? natural : forced;
  const live = forced === "live";
  const sendTitle = face === "ready" || face === "waiting_approval" || face === "setting_up" || face === "setting_up_long" || face === "collecting";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      /* Clipboard refused (insecure origin, a preview frame) — the link is
         on screen to select by hand. */
      setCopied(false);
    }
  };

  const giveAgain = () => {
    /* The terms come back; the ID number doesn't — nothing kept it. */
    saveAuthorityDraft({
      orgId: g.orgId,
      name: g.name,
      cid: "",
      counterparty: g.counterparties[0] ?? "",
      tasks: g.tasks,
      licences: g.licenceNumbers,
      limit: String(g.valueCapNu),
      until: inDays(DEFAULT_DAYS),
      duplicateOk: false,
    });
    router.push("/authority-to-act/give");
  };

  const ending =
    face === "cancelled"
      ? "Cancelled. The link no longer works."
      : face === "ended"
        ? g.endReason ?? words.sentence
        : null;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Authority", href: "/authority-to-act" }, { label: name }]}
          title={sendTitle ? `Send this link to ${name}` : `${name}'s authority`}
          actions={<StatusPill status={words.pill} label={words.label} />}
        />

        {face === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}

        {/* ---- Where it stands ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-4" aria-live="polite">
            {face === "ready" ? (
              mayIssue ? (
                <>
                  <p className="m-0 text-[14.5px] leading-[1.6] text-body">
                    Only {name} can collect this — they&rsquo;ll prove who they are with Bhutan NDI. The link works until{" "}
                    {formatDate(g.claimExpiresAt ?? g.statusAt)}.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-grid px-3 py-2.5" style={{ background: "rgb(var(--tint) / 0.03)" }}>
                    <Icon name="link" size={14} strokeWidth={2} className="flex-none text-muted" />
                    <span className="min-w-0 flex-1 break-all font-mono text-[12.5px] text-body">{link || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <GradientButton onClick={copy}>
                      <Icon name="copy" size={15} strokeWidth={2} />
                      {copied ? "Copied" : "Copy link"}
                    </GradientButton>
                    <HairlineButton onClick={() => setQr((x) => !x)}>{qr ? "Hide QR code" : "Show QR code"}</HairlineButton>
                  </div>
                  {qr ? (
                    <div className="w-full max-w-[220px]">
                      <QrPlaceholder value={link} />
                    </div>
                  ) : null}
                  <p className="m-0 text-[13px] text-muted">Send it the way you usually reach them — a message or email.</p>
                </>
              ) : (
                <p className="m-0 text-[14px] leading-[1.6] text-body">
                  The link is waiting for {name} to collect it, until {formatDate(g.claimExpiresAt ?? g.statusAt)}. Only someone who can give authority
                  for {orgName} can see it.
                </p>
              )
            ) : face === "waiting_approval" ? (
              <p role="status" className="m-0 text-[14.5px] leading-[1.6] text-body">
                Sent to {namesOf(approvers) || "an approver"} to approve. We&rsquo;ll tell you when the link is ready.
              </p>
            ) : face === "setting_up" ? (
              <p role="status" className="m-0 flex items-center gap-2 text-[14.5px] text-body">
                <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--ndi-info)" }} />
                Setting up {orgName} to give authority…
              </p>
            ) : face === "setting_up_long" ? (
              <p role="status" className="m-0 text-[14.5px] leading-[1.6] text-body">
                We&rsquo;re setting up {orgName} to give authority. This usually takes a minute — we&rsquo;ll tell you when the link is ready.
              </p>
            ) : face === "collecting" ? (
              <p role="status" className="m-0 text-[14.5px] leading-[1.6] text-body">
                {g.accepted ? `${name} has accepted. We're finishing setting it up.` : `${name} is collecting their authority.`}
              </p>
            ) : face === "done" ? (
              <>
                <p role="status" className="m-0 flex items-start gap-2 text-[14.5px] leading-[1.6] text-body">
                  <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                  {name} has their authority.
                </p>
                <div>
                  <HairlineButton onClick={() => router.push("/authority-to-act")}>Back to Authority</HairlineButton>
                </div>
              </>
            ) : ending ? (
              <>
                <p role="status" className="m-0 text-[14.5px] leading-[1.6] text-body">
                  {ending}
                </p>
                {mayIssue ? (
                  <div>
                    <GradientButton onClick={giveAgain}>Give again</GradientButton>
                  </div>
                ) : null}
              </>
            ) : null}

            {mayIssue && cancellable(g) && live ? (
              <div className="border-t border-subtle pt-3">
                <button type="button" onClick={() => cancelGrant(g.id)} className="ndi-plainlink text-[13px] font-medium text-muted">
                  Cancel this authority
                </button>
              </div>
            ) : null}
          </div>
        </Panel>

        {/* ---- The terms ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <Statement>{statement({ organizations }, g)}</Statement>
            <div className="grid gap-4 min-[641px]:grid-cols-3">
              <Fact label="Given by">
                {person(g.grantedBy)}, {formatDate(g.submittedAt)}
              </Fact>
              <Fact label="Approved by">{g.approvedBy ? person(g.approvedBy) : g.status === "AWAITING_APPROVAL" ? "Not yet" : "Not needed"}</Fact>
              <Fact label="Name">{g.delegateName ? `${g.delegateName}, confirmed by Bhutan NDI` : `${g.name} — not yet collected`}</Fact>
            </div>
          </div>
        </Panel>

        {/* ---- What the prototype can't do on its own ---- */}
        {live && g.status === "AWAITING_LISTING" ? (
          <SimulatedStep
            standsFor="NDI's list of trusted organisations"
            action={
              <>
                <SimulatedAction onClick={() => settleAuthorityListing(g.id, true)}>NDI&rsquo;s list confirms {orgName}</SimulatedAction>
                <SimulatedAction onClick={() => settleAuthorityListing(g.id, false)}>It can&rsquo;t be confirmed for 24 hours</SimulatedAction>
              </>
            }
          >
            {orgName}&rsquo;s first authority lists it on NDI&rsquo;s list of trusted organisations as able to give authority — and nothing else — and
            makes the address it issues from its main one (EW-FLOW8-SD §7.1). The registry write happens behind this screen.
          </SimulatedStep>
        ) : null}
        {live && g.status === "CLAIMABLE" && g.claimRef ? (
          <SimulatedStep
            standsFor={`the message reaching ${name}, and time passing`}
            action={
              <>
                <SimulatedAction onClick={() => router.push(`/authority/claim/${g.claimRef}`)}>Open the link as {name}</SimulatedAction>
                <SimulatedAction onClick={() => lapseGrant(g.id)}>Let seven days pass</SimulatedAction>
                {g.licenceNumbers[0] ? (
                  <SimulatedAction onClick={() => simulateLicenceRevoked(g.licenceNumbers[0])}>Have the ministry revoke {g.licenceNumbers[0]}</SimulatedAction>
                ) : null}
              </>
            }
          >
            The link goes by the grantor&rsquo;s own message or email; opening it here plays {name} on their phone. Seven days without anyone collecting
            it ends it (E15). A licence revoked before it is collected stops it at collection (E11).
          </SimulatedStep>
        ) : null}
        {live && g.status === "AWAITING_APPROVAL" ? (
          <SimulatedStep standsFor="seven days passing" action={<SimulatedAction onClick={() => lapseGrant(g.id)}>Let seven days pass without a decision</SimulatedAction>}>
            Nobody approving it within seven days ends it, and nothing is given (A1). To approve it, switch to someone who can and open it from
            Approvals.
          </SimulatedStep>
        ) : null}
        {tabOf(g.status) === "ended" && g.status !== "EXPIRED" ? (
          <p className="m-0 text-[12.5px] text-faint">Nothing was issued, and nothing about {name}&rsquo;s ID number is kept.</p>
        ) : null}
      </div>
    </AppShell>
  );
}
