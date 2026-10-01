"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

export function BillingView() {
  const { credentials, verifications, schemas, members } = useDemo();

  /* Metered against what the demo has actually done, so issuing a credential
     moves the bar rather than leaving a static figure on the page. */
  const usage = [
    { label: "Credentials issued", used: credentials.length, limit: 1000, icon: "credentials" },
    { label: "Verifications", used: verifications.length, limit: 1000, icon: "verify" },
    { label: "Schemas", used: schemas.length, limit: 25, icon: "layers" },
    { label: "Members", used: members.length, limit: 10, icon: "users" },
  ] as const;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Organizations", href: "/organizations" }, { label: "Billing" }]}
          title="Billing"
          actions={
            <HairlineButton className="h-11 px-4 text-[13px]">
              <Icon name="download" size={15} strokeWidth={1.8} />
              Download invoices
            </HairlineButton>
          }
        />

        <Panel>
          <div className="relative z-[4] flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0">
              <p className="m-0 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                Current plan
              </p>
              <p className="m-0 mt-2 font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
                Starter
              </p>
              <p className="m-0 mt-1.5 text-[14px] leading-[1.55] text-muted">
                No card on file. Usage resets on the first of each month.
              </p>
            </div>
            <GradientButton>
              <Icon name="creditCard" size={16} strokeWidth={2} />
              Upgrade plan
            </GradientButton>
          </div>
        </Panel>

        <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {usage.map((row) => {
            /* Clamped so a plan overage renders a full bar rather than one
               that runs past its track. */
            const pct = Math.min(100, Math.round((row.used / row.limit) * 100));
            return (
              <Panel key={row.label}>
                <div className="relative z-[4] flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-grid text-accent"
                      style={{ background: "var(--ndi-mint-04)" }}
                    >
                      <Icon name={row.icon} size={16} strokeWidth={1.7} />
                    </span>
                    <p className="m-0 font-display text-[14px] font-medium text-body">
                      {row.label}
                    </p>
                  </div>

                  <p className="m-0 font-display text-[22px] font-semibold tracking-[-0.02em] text-strong">
                    {row.used}
                    <span className="ml-1.5 font-body text-[13px] font-normal text-faint">
                      of {row.limit}
                    </span>
                  </p>

                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: "rgb(var(--tint) / 0.06)" }}
                    role="img"
                    aria-label={`${row.used} of ${row.limit} used`}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "var(--grad-mint)" }}
                    />
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>

        <Panel padded={false}>
          <Toolbar left={<ToolbarCount>Invoices</ToolbarCount>} />
          <DataTable
            columns={["Invoice", "Period", "Amount", "Status", "Issued on"]}
            empty={{
              icon: "creditCard",
              title: "No invoices yet",
              message:
                "Invoices appear here once the organization moves onto a paid plan. The Starter plan is not billed.",
            }}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
