"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { inOrg, PELDEN, supersedes, type CrdRequestState, type CredentialOffer } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { attrLabel, issuerInline, requestWords, useHolder, useSimulatedDelivery } from "./shared";

/**
 * SCR-CRD-04 — Review a credential. FLOW-CRD-01 step 11, FLOW-CRD-02
 * step 4: check what arrived before it becomes the organisation's.
 *
 * THE CHECK IS THE POINT
 *
 * Accepting is how a wrong taxpayer number becomes the business's own, to
 * be shown to a bank. So every attribute is listed as offered and labelled,
 * the prompt says to check them, and says what to do if one is wrong —
 * decline and contact the issuer (UN-40). Acceptance isn't a formality to be
 * clicked through; it's the second of the two decisions SCR-CRD-02 named.
 *
 * WHERE IT CAME FROM
 *
 * The issuer's name as NDI lists it, marked as on NDI's list; whether this
 * answers a request (and whose) or arrived unasked; whether it replaces
 * something already held. Those are the three things that tell a person
 * whether to expect it.
 *
 * ONE SCREEN FOR BOTH ROUTES
 *
 * An offer sent without a request (FLOW-CRD-02) opens here too, at the
 * same kind of address — "the same screen FLOW-CRD-01 step 11 uses". It
 * used to have a page of its own that said who the issuer was by DID, let
 * an unlisted issuer's offer be accepted, and could send accepting to an
 * approver; none of that is in the spec. Both routes go through the same
 * store action, so both re-check the issuer, mark what they supersede and
 * show on the Activity tab.
 *
 * Before the offer arrives this is the request's own page — the same
 * sentence as the list, and the dates — so there is one address for a
 * request from asking to accepting.
 */
type Face =
  | "live"
  | "default"
  | "loading"
  | "done"
  | "declined"
  | "e13"
  | "e14"
  | "e19_delisted"
  | "e19_unreachable"
  | "offline"
  | "no_permission";

/** An inbox item's state in a request's words, so one face table reads both. */
const INBOX_STATE: Record<CredentialOffer["state"], CrdRequestState> = {
  pending: "OFFER_READY",
  accepted: "ISSUED",
  declined: "DECLINED_BY_HOLDER",
  expired: "EXPIRED",
  failed: "FAILED",
};

