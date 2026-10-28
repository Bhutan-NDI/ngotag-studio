import type { Metadata } from "next";

import { ReturnAddressesView } from "@/features/sharing/ReturnAddressesView";

export const metadata: Metadata = { title: "Return addresses — NDI Studio" };

export default function Page() {
  return <ReturnAddressesView />;
}
