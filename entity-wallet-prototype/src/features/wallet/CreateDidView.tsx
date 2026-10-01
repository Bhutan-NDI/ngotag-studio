"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/* did:polygon leads because it is the one the NDI actually uses: the
   verifiable data registry is anchored on Polygon/Ethereum. This list used to
   open with did:indy, described as "anchored on the Bhutan NDI ledger" — which
   is not the NDI's method, and the documentation review marks exactly that
   example as an error to correct before anything goes to GovTech. The design is DID-method-agnostic, so the
   other methods stay; they just do not claim to be the NDI's. */
const METHODS = [
  { id: "polygon", label: "did:polygon", hint: "Anchored on Polygon — the NDI's verifiable data registry." },
  { id: "key", label: "did:key", hint: "Self-contained; no ledger write." },
  { id: "web", label: "did:web", hint: "Resolved from a domain you control." },
];

const KEY_TYPES = ["ed25519", "bls12381g2"];

/**
 * Creating a DID is a choice of method first and details second: the method
 * decides which of the remaining fields even apply, so it leads rather than
 * sitting in a select among the rest.
 */
export function CreateDidView() {
  const router = useRouter();
  const { addDid } = useDemo();
  const [method, setMethod] = useState("polygon");
  const [keyType, setKeyType] = useState("ed25519");
  const [alias, setAlias] = useState("");

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "DIDs", href: "/did-details" }, { label: "Create" }]}
          title="Create DID"
        />

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
              <legend className={`${LABEL_CLASS} p-0`}>DID method</legend>
              <div className="grid gap-2.5 min-[641px]:grid-cols-2">
                {METHODS.map((m) => (
                  <label
                    key={m.id}
                    className="ndi-lift flex cursor-pointer items-start gap-3 rounded-xl border p-3.5"
                    style={{
                      borderColor:
                        method === m.id ? "var(--border-strong)" : "var(--border-grid)",
                      background: method === m.id ? "var(--ndi-mint-08)" : "rgb(var(--tint) / 0.02)",
                    }}
                  >
                    <input
                      type="radio"
                      name="did-method"
                      className="ndi-check mt-0.5 flex-none"
                      checked={method === m.id}
                      onChange={() => setMethod(m.id)}
                    />
                    <span className="min-w-0">
                      <span className="block font-mono text-[13px] text-strong">{m.label}</span>
                      <span className="mt-1 block text-[12.5px] leading-[1.5] text-muted">
                        {m.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 min-[641px]:grid-cols-2">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Key type</span>
                <Select
                  label="Key type"
                  className="h-12 w-full"
                  value={keyType}
                  onChange={setKeyType}
                  options={KEY_TYPES.map((k) => ({ value: k, label: k }))}
                />
              </label>
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Alias</span>
                <input
                  className={`${FIELD_CLASS} h-12`}
                  placeholder="Issuer key"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </label>
            </div>

            {method === "web" ? (
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Domain</span>
                <input className={`${FIELD_CLASS} h-12`} placeholder="issuer.bhutanndi.bt" />
              </label>
            ) : null}

            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Seed</span>
              <input
                className={`${FIELD_CLASS} h-12 font-mono text-[13px]`}
                placeholder="Leave blank to generate"
              />
              <span className="text-[12.5px] leading-[1.5] text-faint">
                A seed you supply is never stored — keep your own copy, or the key cannot be
                recovered.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
              <GradientButton
                onClick={() => {
                  addDid({
                    method: `did:${method}`,
                    keyType,
                    alias: alias.trim() || "Untitled key",
                  });
                  router.push("/did-details");
                }}
              >
                <Icon name="fingerprint" size={16} strokeWidth={2} />
                Create DID
              </GradientButton>
              <HairlineButton className="h-12" onClick={() => router.push("/did-details")}>
                Cancel
              </HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
