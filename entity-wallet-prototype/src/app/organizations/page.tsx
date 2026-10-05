import type { Metadata } from "next";

import { OrganizationsView } from "@/features/organizations/OrganizationsView";

export const metadata: Metadata = {
  title: "Organizations — NDI Studio",
};

export default function OrganizationsPage() {
  return <OrganizationsView />;
}
