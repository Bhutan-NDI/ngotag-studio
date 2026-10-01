import type { Metadata } from "next";

import { ManualReviewsView } from "@/features/admin/ManualReviewsView";

export const metadata: Metadata = { title: "Manual review — NDI administration" };

export default function ManualReviewsPage() {
  return <ManualReviewsView />;
}
