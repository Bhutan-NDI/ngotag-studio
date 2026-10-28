"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { BNSW } from "@/lib/bnsw";
import { useDemo } from "@/lib/demoStore";
import { sessionStatusOf } from "@/lib/sharing";

import { BnswFrame, BnswMessage, Fact } from "./shared";

/**
 * The Single Window's company registration — FLOW-PRS-01 with BNSW as the
 * verifier, which Flow 9 depends on (FLOW-AUT-02 P2).
 *
 * WHY FLOW 9 NEEDS IT
 *
 * A delegate's authority names only a licence number. Everything else BNSW
 * fills in — the company's name, its TPN, the licence's status — comes from
 * what the company shared with BNSW when it registered (EW-FLOW9-SD §4.1,
 * D11), and B1 recognises the authority by the publishing DID the platform
 * attests in that registration's result (D8). So this page is how a company
 * gets from E8 ("needs to register with BNSW, or register again") to its
 * delegate acting for it — Journey W.
 *
 * It is the bank's page again, built the same way (EW-FLOW7-VIG §5): the
 * session is created when the button is pressed, the person leaves to share
 * from the Entity Wallet and comes back, and the return page acts on what
 * BNSW's back end fetched, never on the status in the address. What BNSW
 * keeps is written by the store when the share goes through.
 *
 * REGISTERING BEFORE THE FIRST GRANT
 *
 * A company that registers before it has ever given authority isn't listed
 * as an issuer of authority yet, so the result carries no publishing DID
 * and its delegates fail B1 until it registers again (§7, R5). The
 * specification accepts that cost and handles it: E8 says to register
 * again, and the Entity Wallet's first-grant notice tells the organisation
 * to (UX-EW-05 SCR-AUT-01). The return page below says which case this is.
 */
export function RegisterCompanyView({ mode, session: returnedSession, state: returnedState, status: returnedStatus }: {
  mode: "start" | "return";
  session?: string | null;
  state?: string | null;
  status?: string | null;
}) {
  const router = useRouter();
  const { presentationSessions, presentationRequests, counterpartyRegistrations, startPresentationSession, hydrated } = useDemo();
  const [reference, setReference] = useState("");
  /* Made after mount: a random number in the server's HTML would never match the browser's. */
  useEffect(() => setReference(`BNSW-REG-${31000 + Math.floor(Math.random() * 900)}`), []);

  const start = () => {
    if (!reference) return;
    const id = startPresentationSession(BNSW, reference);
    if (id) router.push(`/present?session=${id}`);
  };

  const session = presentationSessions.find((x) => x.id === returnedSession);
  const request = presentationRequests.find((x) => x.id === session?.requestId);
  const matches = Boolean(session && returnedState && session.state === returnedState);
  const fetched = session ? sessionStatusOf(session, request) : null;
  const record = request ? counterpartyRegistrations.find((r) => r.requestId === request.id && r.counterpartyId === BNSW) : undefined;

  const message: Record<string, string> = {
    SHARED: "Thank you. Your company is registered for customs declarations.",
    PENDING: "We're waiting for your organisation to finish sharing. We'll continue as soon as it arrives.",
    CREATED: "We haven't received your details yet.",
    OPENED: "We haven't received your details yet.",
    DECLINED: "Your organisation didn't share the details. You can try again or register another way.",
    EXPIRED: "That didn't complete. You can try again.",
    FAILED: "That didn't complete. You can try again.",
  };

  return (
    <BnswFrame>
      <h1 className="m-0 font-display text-[22px] font-semibold leading-[1.2] tracking-[-0.01em] text-strong">Register a company</h1>

      {mode === "start" ? (
        <>
          <p className="m-0 max-w-[64ch] text-[13.5px] leading-[1.6] text-muted">
            Register once, and anyone your company gives authority to can declare for it — we fill in your company&rsquo;s name, TPN and licence
            on every declaration, so nobody has to type them. If you&rsquo;ve given authority since you last registered, register again.
          </p>
          <p className="m-0 text-[13.5px] leading-[1.6] text-body">
            Registration number <span className="font-mono font-semibold text-strong">{reference}</span>.
          </p>
          <SimulatedStep
            standsFor="BNSW's button — the company's representative leaves to share from the NDI Entity Wallet"
            action={<SimulatedAction onClick={start}>Share from NDI Entity Wallet</SimulatedAction>}
          >
            Share your company&rsquo;s registration, TPN and business licence from its NDI Entity Wallet. You&rsquo;ll leave our site to sign in
            with Bhutan NDI, and come back here. The wallet will show this registration number — check it matches.
          </SimulatedStep>
        </>
      ) : !hydrated ? null : !session || !matches ? (
        <BnswMessage tone="warning" role="alert">
          We couldn&rsquo;t match this to your registration, so we haven&rsquo;t used it. Please start again.
        </BnswMessage>
      ) : (
        <>
          <p className="m-0 text-[13.5px] leading-[1.6] text-body">
            Registration <span className="font-mono font-semibold text-strong">{session.displayReference}</span>.
          </p>
          <BnswMessage tone={fetched === "SHARED" ? "success" : "info"}>{message[fetched ?? "FAILED"]}</BnswMessage>
          {fetched === "SHARED" && record ? (
            <dl className="m-0 grid gap-3 rounded-[12px] border border-grid px-4 py-4 min-[641px]:grid-cols-2">
              <Fact label="Company">{record.legalName}</Fact>
              <Fact label="Registration number">{record.registrationNumber}</Fact>
              <Fact label="TPN">{record.tpn ?? "—"}</Fact>
              <Fact label="Business licence">{record.licences.map((l) => l.number).join(", ") || "—"}</Fact>
              <Fact label="Authority it gives">
                {record.publishingDid
                  ? "Recognised — people your company has given authority to can act for it here."
                  : "Not yet — your company hadn't given anyone authority when it registered. Register again after it does."}
              </Fact>
            </dl>
          ) : null}
          <p className="m-0 text-[12px] text-faint">
            The address said <span className="font-mono">status={returnedStatus ?? "—"}</span>; BNSW acts only on what its own system fetched:{" "}
            <span className="font-mono">{fetched}</span>.
          </p>
        </>
      )}
    </BnswFrame>
  );
}
