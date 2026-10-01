import { Suspense } from "react";

import { VerifyAttributesStepView } from "@/features/verification/VerifyAttributesStepView";

export const metadata = { title: "Select attributes — NDI Studio" };

/* The wizard carries its draft in the query string, so every step reads
   useSearchParams and needs a Suspense boundary to stay statically rendered. */
export default function Page() {
  return (
    <Suspense>
      <VerifyAttributesStepView
        deliver={[{ label: "Send by email", href: "/verification/verify-credentials/email/schemas/attributes/verification-email", icon: "mail" }]}
        back="/verification/verify-credentials/email/schemas"
        crumbs={[{ label: "Verification", href: "/verification" }, { label: "Request proof", href: "/verification/verify-credentials" }, { label: "Email", href: "/verification/verify-credentials/email/schemas" }, { label: "Attributes" }]}
      />
    </Suspense>
  );
}
