import type { Metadata } from "next";

import { WhatsRealView } from "@/features/demo/WhatsRealView";

export const metadata: Metadata = {
  title: "What's real vs simulated — NDI Studio",
};

export default function WhatsRealPage() {
  return <WhatsRealView />;
}
