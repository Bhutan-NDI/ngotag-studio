import type { Metadata } from "next";

import { InvitationAcceptedView } from "@/features/invitations/InvitationAcceptedView";

export const metadata: Metadata = { title: "Invitation accepted — NDI Studio" };

export default async function InvitationAcceptedPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await params;
  return <InvitationAcceptedView id={invitationId} />;
}
