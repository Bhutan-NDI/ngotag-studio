"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { DetailList } from "@/components/ui/DetailList";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * The credentials for talking to the agent directly, rather than through this
 * UI. The secret is masked until asked for: a settings page is exactly the
 * kind of screen someone shares, and a secret sitting in plain text there is
 * a secret already spent.
 */
export function DevelopersSettingView() {
  const { apiKeys, addApiKey, revokeApiKey, organizations } = useDemo();
  const [revealed, setRevealed] = useState(false);

  const org = organizations[0];
  const secret = "ndi_sk_9f2c41ba77de4c08b5e1a63d";

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Developer settings" }]}
          title="Developer settings"
          actions={
            <HairlineButton className="h-11 px-4 text-[13px]">
              <Icon name="fileText" size={15} strokeWidth={1.8} />
              API reference
            </HairlineButton>
          }
        />

        <Panel>
          <DetailList
            items={[
              { label: "Organization", value: org ? org.name : "—" },
              { label: "Organization ID", value: org ? org.id : "—", mono: true },
              { label: "Agent endpoint", value: "https://agent.bhutanndi.bt/v1", mono: true },
              { label: "Client ID", value: "ndi_client_4b7a2e91", mono: true },
              {
                label: "Client secret",
                value: (
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-[12.5px]">
                      {revealed ? secret : "•".repeat(secret.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRevealed((r) => !r)}
                      className="ndi-plainlink inline-flex items-center gap-1.5 text-[12.5px] text-accent"
                    >
                      <Icon name={revealed ? "eyeOff" : "eye"} size={14} strokeWidth={1.8} />
                      {revealed ? "Hide" : "Reveal"}
                    </button>
                  </span>
                ),
              },
            ]}
          />
          <div className="relative z-[4] mt-5 flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
            <HairlineButton className="h-11 px-4 text-[13px]">
              <Icon name="refresh" size={15} strokeWidth={1.8} />
              Regenerate secret
            </HairlineButton>
            <span className="text-[12.5px] leading-[1.5] text-faint">
              Regenerating invalidates the current secret immediately.
            </span>
          </div>
        </Panel>

        <Panel padded={false}>
          <Toolbar
            left={<ToolbarCount>{apiKeys.length} API keys</ToolbarCount>}
            right={
              <GradientButton
                className="h-10 px-3.5 text-[13px]"
                onClick={() => addApiKey(`Key ${apiKeys.length + 1}`)}
              >
                <Icon name="plus" size={15} strokeWidth={2} />
                Create key
              </GradientButton>
            }
          />
          <DataTable
            columns={["Label", "Key", "Created on", "Last used", "Status", ""]}
            empty={{
              icon: "key",
              title: "No API keys yet",
              message:
                "An API key lets a service issue and verify on your behalf without a browser session. A key is shown once when it is created and never again.",
              action: (
                <GradientButton onClick={() => addApiKey(`Key ${apiKeys.length + 1}`)}>
                  <Icon name="plus" size={16} strokeWidth={2} />
                  Create key
                </GradientButton>
              ),
            }}
          >
            {apiKeys.length
              ? apiKeys.map((k) => (
                  <tr key={k.id}>
                    <td className="text-strong">{k.label}</td>
                    <td className="font-mono text-[12.5px] text-muted">{k.masked}</td>
                    <td className="text-muted">{k.createdAt}</td>
                    <td className="text-muted">{k.lastUsed}</td>
                    <td>
                      <StatusPill status={k.status} />
                    </td>
                    <td>
                      {k.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => revokeApiKey(k.id)}
                          className="ndi-plainlink whitespace-nowrap text-[12.5px] text-muted"
                        >
                          Revoke
                        </button>
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
