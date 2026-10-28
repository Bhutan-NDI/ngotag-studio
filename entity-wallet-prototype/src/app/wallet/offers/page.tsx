/* The old offers inbox (B4) is retired. An offer sent without a request is
   reviewed on SCR-CRD-04, the same screen a requested one uses (FLOW-CRD-02
   step 4), and listed under *Waiting for you* on SCR-CRD-03. The address is
   kept for links saved before then. */
import { redirect } from "next/navigation";

export default function OffersRedirectPage(): never {
  redirect("/wallet/requests");
}
