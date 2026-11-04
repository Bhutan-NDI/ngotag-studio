import type { GuideId } from "./demoData";
import { GUIDE_CHAPTERS, GUIDE_STEPS, type GuideChapter, type GuideStep } from "./demoGuide";
import type { FlowEntry } from "./demoStory";

/**
 * The presentation: the guided demo, cut to the seven flows that explain
 * what the Entity Wallet is to someone seeing it for the first time.
 *
 * WHY A SECOND SCRIPT
 *
 * The full guide is a review of everything built — NDI's root account, its
 * administrators, approving organisations to verify, designating an
 * authority — and a first audience does not need most of it to understand
 * the product. They need one company's story: a person gets an account, the
 * company is verified and brings on a colleague, someone is appointed to
 * act, the company receives a credential, presents one, gives an agent
 * authority, and the agent uses it at the Single Window.
 *
 * WHY IT REUSES THE FULL GUIDE'S STEPS
 *
 * Every step below the chapter openers is the full guide's own, renumbered.
 * The steps are the agreement with the screens — button names, routes,
 * who to drive as — and a second copy would drift from them. So the
 * presentation only adds what a first audience needs: an opening on what
 * the Entity Wallet is, a short opener for each flow saying why it matters,
 * and a close saying what wasn't shown.
 *
 * WHY THE CHAPTERS IT SKIPS CAN BE SKIPPED
 *
 * It starts from the platform-ready state, with NDI's two administrators
 * already set up, so the root and admin chapters aren't needed. Bank of
 * Bhutan is listed as a verifier and the tax office as an issuer from day
 * zero, so sharing with the bank and receiving the TPN don't depend on the
 * approval and designation chapters either — the same reason the Walk a
 * flow entries for Flows 6 to 8 start from the team-ready state.
 */
export interface GuideScript {
  id: GuideId;
  /** The name in the card's eyebrow and the minimised chip. */
  label: string;
  chapters: GuideChapter[];
  steps: GuideStep[];
}

/** A chapter of the full guide, renumbered into the presentation. */
const fromGuide = (fullChapter: number, chapter: number): GuideStep[] =>
  GUIDE_STEPS.filter((s) => s.chapter === fullChapter).map((s) => ({ ...s, chapter }));

export const PRESENTATION_CHAPTERS: GuideChapter[] = [
  { title: "What the Entity Wallet is", shows: "A company's own wallet on Bhutan NDI, and the story we'll follow" },
  { title: "A person gets an account", shows: "Flow 1 · Dorji signs up — just the person, no company yet" },
  { title: "The company comes on", shows: "Flow 2 · The registrar confirms Pelden, then Dorji invites a colleague" },
  { title: "Appointing someone to act", shows: "Flow 3 · Dorji chooses what Ugyen can do; Ugyen accepts in the Bhutan NDI app" },
  { title: "Receiving a credential", shows: "Flow 6 · Pelden asks the tax office for its TPN and accepts what comes back" },
  { title: "Presenting a credential", shows: "Flow 7 · Pelden shares with Bank of Bhutan, from the bank's website and in the wallet" },
  { title: "Giving authority to act", shows: "Flow 8 · Dorji gives the clearing agent authority; she collects it in her own app" },
  { title: "Acting at the Single Window", shows: "Flow 9 · The agent declares for Pelden, and each declaration is checked" },
  { title: "What you saw", shows: "The seven flows, and what wasn't shown" },
];

