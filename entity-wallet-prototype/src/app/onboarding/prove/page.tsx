import type { Metadata } from "next";

import { ProveIdentityView } from "@/features/onboarding/ProveIdentityView";

export const metadata: Metadata = { title: "Prove your identity — NDI Studio" };

export default function ProvePage() {
  return <ProveIdentityView />;
}
