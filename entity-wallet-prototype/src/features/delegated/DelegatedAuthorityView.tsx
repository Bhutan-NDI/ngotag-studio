"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import type { DelegatedAuthority } from "@/lib/demoData";

import { describeConstraints } from "./constraints";

/**
 * The register in chain order: each authority, then — indented beneath it —
 * everything that hangs off it.
 *
 * WHY THE ORDER IS THE CHAIN AND NOT THE DATE
 *
 * This list used to run newest first. After act 4 that put the freshly issued
 * Declaration authority at the top, and its subtitle reads "under Customs
 * broker" — so the first row on the screen containing the words "Customs
 * broker" was the capability, not the role. The presenter's one instruction
 * at this point is "withdraw Customs broker", and the obvious click withdrew
 * the wrong thing: act 5 then failed for a different reason from the one
 * being narrated. Found by an automated walk of the story making exactly
 * that mistake.
 *
 * Chain order fixes it structurally rather than by wording: the role comes
 * first because nothing it depends on can sit below it, its dependents are
 * visibly subordinate, and the row an Owner is about to withdraw sits
 * directly above everything the withdrawal will take down. That last part is
 * the reason to prefer this over simply sorting roles first — the list now
 * previews the blast radius the revoke screen goes on to spell out.
 *
 * Within a level, newest first, as before. A parent that has been deleted
 * from the data (it cannot happen through the UI) leaves its children at the
 * top level rather than hiding them.
 */
function inChainOrder(all: DelegatedAuthority[]): { authority: DelegatedAuthority; depth: number }[] {
  const ids = new Set(all.map((a) => a.id));
  const childrenOf = (id: string | null) =>
    all.filter((a) => (id === null ? !a.parentId || !ids.has(a.parentId) : a.parentId === id));
  const out: { authority: DelegatedAuthority; depth: number }[] = [];
  const seen = new Set<string>();
  const walk = (authority: DelegatedAuthority, depth: number) => {
    /* The data cannot hold a cycle through the UI, but a register that hung
       the page on a malformed fixture would be a poor trade for one Set. */
    if (seen.has(authority.id)) return;
    seen.add(authority.id);
    out.push({ authority, depth });
    childrenOf(authority.id).forEach((child) => walk(child, depth + 1));
  };
  childrenOf(null).forEach((root) => walk(root, 0));
  return out;
}

const isLive = (a: DelegatedAuthority) => a.status !== "REVOKED" && a.status !== "EXPIRED";

/**
 * D1 — everything the entity has issued into other people's wallets.
 *
 * A register, built to the depth the plan asks for: correct columns,
 * populated, and a way through to the one thing you actually do from here.
 * Registers demo poorly and cost real time, so this one does not get filters,
 * search or sorting until something needs them.
 *
 * Two columns carry the weight. **Constraints** is what any verifier can read
 * off the credential, so it has to be legible here too — an Owner should be
 * able to audit what they have given away without opening five rows.
 * **Acceptance** is separate from status because they answer different
 * questions: an authority can be perfectly active and never have been taken
 * into anyone's wallet, and treating "issued" as "in use" is how an Owner
 * comes to believe someone can act when they cannot.
 */
export function DelegatedAuthorityView() {
  const { delegatedAuthorities, personById } = useDemo();

  const variant = useScreenState("D1", ["populated", "empty"]);
  const rows = variant === "empty" ? [] : inChainOrder(delegatedAuthorities);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Delegated authority" }]}
          title="Delegated authority"
          actions={
            <Link href="/delegated-authority/new">
              <GradientButton>
                <Icon name="plus" size={15} strokeWidth={2} />
                Issue authority
              </GradientButton>
            </Link>
          }
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Authority the entity has issued into people&rsquo;s own wallets. Each
          one carries constraints any counterparty can read, and each one traces
          back to a controllership relation. Withdrawing one takes effect
          wherever it is next used.
        </p>

        <Panel padded={false}>
          <DataTable
            columns={["Holder", "Authority", "Constraints", "Status", "Acceptance", ""]}
            empty={{
              icon: "send",
              title: "Nothing delegated yet",
              message:
                "When the entity issues a role or a capability into someone's wallet, it appears here — with the constraints a verifier will check against.",
              action: (
                <Link href="/delegated-authority/new">
                  <GradientButton>Issue authority</GradientButton>
                </Link>
              ),
            }}
          >
            {rows.map(({ authority, depth }) => {
              const holder = personById(authority.recipientId);
              const parent = authority.parentId
                ? delegatedAuthorities.find((a) => a.id === authority.parentId)
                : null;
              const dependents = delegatedAuthorities.filter(
                (a) => a.parentId === authority.id && isLive(a),
              ).length;

              return (
                <tr key={authority.id}>
                  <td>
                    <span className="flex flex-col">
                      <span className="text-body">{holder.name}</span>
                      <span className="text-[12px] text-faint">{holder.title}</span>
                    </span>
                  </td>
                  <td>
                    {/* Indented under its parent, with a connector, so the
                        chain reads down the column without the subtitle
                        having to carry it alone. */}
                    <span
                      className="flex items-start gap-2"
                      style={{ paddingLeft: depth > 0 ? `${depth * 20}px` : undefined }}
                    >
                      {depth > 0 ? (
                        <span
                          aria-hidden="true"
                          className="mt-[3px] h-3 w-3 flex-none rounded-bl-[4px] border-b border-l"
                          style={{ borderColor: "var(--border-strong)" }}
                        />
                      ) : null}
                      <span className="flex flex-col">
                        <span className={depth === 0 ? "font-medium text-strong" : "text-body"}>
                          {authority.title}
                        </span>
                        <span className="text-[12px] text-faint">
                          {authority.kind === "role" ? "Role" : "Capability"}
                          {/* The parent is what makes this a chain rather than
                              a list, and it is the column an Owner needs when
                              deciding what a revocation will take down with it. */}
                          {parent ? ` · under ${parent.title}` : ""}
                          {dependents > 0
                            ? ` · ${dependents} ${dependents === 1 ? "depends" : "depend"} on it`
                            : ""}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="max-w-[280px]">
                    <span className="text-[12.5px] leading-[1.5] text-muted">
                      {describeConstraints(authority)}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={authority.status} />
                  </td>
                  <td>
                    <StatusPill
                      status={
                        authority.acceptance === "accepted"
                          ? "accepted"
                          : authority.acceptance === "sent"
                            ? "awaiting_acceptance"
                            : authority.acceptance
                      }
                    />
                  </td>
                  <td>
                    {authority.status === "REVOKED" || authority.status === "EXPIRED" ? (
                      <span className="text-[12.5px] text-faint">—</span>
                    ) : (
                      <Link
                        href={`/delegated-authority/${authority.id}/revoke`}
                        /* Named for what it withdraws. Six links all read
                           "Withdraw" to a screen reader, and a list of
                           identical links is the same trap for someone
                           listening as the old ordering was for someone
                           looking. */
                        aria-label={`Withdraw ${authority.title}, held by ${holder.name}`}
                        className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-muted"
                      >
                        Withdraw
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
