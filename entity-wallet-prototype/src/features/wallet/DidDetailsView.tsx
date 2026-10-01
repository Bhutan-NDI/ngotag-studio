"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * Every DID the organization's wallet holds. One of them signs what you issue,
 * so that flag leads rather than hiding in a detail page — and it is settable
 * from the row, since promoting a DID is the only thing you usually do here.
 */
export function DidDetailsView() {
  const { dids, setIssuerDid, removeDid } = useDemo();

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Trust" }, { label: "DIDs" }]}
          title="DIDs"
          actions={
            <>
              <HairlineButton className="h-11 px-4 text-[13px]">
                <Icon name="download" size={15} strokeWidth={1.8} />
                DID document
              </HairlineButton>
              <Link href="/create-did">
                <GradientButton className="h-11">
                  <Icon name="plus" size={16} strokeWidth={2} />
                  Create DID
                </GradientButton>
              </Link>
            </>
          }
        />

        <Panel padded={false}>
          <Toolbar
            left={
              <ToolbarCount>
                {dids.length} {dids.length === 1 ? "DID" : "DIDs"}
              </ToolbarCount>
            }
          />
          <DataTable
            columns={["DID", "Method", "Key type", "Alias", "Role", "Created on", ""]}
            empty={{
              icon: "fingerprint",
              title: "No DIDs yet",
              message:
                "A DID identifies your organization on the network and signs everything it issues.",
              action: (
                <Link href="/create-did">
                  <GradientButton>
                    <Icon name="plus" size={16} strokeWidth={2} />
                    Create DID
                  </GradientButton>
                </Link>
              ),
            }}
          >
            {dids.length
              ? dids.map((d) => (
                  <tr key={d.id}>
                    <td className="max-w-[280px] truncate font-mono text-[12.5px]" title={d.id}>
                      {d.id}
                    </td>
                    <td className="text-muted">{d.method}</td>
                    <td className="text-muted">{d.keyType}</td>
                    <td>{d.alias}</td>
                    <td>
                      {d.isIssuer ? (
                        <StatusPill status="active" />
                      ) : (
                        <span className="text-[12.5px] text-faint">—</span>
                      )}
                    </td>
                    <td className="text-muted">{d.createdAt}</td>
                    <td>
                      <span className="flex items-center gap-1.5">
                        {!d.isIssuer ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setIssuerDid(d.id)}
                              className="ndi-plainlink whitespace-nowrap text-[12.5px] text-accent"
                            >
                              Make issuing
                            </button>
                            <span className="text-faint">·</span>
                            <button
                              type="button"
                              onClick={() => removeDid(d.id)}
                              className="ndi-plainlink whitespace-nowrap text-[12.5px] text-muted"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          /* The issuing DID has signed things; removing it
                             would orphan them. */
                          <span className="text-[12.5px] text-faint">Issuing DID</span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              : undefined}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
