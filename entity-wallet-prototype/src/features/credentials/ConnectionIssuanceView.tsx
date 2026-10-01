"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { Stepper } from "@/components/ui/Stepper";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { CredentialPicker } from "./CredentialPicker";
import { ISSUE_STEPS } from "./issueSteps";
import { useIssuanceForm } from "./useIssuanceForm";

/**
 * Fill in and send an offer down an existing connection. The holder is carried
 * in the query string from the picker, so the page is linkable — a row in the
 * connections table can jump straight here.
 */
export function ConnectionIssuanceView() {
  const router = useRouter();
  const params = useSearchParams();
  const { connections, issueCredentials } = useDemo();
  const form = useIssuanceForm();

  const active = connections.filter((c) => c.status === "active");
  const fromQuery = params.get("connection");
  const [connectionId, setConnectionId] = useState(fromQuery ?? active[0]?.id ?? "");
  const connection = active.find((c) => c.id === connectionId) ?? active[0];
  const [error, setError] = useState("");

  const send = () => {
    if (!connection) return setError("There is no active connection to issue to.");
    if (!form.ready) return setError("Choose a schema and a credential definition first.");
    setError("");
    issueCredentials({
      holders: [connection.label],
      schemaName: form.schema!.name,
      credDefTag: form.credDef!.tag,
      method: "connection",
    });
    router.push("/credentials");
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Credentials", href: "/credentials" },
            { label: "Connection", href: "/credentials/connections" },
            { label: "Issue" },
          ]}
          title="Issue over a connection"
        />

        <Stepper steps={ISSUE_STEPS} current={2} />

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <label className="flex min-w-0 flex-col gap-[7px]">
              <span className={LABEL_CLASS}>Holder</span>
              <Select
                label="Holder"
                className="h-12 w-full"
                value={connection?.id ?? ""}
                onChange={setConnectionId}
                placeholder="No active connections"
                options={active.map((c) => ({ value: c.id, label: c.label, hint: c.id }))}
              />
            </label>

            <CredentialPicker form={form} />

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
              <GradientButton onClick={send}>
                Send offer
                <Icon name="send" size={16} strokeWidth={2} />
              </GradientButton>
              <HairlineButton
                className="h-12"
                onClick={() => router.push("/credentials/connections")}
              >
                Cancel
              </HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
