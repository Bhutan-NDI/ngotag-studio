import type { Metadata } from "next";

import { GrantView } from "@/features/authority/GrantView";

/* Flow 8 — SCR-AUT-04, and the read-only detail of any grant. */
export const metadata: Metadata = { title: "Authority — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ grantId: string }> }) {
  const { grantId } = await params;
  return <GrantView grantId={decodeURIComponent(grantId)} />;
}
