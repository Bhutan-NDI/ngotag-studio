import type { Metadata } from "next";

import { ApproveGrantView } from "@/features/authority/ApproveGrantView";

/* Flow 8 — SCR-AUT-06. */
export const metadata: Metadata = { title: "Approve authority — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ grantId: string }> }) {
  const { grantId } = await params;
  return <ApproveGrantView grantId={decodeURIComponent(grantId)} />;
}
