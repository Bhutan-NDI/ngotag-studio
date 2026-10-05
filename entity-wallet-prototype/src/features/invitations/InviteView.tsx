"use client";

import Link from "next/link";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { INVITATION_DAYS } from "@/lib/deployment";
import { PLATFORM_ADMINS } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

type Sent = { kind: "sent" | "queued"; email: string };

/**
 * SCR-INV-01 — Invite someone. FLOW-ONB-02 step 1, for both kinds.
 *
 * THE SUMMARY IS FOR THE INVITER
 *
 * The screen's job is to make the consequences legible to the person
 * sending, before they send — because the characteristic mistake here is an
 * owner believing they have given a colleague the ability to act for the
 * business when they have only let them in. So a live summary states what
 * the invitation grants and, in the same breath, what it does not (UXD-04 —
 * "the negative clause is mandatory, not optional").
 *
 * KIND O STATES THE SECOND APPROVAL BEFORE THE SEND
 *
 * Designating a foundational issuer needs a second administrator (D7). That
 * is said on the form, not discovered afterwards — an administrator who
 * presses send and then learns nothing was sent has been surprised by the
 * control rather than informed by it.
 *
 * The approval requirement follows what is being granted, not the kind of
 * invitation (POL-CAP). Inviting an ordinary business to register uses the
 * Kind O shape without the second approval — but only when self-service
 * sign-up is switched off (FLOW-ONB-01 §9), so here it is shown and
 * disabled with the reason rather than hidden.
 */
