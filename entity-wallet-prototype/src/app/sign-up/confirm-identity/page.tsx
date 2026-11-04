import type { Metadata } from "next";

import { SignUpConfirmIdentityView } from "@/features/account/ConfirmIdentityView";

export const metadata: Metadata = { title: "Confirm it's you — NDI Studio" };

export default function SignUpConfirmIdentityPage() {
  return <SignUpConfirmIdentityView />;
}
