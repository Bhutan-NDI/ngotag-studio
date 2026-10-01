"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stepper } from "@/components/ui/Stepper";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { CredentialPicker } from "./CredentialPicker";
import { ISSUE_STEPS } from "./issueSteps";
import { useIssuanceForm } from "./useIssuanceForm";

/**
 * Issue to many holders from a .csv.
 *
 * The template comes first rather than last: the columns have to match the
 * chosen definition's attributes exactly, so a file assembled by hand is
 * usually a file that fails validation. Pick the definition, take its
 * template, fill it, upload it.
 */
export function BulkIssuanceView() {
  const router = useRouter();
  const { addBulkUpload, issueCredentials } = useDemo();
  const form = useIssuanceForm();

  const [file, setFile] = useState<{ name: string; rows: number } | null>(null);
  const [error, setError] = useState("");

  const template = () => {
    if (!form.schema) return;
    const header = form.schema.attributes.map((a) => a.name).join(",");
    const blob = new Blob([`email,${header}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.schema.name.replace(/\s+/g, "-").toLowerCase()}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onPick = (f: File | undefined) => {
    if (!f) return;
    /* Row count is read from the file itself, so the summary afterwards
       reflects what was actually uploaded. */
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result ?? "")
        .split(/\r?\n/)
        .filter((l) => l.trim());
      setFile({ name: f.name, rows: Math.max(0, lines.length - 1) });
    };
    reader.readAsText(f);
  };

  const issue = () => {
    if (!form.ready) return setError("Choose a schema and a credential definition first.");
    if (!file || !file.rows) return setError("Upload a .csv with at least one record.");
    setError("");
    const upload = addBulkUpload({ fileName: file.name, records: file.rows });
    issueCredentials({
      holders: Array.from({ length: upload.succeeded }, (_, i) => `Bulk holder ${i + 1}`),
      schemaName: form.schema!.name,
      credDefTag: form.credDef!.tag,
      method: "bulk",
    });
    router.push(`/credentials/issue/bulk-issuance/history/${upload.id}`);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Credentials", href: "/credentials" },
            { label: "Issue", href: "/credentials/issue" },
            { label: "Bulk" },
          ]}
          title="Bulk issuance"
          actions={
            <Link href="/credentials/issue/bulk-issuance/history">
              <HairlineButton className="h-11 px-4 text-[13px]">
                <Icon name="refresh" size={15} strokeWidth={1.8} />
                Upload history
              </HairlineButton>
            </Link>
          }
        />

        <Stepper steps={ISSUE_STEPS} current={2} />

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <CredentialPicker form={form} />

            <div
              className="flex flex-wrap items-center gap-2.5 rounded-xl border border-grid p-4"
              style={{ background: "var(--ndi-mint-04)" }}
            >
              <Icon name="info" size={16} strokeWidth={1.8} className="flex-none text-accent" />
              <p className="m-0 min-w-0 flex-1 text-[13px] leading-[1.55] text-muted">
                The template carries one column per attribute in the selected schema, plus the
                holder&rsquo;s email. Upload fails if the headers do not match.
              </p>
              <HairlineButton
                className="h-10 px-3.5 text-[13px]"
                disabled={!form.schema}
                onClick={template}
              >
                <Icon name="download" size={15} strokeWidth={1.8} />
                Download template
              </HairlineButton>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className={LABEL_CLASS}>Records file</span>
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed px-5 py-12 text-center"
                style={{
                  borderColor: file ? "var(--border-strong)" : "var(--border-grid)",
                  background: file ? "var(--ndi-mint-04)" : "rgb(var(--tint) / 0.02)",
                }}
              >
                <span
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-grid text-accent"
                  style={{ background: "var(--ndi-mint-04)" }}
                >
                  <Icon name={file ? "check" : "download"} size={22} strokeWidth={1.7} />
                </span>
                <span className="font-display text-[15px] font-semibold text-strong">
                  {file ? file.name : "Drop a .csv here, or browse"}
                </span>
                <span className="text-[13px] leading-[1.55] text-muted">
                  {file
                    ? `${file.rows} ${file.rows === 1 ? "record" : "records"} ready to issue`
                    : "Up to 1,000 records per upload. Rows that fail validation are reported and the rest still issue."}
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => onPick(e.target.files?.[0])}
                />
              </label>
            </div>

            {error ? (
              <p
                role="alert"
                className="m-0 flex items-center gap-2 text-[13px] text-[var(--text-danger)]"
              >
                <Icon name="shieldAlert" size={15} strokeWidth={2} />
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
              <GradientButton onClick={issue}>
                <Icon name="issue" size={16} strokeWidth={2} />
                Issue records
              </GradientButton>
              <HairlineButton className="h-12" onClick={() => router.push("/credentials/issue")}>
                Cancel
              </HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
