import { Suspense } from "react";

import { VerifyDeliveryView } from "@/features/verification/VerifyDeliveryView";

export const metadata = { title: "Send by email — NDI Studio" };

/* The wizard carries its draft in the query string, so every step reads
   useSearchParams and needs a Suspense boundary to stay statically rendered. */
export default function Page() {
  return (
    <Suspense>
      <VerifyDeliveryView
        mode="email"
        back="/verification/verify-credentials/schema/cred-defs/attributes"
        crumbs={[{ label: "Verification", href: "/verification" }, { label: "Request proof", href: "/verification/verify-credentials" }, { label: "QR code", href: "/verification/verify-credentials/schema" }, { label: "Send" }]}
      />
    </Suspense>
  );
}
