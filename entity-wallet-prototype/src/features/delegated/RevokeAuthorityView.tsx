"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { Dialog } from "@/components/ui/Dialog";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { useDemo } from "@/lib/demoStore";

import { describeConstraints, taskScopeLabel } from "./constraints";

/**
 * D4 — withdraw an authority. Suspend, which is reversible, or revoke, which
 * is not.
 *
 * THE BLAST-RADIUS PREVIEW IS THE SCREEN.
 *
 * "Are you sure?" asks a question the Owner cannot answer. What they need to
 * know is what stops: this authority, everything hanging off it, and the
 * transactions somebody is part-way through at a counterparty right now. So
 * the consequences are computed from the actual chain and listed before the
 * button, and the confirm dialog repeats them rather than asking again.
 *
 * WHY A REASON IS REQUIRED RATHER THAN OPTIONAL
 *
 * The reason is not for the Owner's records. It goes to the holder in the
 * withdrawal notice, alongside a reference they can appeal against — and a
 * person told only that their authority is gone has been given no way to
 * challenge it. Making the field optional would produce exactly that outcome
 * most of the time, so it gates the action.
 *
 * SUSPEND IS OFFERED FIRST, AND MORE PROMINENTLY
 *
 * Most withdrawals are precautionary: something looks wrong and the Owner
 * wants it to stop while they find out. Revocation is final and cannot be
 * undone by anyone, so the reversible option leads and the irreversible one
 * sits behind the danger treatment.
 */
