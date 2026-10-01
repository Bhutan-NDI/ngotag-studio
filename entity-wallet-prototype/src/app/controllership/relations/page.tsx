import type { Metadata } from "next";

import { RelationsView } from "@/features/controllership/RelationsView";

export const metadata: Metadata = { title: "Controllerships — NDI Studio" };

export default function RelationsPage() {
  return <RelationsView />;
}