export function InviteView({ kind }: { kind: "M" | "O" }) {
  const { inviteToOrganisation, proposeOrganisation, organizations, activeOrgId, currentPerson, harness, people } =
    useDemo();

  const forced = useScreenState(`SCR-INV-01-${kind}`, [
    "default",
    "loading",
    "no_permission",
    "org_unavailable",
    "duplicate",
    "sent",
    "offline",
  ]);

  const org = organizations.find((o) => o.id === activeOrgId);
  const orgName = org?.name ?? "this organisation";

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Member" | "Admin">("Member");
  const [legalName, setLegalName] = useState("");
  const [legalIdentity, setLegalIdentity] = useState("");
  const [purpose, setPurpose] = useState<"foundational" | "business">("foundational");
  const [purposeDetail, setPurposeDetail] = useState("");
  const selfService = harness.selfServiceSignup;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);

  const permitted =
    kind === "M"
      ? currentPerson.memberRole === "Owner" || currentPerson.memberRole === "Admin"
      : PLATFORM_ADMINS.includes(harness.persona);

  const back = kind === "M" ? "/members" : "/admin/invitations";
  const loading = busy || forced === "loading";

  const shownError =
    forced === "org_unavailable"
      ? "That organisation isn't available."
      : forced === "duplicate"
        ? `Ugyen Phuntsho is already a member of ${orgName}.`
        : error;
  const shownSent: Sent | null =
    forced === "sent"
      ? { kind: kind === "O" ? "queued" : "sent", email: email || "sangay.choden@peldentrading.bt" }
      : sent;

  if (forced === "no_permission" || !permitted) {
    /* E1. The invite action is not offered to anyone who cannot use it
       (SCR-INV-01's disabled state) — this is what someone arriving by URL
       sees instead of a form they would fill in and have refused. */
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
          <PageHeader crumbs={[{ label: kind === "M" ? "Members" : "Invitations", href: back }, { label: "Invite" }]} title="Invite someone" />
          <Panel>
            <p className="relative z-[4] text-[13.5px] leading-[1.6] text-muted">
              {kind === "M"
                ? `You don't have permission to invite people to ${orgName}. Ask its owner.`
                : "Only NDI platform administrators can bring an organisation onto the platform."}
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    (kind === "M" || (legalName.trim() !== "" && legalIdentity.trim() !== ""));

  const send = () => {
    if (!valid) {
      setError(kind === "M" ? "Enter the address to send the invitation to." : "Enter the address, and the organisation's name and legal identity.");
      return;
    }
    setError(null);
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (kind === "M") {
        const result = inviteToOrganisation({ email, role });
        if (!result.ok) {
          const who = people.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
          setError(
            result.error === "E3"
              ? `${who?.name ?? email.trim()} is already a member of ${orgName}, or already has an invitation waiting.`
              : `You don't have permission to invite people to ${orgName}.`,
          );
          return;
        }
        setSent({ kind: "sent", email: email.trim() });
      } else {
        const needsSecondApproval = purpose === "foundational";
        proposeOrganisation({
          email,
          legalName: legalName.trim(),
          legalIdentity: legalIdentity.trim(),
          purpose:
            purposeDetail.trim() ||
            (needsSecondApproval
              ? "Foundational issuer — issues the credential that constitutes the organisations it registers."
              : "Register as an ordinary business."),
          needsSecondApproval,
        });
        setSent({ kind: needsSecondApproval ? "queued" : "sent", email: email.trim() });
      }
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
        <PageHeader
          crumbs={[{ label: kind === "M" ? "Members" : "Invitations", href: back }, { label: "Invite" }]}
          title={kind === "M" ? `Invite someone to ${orgName}` : "Bring an organisation onto the platform"}
        />

        {shownSent ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="flex items-center gap-2 font-display text-[15px] font-semibold text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} className="text-accent" />
                {shownSent.kind === "queued"
                  ? "Waiting for a second administrator"
                  : `Invitation sent to ${shownSent.email}`}
              </p>
              <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                {shownSent.kind === "queued"
                  ? `Nothing has been sent to ${shownSent.email}. A different administrator has to approve this before it goes out — it's in their approvals queue now.`
                  : kind === "M"
                    ? `It works for ${INVITATION_DAYS.M} days and gives them nothing until they accept. You'll see it in the list of invitations waiting until they do.`
                    : `It works for ${INVITATION_DAYS.O} days and gives them nothing until they accept.`}
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link href={back}>
                  <GradientButton>
                    {kind === "M" ? "See invitations waiting" : "See invitations"}
                    <Icon name="arrowRight" size={14} strokeWidth={2} />
                  </GradientButton>
                </Link>
                {shownSent.kind === "queued" ? (
                  <Link href="/admin/approvals">
                    <HairlineButton>Open the approvals queue</HairlineButton>
                  </Link>
                ) : null}
              </div>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-5 min-[1201px]:grid-cols-[minmax(0,1fr)_380px] min-[1201px]:items-start">
            <Panel>
              <div className="relative z-[4] flex flex-col gap-5">
                {forced === "offline" ? (
                  <p role="alert" className="rounded-[10px] border border-grid px-3.5 py-3 text-[13px] text-body">
                    That didn&rsquo;t send, so nothing was sent to anyone. Check your connection and
                    try again.
                  </p>
                ) : null}
                {shownError ? (
                  <p role="alert" className="rounded-[10px] border px-3.5 py-3 text-[13px]" style={{ borderColor: "var(--text-danger)", color: "var(--text-danger)" }}>
                    {shownError}
                  </p>
                ) : null}

                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Their email address</span>
                  <input
                    className={`${FIELD_CLASS} h-12`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={kind === "M" ? "sangay.choden@peldentrading.bt" : "registrar@csoa.gov.bt"}
                    disabled={loading}
                  />
                </label>

                {kind === "M" ? (
                  <div className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>Their role</span>
                    <SegmentedControl
                      label="Their role"
                      value={role}
                      onChange={setRole}
                      disabled={loading}
                      segments={[
                        { value: "Member", label: "Member" },
                        { value: "Admin", label: "Admin" },
                      ]}
                    />
                    <span className="text-[12.5px] leading-[1.5] text-faint">
                      {role === "Admin"
                        ? "An admin can also invite and remove members."
                        : "A member can sign in and see the organisation."}
                    </span>
                  </div>
                ) : (
                  <>
                    <label className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>Organisation to be registered</span>
                      <input
                        className={`${FIELD_CLASS} h-12`}
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="Civil Society Organisations Authority"
                        disabled={loading}
                      />
                    </label>
                    <label className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>Its legal identity</span>
                      <input
                        className={`${FIELD_CLASS} h-12`}
                        value={legalIdentity}
                        onChange={(e) => setLegalIdentity(e.target.value)}
                        placeholder="Statutory authority that registers civil society organisations"
                        disabled={loading}
                      />
                    </label>
                    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                      <legend className={`${LABEL_CLASS} p-0`}>What it is being brought on for</legend>
                      <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-grid px-3.5 py-3">
                        <input
                          type="radio"
                          name="purpose"
                          checked={purpose === "foundational"}
                          onChange={() => setPurpose("foundational")}
                          className="mt-1"
                        />
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[13.5px] font-medium text-body">
                            To issue the credential that constitutes other organisations
                          </span>
                          <span className="text-[12.5px] leading-[1.5] text-faint">
                            A foundational issuer — a root of trust. Needs a second administrator.
                          </span>
                        </span>
                      </label>
                      <label
                        className={`flex items-start gap-3 rounded-[12px] border border-grid px-3.5 py-3 ${
                          selfService ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="purpose"
                          checked={purpose === "business"}
                          onChange={() => {
                            setPurpose("business");
                            /* The invited route in the demo is Pelden's, so
                               an empty form starts with it — the presenter
                               is not typing a company on stage. The address
                               is one no account holds yet, so the invitee
                               goes through account creation (A1). */
                            if (!email && !legalName && !legalIdentity) {
                              setEmail("director@peldentrading.bt");
                              setLegalName("Pelden Trading Pvt. Ltd.");
                              setLegalIdentity("Private limited company, CRA-2019-04477");
                            }
                          }}
                          disabled={selfService}
                          className="mt-1"
                        />
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[13.5px] font-medium text-body">To register as an ordinary business</span>
                          <span className="text-[12.5px] leading-[1.5] text-faint">
                            {selfService
                              ? "Not needed here: businesses sign up for themselves while self-service sign-up is switched on."
                              : "Used only while self-service sign-up is off. No second administrator needed."}
                          </span>
                        </span>
                      </label>
                    </fieldset>
                    <label className={FIELD_BLOCK_CLASS}>
                      <span className={LABEL_CLASS}>What it will issue — for the approver</span>
                      <textarea
                        className={`${FIELD_CLASS} resize-y py-3`}
                        rows={3}
                        value={purposeDetail}
                        onChange={(e) => setPurposeDetail(e.target.value)}
                        placeholder="Foundational issuer for civil society organisations — lets CSOs register on the platform, which today they cannot."
                        disabled={loading}
                      />
                    </label>
                  </>
                )}

                <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-4">
                  <GradientButton onClick={send} disabled={loading}>
                    <Icon name="send" size={15} strokeWidth={2} />
                    {loading
                      ? "Sending…"
                      : kind === "O" && purpose === "foundational"
                        ? "Send for approval"
                        : "Send invitation"}
                  </GradientButton>
                  <Link href={back}>
                    <HairlineButton>Cancel</HairlineButton>
                  </Link>
                </div>
              </div>
            </Panel>

            {/* ---- The grant summary: what it does, and what it does not ---- */}
            <Panel>
              <div className="relative z-[4] flex flex-col gap-3">
                <h2 className="font-display text-[15px] font-semibold text-strong">What this invitation does</h2>
                {kind === "M" ? (
                  <>
                    <p className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                      <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                      They&rsquo;ll be able to sign in and see {orgName}
                      {role === "Admin" ? ", and invite and remove members" : ""}.
                    </p>
                    <p className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                      <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                      They won&rsquo;t be able to act on its behalf until you give them that separately.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                      <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                      When they accept, they&rsquo;ll register {legalName.trim() || "the organisation"} and
                      become its owner — creating its own keys, not receiving any from NDI.
                    </p>
                    <p className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                      <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                      {purpose === "foundational"
                        ? "It won't be able to issue anything until its designation is activated."
                        : "It will hold credentials and prove things about itself, but not issue any — that needs endorsement later."}
                    </p>
                    {purpose === "foundational" ? (
                      <p className="rounded-[10px] border border-grid px-3.5 py-3 text-[12.5px] leading-[1.55] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
                        This needs a second administrator to approve before it is sent.
                      </p>
                    ) : null}
                  </>
                )}
                <p className="border-t border-subtle pt-3 text-[12.5px] leading-[1.5] text-faint">
                  It expires after {kind === "M" ? INVITATION_DAYS.M : INVITATION_DAYS.O} days if nobody
                  accepts it, and you can revoke it at any time before then.
                </p>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </AppShell>
  );
}
