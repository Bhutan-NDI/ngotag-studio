import { inOrg, PELDEN, type DemoState, type GuideId, type PersonaId } from "./demoData";
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
  { title: "The company comes on", shows: "Flow 2 · The registrar confirms Pelden Trading, then Dorji invites a colleague" },
  { title: "Appointing someone to act", shows: "Flow 3 · Dorji chooses what Ugyen can do; Ugyen accepts in the Bhutan NDI app" },
  { title: "Receiving a credential", shows: "Flow 6 · Pelden Trading asks the tax office for its TPN and accepts what comes back" },
  { title: "Presenting a credential", shows: "Flow 7 · Pelden Trading shares with Bank of Bhutan, from the bank's website and in the wallet" },
  { title: "Giving authority to act", shows: "Flow 8 · Dorji gives the clearing agent authority; she collects it in her own app" },
  { title: "Acting at the Single Window", shows: "Flow 9 · The agent declares for Pelden Trading, and each declaration is checked" },
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
      "We follow Pelden Trading Pvt. Ltd., a private limited company in Thimphu, through seven flows. Its director, Dorji Wangchuk, gets an account. Pelden Trading is verified by the authority that registered it, and Dorji invites a colleague, Ugyen. Dorji appoints Ugyen to act for Pelden Trading. Pelden Trading receives its taxpayer number from the Department of Revenue & Customs, then shares its registration with Bank of Bhutan. Finally Pelden Trading gives its clearing agent, Pema, authority to declare its imports, and she uses it at the Bhutan National Single Window.",
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
      "Everyone who uses the Entity Wallet starts as a person with their own account, tied to them with one scan of their Bhutan NDI Wallet. The company comes later, and separately: one account can act for several organisations, and creating an account says nothing about any company.",
    doThis: "Press **Next**.",
    say: "Nobody signs up \"as\" a company. The person comes first, proved with their own NDI wallet, and the company is proved on its own.",
    route: "/sign-up",
    match: "^/sign-up$",
  },
  ...fromGuide(3, 1),

  /* ---- 2 · The company comes on (Flow 2) ---- */
  {
    chapter: 2,
    title: "Flow 2 · The registrar decides, not NDI",
    happening:
      "Now Dorji adds Pelden Trading. NDI doesn't decide who a company is: the authority that registered it does. Here that's the Corporate Regulatory Authority, which checks its own register and who Dorji is, from Dorji's Bhutan NDI app. Once it's confirmed, Pelden Trading's registration arrives in Pelden Trading's own wallet. Then Dorji invites a colleague, who joins by email.",
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
      "Ugyen is a member now: Ugyen can see Pelden Trading, but can't act for it. Appointing is the separate step that lets someone act. Dorji chooses exactly what Ugyen can do, and Ugyen accepts with one approval in their own Bhutan NDI app. Nobody can be made to act for a company without agreeing to it themselves.",
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
      "With its registration in its wallet, Pelden Trading asks the Department of Revenue & Customs for its taxpayer number (TPN). The office sees the registration Pelden Trading shares with it, decides on what was proved, and sends the TPN back as a credential. Someone at Pelden Trading checks the offer and accepts it before it's held.",
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
      "Pelden Trading opens an account at Bank of Bhutan. Instead of asking for copies, the bank asks for Pelden Trading's credentials from its website. Dorji sees who is asking and every detail that will go, shares, and is taken back to the bank. Then the bank asks again inside the wallet: Ugyen can see the request but wasn't appointed to share, so passes it to Dorji.",
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
      "Pelden Trading's clearing agent, Pema Choden, declares its imports at the Bhutan National Single Window. Today she'd carry a letter and copies of Pelden Trading's licence and TPN. Instead Dorji gives her authority to act — for what, under which licence, up to what amount, until when — and she collects it from a link in her own Bhutan NDI app. She needs no account here and isn't a member of Pelden Trading.",
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
      "Pema signs in at the Single Window — simulated here — and shares her authority once from her app. The first try is refused: Pelden Trading has never registered with the Single Window, so Dorji registers it, the same way Pelden Trading shared with the bank. After that, each declaration is checked against her authority, and against Pelden Trading's TPN and licence as they stand at that moment. We'll see it refuse too: above her limit, when the tax office revokes Pelden Trading's TPN, and once Pelden Trading withdraws her authority.",
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
      "Dorji got an account as a person. Pelden Trading was verified by its registrar and brought on a colleague, and Dorji appointed that colleague to act, with only the powers Dorji chose. Pelden Trading received its TPN from the tax office, shared its registration with its bank, gave its clearing agent authority she carries in her own app, and the Single Window checked that authority at every declaration. Not shown today: setting up NDI's own administrators, NDI approving organisations to verify or issue, and designating an authority. Approvals that need several signatories, suspending and revoking, changing who controls a company, and recovering from a lost phone (Flows 10 to 13) haven't been designed yet.",
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
  /**
   * The hand-overs in the part, in the order they happen: the person to
   * switch to, and the screen they pick it up on. Switching never resets.
   * Anyone who answers in a dashed panel (their phone, their app, their
   * inbox) needs no entry: they act on the screen already open.
   */
  switchTo?: { label: string; persona?: PersonaId; route: string }[];
  /**
   * Who takes part, for the panel's "Driving as" row. Only these are
   * offered while the part is on screen: a client's "what does Ugyen see?"
   * is answered in one press, without a row of people the part never
   * touches. Somebody without an account (the clearing agent) is reached by
   * her link instead, so is not listed here.
   */
  cast: PersonaId[];
}

