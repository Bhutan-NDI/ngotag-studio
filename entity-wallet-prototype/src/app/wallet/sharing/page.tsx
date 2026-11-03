import type { Metadata } from "next";

import { SharingView } from "@/features/sharing/SharingView";

export const metadata: Metadata = { title: "Sharing — NDI Studio" };

export default function Page() {
  return <SharingView />;
}
