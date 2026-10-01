"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Countdown } from "@/components/ui/Countdown";
import { DetailList } from "@/components/ui/DetailList";
import { Dialog } from "@/components/ui/Dialog";
import { DualAttribution } from "@/components/ui/DualAttribution";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff } from "@/components/ui/WalletHandoff";
import { ScopeSummary } from "@/components/ui/ScopeSummary";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";
import { useDemo } from "@/lib/demoStore";

/**
 * B7 — the decision moment, and the wallet signature that can carry it.
 *
 * WHY THE PAYLOAD HASH IS ON THE SCREEN
 *
 * An approval can be a verified presentation rather than a web click: the
 * operation's payload hash is embedded in a proof request the approver
 * answers from their own wallet, which turns "somebody clicked approve" into
 * "this person cryptographically committed to this exact operation". For that
 * to mean anything to the approver, the hash they are signing has to be
 * visible next to the operation it describes — otherwise they are trusting
 * the screen, which is the thing the signature was supposed to remove.
 *
 * WHY THE DISCLOSURE IS SHOWN, NOT SUMMARISED
 *
 * An approver deciding "present Business Registration to Bank of Bhutan" has
 * not been told what will be disclosed. The attribute list is the substance
 * of what they are approving, so it is listed in full — a count would let
 * somebody approve five attributes believing they had approved two.
 *
 * DUAL CONTROL NEEDS A DIFFERENT PERSON
 *
 * The second signature must come from someone who has not already signed.
 * That is checked here rather than left to policy, because the entire value
 * of dual control is that it is two people, and a UI that let one person
 * press approve twice would have quietly removed the control while appearing
 * to enforce it.
 */