export const PRESENTATION_PARTS: PresentationPart[] = [
  {
    title: "Entity Wallet user onboarding",
    shows: "Dorji gets an account as a person, tied to him with a Bhutan NDI scan",
    persona: null,
    route: "/sign-up",
    selfService: true,
    start: "platformReady",
    cast: ["dorji"],
  },
  {
    title: "Entity onboarding",
    shows: "The registrar confirms Pelden Trading, and Dorji invites a colleague",
    persona: "dorji",
    route: "/onboarding",
    selfService: true,
    start: "platformReady",
    cast: ["dorji", "ugyen"],
    switchTo: [{ label: "Dorji · Pelden Trading", persona: "dorji", route: "/members" }],
  },
  {
    title: "Appointing a controller",
    shows: "Dorji chooses what Ugyen can do; Ugyen accepts in the Bhutan NDI app",
    persona: "dorji",
    route: "/people-who-can-act/appoint",
    start: "teamReady",
    cast: ["dorji", "ugyen"],
  },
  {
    title: "Receiving credentials",
    shows: "Pelden Trading asks the tax office for its TPN and accepts it",
    persona: "dorji",
    route: "/wallet/get",
    start: "teamReady",
    cast: ["dorji", "deki"],
    switchTo: [
      { label: "Deki · tax office", persona: "deki", route: "/issuer/requests" },
      { label: "Dorji · Pelden Trading", persona: "dorji", route: "/wallet/requests" },
    ],
  },
  {
    title: "Presenting credentials",
    shows: "Pelden Trading shares its credentials with Bank of Bhutan",
    persona: "dorji",
    route: "/simulated/bank",
    start: "teamReady",
    cast: ["dorji", "ugyen"],
    switchTo: [
      { label: "Ugyen · Pelden Trading", persona: "ugyen", route: "/wallet/sharing" },
      { label: "Dorji · Pelden Trading", persona: "dorji", route: "/wallet/sharing" },
    ],
  },
  {
    title: "Issuing authority credentials",
    shows: "Dorji gives the clearing agent authority; she collects it in her own app",
    persona: "dorji",
    route: "/authority-to-act",
    start: "teamReady",
    cast: ["dorji"],
    switchTo: [{ label: "Dorji · Pelden Trading", persona: "dorji", route: "/authority-to-act" }],
  },
  {
    title: "Acting at BNSW",
    shows: "The clearing agent declares for Pelden Trading, and each declaration is checked",
    persona: null,
    route: "/simulated/bnsw",
    start: "livedIn",
    cast: ["dorji"],
    switchTo: [
      { label: "Dorji · Pelden Trading", persona: "dorji", route: "/simulated/bnsw/register" },
      { label: "Pema · BNSW", route: "/simulated/bnsw" },
    ],
  },
];

/** Who is acting on screen, as the handover card names them. */
export interface Actor {
  key: string;
  name: string;
  role: string;
}

/**
 * Who the room is watching. Mostly the person being driven as, but three
 * screens belong to someone the switcher doesn't drive: Pema on her own
 * phone and at the Single Window's site, and whoever opens a member
 * invitation. Without them on the card, the room would read the whole
 * story as one person clicking.
 */
