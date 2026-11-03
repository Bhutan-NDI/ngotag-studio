import type { Metadata } from "next";

import { AuthorityView } from "@/features/authority/AuthorityView";

/* Flow 8 — SCR-AUT-01. */
export const metadata: Metadata = { title: "Authority — NDI Studio" };

export default function Page() {
  return <AuthorityView />;
}
