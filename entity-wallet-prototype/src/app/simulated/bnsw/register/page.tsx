import type { Metadata } from "next";

import { RegisterCompanyView } from "@/features/bnsw/RegisterCompanyView";

export const metadata: Metadata = { title: "Register a company — Bhutan National Single Window (simulated)" };

export default function Page() {
  return <RegisterCompanyView mode="start" />;
}
