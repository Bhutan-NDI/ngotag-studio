import type { Metadata } from "next";

import { VerifierView } from "@/features/verifier/VerifierView";

export const metadata: Metadata = {
  /* Titled as the counterparty, not as the Studio. The browser tab is part of
     the illusion that this is somebody else's website — because it is. */
  title: "Customs declaration — Bhutan National Single Window",
};

export default function VerifierPage() {
  return <VerifierView />;
}