export function ApprovalDetailView({ operationId }: { operationId: string }) {
  const router = useRouter();
  const {
    parkedOperations,
    verificationRequests,
    offers,
    relations,
    personById,
    harness,
    approveOperation,
    rejectOperation,
  } = useDemo();

  const screenState = useScreenState("B7", [
    "reviewable",
    "awaiting_signature",
    "approved",
    "rejected",
    "expired",
    "stale",
  ]);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [signing, setSigning] = useState(false);

  const operation = parkedOperations.find((p) => p.id === operationId);

  if (!operation) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader
            crumbs={[{ label: "Approvals", href: "/approvals" }, { label: "Not found" }]}
            title="Operation not found"
          />
          <Panel>
            <p className="relative z-[4] text-[13.5px] text-muted">
              It may have been decided already, or reset with the demo.{" "}
              <Link href="/approvals" className="ndi-plainlink text-accent">
                Back to approvals
              </Link>
              .
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const requester = personById(operation.requestedBy);
  const relation = relations.find((r) => r.id === operation.relationId);

  const state = screenState === "reviewable" ? operation.state : screenState;
  const decided =
    state === "approved" || state === "rejected" || state === "expired" || state === "stale";

  /* Whatever this is holding back, so its substance can be shown. */
  const request = operation.targetId
    ? verificationRequests.find((v) => v.id === operation.targetId)
    : undefined;
  const offer = operation.targetId
    ? offers.find((o) => o.id === operation.targetId)
    : undefined;

  const disclosing = request?.disclosing ?? request?.requiredAttributes ?? [];

  const alreadySigned = operation.signatures.some((s) => s.personId === harness.persona);
  const remaining = operation.requiredSignatures - operation.signatures.length;

  const signViaWallet = () => {
    setSigning(true);
    /* The approver answers a proof request on their phone. Authored wait,
       because the hand-off is the point and an instant signature would look
       like a checkbox. */
    setTimeout(() => {
      approveOperation(operation.id, "wallet");
      setSigning(false);
    }, ROUND_TRIP_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Approvals", href: "/approvals" }, { label: "Decision" }]}
          title={operation.summary}
          actions={<StatusPill status={state} />}
        />

        {state === "stale" ? (
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
                  Approved, then no longer valid
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {operation.invalidatedReason ??
                    "The authority behind this changed after it was approved, so it was never run."}
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  Operations are checked again at the moment they run, not just
                  when they are approved. Nothing happened here.
                </p>
              </div>
            </div>
          </Panel>
        ) : null}

        {state === "expired" ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon name="info" size={18} strokeWidth={2} className="mt-0.5 flex-none text-faint" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  Nobody decided this in time
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  It lapsed rather than going through. The controller can raise
                  it again if it is still needed.
                </p>
              </div>
            </div>
          </Panel>
        ) : null}

        {state === "approved" ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 flex-none text-accent" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  Approved, and it has run
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  The record names who did it and who approved it — both, on the
                  same row.
                </p>
                <div className="mt-2">
                  <Link href="/controllership/audit">
                    <HairlineButton>
                      See the record
                      <Icon name="arrowRight" size={14} strokeWidth={2} />
                    </HairlineButton>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        ) : null}

        {/* ---- What is being decided ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              The operation
            </h2>
          </div>
          <div className="relative z-[4]">
            <DetailList
              items={[
                {
                  label: "Requested by",
                  value: (
                    <DualAttribution
                      entity="Pelden Trading Pvt. Ltd."
                      actorId={operation.requestedBy}
                      size="compact"
                    />
                  ),
                },
                {
                  label: "Under authority",
                  value: relation
                    ? `${requester.name}'s controllership · scope version ${operation.scopeVersion}`
                    : "—",
                },
                ...(operation.targetRelyingParty
                  ? [{ label: "Relying party", value: operation.targetRelyingParty }]
                  : []),
                {
                  label: "Policy",
                  value:
                    operation.requiredSignatures === 2
                      ? "Two approvers (dual control)"
                      : operation.requiredSignatures === 1
                        ? "One approver"
                        : "No approval required",
                },
                {
                  label: "What you would sign",
                  value: operation.payloadHash,
                  mono: true,
                },
              ]}
            />
          </div>
          <p className="relative z-[4] mt-2 max-w-[62ch] text-[12px] leading-[1.5] text-faint">
            That fingerprint covers this exact operation. Signing it from your
            wallet commits you to this and nothing else — if any detail
            changed, the fingerprint would change with it.
          </p>
        </Panel>

        {/* ---- The substance ---- */}
        {request ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-1">
              <h2 className="font-display text-[15px] font-semibold text-strong">
                What would be disclosed
              </h2>
              <p className="text-[12.5px] leading-[1.5] text-faint">
                {disclosing.length} of {request.requestedAttributes.length} attributes
                the relying party asked for.
              </p>
            </div>
            <ul className="relative z-[4] mt-3 flex flex-wrap gap-1.5">
              {request.requestedAttributes.map((name) => {
                const on = disclosing.includes(name);
                return (
                  <li
                    key={name}
                    className="rounded-full border px-2.5 py-1 text-[12.5px]"
                    style={{
                      borderColor: on ? "var(--ndi-mint-40)" : "var(--border-grid)",
                      background: on ? "var(--ndi-mint-08)" : "transparent",
                      color: on ? "var(--accent)" : "var(--text-faint)",
                      textDecoration: on ? undefined : "line-through",
                    }}
                  >
                    {name.replace(/_/g, " ")}
                  </li>
                );
              })}
            </ul>
            <p className="relative z-[4] mt-3 text-[12.5px] leading-[1.5] text-muted">
              Struck through means it was asked for and withheld. You are
              approving the disclosure on the left, not the request.
            </p>
          </Panel>
        ) : null}

        {offer ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-1">
              <h2 className="font-display text-[15px] font-semibold text-strong">
                What would be accepted
              </h2>
              <p className="text-[12.5px] leading-[1.5] text-faint">
                Offered by {offer.issuer}, read from the offer payload.
              </p>
            </div>
            <ul className="relative z-[4] mt-3 flex flex-col">
              {offer.attributes.map((attribute, i) => (
                <li
                  key={attribute.name}
                  className={`grid gap-0.5 py-2 min-[521px]:grid-cols-[200px_1fr] min-[521px]:gap-6 ${
                    i > 0 ? "border-t border-subtle" : ""
                  }`}
                >
                  <span className="text-[12.5px] text-faint">
                    {attribute.name.replace(/_/g, " ")}
                  </span>
                  <span className="text-[13px] text-body">{attribute.value}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {/* ---- Was it in scope ---- */}
        {relation ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-1">
              <h2 className="font-display text-[15px] font-semibold text-strong">
                The authority it was done under
              </h2>
              <p className="text-[12.5px] leading-[1.5] text-faint">
                Matched against scope version {operation.scopeVersion}.
              </p>
            </div>
            <div className="relative z-[4] mt-3">
              <ScopeSummary
                personName={requester.name}
                scope={relation.scope}
                isRootAuthority={relation.isRootAuthority}
                state={relation.state}
              />
            </div>
          </Panel>
        ) : null}

        {/* ---- Deciding ---- */}
        {!decided ? (
          signing ? (
            <Panel>
              <WalletHandoff
                value={operation.payloadHash}
                title="Confirm this in your wallet"
                purpose="Signing the operation's fingerprint from your own wallet is what turns this approval into evidence rather than a click."
                sharing={[
                  "That it was you who approved it, proved from your wallet",
                  "A commitment to this exact operation and nothing else",
                ]}
                status="waiting"
                onCancel={() => setSigning(false)}
                onSkip={() => {
                  approveOperation(operation.id, "wallet");
                  setSigning(false);
                }}
              />
            </Panel>
          ) : (
            <div className="flex flex-col gap-2.5">
              {alreadySigned ? (
                <p
                  className="rounded-[10px] border px-3 py-2.5 text-[12.5px] leading-[1.5]"
                  style={{
                    borderColor: "rgb(245 183 64 / 0.4)",
                    background: "rgb(245 183 64 / 0.08)",
                    color: "var(--text-body)",
                  }}
                >
                  You have already signed this one. Dual control means the
                  remaining signature has to come from someone else — switch
                  person to continue.
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2.5">
                <GradientButton onClick={signViaWallet} disabled={alreadySigned}>
                  <Icon name="fingerprint" size={15} strokeWidth={2} />
                  Approve and sign from wallet
                </GradientButton>
                <HairlineButton
                  onClick={() => approveOperation(operation.id, "web")}
                  disabled={alreadySigned}
                >
                  Approve here
                </HairlineButton>
                <button
                  type="button"
                  onClick={() => setRejectOpen(true)}
                  className="ndi-dialog-confirm inline-flex h-11 items-center gap-2 rounded-[10px] px-4 font-display text-[13.5px] font-semibold"
                  data-tone="danger"
                >
                  Reject
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Countdown expiresAt={operation.expiresAt} />
                {remaining > 1 ? (
                  <span className="text-[12.5px] text-muted">
                    {remaining} signatures still needed
                  </span>
                ) : null}
              </div>

              <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
                Signing from your wallet is the stronger of the two: it ties
                this decision to your verified identity rather than to a
                session. Approving here is recorded as a console decision.
              </p>
            </div>
          )
        ) : null}

        <Dialog
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          tone="danger"
          title="Reject this operation?"
          lead={`It will not run, and ${requester.name} will be told why. They can raise it again if it is still needed.`}
          confirmLabel="Reject it"
          confirmDisabled={reason.trim() === ""}
          onConfirm={() => {
            rejectOperation(operation.id, reason.trim());
            setRejectOpen(false);
            router.push("/approvals");
          }}
        >
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Reason</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="The bank does not need the registered address for this. Present without it."
              className={`${FIELD_CLASS} resize-y py-3`}
            />
            <span className="text-[12px] leading-[1.5] text-faint">
              {requester.name} sees this. A rejection without a reason reads as
              a refusal to explain.
            </span>
          </label>
        </Dialog>
      </div>
    </AppShell>
  );
}
