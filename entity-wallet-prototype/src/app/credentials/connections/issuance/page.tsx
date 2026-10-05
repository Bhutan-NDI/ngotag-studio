import { Suspense } from "react";

import { ConnectionIssuanceView } from "@/features/credentials/ConnectionIssuanceView";

export const metadata = { title: "Issue over a connection — NDI Studio" };

/* useSearchParams needs a Suspense boundary, or the whole route opts out of
   static rendering at build time. */
export default function ConnectionIssuancePage() {
  return (
    <Suspense>
      <ConnectionIssuanceView />
    </Suspense>
  );
}
