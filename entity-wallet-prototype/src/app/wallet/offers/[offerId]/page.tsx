import type { Metadata } from "next";

import { OfferDetailView } from "@/features/wallet/OfferDetailView";

export const metadata: Metadata = { title: "Credential offer — NDI Studio" };

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return <OfferDetailView offerId={decodeURIComponent(offerId)} />;
}
