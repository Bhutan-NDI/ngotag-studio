import { OutcomeView } from "@/features/marketplace/OutcomeView";

export const metadata = { title: "Subscription activated — NDI Studio" };

export default function OnboardingSuccessPage() {
  return (
    <OutcomeView
      tone="success"
      icon="check"
      title="Your subscription is active"
      lead="The organization has a wallet and you are its owner. Anchor a DID, define a schema, and you can issue."
      primary={{ label: "Go to the dashboard", href: "/dashboard" }}
      secondary={{ label: "Set up the wallet", href: "/wallet-setup" }}
    />
  );
}
