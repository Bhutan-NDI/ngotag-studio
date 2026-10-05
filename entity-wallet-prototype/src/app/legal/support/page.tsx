import { LegalPage } from "@/features/legal/LegalPage";
import { SUPPORT_SECTIONS } from "@/features/legal/legalContent";

export const metadata = { title: "Support — NDI Studio" };

export default function SupportPage() {
  return (
    <LegalPage
      title="Support"
      intro="What product support covers, what goes to the marketplace instead, and what to put in a request so it can be answered first time."
      sections={SUPPORT_SECTIONS}
      current="/legal/support"
    />
  );
}
