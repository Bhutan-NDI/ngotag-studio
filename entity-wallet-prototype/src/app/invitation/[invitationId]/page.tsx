import type { Metadata } from "next";

import { ReviewInvitationView } from "@/features/invitations/ReviewInvitationView";

export const metadata: Metadata = { title: "Your invitation — NDI Studio" };

export default async function InvitationPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await params;
  return <ReviewInvitationView id={invitationId} />;
}
