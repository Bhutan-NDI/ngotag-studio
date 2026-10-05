import type { Metadata } from "next";

import { VerificationRequestsView } from "@/features/wallet/VerificationRequestsView";

export const metadata: Metadata = { title: "Verification requests — NDI Studio" };

export default function VerificationRequestsPage() {
  return <VerificationRequestsView />;
}
