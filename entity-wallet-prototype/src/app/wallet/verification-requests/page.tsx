/* The pre-spec "Verification requests" list is Sharing now (UX-EW-04
   SCR-PRS-05). The old address is kept so a bookmark still lands. */
import { redirect } from "next/navigation";

export default function VerificationRequestsRedirect(): never {
  redirect("/wallet/sharing");
}
