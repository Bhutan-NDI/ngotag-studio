"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { QrPlaceholder } from "@/components/ui/QrPlaceholder";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/StatusPill";
import { Stepper } from "@/components/ui/Stepper";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { VERIFY_STEPS } from "./verifySteps";
import { useProofRequest } from "./useProofRequest";

type Mode = "email" | "qr" | "connection";

interface Props {
  mode: Mode;
  back: string;
  crumbs: { label: string; href?: string }[];
}

const TITLE: Record<Mode, string> = {
  email: "Send by email",
  qr: "Send by QR code",
  connection: "Send over a connection",
};

/**
 * The last step: hand the assembled request to a holder.
 *
 * All three modes share the summary panel, because the thing being sent is the
 * same and getting it wrong is the expensive mistake — the delivery differs
 * only in who receives it.
 */
export function VerifyDeliveryView({ mode, back, crumbs }: Props) {
  const router = useRouter();
  const { addVerification, connections } = useDemo();
  const { schema, credDef, attributes, connection, connectionId } = useProofRequest();

  const [email, setEmail] = useState("");
  const [pickedConnection, setPickedConnection] = useState(connectionId);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const active = connections.filter((c) => c.status === "active");
  const holder =
    mode === "email"
      ? email.trim()
      : (connection ?? active.find((c) => c.id === pickedConnection) ?? active[0])?.label ?? "";

  if (!schema) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader crumbs={crumbs} title={TITLE[mode]} />
          <Panel padded={false}>
            <EmptyState
              icon="verify"
              tone="filtered"
              title="Nothing to send yet"
              message="This step sends a request you have already built. Go back and choose a credential and its attributes."
              action={
                <Link href={back}>
                  <HairlineButton>
                    <Icon name="arrowLeft" size={15} strokeWidth={2} />
                    Build the request
                  </HairlineButton>
                </Link>
              }
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const send = () => {
    if (!attributes.length) return setError("Select at least one attribute to request.");
    if (mode === "email" && !email.includes("@")) return setError("Enter a valid email address.");
    if (mode === "connection" && !holder) return setError("There is no active connection to ask.");
    setError("");
    addVerification({ holder, schemaName: schema.name });
    router.push("/verification");
  };

  const generate = () => {
    if (!attributes.length) return setError("Select at least one attribute to request.");
    setError("");
    setCode(Math.random().toString(36).slice(2, 12));
  };

  /* Standing in for a holder answering, so the ledger's verified state is
     reachable in a demo. */
  const simulateScan = () => {
    if (!code) return;
    addVerification({ holder: "Scanned holder", schemaName: schema.name });
    router.push("/verification");
  };

  const summary = (
    <Panel>
      <DetailList
        items={[
          { label: "Credential", value: `${schema.name} v${schema.version}` },
          { label: "Definition", value: credDef ? credDef.tag : "Any definition" },
          {
            label: "Attributes requested",
            value: attributes.length ? (
              <span className="flex flex-wrap gap-1.5">
                {attributes.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center rounded-md border border-grid px-2 py-1 font-mono text-[11px] text-muted"
                    style={{ background: "rgb(var(--tint) / 0.03)" }}
                  >
                    {a}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-[var(--text-danger)]">None selected</span>
            ),
          },
          { label: "Status", value: <StatusPill status="requested" /> },
        ]}
      />
    </Panel>
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={crumbs} title={TITLE[mode]} />

        <Stepper steps={VERIFY_STEPS} current={3} />

        {mode === "qr" ? (
          <div className="grid gap-5 min-[901px]:grid-cols-[1fr_360px]">
            {summary}
            <Panel>
              <div className="relative z-[4] flex flex-col items-center gap-4 text-center">
                <QrPlaceholder value={code} />
                <p className="m-0 text-[13px] leading-[1.55] text-muted">
                  {code
                    ? "The holder scans this to receive the proof request."
                    : "Generate a code for the holder to scan."}
                </p>
                <div className="flex w-full flex-wrap justify-center gap-2.5">
                  <HairlineButton
                    className="h-11 px-4 text-[13px]"
                    disabled={!code}
                    onClick={simulateScan}
                  >
                    <Icon name="fingerprint" size={15} strokeWidth={1.8} />
                    Simulate scan
                  </HairlineButton>
                  <HairlineButton
                    className="h-11 px-4 text-[13px]"
                    disabled={!code}
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `https://studio.bhutanndi.bt/proof/${code}`,
                      );
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1600);
                    }}
                  >
                    <Icon name={copied ? "check" : "copy"} size={15} strokeWidth={1.8} />
                    {copied ? "Copied" : "Copy link"}
                  </HairlineButton>
                </div>
              </div>
            </Panel>
          </div>
        ) : (
          summary
        )}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            {mode === "email" ? (
              <label className="flex min-w-0 flex-col gap-[7px]">
                <span className={LABEL_CLASS}>Holder email</span>
                <input
                  type="email"
                  className={`${FIELD_CLASS} h-12`}
                  placeholder="holder@example.bt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            ) : null}

            {mode === "connection" ? (
              <label className="flex min-w-0 flex-col gap-[7px]">
                <span className={LABEL_CLASS}>Holder</span>
                <Select
                  label="Holder"
                  className="h-12 w-full"
                  value={pickedConnection || active[0]?.id || ""}
                  onChange={setPickedConnection}
                  placeholder="No active connections"
                  options={active.map((c) => ({ value: c.id, label: c.label, hint: c.id }))}
                />
              </label>
            ) : null}

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
              {mode === "qr" ? (
                <GradientButton onClick={generate}>
                  <Icon name="verify" size={16} strokeWidth={2} />
                  {code ? "Regenerate code" : "Generate code"}
                </GradientButton>
              ) : (
                <GradientButton onClick={send}>
                  Send request
                  <Icon name="send" size={16} strokeWidth={2} />
                </GradientButton>
              )}
              <Link href={back}>
                <HairlineButton className="h-12">
                  <Icon name="arrowLeft" size={15} strokeWidth={2} />
                  Back
                </HairlineButton>
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
