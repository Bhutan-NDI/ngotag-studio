import type { Metadata } from "next";

import { CheckGiveView } from "@/features/authority/CheckGiveView";

/* Flow 8 — SCR-AUT-03. */
export const metadata: Metadata = { title: "Check and give — NDI Studio" };

export default function Page() {
  return <CheckGiveView />;
}
