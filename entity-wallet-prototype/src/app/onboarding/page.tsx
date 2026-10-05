import type { Metadata } from "next";

import { OrgKindView } from "@/features/onboarding/OrgKindView";

export const metadata: Metadata = { title: "Add an organisation — NDI Studio" };

export default function OnboardingPage() {
  return <OrgKindView />;
}
