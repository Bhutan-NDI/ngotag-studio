"use client";

import { useMemo, useState } from "react";

import { useDemo } from "@/lib/demoStore";

/**
 * The half of every issuance route that is the same whichever way the offer
 * travels: pick a schema, pick one of its definitions, fill the attributes.
 *
 * Choosing a schema clears the definition rather than keeping the old one:
 * the two lists are unrelated, and a stale pick would silently issue against
 * a definition belonging to a different schema.
 */
export function useIssuanceForm() {
  const { schemas, credDefs } = useDemo();

  /* The initial id is captured before the store hydrates from storage, so it
     can name a schema that the restored set does not contain. Falling back to
     the first available one keeps the form usable instead of leaving it
     pointed at nothing. */
  const [schemaId, setSchemaId] = useState(schemas[0]?.id ?? "");
  const schema = schemas.find((s) => s.id === schemaId) ?? schemas[0];

  const defs = useMemo(
    () => credDefs.filter((d) => d.schemaId === schema?.id),
    [credDefs, schema?.id],
  );
  const [credDefId, setCredDefId] = useState("");
  const credDef = defs.find((d) => d.id === credDefId) ?? defs[0];

  const [values, setValues] = useState<Record<string, string>>({});

  const chooseSchema = (id: string) => {
    setSchemaId(id);
    setCredDefId("");
    setValues({});
  };

  return {
    schemas,
    schema,
    schemaId: schema?.id ?? "",
    chooseSchema,
    defs,
    credDef,
    credDefId: credDef?.id ?? "",
    setCredDefId,
    values,
    setValue: (name: string, v: string) => setValues((s) => ({ ...s, [name]: v })),
    /** Ready when there is something to issue and something to issue it as. */
    ready: Boolean(schema && credDef),
  };
}