export const PRESENTATION_STEPS: GuideStep[] = [
  /* ---- 0 · What the Entity Wallet is ---- */
  {
    chapter: 0,
    title: "The Entity Wallet",
    happening:
      "Bhutan NDI gives every citizen a wallet for their own credentials. The Entity Wallet does the same for an organisation: a company holds its own credentials — its registration, its taxpayer number, its licences — in a wallet that belongs to the company, not to any one person. People act for it only as far as the company says they can, and whoever relies on a credential can check it with the office that issued it.",
    doThis: "Press **Next**.",
    say: "Today a company proves itself with paper: certificates, letters of authority, photocopies. This is what replaces them.",
    route: "/sign-up",
    match: "^/sign-up$",
  },
  {
    chapter: 0,
    title: "One company's story",
    happening:
      "We follow Pelden Trading Pvt. Ltd., a private limited company in Thimphu, through seven flows. Its director, Dorji Wangchuk, gets an account. Pelden is verified by the authority that registered it, and Dorji invites a colleague, Ugyen. Dorji appoints Ugyen to act for Pelden. Pelden receives its taxpayer number from the Department of Revenue & Customs, then shares its registration with Bank of Bhutan. Finally Pelden gives its clearing agent, Pema, authority to declare its imports, and she uses it at the Bhutan National Single Window.",
    doThis: "Press **Next**.",
    route: "/sign-up",
    match: "^/sign-up$",
  },
  {
    chapter: 0,
    title: "How to read the screen",
    happening:
      "Nothing here is real, and nothing is sent. Anything in a dashed panel stands in for something outside the Entity Wallet: a phone, an inbox, the Bhutan NDI app, a government register, or the bank's and the Single Window's websites. Everything else is the Entity Wallet as it would look.",
    doThis:
      "Press **Next** to begin. The guide takes you to each screen and says what to press; you do the clicking. The arrow at the top of this card tucks it away when it's in the way.",
    route: "/sign-up",
    match: "^/sign-up$",
  },

  /* ---- 1 · A person gets an account (Flow 1) ---- */
  {
    chapter: 1,
    title: "Flow 1 · The person comes first",
    happening:
      "Everyone who uses the Entity Wallet starts as a person with their own account. The company comes later, and separately: one account can act for several organisations, and creating an account says nothing about any company.",
    doThis: "Press **Next**.",
    say: "Nobody signs up \"as\" a company. The person comes first, and the company is proved on its own.",
    route: "/sign-up",
    match: "^/sign-up$",
  },
  ...fromGuide(3, 1),

  /* ---- 2 · The company comes on (Flow 2) ---- */
  {
    chapter: 2,
    title: "Flow 2 · The registrar decides, not NDI",
    happening:
      "Now Dorji adds Pelden. NDI doesn't decide who a company is: the authority that registered it does. Here that's the Corporate Regulatory Authority, which checks its own register and who Dorji is, from Dorji's Bhutan NDI app. Once it's confirmed, Pelden's registration arrives in Pelden's own wallet. Then Dorji invites a colleague, who joins by email.",
    doThis: "Press **Next**.",
    say: "The registrar stays the source of truth. NDI carries its answer; it doesn't make one up.",
    route: "/onboarding",
    match: "^/onboarding$",
  },
  ...fromGuide(4, 2),
  ...fromGuide(5, 2),

  /* ---- 3 · Appointing someone to act (Flow 3) ---- */
  {
    chapter: 3,
    title: "Flow 3 · Joining isn't acting",
    happening:
      "Ugyen is a member now: Ugyen can see Pelden, but can't act for it. Appointing is the separate step that lets someone act. Dorji chooses exactly what Ugyen can do, and Ugyen accepts with one approval in their own Bhutan NDI app. Nobody can be made to act for a company without agreeing to it themselves.",
    doThis: "Press **Next**.",
    say: "Letting someone in and letting them act are two different decisions, and the Entity Wallet keeps them apart.",
    route: "/people-who-can-act/appoint",
    persona: "dorji",
  },
  ...fromGuide(6, 3),

  /* ---- 4 · Receiving a credential (Flow 6) ---- */
  {
    chapter: 4,
    title: "Flow 6 · Each office issues its own",
    happening:
      "With its registration in its wallet, Pelden asks the Department of Revenue & Customs for its taxpayer number (TPN). The office sees the registration Pelden shares with it, decides on what was proved, and sends the TPN back as a credential. Someone at Pelden checks the offer and accepts it before it's held.",
    doThis: "Press **Next**.",
    say: "Each office issues what it's responsible for. The wallet is where it comes together, under the company's control.",
    route: "/wallet/get",
    persona: "dorji",
  },
  ...fromGuide(10, 4),

  /* ---- 5 · Presenting a credential (Flow 7) ---- */
  {
    chapter: 5,
    title: "Flow 7 · No more photocopies",
    happening:
      "Pelden opens an account at Bank of Bhutan. Instead of asking for copies, the bank asks for Pelden's credentials from its website. Dorji sees who is asking and every detail that will go, shares, and is taken back to the bank. Then the bank asks again inside the wallet: Ugyen can see the request but wasn't appointed to share, so passes it to Dorji.",
    doThis: "Press **Next**.",
    say: "The bank receives the credential from the company, signed by the office that issued it, and can check it's still valid. Nothing to verify by hand.",
    route: "/simulated/bank",
    persona: "dorji",
  },
  ...fromGuide(12, 5),

  /* ---- 6 · Giving authority to act (Flow 8) ---- */
  {
    chapter: 6,
    title: "Flow 8 · Authority someone else can check",
    happening:
      "Pelden's clearing agent, Pema Choden, declares its imports at the Bhutan National Single Window. Today she'd carry a letter and copies of Pelden's licence and TPN. Instead Dorji gives her authority to act — for what, under which licence, up to what amount, until when — and she collects it from a link in her own Bhutan NDI app. She needs no account here and isn't a member of Pelden.",
    doThis: "Press **Next**.",
    say: "Delegation the other side can check: who acted, for whom, and under what authority.",
    route: "/authority-to-act",
    persona: "dorji",
  },
  ...fromGuide(13, 6),

  /* ---- 7 · Acting at the Single Window (Flow 9) ---- */
  {
    chapter: 7,
    title: "Flow 9 · Checked at every declaration",
    happening:
      "Pema signs in at the Single Window — simulated here — and shares her authority once from her app. The first try is refused: Pelden has never registered with the Single Window, so Dorji registers it, the same way Pelden shared with the bank. After that, each declaration is checked against her authority, and against Pelden's TPN and licence as they stand at that moment. We'll see it refuse too: above her limit, when the tax office revokes Pelden's TPN, and once Pelden withdraws her authority.",
    doThis: "Press **Next**.",
    say: "Every refusal says why, and who can fix it.",
    route: "/simulated/bnsw",
  },
  ...fromGuide(14, 7),

  /* ---- 8 · What you saw ---- */
  {
    chapter: 8,
    title: "That's the Entity Wallet",
    happening:
      "Dorji got an account as a person. Pelden was verified by its registrar and brought on a colleague, and Dorji appointed that colleague to act, with only the powers Dorji chose. Pelden received its TPN from the tax office, shared its registration with its bank, gave its clearing agent authority she carries in her own app, and the Single Window checked that authority at every declaration. Not shown today: setting up NDI's own administrators, NDI approving organisations to verify or issue, and designating an authority. Approvals that need several signatories, suspending and revoking, changing who controls a company, and recovering from a lost phone (Flows 10 to 13) haven't been designed yet.",
    doThis:
      "Press **Finish**. To run any part again, use **Demo controls → Walk a flow**. The **Prototype · data simulated** chip lists what's simulated.",
  },
];

