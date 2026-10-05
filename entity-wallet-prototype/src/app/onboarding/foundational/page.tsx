import type { Metadata } from "next";

import { FoundationalCredentialView } from "@/features/onboarding/FoundationalCredentialView";

export const metadata: Metadata = { title: "Entity verified — NDI Studio" };

export default function FoundationalPage() {
  return <FoundationalCredentialView />;
}
