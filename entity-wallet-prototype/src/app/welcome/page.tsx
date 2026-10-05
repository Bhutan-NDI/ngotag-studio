import type { Metadata } from "next";

import { WelcomeView } from "@/features/account/WelcomeView";

export const metadata: Metadata = { title: "Your account — NDI Studio" };

export default function WelcomePage() {
  return <WelcomeView />;
}
