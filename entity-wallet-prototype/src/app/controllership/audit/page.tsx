import type { Metadata } from "next";

import { AuditView } from "@/features/controllership/AuditView";

export const metadata: Metadata = { title: "Audit — NDI Studio" };

export default function AuditPage() {
  return <AuditView />;
}
