"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/Checkbox";
import { Countdown } from "@/components/ui/Countdown";
import { DetailLayout } from "@/components/ui/DetailLayout";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * B5 — answer a relying party's request, disclosing as little as will do.
 *
 * THE DEFAULT IS THE DESIGN.
 *
 * The selector opens with only the required attributes ticked, and everything
 * else the relying party asked for left off. That is the entire least-
 * disclosure principle expressed as an initial state: the Controller has to
 * consciously add each extra attribute, and can never over-disclose by
 * accepting a default. A screen that pre-ticked all five "because the bank
 * asked for five" would satisfy the letter of the request and lose the point
 * of the product.
 *
 * Required attributes cannot be unticked. Not a permission — presenting
 * without them produces a proof the relying party cannot use, so refusing the
 * interaction is kinder than letting someone build a useless presentation and
 * discover it afterwards.
 *
 * WHAT THE COUNTER IS FOR
 *
 * "Disclosing 2 of 5 requested" sits beside the button, because the number is
 * the thing an approver will be asked about and the thing a controller will
 * be judged on later. Making it visible at the moment of choosing is cheaper
 * than explaining it in the audit trail afterwards.
 */
export function PresentProofView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const {
    verificationRequests,
    heldCredentials,
    presentProof,
    parkPresentation,
    declineVerificationRequest,
    parkedOperations,
  } = useDemo();

  const screenState = useScreenState("B5", [
    "ready",
    "not_permitted",
    "awaiting_approval",
    "presented",
    "expired",
  ]);

  const request = verificationRequests.find((v) => v.id === requestId);

  /* Opens at the minimum. Everything else is opt-in, one tick at a time. */
  const [selected, setSelected] = useState<string[]>(request?.requiredAttributes ?? []);
  const [asked, setAsked] = useState(false);

  if (!request) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader
            crumbs={[
              { label: "Verification requests", href: "/wallet/verification-requests" },
              { label: "Not found" },
            ]}
            title="Request not found"
          />
          <Panel>
            <p className="relative z-[4] text-[13.5px] text-muted">
              It may have been reset with the demo.{" "}
              <Link
                href="/wallet/verification-requests"
                className="ndi-plainlink text-accent"
              >
                Back to requests
              </Link>
              .
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const decision = screenState === "not_permitted" ? "out_of_scope" : request.decision;
  const state =
    screenState === "awaiting_approval"
      ? "parked"
      : screenState === "presented"
        ? "presented"
        : screenState === "expired"
          ? "expired"
          : request.state;

  const refused = decision === "out_of_scope";
  const needsApproval = decision === "requires_approval";
  const parked = parkedOperations.find(
    (p) => p.targetId === request.id && p.state === "parked",
  );
  const settled = state === "presented" || state === "declined" || state === "expired";

  /* The credential the entity would answer with. Named so the Controller can
     see the proof will come from something the entity actually holds. */
  const source = heldCredentials.find((c) => c.type === request.credentialType);

  const toggle = (name: string) => {
    if (request.requiredAttributes.includes(name)) return;
    setSelected((current) =>
      current.includes(name) ? current.filter((a) => a !== name) : [...current, name],
    );
  };

  const extra = selected.filter((a) => !request.requiredAttributes.includes(a));

  /* Who is asking, and whether they are accredited, is the thing you weigh
     the disclosure against — so on a wide screen it stays in view beside the
     attribute list rather than scrolling away above it. */
  const asker = (
    <Panel>
      <div className="relative z-[4] flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Asked by
          </p>
          <p className="font-display text-[14.5px] font-semibold text-strong">
            {request.relyingParty}
          </p>
          <p className="break-all font-mono text-[11.5px] text-faint">
            {request.relyingPartyDid}
          </p>
        </div>
        <StatusPill
          status={request.relyingPartyTrusted ? "verified" : "pending"}
          label={
            request.relyingPartyTrusted
              ? "On the trust registry"
              : "Not on the trust registry"
          }
        />
      </div>

      {request.requestsControllershipProof ? (
        <p className="relative z-[4] mt-3 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
          They have also asked for proof that you are authorised to act for
          the entity. That is shared only because they asked — it is not
          attached to presentations by default.
        </p>
      ) : null}
    </Panel>
  );

  return (
    <AppShell>
      <DetailLayout
        header={
          <PageHeader
            crumbs={[
              { label: "Verification requests", href: "/wallet/verification-requests" },
              { label: request.relyingParty },
            ]}
            title={`${request.relyingParty} is asking for a proof`}
            actions={<StatusPill status={state} />}
          />
        }
        side={asker}
      >
        {refused ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon
                name="lockRounded"
                size={18}
                strokeWidth={1.9}
                className="mt-0.5 flex-none"
                style={{ color: "var(--ndi-warning)" }}
              />
              <div className="flex flex-col gap-2">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  You cannot answer this one
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {request.decisionReason ??
                    "Your authority does not allow presentations to this relying party."}
                </p>
                {asked ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className="mt-1 flex items-start gap-2 text-[13px] leading-[1.5] text-accent"
                  >
                    <Icon name="check" size={14} strokeWidth={2.2} className="mt-px flex-none" />
                    <span>Your request has gone to Dorji Wangchuk.</span>
                  </p>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-2.5">
                    <HairlineButton onClick={() => setAsked(true)}>
                      <Icon name="send" size={14} strokeWidth={2} />
                      Ask the owner to add this relying party
                    </HairlineButton>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        ) : null}

        {state === "parked" || parked ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon name="userCheck" size={18} strokeWidth={1.9} className="mt-0.5 flex-none text-accent" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  Waiting for an approver
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  The approver sees exactly which attributes you chose, so they
                  are deciding on the actual disclosure and not just on who
                  asked. Nothing goes out until they do.
                </p>
                <div className="mt-1">
                  <Countdown expiresAt={request.expiresAt} />
                </div>
                <div className="mt-2">
                  <Link href="/approvals">
                    <HairlineButton>
                      See the approval queue
                      <Icon name="arrowRight" size={14} strokeWidth={2} />
                    </HairlineButton>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        ) : null}

        {state === "presented" ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 flex-none text-accent" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  Sent to {request.relyingParty}
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {(request.disclosing ?? request.requiredAttributes).length} attributes
                  were disclosed. The record keeps a fingerprint of what went
                  out, never the values themselves.
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

        {/* ---- The disclosure choice ---- */}
        {!refused && !settled && state !== "parked" && !parked ? (
          <>
            <Panel>
              <div className="relative z-[4] flex flex-col gap-1">
                <h2 className="font-display text-[15px] font-semibold text-strong">
                  What to disclose
                </h2>
                <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
                  {request.relyingParty} asked for{" "}
                  {request.requestedAttributes.length}. Only{" "}
                  {request.requiredAttributes.length} are actually needed, and
                  those are the ones ticked. Anything else is yours to add
                  deliberately.
                </p>
              </div>

              {source ? (
                <p className="relative z-[4] mt-3 text-[12.5px] text-faint">
                  Answering from the entity&rsquo;s {source.type}, issued by{" "}
                  {source.issuer}.
                </p>
              ) : null}

              <div className="relative z-[4] mt-3 flex flex-col">
                {request.requestedAttributes.map((name) => {
                  const required = request.requiredAttributes.includes(name);
                  return (
                    <Checkbox
                      key={name}
                      checked={selected.includes(name)}
                      onChange={() => toggle(name)}
                      disabled={required}
                      label={
                        <span className="flex flex-wrap items-center gap-2">
                          {name.replace(/_/g, " ")}
                          {required ? (
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                              needed
                            </span>
                          ) : null}
                        </span>
                      }
                      description={
                        required
                          ? "Required — the proof is not usable without it."
                          : "Optional. They asked, but they can proceed without it."
                      }
                    />
                  );
                })}
              </div>

              {extra.length > 0 ? (
                <p
                  className="relative z-[4] mt-3 rounded-[10px] border px-3 py-2.5 text-[12.5px] leading-[1.5]"
                  style={{
                    borderColor: "rgb(245 183 64 / 0.4)",
                    background: "rgb(245 183 64 / 0.08)",
                    color: "var(--text-body)",
                  }}
                >
                  You are adding {extra.length} attribute
                  {extra.length === 1 ? "" : "s"} beyond what is needed:{" "}
                  {extra.map((a) => a.replace(/_/g, " ")).join(", ")}. Worth
                  having a reason you could give out loud.
                </p>
              ) : null}
            </Panel>

            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                {needsApproval ? (
                  <GradientButton
                    onClick={() => {
                      parkPresentation(request.id, selected);
                      router.push("/approvals");
                    }}
                  >
                    <Icon name="send" size={15} strokeWidth={2} />
                    Send for approval
                  </GradientButton>
                ) : (
                  <GradientButton onClick={() => presentProof(request.id, selected)}>
                    <Icon name="send" size={15} strokeWidth={2} />
                    Present
                  </GradientButton>
                )}
                <HairlineButton onClick={() => declineVerificationRequest(request.id)}>
                  Decline
                </HairlineButton>
                <span className="text-[12.5px] font-medium text-muted">
                  Disclosing {selected.length} of {request.requestedAttributes.length}{" "}
                  requested
                </span>
              </div>
              <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
                {needsApproval
                  ? "Presenting to this relying party needs one approver. They will see the attributes you chose."
                  : "This goes out signed by the entity — the keys stay on the server and never touch a device."}
              </p>
            </div>
          </>
        ) : null}
      </DetailLayout>
    </AppShell>
  );
}
