"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { DetailList } from "@/components/ui/DetailList";
import { EmptyState } from "@/components/ui/EmptyState";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

const TABS: TabItem[] = [
  { id: "all", label: "All records" },
  { id: "failed", label: "Failed only" },
];

/**
 * One upload, record by record. The failed-only tab is the point of the page:
 * after a partial run the question is never "what worked".
 */
export function BulkHistoryDetailView({ requestId }: { requestId: string }) {
  const { bulkUploads, bulkRecords } = useDemo();
  const [tab, setTab] = useState("all");

  const upload = bulkUploads.find((u) => u.id === requestId);
  const records = bulkRecords.filter((r) => r.uploadId === requestId);
  const rows = tab === "failed" ? records.filter((r) => r.status === "failed") : records;

  if (!upload) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader
            crumbs={[
              { label: "Bulk", href: "/credentials/issue/bulk-issuance" },
              { label: "Not found" },
            ]}
            title="Upload not found"
          />
          <Panel padded={false}>
            <EmptyState
              icon="layers"
              tone="filtered"
              title="No upload with that reference"
              message="It may have been created in a different browser — the demo keeps its data locally."
              action={
                <Link href="/credentials/issue/bulk-issuance/history">
                  <HairlineButton>
                    <Icon name="arrowLeft" size={15} strokeWidth={2} />
                    Back to history
                  </HairlineButton>
                </Link>
              }
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Bulk", href: "/credentials/issue/bulk-issuance" },
            { label: "History", href: "/credentials/issue/bulk-issuance/history" },
            { label: upload.fileName },
          ]}
          title={upload.fileName}
          actions={
            <HairlineButton className="h-11 px-4 text-[13px]">
              <Icon name="download" size={15} strokeWidth={1.8} />
              Download report
            </HairlineButton>
          }
        />

        <Panel>
          <DetailList
            items={[
              { label: "Reference", value: upload.id, mono: true },
              { label: "Records", value: String(upload.records) },
              { label: "Issued", value: String(upload.succeeded) },
              { label: "Failed", value: String(upload.failed) },
              { label: "Status", value: <StatusPill status={upload.status} /> },
              { label: "Uploaded on", value: upload.uploadedAt },
            ]}
          />
        </Panel>

        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Record outcome" />

        <Panel padded={false}>
          <Toolbar left={<ToolbarCount>{rows.length} records</ToolbarCount>} />
          <DataTable
            columns={["Holder", "Status", "Detail"]}
            empty={{
              icon: "check",
              title: tab === "failed" ? "No failed records" : "No records stored",
              message:
                tab === "failed"
                  ? "Every record in this upload issued successfully."
                  : "Per-record detail is kept for uploads made in this browser.",
            }}
          >
            {rows.length
              ? rows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-[12.5px] text-strong">{r.holder}</td>
                    <td>
                      <StatusPill status={r.status} />
                    </td>
                    <td className="text-muted">{r.error ?? "—"}</td>
                  </tr>
                ))
              : undefined}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
