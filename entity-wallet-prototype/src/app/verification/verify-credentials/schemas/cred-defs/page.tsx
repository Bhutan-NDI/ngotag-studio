import { Suspense } from "react";

import { VerifyCredDefStepView } from "@/features/verification/VerifyCredDefStepView";

export const metadata = { title: "Select a definition — NDI Studio" };

/* The wizard carries its draft in the query string, so every step reads
   useSearchParams and needs a Suspense boundary to stay statically rendered. */
export default function Page() {
  return (
    <Suspense>
      <VerifyCredDefStepView
        next="/verification/verify-credentials/schemas/cred-defs/connections"
        skip="/verification/verify-credentials/schemas/connections"
        back="/verification/verify-credentials/schemas"
        crumbs={[{ label: "Verification", href: "/verification" }, { label: "Request proof", href: "/verification/verify-credentials" }, { label: "Connection", href: "/verification/verify-credentials/schemas" }, { label: "Definition" }]}
      />
    </Suspense>
  );
}
