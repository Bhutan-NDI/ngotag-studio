import type { Metadata } from "next";

import { AppointView } from "@/features/appointment/AppointView";

export const metadata: Metadata = { title: "Appoint someone — NDI Studio" };

export default function Page() {
  return <AppointView />;
}
