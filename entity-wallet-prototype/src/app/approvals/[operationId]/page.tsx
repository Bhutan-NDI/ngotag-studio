import type { Metadata } from "next";

import { ApprovalDetailView } from "@/features/approvals/ApprovalDetailView";

export const metadata: Metadata = { title: "Approval — NDI Studio" };

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ operationId: string }>;
}) {
  const { operationId } = await params;
  return <ApprovalDetailView operationId={decodeURIComponent(operationId)} />;
}
