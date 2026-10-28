"use client";

import Link from "next/link";

import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * The page behind the prototype marker.
 *
 * WHY THIS IS A SCREEN AND NOT A PARAGRAPH IN THE README
 *
 * This demo shows a government register confirming a representative in a few
 * seconds, revocation reaching a counterparty instantly, and a signed
 * verification decision. Somebody in the room will conclude those are built —
 * and the person most likely to conclude it is the person deciding whether to
 * fund building them. A note in a repository nobody opens does not reach that
 * person; a page one click from the marker on every screen does.
 *
 * It is written to be handed over rather than narrated, because the question
 * usually arrives after the demo, by email, from somebody who was not there.
 *
 * HOW IT IS ORGANISED
 *
 * By what would have to be built, not by screen, because that is the question
 * being asked underneath "is this real?" — what is left to do. And the honest
 * answer includes the parts that *are* real: the model, the vocabulary and the
 * flow are genuine work product, and undersellling them is its own kind of
 * inaccuracy.
 */
interface Row {
  shown: string;
  reality: string;
  /** What would have to exist for this to be real. */
  needs: string;
}

const SIMULATED: { area: string; icon: IconName; rows: Row[] }[] = [
  {
    area: "Identity and the register",
    icon: "fingerprint",
    rows: [
      {
        shown: "A wallet proof request answered on a phone",
        reality:
          "An authored pause and a deliberately non-scannable code, on a card drawn after the NDI integration page. \"Simulate the scan\" stands in for the phone; the video guide and store badges go nowhere. No wallet is contacted and nothing is signed.",
        needs: "The existing NDI wallet proof-request flow, wired to this console.",
      },
      {
        shown: "The root administrator signing straight in to NDI's organisation",
        reality:
          "Root's account and Bhutan NDI's organisation are fixtures in the demo data. Signing in only matches the address to a person — any password works, and nothing is checked.",
        needs: "Root and NDI's organisation seeded by the deployment itself, with a hardware-backed second factor on root's account.",
      },
      {
        shown: "Platform admins and their decisions",
        reality:
          "Invitations and approvals live in your browser. \"The root account approves nothing\" and \"only an admin can decide\" are checked by the demo store, which is not a boundary.",
        needs: "Role checks and the audit of every decision enforced by the platform's services.",
      },
      {
        shown: "Issuer logos on credential cards",
        reality: "Initials in a seal. No real agency or bank logo is used.",
        needs: "Issuer display metadata, including logos, from the trust registry.",
      },
      {
        shown: "Self-service sign-up switched on or off",
        reality:
          "A demo control, so both ways onto the platform can be shown. In the product it is a deployment setting nobody using the console can change.",
        needs: "The FLOW-ONB-01 P3 setting, read at request time and enforced by the server.",
      },
      {
        shown: "The Corporate Regulatory Authority confirming a representative",
        reality:
          "A handful of fixed records and a four-second delay. No register is queried: typing one of the listed registration numbers decides the answer, and \"can't be reached\" or \"setting up stalls\" are buttons rather than faults.",
        needs:
          "Each authority's issuer agent raising the identity request and answering from its own register, and the authority designations (which type, which authority) from FLOW-ORG-02.",
      },
      {
        shown: "Setting up the organisation's wallet \"in a few minutes\"",
        reality:
          "A couple of seconds, and nothing is created: the registration added automatically is a fixture. Closing the page and coming back works because the stage is kept in your browser.",
        needs: "Agent and wallet provisioning, the brokered credential offer with automatic acceptance, and completion that survives the page closing.",
      },
      {
        shown: "Accepting an appointment with one NDI wallet approval, from \"Bhutan NDI Verification\"",
        reality:
          "No request is sent and nothing is signed. The name is a stand-in — the real one is set when NDI's verification organisation is created — and the acceptance wording is a placeholder awaiting GovTech's drafting.",
        needs:
          "NDI's dedicated verification organisation, a proof request whose challenge carries the appointment, and the versioned acceptance and attestation texts.",
      },
      {
        shown: "Withdrawing an appointment before it is accepted, and the appointee being told",
        reality:
          "Recorded in your browser. Nobody is notified: the appointee finds out by opening the appointment, which then says it was withdrawn. That an acceptance arriving first wins is a check in the demo store, not a lock on anything.",
        needs:
          "The withdraw route on the relation, serialised with acceptance on the server, and a notification to the appointee.",
      },
      {
        shown: "\"Tell us you're waiting\" and \"email me when it's done\"",
        reality: "Recorded in your browser. Nobody is emailed.",
        needs: "An interest store keeping the type and an address only, and a notification service.",
      },
    ],
  },
  {
    area: "Accounts and invitations",
    icon: "mail",
    rows: [
      {
        shown: "A verification email, and the link inside it",
        reality:
          "No email is sent. The dashed prototype panel stands in for the inbox, and the send limit is counted in your browser.",
        needs: "A mail service with delivery and bounce reporting, and single-use signed links.",
      },
      {
        shown: "An account with a password",
        reality: "Nothing is stored anywhere but your browser, and the password is not kept at all.",
        needs: "The platform's identity provider, with the password policy enforced server-side.",
      },
      {
        shown: "An invitation delivered, bouncing, or accepted",
        reality:
          "No invitation is sent; \"open the invitation as …\" stands in for the email, and the bounce in the story three months on is a seeded fixture. Setting up an account from the link keeps only the name — the link is trusted to prove the address because a real one would be single-use and signed. Acceptance re-checks are store logic, not a server.",
        needs: "Invitation service with expiry, revocation, single-use signed links and the acceptance-time re-checks run server-side.",
      },
      {
        /* Not simulated so much as not specified. Kind A was here too until
           FLOW-ONB-02 v0.6 specified it; Kind W still isn't. Listed so nobody
           at the showcase takes it as the spec. */
        shown: "NDI inviting an existing organisation to keep its own records",
        reality:
          "An invitation kind the prototype added. FLOW-ONB-02 specifies member, agency and administrator invitations; an existing organisation starts verification without being invited. It reuses the agency invitation's 30-day expiry. Invitees of it, and of administrator invitations, set up their account on the invitation instead of through sign-up — a departure from FLOW-ONB-02, whose version sends them through sign-up.",
        needs: "A decision on whether this belongs in FLOW-ONB-02 (or another flow), and on the set-up-from-the-link shortcut.",
      },
      {
        shown: "The root account, held by two custodians",
        reality:
          "One persona anyone can drive. The custodians and any reason typed in are kept in your browser, and \"every administrator is told\" is an entry in the activity feed — no alert goes anywhere, and there is no split credential.",
        needs: "A role account whose credential and MFA are split between two named custodians, the S9 limits checked server-side, and the alerting and custody register behind them.",
      },
      {
        shown: "Two administrators approving a designation or a new administrator",
        reality:
          "Dual control is enforced by the demo store, which also refuses and logs a self-approval or an approval by the root account — but the store is not a boundary.",
        needs: "Dual control enforced by the service, with the approver recorded in the audit trail.",
      },
    ],
  },
  {
    area: "Authority and enforcement",
    icon: "lockRounded",
    rows: [
      {
        shown: "Scope refusing an out-of-scope action",
        reality:
          "Every allow, deny and park in this demo is a value written into a fixture. Nothing is enforced — the screens render decisions they were handed.",
        needs:
          "Server-side enforcement: a guard that resolves active relations from the database and denies by default, plus a service-layer re-check before the agent call.",
      },
      {
        shown: "An approval holding an operation back, then releasing it",
        reality:
          "State in your browser. The re-validation at execution is modelled, but nothing is executed.",
        needs: "An approval-policy engine and a parked-operation store with real TTLs.",
      },
      {
        shown: "An approval signed from a wallet",
        reality:
          "A pause. The payload fingerprint shown is real in shape and random in content — nothing commits to anything.",
        needs: "Approval-as-presentation: the operation hash embedded in a proof request.",
      },
    ],
  },
  {
    area: "Giving authority to act",
    icon: "send",
    rows: [
      {
        shown: "A clearing agent collecting authority from a link, proving who she is with Bhutan NDI",
        reality:
          "The claim page is real in its rules — nothing is shown before the identity matches, a dead link names nobody, three mismatches end it — but the Bhutan NDI app is a dashed panel: \"Share <name>'s ID\" picks one of four invented citizens, and \"Accept in the app\" stands in for the app's offer screen. No identity request is sent, no presentation verified, no credential offered or signed.",
        needs:
          "The claim page outside Studio sign-in, the identity request through NDI's verification organisation with the grant's challenge, the G8 match, and an authority-only issuance route that the capability gate admits for one grant in ISSUING (EW-FLOW8-SD §7.1, §11.2).",
      },
      {
        shown: "The ID number matched without being kept",
        reality:
          "The number becomes a string hash mixed with the organisation's id the moment Give authority is pressed, and that is all that is stored — and it is cleared when the grant ends. The hash is not a keyed HMAC and would not protect a real 11-digit number; until then the number sits in the form's draft in your browser.",
        needs: "An HMAC with a per-organisation key in the key management service, never logged (FLOW-AUT-01 S4).",
      },
      {
        shown: "Pelden being added to NDI's list of trusted organisations on its first grant",
        reality:
          "A dashed step — \"NDI's list confirms\" or \"can't be confirmed for 24 hours\" — and a field on the organisation. No did:ethr is created, nothing is written to the Trust Registry, and no primary DID is switched.",
        needs: "Authenticated Trust Registry writes, the Capability-type listing and the primary-DID switch after listing (FLOW-AUT-01 P5, P8; §7.1).",
      },
      {
        shown: "The business licence the agent acts under, and whether it can be named",
        reality:
          "Pelden's licence comes from a dashed step, because the ministry doesn't offer one on request in the prototype. Whether a licence may be relied on by someone acting for the holder is a constant in lib/authority.ts standing in for the Trust Registry's delegable flag, which doesn't exist yet. Revoking it is a dashed step on the waiting authority.",
        needs: "MoICE issuing revocable business licences marked delegable (FLOW-AUT-01 P7), the delegable flag (D9), and the held-credential index carrying licence numbers (EW-FLOW6-SD §4.5).",
      },
      {
        shown: "Revocation ids, registered when the agent accepts",
        reality: "A generated id on the grant, discarded if the offer isn't accepted. \"Accept — the registration is slow\" shows E17. Nothing is registered anywhere.",
        needs: "Revocation for platform-issued credentials (FLOW-AUT-01 P6, D23).",
      },
      {
        shown: "Seven days passing, thirty minutes passing",
        reality: "Dashed buttons that move the date back. Real dates are also read: a link or approval left seven days lapses on load.",
        needs: "The service's own timers.",
      },
      {
        shown: "Who is told — approvers asked, the link ready, the Root told a link is out and how it ended",
        reality:
          "Where UX-EW-05 §3.5 gives the words they are used verbatim; the approvers' notice, \"the link is ready\" and the Root's notices are the prototype's. Each is a line in the organisation's activity feed naming who it goes to. The Root is also told when someone else cancels a grant, which D18 doesn't list (pr-8, optional).",
        needs: "In-app and email delivery, and those lines in UX-EW-05 §3.5.",
      },
      {
        shown: "Choices the specification leaves open, made here",
        reality:
          "The limit is always per declaration — the form offers nothing else, and every grant is written per transaction (pr-8 item 1). A link is \"used\" once the authority is accepted; opened again while an offer is out, it asks for identity again, then shows the same offer (pr-8 item 2). The duplicate warning also counts grants still waiting for approval or for the listing (pr-8, optional). SCR-AUT-01's heading is the specification's and is also Flow 3's page heading (align D1).",
        needs: "The specification to settle each.",
      },
      {
        /* The one row here about a counterparty rather than about NDI. */
        shown: "The Bhutan National Single Window checking an authority",
        reality:
          "Flow 9's page, still ahead of its specification: it sends each declaration to the agent's wallet and to an NDI verification API, which EW-FLOW9-SD replaces. The Single Window is not live yet. It now reads Flow 8's grants, with no role chain and no grantor's relation in what it checks.",
        needs: "Flow 9 itself (EW-FLOW9-SD), and BNSW's integration.",
      },
    ],
  },
  {
    area: "Approval to verify or issue",
    icon: "certificate",
    rows: [
      {
        shown: "Organisations seen verifying or issuing without approval",
        reality:
          "A fixed list in the demo data. There is no capability gate observing anything, and the enforcement date is a date in a fixture.",
        needs: "The capability gate in observe mode, logging who verifies and issues, then switched to enforce on a decided date.",
      },
      {
        shown: "Two administrators, and the organisation accepting by name",
        reality:
          "\"The proposer can't approve it\", \"a recommended decline can only be confirmed\", \"only the owner accepts\" and \"only a business's representative withdraws or stops what it asked for\" are checked by the demo store, which is not a boundary. The wallet approval is the same simulated scan as everywhere else. Reminders after 10 working days are shown as a note on the admin screens; nothing is sent.",
        needs: "Dual control enforced by the platform's services against distinct principals, and the identity-anchored acceptance on the real wallet proof flow.",
      },
      {
        shown: "Being added to NDI's public list of trusted organisations",
        reality:
          "\"Publishing your listing\" is a pause, then a state change in your browser. Nothing is written to any registry, and nobody else can see the list.",
        needs: "The Trust Registry write — retried, with NDI alerted after 72 hours if it keeps failing — and the public lookup.",
      },
      {
        shown: "A public identity set up in a moment",
        reality: "A random string shaped like a did:ethr identifier. No key is made and nothing is anchored.",
        needs: "DID creation on the national network, held in NDI's hosted keys.",
      },
      {
        shown: "Requests refused for asking outside what was approved",
        reality: "Fixture counts on the status page, shown only from the state switcher. Nothing is checked at the point of asking.",
        needs: "Scope checks at the capability gate, and the refusal log behind the count.",
      },
    ],
  },
  {
    area: "Designating an authority",
    icon: "shieldCheck",
    rows: [
      {
        shown: "Which authority confirms which kind of business",
        reality:
          "Designations and adoptions in your browser decide which types can be verified. The Corporate Regulatory Authority's is seeded as done; nothing reads a register or a schema.",
        needs: "The designation register and the adoption records in the Entity-Wallet Service, read by FLOW-ORG-01 P3 on every verification.",
      },
      {
        shown: "Activation checks — issuing identity, set-up, entitlements",
        reality:
          "Read from fields on the organisation in the demo data. \"Grant them\" flips a list in your browser; no marketplace is asked. The owner's grant to NDI's service account, and the account accepting it, are fields on the designation — no invitation is sent and no membership row is written.",
        needs: "Reads of org_agents, the ledger namespace and the marketplace entitlements; the owner's VERIFIER invitation to the service principal (POST /orgs/:orgId/invitations) and the principal accepting it in its own session.",
      },
      {
        shown: "NDI's service account in the members list, removed and turned back on",
        reality:
          "A row drawn from the designation, not a member record. Removing it — from Members, the console or Stop something — flips the same field and marks the authorisation rows in your browser withdrawn; turning it back on writes new ones.",
        needs: "The membership in user_org_roles, removable by the organisation's owner, and the authorisation records moving with it (EW-FLOW5-SD §4.4).",
      },
      {
        shown: "\"Change it to another did:ethr\" on the authority console",
        reality:
          "A prototype control. Nothing in the prototype changes an organisation's primary DID, so this stands in for a member doing it; the designation is compared with the DID recorded at activation and suspended.",
        needs: "E10 detection on next use, against publishingDid (FLOW-ORG-02 AC-08a), and telling both parties.",
      },
      {
        shown: "Days left, lapses and reminders on designations",
        reality:
          "Worked out from dates when a page loads. A proposal past 30 days lapses then; \"reminder sent\" means 10 working days have passed — nobody is emailed.",
        needs: "Scheduled lapses (E6, E13) and reminders to administrators.",
      },
      {
        shown: "Adopting what people will be asked, and stopping it",
        reality:
          "Version numbers and states in your browser. No schema is published, no proof request is stored, and stopping something changes only which types the demo treats as connected.",
        needs: "Write-once schema publication, the versioned proof request and authorisation written in one transaction, and the service account's permission enforced at the agent.",
      },
      {
        shown: "\"NDI revises the draft\" after an objection",
        reality:
          "A prototype control. Every open objection holds adoption of what it covers until NDI revises the draft or the officer withdraws it; nothing on NDI's side drafts anything, so this button stands in for NDI sending a new draft — without the item the objection named, if it named one.",
        needs: "NDI's side of the objection: being told, revising the draft, and the objection record keeping how it closed (FLOW-ORG-03 A5).",
      },
      {
        shown: "The second approver is always a named administrator",
        reality:
          "UX-EW-02 lets the root account approve a designation; FLOW-ONB-02 v0.6 is later and says the root account approves nothing. The prototype follows the later document.",
        needs: "The two documents agreeing.",
      },
    ],
  },
  {
    area: "Receiving a credential",
    icon: "credentials",
    rows: [
      {
        shown: "Pelden shares its registration with the tax office, and the office checks it",
        reality:
          "A timer moves the request from sending to waiting. No proof is requested or presented, no signature is checked, and the office's \"Verified\" panel reads Pelden's registration straight from the demo data.",
        needs: "The organisation's agent presenting the whole credential to the issuer's proof request, verified at the issuer before the request reaches anyone (FLOW-CRD-01 steps 4–8).",
      },
      {
        shown: "The tax office issues, and Pelden accepts",
        reality:
          "Issuing writes an offer into your browser; accepting copies it into Pelden's held credentials. Nothing is signed, nothing is stored in a wallet, and the 30-day offer window is a date nothing enforces except the accept button.",
        needs: "A credential offer over DIDComm to the organisation's agent, stored on acceptance, with the issuer's standing checked against NDI's list at that moment.",
      },
      {
        shown: "\"Ask, and have it ask for a bank account too\"",
        reality:
          "A prototype control on the ask screen. No issuer system exists to ask for more; the button writes the wider ask into the request before anything is shared, so the consent screen can be shown.",
        needs: "The issuer's proof request, compared with what the business agreed to before anything more is shared.",
      },
      {
        shown: "\"Take it off the list\" and \"Make the list unreachable\"",
        reality:
          "Prototype controls on the review screen. Nothing checks NDI's list when Accept is pressed; these mark what the next check would find, so the delisted and can't-check messages can be shown.",
        needs: "C2 run again against the Trust Registry at the moment of accepting (FLOW-CRD-01 E19, FLOW-CRD-02 E9).",
      },
      {
        shown: "Offers sent without a request, and one replacing a credential already held",
        reality:
          "Seeded rows in your browser. No issuer sends anything; superseding is a field the demo store sets on the older credential when the newer one is accepted.",
        needs: "The organisation's agent receiving the offer, checks C1–C5 before it reaches the inbox, and the held-credential index with supersededBy (EW-FLOW6-SD §4.5).",
      },
      {
        shown: "The tax office's system answers a request by itself",
        reality:
          "A timer in your browser. A few seconds after a request for the bonded-warehouse authorisation reaches the office, the demo writes the answer a system would send — the example values from the offering — recorded against the first client you created, and adds credential-request.received and credential-request.issued to the delivery log. No URL is called, no register is looked up and nothing is signed. \"Have it refer the next request\", \"Have it not pick up the next request\" and \"Have your system answer it now\" are prototype controls standing in for the system referring a request with a note, a webhook nobody answers, and the system and an officer answering at once, where the first answer wins. Whether the Department of Revenue & Customs answers this way at all is still open with GovTech (REQ-EW-01 item 23), so the taxpayer number stays with the officers' queue and the prototype shows the path without deciding it.",
        needs: "The request service's outbox and signed delivery, the issuer request API with client credentials (offer, decline, refer), compare-and-set on the answer, and the one-hour check that puts a request nobody picked up in the queue (FLOW-CRD-03 steps 5–7, E6, E10, A2; EW-FLOW6-IIG).",
      },
      {
        shown: "Integration settings — webhook, secret, clients, delivery log",
        reality:
          "Fields in your browser. No URL is called, no secret exists behind the mask, and the test event and its latency are made up on the spot.",
        needs: "Signed webhook delivery from an outbox with retries, client credentials for the issuer's system, and the fallback to the officers' queue.",
      },
      {
        shown: "Creating a new offering",
        reality:
          "Not built. Existing offerings can be paused, retired or given a new version; a new one needs a prerequisite chooser limited to the office's approval to verify, which the prototype doesn't model.",
        needs: "SCR-CRD-07's composer, reading the issuer's verifier scope.",
      },
    ],
  },
  {
    area: "Presenting a credential",
    icon: "send",
    rows: [
      {
        shown: "Bank of Bhutan's website, its application number and its return page",
        reality:
          "A dashed stand-in at /simulated/bank, drawn to the verifier integration guide's §5. Pressing its button creates a session in your browser; its return page reads the session back from the demo store and shows what the fetched status means. No bank system exists, and nothing leaves the browser.",
        needs: "A first bank's eKYB journey changed to start a session, redirect, park a pending application and fetch the result from its back end (EW-FLOW7-SD §13 item 4).",
      },
      {
        shown: "Signing in with Bhutan NDI when the link opens",
        reality:
          "The dashed step signs in as whoever the demo is driven as. The 15- and 30-minute windows are real timestamps in your browser; nothing about the session survives on a server.",
        needs: "Studio keeping the session reference through the existing Bhutan NDI sign-in, and the presentation-session routes (§7.1).",
      },
      {
        shown: "The proof request arriving, the checks, and the share being sent",
        reality:
          "No invitation is received, no DIDComm request arrives and nothing is presented or signed. V1/V2 read whether the organisation has the verifier capability; V7 reads the held credentials. The bank's verified result is the demo's own data.",
        needs: "Organisation-level presentation in the agent (shared with Flow 6), the holder-side request record and checks V1–V7, and the issuer check in verification (D5).",
      },
      {
        shown: "Requests arriving with nobody at a website, a refused sender, and NDI's list being unreachable",
        reality: "Dashed buttons on Sharing that add requests to the demo store, and one that makes NDI's list answer.",
        needs: "A verifier sending a proof request on an existing connection, the connection counterparty record (§6), and Trust Registry re-checks with back-off.",
      },
      {
        shown: "A bank cancelling a request",
        reality: "A dashed button that marks the request cancelled and removes any approval waiting on it.",
        needs: "The verifier's DELETE on its session, or a problem report on the exchange.",
      },
      {
        shown: "Who is told — a request waiting, one left undecided, passed on, approvers asked, a share approved or not, the representative told of a share, a request open again",
        reality:
          "The wording is UX-EW-04 §3.5's notification table, word for word, and each is written to the organisation's activity feed, saying who it goes to. Nothing is emailed. Ten minutes passing with a website request undecided is a dashed button on Sharing; keeping it for later sends the same notice at once. An approver's note is never in the notice, only in the wallet.",
        needs: "In-app and email delivery, with the link opening the right screen after sign-in.",
      },
      {
        shown: "A request held while NDI's list is checked",
        reality:
          "A dashed sign-in on the wallet's page, and a dashed button on Sharing, stand in for NDI's list being out of reach. As UX-EW-04 v0.3 says, a request held this way from a website is listed on Waiting as \"Checking <organisation> — you can't answer this yet\", with no Answer; one that arrived on a connection isn't listed at all until it passes. Nobody is told until it does.",
        needs: "Trust Registry re-checks with back-off, and the RECEIVED state on the holder-side request record.",
      },
      {
        shown: "Where NDI sends people back to",
        reality:
          "Return addresses are kept in your browser; the fresh Bhutan NDI sign-in for each change is a dashed step, and \"sent to every owner and to NDI\" is a line in the activity feed.",
        needs: "SCR-PRS-06's registration with exact matching, step-up sign-in, audit and notification.",
      },
      {
        shown: "Refused shares and approvals on the record",
        reality:
          "A share refused for want of Share or outside its reach, an approval of one's own share, and a sharer whose standing lapsed before approval each add a row to the audit trail in your browser, with the relation, the request and the reason (FLOW-PRS-01/02 §10). The screens never offer the first two, so they are reached only by calling the store.",
        needs: "The same rows written by the presentation-request routes when they refuse, in the append-only store.",
      },
      {
        shown: "A sharer whose appointment ends while their share waits for approval",
        reality:
          "The store checks for it when the share is approved (FLOW-PRS-02 E11), but nothing in the prototype ends an appointment, so it is shown through the state switcher on the approval screen.",
        needs: "Ending or suspending an appointment (catalogue flow 11).",
      },
    ],
  },
  {
    area: "The record",
    icon: "fileText",
    rows: [
      {
        shown: "An append-only, hash-chained audit trail",
        reality:
          "An array in your browser's local storage. The fingerprints are random, the chain is not verified, and clearing site data erases the lot.",
        needs:
          "A dedicated append-only store, append-only at database-privilege level, with a per-organisation hash chain and externally anchored checkpoints.",
      },
      {
        shown: "An evidence bundle export",
        reality: "A confirmation message. No file is produced.",
        needs: "Export, and a format a third party can check without access to this console.",
      },
    ],
  },
];

