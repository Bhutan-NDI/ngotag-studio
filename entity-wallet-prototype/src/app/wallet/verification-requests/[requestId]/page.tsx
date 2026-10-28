/* The pre-spec request screen chose attributes to disclose, which
   EW-FLOW7-SD/D4 rules out; its requests were replaced along with it, so
   an old link goes to Sharing rather than to a request that no longer
   exists. */
import { redirect } from "next/navigation";

export default function VerificationRequestRedirect(): never {
  redirect("/wallet/sharing");
}
