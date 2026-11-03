import type { Metadata } from "next";

import { ShareRequestView } from "@/features/sharing/ShareRequestView";

export const metadata: Metadata = { title: "Share — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShareRequestView requestId={decodeURIComponent(id)} />;
}
