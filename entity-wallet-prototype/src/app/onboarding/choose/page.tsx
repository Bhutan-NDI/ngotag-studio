import type { Metadata } from "next";

import { ChooseOrganisationView } from "@/features/onboarding/ChooseOrganisationView";

export const metadata: Metadata = { title: "Choose your organisation — NDI Studio" };

export default function ChooseOrganisationPage() {
  return <ChooseOrganisationView />;
}
