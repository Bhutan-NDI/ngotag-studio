import type { Metadata } from "next";

import { OffersView } from "@/features/wallet/OffersView";

export const metadata: Metadata = { title: "Credential offers — NDI Studio" };

export default function OffersPage() {
  return <OffersView />;
}
