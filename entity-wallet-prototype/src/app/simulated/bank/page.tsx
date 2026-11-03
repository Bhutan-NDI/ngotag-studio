import type { Metadata } from "next";

import { BankSiteView } from "@/features/sharing/BankSiteView";

/* Titled as the bank, not the Studio: it stands in for someone else's website. */
export const metadata: Metadata = { title: "Open a business account — Bank of Bhutan (simulated)" };

export default function Page() {
  return <BankSiteView mode="start" />;
}
