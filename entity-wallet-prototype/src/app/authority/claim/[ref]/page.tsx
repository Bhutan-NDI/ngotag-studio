import type { Metadata } from "next";

import { CollectView } from "@/features/authority/CollectView";

/* Flow 8 — SCR-AUT-05, outside Studio sign-in. FLOW-AUT-01 §7.2 puts the
   claim reference in the path, never the query, with no referrer: the
   reference is a bearer token, and a referrer would hand it to whatever
   the page links to. */
export const metadata: Metadata = { title: "Collect your authority — NDI Entity Wallet", referrer: "no-referrer" };

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <CollectView claimRef={decodeURIComponent(ref)} />;
}
