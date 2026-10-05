import type { Metadata } from "next";

import { AuthFlow } from "@/features/auth/AuthFlow";

export const metadata: Metadata = { title: "Sign in — NDI Studio" };

export default function SignInPage() {
  return <AuthFlow start="login" />;
}
