import type { Metadata } from "next";

import { AdminInvitationsView } from "@/features/admin/AdminInvitationsView";

export const metadata: Metadata = { title: "Organisation invitations — NDI administration" };

export default function AdminInvitationsPage() {
  return <AdminInvitationsView />;
}
