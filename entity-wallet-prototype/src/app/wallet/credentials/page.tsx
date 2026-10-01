import type { Metadata } from "next";

import { HeldCredentialsView } from "@/features/wallet/HeldCredentialsView";

export const metadata: Metadata = { title: "Held credentials — NDI Studio" };

export default function HeldCredentialsPage() {
  return <HeldCredentialsView />;
}
