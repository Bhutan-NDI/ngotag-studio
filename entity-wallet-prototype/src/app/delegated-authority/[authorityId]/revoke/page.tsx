import type { Metadata } from "next";

import { RevokeAuthorityView } from "@/features/delegated/RevokeAuthorityView";

export const metadata: Metadata = {
  title: "Withdraw authority — NDI Studio",
};

export default async function RevokeAuthorityPage({
  params,
}: {
  params: Promise<{ authorityId: string }>;
}) {
  const { authorityId } = await params;
  return <RevokeAuthorityView authorityId={decodeURIComponent(authorityId)} />;
}