export function RevokeAuthorityView({ authorityId }: { authorityId: string }) {
  const router = useRouter();
  const {
    delegatedAuthorities,
    personById,
    suspendAuthority,
    reactivateAuthority,
    revokeAuthority,
  } = useDemo();

  const screenState = useScreenState("D4", ["active", "suspended", "revoked"]);

  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState<"suspend" | "revoke" | null>(null);

  const authority = delegatedAuthorities.find((a) => a.id === authorityId);

  if (!authority) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader
            crumbs={[
              { label: "Delegated authority", href: "/delegated-authority" },
              { label: "Not found" },
            ]}
            title="Authority not found"
          />
          <Panel>
            <p className="relative z-[4] text-[13.5px] text-muted">
              It may have been reset with the demo.{" "}
              <Link href="/delegated-authority" className="ndi-plainlink text-accent">
                Back to the register
              </Link>
              .
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const holder = personById(authority.recipientId);
  const status = screenState === "active" ? authority.status.toLowerCase() : screenState;

  /* Everything that hangs off this, however deep. A role's capabilities stop
     verifying the moment the role goes, and an Owner who does not know that
     is about to break more than they mean to. */
  const collectDescendants = (id: string): typeof delegatedAuthorities => {
    const direct = delegatedAuthorities.filter((a) => a.parentId === id);
    return direct.flatMap((child) => [child, ...collectDescendants(child.id)]);
  };
  const dependents = collectDescendants(authority.id).filter(
    (a) => a.status === "ACTIVE" || a.status === "SUSPENDED",
  );

  const consequences = [
    `${holder.name} can no longer use ${authority.title} anywhere`,
    ...dependents.map(
      (d) =>
        `${d.title}, held by ${personById(d.recipientId).name}, stops verifying — it depends on this`,
    ),
    "Any transaction part-way through at a counterparty will fail when it is checked",
    "The next verification anywhere fails, within a minute",
  ];

  const act = (kind: "suspend" | "revoke") => {
    if (kind === "suspend") suspendAuthority(authority.id, reason.trim());
    else revokeAuthority(authority.id, reason.trim());
    setConfirm(null);
    /* Straight to the verifier, because the point of doing this in a demo is
       to watch it take effect somewhere else. */
    if (kind === "revoke") router.push("/verifier/bnsw");
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Delegated authority", href: "/delegated-authority" },
            { label: authority.title },
          ]}
          title={`Withdraw ${authority.title}`}
          actions={<StatusPill status={status} />}
        />

        {status === "revoked" ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon
                name="shieldAlert"
                size={18}
                strokeWidth={2}
                className="mt-0.5 flex-none"
                style={{ color: "var(--ndi-danger)" }}
              />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  This was revoked, and cannot be reinstated
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {authority.endedReason
                    ? `Reason given: ${authority.endedReason}`
                    : "No reason was recorded."}
                  {authority.appealReference
                    ? ` ${holder.name} was notified, with appeal reference ${authority.appealReference}.`
                    : ""}
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  If {holder.name.split(" ")[0]} needs this authority again, a new
                  one has to be issued and accepted from the beginning.
                </p>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  <Link href="/verifier/bnsw">
                    <HairlineButton>
                      See what happens at the counterparty now
                      <Icon name="arrowRight" size={14} strokeWidth={2} />
                    </HairlineButton>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        ) : null}

        {status === "suspended" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Icon
                  name="info"
                  size={18}
                  strokeWidth={2}
                  className="mt-0.5 flex-none"
                  style={{ color: "var(--ndi-warning)" }}
                />
                <div className="flex flex-col gap-1">
                  <p className="font-display text-[14.5px] font-semibold text-strong">
                    Paused, and reversible
                  </p>
                  <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                    Nothing verifies while it is paused, but the credential is
                    still in {holder.name.split(" ")[0]}&rsquo;s wallet and can be
                    switched back on without reissuing anything.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <HairlineButton onClick={() => reactivateAuthority(authority.id)}>
                  <Icon name="refresh" size={14} strokeWidth={2} />
                  Lift the suspension
                </HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {/* ---- What this is ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              What you are withdrawing
            </h2>
          </div>
          <div className="relative z-[4]">
            <DetailList
              items={[
                { label: "Held by", value: `${holder.name} · ${holder.title}` },
                {
                  label: "Kind",
                  value: authority.kind === "role" ? "Role" : "Capability",
                },
                { label: "Tasks", value: authority.taskScopes.map(taskScopeLabel).join(", ") },
                { label: "Constraints", value: describeConstraints(authority) },
                { label: "Expires anyway", value: authority.validUntil },
              ]}
            />
          </div>
        </Panel>

        {/* ---- The blast radius ---- */}
        {status !== "revoked" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-1">
              <h2 className="font-display text-[15px] font-semibold text-strong">
                What this will stop
              </h2>
              <p className="text-[12.5px] leading-[1.5] text-faint">
                Computed from what actually depends on this authority right now.
              </p>
            </div>

            <ul className="relative z-[4] mt-3 flex flex-col gap-2">
              {consequences.map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <Icon
                    name="arrowRight"
                    size={13}
                    strokeWidth={2}
                    className="mt-[5px] flex-none text-faint"
                  />
                  <span className="text-[13px] leading-[1.55] text-body">{line}</span>
                </li>
              ))}
            </ul>

            {dependents.length > 0 ? (
              <p
                className="relative z-[4] mt-3 rounded-[10px] border px-3 py-2.5 text-[12.5px] leading-[1.5]"
                style={{
                  borderColor: "rgb(245 183 64 / 0.4)",
                  background: "rgb(245 183 64 / 0.08)",
                  color: "var(--text-body)",
                }}
              >
                {dependents.length === 1 ? "One authority hangs" : `${dependents.length} authorities hang`}{" "}
                off this one. Withdrawing it stops{" "}
                {dependents.length === 1 ? "that one" : "those"} too, without
                touching{" "}
                {dependents.length === 1 ? "its own status" : "their own statuses"} —
                the chain above{" "}
                {dependents.length === 1 ? "it is" : "them is"} simply broken.
              </p>
            ) : null}
          </Panel>
        ) : null}

        {/* ---- The reason, then the actions ---- */}
        {status !== "revoked" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-4">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Reason</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Withdrawn pending an internal review of declaration values submitted in August."
                  className={`${FIELD_CLASS} resize-y py-3`}
                />
                <span className="text-[12px] leading-[1.5] text-faint">
                  {holder.name} is told this, with a reference they can appeal
                  against. Write it for them, not for the file.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2.5">
                {status !== "suspended" ? (
                  <HairlineButton
                    onClick={() => setConfirm("suspend")}
                    disabled={reason.trim() === ""}
                  >
                    <Icon name="lock" size={14} strokeWidth={2} />
                    Suspend — reversible
                  </HairlineButton>
                ) : null}
                <button
                  type="button"
                  onClick={() => setConfirm("revoke")}
                  disabled={reason.trim() === ""}
                  className="ndi-dialog-confirm inline-flex h-11 items-center gap-2 rounded-[10px] px-4 font-display text-[13.5px] font-semibold disabled:opacity-55"
                  data-tone="danger"
                >
                  <Icon name="trash" size={14} strokeWidth={2} />
                  Revoke — final
                </button>
              </div>
              {reason.trim() === "" ? (
                <p className="text-[12.5px] leading-[1.5] text-faint">
                  A reason is needed before either. Withdrawing someone&rsquo;s
                  authority without telling them why leaves them nothing to
                  appeal against.
                </p>
              ) : null}
            </div>
          </Panel>
        ) : null}

        <Dialog
          open={confirm === "suspend"}
          onClose={() => setConfirm(null)}
          title={`Suspend ${authority.title}?`}
          lead={`It stops working straight away and can be switched back on later without reissuing anything. ${holder.name} will be told why.`}
          consequences={consequences}
          confirmLabel="Suspend it"
          onConfirm={() => act("suspend")}
        />

        <Dialog
          open={confirm === "revoke"}
          onClose={() => setConfirm(null)}
          tone="danger"
          title={`Revoke ${authority.title}?`}
          lead="This cannot be undone by anyone, including you. If it turns out to be a mistake, a new authority has to be issued and accepted from the beginning."
          consequences={consequences}
          confirmLabel="Revoke permanently"
          onConfirm={() => act("revoke")}
        />
      </div>
    </AppShell>
  );
}
