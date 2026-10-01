import type { Metadata } from "next";

import { SetPasswordView } from "@/features/account/SetPasswordView";

export const metadata: Metadata = { title: "Set your password — NDI Studio" };

export default function SetPasswordPage() {
  return <SetPasswordView />;
}
