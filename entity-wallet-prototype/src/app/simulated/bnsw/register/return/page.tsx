import type { Metadata } from "next";

import { RegisterCompanyView } from "@/features/bnsw/RegisterCompanyView";

export const metadata: Metadata = { title: "Your registration — Bhutan National Single Window (simulated)" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; state?: string; status?: string }>;
}) {
  const { session, state, status } = await searchParams;
  return <RegisterCompanyView mode="return" session={session ?? null} state={state ?? null} status={status ?? null} />;
}
