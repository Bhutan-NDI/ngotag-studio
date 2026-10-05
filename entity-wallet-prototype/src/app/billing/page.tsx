/* Billing lives under the organization, since that is what is billed. The
   bare /billing path is kept because the reference app links to it. */
import { redirect } from "next/navigation";

export default function BillingRedirectPage(): never {
  redirect("/organizations/billing");
}
