import type { Metadata } from "next";

import { CreateRelationView } from "@/features/controllership/CreateRelationView";

export const metadata: Metadata = {
  title: "New controllership — NDI Studio",
};

export default function NewRelationPage() {
  return <CreateRelationView />;
}
