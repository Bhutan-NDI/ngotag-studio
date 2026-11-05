import type { Metadata } from "next";

import { AccountConfirmIdentityView } from "@/features/account/ConfirmIdentityView";

export const metadata: Metadata = { title: "Confirm your identity — NDI Studio" };

export default function AccountConfirmIdentityPage() {
  return <AccountConfirmIdentityView />;
}
