"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { DetailList } from "@/components/ui/DetailList";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * One schema: what it is, what it carries, and what is issuing against it.
 * Three panels because those are three different questions.
 */
export function SchemaDetailView({ schemaId }: { schemaId: string }) {
  const { schemas, credDefs, addCredDef } = useDemo();
  const [copied, setCopied] = useState(false);

  const schema = schemas.find((s) => s.id === schemaId);
  const defs = credDefs.filter((d) => d.schemaId === schemaId);

  if (!schema) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader
            crumbs={[{ label: "Schemas", href: "/schemas" }, { label: "Not found" }]}
            title="Schema not found"
          />
          <Panel padded={false}>
            <EmptyState
              icon="layers"
              tone="filtered"
              title="No schema with that ID"
              message="It may have been created in a different browser — the demo keeps its data locally."
              action={
                <Link href="/schemas">
                  <HairlineButton>
                    <Icon name="arrowLeft" size={15} strokeWidth={2} />
                    Back to schemas
                  </HairlineButton>
                </Link>
              }
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const newDefTag = `tag-${(defs.length + 1).toString().padStart(2, "0")}`;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Schemas", href: "/schemas" }, { label: schema.name }]}
          title={schema.name}
          actions={
            <>
              <HairlineButton
                className="h-11 px-4 text-[13px]"
                onClick={() => {
                  navigator.clipboard?.writeText(schema.id);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                }}
              >
                <Icon name={copied ? "check" : "copy"} size={15} strokeWidth={1.8} />
                {copied ? "Copied" : "Copy schema ID"}
              </HairlineButton>
              <GradientButton
                className="h-11"
                onClick={() =>
                  addCredDef({ schemaId: schema.id, tag: newDefTag, revocable: true })
                }
              >
                <Icon name="plus" size={16} strokeWidth={2} />
                Create credential definition
              </GradientButton>
            </>
          }
        />

        <Panel>
          <DetailList
            items={[
              { label: "Schema ID", value: schema.id, mono: true },
              { label: "Name", value: schema.name },
              { label: "Version", value: schema.version },
              { label: "Ledger", value: schema.ledger },
              { label: "Issuer DID", value: schema.issuerDid, mono: true },
              { label: "Created on", value: schema.createdAt },
            ]}
          />
        </Panel>

        <Panel padded={false}>
          <Toolbar left={<ToolbarCount>{schema.attributes.length} attributes</ToolbarCount>} />
          <DataTable columns={["Attribute", "Type"]}>
            {schema.attributes.map((a) => (
              <tr key={a.name}>
                <td className="font-mono text-[13px]">{a.name}</td>
                <td className="text-muted">{a.type}</td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel padded={false}>
          <Toolbar
            left={<ToolbarCount>{defs.length} credential definitions</ToolbarCount>}
            right={
              <HairlineButton
                className="h-10 px-3.5 text-[13px]"
                onClick={() =>
                  addCredDef({ schemaId: schema.id, tag: newDefTag, revocable: true })
                }
              >
                <Icon name="plus" size={15} strokeWidth={2} />
                New definition
              </HairlineButton>
            }
          />
          <DataTable
            columns={["Definition", "Tag", "Revocable", "Created on"]}
            empty={{
              icon: "credentials",
              title: "No credential definitions yet",
              message:
                "A credential definition binds this schema to one issuing organization, ready to issue against.",
              action: (
                <GradientButton
                  onClick={() =>
                    addCredDef({ schemaId: schema.id, tag: newDefTag, revocable: true })
                  }
                >
                  <Icon name="plus" size={16} strokeWidth={2} />
                  Create definition
                </GradientButton>
              ),
            }}
          >
            {defs.length
              ? defs.map((d) => (
                  <tr key={d.id}>
                    <td className="font-mono text-[12.5px]">{d.id}</td>
                    <td>{d.tag}</td>
                    <td className="text-muted">{d.revocable ? "Yes" : "No"}</td>
                    <td className="text-muted">{d.createdAt}</td>
                  </tr>
                ))
              : undefined}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
