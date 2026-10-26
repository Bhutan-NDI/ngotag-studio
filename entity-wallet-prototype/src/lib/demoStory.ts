import type { PersonaId } from "./demoData";

/**
 * The Gate 2 flows, as jumps in the demo controls.
 *
 * The guided demo is the story told to someone new to the idea; Gate 2 is a
 * review of Flows 1 and 2 against their specs, by people who already know
 * it and want to walk one flow end to end. So each flow is a jump, with the
 * persona that starts it.
 *
 * `persona: null` is a flow that starts before anyone is signed in.
 *
 * TWO WAYS ONTO THE PLATFORM
 *
 * An organisation arrives one of two ways, and which one is a deployment
 * setting (FLOW-ONB-01 P3): with self-service sign-up on, its representative
 * signs up and adds it; with it off, an NDI administrator invites it
 * (FLOW-ONB-02 Kind O, no second approval for an ordinary business). Both
 * end in the same Flow 2 check against the register. `selfService` is the
 * setting the entry needs, applied when it is chosen, so neither route can
 * be started in a deployment where it would not exist.
 */
export type FlowGroup = "root" | "admin" | "company" | "members" | "appoint" | "accredit" | "designate" | "receive" | "share" | "authority" | "act";

/**
 * The flows the demo controls offer — the onboardings the prototype is
 * scoped to, in the order they have to happen.
 *
 * WHY ONLY THESE
 *
 * The controls used to carry a six-act story runner and jumps into every
 * flow anyone had asked for: Bank of Bhutan's wallet, NDI inviting a
 * business, manual review. The current focus is onboarding — root, platform
 * admins, a new company, and the people that company then brings on — so
 * the panel offers exactly those, and nobody has to work out which of a
 * dozen buttons is under review. The other screens still exist; the
 * controls no longer point at them.
 *
 * Member onboarding came back once the first day stopped listing the seed's
 * colleagues: with Pelden starting as one person, how everyone else joins is
 * a question the demo has to answer on screen.
 *
 * Flow 4's two doors start from the team-ready state: a platform admin
 * exists to propose and review, a second named admin to approve, Pelden is
 * verified with Dorji as its representative, and Bank of Bhutan has been
 * verifying without an approval.
 *
 * Flow 5 starts from the platform-ready state — two admins, no business —
 * because designating an authority comes before anyone can verify with it:
 * it is what lets sole proprietorships on at all.
 *
 * Flow 6 starts from the team-ready state, where Pelden is verified with
 * Dorji as its representative: a business needs a registration to share
 * before it can ask for anything. The tax office's side is reached from
 * the request, by switching to Deki — its queue is empty until Pelden asks.
 *
 * Flow 7 has two entries. Sharing from the bank's website starts from the
 * team-ready state: Pelden verified, Dorji its representative, and the bank
 * able to verify. The approval path starts three months on, where Rinzin
 * is appointed with *Share* to the bank and needs an approver — the state
 * the onboarding story never reaches.
 *
 * Flow 8 has three. The representative giving a clearing agent authority
 * starts from the team-ready state, so the organisation's first grant goes
 * through being added to NDI's list (A4) and the business licence comes
 * from a dashed step, as in the guide. The approval path starts three
 * months on, where Rinzin holds *Give authority to act* and needs an
 * approver (Journey T). Collecting from a link opens the seeded link for
 * Kinley Wangdi, three months on, with nobody signed in — the delegate has
 * no account (D10).
 *
 * Flow 9 has two, both three months on, where Pelden registered with the
 * Single Window after its first grant and Pema holds its authority. A
 * clearing agent acting for Pelden starts on BNSW's simulated site with
 * nobody signed in to it — BNSW's sign-in is its own, not the Studio's, so
 * there is no persona. Registering again starts on BNSW's registration page
 * as Dorji, who shares from the Entity Wallet (Journey W's second half).
 */