export const presentationActor = (
  pathname: string,
  signedOut: boolean,
  person: { id: string; name: string; title: string } | undefined,
  /** Whose inbox, when the screen is the simulated mail. */
  mailbox?: { name: string; address: string } | null,
): Actor | null => {
  if (pathname.startsWith("/simulated/mail/"))
    return mailbox
      ? { key: `mail-${mailbox.address}`, name: mailbox.name, role: `Reading their email · ${mailbox.address}` }
      : null;
  if (pathname.startsWith("/authority/claim/"))
    return { key: "pema-phone", name: "Pema Choden", role: "Clearing agent · on her own phone" };
  if (pathname.startsWith("/simulated/bnsw") && !pathname.startsWith("/simulated/bnsw/register"))
    return { key: "pema-bnsw", name: "Pema Choden", role: "Clearing agent · at the Bhutan National Single Window" };
  if (pathname.startsWith("/invitation/"))
    return { key: "invitee", name: "The colleague Dorji invited", role: "Opening the invitation from their email" };
  if (signedOut || !person) return null;
  return { key: person.id, name: person.name, role: person.title };
};

/** The script the guide is reading; the full story when none is set. */
export const guideScript = (id: GuideId | undefined): GuideScript => (id === "presentation" ? PRESENTATION : FULL_GUIDE);

/**
 * What is waiting for one person, for the Presentation panel.
 *
 * WHY THE PANEL NEEDS ITS OWN LIST
 *
 * In front of a client the presenter switches people whenever a question
 * asks for it, and comes back later. Switching never resets anything, but
 * some of what waits for a person has no way back once they leave it: an
 * appointee reaches their appointment only from the representative's
 * "open it as …" (it stands in for a notification), and a clearing agent
 * reaches her authority only from the link Dorji copied. So the panel lists,
 * for whoever is being driven as, what is waiting for them and where it is
 * answered. The wallet's own "Needs you" rules are followed for approvals,
 * requests and offers (NeedsAttention); appointments, authority to collect
 * and the issuer's queue are added, because those have no dashboard entry.
 */
export interface WaitingItem {
  key: string;
  label: string;
  href: string;
  /** The organisation the screen belongs to, made active before going. */
  orgId?: string;
}

type WaitingState = Pick<
  DemoState,
  | "people"
  | "organizations"
  | "relations"
  | "parkedOperations"
  | "presentationRequests"
  | "offers"
  | "credentialRequests"
  | "authorityGrants"
>;

export function waitingFor(s: WaitingState, personId: string): WaitingItem[] {
  const person = s.people.find((p) => p.id === personId);
  if (!person) return [];
  const today = new Date().toISOString().slice(0, 10);
  const orgsOf = s.organizations.filter((o) => o.memberIds.includes(personId)).map((o) => o.id);
  const orgName = (id?: string) => s.organizations.find((o) => o.id === (id ?? PELDEN))?.name ?? "the organisation";
  const items: WaitingItem[] = [];

  /* An appointment to accept or decline (SCR-DEL-03). */
  for (const r of s.relations.filter((x) => x.personId === personId && x.state === "PENDING_ACCEPTANCE")) {
    items.push({
      key: r.id,
      label: `Accept or decline the appointment to act for ${orgName(r.orgId)}`,
      href: `/appointments/${r.id}`,
      orgId: r.orgId ?? PELDEN,
    });
  }

  for (const orgId of orgsOf) {
    const here = inOrg(orgId);
    const canDecide = s.relations
      .filter(here)
      .some((r) => r.personId === personId && r.state === "ACTIVE" && r.scope.grants.some((g) => g.operation === "approval:decide"));
    /* Somebody else is waiting on a decision — never one's own. */
    if (canDecide) {
      for (const op of s.parkedOperations.filter(here).filter((p) => p.state === "parked" && p.requestedBy !== personId)) {
        const share = op.operation === "proof:present" && op.targetId;
        items.push({
          key: op.id,
          label: `Approve or refuse: ${op.summary}`,
          href: share ? `/wallet/sharing/${op.targetId}/approve` : `/approvals/${op.id}`,
          orgId,
        });
      }
    }
    /* An organisation is asking for credentials (Flow 7). */
    for (const v of s.presentationRequests.filter(here).filter((v) => v.status === "OPEN" && v.expiresAt >= today)) {
      items.push({ key: v.id, label: `Answer ${v.verifierName}'s request`, href: `/wallet/sharing/${v.id}`, orgId });
    }
    /* A credential offered, or one this organisation asked for that is ready. */
    for (const o of s.offers.filter(here).filter((o) => o.state === "pending")) {
      items.push({ key: o.id, label: `Review ${o.type} from ${o.issuer}`, href: `/wallet/requests/${o.id}`, orgId });
    }
    for (const c of s.credentialRequests.filter((c) => c.orgId === orgId && (c.state === "OFFER_READY" || c.state === "NEEDS_CONSENT"))) {
      items.push({ key: c.id, label: `Review what ${c.issuerName} sent`, href: "/wallet/requests", orgId });
    }
    /* A request still being sent: the prototype moves it on only while its
       page is open (useSimulatedDelivery), so switching away too soon leaves
       it here until someone looks again. */
    for (const c of s.credentialRequests.filter((c) => c.orgId === orgId && c.state === "AWAITING_PROOF")) {
      items.push({ key: c.id, label: `Finish sending the request to ${c.issuerName}`, href: `/wallet/requests/${c.id}`, orgId });
    }
    /* The issuer's queue (Deki at the tax office). */
    for (const c of s.credentialRequests.filter((c) => c.issuerOrgId === orgId && c.state === "WITH_ISSUER")) {
      items.push({ key: c.id, label: `Answer ${orgName(c.orgId)}'s request`, href: `/issuer/requests/${c.id}`, orgId });
    }
  }

  return items;
}

