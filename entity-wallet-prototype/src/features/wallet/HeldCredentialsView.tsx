"use client";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { formatDate } from "@/features/controllership/scopeModel";

/**
 * B3 — what the entity holds. A register, at the depth the plan asks for.
 *
 * The one thing it does beyond listing: the foundational credential is
 * visually separated rather than sorted to the top of the same table. It is
 * not one credential among several — it is the root every other credential
 * and every delegated authority chains back to, and burying it in a row
 * between a tax certificate and an insurance policy misstates what it is.
 */
export function HeldCredentialsView() {
  const { heldCredentials } = useDemo();

  const variant = useScreenState("B3", ["populated", "empty"]);
  const all = variant === "empty" ? [] : heldCredentials;

  const foundational = all.find((c) => c.isFoundational);
  const rest = all.filter((c) => !c.isFoundational);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Wallet" }, { label: "Held credentials" }]} title="What we hold" />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Credentials issued to Pelden Trading itself, held in the
          entity&rsquo;s wallet. Nobody carries these on a device — they are
          presented from here, by a controller acting for the entity.
        </p>

        {foundational ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-grid"
                    style={{ background: "var(--ndi-mint-12)" }}
                  >
                    <Icon name="shieldCheck" size={17} strokeWidth={1.9} className="text-accent" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      Root of trust
                    </p>
                    <p className="font-display text-[15px] font-semibold text-strong">
                      {foundational.type}
                    </p>
                    <p className="text-[12.5px] leading-[1.5] text-faint">
                      Issued by {foundational.issuer} · received{" "}
                      {formatDate(foundational.receivedAt)}
                    </p>
                  </div>
                </div>
                <StatusPill status={foundational.status} />
              </div>

              <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                Everything else the entity holds, and every authority it has
                delegated, traces back to this. If it lapses, nothing below it
                verifies anywhere.
              </p>

              <dl className="m-0 grid gap-x-6 gap-y-2 min-[641px]:grid-cols-2">
                {foundational.attributes.map((attribute) => (
                  <div key={attribute.name} className="flex flex-col gap-0.5">
                    <dt className="text-[12px] text-faint">
                      {attribute.name.replace(/_/g, " ")}
                    </dt>
                    <dd className="m-0 text-[13px] text-body">{attribute.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Panel>
        ) : null}

        <Panel padded={false}>
          <DataTable
            columns={["Credential", "Issuer", "Received", "Expires", "Status"]}
            empty={{
              icon: "credentials",
              title: variant === "empty" ? "The wallet is empty" : "Nothing else held yet",
              message:
                "Credentials offered to the entity appear under Offers. Accepting one puts it here.",
            }}
          >
            {rest.map((credential) => (
              <tr key={credential.id}>
                <td className="text-body">{credential.type}</td>
                <td>{credential.issuer}</td>
                <td>{formatDate(credential.receivedAt)}</td>
                <td>{credential.expiresAt ? formatDate(credential.expiresAt) : "—"}</td>
                <td>
                  <StatusPill status={credential.status} />
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
