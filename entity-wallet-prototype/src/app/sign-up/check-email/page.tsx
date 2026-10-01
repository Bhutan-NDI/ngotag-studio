import type { Metadata } from "next";

import { CheckEmailView } from "@/features/account/CheckEmailView";

export const metadata: Metadata = { title: "Check your email — NDI Studio" };

export default function CheckEmailPage() {
  return <CheckEmailView />;
}
