import type { PersonaId } from "./demoData";

/**
 * The guided demo: the whole story as a script the screen reads out to
 * whoever is driving.
 *
 * WHY THIS EXISTS
 *
 * The demo grew a story runner, flow jumps, a persona switcher, a state
 * switcher and a deployment switch, all in one panel — a toolbox for someone
 * who already knows the story, and a maze for anyone who doesn't. The written
 * guide didn't close the gap: it lives in another window, and reading it
 * while clicking is exactly what a presenter can't do. So the script moved
 * onto the screen. Each step says where you are, what is going on, what to
 * press, and — when it matters — a line worth saying out loud.
 *
 * HOW A STEP FOLLOWS YOU
 *
 * `match` is the screen a step happens on. Pressing Next takes you to the
 * next step's screen, as the right person. Doing the step yourself also
 * works: when a click in the product lands on the *next* step's screen, the
 * guide moves on by itself. Only the next step is watched, so wandering off to
 * another page never skips the guide ahead.
 *
 * Button names in `doThis` are bolded with **…** and must match the product
 * exactly — the guide is only as good as its agreement with the screen.
 */
export interface GuideChapter {
  title: string;
  /** One line: what this part of the story shows. */
  shows: string;
}

export interface GuideStep {
  chapter: number;
  title: string;
  /** What is going on, for someone seeing it for the first time. */
  happening: string;
  /** Exactly what to press. **Bold** for on-screen names. */
  doThis: string;
  /** Optional line to say to the room. */
  say?: string;
  /** The screen this step is on — Next navigates here. */
  route?: string;
  /** Pattern for recognising that screen, when `route` alone is not enough. */
  match?: string;
  /** Who to drive as when the guide brings you to this step. */
  persona?: PersonaId;
}

/**
 * WHY THE GUIDE STOPS WHEN PELDEN'S FIRST COLLEAGUE JOINS
 *
 * The prototype is scoped to onboarding: NDI's root administrator, the
 * platform admins root invites, a new company getting an Entity Wallet, and
 * the people that company brings on. The guide used to run on for six more
 * chapters — Bank of Bhutan's wallet, appointing a controller, presenting,
 * authority in a phone, revocation, appeals — which walk flows the catalogue
 * has not designed yet, and made a forty-step demo of an onboarding review.
 * Those screens still exist; the guide no longer walks them.
 *
 * Appointing a controller follows it, because being invited is only half of
 * getting ready: a member can see the organisation, and somebody still has
 * to be able to act for it. The member is invited first and appointed
 * second, never the other way round, and proves who they are at the
 * appointment rather than at the invitation (FLOW-ONB-02 §7.3). It follows
 * FLOW-DEL-01 and SCR-DEL-02 to 05.
 *
 * Approval to verify or issue (Flow 4) comes after, through both of its
 * doors: NDI recognising an organisation that was already verifying before
 * approvals were required, and a verified business asking. They close the
 * story because they are what the onboarding was for — an organisation that
 * holds its registration and has people who can act for it is the one that
 * can be trusted with more.
 *
 * Receiving a credential (Flow 6) is the last chapter because it's what all
 * of it was for: a verified business, with someone who can act for it,
 * using its registration to get the next credential — its taxpayer number —
 * from an office that decides on what was proved, not on what NDI says.
 *
 * Sharing with the bank (Flow 7) follows it: what the organisation holds is
 * worth something only when someone else can check it. Pelden opens an
 * account from Bank of Bhutan's website and is taken back there; then the
 * bank asks again with nobody at a website, Ugyen — who can see but not
 * share — passes it to Dorji, and Dorji shares. The approval path, where a
 * Controller shares and the Root approves, needs a Controller appointed
 * with *Share*, which the onboarding story never makes; it is a Walk a flow
 * entry from the story three months on, and the chapter's last step says so.
 *
 * Giving a clearing agent authority to act (Flow 8) comes after sharing
 * with the bank, because it needs what the chapters before it produce: a
 * verified business, a representative, and — from a dashed step, since the
 * ministry doesn't offer one on request in the prototype — a business
 * licence for the agent to act under. The agent is never invited: she needs
 * no account and isn't a member (EW-FLOW8-SD D10). She collects her
 * authority from a link, proving who she is with Bhutan NDI. The approval
 * path, where a *Give authority to act* Controller gives it and the Root
 * approves, starts three months on, from Walk a flow, as Flow 7's does.
 *
 * Pema then uses that authority at the Single Window (Flow 9), because
 * authority nobody can use proves nothing. It follows Journey W first:
 * Pelden has never registered with BNSW in this story, so her first try is
 * refused (E8) and Dorji registers Pelden from BNSW's site — the same
 * share-from-a-website flow as the bank's. Then she acts for Pelden, one
 * declaration goes through, one is above her limit, the tax office revokes
 * Pelden's TPN — which BNSW looks up at the start of a session and at every
 * declaration — and Pelden withdraws the authority before the next.
 *
 * Member onboarding is here because the first day is now genuinely empty.
 * When it still listed the seed's colleagues, the room's first question on
 * seeing them was "how did these people get here?" — and the answer, an
 * invitation Dorji sends and they accept, is an onboarding in its own right.
 */
export const GUIDE_CHAPTERS: GuideChapter[] = [
  { title: "Before you start", shows: "What the demo is, and how to drive it" },
  { title: "Root admin onboarding", shows: "NDI's root administrator signs in to a ready organisation" },
  { title: "Platform admin onboarding", shows: "Root invites an admin by email; they set up from the link" },
  { title: "A new company signs up", shows: "A person signs up — nothing about any company yet" },
  { title: "Verify the organisation", shows: "The authority that registered it, not NDI, confirms the company" },
  { title: "Pelden brings on its people", shows: "The owner invites a colleague; they join from the link" },
  { title: "Appoint someone", shows: "Dorji chooses what Ugyen can do; Ugyen accepts with one wallet approval" },
  { title: "Recognise Bank of Bhutan", shows: "NDI approves a bank already verifying — asking for less — and the bank accepts by name" },
  { title: "Pelden asks to verify customers", shows: "A verified business asks; one administrator reviews, a second decides" },
  { title: "Designate the ministry", shows: "A ministry becomes the authority for sole proprietorships, and agrees what people are asked" },
  { title: "Pelden gets its TPN", shows: "Pelden asks the tax office, shares its registration, and accepts what comes back" },
  { title: "The tax office's system answers", shows: "Deki connects the office's system, and Pelden's next request is answered without an officer" },
  { title: "Pelden shares with its bank", shows: "From the bank's website and back, then a request in the wallet — the whole credential, said so" },
  { title: "Authority for the clearing agent", shows: "Dorji gives Pema authority to declare at the Single Window; she collects it with Bhutan NDI" },
  { title: "Pema declares for Pelden", shows: "At the Single Window: one share from her app, then declarations checked each time — authority, TPN, licence, limit — and refused, with why" },
  { title: "Where to go next", shows: "The other routes, and what's simulated" },
];

