import type { Metadata } from "next";

import { ApproveShareView } from "@/features/sharing/ApproveShareView";

export const metadata: Metadata = { title: "Approve sharing — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApproveShareView requestId={decodeURIComponent(id)} />;
}
