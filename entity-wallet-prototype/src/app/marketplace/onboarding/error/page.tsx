import { OutcomeView } from "@/features/marketplace/OutcomeView";

export const metadata = { title: "Activation failed — NDI Studio" };

export default function OnboardingErrorPage() {
  return (
    <OutcomeView
      tone="error"
      icon="shieldAlert"
      title="We could not activate the subscription"
      lead="Nothing was charged and no organization was created. This usually means the subscription token had already been used or has expired."
      detail={
        <p className="m-0 font-mono text-[12px] text-faint">Reference: onb-4c71e0</p>
      }
      primary={{ label: "Try again", href: "/marketplace/onboarding" }}
      secondary={{ label: "Contact support", href: "/legal/support" }}
    />
  );
}
