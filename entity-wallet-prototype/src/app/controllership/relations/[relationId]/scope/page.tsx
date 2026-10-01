import type { Metadata } from "next";

import { ScopeBuilderView } from "@/features/controllership/ScopeBuilderView";

export const metadata: Metadata = {
  title: "Scope — NDI Studio",
};

export default async function ScopePage({
  params,
}: {
  params: Promise<{ relationId: string }>;
}) {
  const { relationId } = await params;
  return <ScopeBuilderView relationId={decodeURIComponent(relationId)} />;
}
