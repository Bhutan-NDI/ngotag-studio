"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDemo } from "@/lib/demoStore";

/**
 * The proof request being assembled, carried in the query string.
 *
 * The reference encodes each wizard step as its own path segment, so the steps
 * are separate pages rather than one stateful component — which means the
 * selections have to live somewhere a navigation survives. The query string is
 * the natural place: it makes any half-built request linkable and the back
 * button behave, where a context would reset on refresh.
 */
export interface ProofDraft {
  schemaId: string;
  credDefId: string;
  attributes: string[];
  connectionId: string;
}

export function useProofRequest() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { schemas, credDefs, connections } = useDemo();

  const schemaId = params.get("schema") ?? "";
  const credDefId = params.get("creddef") ?? "";
  const connectionId = params.get("connection") ?? "";
  const attributes = (params.get("attrs") ?? "").split(",").filter(Boolean);

  const schema = schemas.find((s) => s.id === schemaId);
  const defs = credDefs.filter((d) => d.schemaId === schemaId);
  const credDef = defs.find((d) => d.id === credDefId);
  const connection = connections.find((c) => c.id === connectionId);

  /** Rebuilds the query string, dropping keys that were cleared. */
  const withDraft = (patch: Partial<ProofDraft>) => {
    const next = new URLSearchParams(params.toString());
    const set = (key: string, value: string | undefined) => {
      if (value) next.set(key, value);
      else next.delete(key);
    };
    if ("schemaId" in patch) set("schema", patch.schemaId);
    if ("credDefId" in patch) set("creddef", patch.credDefId);
    if ("connectionId" in patch) set("connection", patch.connectionId);
    if ("attributes" in patch) set("attrs", patch.attributes?.join(","));
    const qs = next.toString();
    return qs ? `?${qs}` : "";
  };

  return {
    schemas,
    defs,
    connections,
    schema,
    credDef,
    connection,
    schemaId,
    credDefId,
    connectionId,
    attributes,
    withDraft,
    go: (path: string, patch: Partial<ProofDraft> = {}) =>
      router.push(`${path}${withDraft(patch)}`),
    /* Toggling an attribute is not a navigation anyone wants in their history,
       so edits to the draft replace the entry rather than pushing one. */
    edit: (patch: Partial<ProofDraft>) =>
      router.replace(`${pathname}${withDraft(patch)}`, { scroll: false }),
  };
}
