"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { SearchField } from "@/components/ui/SearchField";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * x509 certificates, for counterparties that trust a PKI chain rather than a
 * DID. Expiry is a column, not a detail: a lapsed certificate breaks
 * verification silently, so it has to be readable from the list.
 */
export function CertificatesView() {
  const { certificates, addCertificate, removeCertificate } = useDemo();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [commonName, setCommonName] = useState("");
  const [keyType, setKeyType] = useState("RSA 2048");
  const [expires, setExpires] = useState("");

  const q = query.trim().toLowerCase();
  const rows = certificates.filter((c) => !q || c.commonName.toLowerCase().includes(q));

  const submit = () => {
    if (!commonName.trim()) return;
    addCertificate({
      commonName: commonName.trim(),
      keyType,
      expires: expires || "2027-01-01",
    });
    setCommonName("");
    setExpires("");
    setAdding(false);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Trust" }, { label: "x509 certificates" }]}
          title="x509 certificates"
          actions={
            <>
              <SearchField
                className="w-full min-[561px]:w-[280px]"
                placeholder="Search certificates"
                value={query}
                onChange={setQuery}
              />
              <GradientButton className="h-11" onClick={() => setAdding((a) => !a)}>
                <Icon name={adding ? "close" : "plus"} size={16} strokeWidth={2} />
                {adding ? "Cancel" : "Add certificate"}
              </GradientButton>
            </>
          }
        />

        {adding ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-5">
              <div className="grid gap-4 min-[641px]:grid-cols-3">
                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Common name</span>
                  <input
                    className={`${FIELD_CLASS} h-12`}
                    placeholder="issuer.bhutanndi.bt"
                    value={commonName}
                    onChange={(e) => setCommonName(e.target.value)}
                  />
                </label>
                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Key type</span>
                  <Select
                    label="Key type"
                    className="h-12 w-full"
                    value={keyType}
                    onChange={setKeyType}
                    options={["RSA 2048", "RSA 4096", "ECDSA P-256"].map((v) => ({
                      value: v,
                      label: v,
                    }))}
                  />
                </label>
                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Expires</span>
                  <input
                    type="date"
                    className={`${FIELD_CLASS} h-12`}
                    value={expires}
                    onChange={(e) => setExpires(e.target.value)}
                  />
                </label>
              </div>
              <div className="border-t border-subtle pt-5">
                <GradientButton onClick={submit}>
                  <Icon name="check" size={16} strokeWidth={2.2} />
                  Add certificate
                </GradientButton>
              </div>
            </div>
          </Panel>
        ) : null}

        <Panel padded={false}>
          <Toolbar left={<ToolbarCount>{rows.length} certificates</ToolbarCount>} />
          <DataTable
            columns={["Common name", "Key type", "Valid from", "Expires", "Status", ""]}
            empty={{
              icon: "certificate",
              title: q ? "No certificates match that search" : "No certificates yet",
              message: q
                ? "Nothing here matches what you typed."
                : "Add an x509 certificate when a relying party trusts a PKI chain rather than a DID.",
              action: q ? undefined : (
                <GradientButton onClick={() => setAdding(true)}>
                  <Icon name="plus" size={16} strokeWidth={2} />
                  Add certificate
                </GradientButton>
              ),
            }}
          >
            {rows.length
              ? rows.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono text-[13px] text-strong">{c.commonName}</td>
                    <td className="text-muted">{c.keyType}</td>
                    <td className="text-muted">{c.validFrom}</td>
                    <td className="text-muted">{c.expires}</td>
                    <td>
                      <StatusPill status={c.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeCertificate(c.id)}
                        className="ndi-plainlink whitespace-nowrap text-[12.5px] text-muted"
                      >
                        Remove
                      </button>
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
