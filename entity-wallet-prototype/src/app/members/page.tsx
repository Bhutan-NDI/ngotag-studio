import type { Metadata } from "next";

import { MembersView } from "@/features/invitations/MembersView";

export const metadata: Metadata = { title: "Members — NDI Studio" };

export default function MembersPage() {
  return <MembersView />;
}
