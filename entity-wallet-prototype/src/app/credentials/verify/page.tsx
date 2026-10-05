/* Verification lives under /verification, matching the reference. This path is
   kept because the earlier build linked to it. */
import { redirect } from "next/navigation";

export default function VerifyRedirectPage(): never {
  redirect("/verification");
}
