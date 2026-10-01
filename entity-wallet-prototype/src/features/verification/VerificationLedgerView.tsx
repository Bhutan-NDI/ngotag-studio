"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toolbar } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * Every presentation this organization has asked for and how the holder
 * answered. A requested proof is still open, so the row can settle it — which
 * is the holder's wallet doing the deciding in a real deployment.
 */
export function VerificationLedgerView() {
  const { verifications, setVerificationState } = useDemo();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = verifications.filter(
    (v) => !q || v.holder.toLowerCase().includes(q) || v.schemaName.toLowerCase().includes(q),
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Verification" }]}
          title="Verification"
          actions={
            <Link href="/verification/verify-credentials">
              <GradientButton className="h-11">
                <Icon name="verify" size={16} strokeWidth={2} />
                Request proof
              </GradientButton>
            </Link>
          }
        />

        <Panel padded={false}>
          <Toolbar
            left={
              <SearchField
                className="w-full min-[561px]:w-[300px]"
                placeholder="Search verifications"
                value={query}
                onChange={setQuery}
              />
            }
          />
          <DataTable
            columns={["Holder", "Schema", "Status", "Requested on", ""]}
            empty={{
              icon: "verify",
              title: q ? "No verifications match that search" : "No verifications yet",
              message: q
                ? "Nothing here matches what you typed."
                : "A proof request asks a holder to present attributes from a credential they already hold. Requests and their outcome are recorded here.",
              action: q ? undefined : (
                <Link href="/verification/verify-credentials">
                  <GradientButton>
                    <Icon name="verify" size={16} strokeWidth={2} />
                    Request proof
                  </GradientButton>
                </Link>
              ),
            }}
          >
            {rows.length
              ? rows.map((v) => (
                  <tr key={v.id}>
                    <td className="text-strong">{v.holder}</td>
                    <td>{v.schemaName}</td>
                    <td>
                      <StatusPill status={v.state} />
                    </td>
                    <td className="text-muted">{v.requestedAt}</td>
                    <td>
                      {v.state === "requested" ? (
                        <span className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setVerificationState(v.id, "verified")}
                            className="ndi-plainlink whitespace-nowrap text-[12.5px] text-accent"
                          >
                            Mark verified
                          </button>
                          <span className="text-faint">·</span>
                          <button
                            type="button"
                            onClick={() => setVerificationState(v.id, "declined")}
                            className="ndi-plainlink whitespace-nowrap text-[12.5px] text-muted"
                          >
                            Decline
                          </button>
                        </span>
                      ) : null}
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
