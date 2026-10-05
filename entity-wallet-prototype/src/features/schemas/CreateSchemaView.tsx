"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import type { Attribute, LedgerKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

const LEDGERS: TabItem[] = [
  { id: "AnonCreds", label: "AnonCreds", icon: "credentials" },
  { id: "W3C", label: "W3C", icon: "fileText" },
];

const TYPES: Attribute["type"][] = ["string", "number", "boolean", "date"];

interface Row extends Attribute {
  key: number;
}

export function CreateSchemaView() {
  const router = useRouter();
  const { addSchema } = useDemo();

  const [ledger, setLedger] = useState<LedgerKind>("AnonCreds");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  /* Seeded with one row: an attribute list that starts empty reads as broken,
     and every schema has at least one. */
  const [rows, setRows] = useState<Row[]>([{ key: 1, name: "", type: "string" }]);
  const [nextKey, setNextKey] = useState(2);
  const [touched, setTouched] = useState(false);

  const named = rows.filter((r) => r.name.trim());
  const valid = name.trim() && version.trim() && named.length > 0;

  const update = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    const schema = addSchema({
      name: name.trim(),
      version: version.trim(),
      ledger,
      attributes: named.map(({ name: n, type }) => ({ name: n.trim(), type })),
    });
    router.push(`/schemas/${encodeURIComponent(schema.id)}`);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Schemas", href: "/schemas" }, { label: "Create" }]}
          title="Create schema"
        />

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <span className={LABEL_CLASS}>Schema format</span>
              <Tabs
                tabs={LEDGERS}
                active={ledger}
                onChange={(id) => setLedger(id as LedgerKind)}
                label="Schema format"
              />
            </div>

            <div className="grid gap-4 min-[641px]:grid-cols-[1fr_180px]">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Schema name</span>
                <input
                  className={`${FIELD_CLASS} h-12`}
                  placeholder="Proof of residence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Version</span>
                <input
                  className={`${FIELD_CLASS} h-12`}
                  placeholder="1.0"
                  inputMode="decimal"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className={LABEL_CLASS}>Attributes</span>
                <span className="text-[12.5px] text-faint">
                  {named.length} named
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="grid gap-2.5 min-[641px]:grid-cols-[1fr_160px_auto] min-[641px]:items-center"
                  >
                    <input
                      className={`${FIELD_CLASS} h-11`}
                      placeholder="Attribute name"
                      aria-label="Attribute name"
                      value={row.name}
                      onChange={(e) => update(row.key, { name: e.target.value })}
                    />
                    <Select
                      label={`Type of attribute ${row.name || row.key}`}
                      className="w-full"
                      value={row.type}
                      onChange={(v) => update(row.key, { type: v as Attribute["type"] })}
                      options={TYPES.map((t) => ({ value: t, label: t }))}
                    />
                    <button
                      type="button"
                      aria-label={`Remove attribute ${row.name || row.key}`}
                      /* The last row cannot go: a schema with no attributes is
                         not a schema. */
                      disabled={rows.length === 1}
                      onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
                      className="ndi-iconbtn inline-flex h-11 w-11 items-center justify-center rounded-[10px] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Icon name="trash" size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>

              <HairlineButton
                className="h-11 self-start px-4 text-[13px]"
                onClick={() => {
                  setRows((rs) => [...rs, { key: nextKey, name: "", type: "string" }]);
                  setNextKey((n) => n + 1);
                }}
              >
                <Icon name="plus" size={15} strokeWidth={2} />
                Add attribute
              </HairlineButton>
            </div>

            {touched && !valid ? (
              <p
                role="alert"
                className="m-0 flex items-center gap-2 text-[13px] text-[var(--text-danger)]"
              >
                <Icon name="shieldAlert" size={15} strokeWidth={2} />
                A schema needs a name, a version and at least one named attribute.
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
              <GradientButton onClick={submit}>
                <Icon name="check" size={16} strokeWidth={2.2} />
                Create schema
              </GradientButton>
              <Link href="/schemas">
                <HairlineButton className="h-12">Cancel</HairlineButton>
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
