import type { Metadata } from "next";

import { EntityProfileView } from "@/features/controllership/EntityProfileView";

export const metadata: Metadata = { title: "Entity — NDI Studio" };

export default function EntityPage() {
  return <EntityProfileView />;
}