export const PRESENTATION: GuideScript = {
  id: "presentation",
  label: "Presentation guide",
  chapters: PRESENTATION_CHAPTERS,
  steps: PRESENTATION_STEPS,
};

export const FULL_GUIDE: GuideScript = {
  id: "full",
  label: "Guided demo",
  chapters: GUIDE_CHAPTERS,
  steps: GUIDE_STEPS,
};

/**
 * The presentation as it is shown to a client: the same seven flows, in the
 * same order, as jumps in a panel of their own.
 *
 * The guide above is for practising — its card says what to press and what
 * to say, which is the presenter's business, not the room's. In front of a
 * client the presenter picks the next part from this list, each one starting
 * from a clean state on its first screen, and no card is shown. No flow
 * numbers: they mean something to the team, not to the audience.
 */
export interface PresentationPart extends Pick<FlowEntry, "persona" | "route" | "selfService" | "start"> {
  title: string;
  /** One line under the title, in the audience's words. */
  shows: string;
}

export const PRESENTATION_PARTS: PresentationPart[] = [
  {
    title: "Entity Wallet user onboarding",
    shows: "Dorji gets an account as a person, with no company yet",
    persona: null,
    route: "/sign-up",
    selfService: true,
    start: "platformReady",
  },
  {
    title: "Entity onboarding",
    shows: "The registrar confirms Pelden, and Dorji invites a colleague",
    persona: "dorji",
    route: "/onboarding",
    selfService: true,
    start: "platformReady",
  },
  {
    title: "Appointing a controller",
    shows: "Dorji chooses what Ugyen can do; Ugyen accepts in the Bhutan NDI app",
    persona: "dorji",
    route: "/people-who-can-act/appoint",
    start: "teamReady",
  },
  {
    title: "Receiving credentials",
    shows: "Pelden asks the tax office for its TPN and accepts it",
    persona: "dorji",
    route: "/wallet/get",
    start: "teamReady",
  },
  {
    title: "Presenting credentials",
    shows: "Pelden shares its credentials with Bank of Bhutan",
    persona: "dorji",
    route: "/simulated/bank",
    start: "teamReady",
  },
  {
    title: "Issuing authority credentials",
    shows: "Dorji gives the clearing agent authority; she collects it in her own app",
    persona: "dorji",
    route: "/authority-to-act",
    start: "teamReady",
  },
  {
    title: "Acting at BNSW",
    shows: "The clearing agent declares for Pelden, and each declaration is checked",
    persona: null,
    route: "/simulated/bnsw",
    start: "livedIn",
  },
];

/** The script the guide is reading; the full story when none is set. */
export const guideScript = (id: GuideId | undefined): GuideScript => (id === "presentation" ? PRESENTATION : FULL_GUIDE);
