import type { Metadata } from "next";

import { ConnectionsView } from "@/features/connections/ConnectionsView";

export const metadata: Metadata = {
  title: "Connections — NDI Studio",
};

export default function ConnectionsPage() {
  return <ConnectionsView />;
}
