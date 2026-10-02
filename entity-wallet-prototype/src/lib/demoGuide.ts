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
 * Appointing a controller and a delegate follow it, because being invited
 * is only half of getting ready: a member can see the organisation, and
 * somebody still has to be able to act for it. Both are invited first and
 * appointed second, in that order and never the other way round, and both
 * prove who they are at the appointment rather than at the invitation
 * (FLOW-ONB-02 §7.3). The catalogue has not designed either flow yet (Flows
 * 3 and 8); the steps follow the user stories (Pattern A, and Story B5).
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
  { title: "Register the organisation", shows: "A government register, not NDI, confirms the company" },
  { title: "Pelden brings on its people", shows: "The owner invites a colleague; they join from the link" },
  { title: "Appoint a controller", shows: "A member is given scoped authority, proves who they are, and accepts" },
  { title: "Invite and appoint a delegate", shows: "A clearing agent is invited, then given a role in their own wallet" },
  { title: "Where to go next", shows: "The other routes, and what's simulated" },
];

export const GUIDE_STEPS: GuideStep[] = [
  /* ---- 0 · Before you start ---- */
  {
    chapter: 0,
    title: "Onboarding onto the Entity Wallet",
    happening:
      "Everything it takes to get onto the Entity Wallet and ready to use it, in the order it has to happen: NDI's root administrator signs in, root invites a platform admin, a new company — Pelden Trading — signs up and gets its Entity Wallet, and Pelden's owner invites a colleague and appoints them controller, then invites a clearing agent and appoints them delegate. Nothing is real: the dashed \"Prototype\" panels stand in for a phone, an inbox or a government register.",
    doThis:
      "Press **Next**. The guide takes you to each screen and tells you what to press; you do the clicking. **Minimise** tucks this card away when it's in the way.",
  },

  /* ---- 1 · Root admin onboarding ---- */
  {
    chapter: 1,
    title: "The root administrator signs in",
    happening:
      "Before any business, NDI's root administrator, Anand Acharya, signs in. The account was made when the platform was deployed, so there is no sign-up and nothing to onboard.",
    doThis:
      "Press **Anand Acharya** in the dashed panel (it fills in the address), type any password, then press **Sign in**.",
    route: "/sign-in",
    match: "^/sign-in$",
  },
  {
    chapter: 1,
    title: "NDI's own organisation",
    happening:
      "Root lands in Bhutan NDI's organisation, which is ready from the start: the whole Studio — credentials, schemas, trust, ecosystems — and NDI administration beside it. Nobody administers the platform yet.",
    doThis: "Press **Invite a platform admin**.",
    route: "/dashboard",
    persona: "root",
  },
  /* ---- 2 · Platform admin onboarding ---- */
  {
    chapter: 2,
    title: "Invite a platform admin",
    happening:
      "Root's first job is to invite the people who will run the platform day to day. Root types the address the invitation goes to — nobody is an admin until root decides to trust them. Until one accepts, no organisation can be added.",
    doThis:
      "Type **kinzang.dorji@bhutanndi.bt**, press **Send invitation**, then **Open the invitation as kinzang.dorji@bhutanndi.bt** (dashed — it stands in for the invitee's inbox).",
    route: "/admin/team",
    persona: "root",
  },
  {
    chapter: 2,
    title: "Kinzang sets up the account",
    happening:
      "The invitation is the onboarding. It names who is granting it and what it does not include — acting for any business — and the account is set up right here. No separate sign-up: the link already proves the address.",
    doThis:
      "Enter **Kinzang Dorji**, a password such as **Thimphu-Chorten-2026**, the same password again to confirm, then press **Set up account and accept**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 2,
    title: "Kinzang is a platform admin",
    happening:
      "In Bhutan NDI's organisation as a platform admin: the Studio and NDI administration — but not Platform admins, because only root makes admins.",
    doThis: "Press **Next** — with an admin in place, a company can now come onto the platform.",
    route: "/dashboard",
    /* No persona: setting up the account already drives the console as
       whoever accepted. Forcing the seeded admin here broke the step when
       the invitation went to any other address — the seeded record has no
       admin role on day zero, so the sidebar came up empty. */
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

  /* ---- 4 · Register the organisation ---- */
  {
    chapter: 4,
    title: "What kind of organisation",
    happening:
      "Each kind names the government register that will confirm it. No registration number is asked for — nobody can claim a company just by knowing its number.",
    doThis: "Leave **Private or public limited company** selected and press **Continue to prove who you are**.",
    route: "/onboarding",
    match: "^/onboarding$",
  },
  {
    chapter: 4,
    title: "Prove who you are",
    happening:
      "Dorji proves who they are with their own Bhutan NDI Wallet, on the same scan card people know from other services. Only Dorji's identity is shared — nothing about the company.",
    doThis: "Press **Simulate the scan** (the code doesn't really scan). Once it's confirmed, the next step opens by itself.",
    route: "/onboarding/prove",
  },
  {
    chapter: 4,
    title: "The register answers",
    happening:
      "NDI can't vouch for a company by itself, so it asks the Corporate Regulatory Authority which companies list Dorji as a representative. This wait is deliberately longer than the others.",
    doThis:
      "Wait for the list. Druk Valley Hardware is greyed out — another director already added it. Press **Add Pelden Trading Pvt. Ltd.**",
    say: "This is the moment the platform admits it can't decide who a company is. A register does.",
    route: "/onboarding/choose",
  },
  {
    chapter: 4,
    title: "The company receives its registration",
    happening:
      "Pelden's registration arrives as a credential in the company's own wallet. Everything later — every authority, every check — traces back to it.",
    doThis: "Press **Accept the registration**, then **Back to your organisations**.",
    route: "/onboarding/foundational",
  },
  {
    chapter: 4,
    title: "Pelden is on the account",
    happening: "Dorji's account now lists Pelden Trading, with Dorji as its owner.",
    doThis: "Press **Open** next to Pelden Trading.",
    route: "/welcome",
  },
  {
    chapter: 4,
    title: "Pelden's first day",
    happening:
      "A brand-new organisation: it holds its registration and Dorji's authority to act for it, and nothing else. No colleagues, no tasks, no history — so the first thing it suggests is inviting people.",
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
      "Ugyen can see Pelden but holds no authority for it, and the console says so in the same words the invitation used. No members page, no controllership: those are the owner's.",
    doThis: "Press **Next** to go back to Dorji.",
    route: "/dashboard",
    /* No persona: accepting already drives the console as whoever joined. */
  },
  {
    chapter: 5,
    title: "Dorji sees who joined",
    happening:
      "Ugyen is a member now: identity not yet confirmed — joining never asks the register — and no authority to act. That comes next: Dorji appoints Ugyen controller, and Ugyen proves who they are while accepting.",
    doThis: "Press **Next**.",
    route: "/members",
    persona: "dorji",
  },

  /* ---- 6 · Appoint a controller ---- */
  {
    chapter: 6,
    title: "Propose a controllership",
    happening:
      "A controller acts for Pelden through the console, within limits Dorji sets. It stands on a legal basis and a signed instrument. Ugyen can be chosen though not yet confirmed — the proof comes when Ugyen accepts.",
    doThis:
      "Choose **Ugyen Phuntsho**, leave **Entity consent**, press **Attach a sample resolution** (dashed — it stands in for the signed board resolution), then press **Continue to scope**.",
    say: "Membership let Ugyen in. This is the separate grant that lets Ugyen act — and it isn't a role dropdown.",
    route: "/controllership/relations/new",
    persona: "dorji",
  },
  {
    chapter: 6,
    title: "Decide exactly what Ugyen may do",
    happening:
      "Nothing is granted until it is ticked, and each operation carries its own limits and approval rule. The summary beside the form says, in plain words, exactly what Ugyen will be asked to accept.",
    doThis:
      "Tick **Receive offers** and **Accept offers**, choose **Any credential type** for each, then press **Send for acceptance**. Then press **Open what Ugyen will see**.",
    match: "^/controllership/relations/[^/]+/scope$",
  },
  {
    chapter: 6,
    title: "Ugyen proves who they are and accepts",
    happening:
      "Only Ugyen can accept, so the screen says so to Dorji. Joining Pelden never asked who Ugyen is; acting for it does — once, with Ugyen's own NDI Wallet — and the acceptance is refused without it.",
    doThis:
      "Press **Continue as Ugyen**, then **Simulate the scan**. When it's confirmed, press **Accept these duties**, then **See what I may do**.",
    say: "Dorji couldn't accept on Ugyen's behalf. An acceptance someone else makes isn't worth recording.",
    match: "^/controllership/relations/[^/]+/accept$",
  },
  {
    chapter: 6,
    title: "Ugyen is a controller",
    happening:
      "Ugyen's authority, in force: exactly what was ticked, with no end date unless Dorji set one. Ugyen can read it and cannot change it.",
    doThis: "Press **Next**.",
    route: "/wallet/authority",
  },

  /* ---- 7 · Invite and appoint a delegate ---- */
  {
    chapter: 7,
    title: "Invite the clearing agent",
    happening:
      "Pema Choden, of Druk Sharpa Freight, clears Pelden's imports. A delegate acts from their own wallet, not through the console — but is still invited first and appointed second, like a controller.",
    doThis:
      "Type **pema.choden@druksharpa.bt**, leave **Member** selected and press **Send invitation**. Then press **Open the invitation as pema.choden@druksharpa.bt**.",
    route: "/members/invite",
    persona: "dorji",
  },
  {
    chapter: 7,
    title: "Pema sets up an account",
    happening: "The same invitation Ugyen had: who sent it, what it gives, what it doesn't, and an account set up from the link.",
    doThis:
      "Enter **Pema Choden**, a password such as **Thimphu-Chorten-2026**, the same password again, then press **Set up account and accept**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 7,
    title: "Pema has joined",
    happening: "Pema is a member of Pelden — still with no authority. Back to Dorji to appoint Pema as delegate.",
    doThis: "Press **Next**.",
    match: "^/invitation/[^/]+/accepted$",
  },
  {
    chapter: 7,
    title: "Issue a role into Pema's wallet",
    happening:
      "A delegate's authority is a credential in their own NDI Wallet. Its limits — what for, how much, with whom, until when — travel with it and are checked by every counterparty; \"What a counterparty reads\" shows them exactly as a verifier will.",
    doThis:
      "Leave **Role**, choose **Pema Choden**, name it **Customs clearing agent**, tick **Submit customs declarations**, type **500000** as the cap, choose **Bhutan National Single Window**, and press **Issue to Pema**. Then press **Accept it as Pema** (dashed — it stands in for Pema's phone).",
    say: "Accepting in their own wallet is Pema's consent, and it proves who Pema is — the wallet is bound to Pema's citizen credential.",
    route: "/delegated-authority/new",
    persona: "dorji",
  },
  {
    chapter: 7,
    title: "Pelden is ready",
    happening:
      "Three people, three different things: Dorji holds the root authority, Ugyen is a controller with scoped authority in the console, and Pema is a delegate whose role lives in their own wallet. Each was invited first, and each proved who they are when they took authority on.",
    doThis: "Press **Next**.",
    route: "/members",
    persona: "dorji",
  },

  /* ---- 8 · Where to go next ---- */
  {
    chapter: 8,
    title: "That's onboarding",
    happening:
      "The platform went from its root administrator to a first platform admin; Pelden Trading went from one person signing up to a company holding its own registration; and its people were invited, then appointed — a controller, and a delegate.",
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
