import type { Metadata } from "next";

import { ReviewStatusView } from "@/features/onboarding/ReviewStatusView";

export const metadata: Metadata = { title: "Your review — NDI Studio" };

export default function ReviewStatusPage() {
  return <ReviewStatusView />;
}
