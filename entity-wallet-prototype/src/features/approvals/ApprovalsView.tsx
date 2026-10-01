"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Countdown } from "@/components/ui/Countdown";
import { DualAttribution } from "@/components/ui/DualAttribution";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * B6 — the approval queue.
 *
 * Cards rather than a table, which is a departure from every other register
 * here and is deliberate. A row in a table is something you scan; an approval
 * is something you decide, and the decision needs the requester, the
 * disclosure, the counterparty, the signature progress and the time left all
 * legible at once. Compressed into table cells, the TTL becomes a date and
 * the signature progress becomes "1/2" — both technically present and neither
 * doing its job.
 *
 * Grouped by whether the clock matters. An approver's real question on
 * opening this is "what will lapse if I go to lunch", and sorting by date
 * answers a different question.
 */
export function ApprovalsView() {
  const { parkedOperations, personById } = useDemo();

  const variant = useScreenState("B6", ["queue", "empty", "history"]);

  const live = parkedOperations.filter(
    (p) => p.state === "parked" || p.state === "awaiting_signature",
  );
  const decided = parkedOperations.filter(
    (p) => p.state !== "parked" && p.state !== "awaiting_signature",
  );

  const showing = variant === "empty" ? [] : variant === "history" ? decided : live;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Approvals" }]}
          title="Approvals"
          actions={
            live.length > 0 && variant !== "history" ? (
              <StatusPill status="parked" label={`${live.length} waiting`} />
            ) : null
          }
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Operations that policy holds back until somebody authorised decides
          them. Nothing here has happened yet — and nothing here will happen
          unless it is approved before it lapses.
        </p>

        {showing.length === 0 ? (
          <Panel padded={false}>
            <EmptyState
              icon="userCheck"
              title={variant === "history" ? "Nothing decided yet" : "Nothing waiting"}
              message={
                variant === "history"
                  ? "Decisions you and others have made will be listed here."
                  : "When a controller does something that policy holds back, it appears here for a decision. An empty queue means nothing is blocked."
              }
            />
          </Panel>
        ) : (
          <div className="flex flex-col gap-4">
            {showing.map((operation) => {
              const requester = personById(operation.requestedBy);
              const collected = operation.signatures.length;
              const needed = operation.requiredSignatures;
              const partly = collected > 0 && collected < needed;

              return (
                <Panel key={operation.id}>
                  <div className="relative z-[4] flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          {operation.operation.replace(/:/g, " · ")}
                        </p>
                        <p className="font-display text-[15px] font-semibold leading-[1.3] text-strong">
                          {operation.summary}
                        </p>
                      </div>
                      <StatusPill status={operation.state} />
                    </div>

                    <div className="grid gap-4 min-[641px]:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <p className="text-[12px] text-faint">Requested by</p>
                        <DualAttribution
                          entity="Pelden Trading Pvt. Ltd."
                          actorId={operation.requestedBy}
                          size="compact"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-[12px] text-faint">
                          {needed > 1 ? "Signatures" : "Approval"}
                        </p>
                        {needed === 0 ? (
                          <p className="text-[13px] text-muted">Nothing required</p>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <p className="text-[13px] text-body">
                              {collected} of {needed} collected
                            </p>
                            {operation.signatures.map((signature) => (
                              <p key={signature.personId} className="text-[12px] text-faint">
                                {personById(signature.personId).name} ·{" "}
                                {signature.method === "wallet" ? "signed from wallet" : "approved in console"}
                              </p>
                            ))}
                            {partly ? (
                              <p
                                className="text-[12px]"
                                style={{ color: "var(--ndi-warning)" }}
                              >
                                Needs a different person for the second signature.
                              </p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    {operation.invalidatedReason ? (
                      <p
                        className="rounded-[10px] border px-3 py-2.5 text-[12.5px] leading-[1.5]"
                        style={{
                          borderColor: "rgb(225 73 62 / 0.35)",
                          background: "rgb(225 73 62 / 0.07)",
                          color: "var(--text-body)",
                        }}
                      >
                        {operation.invalidatedReason}
                      </p>
                    ) : null}

                    {operation.decisionReason ? (
                      <p className="text-[12.5px] leading-[1.5] text-muted">
                        {operation.decisionReason}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-3">
                      {operation.state === "parked" ? (
                        <Countdown expiresAt={operation.expiresAt} />
                      ) : (
                        <span className="text-[12.5px] text-faint">
                          {requester.name} requested this
                        </span>
                      )}

                      {operation.state === "parked" ? (
                        <Link
                          href={`/approvals/${operation.id}`}
                          className="ndi-hairline-btn inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-grid px-3.5 font-display text-[13px] font-medium"
                        >
                          Review and decide
                          <Icon name="arrowRight" size={14} strokeWidth={2} />
                        </Link>
                      ) : (
                        <Link
                          href={`/approvals/${operation.id}`}
                          className="ndi-plainlink text-[12.5px] font-medium text-muted"
                        >
                          Open
                        </Link>
                      )}
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
