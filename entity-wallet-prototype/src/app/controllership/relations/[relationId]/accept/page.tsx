import type { Metadata } from "next";

import { AcceptDutiesView } from "@/features/controllership/AcceptDutiesView";

export const metadata: Metadata = {
  title: "Accept duties — NDI Studio",
};

export default async function AcceptPage({
  params,
}: {
  params: Promise<{ relationId: string }>;
}) {
  const { relationId } = await params;
  return <AcceptDutiesView relationId={decodeURIComponent(relationId)} />;
}
