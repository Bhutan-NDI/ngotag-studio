"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/** Every bulk upload and how it went. Failures are the reason to come here. */
export function BulkHistoryView() {
  const { bulkUploads } = useDemo();

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Credentials", href: "/credentials" },
            { label: "Bulk", href: "/credentials/issue/bulk-issuance" },
            { label: "History" },
          ]}
          title="Upload history"
          actions={
            <Link href="/credentials/issue/bulk-issuance">
              <GradientButton className="h-11">
                <Icon name="plus" size={16} strokeWidth={2} />
                New upload
              </GradientButton>
            </Link>
          }
        />

        <Panel padded={false}>
          <Toolbar left={<ToolbarCount>{bulkUploads.length} uploads</ToolbarCount>} />
          <DataTable
            columns={["File", "Records", "Issued", "Failed", "Status", "Uploaded on", ""]}
            empty={{
              icon: "layers",
              title: "No uploads yet",
              message:
                "Bulk uploads and their per-record outcome are kept here so a partial run can be chased down.",
              action: (
                <Link href="/credentials/issue/bulk-issuance">
                  <GradientButton>
                    <Icon name="plus" size={16} strokeWidth={2} />
                    New upload
                  </GradientButton>
                </Link>
              ),
            }}
          >
            {bulkUploads.length
              ? bulkUploads.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono text-[12.5px] text-strong">{u.fileName}</td>
                    <td className="text-muted">{u.records}</td>
                    <td className="text-muted">{u.succeeded}</td>
                    <td className={u.failed ? "text-[var(--text-danger)]" : "text-muted"}>
                      {u.failed}
                    </td>
                    <td>
                      <StatusPill status={u.status} />
                    </td>
                    <td className="text-muted">{u.uploadedAt}</td>
                    <td>
                      <Link
                        href={`/credentials/issue/bulk-issuance/history/${u.id}`}
                        className="ndi-plainlink whitespace-nowrap text-[12.5px] text-accent"
                      >
                        View records
                      </Link>
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