/**
 * Authority waiting to be collected from a link (Flow 8). The delegate —
 * Pema, a clearing agent — has no account and isn't someone the panel can
 * drive as, so these are listed for everyone: the link is the only way to
 * her side, and once Dorji's screen is left it is otherwise lost.
 */
export function waitingToCollect(s: Pick<WaitingState, "organizations" | "authorityGrants">): WaitingItem[] {
  const orgName = (id: string) => s.organizations.find((o) => o.id === id)?.name ?? "the organisation";
  return s.authorityGrants
    .filter((g) => g.claimRef && (g.status === "CLAIMABLE" || g.status === "ISSUING"))
    .map((g) => ({
      key: g.id,
      label: `${g.delegateName ?? g.name}: collect authority to act for ${orgName(g.orgId)}`,
      href: `/authority/claim/${g.claimRef}`,
    }));
}

/** Everyone any part of the presentation needs, for when no part is on. */
export const PRESENTATION_CAST: PersonaId[] = [...new Set(PRESENTATION_PARTS.flatMap((p) => p.cast))];

/**
 * One chip in the Presentation panel's "Driving as" row: a person to drive
 * as, or — for somebody invited who has not joined yet — the invitation
 * link they would open, since there is nobody yet to drive as. With neither,
 * the person is not invited yet and the chip is shown but not pressable.
 */
export interface CastChip {
  key: string;
  name: string;
  /** Their role, shown under the name so the room knows who they are. */
  role: string;
  persona?: string;
  href?: string;
  /** For someone not invited yet: the address the story invites them at. */
  inviteAt?: string;
}

/**
 * The people for the row, in the part's order. Somebody who has not joined
 * yet is offered by their invitation, so Ugyen is reachable the moment
 * Dorji invites him at his planned address, and as himself once he has
 * accepted. Nobody outside the plan is listed; whoever is being driven as
 * now is, so the row always shows them.
 */
export function castOnStage(
  s: Pick<DemoState, "people" | "orgInvitations">,
  ids: readonly PersonaId[],
  current: string,
  /** Who the part starts as. The early parts drive as Dorji before his
   *  account record exists — it is the one being made — so he is drivable
   *  regardless, and so is whoever is being driven as now. */
  lead?: PersonaId | null,
): CastChip[] {
  const chips: CastChip[] = [];
  const seen = new Set<string>();
  const add = (c: CastChip) => {
    if (seen.has(c.key)) return;
    seen.add(c.key);
    chips.push(c);
  };
  const hasAccount = (p: { id: string; hasAccount?: boolean }) => p.hasAccount !== false || p.id === current || p.id === lead;
  const open = s.orgInvitations.filter((i) => i.kind === "M" && i.state === "PENDING");
  const inviteFor = (email: string) => open.find((i) => i.email.toLowerCase() === email.toLowerCase());

  for (const id of ids) {
    const p = s.people.find((x) => x.id === id);
    if (!p) continue;
    if (hasAccount(p)) {
      add({ key: p.id, name: p.name, role: p.title, persona: p.id });
      continue;
    }
    const inv = inviteFor(p.email);
    if (inv) add({ key: inv.id, name: p.name, role: p.title, href: `/invitation/${inv.id}` });
    /* Not invited yet: shown, but not pressable, so the presenter knows
       who is coming — and the address to invite them at, since only that
       address makes the invitation theirs. Anything else is somebody new. */
    else add({ key: p.id, name: p.name, role: p.title, inviteAt: p.email });
  }
  /* Only the planned people: an invitation to any other address is a new
     person the story doesn't have, and is not offered here. */
  const now = s.people.find((x) => x.id === current);
  if (now && hasAccount(now)) add({ key: now.id, name: now.name, role: now.title, persona: now.id });
  return chips;
}
