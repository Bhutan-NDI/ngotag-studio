import { BulkHistoryDetailView } from "@/features/credentials/BulkHistoryDetailView";

export const metadata = { title: "Upload records — NDI Studio" };

export default async function BulkHistoryDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  return <BulkHistoryDetailView requestId={decodeURIComponent(requestId)} />;
}
