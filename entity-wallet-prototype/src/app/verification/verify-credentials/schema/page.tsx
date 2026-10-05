import { Suspense } from "react";

import { VerifySchemaStepView } from "@/features/verification/VerifySchemaStepView";

export const metadata = { title: "Select a credential — NDI Studio" };

/* The wizard carries its draft in the query string, so every step reads
   useSearchParams and needs a Suspense boundary to stay statically rendered. */
export default function Page() {
  return (
    <Suspense>
      <VerifySchemaStepView
        next="/verification/verify-credentials/schema/cred-defs"
        crumbs={[{ label: "Verification", href: "/verification" }, { label: "Request proof", href: "/verification/verify-credentials" }, { label: "QR code" }]}
      />
    </Suspense>
  );
}
