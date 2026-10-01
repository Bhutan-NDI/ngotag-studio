import { SchemaDetailView } from "@/features/schemas/SchemaDetailView";

export const metadata = { title: "Schema — NDI Studio" };

export default async function SchemaDetailPage({
  params,
}: {
  params: Promise<{ schemaId: string }>;
}) {
  const { schemaId } = await params;
  return <SchemaDetailView schemaId={decodeURIComponent(schemaId)} />;
}
