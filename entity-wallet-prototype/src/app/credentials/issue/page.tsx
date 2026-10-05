import type { Metadata } from "next";

import { IssueMethodView } from "@/features/credentials/IssueMethodView";

export const metadata: Metadata = { title: "Issue credentials — NDI Studio" };

export default function IssuePage() {
  return <IssueMethodView />;
}
