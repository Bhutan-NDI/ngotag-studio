import type { Metadata } from "next";

import { ResetPasswordView } from "@/features/auth/ResetPasswordView";

export const metadata: Metadata = { title: "Reset password — NDI Studio" };

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
