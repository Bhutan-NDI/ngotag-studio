import { LegalPage } from "@/features/legal/LegalPage";
import { TERMS_SECTIONS } from "@/features/legal/legalContent";

export const metadata = { title: "Terms of use — NDI Studio" };

export default function TermsOfUsePage() {
  return (
    <LegalPage
      title="Terms of use"
      intro="The terms a subscription runs under: what the operator provides, what the customer is responsible for, and what happens when either side stops."
      sections={TERMS_SECTIONS}
      current="/legal/terms-of-use"
    />
  );
}
