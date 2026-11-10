"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { INVITATION_DAYS, VERIFY_LINK_DAYS } from "@/lib/deployment";
import { shortOrgName } from "@/lib/demoData";
import { findMail, type Mailbox, type MailMessage } from "@/lib/demoMail";
import { useDemo } from "@/lib/demoStore";
import { formatDate } from "@/features/controllership/scopeModel";

/**
 * A simulated email inbox, for the presentation.
 *
 * WHY IT EXISTS
 *
 * Three flows hand over by email: the sign-up verification link, a member
 * invitation, and the link to collect authority to act. In rehearsal a dashed panel stands in for the inbox, which is
 * quick but reads, in front of a client, as one more wallet screen — and
 * the point is that someone else, on their own device, opens it. So while a
 * part of the presentation is on, the mail opens here, in a layout most
 * clients use every day, with the account holder's name on the page.
 *
 * WHY IT IS GMAIL-LIKE BUT NOT GMAIL
 *
 * The layout is the familiar one — search, compose, folders, the opened
 * message — because familiarity is what makes the hand-off legible. Google's
 * logo and name are left out: this page is on a public address, and a copy
 * of a real provider's brand there would read as theirs. The strip across
 * the top says it is a stand-in.
 *
 * The mail's own content is NDI's and follows the screens it leads to:
 * the invitation says what joining gives and what it does not, in the
 * words of the invitation page (SCR-INV-04). UX-EW-01 does not yet specify
 * email copy, so this is the prototype's draft.
 */
const PAGE = "#f6f8fc";
const INK = "#1f1f1f";
const MUTED = "#5f6368";
const LINE = "#e3e3e3";
const ACTIVE = "#d3e3fd";
/* The Entity Wallet's dark theme: its deep teal-green, falling to ink, with
   the mint kept for the mark only. */
const DEEP = "#124143";
const DEEP_SOFT = "#1a585b";
/* The website's own: its depth gradient, mint grid, CTA and gradient text. */
const HERO = "radial-gradient(130% 120% at 85% -10%, #1f5a55 0%, #163a3c 28%, #141b29 66%, #0c111b 100%)";
const GRID = "linear-gradient(rgba(90,201,148,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(90,201,148,0.08) 1px, transparent 1px)";
const CTA = "linear-gradient(115deg, #8cf0c0 0%, #6fe0a9 24%, #4fc091 56%, #2fa189 80%, #1e8189 100%)";
const GRADIENT_TEXT = {
  background: "linear-gradient(92deg, #8cf0c0 0%, #5ac994 55%, #2e8d8f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;
const DISPLAY = "var(--font-display)";
const MONO = "var(--font-mono)";
const FONT = "Roboto, 'Segoe UI', Arial, sans-serif";

const AVATAR_COLOURS = ["#1a73e8", "#e8710a", "#188038", "#a142f4", "#d93025", "#12838e"];
const avatarColour = (name: string) =>
  AVATAR_COLOURS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_COLOURS.length];
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

export function MailView({ messageId }: { messageId: string }) {
  const { signup, orgInvitations, people, organizations, authorityGrants, hydrated } = useDemo();
  if (!hydrated) return <div style={{ background: PAGE, minHeight: "100dvh" }} />;
  const mail = findMail({ signup, orgInvitations, people, organizations, authorityGrants }, messageId);
  return <Inbox mail={mail} />;
}

