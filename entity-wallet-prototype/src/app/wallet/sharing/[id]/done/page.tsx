import type { Metadata } from "next";

import { SharedOutcomeView } from "@/features/sharing/SharedOutcomeView";

export const metadata: Metadata = { title: "Shared — NDI Studio" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ why?: string }>;
}) {
  const { id } = await params;
  const { why } = await searchParams;
  return <SharedOutcomeView requestId={decodeURIComponent(id)} why={why ?? null} />;
}
