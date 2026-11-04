import type { Metadata } from "next";

import { MailView } from "@/features/mail/MailView";

/* Titled as an inbox, not the Studio: it stands in for someone's email. */
export const metadata: Metadata = { title: "Inbox — Mail (simulated)" };

export default async function Page({ params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  return <MailView messageId={messageId} />;
}
