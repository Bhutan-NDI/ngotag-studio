import type { Metadata } from "next";

import { GiveFormView } from "@/features/authority/GiveFormView";

/* Flow 8 — SCR-AUT-02. */
export const metadata: Metadata = { title: "Give authority — NDI Studio" };

export default function Page() {
  return <GiveFormView />;
}
