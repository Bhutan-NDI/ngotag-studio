"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthHeader } from "@/components/layout/AuthHeader";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { attrLabel } from "./shared";
import { useDemo } from "@/lib/demoStore";
import { sessionStatusOf } from "@/lib/sharing";

/**
 * Bank of Bhutan's website — simulated, and drawn as a dashed stand-in.
 *
 * WHY IT EXISTS
 *
 * FLOW-PRS-01 starts and ends on someone else's website, and the person's
 * first and last impressions of the flow are there (UX-EW-04 §0.2). UX-EW-04
 * §4.1 makes a mock bank page part of the evaluation instrument, built to
 * EW-FLOW7-VIG §5, so this follows the guide: the button labelled *Share
 * from NDI Entity Wallet*, a line saying the customer will leave to sign in
 * with Bhutan NDI and come back, the application number on the page —
 * which the wallet will show as the bank's reference — and a session
 * created when the button is pressed, not when the page loads.
 *
 * THE RETURN PAGE ACTS ON WHAT ITS BACK END FETCHED
 *
 * The address it comes back to carries `status`, which anyone can type.
 * The page checks the returned session and state match the application,
 * fetches the session by the id it stored, and shows what the *fetched*
 * status means, in the guide's words (§5.2) — including "We're waiting for
 * your organisation to finish sharing", never "we have it", for PENDING
 * (UC-35).
 *
 * Everything inside the dashed frame is the bank's, not NDI's; the
 * what's-real page lists it.
 */
export function BankSiteView({ mode, session: returnedSession, state: returnedState, status: returnedStatus }: {
  mode: "start" | "return";
  session?: string | null;
  state?: string | null;
  status?: string | null;
}) {
  const router = useRouter();
  const { presentationSessions, presentationRequests, heldCredentials, startPresentationSession, hydrated } = useDemo();
  /* The application number the bank shows beside its button, and passes as
     the session's displayReference. */
  const [reference, setReference] = useState("");
  /* Made after mount: a random number in the server's HTML would never
     match the browser's. */
  useEffect(() => setReference(`EKYB-${20400 + Math.floor(Math.random() * 500)}`), []);

  const start = () => {
    if (!reference) return;
    const id = startPresentationSession("org-bob", reference);
    if (id) router.push(`/present?session=${id}`);
  };

  const session = presentationSessions.find((x) => x.id === returnedSession);
  const request = presentationRequests.find((x) => x.id === session?.requestId);
  /* §5.2 step 1 — both returned values must match the application. */
  const matches = Boolean(session && returnedState && session.state === returnedState);
  const fetched = session ? sessionStatusOf(session, request) : null;

  const message: Record<string, string> = {
    SHARED: "Thank you. We've received and verified your company's details.",
    PENDING: "We're waiting for your organisation to finish sharing. We'll continue as soon as it arrives.",
    CREATED: "We haven't received your details yet.",
    OPENED: "We haven't received your details yet.",
    /* EW-FLOW7-VIG v0.2 §5.2: the session doesn't say whether a person
       declined or the request was blocked, so nothing suggests trying again. */
    DECLINED: "We didn't receive your details. You can provide them another way.",
    EXPIRED: "That didn't complete. You can try again.",
    FAILED: "That didn't complete. You can try again.",
  };

  const shared = fetched === "SHARED" && request?.chosen
    ? Object.values(request.chosen).map((id) => heldCredentials.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c))
    : [];

  return (
    <div className="flex min-h-dvh flex-col">
      <AuthHeader />
      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-5 px-4 py-8 min-[641px]:px-6">
        <SimulatedStep
          standsFor="Bank of Bhutan's website — another organisation's system"
          action={
            mode === "start" ? (
              <SimulatedAction onClick={start}>Share from NDI Entity Wallet</SimulatedAction>
            ) : (
              <SimulatedAction onClick={() => router.push("/simulated/bank")}>Start a new application</SimulatedAction>
            )
          }
        >
          <div className="flex flex-col gap-3 text-body">
            <p className="m-0 font-display text-[16px] font-semibold text-strong">Bank of Bhutan · Open a business current account</p>
            {mode === "start" ? (
              <>
                <p className="m-0 text-[13.5px] leading-[1.6]">
                  Step 2 of 4 — your company&rsquo;s details. Application number{" "}
                  <span className="font-mono font-semibold text-strong">{reference}</span>.
                </p>
                <p className="m-0 text-[13.5px] leading-[1.6]">
                  Share your company&rsquo;s registration from its NDI Entity Wallet instead of uploading certified copies.
                  You&rsquo;ll leave our site to sign in with Bhutan NDI, and come back here. The wallet will show this application
                  number — check it matches.
                </p>
              </>
            ) : !hydrated ? null : !session || !matches ? (
              <p className="m-0 text-[13.5px] leading-[1.6]">
                We couldn&rsquo;t match this to your application, so we haven&rsquo;t used it. Please start again from your
                application.
              </p>
            ) : (
              <>
                <p className="m-0 text-[13.5px] leading-[1.6]">
                  Application <span className="font-mono font-semibold text-strong">{session.displayReference}</span>.
                </p>
                <p role="status" className="m-0 text-[14px] font-medium leading-[1.6] text-strong">
                  {message[fetched ?? "FAILED"]}
                </p>
                {shared.length ? (
                  <dl className="m-0 flex flex-col gap-1 text-[13px]">
                    {shared.flatMap((c) =>
                      c.attributes
                        .filter((a) => ["registered_name", "registration_number", "status"].includes(a.name))
                        .map((a) => (
                          <div key={`${c.id}-${a.name}`} className="flex flex-wrap gap-2">
                            <dt className="text-faint">{attrLabel(a.name)}</dt>
                            <dd className="m-0">{a.value}</dd>
                          </div>
                        )),
                    )}
                    <div className="flex flex-wrap gap-2">
                      <dt className="text-faint">Checked</dt>
                      <dd className="m-0">Signature, holder and issuer on NDI&rsquo;s list — all passed</dd>
                    </div>
                  </dl>
                ) : null}
                <p className="m-0 text-[12px] text-faint">
                  The address said <span className="font-mono">status={returnedStatus ?? "—"}</span>; the bank acts only on what its own
                  system fetched: <span className="font-mono">{fetched}</span>.
                </p>
              </>
            )}
          </div>
        </SimulatedStep>
      </main>
    </div>
  );
}
