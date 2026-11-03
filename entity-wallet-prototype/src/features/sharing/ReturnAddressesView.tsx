"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";

/**
 * SCR-PRS-06 — Where NDI sends people back to (EW-FLOW7-SD/D9, §7.3).
 *
 * REGISTERED, NEVER SUPPLIED
 *
 * NDI returns a customer only to an address listed here, matched exactly;
 * a session names one by identifier. Otherwise any link could send a
 * business's representative from NDI's wallet to a copy of the bank's site.
 * So the rule is on the page: full HTTPS addresses only, no wildcards.
 *
 * WHY EVERY CHANGE ASKS FOR A FRESH SIGN-IN
 *
 * In a verifier organisation the OWNER role isn't bound to a relation and
 * an ADMIN can acquire it (EW-FLOW3-SD §6.1). A return address is where
 * NDI sends other people's customers, so changing one asks the owner to
 * sign in again with Bhutan NDI, is recorded, and goes at once to every
 * owner and to NDI. The fresh sign-in is the dashed step.
 *
 * A technical screen for an IT lead, so "return address" and "HTTPS" are
 * allowed here (§3.2).
 */
type Face = "live" | "default" | "empty" | "loading" | "error_invalid" | "sign_in_again" | "offline" | "no_permission";

const ERRORS: Record<string, string> = {
  not_https: "Use an HTTPS address — this one doesn't start with https://.",
  wildcard: "Wildcards aren't allowed. Enter the exact address.",
  not_full: "Enter a full address, including the page — for example https://www.bob.bt/ekyb/return.",
  duplicate: "That address is already registered.",
  not_owner: "Only your organisation's owner can change return addresses.",
};

export function ReturnAddressesView() {
  const router = useRouter();
  const { returnAddresses, activeOrgId, organizations, personById, currentPerson, hydrated, canManageReturnAddresses, addReturnAddress, removeReturnAddress } = useDemo();
  const forced = useScreenState("SCR-PRS-06", ["live", "default", "empty", "loading", "error_invalid", "sign_in_again", "offline", "no_permission"]) as Face;

  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ kind: "add" } | { kind: "remove"; id: string } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const org = organizations.find((o) => o.id === activeOrgId);
  const all = returnAddresses.filter((a) => a.orgId === activeOrgId);
  const current = all.filter((a) => !a.removedAt);
  const owner = hydrated && canManageReturnAddresses();

  const natural: Face = !owner ? "no_permission" : pending ? "sign_in_again" : error ? "error_invalid" : current.length ? "default" : "empty";
  const face: Face = forced === "live" ? natural : forced;
  const readOnly = face === "no_permission" || face === "offline";

  const header = <PageHeader crumbs={[{ label: "Verification" }, { label: "Return addresses" }]} title="Where NDI sends people back to" />;

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <div aria-hidden="true" className="h-64 animate-pulse rounded-[16px] border border-grid" />
        </div>
      </AppShell>
    );
  }

  const confirm = () => {
    if (!pending) return;
    if (pending.kind === "add") {
      const res = addReturnAddress(url);
      if (res.ok) {
        setUrl("");
        setError(null);
      } else setError(ERRORS[res.error]);
    } else removeReturnAddress(pending.id);
    setPending(null);
  };

  /* The change history: every add and remove, newest first. */
  const history = all
    .flatMap((a) => [
      { at: a.addedAt, text: `${personById(a.addedBy).name} added ${a.url}` },
      ...(a.removedAt ? [{ at: a.removedAt, text: `${personById(a.removedBy ?? "").name} removed ${a.url}` }] : []),
    ])
    .sort((x, y) => y.at.localeCompare(x.at));

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-5">
        {header}
        <p className="m-0 max-w-[68ch] text-[13.5px] leading-[1.65] text-body">
          Full HTTPS addresses only. NDI will return people only to an address listed here, exactly as written.
        </p>
        {face === "offline" ? (
          <p role="status" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. These are the addresses as last loaded, read-only.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            {org && !org.capabilities.includes("verifier")
              ? `${org.name} isn't approved to verify, so it has no return addresses to manage.`
              : "Only your organisation's owner can change return addresses. You can see them."}
          </p>
        ) : null}

        {face === "empty" ? (
          <Panel padded={false}>
            <EmptyState icon="link" title="You haven't added a return address." message="You can't start requests from your website until you do." />
          </Panel>
        ) : (
          <Panel padded={false}>
            <DataTable columns={["Address", "Identifier", "Added", ""]}>
              {current.map((a) => (
                <tr key={a.id}>
                  <td className="break-all font-mono text-[12.5px] text-body">{a.url}</td>
                  <td className="font-mono text-[12px]">{a.returnUrlId}</td>
                  <td>
                    {personById(a.addedBy).name}
                    <span className="block text-[12px] text-faint">{formatDate(a.addedAt)}</span>
                  </td>
                  <td>
                    {!readOnly ? (
                      <button type="button" onClick={() => setRemoving(a.id)} className="ndi-plainlink text-[12.5px] font-medium text-muted">
                        Remove
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </DataTable>
          </Panel>
        )}

        {!readOnly ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>New return address</span>
                <input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://www.bob.bt/ekyb/return"
                  className={FIELD_CLASS}
                  aria-invalid={face === "error_invalid"}
                />
              </label>
              {face === "error_invalid" ? (
                <p role="alert" className="m-0 text-[13px] text-body" style={{ color: "var(--ndi-danger)" }}>
                  {error ?? ERRORS.not_https}
                </p>
              ) : null}
              <div>
                <GradientButton onClick={() => setPending({ kind: "add" })} disabled={!url.trim()}>
                  Add an address
                </GradientButton>
              </div>
              {face === "sign_in_again" ? (
                <SimulatedStep
                  standsFor="the Bhutan NDI sign-in on your phone"
                  action={<SimulatedAction onClick={confirm}>Sign in again as {currentPerson.name}</SimulatedAction>}
                >
                  Sign in again with Bhutan NDI to change return addresses.
                </SimulatedStep>
              ) : null}
            </div>
          </Panel>
        ) : null}

        <section aria-labelledby="ra-history" className="flex flex-col gap-2">
          <h2 id="ra-history" className="m-0 font-display text-[15px] font-semibold text-strong">
            Change history
          </h2>
          <p className="m-0 text-[13px] text-muted">
            Every change is recorded and sent at once to all of your organisation&rsquo;s owners and to NDI.
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {history.map((h, i) => (
              <li key={i} className="text-[13px] text-body">
                <span className="text-faint">{formatDate(h.at)}</span> · {h.text}
              </li>
            ))}
          </ul>
        </section>

        <Dialog
          open={Boolean(removing)}
          onClose={() => setRemoving(null)}
          title="Remove this return address?"
          lead="Sessions using this address will show people a message instead of returning them."
          confirmLabel="Remove"
          tone="danger"
          onConfirm={() => {
            if (removing) setPending({ kind: "remove", id: removing });
            setRemoving(null);
          }}
        />
      </div>
    </AppShell>
  );
}
