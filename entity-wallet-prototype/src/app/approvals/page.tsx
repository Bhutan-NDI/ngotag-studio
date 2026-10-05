import type { Metadata } from "next";

import { ApprovalsView } from "@/features/approvals/ApprovalsView";

export const metadata: Metadata = { title: "Approvals — NDI Studio" };

export default function ApprovalsPage() {
  return <ApprovalsView />;
}