const REAL = [
  "The authority model — controllership, scope, approval policy, authority given to a person in their own wallet, and how they relate.",
  "The plain-language scope grammar, and the claim that a person can read an authority in five seconds.",
  "Every screen, state and refusal, including the ones nobody clicks their way to.",
  "The order of the flows, and which surface each step belongs to.",
  "The rule that the console renders decisions rather than making them — the demo is built that way so the real thing can be too.",
];

export function WhatsRealView() {
  return (
    <div className="min-h-dvh" style={{ background: "var(--surface-sunken)" }}>
      <main className="mx-auto flex w-full max-w-[900px] flex-col gap-6 px-4 py-8 min-[641px]:px-6 min-[901px]:py-12">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusPill status="pending" label="Prototype" />
            <span className="text-[12.5px] text-faint">Nothing below the interface is built</span>
          </div>
          <h1 className="font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.025em] text-strong">
            What&rsquo;s real, and what is simulated
          </h1>
          <p className="max-w-[64ch] text-[14px] leading-[1.7] text-muted">
            This is a front-end prototype of the Entity Wallet. Its job is to
            make us agree on what the product should be before anyone builds
            it. The screens and the model behind them are real work; everything
            underneath them is a fixture in your browser. This page says which
            is which, so nobody has to guess.
          </p>
        </div>

        {/* ---- What is real ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Icon name="check" size={17} strokeWidth={2.3} className="flex-none text-accent" />
              <h2 className="font-display text-[16px] font-semibold text-strong">
                Real, and decided
              </h2>
            </div>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              These are conclusions, not placeholders. Changing them is a design
              decision rather than an implementation detail.
            </p>
            <ul className="mt-1 flex flex-col gap-2">
              {REAL.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={13}
                    strokeWidth={2.6}
                    className="mt-[5px] flex-none text-accent"
                  />
                  <span className="max-w-[64ch] text-[13.5px] leading-[1.6] text-body">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* ---- What is not ---- */}
        {SIMULATED.map((group) => (
          <Panel key={group.area}>
            <div className="relative z-[4] flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] border border-grid"
                  style={{ background: "rgb(var(--tint) / 0.04)" }}
                >
                  <Icon name={group.icon} size={15} strokeWidth={1.9} />
                </span>
                <h2 className="font-display text-[16px] font-semibold text-strong">
                  {group.area}
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {group.rows.map((row, i) => (
                  <div
                    key={row.shown}
                    className={`flex flex-col gap-2 ${i > 0 ? "border-t border-subtle pt-4" : ""}`}
                  >
                    <p className="font-display text-[13.5px] font-medium leading-[1.4] text-body">
                      {row.shown}
                    </p>
                    <p className="max-w-[64ch] text-[13px] leading-[1.6] text-muted">
                      {row.reality}
                    </p>
                    <p className="max-w-[64ch] text-[12.5px] leading-[1.55] text-faint">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
                        Would need
                      </span>{" "}
                      · {row.needs}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        ))}

        {/* ---- The blunt version ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <h2 className="font-display text-[16px] font-semibold text-strong">
              The short answer
            </h2>
            <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-body">
              There is no server, no database, no register integration, no
              Authority Verification API and no wallet. There is no network layer at
              all — the application makes no requests. Every organisation,
              person, credential, approval and decision you see lives in your
              browser&rsquo;s local storage and can be wiped with one button.
            </p>
            <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
              What it is good for: agreeing the model, testing whether people
              can read an authority, and finding out which screens are wrong
              while they are still cheap to change.
            </p>
            <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
              What it is not evidence of: that any of it works, or how long the
              real thing takes to build.
            </p>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center gap-4 pb-2">
          <Link
            href="/dashboard"
            className="ndi-hairline-btn inline-flex h-11 items-center gap-2 rounded-[10px] border border-grid px-4 font-display text-[13.5px] font-medium"
          >
            <Icon name="arrowLeft" size={14} strokeWidth={2} />
            Back to the demo
          </Link>
          <span className="text-[12.5px] text-faint">
            This page is linked from the prototype marker on every screen.
          </span>
        </div>
      </main>
    </div>
  );
}
