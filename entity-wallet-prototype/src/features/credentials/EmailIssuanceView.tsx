"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stepper } from "@/components/ui/Stepper";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { CredentialPicker } from "./CredentialPicker";
import { ISSUE_STEPS } from "./issueSteps";
import { useIssuanceForm } from "./useIssuanceForm";

interface Recipient {
  id: number;
  email: string;
}

/**
 * Issue to named holders by email. The recipient list repeats because the
 * common case is a handful of people; bulk exists for when it is hundreds, and
 * the line between them is roughly "would you rather type this or prepare a
 * file".
 */
export function EmailIssuanceView() {
  const router = useRouter();
  const { issueCredentials } = useDemo();
  const form = useIssuanceForm();

  const [recipients, setRecipients] = useState<Recipient[]>([{ id: 1, email: "" }]);
  const [nextId, setNextId] = useState(2);
  const [error, setError] = useState("");

  const addressed = recipients.map((r) => r.email.trim()).filter((e) => e.includes("@"));

  const send = () => {
    if (!form.ready) return setError("Choose a schema and a credential definition first.");
    if (!addressed.length) return setError("Add at least one valid email address.");
    setError("");
    issueCredentials({
      holders: addressed,
      schemaName: form.schema!.name,
      credDefTag: form.credDef!.tag,
      method: "email",
    });
    router.push("/credentials");
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Credentials", href: "/credentials" },
            { label: "Issue", href: "/credentials/issue" },
            { label: "Email" },
          ]}
          title="Issue by email"
        />

        <Stepper steps={ISSUE_STEPS} current={2} />

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <CredentialPicker form={form} />

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className={LABEL_CLASS}>Recipients</span>
                <span className="text-[12.5px] text-faint">
                  {addressed.length} valid of {recipients.length}
                </span>
              </div>

              {recipients.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5">
                  <input
                    type="email"
                    className={`${FIELD_CLASS} h-11`}
                    placeholder="holder@example.bt"
                    aria-label="Recipient email"
                    value={r.email}
                    onChange={(e) =>
                      setRecipients((rows) =>
                        rows.map((row) =>
                          row.id === r.id ? { ...row, email: e.target.value } : row,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label="Remove recipient"
                    disabled={recipients.length === 1}
                    onClick={() => setRecipients((rows) => rows.filter((row) => row.id !== r.id))}
                    className="ndi-iconbtn inline-flex h-11 w-11 flex-none items-center justify-center rounded-[10px] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="trash" size={16} strokeWidth={1.8} />
                  </button>
                </div>
              ))}

              <HairlineButton
                className="h-11 self-start px-4 text-[13px]"
                onClick={() => {
                  setRecipients((rows) => [...rows, { id: nextId, email: "" }]);
                  setNextId((n) => n + 1);
                }}
              >
                <Icon name="plus" size={15} strokeWidth={2} />
                Add recipient
              </HairlineButton>
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
              <GradientButton onClick={send}>
                Send {addressed.length > 1 ? `${addressed.length} offers` : "offer"}
                <Icon name="send" size={16} strokeWidth={2} />
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
