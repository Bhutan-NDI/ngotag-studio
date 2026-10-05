import type { Metadata } from "next";

import { DelegatedAuthorityView } from "@/features/delegated/DelegatedAuthorityView";

export const metadata: Metadata = {
  title: "Delegated authority — NDI Studio",
};

export default function DelegatedAuthorityPage() {
  return <DelegatedAuthorityView />;
}