function Inbox({ mail }: { mail: MailMessage | null }) {
  const mailbox: Mailbox = mail?.mailbox ?? { name: "Inbox", address: "" };
  return (
    <div style={{ background: PAGE, color: INK, fontFamily: FONT, minHeight: "100dvh" }} className="flex flex-col">
      <div
        className="px-4 py-1.5 text-center text-[12px] leading-[1.4]"
        style={{ background: "#fff4c2", color: "#5b4a00", borderBottom: "1px solid #f0dc8a" }}
      >
        <strong>Prototype</strong> — a stand-in for <strong>{mailbox.name}</strong>&rsquo;s email inbox. No email is sent.
      </div>

      {/* ---- Top bar ---- */}
      <header className="flex min-w-0 items-center gap-2 px-2 py-2 sm:gap-4 sm:px-4">
        <IconButton label="Main menu" path={P.menu} decorative />
        <div className="flex items-center gap-2 pr-2">
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="#ffffff" stroke={MUTED} strokeWidth="1.4" />
            <path d="m3.5 6.5 8.5 6.5 8.5-6.5" fill="none" stroke={DEEP_SOFT} strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span className="text-[21px] tracking-[-0.01em]" style={{ color: MUTED }}>
            Mail
          </span>
        </div>
        <div
          className="hidden h-12 max-w-[720px] flex-1 items-center gap-3 rounded-full px-4 md:flex"
          style={{ background: "#e9eef6", color: MUTED }}
        >
          <Svg path={P.search} />
          <span className="text-[15px]">Search mail</span>
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-1">
          <span className="hidden sm:inline-flex">
            <IconButton label="Support" path={P.help} decorative />
          </span>
          <span className="hidden sm:inline-flex">
            <IconButton label="Settings" path={P.settings} decorative />
          </span>
          {/* Whose inbox this is, said in words — the room needs to know at
              a glance which person is reading. */}
          <div
            className="ml-1 flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5"
            style={{ border: `1px solid ${LINE}`, background: "#ffffff" }}
          >
            <Avatar name={mailbox.name} size={32} />
            <span className="flex min-w-0 flex-col leading-[1.2]">
              <span className="truncate text-[13.5px] font-medium">{mailbox.name}</span>
              {mailbox.address ? (
                <span className="truncate text-[11.5px]" style={{ color: MUTED }}>
                  {mailbox.address}
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-2 px-2 pb-4 sm:px-3">
        {/* ---- Folders ---- */}
        <nav aria-label="Folders" className="hidden w-[236px] flex-none flex-col gap-0.5 pt-1 lg:flex">
          <div
            className="mb-3 ml-1 inline-flex h-14 w-[142px] items-center gap-3 rounded-2xl px-5 text-[14px] font-medium"
            style={{ background: "#c2e7ff" }}
          >
            <Svg path={P.pencil} />
            Compose
          </div>
          <Folder path={P.inbox} label="Inbox" count={mail ? 1 : 0} active />
          <Folder path={P.star} label="Starred" />
          <Folder path={P.clock} label="Snoozed" />
          <Folder path={P.send} label="Sent" />
          <Folder path={P.file} label="Drafts" />
        </nav>

        {/* ---- The message ---- */}
        <main className="min-w-0 flex-1 overflow-hidden rounded-2xl" style={{ background: "#ffffff" }}>
          <div className="flex items-center gap-1 px-3 py-2" style={{ color: MUTED }}>
            <IconButton label="Back to Inbox" path={P.back} decorative />
            <span className="mx-1 hidden h-5 w-px sm:block" style={{ background: LINE }} />
            <span className="hidden items-center gap-1 sm:flex">
              <IconButton label="Archive" path={P.archive} decorative />
              <IconButton label="Report spam" path={P.report} decorative />
              <IconButton label="Delete" path={P.trash} decorative />
              <span className="mx-1 h-5 w-px" style={{ background: LINE }} />
              <IconButton label="Mark as unread" path={P.unread} decorative />
              <IconButton label="Snooze" path={P.clock} decorative />
            </span>
            <span className="ml-auto pr-2 text-[12px]">1 of 1</span>
          </div>

          {mail ? <Message mail={mail} /> : <Empty />}
        </main>
      </div>
    </div>
  );
}

function Message({ mail }: { mail: MailMessage }) {
  const router = useRouter();
  const subject =
    mail.kind === "verify"
      ? "Confirm your email address for Bhutan NDI Entity Wallet"
      : mail.kind === "authority"
        ? `${shortOrgName(mail.orgName)} wants to give you authority to act for it`
        : `${mail.inviter?.name ?? "Someone"} invited you to ${mail.orgName} on Bhutan NDI Entity Wallet`;
  const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <article className="px-4 pb-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3 py-3 sm:pl-14">
        <h1 className="text-[22px] font-normal leading-[1.3]">{subject}</h1>
        <span className="rounded px-1.5 py-0.5 text-[12px]" style={{ background: "#e8eaed", color: MUTED }}>
          Inbox
        </span>
      </div>

      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
          style={{ background: DEEP }}
          aria-hidden="true"
        >
          <img src="/media/logos/ndi-mark-mint.png" alt="" width={24} height={24} className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[14px] font-semibold">Bhutan NDI</span>
            <span className="text-[12.5px]" style={{ color: MUTED }}>
              &lt;no-reply@bhutanndi.bt&gt;
            </span>
            <span className="ml-auto text-[12.5px]" style={{ color: MUTED }}>
              {time} (0 minutes ago)
            </span>
          </div>
          <p className="text-[12.5px]" style={{ color: MUTED }}>
            to {mail.mailbox.name} &lt;{mail.mailbox.address}&gt;
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl px-2 py-6 sm:ml-14 sm:px-8 sm:py-10" style={{ background: "#eef1f4" }}>
        <div
          className="mx-auto max-w-[600px] overflow-hidden rounded-[20px]"
          style={{ background: "#ffffff", boxShadow: "0 18px 50px -20px rgba(12,17,27,0.45), 0 2px 6px rgba(12,17,27,0.08)" }}
        >
          {/* ---- Hero: the wallet's depth gradient, grid and glow ---- */}
          <div className="relative overflow-hidden px-6 pb-9 pt-7 sm:px-10" style={{ background: HERO, color: "#ffffff" }}>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRID, backgroundSize: "28px 28px", maskImage: "linear-gradient(180deg, #000 0%, transparent 85%)", WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 85%)" }} />
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(111,224,169,0.45) 0%, rgba(111,224,169,0) 65%)" }} />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(46,141,143,0.5) 0%, rgba(46,141,143,0) 65%)" }} />

            <div className="relative flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(90,201,148,0.35)" }}>
                <img src="/media/logos/ndi-mark-mint.png" alt="" width={24} height={24} className="h-6 w-6" />
              </span>
              <span className="text-[17px] font-semibold tracking-[-0.01em]" style={{ fontFamily: DISPLAY }}>
                Bhutan NDI
              </span>
              <span className="ml-auto rounded-full px-2.5 py-1 text-[10.5px] uppercase tracking-[0.16em]" style={{ fontFamily: MONO, color: "#8cf0c0", background: "rgba(90,201,148,0.1)", border: "1px solid rgba(90,201,148,0.28)" }}>
                Entity Wallet
              </span>
            </div>

            <p className="relative mt-8 text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: MONO, color: "#8b95a5" }}>
              {mail.kind === "verify" ? "One step to go" : mail.kind === "authority" ? "Authority to act" : "An invitation for you"}
            </p>
            <h2 className="relative mt-2 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[32px]" style={{ fontFamily: DISPLAY }}>
              {mail.kind === "verify" ? (
                <>
                  Confirm your <span style={GRADIENT_TEXT}>email address</span>
                </>
              ) : mail.kind === "authority" ? (
                <>
                  <span style={GRADIENT_TEXT}>{shortOrgName(mail.orgName)}</span> wants to give you authority to act for it
                </>
              ) : (
                <>
                  You&rsquo;re invited to <span style={GRADIENT_TEXT}>{mail.orgName}</span>
                </>
              )}
            </h2>
            <p className="relative mt-3 max-w-[46ch] text-[14.5px] leading-[1.6]" style={{ color: "#c5ccd8" }}>
              {mail.kind === "verify" ? (
                <>
                  You started setting up a Bhutan NDI Entity Wallet account with{" "}
                  <strong style={{ color: "#ffffff" }}>{mail.mailbox.address}</strong>. Confirm it&rsquo;s your address to
                  carry on.
                </>
              ) : mail.kind === "authority" ? (
                <>You collect it in your own Bhutan NDI app. You don&rsquo;t need an account, and you don&rsquo;t join {shortOrgName(mail.orgName)}.</>
              ) : (
                <>Join your colleagues on the Bhutan NDI Entity Wallet, where {shortOrgName(mail.orgName)} keeps and shares its credentials.</>
              )}
            </p>

            {mail.kind === "authority" ? (
              <div className="relative mt-6 flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <Avatar name={mail.sender?.name ?? shortOrgName(mail.orgName)} size={38} />
                <span className="flex min-w-0 flex-col leading-[1.35]">
                  <span className="text-[11px] uppercase tracking-[0.14em]" style={{ fontFamily: MONO, color: "#8b95a5" }}>
                    Sent by
                  </span>
                  <span className="text-[15px] font-semibold">{mail.sender?.name ?? "Someone"}</span>
                  <span className="text-[12.5px]" style={{ color: "#c5ccd8" }}>
                    {mail.orgName}
                  </span>
                </span>
              </div>
            ) : null}

            {mail.kind === "invite" ? (
              <div className="relative mt-6 flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <Avatar name={mail.inviter?.name ?? "A colleague"} size={38} />
                <span className="flex min-w-0 flex-col leading-[1.35]">
                  <span className="text-[11px] uppercase tracking-[0.14em]" style={{ fontFamily: MONO, color: "#8b95a5" }}>
                    Invited by
                  </span>
                  <span className="text-[15px] font-semibold">{mail.inviter?.name ?? "A colleague"}</span>
                  {mail.inviter ? (
                    <span className="text-[12.5px]" style={{ color: "#c5ccd8" }}>
                      {mail.inviter.title}
                    </span>
                  ) : null}
                </span>
              </div>
            ) : null}
          </div>

          {/* ---- Body ---- */}
          <div className="flex flex-col gap-6 px-6 py-8 text-[15px] leading-[1.6] sm:px-10" style={{ color: "#3c4043" }}>
            {mail.kind === "verify" ? (
              <>
                <ol className="m-0 flex list-none flex-col gap-0 p-0">
                  {[
                    { title: "Confirm your email address", note: "Press the button below.", on: true },
                    { title: "Confirm it’s you", note: "Scan once with your Bhutan NDI Wallet.", on: false },
                    { title: "Choose a password", note: "Your name is filled in from your NDI wallet.", on: false },
                  ].map((step, i, all) => (
                    <li key={step.title} className="flex gap-3.5">
                      <span className="flex flex-col items-center">
                        <span
                          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[13px] font-semibold"
                          style={
                            step.on
                              ? { background: CTA, color: "#06241a", boxShadow: "0 0 0 4px rgba(90,201,148,0.18)" }
                              : { background: "#f1f4f3", color: "#5f6368", border: "1px solid #dfe5e3" }
                          }
                        >
                          {i + 1}
                        </span>
                        {i < all.length - 1 ? <span className="my-1 w-px flex-1" style={{ background: "#dfe5e3", minHeight: 14 }} /> : null}
                      </span>
                      <span className="pb-4">
                        <span className="block text-[15px] font-semibold" style={{ color: step.on ? INK : "#5f6368", fontFamily: DISPLAY }}>
                          {step.title}
                        </span>
                        <span className="block text-[13.5px]" style={{ color: MUTED }}>
                          {step.note}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <MailButton onClick={() => router.push("/sign-up/verify")}>Confirm my email address</MailButton>
                <p className="text-[13px] leading-[1.6]" style={{ color: MUTED }}>
                  The link works once and expires in {VERIFY_LINK_DAYS} days. If you didn&rsquo;t start this, ignore this
                  email — no account is set up unless the link is opened.
                </p>
              </>
            ) : mail.kind === "authority" ? (
              <>
                {/* Only the organisation's name before the person proves who
                    they are — as the claim page (S3). What she may do, where
                    and up to what is shown once her citizen ID matches, so a
                    forwarded email tells nobody else anything. */}
                <ol className="m-0 flex list-none flex-col gap-0 p-0">
                  {[
                    { title: "Open the link", note: "Press the button below.", on: true },
                    { title: "Show it’s you", note: "Share your citizen ID from your Bhutan NDI app.", on: false },
                    { title: "Accept it", note: "The authority arrives in the same app. Check it, then accept.", on: false },
                  ].map((step, i, all) => (
                    <li key={step.title} className="flex gap-3.5">
                      <span className="flex flex-col items-center">
                        <span
                          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[13px] font-semibold"
                          style={
                            step.on
                              ? { background: CTA, color: "#06241a", boxShadow: "0 0 0 4px rgba(90,201,148,0.18)" }
                              : { background: "#f1f4f3", color: "#5f6368", border: "1px solid #dfe5e3" }
                          }
                        >
                          {i + 1}
                        </span>
                        {i < all.length - 1 ? <span className="my-1 w-px flex-1" style={{ background: "#dfe5e3", minHeight: 14 }} /> : null}
                      </span>
                      <span className="pb-4">
                        <span className="block text-[15px] font-semibold" style={{ color: step.on ? INK : "#5f6368", fontFamily: DISPLAY }}>
                          {step.title}
                        </span>
                        <span className="block text-[13.5px]" style={{ color: MUTED }}>
                          {step.note}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <MailButton onClick={() => router.push(`/authority/claim/${mail.grant.claimRef}`)}>Collect your authority</MailButton>
                <p className="text-[13px] leading-[1.6]" style={{ color: MUTED }}>
                  Only the person this was meant for can collect it: their citizen ID has to match the one {shortOrgName(mail.orgName)} entered.
                  {mail.grant.claimExpiresAt ? ` The link works until ${formatDate(mail.grant.claimExpiresAt)}.` : ""} Not expecting it? Ignore it —
                  nothing happens unless you collect it.
                </p>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 overflow-hidden rounded-2xl" style={{ border: "1px solid #dcebe4", background: "linear-gradient(135deg, #f3fbf7 0%, #eef5f6 100%)" }}>
                  <div className="px-4 py-3.5" style={{ borderRight: "1px solid #dcebe4" }}>
                    <p className="text-[10.5px] uppercase tracking-[0.14em]" style={{ fontFamily: MONO, color: MUTED }}>
                      Organisation
                    </p>
                    <p className="mt-0.5 text-[15px] font-semibold leading-[1.35]" style={{ color: INK, fontFamily: DISPLAY }}>
                      {mail.orgName}
                    </p>
                  </div>
                  <div className="px-4 py-3.5">
                    <p className="text-[10.5px] uppercase tracking-[0.14em]" style={{ fontFamily: MONO, color: MUTED }}>
                      Your role
                    </p>
                    <p className="mt-0.5 text-[15px] font-semibold" style={{ color: DEEP, fontFamily: DISPLAY }}>
                      {mail.invitation.role ?? "Member"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="text-[10.5px] uppercase tracking-[0.14em]" style={{ fontFamily: MONO, color: MUTED }}>
                    What joining does
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-[12px] font-bold" style={{ background: CTA, color: "#06241a" }}>
                      ✓
                    </span>
                    <span>You can sign in and see {shortOrgName(mail.orgName)}&rsquo;s information.</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-[12px] font-bold" style={{ background: "#f1f4f3", color: MUTED, border: "1px solid #dfe5e3" }}>
                      ✕
                    </span>
                    <span>
                      It doesn&rsquo;t let you act for {shortOrgName(mail.orgName)}. If that&rsquo;s needed, they&rsquo;ll give it to you
                      separately.
                    </span>
                  </p>
                </div>

                <MailButton onClick={() => router.push(`/invitation/${mail.invitation.id}`)}>View invitation</MailButton>
                <p className="text-[13px] leading-[1.6]" style={{ color: MUTED }}>
                  When you accept, you&rsquo;ll confirm it&rsquo;s you with your Bhutan NDI Wallet. This invitation
                  expires in {INVITATION_DAYS.M} days. Not expecting it? Ignore it — nothing happens unless you accept.
                </p>
              </>
            )}
          </div>

          {/* ---- Footer: the dark ground again, to close ---- */}
          <div className="flex items-center gap-3 px-6 py-5 text-[12px] leading-[1.55] sm:px-10" style={{ background: "#0c111b", color: "#8b95a5" }}>
            <img src="/media/logos/ndi-mark-mint.png" alt="" width={20} height={20} className="h-5 w-5 flex-none opacity-80" />
            <span>
              Bhutan NDI · Thimphu, Bhutan. You received this because this address was entered on the Bhutan NDI Entity
              Wallet.
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Empty() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center" style={{ color: MUTED }}>
      <p className="text-[16px]">This email isn&rsquo;t in the inbox.</p>
      <p className="max-w-[44ch] text-[13.5px]">
        The demo was reset, or the sign-up, invitation or authority it belonged to has gone. Start that part of the
        presentation again.
      </p>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mt-2 rounded-full px-5 py-2 text-[14px] font-medium"
        style={{ border: `1px solid ${LINE}`, color: INK }}
      >
        Back to the start
      </button>
    </div>
  );
}

function MailButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  /* The wallet's own primary button, as it is drawn in the light theme —
     its mint gradient, dark text and sweep — with the values written out,
     since this page keeps its own light palette whatever the app's theme. */
  return (
    <button
      type="button"
      onClick={onClick}
      className="ndi-sweepbtn relative inline-flex h-12 w-fit cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xl px-6 text-[14.5px] font-semibold"
      style={{
        background: "linear-gradient(115deg, #63d6a2 0%, #4cbf8c 55%, #38a97d 100%)",
        color: "#06241a",
        fontFamily: DISPLAY,
        border: "1px solid rgba(29,125,87,0.25)",
        boxShadow: "0 0 0 1px rgba(29,125,87,0.12), 0 0 16px rgba(29,125,87,0.18)",
      }}
    >
      <span className="ndi-store-sweep" />
      <span className="ndi-store-glow" />
      <span className="relative z-[1] inline-flex items-center gap-2.5">
        {children}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}

function Avatar({ name, size }: { name: string; size: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center rounded-full font-medium text-white"
      style={{ width: size, height: size, background: avatarColour(name), fontSize: size * 0.42 }}
    >
      {initials(name)}
    </span>
  );
}

function Folder({ path, label, count, active }: { path: string; label: string; count?: number; active?: boolean }) {
  return (
    <div
      className="flex h-8 items-center gap-4 rounded-r-full pl-6 pr-4 text-[14px]"
      style={{ background: active ? ACTIVE : "transparent", fontWeight: active ? 700 : 400 }}
    >
      <Svg path={path} />
      <span className="flex-1">{label}</span>
      {count ? <span className="text-[12.5px]">{count}</span> : null}
    </div>
  );
}

/* Decorative controls: they look like the inbox's, and do nothing — the only
   working control on the page is the button in the mail. */
function IconButton({ label, path }: { label: string; path: string; decorative: true }) {
  return (
    <span title={label} aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full" style={{ color: MUTED }}>
      <Svg path={path} />
    </span>
  );
}

function Svg({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const P = {
  menu: "M4 6h16M4 12h16M4 18h16",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM20 20l-4.8-4.8",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17h.01",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5l1.5 1.2-2 3.4-1.8-.6a7 7 0 0 1-1.9 1.1L15 21h-4l-.3-2.4a7 7 0 0 1-1.9-1.1l-1.8.6-2-3.4 1.5-1.2a7 7 0 0 1 0-3L5 9.3l2-3.4 1.8.6a7 7 0 0 1 1.9-1.1L11 3h4l.3 2.4a7 7 0 0 1 1.9 1.1l1.8-.6 2 3.4-1.5 1.2a7 7 0 0 1 0 3Z",
  pencil: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4",
  inbox: "M4 13h4l1.5 2.5h5L16 13h4M4 13l2-7h12l2 7v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5Z",
  star: "m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8L12 3.8Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  send: "M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z",
  file: "M14 3H6v18h12V7l-4-4ZM14 3v4h4",
  back: "M19 12H5M11 18l-6-6 6-6",
  archive: "M4 7h16v12H4V7ZM3 4h18v3H3V4ZM10 11h4",
  report: "M12 8v5M12 16h.01M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7L8.5 3Z",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  unread: "M4 6h16v12H4V6ZM4 7l8 6 8-6",
};
