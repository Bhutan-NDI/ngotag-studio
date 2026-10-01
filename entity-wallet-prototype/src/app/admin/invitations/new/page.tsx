import type { Metadata } from "next";

import { InviteView } from "@/features/invitations/InviteView";

export const metadata: Metadata = { title: "Bring an organisation on — NDI administration" };

export default function AdminInviteOrganisationPage() {
  return <InviteView kind="O" />;
}