export const FLOW_GROUPS: { id: FlowGroup; code: string; title: string }[] = [
  { id: "root", code: "FLOW-ONB-02", title: "Root admin onboarding" },
  { id: "admin", code: "FLOW-ONB-02", title: "Platform admin onboarding" },
  { id: "company", code: "FLOW-ONB-01 · Flow 2", title: "New company onboarding" },
  { id: "members", code: "FLOW-ONB-02 · Kind M", title: "Member onboarding" },
  { id: "appoint", code: "Flow 3", title: "Appointing someone to act" },
  { id: "accredit", code: "Flow 4", title: "Approval to verify or issue" },
  { id: "designate", code: "Flow 5", title: "Designating an authority" },
  { id: "receive", code: "Flow 6", title: "Receiving a credential" },
  { id: "share", code: "Flow 7", title: "Presenting a credential" },
  { id: "authority", code: "Flow 8", title: "Giving authority to act" },
  { id: "act", code: "Flow 9", title: "Acting for a company at BNSW" },
];

export interface FlowEntry {
  group: FlowGroup;
  label: string;
  persona: PersonaId | null;
  route: string;
  selfService?: boolean;
  /**
   * Where it starts, so a jump never lands on whatever half-state the last
   * demo left behind:
   *
   * - `dayZero` — the platform before any admin or business.
   * - `platformReady` — two platform admins set up, no business yet: where a
   *   company comes on, and where an authority is designated.
   * - `firstDay` — Pelden registered a moment ago, Dorji its only member.
   * - `teamReady` — the first day, with Ugyen joined and no authority
   *   yet: where appointing starts, and Flow 8's first grant.
   * - `livedIn` — the story three months in, for the acts beyond onboarding.
   */
  start: "dayZero" | "platformReady" | "firstDay" | "teamReady" | "livedIn";
}

export const FLOW_ENTRIES: FlowEntry[] = [
  { group: "root", label: "Root signs in", persona: null, route: "/sign-in", start: "dayZero" },
  { group: "admin", label: "Root invites a platform admin", persona: "root", route: "/admin/team", start: "dayZero" },
  { group: "company", label: "Create an account", persona: null, route: "/sign-up", selfService: true, start: "platformReady" },
  {
    group: "company",
    label: "Register the company",
    persona: "dorji",
    route: "/onboarding",
    selfService: true,
    start: "platformReady",
  },
  { group: "members", label: "Invite a member", persona: "dorji", route: "/members", start: "firstDay" },
  { group: "appoint", label: "Appoint someone", persona: "dorji", route: "/people-who-can-act/give", start: "teamReady" },
  { group: "accredit", label: "Recognise an organisation already verifying", persona: "tshering", route: "/admin/accreditations", start: "teamReady" },
  { group: "accredit", label: "A business asks to verify", persona: "dorji", route: "/organisation", start: "teamReady" },
  { group: "designate", label: "Designate the ministry for sole proprietorships", persona: "tshering", route: "/admin/designations", start: "platformReady" },
  { group: "receive", label: "Pelden asks for its TPN", persona: "dorji", route: "/wallet/get", start: "teamReady" },
  { group: "share", label: "Share from Bank of Bhutan's website", persona: "dorji", route: "/simulated/bank", start: "teamReady" },
  { group: "share", label: "A controller shares, the owner approves", persona: "rinzin", route: "/wallet/sharing", start: "livedIn" },
  { group: "authority", label: "The owner gives a clearing agent authority", persona: "dorji", route: "/authority-to-act", start: "teamReady" },
  { group: "authority", label: "A controller gives authority, the owner approves", persona: "rinzin", route: "/authority-to-act/give", start: "livedIn" },
  { group: "authority", label: "Collect authority from a link", persona: null, route: "/authority/claim/c7Qm2xVb9TkPa4Lw", start: "livedIn" },
  { group: "act", label: "A clearing agent declares for Pelden", persona: null, route: "/simulated/bnsw", start: "livedIn" },
  { group: "act", label: "Pelden registers with BNSW again", persona: "dorji", route: "/simulated/bnsw/register", start: "livedIn" },
];
