import type { Metadata } from "next";

import { InviteView } from "@/features/invitations/InviteView";

export const metadata: Metadata = { title: "Invite someone — NDI Studio" };

export default function InviteMemberPage() {
  return <InviteView kind="M" />;
}
