import type { Metadata } from "next";

import { EcosystemsView } from "@/features/ecosystems/EcosystemsView";

export const metadata: Metadata = {
  title: "Ecosystems — NDI Studio",
};

export default function EcosystemsPage() {
  return <EcosystemsView />;
}
