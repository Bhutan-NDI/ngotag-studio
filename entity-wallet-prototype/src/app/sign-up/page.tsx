import type { Metadata } from "next";

import { SignUpView } from "@/features/account/SignUpView";

export const metadata: Metadata = { title: "Create your account — NDI Studio" };

export default function SignUpPage() {
  return <SignUpView />;
}
