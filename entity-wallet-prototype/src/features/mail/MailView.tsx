"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { INVITATION_DAYS, VERIFY_LINK_DAYS } from "@/lib/deployment";
import { findMail, type Mailbox, type MailMessage } from "@/lib/demoMail";
import { useDemo } from "@/lib/demoStore";

/**
 * A simulated email inbox, for the presentation.
 *
 * WHY IT EXISTS
 *
 * Two flows hand over by email: the sign-up verification link and a member
 * invitation. In rehearsal a dashed panel stands in for the inbox, which is
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
const MINT = "#5ac994";
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
  const { signup, orgInvitations, people, organizations, hydrated } = useDemo();
  if (!hydrated) return <div style={{ background: PAGE, minHeight: "100dvh" }} />;
  const mail = findMail({ signup, orgInvitations, people, organizations }, messageId);
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
            <path d="m3.5 6.5 8.5 6.5 8.5-6.5" fill="none" stroke={MINT} strokeWidth="2" strokeLinejoin="round" />
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
          style={{ background: "#0f2a22" }}
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

      <div className="mt-5 rounded-lg px-3 py-6 sm:ml-14 sm:px-8 sm:py-8" style={{ background: "#f1f3f4" }}>
        <div
          className="mx-auto max-w-[600px] overflow-hidden rounded-xl"
          style={{ background: "#ffffff", border: `1px solid ${LINE}` }}
        >
          <div className="flex items-center gap-2 px-6 py-5 sm:px-8" style={{ background: MINT, color: "#ffffff" }}>
            <span className="text-[19px] font-bold">Bhutan NDI</span>
            <span className="text-[14px] opacity-90">· Entity Wallet</span>
          </div>
          <div className="flex flex-col gap-4 px-6 py-6 text-[15px] leading-[1.6] sm:px-8" style={{ color: "#3c4043" }}>
            {mail.kind === "verify" ? (
              <>
                <p>Hello,</p>
                <p>
                  Someone — hopefully you — started creating a Bhutan NDI Entity Wallet account with{" "}
                  <strong style={{ color: INK }}>{mail.mailbox.address}</strong>. Confirm it&rsquo;s your address to carry on.
                </p>
                <MailButton onClick={() => router.push("/sign-up/verify")}>Confirm my email address</MailButton>
                <p className="text-[13.5px]" style={{ color: MUTED }}>
                  The link works once and expires in {VERIFY_LINK_DAYS} days. Next, you&rsquo;ll confirm it&rsquo;s you with
                  your Bhutan NDI Wallet and choose a password.
                </p>
                <p className="text-[13.5px]" style={{ color: MUTED }}>
                  If this wasn&rsquo;t you, ignore this email. Nothing is set up unless the link is opened.
                </p>
              </>
            ) : (
              <>
                <p>Hello,</p>
                <p>
                  <strong style={{ color: INK }}>{mail.inviter?.name ?? "Someone"}</strong> has invited you to join{" "}
                  <strong style={{ color: INK }}>{mail.orgName}</strong> on the Bhutan NDI Entity Wallet.
                </p>
                <span
                  className="inline-flex w-fit rounded-full px-3.5 py-1 text-[14px] font-semibold"
                  style={{ background: "#e6f6ee", color: "#1d7d57" }}
                >
                  Role: {mail.invitation.role ?? "Member"}
                </span>
                <div className="rounded-lg px-5 py-4" style={{ border: `1px solid ${LINE}`, borderLeft: `4px solid ${MINT}` }}>
                  <p className="text-[11.5px] uppercase tracking-[0.08em]" style={{ color: MUTED }}>
                    Invited by
                  </p>
                  <p className="text-[16px] font-semibold" style={{ color: INK }}>
                    {mail.inviter?.name ?? "A colleague"}
                  </p>
                  {mail.inviter ? (
                    <p className="text-[13.5px]" style={{ color: MUTED }}>
                      {mail.inviter.title}, {mail.orgName}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-lg px-5 py-4" style={{ border: `1px solid ${LINE}` }}>
                  <p className="mb-1.5 text-[13.5px]" style={{ color: MUTED }}>
                    What joining does
                  </p>
                  <p className="flex gap-2">
                    <span style={{ color: "#1d7d57" }}>✓</span> You can sign in and see {mail.orgName}&rsquo;s information.
                  </p>
                  <p className="flex gap-2">
                    <span style={{ color: MUTED }}>✕</span> It doesn&rsquo;t let you act for {mail.orgName}. If that&rsquo;s
                    needed, they&rsquo;ll give it to you separately.
                  </p>
                </div>
                <MailButton onClick={() => router.push(`/invitation/${mail.invitation.id}`)}>Review the invitation</MailButton>
                <p className="text-[13.5px]" style={{ color: MUTED }}>
                  When you accept, you&rsquo;ll confirm it&rsquo;s you with your Bhutan NDI Wallet. This invitation
                  expires in {INVITATION_DAYS.M} days.
                </p>
                <p className="text-[13.5px]" style={{ color: MUTED }}>
                  Not expecting this? You can ignore it — nothing happens unless you accept.
                </p>
              </>
            )}
          </div>
          <div className="px-6 py-4 text-[12px] sm:px-8" style={{ background: "#f8f9fa", color: MUTED }}>
            Bhutan NDI · Thimphu, Bhutan. You received this because this address was entered on the Bhutan NDI
            Entity Wallet.
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
        The demo was reset, or the sign-up or invitation it belonged to has gone. Start that part of the presentation
        again.
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
  return (
    <button
      type="button"
      onClick={onClick}
      className="my-1 inline-flex h-12 w-fit items-center rounded-lg px-7 text-[15px] font-semibold shadow-[0_2px_6px_rgb(0_0_0/0.15)]"
      style={{ background: MINT, color: "#ffffff" }}
    >
      {children}
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
