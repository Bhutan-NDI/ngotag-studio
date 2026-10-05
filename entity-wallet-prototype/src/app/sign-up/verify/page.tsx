import type { Metadata } from "next";

import { LinkOutcomeView } from "@/features/account/LinkOutcomeView";

export const metadata: Metadata = { title: "Confirming your email — NDI Studio" };

export default function VerifyPage() {
  return <LinkOutcomeView />;
}
