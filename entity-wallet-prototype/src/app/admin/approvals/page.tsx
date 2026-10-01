import type { Metadata } from "next";

import { AdminApprovalsView } from "@/features/admin/AdminApprovalsView";

export const metadata: Metadata = { title: "Approvals — NDI administration" };

export default function AdminApprovalsPage() {
  return <AdminApprovalsView />;
}
