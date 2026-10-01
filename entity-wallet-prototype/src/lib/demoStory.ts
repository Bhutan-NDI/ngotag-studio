import type { PersonaId } from "./demoData";

/**
 * The six acts, as the story runner drives them.
 *
 * One entity, one grant, one delegation, one failure. This is the only place
 * the running order lives: the runner reads it, and so does anything that
 * wants to say "you are in act 3 of 6". Adding a screen to the demo does not
 * mean adding an act — an act is a thing the audience learns, and there are
 * six of those.
 *
 * `route` is the act's entry point, not its whole path. Act 2 walks four
 * screens; the runner only has to put you at the first one, because from
 * there the screens lead into each other the way they will in the real
 * product. A runner that clicked through every screen for you would be a
 * video, and a demo whose screens do not lead anywhere is worth finding out
 * about before the room does.
 */
export interface Act {
  number: number;
  /** What happens. Shown in the runner. */
  title: string;
  /** What the audience is meant to take away. The reason the act exists. */
  learns: string;
  /** Who the console is driven as. Switching mid-story is the point. */
  persona: PersonaId;
  route: string;
}

export const ACTS: Act[] = [
  {
    number: 1,
    title: "The entity becomes real",
    learns:
      "An organisation can hold credentials — and the platform never asserts its identity by itself. A government register confirms it.",
    persona: "dorji",
    route: "/onboarding",
  },
  {
    number: 2,
    title: "Authority is granted, narrowly",
    learns:
      "Authority is a scoped, legally-grounded relation that the controller has to accept. Not a role dropdown.",
    persona: "dorji",
    route: "/controllership/relations/new",
  },
  {
    number: 3,
    title: "The Controller works, under approval",
    learns:
      "Least disclosure by default, an approval gate that actually holds, and an audit trail that records both the entity and the person.",
    persona: "rinzin",
    route: "/dashboard",
  },
  {
    number: 4,
    title: "Authority is delegated to a person's wallet",
    learns:
      "The entity issues authority into someone's own wallet, carrying constraints any verifier can read.",
    persona: "dorji",
    route: "/delegated-authority/new",
  },
  {
    number: 5,
    title: "Authority is checked at the point of use",
    learns:
      "The same authority passes, then fails once a role above it is withdrawn — with the failing link named. This is why the system exists.",
    persona: "pema",
    route: "/verifier/bnsw",
  },
  {
    number: 6,
    title: "There is recourse",
    learns:
      "Revocation is not arbitrary power. It carries a reason, a reference and a way to appeal.",
    persona: "pema",
    route: "/appeals",
  },
];

export const actByNumber = (n: number): Act | undefined => ACTS.find((a) => a.number === n);

/**
 * The Gate 2 flows, as entry points beside the story rather than inside it.
 *
 * The six acts are the story told to someone new to the idea; Gate 2 is a
 * review of Flows 1 and 2 against their specs, by people who already know
 * it and want to walk one flow end to end. Folding the flows into the acts
 * would make act 1 twenty screens long for the first audience, and putting
 * them nowhere would leave the second audience typing URLs. So they sit in
 * the harness as jumps, each with the persona that starts it.
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
export interface FlowEntry {
  flow: 1 | 2;
  label: string;
  persona: PersonaId | null;
  route: string;
  selfService?: boolean;
}

export const FLOW_ENTRIES: FlowEntry[] = [
  { flow: 1, label: "Create an account", persona: null, route: "/sign-up", selfService: true },
  { flow: 1, label: "Invite a member", persona: "dorji", route: "/members/invite" },
  { flow: 1, label: "Invite an agency", persona: "tshering", route: "/admin/invitations/new" },
  { flow: 2, label: "Sign up and add it yourself", persona: "dorji", route: "/onboarding", selfService: true },
  {
    flow: 2,
    label: "Invited by NDI to register",
    persona: "tshering",
    route: "/admin/invitations/new",
    selfService: false,
  },
  { flow: 2, label: "Review a case at NDI", persona: "kinley", route: "/admin/reviews" },
];
