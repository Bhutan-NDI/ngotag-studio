import type { Metadata } from "next";

import { AppealsView } from "@/features/appeals/AppealsView";

export const metadata: Metadata = { title: "Appeals — NDI Studio" };

export default function AppealsPage() {
  return <AppealsView />;
}
