import type { Metadata } from "next";

import { BankSiteView } from "@/features/sharing/BankSiteView";

export const metadata: Metadata = { title: "Your application — Bank of Bhutan (simulated)" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; state?: string; status?: string }>;
}) {
  const { session, state, status } = await searchParams;
  return <BankSiteView mode="return" session={session ?? null} state={state ?? null} status={status ?? null} />;
}
