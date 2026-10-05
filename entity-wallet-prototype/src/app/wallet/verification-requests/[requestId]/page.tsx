import type { Metadata } from "next";

import { PresentProofView } from "@/features/wallet/PresentProofView";

export const metadata: Metadata = { title: "Present a proof — NDI Studio" };

export default async function PresentProofPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  return <PresentProofView requestId={decodeURIComponent(requestId)} />;
}
