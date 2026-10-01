import type { Metadata } from "next";

import { LinkOutcomeView } from "@/features/account/LinkOutcomeView";

/* The route the earlier sign-up flow sent people to. It renders the link
   outcome now rather than a success page that congratulated an address
   nothing had checked — anyone holding an old link lands somewhere true. */
export const metadata: Metadata = { title: "Confirming your email — NDI Studio" };

export default function VerifyEmailSuccessPage() {
  return <LinkOutcomeView />;
}
