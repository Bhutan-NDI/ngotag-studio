import type { Metadata } from "next";

import { OpeningRequestView } from "@/features/sharing/OpeningRequestView";

/* FLOW-PRS-01's presentation address (§7.2): Studio `/present?session=<ref>`.
   The session reference is all the browser carries (EW-FLOW7-SD/D10). */
export const metadata: Metadata = { title: "NDI Entity Wallet" };

export default async function Page({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session } = await searchParams;
  return <OpeningRequestView sessionId={session ?? null} />;
}
