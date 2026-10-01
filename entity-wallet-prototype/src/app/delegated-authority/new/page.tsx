import type { Metadata } from "next";

import { IssueAuthorityView } from "@/features/delegated/IssueAuthorityView";

export const metadata: Metadata = {
  title: "Issue authority — NDI Studio",
};

export default function IssueAuthorityPage() {
  return <IssueAuthorityView />;
}
