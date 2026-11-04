import type { DemoState, OrgInvitation, Person } from "./demoData";

/**
 * The two emails the presentation opens in a simulated inbox: the sign-up
 * verification mail (FLOW-ONB-01 step 3) and a member invitation
 * (FLOW-ONB-02, Kind M). A message id is "verify" or the invitation's id.
 *
 * Whose inbox it is matters more than the mail: the room has to see that a
 * different person, on their own device, is the one opening it. So each
 * message names its mailbox — the person, when the story knows the address,
 * or a name made from the address when it does not.
 */
export interface Mailbox {
  name: string;
  address: string;
}

export type MailMessage =
  | { kind: "verify"; mailbox: Mailbox }
  | { kind: "invite"; mailbox: Mailbox; invitation: OrgInvitation; inviter: Person | undefined; orgName: string };

/** "sangay.choden@peldentrading.bt" → "Sangay Choden". */
export const nameFromAddress = (address: string) =>
  (address.split("@")[0] ?? address)
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || address;

export const mailboxOf = (address: string, people: Person[]): Mailbox => {
  const known = people.find((p) => p.email.toLowerCase() === address.trim().toLowerCase());
  return { name: known?.name ?? nameFromAddress(address), address: address.trim() };
};

export function findMail(
  s: Pick<DemoState, "signup" | "orgInvitations" | "people" | "organizations">,
  messageId: string,
): MailMessage | null {
  if (messageId === "verify") {
    if (!s.signup?.email) return null;
    return { kind: "verify", mailbox: mailboxOf(s.signup.email, s.people) };
  }
  const invitation = s.orgInvitations.find((i) => i.id === messageId && i.kind === "M");
  if (!invitation) return null;
  return {
    kind: "invite",
    mailbox: mailboxOf(invitation.email, s.people),
    invitation,
    inviter: s.people.find((p) => p.id === invitation.invitedBy),
    orgName: s.organizations.find((o) => o.id === invitation.orgId)?.name ?? "the organisation",
  };
}
