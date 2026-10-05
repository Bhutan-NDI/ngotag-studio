import type { Metadata } from "next";

import { KitchenSinkView } from "@/features/kitchenSink/KitchenSinkView";

export const metadata: Metadata = {
  title: "Kitchen sink — NDI Studio",
};

export default function KitchenSinkPage() {
  return <KitchenSinkView />;
}
