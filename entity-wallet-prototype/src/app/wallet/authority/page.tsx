import type { Metadata } from "next";

import { MyAuthorityView } from "@/features/controllership/MyAuthorityView";

export const metadata: Metadata = {
  title: "My authority — NDI Studio",
};

export default function MyAuthorityPage() {
  return <MyAuthorityView />;
}