export function ReviewCredentialView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const {
    credentialRequests,
    offers,
    offerings,
    organizations,
    heldCredentials,
    personById,
    acceptCredentialOffer,
    declineCredentialOffer,
    simulateIssuerRecheck,
    hydrated,
  } = useDemo();
  const holder = useHolder();
  const forced = useScreenState("SCR-CRD-04", [
    "live",
    "default",
    "loading",
    "done",
    "declined",
    "e13",
    "e14",
    "e19_delisted",
    "e19_unreachable",
    "offline",
    "no_permission",
  ]) as Face;

  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [failed, setFailed] = useState<"E13" | "unreachable" | "offline" | null>(null);

  /* Only this organisation's: another organisation's id in the address gets
     the not-found branch, not its offer and who asked. A request first, then
     an offer sent unasked. */
  const r = credentialRequests.find((x) => x.id === requestId && inOrg(holder.orgId)(x));
  const o = r ? undefined : offers.find((x) => x.id === requestId && inOrg(holder.orgId)(x));
  useSimulatedDelivery(r ? [r] : []);
  const offering = offerings.find((x) => x.id === r?.offeringId);

  const state: CrdRequestState | undefined = r?.state ?? (o ? INBOX_STATE[o.state] : undefined);
  const credential = r?.credential ?? o?.type ?? "";
  const issuer = r?.issuerName ?? o?.issuer ?? "";
  const issuerDid = r ? (organizations.find((x) => x.id === r.issuerOrgId)?.publicDid ?? "") : (o?.issuerDid ?? "");
  const failCode = r?.failCode ?? o?.failCode ?? null;
  const recheck = r?.simulatedRecheck ?? o?.simulatedRecheck ?? null;
  /* EW-FLOW6-SD §4.5 — what this would supersede, by the store's own rule. */
  const replaces = state ? supersedes(heldCredentials, r?.orgId ?? o?.orgId ?? PELDEN, credential, issuerDid) : undefined;

  const natural: Face = busy
    ? "loading"
    : state === "ISSUED"
      ? "done"
      : state === "DECLINED_BY_HOLDER"
        ? "declined"
        : failed === "E13" || state === "EXPIRED"
          ? "e13"
          : state === "FAILED" && failCode === "ISSUER_NOT_TRUSTED"
            ? "e19_delisted"
            : state === "FAILED" && failCode === "ISSUANCE"
              ? "e14"
              : failed === "unreachable"
                ? "e19_unreachable"
                : failed === "offline"
                  ? "offline"
                  : !holder.can("credential:accept", credential)
                    ? "no_permission"
                    : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (!r && !o) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          <PageHeader crumbs={[{ label: "Wallet" }, { label: "Requests and offers", href: "/wallet/requests" }]} title="Not found" />
          <Panel>
            <p className="relative z-[4] m-0 text-[14px] text-body">
              There&rsquo;s no request or offer here. It may belong to another organisation.
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const terminal = face === "done" || face === "declined" || face === "e13" || face === "e14" || face === "e19_delisted";
  /* A forced face shows the review itself, with the offering's example
     values if nothing has been offered yet — a reviewer can reach every
     state without first walking a request to the issuer and back. */
  const offered = state === "OFFER_READY" || forced !== "live";
  const header = (
    <PageHeader
      crumbs={[{ label: "Wallet" }, { label: "Requests and offers", href: "/wallet/requests" }, { label: credential }]}
      title={offered || face === "done" ? `Review your ${credential}` : credential}
    />
  );

  /* Before the offer: the request's own page. Only a request has one. */
  if (r && !offered && !terminal) {
    const words = requestWords(r, offering?.answerWindowDays ?? 5);
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status={words.status} label={words.label} />
                <p role="status" className="m-0 text-[14px] text-body">
                  {words.sentence}
                </p>
              </div>
              <dl className="m-0 grid gap-x-6 gap-y-3 min-[641px]:grid-cols-2">
                <Fact term="Asked by" value={`${personById(r.requestedBy).name} on ${formatDate(r.requestedAt)}`} />
                <Fact term="Shared" value={`Your ${r.consented.credential}, all of it`} />
                {r.answerBy ? <Fact term={`${issuer} answers by`} value={formatDate(r.answerBy)} /> : null}
                {r.consentBy ? <Fact term="Your answer needed by" value={formatDate(r.consentBy)} /> : null}
              </dl>
              <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
                {r.state === "NEEDS_CONSENT" ? (
                  <GradientButton onClick={() => router.push(`/wallet/requests/${r.id}/more`)}>Answer</GradientButton>
                ) : null}
                {["WITHDRAWN", "EXPIRED", "DECLINED_BY_ISSUER", "FAILED"].includes(r.state) ? (
                  <GradientButton onClick={() => router.push(`/wallet/get/${r.offeringId}`)}>Ask again</GradientButton>
                ) : null}
                <HairlineButton onClick={() => router.push("/wallet/requests")}>Back to requests</HairlineButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (terminal) {
    /* §3.5: an offer that answered a request can be asked for again; one
       sent unasked can't, so its endings stop at what happened
       (FLOW-CRD-02 E4, E6). */
    const message =
      face === "done"
        ? "Added to your credentials."
        : face === "declined"
          ? "You've declined this. Nothing has been added."
          : face === "e13"
            ? r
              ? `This offer from ${issuerInline(issuer)} expired. You can ask again.`
              : `This offer from ${issuerInline(issuer)} expired.`
            : face === "e19_delisted"
              ? `${issuer} is no longer on NDI's list of trusted organisations, so this can't be added.`
              : r
                ? `Something went wrong receiving this from ${issuerInline(issuer)}. Nothing has been added. Try asking again.`
                : `Something went wrong receiving this from ${issuerInline(issuer)}. Nothing has been added.`;
    const askAgain = r && (face === "e13" || face === "e14");
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role={face === "done" || face === "declined" ? "status" : "alert"} className="m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
                {face === "done" ? (
                  <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                ) : null}
                {message}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {face === "done" ? (
                  <GradientButton onClick={() => router.push("/wallet/credentials")}>Go to your credentials</GradientButton>
                ) : askAgain ? (
                  <GradientButton onClick={() => router.push(`/wallet/get/${r.offeringId}`)}>Ask again</GradientButton>
                ) : (
                  <HairlineButton onClick={() => router.push("/wallet/requests")}>Back to requests</HairlineButton>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const accept = () => {
    if (forced === "offline") {
      setFailed("offline");
      return;
    }
    setFailed(null);
    setBusy(true);
    window.setTimeout(() => {
      const res = acceptCredentialOffer(requestId);
      setBusy(false);
      if (!res.ok && res.error === "E13") setFailed("E13");
      if (!res.ok && res.error === "E19_unreachable") setFailed("unreachable");
    }, ROUND_TRIP_MS);
  };

  /* What was offered, or — for a request reviewed from the switcher before
     anything arrived — the offering's example values. valid_until is
     validity, shown as such rather than as one more attribute. */
  const attributes = (r ? (r.offer?.attributes ?? offering?.fields.map((f) => ({ name: f.name, value: f.example })) ?? []) : (o?.attributes ?? [])).filter(
    (a) => a.name !== "valid_until",
  );
  const validUntil = r ? (r.offer?.validUntil ?? null) : (o?.attributes.find((a) => a.name === "valid_until")?.value ?? null);
  const expiresAt = r ? (r.offer?.expiresAt ?? null) : (o?.expiresAt ?? null);
  const readOnly = face === "no_permission";

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            That didn&rsquo;t go through, so nothing was added. Try again when you&rsquo;re back online.
          </p>
        ) : null}
        {face === "e19_unreachable" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            We can&rsquo;t check {issuerInline(issuer)} right now. Try again shortly.
          </p>
        ) : null}
        {readOnly ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            You can see what was sent. {holder.rootName} can accept or decline it.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="m-0 text-[14px] text-body">
                From <span className="font-medium text-strong">{issuer}</span>
              </p>
              <p className="m-0 flex items-center gap-1.5 text-[12.5px] text-muted">
                <Icon name="shieldCheck" size={13} strokeWidth={2} style={{ color: "var(--ndi-success)" }} />
                On NDI&rsquo;s list of trusted organisations
              </p>
              <p className="m-0 text-[12.5px] text-faint">
                {r
                  ? `In answer to the request ${personById(r.requestedBy).name} made on ${formatDate(r.requestedAt)}`
                  : `Sent unasked on ${formatDate(o?.receivedAt ?? "")}`}
              </p>
            </div>

            <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
              Check these details are right. If something is wrong, decline and contact {issuerInline(issuer)}.
            </p>

            <dl className="m-0 grid gap-x-6 gap-y-3 rounded-[12px] border border-grid px-4 py-3 min-[641px]:grid-cols-2">
              {attributes.map((a) => (
                <Fact key={a.name} term={offering?.fields.find((f) => f.name === a.name)?.label ?? attrLabel(a.name)} value={a.value} />
              ))}
              <Fact term="Valid" value={validUntil ? `Until ${formatDate(validUntil)}` : "Until it's revoked"} />
            </dl>

            {replaces ? (
              <p className="m-0 text-[13px] leading-[1.6] text-body">
                This replaces the {replaces.type} you received on {formatDate(replaces.receivedAt)}. You&rsquo;ll keep both;
                when you share it, the newer one is chosen for you.
              </p>
            ) : null}
            {expiresAt ? <p className="m-0 text-[12.5px] text-faint">This offer is open until {formatDate(expiresAt)}.</p> : null}

            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              <GradientButton onClick={accept} disabled={readOnly || face === "loading"}>
                {face === "loading" ? "Adding to your credentials…" : face === "e19_unreachable" ? "Try again" : "Accept"}
              </GradientButton>
              <HairlineButton onClick={() => setDeclining(true)} disabled={readOnly || face === "loading"}>
                Decline
              </HairlineButton>
            </div>
          </div>
        </Panel>

        {/* C2 runs again when Accept is pressed. Nothing in the prototype
            can delist an issuer or take NDI's list down, so this stands in
            for either having happened while the offer waited. */}
        {forced === "live" && state === "OFFER_READY" && !readOnly ? (
          <SimulatedStep
            standsFor={`${issuer} leaving NDI's list, or the list being out of reach, while this waited`}
            action={
              <>
                <SimulatedAction onClick={() => simulateIssuerRecheck(requestId, "delisted")}>Take it off the list</SimulatedAction>
                <SimulatedAction onClick={() => simulateIssuerRecheck(requestId, "unreachable")}>Make the list unreachable</SimulatedAction>
              </>
            }
          >
            Accepting checks the issuer against NDI&rsquo;s list again. Either control makes the next Accept meet that
            check failing.
            {recheck ? ` Set: ${recheck === "delisted" ? "the issuer is off the list" : "the list can't be reached"}.` : ""}
          </SimulatedStep>
        ) : null}

        <Dialog
          open={declining}
          onClose={() => setDeclining(false)}
          title={`Decline this ${credential}?`}
          lead={
            r
              ? `Nothing is added to your credentials. If something in it is wrong, contact ${issuerInline(issuer)} — you can ask again afterwards.`
              : `Nothing is added to your credentials, and ${issuerInline(issuer)} is told. If something in it is wrong, contact them.`
          }
          confirmLabel="Decline"
          onConfirm={() => {
            declineCredentialOffer(requestId);
            setDeclining(false);
          }}
        />
      </div>
    </AppShell>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className={LABEL_CLASS}>{term}</dt>
      <dd className="m-0 text-[13.5px] text-body">{value}</dd>
    </div>
  );
}
