import { Suspense } from "react";

import { VerifyDeliveryView } from "@/features/verification/VerifyDeliveryView";

export const metadata = { title: "Send over a connection — NDI Studio" };

/* The wizard carries its draft in the query string, so every step reads
   useSearchParams and needs a Suspense boundary to stay statically rendered. */
export default function Page() {
  return (
    <Suspense>
      <VerifyDeliveryView
        mode="connection"
        back="/verification/verify-credentials/schemas"
        crumbs={[{ label: "Verification", href: "/verification" }, { label: "Request proof", href: "/verification/verify-credentials" }, { label: "Connection", href: "/verification/verify-credentials/schemas" }, { label: "Send" }]}
      />
    </Suspense>
  );
}
