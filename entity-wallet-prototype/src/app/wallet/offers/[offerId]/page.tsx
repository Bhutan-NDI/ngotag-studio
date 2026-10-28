/* An offer's old page (B4). Its id is the inbox item's, which SCR-CRD-04
   opens at the same address as a request (FLOW-CRD-02 step 4). */
import { redirect } from "next/navigation";

export default async function OfferRedirectPage({ params }: { params: Promise<{ offerId: string }> }): Promise<never> {
  const { offerId } = await params;
  redirect(`/wallet/requests/${encodeURIComponent(decodeURIComponent(offerId))}`);
}
