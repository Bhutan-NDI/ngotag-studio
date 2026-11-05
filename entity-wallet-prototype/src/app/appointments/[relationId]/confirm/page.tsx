import type { Metadata } from "next";

import { ConfirmAppointmentView } from "@/features/appointment/ConfirmAppointmentView";

export const metadata: Metadata = { title: "Sign your acceptance — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ relationId: string }> }) {
  const { relationId } = await params;
  return <ConfirmAppointmentView relationId={decodeURIComponent(relationId)} />;
}
