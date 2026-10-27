import type { ApprovalPolicy, ControllershipRelation, Organization, PresetId, Scope, ScopeGrant, ShareReach } from "@/lib/demoData";

/**
 * The four presets a representative ticks on SCR-DEL-02, in any combination
 * (EW-FLOW3-SD §4.2, D18 amending D8; UX-EW-01 UXD-58 amending UXD-22).
 *
 * WHY TICK-BOXES, AND STILL NO CUSTOM OPTION
 *
 * A single choice forced over-granting for the commonest real roles. An
 * accountant who collects certificates and sends them on needs *Receive*
 * and *Share*, and the only preset holding both was *Everything*, which
 * also made them an approver. So the presets combine. They still replace a
 * matrix of operations, not sit in front of one: four boxes, each a sentence
 * a representative can say back (UC-20), and no way to author scope.
 *
 * THERE IS NO *EVERYTHING*
 *
 * What it granted is *Receive*, *Share* to any organisation and *Approve*
 * ticked together. Ticking all four also gives *Give authority to act*,
 * which *Everything* never did — and still does not make a deputy, because
 * appointing is the representative's position, not an operation (§4.2).
 *
 * WHAT IT DOESN'T ALLOW IS COMPUTED
 *
 * Each preset's own limits contradict the others' — *Receive* can't share,
 * *Share* can't receive — so per-box "doesn't allow" lines would say false
 * things the moment two are ticked. The summary lists what is left
 * unticked, then two lines that are always true (UX-EW-01 SCR-DEL-02).
 *
 * The scope the presets resolve to is internal: it is what the console
 * checks against, and it never appears on a screen.
 */
export interface Preset {
  id: PresetId;
  /** The preset's own label, which the user does see (UX-EW-01 §2.4). */
  label: string;
  /** What ticking it allows, as the box says it. */
  allows: string;
}

export const PRESETS: Preset[] = [
  {
    id: "receive",
    label: "Receive credentials",
    allows: "Receive credentials offered to the organisation, accept them, and see what it holds.",
  },
  {
    id: "share",
    label: "Share credentials",
    allows: "See what the organisation holds and share it when an organisation asks — with the organisations you name, or with any.",
  },
  {
    id: "approve",
    label: "Approve others' actions",
    allows: "Approve or refuse what others ask to do for the organisation — never their own.",
  },
  {
    id: "give_authority",
    label: "Give authority to act",
    allows: "Give someone authority to act for the organisation in their own wallet, such as a clearing agent.",
  },
];

/** The order the boxes are shown in, so any set reads back the same way. */
const ORDER: PresetId[] = PRESETS.map((p) => p.id);

export const presetOf = (id: PresetId) => PRESETS.find((p) => p.id === id);

/**
 * Who *Share* may name: organisations holding an ACTIVE source of the
 * VERIFIER capability (EW-FLOW3-SD v0.3 §4.2; EW-FLOW4-SD §2.3) — an
 * approval to verify, a foundational designation, or the bootstrap grant.
 * The console records any of those as the organisation's `verifier`
 * capability, so that is what is read.
 *
 * Not the Trust Registry, and not a fixed list: a registry entry is per
 * identity and stays current when an organisation stops verifying or only
 * issues, so it can't say who may be shared with. The list grows as NDI
 * approves verifiers, and E12 refuses anyone not on it.
 */
export function shareTargets(organizations: Pick<Organization, "id" | "name" | "capabilities">[], exceptOrgId?: string): string[] {
  return organizations.filter((o) => o.id !== exceptOrgId && o.capabilities.includes("verifier")).map((o) => o.name);
}

/**
 * The presets a relation was made from. An appointment saved before presets
 * combined carries one id instead; *Everything* reads back as what it
 * granted. The story's older relations, authored operation by operation,
 * have none.
 */
export function presetsOf(r: Pick<ControllershipRelation, "presets" | "preset"> | undefined): PresetId[] {
  if (!r) return [];
  if (r.presets?.length) return [...r.presets].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  if (r.preset === "everything") return ["receive", "share", "approve"];
  if (r.preset === "receive" || r.preset === "share" || r.preset === "approve") return [r.preset];
  return [];
}

/** Who a relation may share with: the names, or null for any organisation (or no Share). */
export function shareTargetsOf(r: Pick<ControllershipRelation, "scope">): string[] | null {
  const present = r.scope.grants.find((g) => g.operation === "proof:present");
  if (!present || present.relyingParties.mode !== "list") return null;
  return present.relyingParties.values;
}

