import { LegalPage } from "@/features/legal/LegalPage";
import { PRIVACY_SECTIONS } from "@/features/legal/legalContent";

export const metadata = { title: "Privacy policy — NDI Studio" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="What the Studio collects while you issue and verify credentials, what happens to it, and what you can ask us to do with it."
      sections={PRIVACY_SECTIONS}
      current="/legal/privacy-policy"
    />
  );
}
