"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { QrPlaceholder } from "@/components/ui/QrPlaceholder";
import { Select } from "@/components/ui/Select";
import { Stepper } from "@/components/ui/Stepper";
import { FIELD_BLOCK_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { CredentialPicker } from "./CredentialPicker";
import { ISSUE_STEPS } from "./issueSteps";
import { useIssuanceForm } from "./useIssuanceForm";

/**
 * Out-of-band issuance: the offer is encoded into a code instead of being
 * addressed to anyone, so it needs no prior connection and no contact detail.
 *
 * The code panel holds its square whether or not a code has been generated —
 * the placeholder occupies exactly the space the real one will, so generating
 * does not shift the page under the reader.
 */
export function OobIssuanceView() {
  const router = useRouter();
  const { issueCredentials } = useDemo();
  const form = useIssuanceForm();

  const [reuse, setReuse] = useState("once");
  const [code, setCode] = useState<string | null>(null);
  const [scans, setScans] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const link = code ? `https://studio.bhutanndi.bt/oob/${code}` : "";
  const spent = code !== null && reuse === "once" && scans > 0;

  const generate = () => {
    if (!form.ready) return setError("Choose a schema and a credential definition first.");
    setError("");
    setScans(0);
    setCode(Math.random().toString(36).slice(2, 12));
  };

  /* Standing in for a holder pointing a phone at the screen, so the rest of
     the flow — the offer landing in the ledger — can be demonstrated. */
  const simulateScan = () => {
    if (!code || spent) return;
    const n = scans + 1;
    setScans(n);
    issueCredentials({
      holders: [`Scanned holder ${n}`],
      schemaName: form.schema!.name,
      credDefTag: form.credDef!.tag,
      method: "qr",
    });
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Credentials", href: "/credentials" },
            { label: "Issue", href: "/credentials/issue" },
            { label: "QR code" },
          ]}
          title="Issue by QR code"
        />

        <Stepper steps={ISSUE_STEPS} current={code ? 3 : 2} />

        <div className="grid gap-5 min-[901px]:grid-cols-[1fr_360px]">
          <Panel>
            <div className="relative z-[4] flex flex-col gap-6">
              <CredentialPicker form={form} />

              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Reuse</span>
                <Select
                  label="Reuse"
                  className="h-12 w-full"
                  value={reuse}
                  onChange={setReuse}
                  options={[
                    { value: "once", label: "Single use — expires after one scan" },
                    { value: "many", label: "Multi use — anyone who scans receives the offer" },
                  ]}
                />
                <span className="text-[12.5px] leading-[1.5] text-faint">
                  A multi-use code issues to every holder who scans it. Use it for a counter or a
                  poster, not for a named individual.
                </span>
              </label>

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
                <GradientButton onClick={generate}>
                  <Icon name="verify" size={16} strokeWidth={2} />
                  {code ? "Regenerate code" : "Generate code"}
                </GradientButton>
                <HairlineButton className="h-12" onClick={() => router.push("/credentials")}>
                  Done
                </HairlineButton>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="relative z-[4] flex flex-col items-center gap-4 text-center">
              <QrPlaceholder value={code} />

              <p className="m-0 text-[13px] leading-[1.55] text-muted">
                {code
                  ? spent
                    ? "This single-use code has been redeemed. Regenerate to issue again."
                    : "The holder scans this with their wallet app to receive the offer."
                  : "Pick a credential definition and generate a code."}
              </p>

              {code ? (
                <p className="m-0 font-mono text-[11px] text-faint">
                  {scans} {scans === 1 ? "scan" : "scans"}
                </p>
              ) : null}

              <div className="flex w-full flex-wrap justify-center gap-2.5">
                <HairlineButton
                  className="h-11 px-4 text-[13px]"
                  disabled={!code || spent}
                  onClick={simulateScan}
                >
                  <Icon name="fingerprint" size={15} strokeWidth={1.8} />
                  Simulate scan
                </HairlineButton>
                <HairlineButton
                  className="h-11 px-4 text-[13px]"
                  disabled={!code}
                  onClick={() => {
                    navigator.clipboard?.writeText(link);
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
      </div>
    </AppShell>
  );
}