export const GUIDE_STEPS: GuideStep[] = [
  /* ---- 0 · Before you start ---- */
  {
    chapter: 0,
    title: "Onboarding onto the Entity Wallet",
    happening:
      "Everything it takes to get onto the Entity Wallet and ready to use it, in the order it has to happen: NDI's root account signs in, root brings on the platform's two administrators, who each set up their own account, a new company — Pelden Trading — signs up and is verified by the authority that registered it, and Pelden's owner invites a colleague and appoints them to act for it. Then NDI approves Bank of Bhutan and Pelden to verify customers, designates the ministry that confirms sole proprietorships, Pelden gets its taxpayer number, shares its registration with its bank, and gives its clearing agent authority to act for it from her own Bhutan NDI app. Nothing is real: the dashed \"Prototype\" panels stand in for a phone, an inbox or a government register.",
    doThis:
      "Press **Next**. The guide takes you to each screen and tells you what to press; you do the clicking. **Minimise** tucks this card away when it's in the way.",
  },

  /* ---- 1 · Root admin onboarding ---- */
  {
    chapter: 1,
    title: "The root administrator signs in",
    happening:
      "Before any business, NDI's root administrator signs in. The account was made when the platform was deployed, so there is no sign-up and nothing to onboard.",
    doThis:
      "Press **Root** in the dashed panel (it fills in the address), type any password, then press **Sign in**.",
    route: "/sign-in",
    match: "^/sign-in$",
  },
  {
    chapter: 1,
    title: "NDI's own organisation",
    happening:
      "Root lands in Bhutan NDI's organisation, which is ready from the start: the whole Studio and NDI administration. Root is NDI's own account, held by two custodians together — not a person's — and its one job now is bringing on the first two administrators.",
    doThis: "Press **Invite a platform admin**.",
    route: "/dashboard",
    persona: "root",
  },
  /* ---- 2 · Platform admin onboarding ----
     Two administrators, because the root account approves nothing
     (FLOW-ONB-02 v0.6, S2): every second approval is a second named admin.
     Root brings both on at bootstrap, each with a reason and the custodians
     present (S9), and can add no more once two are active. */
  {
    chapter: 2,
    title: "Invite the first platform admin",
    happening:
      "Root types the address the invitation goes to — nobody is an admin until NDI decides to trust them. Using the root account is logged with the custodians present, and every administrator is told.",
    doThis:
      "Type **kinzang.dorji@bhutanndi.bt**, the custodians present such as **Karma and Sonam**, and optionally a reason such as **Bringing on the first administrators**, then press **Send invitation**, then **Open the invitation as kinzang.dorji@bhutanndi.bt** (dashed — it stands in for the invitee's inbox).",
    route: "/admin/team",
    persona: "root",
  },
  {
    chapter: 2,
    title: "Kinzang sets up the account",
    happening:
      "The invitation is the onboarding. It's from the Bhutan NDI root administrator — the account, not a person — and says what it gives and what it doesn't: Kinzang can't approve anything Kinzang proposes. The account is set up right here; the link already proves the address.",
    doThis:
      "Enter **Kinzang Dorji**, a password such as **Thimphu-Chorten-2026**, the same password again to confirm, then press **Set up account and accept**. Then press **Next**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 2,
    title: "Invite the second platform admin",
    happening:
      "One administrator isn't enough: anything that needs approving needs a second named one, and the root account won't be it. So root invites one more — and after that, root's form is gone.",
    doThis:
      "Type **tshendu@bhutanndi.bt** and the same custodians, press **Send invitation**, then **Open the invitation as tshendu@bhutanndi.bt**.",
    say: "The root account is break-glass. Once two people run the platform, it can't add anyone else.",
    route: "/admin/team",
    persona: "root",
  },
  {
    chapter: 2,
    title: "Tshendu sets up the account",
    happening: "The same invitation Kinzang had, from the same root account.",
    doThis:
      "Enter **Tshendu**, a password such as **Thimphu-Chorten-2026**, the same password again, then press **Set up account and accept**. On the confirmation, press **Go to the admin console**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 2,
    title: "Two platform admins",
    happening:
      "Kinzang and Tshendu run the platform now and approve what each other propose. From here, a new administrator is invited by one of them and approved by the other — the root account is for emergencies only.",
    doThis: "Press **Next** — with administrators in place, a company can now come onto the platform.",
    route: "/dashboard",
    /* No persona: setting up the account already drives the console as
       whoever accepted. */
  },
  /* ---- 3 · A new company signs up ---- */
  {
    chapter: 3,
    title: "A new company: Dorji signs up",
    happening:
      "Pelden Trading has never been on NDI. Its director, Dorji Wangchuk, creates a personal account first — just the person; the company comes later.",
    doThis: "Type an email such as **dorji.w@peldentrading.bt** and press **Continue**.",
    say: "The account has to belong to the person who'll prove who they are later. That's checked in the next chapter, not here.",
    route: "/sign-up",
    match: "^/sign-up$",
  },
  {
    chapter: 3,
    title: "Check your email",
    happening: "In the product an email arrives with a link. No email is sent in this demo.",
    doThis: "Press **Open the link from the email** in the dashed prototype panel.",
    route: "/sign-up/check-email",
  },
  {
    chapter: 3,
    title: "Email confirmed",
    happening: "The link proves Dorji controls that address.",
    doThis: "Press **Continue**.",
    route: "/sign-up/verify",
  },
  {
    chapter: 3,
    title: "Name and password",
    happening: "The password rules are shown before anyone types, not after a failure.",
    doThis:
      "Enter **Dorji Wangchuk** as the name, a password such as **Thimphu-Chorten-2026**, the same password again to confirm, then press **Create account**.",
    route: "/sign-up/password",
  },
  {
    chapter: 3,
    title: "An account with no organisation",
    happening: "Dorji has an account, but it belongs to no organisation yet.",
    doThis: "Press **Add your organisation**.",
    route: "/welcome",
  },

  /* ---- 4 · Verify the organisation ---- */
  {
    chapter: 4,
    title: "What kind of organisation",
    happening:
      "Each type names the authority that registered it, which is who checks it: a registered company, a sole proprietorship or a partnership.",
    doThis: "Leave **Registered company** selected and press **Continue**.",
    route: "/onboarding",
    match: "^/onboarding$",
  },
  {
    chapter: 4,
    title: "Its registration number",
    happening:
      "The one thing Dorji types. The format is shown before the field, and the button names the authority that will be asked — the same name Dorji's wallet will show.",
    doThis:
      "Type **CRA-2019-04477** (or press it in the dashed prototype panel), then press **Verify with Corporate Regulatory Authority**.",
    route: "/onboarding/details",
  },
  {
    chapter: 4,
    title: "The authority asks who Dorji is",
    happening:
      "The request comes from the Corporate Regulatory Authority, not from NDI. Only Dorji's identity is shared — nothing about the company, and NDI keeps nothing from it.",
    doThis: "Press **Simulate the scan** (the code doesn't really scan). Once it's answered, the next step opens by itself.",
    route: "/onboarding/prove",
  },
  {
    chapter: 4,
    title: "The authority decides",
    happening:
      "The CRA checks its own records — NDI never sees them — and decides. Then Pelden's wallet is set up and its registration added. The page could be closed: Dorji's account would show where it's up to.",
    doThis: "Wait — the next screen opens by itself when it's done.",
    say: "This is the moment the platform admits it can't decide who a company is. The authority does.",
    route: "/onboarding/verifying",
  },
  {
    chapter: 4,
    title: "Dorji accepts responsibility",
    happening:
      "Verified isn't usable yet. The screen says what acting for Pelden means — what Dorji can and can't do, and Dorji's responsibilities — and nothing on Pelden works until Dorji accepts. No scan: Dorji proved who they are to the CRA a minute ago.",
    doThis: "Press **Accept responsibility**.",
    route: "/onboarding/responsibility",
  },
  {
    chapter: 4,
    title: "Pelden is verified",
    happening:
      "Pelden holds its registration — added automatically, nobody accepted anything. The next step offered is its tax identity, and the screen says plainly what Pelden can't do: issue credentials or verify anyone.",
    doThis: "Press **Go to Pelden Trading**.",
    route: "/onboarding/foundational",
  },
  {
    chapter: 4,
    title: "Pelden's first day",
    happening:
      "A brand-new organisation: it holds its registration and Dorji's authority to act for it, and nothing else. No tasks, no history — so what it suggests first is its tax identity. Inviting colleagues is there too, further down.",
    doThis: "Have a look around, then press **Next**.",
    say: "Nothing has happened here yet, and the console doesn't pretend otherwise.",
    route: "/dashboard",
    persona: "dorji",
  },

  /* ---- 5 · Pelden brings on its people ---- */
  {
    chapter: 5,
    title: "Only Dorji, so far",
    happening:
      "Pelden's members: Dorji alone. Everyone else joins the way a colleague joins any organisation here — Dorji invites them by email, and they accept. Being a member lets someone see the organisation; acting for it is a separate grant.",
    doThis: "Press **Invite someone**.",
    route: "/members",
    persona: "dorji",
  },
  {
    chapter: 5,
    title: "Invite a colleague",
    happening:
      "The invitation names an address and a role, and says before it's sent what it gives and what it doesn't: they'll see Pelden, but can't act for it.",
    doThis:
      "Type **ugyen.phuntsho@peldentrading.bt**, leave **Member** selected and press **Send invitation**. Then press **Open the invitation as ugyen.phuntsho@peldentrading.bt** (dashed — it stands in for Ugyen's inbox).",
    say: "Letting someone in and letting them act for the company are two different things, and the screen says so before anything is sent.",
    route: "/members/invite",
  },
  {
    chapter: 5,
    title: "Ugyen sets up an account",
    happening:
      "The invitation names who sent it, to what, and what it doesn't include. Ugyen has no account yet, so it's set up right here: the link already proves the address, so there's no separate sign-up.",
    doThis:
      "Enter **Ugyen Phuntsho**, a password such as **Thimphu-Chorten-2026**, the same password again, then press **Set up account and accept**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 5,
    title: "Ugyen has joined",
    happening:
      "The confirmation names the organisation joined — a person can belong to several — and repeats that membership isn't authority.",
    doThis: "Press **Go to Pelden Trading Pvt. Ltd.**",
    match: "^/invitation/[^/]+/accepted$",
  },
  {
    chapter: 5,
    title: "Pelden, as a member sees it",
    happening:
      "Ugyen can see Pelden but holds no authority for it, and the console says so in the same words the invitation used. No members page, and no appointing anyone: those are the owner's.",
    doThis: "Press **Next** to go back to Dorji.",
    route: "/dashboard",
    /* No persona: accepting already drives the console as whoever joined. */
  },
  {
    chapter: 5,
    title: "Dorji sees who joined",
    happening:
      "Ugyen is a member now: identity not yet confirmed — joining never asks anyone — and no authority to act. That comes next: Dorji appoints Ugyen to act for Pelden, and Ugyen accepts with one approval in their own NDI wallet.",
    doThis: "Press **Next**.",
    route: "/members",
    persona: "dorji",
  },

  /* ---- 6 · Appoint someone (FLOW-DEL-01) ----
     Renamed from "Give someone authority to act" with UX-EW-01 v0.23, so
     the chapter isn't confused with the Give authority to act box. */
  {
    chapter: 6,
    title: "Choose what Ugyen can do",
    happening:
      "Four boxes, ticked in any combination, each saying what it allows — not a list of permissions. What Ugyen won't be able to do is worked out from the boxes left unticked, and the whole grant reads back as one sentence. Dorji confirms they're authorised to make the appointment; citing a document like a board resolution is optional and folded away.",
    doThis:
      "Choose **Ugyen Phuntsho**, leave just **Receive credentials** ticked, tick the statement that you're authorised, then press **Appoint**.",
    say: "Membership let Ugyen in. This is the separate thing that lets Ugyen act — and Dorji can say exactly what it covers.",
    route: "/people-who-can-act/appoint",
    persona: "dorji",
  },
  {
    chapter: 6,
    title: "Waiting for Ugyen",
    happening:
      "Dorji is listed first, as the representative. Ugyen's appointment waits for Ugyen, with the date it lapses if they don't accept. Nothing is in force yet, so Dorji could still withdraw it — say, after ticking the wrong box — and appoint Ugyen again straight away.",
    doThis: "Press **Open it as Ugyen Phuntsho** (dashed — it stands in for Ugyen's notification).",
    route: "/people-who-can-act",
  },
  {
    chapter: 6,
    title: "Ugyen reviews the appointment",
    happening:
      "Who is appointing them — Dorji, by name — that Dorji confirmed they may, what Ugyen will and won't be able to do, and Ugyen's responsibilities. It says up front that accepting needs Ugyen's NDI wallet.",
    doThis: "Press **Accept**.",
    match: "^/appointments/[^/]+$",
  },
  {
    chapter: 6,
    title: "One approval is the acceptance",
    happening:
      "The request comes from Bhutan NDI Verification, named as the wallet will show it. Approving it confirms it's Ugyen and records that Ugyen accepts — there's nothing else to press afterwards.",
    doThis: "Press **Simulate the scan**. When it's done, the next screen opens by itself.",
    say: "Dorji couldn't accept on Ugyen's behalf. An acceptance someone else makes isn't worth recording.",
    match: "^/appointments/[^/]+/confirm$",
  },
  {
    chapter: 6,
    title: "Ugyen can act for Pelden",
    happening:
      "Exactly what Dorji ticked — receive credentials — with what it doesn't cover, from the boxes Dorji left unticked, listed beside it. Ugyen can read it and can't change it.",
    doThis: "Press **Next**.",
    route: "/organisation",
  },

  /* ---- 7 · Recognise Bank of Bhutan (FLOW-ACC-01, recognition) ---- */
  {
    chapter: 7,
    title: "Seen operating without approval",
    happening:
      "Approval to verify or issue is about to be required. Until then, NDI only watches — and it has seen Bank of Bhutan asking customers for five things from their citizen credential to open an account. Every organisation on this list has until the date shown.",
    doThis: "Beside **Bank of Bhutan · Verifying**, press **Propose to verify**.",
    route: "/admin/accreditations",
    persona: "tshering",
  },
  {
    chapter: 7,
    title: "Ask for no more than the purpose needs",
    happening:
      "The proposal starts from what the bank was seen asking for, each item marked \"observed\". Opening an account needs the customer's name, ID number and photo — not their date of birth or home address. Anything not approved will be refused after the date.",
    doThis:
      "Under **Citizen ID**, untick **Date of birth** and **Permanent address**. Type **NDI/AGR/2024/003** as the agreement, press **Propose**, then **Go to pending list**.",
    say: "The bank has been asking for more than it needs. Recognition is where that gets narrower, before anything is refused.",
    match: "^/admin/accreditations/new$",
  },
  {
    chapter: 7,
    title: "Waiting for a second administrator",
    happening: "Kinzang proposed it, so it waits here for someone else. Nothing has changed for the bank yet.",
    doThis: "Press **Bank of Bhutan Ltd. · Verify**.",
    route: "/admin/accreditations",
  },
  {
    chapter: 7,
    title: "Kinzang can't approve it",
    happening:
      "Kinzang sees all of it — what the bank can ask for, the criteria, the public listing — but in place of Approve: \"You proposed this, so a different administrator has to approve it.\"",
    doThis: "Press **Next** — the guide switches to Tshendu.",
    match: "^/admin/accreditations/acc-[^/]+$",
  },
  {
    chapter: 7,
    title: "Tshendu approves",
    happening:
      "The consequence is stated at the decision: every citizen's NDI wallet will trust the bank for this. Approving still lists nothing — the bank's owner has to accept.",
    doThis: "Press **Approve**.",
    say: "Two named administrators — never the root account — and still nothing is live until the bank accepts by name.",
    match: "^/admin/accreditations/acc-[^/]+$",
    persona: "tshendu",
  },
  {
    chapter: 7,
    title: "The bank is told",
    happening:
      "Yeshey Choden is Bank of Bhutan's owner. Until Tshendu approved it the bank saw nothing — a proposal NDI hasn't approved, or has declined, never reaches it. Now the dashboard says NDI has proposed approving the bank to verify, when NDI approved it, and that without it what the bank already does stops on the date. Nothing counts down: if the bank never accepts, NDI is reminded and withdraws it, with a reason.",
    doThis: "Press **Review it**.",
    route: "/dashboard",
    persona: "yeshey",
  },
  {
    chapter: 7,
    title: "What the bank is being approved for",
    happening:
      "In plain words: what it can ask for, that anything else is refused before it reaches anyone, and that accepting puts the bank on NDI's public list of trusted organisations with Yeshey's name recorded. The bank keeps the public identity it has been verifying under.",
    doThis: "Press **Accept with your NDI wallet**, then **Simulate the scan**. When it's done, press **See approval status**.",
    say: "This is consent by a named person, not a checkbox. One wallet approval confirms it's Yeshey and records that the bank accepts.",
    match: "^/verify-or-issue/acc-[^/]+$",
  },
  {
    chapter: 7,
    title: "Approved, and listed",
    happening:
      "The listing publishes, then the bank is approved to verify, listed since today, under its public identity — and can ask for three things where it used to ask for five.",
    doThis: "Press **Next**.",
    route: "/verify-or-issue",
    persona: "yeshey",
  },

  /* ---- 8 · Pelden asks to verify customers (FLOW-ACC-02) ---- */
  {
    chapter: 8,
    title: "The way to ask",
    happening:
      "Pelden is verified, so its representative — and only its representative — is offered a way to ask NDI to verify customers or issue credentials.",
    doThis: "Press **Ask NDI**.",
    route: "/organisation",
    persona: "dorji",
  },
  {
    chapter: 8,
    title: "Ask for a check, not the value",
    happening:
      "Pelden sells tobacco and must check customers are over 18. A business can ask to verify, to issue, or both in one request; Pelden only needs to verify. Within each credential the yes-or-no checks come first: Pelden can learn that a customer is over 18 without ever seeing their date of birth.",
    doThis:
      "Press **Verify customers**. Open **Citizen ID** and tick **Is over 18**. For what it's for, type **Checking customers are over 18 before selling tobacco**. Press **Send to NDI**, then **Go to status**.",
    say: "NDI will approve or decline this exactly as Pelden wrote it. It won't change it on Pelden's behalf.",
    route: "/verify-or-issue/ask",
  },
  {
    chapter: 8,
    title: "Waiting for NDI",
    happening:
      "The request waits, dated, and Dorji can withdraw it. It never expires: if NDI takes longer than 10 working days, NDI is reminded, and Pelden keeps its place.",
    doThis: "Press **Next** — the guide switches to Kinzang.",
    route: "/verify-or-issue",
  },
  {
    chapter: 8,
    title: "Kinzang reviews",
    happening: "Business requests come to a review queue first. One administrator recommends; a different one decides.",
    doThis: "Under **Requests to review**, press **Pelden Trading Pvt. Ltd. · Verify**.",
    route: "/admin/accreditations",
    persona: "tshering",
  },
  {
    chapter: 8,
    title: "Recommend, as submitted",
    happening:
      "The request as Pelden wrote it, who asked, when the authority verified Pelden, and NDI's criteria beside their evidence. Kinzang can't edit it — a decline would say what to change, and Pelden would read it word for word.",
    doThis: "Press **Recommend approval**, then **Back to accreditations**.",
    match: "^/admin/accreditations/acc-[^/]+/review$",
  },
  {
    chapter: 8,
    title: "A second administrator decides",
    happening:
      "Kinzang reviewed it, so it's Tshendu's to decide. Had Kinzang recommended declining, Tshendu could only confirm it — no approve, and no sending it back.",
    doThis: "Under **Waiting for approval**, press **Pelden Trading Pvt. Ltd. · Verify**.",
    route: "/admin/accreditations",
    persona: "tshendu",
  },
  {
    chapter: 8,
    title: "Tshendu approves it as asked",
    happening:
      "\"You can approve or decline this as the business asked for it. You can't change it.\" Kinzang's recommendation is shown. Approving publishes Pelden's listing — Pelden accepted by asking.",
    doThis: "Press **Approve**.",
    match: "^/admin/accreditations/acc-[^/]+$",
  },
  {
    chapter: 8,
    title: "Pelden can verify customers",
    happening:
      "Approved to verify, listed under Pelden's public identity, able to ask one thing: whether a customer is over 18. Anything else it asks for will be refused, and shown here when it is. To widen it, Dorji presses **Ask for more**: the request opens with today's scope filled in, and replaces this approval only once it is approved — this one keeps working until then.",
    doThis: "Press **Next**.",
    route: "/verify-or-issue",
    persona: "dorji",
  },

  /* ---- 9 · Designate the ministry (FLOW-ORG-02 Kind E, FLOW-ORG-03) ---- */
  {
    chapter: 9,
    title: "Nobody confirms sole proprietors yet",
    happening:
      "Companies are confirmed by the Corporate Regulatory Authority. Sole proprietorships and partnerships have nobody — which is why they can't be verified yet. The ministry that licenses them is already on the platform, so it can be designated where it is.",
    doThis: "Press **Propose a designation**.",
    route: "/admin/designations",
    persona: "tshering",
  },
  {
    chapter: 9,
    title: "Say what it will be able to do",
    happening:
      "The summary says, in outcome words, what the ministry will be able to do — and nothing else. Once switched on, the scope can't be edited.",
    doThis:
      "Leave **Ministry of Industry, Commerce & Employment** selected, tick **Sole proprietorships — Trade Licence** and **Partnerships — Trade Licence**, type a legal basis such as **The licensing of businesses under the Ministry's mandate**, press **Propose**, then **Go to pending list**.",
    match: "^/admin/designations/new$",
  },
  {
    chapter: 9,
    title: "Waiting for a second administrator",
    happening:
      "Kinzang proposed it, so it waits for someone else — with its days left: a proposal nobody approves lapses after 30 days. Nothing has been sent to the ministry.",
    doThis: "Press the ministry's row under **Waiting for approval**.",
    route: "/admin/designations",
  },
  {
    chapter: 9,
    title: "Kinzang can't approve it",
    happening:
      "In place of Approve: \"You proposed this designation, so a different administrator has to approve it.\" What Kinzang can still do is withdraw it — with a reason, kept on record.",
    doThis: "Press **Next** — the guide switches to Tshendu.",
    match: "^/admin/designations/dsg-[^/]+$",
  },
  {
    chapter: 9,
    title: "Tshendu approves",
    happening:
      "The consequence at the decision: the ministry will create the credential that makes these businesses real, and everyone on the platform will trust what it issues. Refusing needs a reason, which goes to Kinzang; asking for more information changes nothing.",
    doThis: "Press **Approve**, then **Approve** in the dialog.",
    say: "A root of trust takes two named people at NDI — and then the organisation's own consent.",
    match: "^/admin/designations/dsg-[^/]+$",
    persona: "tshendu",
  },
  {
    chapter: 9,
    title: "The ministry is asked",
    happening:
      "Kesang Wangmo is the ministry's director and its owner on the platform. The dashboard says what NDI has proposed and how long is left.",
    doThis: "Press **Review it**.",
    route: "/dashboard",
    persona: "kesang",
  },
  {
    chapter: 9,
    title: "What the ministry is taking on",
    happening:
      "The role in the ministry's own terms, and NDI's access stated plainly: accepting is Kesang adding NDI's service account to the ministry — NDI never adds itself — and she can remove it at any time. Including that NDI hosts its keys, so it's a permission the ministry controls, not a technical barrier. Accepting switches nothing on.",
    doThis: "Press **Accept**.",
    say: "This is the paragraph that mustn't be softened. A government body has to know what NDI can do before it agrees.",
    match: "^/designation/dsg-[^/]+$",
  },
  {
    chapter: 9,
    title: "Accepted — but not switched on",
    happening: "Before anything switches on, NDI checks the ministry can actually do this.",
    doThis: "Press **Next** — the guide switches to Kinzang.",
    match: "^/designation/dsg-[^/]+$",
  },
  {
    chapter: 9,
    title: "One check failed",
    happening:
      "The ministry has the issuing identity a foundational issuer needs, but not the entitlement to publish what its credential contains — it has never needed one. The check says that's NDI's to grant.",
    doThis: "Under **Accepted — checks not passing yet**, press the ministry's row.",
    route: "/admin/designations",
    persona: "tshering",
  },
  {
    chapter: 9,
    title: "NDI fixes its own part",
    happening:
      "Each check says passed or failed in words, what was observed, and who resolves it. This one is NDI's.",
    doThis: "Press **Grant them** — the checks run again. When it says the ministry is designated, press **Next**.",
    say: "The one screen where the mechanism is named — because somebody has to act on it.",
    match: "^/admin/designations/dsg-[^/]+/activation$",
  },
  {
    chapter: 9,
    title: "Designated, nothing live",
    happening:
      "The ministry's console: its designation, NDI's access with a way to remove it — the service account is in its members list too, removable there — and nothing live in its name. People can't verify with it until it agrees what they'll be asked.",
    doThis: "Beside **Sole proprietorships**, press **Review and adopt**.",
    route: "/authority",
    persona: "kesang",
  },
  {
    chapter: 9,
    title: "What people will be asked",
    happening:
      "Exactly what a person's wallet will show, item by item, with why each is needed. NDI's draft also asks for the date of birth — which the register doesn't need, and the screen says so on the item.",
    doThis: "Press **Raise an objection**, type **Our register doesn't need the date of birth**, then press **Send back to NDI**.",
    say: "NDI may draft it, but the ministry's name is on it — so the ministry can say no to part of it.",
    match: "^/authority/sole_proprietorship$",
  },
  {
    chapter: 9,
    title: "On hold until NDI revises it",
    happening:
      "Adopting sole proprietorships is now on hold. Only two things release it: NDI revising the draft, or Kesang withdrawing her objection. Neither side can close it alone — the ministry can't strike the item itself, and NDI can't overrule it.",
    doThis: "In the dashed panel, press **NDI revises the draft**. The new draft leaves out the date of birth — then press **Continue to adopt**.",
    match: "^/authority/sole_proprietorship$",
  },
  {
    chapter: 9,
    title: "Three things, adopted as one",
    happening:
      "The credential, what people are asked — NDI's revised draft — and NDI's permission to ask it, together, or not at all. Each can be stopped separately afterwards.",
    doThis: "Press **Adopt**, then **Adopt** in the dialog, then **Go to your authority console**.",
    match: "^/authority/sole_proprietorship/adopt$",
  },
  {
    chapter: 9,
    title: "Live in the ministry's name",
    happening:
      "Sole proprietorships are live — version 1, adopted by Kesang, today. From now a sole proprietor can verify their business with the ministry.",
    doThis: "Press **Stop something**.",
    route: "/authority",
  },
  {
    chapter: 9,
    title: "Three different stops",
    happening:
      "Nothing is selected. Pausing NDI's access, stopping an entity type and changing what people are asked are three different things, each saying what stops and what carries on — and none of them un-verifies a business.",
    doThis: "Read the three, then press **Cancel**.",
    say: "The wrong stop is the worst mistake an authority can make here, so the screen makes the difference the subject.",
    route: "/authority/stop",
  },

  /* ---- 10 · Pelden gets its TPN (FLOW-CRD-01, FLOW-CRD-03) ---- */
  {
    chapter: 10,
    title: "What Pelden can get next",
    happening:
      "Credentials offices on NDI issue to businesses like Pelden. Each says what the office needs to see first — the taxpayer number needs Pelden's registration, which it holds; the bonded-warehouse authorisation needs the taxpayer number, which it doesn't yet.",
    doThis: "On **Taxpayer Number (TPN)**, press **Ask for this**.",
    route: "/wallet/get",
    persona: "dorji",
  },
  {
    chapter: 10,
    title: "One consent, said in full",
    happening:
      "What Pelden shares and what it may receive, side by side. The tax office receives all of Pelden's registration — every item is listed, including the ones it doesn't use — because a credential like this can't be shared in part. And nothing is added until someone here accepts what comes back.",
    doThis: "Press **Ask the Department of Revenue & Customs**.",
    say: "The screen never claims only some of it is shared. That would read better, and it would be false.",
    match: "^/wallet/get/off-tpn$",
  },
  {
    chapter: 10,
    title: "Who has it now",
    happening:
      "Pelden's wallet shares the registration, the office checks it, and the request says who has it and when to expect an answer — not a status code.",
    doThis: "Wait until it says **Waiting for the Department of Revenue & Customs**, then press **Next** — the guide switches to Deki.",
    match: "^/wallet/requests/crq-[^/]+$",
  },
  {
    chapter: 10,
    title: "The tax office's queue",
    happening:
      "Deki Yangzom answers taxpayer registrations at the Department of Revenue & Customs. Least time left comes first, led by the registration number Pelden proved — what Deki will look up in the office's own register.",
    doThis: "Press **Open next**.",
    route: "/issuer/requests",
    persona: "deki",
  },
  {
    chapter: 10,
    title: "Decide on what was proved",
    happening:
      "Two panels: what Pelden proved, with the credential it came from, and — separately, below — the name and type NDI holds, which Deki hasn't verified. Deki enters the taxpayer number's details from the office's own register.",
    doThis:
      "Read the **Verified** panel. Fill in **Taxpayer number** (for example **TPN-114-8830**), **Tax office** and **Registered for** — each shows its format — then press **Issue**.",
    say: "The failure this screen is built against isn't a system error. It's an officer issuing on the strength of a name NDI showed them.",
    match: "^/issuer/requests/crq-[^/]+$",
  },
  {
    chapter: 10,
    title: "Sent",
    happening: "Issued, and on its way to Pelden. It isn't Pelden's yet — Pelden decides whether to accept it.",
    doThis: "Press **Next** — the guide switches to Dorji.",
    match: "^/issuer/requests/crq-[^/]+$",
  },
  {
    chapter: 10,
    title: "Waiting for Pelden",
    happening: "The office has replied. What needs someone at Pelden comes first, with the date the offer lapses.",
    doThis: "Under **Waiting for you**, press **Review**.",
    route: "/wallet/requests",
    persona: "dorji",
  },
  {
    chapter: 10,
    title: "Check it, then accept",
    happening:
      "Every detail as offered, from an office on NDI's list of trusted organisations, in answer to Dorji's request. If something were wrong, the screen says to decline and contact the office.",
    doThis: "Press **Accept**, then **Go to your credentials**.",
    match: "^/wallet/requests/crq-[^/]+$",
  },
  {
    chapter: 10,
    title: "Held, and on the record",
    happening:
      "The taxpayer number sits beside the registration it was asked for with, and View details lists what it carries — the number, the tax office, what Pelden is registered for — with who issued it and how long it's valid. The Activity tab keeps the request — and an offer the wallet refused on its own, from a sender not on NDI's list, which nobody was notified about.",
    doThis: "Press **View details** on the taxpayer number, then press **Activity**.",
    route: "/wallet/credentials",
  },

  /* ---- 11 · The tax office's system answers (FLOW-CRD-03 Kind A) ---- */
  {
    chapter: 11,
    title: "Connect the office's system",
    happening:
      "The bonded-warehouse authorisation is the one the tax office's own system answers — once the office has connected it. Until then those requests land on Deki's queue, like the taxpayer number's did. This is the one technical screen: the integration lead's, where webhook and secret are allowed words.",
    doThis:
      "Press **Set up**, type **https://drc.gov.bt/ndi/credential-requests** and press **Save**. Under **Answering clients** type **Taxpayer registration system** and press **Create a client**. Then press **Send a test event**.",
    say: "Whether the Department answers its requests this way at all is still open with GovTech. The prototype shows the path; it doesn't decide it.",
    route: "/issuer/integration",
    persona: "deki",
  },
  {
    chapter: 11,
    title: "Ask for the bonded-warehouse authorisation",
    happening:
      "Pelden holds its taxpayer number now, which is what this one needs to see first. Asking is the same consent as before: the office receives the whole credential, every item listed.",
    doThis: "On **Bonded Warehouse Authorisation**, press **Ask for this**, then **Ask the Department of Revenue & Customs**.",
    route: "/wallet/get",
    persona: "dorji",
  },
  {
    chapter: 11,
    title: "The system answers by itself",
    happening:
      "This time nobody at the office opens anything. The request is delivered to the office's system, which answers a few seconds later with the details it supplies. Pelden still decides: nothing is added until someone here accepts it.",
    doThis: "Wait until the offer appears, check it, then press **Accept** and **Go to your credentials**.",
    say: "Accepting automatically is a later option the owner would choose, and it isn't in the first release.",
    match: "^/wallet/requests/crq-[^/]+$",
  },
  {
    chapter: 11,
    title: "What the office's system sees",
    happening:
      "The delivery log shows what the system received: the request when it arrived, and that it was issued once Pelden accepted. Requests to answer lists the answer as given by the system's client, not an officer. The dashed panel stands in for the system when it can't answer: it can refer a request to the queue with a note, or miss it. Either way the request lands on Requests to answer, and whichever answer comes first wins.",
    doThis: "Read the **Delivery log**, then press **Next**.",
    route: "/issuer/integration",
    persona: "deki",
  },

  /* ---- 12 · Pelden shares with its bank (FLOW-PRS-01, FLOW-PRS-02) ---- */
  {
    chapter: 12,
    title: "Opening an account at the bank",
    happening:
      "Bank of Bhutan's own website — dashed, because it's another organisation's system. Its account form asks for the company's registration, with an application number on the page and a line saying the customer will leave to sign in with Bhutan NDI and come back.",
    doThis: "Press **Share from NDI Entity Wallet** (dashed).",
    route: "/simulated/bank",
    persona: "dorji",
  },
  {
    chapter: 12,
    title: "Who is asking — before anything else",
    happening:
      "The wallet's own address, the bank's name as NDI lists it — never as the link says — and the bank's reference, with a sentence telling Dorji to continue only if he started this on the bank's site just now and sees that reference there.",
    doThis:
      "Check the reference matches the bank's page, press **Continue**, then **Sign in as Dorji Wangchuk** (dashed — it stands in for the Bhutan NDI sign-in on the phone).",
    say: "Being sent from a site you trust to a page asking you to sign in is exactly what phishing looks like. The address and the listed name are the only reassurance, so they come first.",
    match: "^/present$",
  },
  {
    chapter: 12,
    title: "Share with Bank of Bhutan?",
    happening:
      "The one decision. The bank's reason in its own words, and every detail of Pelden's registration — the three the bank asked for marked, the rest marked as also shared — under the sentence: Bank of Bhutan will receive all of the details below — not only the ones it asked for. Dorji is the representative, so sharing goes at once.",
    doThis: "Read the list, then press **Share with Bank of Bhutan**.",
    say: "A credential like this can't be shared in part. The screen says so rather than promising less — there's nothing to untick.",
    match: "^/wallet/sharing/pr-[^/]+$",
  },
  {
    chapter: 12,
    title: "Shared — back to the bank",
    happening:
      "One line and a five-second countdown back to the bank's registered address. Only Shared counts down: if the bank didn't have it yet, the person would have to press — so they read that it's waiting.",
    doThis: "Let the countdown run, or press **Go back to Bank of Bhutan**.",
    match: "^/wallet/sharing/pr-[^/]+/done$",
  },
  {
    chapter: 12,
    title: "The bank acts on what it fetched",
    happening:
      "Back on the bank's page. The address carries a status anyone could type; the bank checks the application matches and acts only on what its own system fetched — the registration, verified, with its issuer on NDI's list.",
    doThis: "Press **Next** — the guide switches to Ugyen.",
    match: "^/simulated/bank/return$",
  },
  {
    chapter: 12,
    title: "A request with nobody at a website",
    happening:
      "Sharing: what's waiting, what was shared and who agreed, and what was refused. A bank re-checking a customer sends its request straight to the wallet; it waits here for seven days.",
    doThis: "In the dashed panel, press **Bank of Bhutan asks on its connection**, then **Answer**.",
    route: "/wallet/sharing",
    persona: "ugyen",
  },
  {
    chapter: 12,
    title: "Ugyen can see it, but not share it",
    happening:
      "Ugyen was appointed to receive credentials, not to share them. He sees the whole request and why he can't answer it — and instead of a dead end, the people who can, by name.",
    doThis: "Press **Pass to someone who can**, then **Next** — the guide switches to Dorji.",
    say: "Who may share comes from the box Dorji ticked when he appointed Ugyen — not from Ugyen's job title.",
    match: "^/wallet/sharing/pr-[^/]+$",
  },
  {
    chapter: 12,
    title: "Dorji answers",
    happening:
      "The request is waiting, passed on by Ugyen — the dashboard's activity shows what Dorji was sent: \"Ugyen Phuntsho passed you a request from Bank of Bhutan: they can't share it themselves.\" Dorji may share with anyone, at once.",
    doThis: "On Bank of Bhutan's request, press **Answer**, then **Share with Bank of Bhutan**.",
    say: "Every notice goes by email too, so none carries a value from the credential — only who is asking, who passed it and by when.",
    route: "/wallet/sharing",
    persona: "dorji",
  },
  {
    chapter: 12,
    title: "What was shared, and what was refused",
    happening:
      "History answers the question a representative asks later — what did we give the bank, and who agreed? Refused is the only place a request NDI blocked appears: nobody is notified, because a notification would let anyone message the company.",
    doThis: "Press **History**. Then press **A sender not on NDI's list asks** (dashed) and press **Refused**.",
    say: "To see a colleague share and Dorji approve, use Demo controls → Walk a flow → A controller shares, the owner approves.",
    route: "/wallet/sharing",
  },

  /* ---- 13 · Authority for the clearing agent (FLOW-AUT-01) ---- */
  {
    chapter: 13,
    title: "Who can act for Pelden",
    happening:
      "Pema Choden, of Druk Sharpa Freight, declares Pelden's imports at the Bhutan National Single Window. Today she'd carry a letter and copies of Pelden's licence and TPN. Instead Pelden gives her authority she carries in her own Bhutan NDI app. She isn't a member and needs no account here. Nobody holds authority yet.",
    doThis: "Press **Give authority**.",
    route: "/authority-to-act",
    persona: "dorji",
  },
  {
    chapter: 13,
    title: "Where, what, under which licence",
    happening:
      "Where first, so what she can do and which licence follow from it. Declaring at the Single Window needs a business licence someone acting for Pelden can use, and Pelden has none in its wallet yet — the form says so rather than hiding the choice.",
    doThis:
      "Press **Have the ministry issue Pelden's business licence** (dashed). Enter **Pema Choden** and her citizen ID number **11512002960**, tick **Submit customs declarations** and **Amend customs declarations**, tick **BL-PLG-2025-00871**, type **1000000** as the limit, leave the end date — 90 days, at most a year — and press **Continue**.",
    say: "The ID number is what makes a forwarded link useless: only the person whose citizen ID matches it can collect. It's never shown again, and it isn't in what she carries.",
    route: "/authority-to-act/give",
  },
  {
    chapter: 13,
    title: "Check, and give",
    happening:
      "The terms as one sentence, then what Pema will carry — and, said outright, what she won't: not Pelden's licence, not its TPN, not who gave it. Dorji is the representative, so nobody else needs to approve.",
    doThis: "Read it, then press **Give authority**.",
    say: "People expect to hand an agent the company's documents. The screen says she gets neither — only the licence number she acts under.",
    route: "/authority-to-act/give/check",
  },
  {
    chapter: 13,
    title: "Send Pema the link",
    happening:
      "It's Pelden's first authority, so Pelden is first added to NDI's list of trusted organisations as able to give authority — and nothing else. Then the link: Dorji sends it the way he usually reaches Pema; the platform has no contact for her and sends nothing.",
    doThis:
      "Press **NDI's list confirms Pelden Trading Pvt. Ltd.** (dashed). Then press **Copy link**, and **Open the link as Pema Choden** (dashed — it stands in for Pema's phone).",
    match: "^/authority-to-act/g-[^/]+$",
  },
  {
    chapter: 13,
    title: "Pema collects it",
    happening:
      "Before Pema proves who she is, the page names only Pelden — and tells her to continue only if she expected it. Whoever else holds the link gets no further. Once her citizen ID matches, she sees exactly what she'll be able to do, and collects it in the app.",
    doThis:
      "Press **Continue with Bhutan NDI**, then **Share Pema Choden's ID** (dashed — the Bhutan NDI app). Read what she'll be able to do, then press **Accept in the app** (dashed).",
    say: "Try sharing someone else's ID first: the page says the authority is for someone else, and nothing is given — Open the link again (dashed) to go on. Three tries and the link is dead. And before she accepts, opening the link again on another phone (dashed) makes her prove who she is once more, then replaces the offer with a new one.",
    match: "^/authority/claim/[^/]+$",
  },
  {
    chapter: 13,
    title: "Pema can act for Pelden",
    happening:
      "Pema is under Active: what she may do, where, under which licence, up to what, until when, and who gave it. The authority is Pelden's — it stays in force if whoever gave it leaves — and it can't be passed on.",
    doThis: "Press **Next**.",
    say: "To see a Controller give authority and the representative approve it, use Demo controls → Walk a flow → A controller gives authority, the owner approves.",
    route: "/authority-to-act",
    persona: "dorji",
  },

  /* ---- 14 · Pema declares for Pelden (FLOW-AUT-02) ---- */
  {
    chapter: 14,
    title: "The Single Window's own site",
    happening:
      "Bhutan National Single Window's website — dashed, because it's another organisation's system, not NDI's. Pema signs in to it as herself, with Bhutan NDI, as she does today. Nothing about any company yet.",
    doThis: "Press **Sign in as Pema Choden** (dashed), then **Act for a company**.",
    route: "/simulated/bnsw",
  },
  {
    chapter: 14,
    title: "One share, both credentials",
    happening:
      "BNSW asks for two things in one request: her citizen ID and an authority. The dashed panel stands in for her Bhutan NDI app: who is asking, each authority she holds by company name, and that her citizen ID goes with it.",
    doThis: "In the dashed app panel, press **Share**.",
    say: "This is the only trip to the app. After this, each declaration is checked at BNSW without asking her phone again.",
    route: "/simulated/bnsw",
  },
  {
    chapter: 14,
    title: "Refused — Pelden isn't registered with BNSW",
    happening:
      "Every check NDI makes passed — the signatures, her key, Pelden on NDI's list, nothing withdrawn. BNSW's own first check failed: it has no registration from Pelden, so it can't recognise who gave the authority. The message says who can fix it, and how.",
    doThis: "Read the message and the checks in BNSW's records, then press **Next** — the guide switches to Dorji.",
    say: "BNSW fills in the company's name, TPN and licence from the company's own registration. So the company registers once, and nobody types those details again.",
    route: "/simulated/bnsw",
  },
  {
    chapter: 14,
    title: "Dorji registers Pelden",
    happening:
      "BNSW's registration page, the same shape as the bank's: a reference on the page and a button that leaves for the Entity Wallet. BNSW asks for the registration, the TPN and the business licence.",
    doThis: "Press **Share from NDI Entity Wallet** (dashed).",
    route: "/simulated/bnsw/register",
    persona: "dorji",
  },
  {
    chapter: 14,
    title: "Who is asking",
    happening: "The wallet's own address, the Single Window's name as NDI lists it, and BNSW's registration number to check against its page.",
    doThis: "Press **Continue**, then **Sign in as Dorji Wangchuk** (dashed).",
    match: "^/present$",
  },
  {
    chapter: 14,
    title: "Share with the Single Window",
    happening:
      "All three credentials, whole, under the sentence saying BNSW receives every detail. Pelden is already on NDI's list as able to give authority, so the platform also tells BNSW which identity Pelden gives authority from.",
    doThis: "Press **Share with Bhutan National Single Window**.",
    match: "^/wallet/sharing/pr-[^/]+$",
  },
  {
    chapter: 14,
    title: "Shared — back to BNSW",
    happening: "The same five-second countdown back to the address BNSW registered.",
    doThis: "Let the countdown run, or press **Go back to Bhutan National Single Window**.",
    match: "^/wallet/sharing/pr-[^/]+/done$",
  },
  {
    chapter: 14,
    title: "Registered — and recognised",
    happening:
      "Back on BNSW's site, acting on what its own system fetched. Pelden is registered, and because it registered after it first gave authority, the authority it gives is recognised. A company that registered before would have to register again — that's what E8 said.",
    doThis: "Press **Next** — the guide goes back to the declarations page.",
    match: "^/simulated/bnsw/register/return$",
  },
  {
    chapter: 14,
    title: "Acting for Pelden",
    happening:
      "Pema is still signed in. This time every check passes — including a lookup of Pelden's TPN and licence — and BNSW opens a session: the one sentence that must survive review — company, licence, limit, until when — and Pelden's TPN and registered name, shown, never typed.",
    doThis:
      "Press **Act for a company**, then **Share** (dashed). Read the sentence. Type goods and **420000** as the value, and press **Submit declaration**.",
    say: "BNSW sees Pema's name and citizen ID number — it keeps them with every declaration. It never sees Pelden's credentials again, and Pelden isn't told each time.",
    route: "/simulated/bnsw",
  },
  {
    chapter: 14,
    title: "Above the limit",
    happening:
      "Each declaration is checked when it's submitted: the authority, her citizen ID, Pelden's TPN, the licence and Pelden's listing, then the limit. Above Nu 1,000,000 it isn't submitted — the draft stays, and the session goes on.",
    doThis: "Type **1200000** and press **Submit declaration**.",
    route: "/simulated/bnsw",
  },
  {
    chapter: 14,
    title: "The tax office revokes the TPN",
    happening:
      "Pelden's TPN is the tax office's credential, and BNSW checks it with every declaration. Revoking one is the Department of Revenue & Customs' own act, outside the wallet, so it's a dashed step. BNSW finds out at the very next declaration: nothing submitted, the session ended, and the draft kept.",
    doThis:
      "Press **The Department of Revenue & Customs revokes TPN-114-8830** (dashed). Change the value to **300000** and press **Submit declaration**.",
    say: "Pelden isn't told that BNSW found out, and neither is Pema's phone. BNSW asked NDI one question and got an answer.",
    route: "/simulated/bnsw",
  },
  {
    chapter: 14,
    title: "Refused at the start",
    happening:
      "The same check runs when a session opens. With the TPN still revoked, sharing the authority again stops at BNSW's own last check, and the message names the TPN and who to ask. Her draft is still saved.",
    doThis:
      "Press **Act for a company**, then **Share** (dashed) and read the message. Press **The Department of Revenue & Customs reinstates TPN-114-8830** (dashed), then **Act for a company** and **Share** again.",
    route: "/simulated/bnsw",
  },
  {
    chapter: 14,
    title: "Pelden withdraws it",
    happening:
      "Withdrawing is catalogue flow 11, not specified yet, so it's a dashed step. It reaches NDI at once — the target is within a minute — and BNSW finds out at the very next declaration: nothing submitted, the session ended, the draft kept.",
    doThis: "Press **Pelden Trading withdraws the authority** (dashed). Check the value is still **300000** and press **Submit declaration**.",
    say: "Nobody had to tell BNSW. It checks every time, so a withdrawal works between one declaration and the next.",
    route: "/simulated/bnsw",
  },

  /* ---- 15 · Where to go next ---- */
  {
    chapter: 15,
    title: "That's the story",
    happening:
      "The platform went from its root account to two named platform admins; Pelden Trading went from one person signing up to a company holding its own registration; its people were invited, then given authority to act; NDI approved a bank and Pelden to verify — each asking for no more than it needs; a ministry became the authority for sole proprietorships, agreeing exactly what people are asked in its name; Pelden used its registration to get its taxpayer number, from an office that decided on what Pelden proved — then its bonded-warehouse authorisation, answered by the office's system; Pelden shared its registration with its bank — whole, and said so — from the bank's website and from its wallet; Pelden gave its clearing agent authority to declare for it, which she collected in her own Bhutan NDI app without an account; and she used it at the Single Window, where every declaration was checked against it — until Pelden withdrew it.",
    doThis:
      "To run any part again, use **Demo controls → Walk a flow**. The **Prototype · data simulated** chip lists what's simulated.",
  },
];

/** Whether a step's screen is the one showing. */
export function onStepScreen(step: GuideStep, pathname: string): boolean {
  if (step.match) return new RegExp(step.match).test(pathname);
  if (step.route) return pathname === step.route;
  return true;
}
