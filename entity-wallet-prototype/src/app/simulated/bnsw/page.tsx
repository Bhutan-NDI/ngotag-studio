import type { Metadata } from "next";

import { ActForCompanyView } from "@/features/bnsw/ActForCompanyView";

/* Titled as the Single Window, not the Studio: it stands in for another
   organisation's website (UX-EW-06 SCR-AUT-07 is BNSW's screen). */
export const metadata: Metadata = { title: "Customs declarations — Bhutan National Single Window (simulated)" };

export default function Page() {
  return <ActForCompanyView />;
}