export interface Choice {
  presets: PresetId[];
  shareReach: ShareReach;
  shareWith: string[];
  shareNeedsApproval: boolean;
  issueNeedsApproval: boolean;
}

const any = { mode: "any" } as const;

/**
 * EW-FLOW3-SD §4.2's table, as the one scope the console checks. The union
 * of the ticked presets' operations; `credential:list`, in all four, once.
 * Each operation keeps its own preset's filter and approval, so *Share*'s
 * reach applies to presenting only, and the two approval settings to
 * presenting and to giving authority.
 */
export function scopeFor(choice: Choice, validFrom: string, validUntil: string | null): Scope {
  const g = (operation: ScopeGrant["operation"], approval: ApprovalPolicy = "AUTO", rp: ScopeGrant["relyingParties"] = any): ScopeGrant => ({
    operation,
    credentialTypes: any,
    relyingParties: rp,
    approval,
  });
  const on = (id: PresetId) => choice.presets.includes(id);
  const reach: ScopeGrant["relyingParties"] =
    choice.shareReach === "named" ? { mode: "list", values: choice.shareWith } : any;
  const grants: ScopeGrant[] = [];
  if (on("receive")) grants.push(g("credential:receive"), g("credential:accept"));
  grants.push(g("credential:list"));
  if (on("share")) {
    grants.push(g("proof:present", choice.shareNeedsApproval ? "SINGLE_APPROVER" : "AUTO", reach));
    /* The reach is presenting's alone (§4.2): it limits whom credentials go
       to, and opening a connection sends nothing. The connection itself is
       open to any organisation, as the specification's table has it. */
    grants.push(g("connection:create"));
  }
  if (on("approve")) grants.push(g("approval:decide"));
  if (on("give_authority")) grants.push(g("authority:issue", choice.issueNeedsApproval ? "SINGLE_APPROVER" : "AUTO"));
  return { version: 1, validFrom, validUntil, grants };
}

const join = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

/**
 * What a set of presets lets someone do, said back in the person's words.
 *
 * `sentence` is UC-20's one-line read-back — "Ugyen can receive credentials
 * and share them with Bank of Bhutan. Ugyen can't approve anything or give
 * authority to act." `allows` and `wont` are the same thing as lists, for
 * the screens that set them out line by line; `wont` always ends with the
 * two lines no combination changes.
 */
export function describeGrant(
  presets: PresetId[],
  opts: { name: string; orgName: string; shareWith: string[] | null },
): { label: string; allows: string[]; wont: string[]; sentence: string } {
  const on = (id: PresetId) => presets.includes(id);
  /* null is the "any" reach. An empty list is a named reach with nobody
     named yet (E12 is showing), which must not read as "any". */
  const shareClause =
    opts.shareWith === null
      ? "with any organisation that asks"
      : opts.shareWith.length
        ? `with ${join(opts.shareWith)}`
        : "with the organisations named";

  const can: string[] = [];
  const allows: string[] = [];
  if (on("receive")) {
    can.push("receive credentials");
    allows.push(`Receive credentials offered to ${opts.orgName}, accept them, and see what it holds`);
  }
  if (on("share")) {
    can.push(`share ${on("receive") ? "them" : "credentials"} ${shareClause}`);
    allows.push(`See what ${opts.orgName} holds, and share it ${shareClause}`);
  }
  if (on("approve")) {
    can.push("approve what others do");
    allows.push(`Approve or refuse what others ask to do for ${opts.orgName} — never their own`);
  }
  if (on("give_authority")) {
    can.push("give someone authority to act");
    allows.push(`Give someone authority to act for ${opts.orgName} in their own wallet`);
  }

  const cannot: string[] = [];
  const wont: string[] = [];
  if (!on("receive")) {
    cannot.push("receive credentials");
    wont.push(`Receive or accept credentials for ${opts.orgName}`);
  }
  if (!on("share")) {
    cannot.push("share anything");
    wont.push(`Share anything ${opts.orgName} holds`);
  }
  if (!on("approve")) {
    cannot.push("approve anything");
    wont.push("Approve anyone's actions");
  }
  if (!on("give_authority")) {
    cannot.push("give authority to act");
    wont.push("Give anyone authority to act");
  }
  wont.push("Appoint anyone else — only the representative can", `Take ${opts.orgName}'s credentials off the platform`);

  const sentence =
    `${opts.name} can ${join(can)}.` + (cannot.length ? ` ${opts.name} can't ${join(cannot).replace(/ and (?=[^,]*$)/, " or ")}.` : "");
  const label = presets.map((id) => presetOf(id)?.label ?? id).join(" · ");
  return { label, allows, wont, sentence };
}
