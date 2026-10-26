"use client";

import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { QrPlaceholder } from "@/components/ui/QrPlaceholder";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { IDENTITY_MS, ending, orgName as orgNameOf, statement } from "@/lib/authority";
import { SIM_CITIZENS } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { Statement } from "./shared";

/**
 * SCR-AUT-05 — Collect your authority. FLOW-AUT-01 steps 9–16; E7–E14,
 * E17, A2.
 *
 * NOTHING BEFORE IDENTITY (S3)
 *
 * The link is a bearer reference: whoever holds it can open this page. So
 * before the person has proved who they are, it shows NDI's name and
 * address, the organisation's verified name and that it wants to give them
 * authority — and the sentence that must survive review unchanged, "Only
 * continue if you expected authority from <organisation>." What the
 * authority is comes only after the citizen credential matches the ID
 * number the grantor entered (G8). An unknown, lapsed, cancelled or used
 * link shows nothing at all, not even whose it was (E7).
 *
 * TWO HOPS INTO THE APP
 *
 * Identity, then the offer — the hops UC-39 is most likely to fail on
 * (FLOW-AUT-01 §12 item 1). On a phone the page offers a link that opens
 * the app; elsewhere a QR code; never both prominent (§3.4). The app's own
 * screens are the app team's; dashed steps stand in for them, and for the
 * delegate's choices there.
 *
 * NO ACCOUNT
 *
 * Nobody signs in to Studio here (D10). The page knows the claim reference
 * and, after the match, the grant it opened — nothing else, and it doesn't
 * matter who the demo is driven as.
 *
 * OPENED AGAIN
 *
 * Opening the link again while an offer is out asks for identity again,
 * then shows the same offer — nothing is shown before the match, and no new
 * offer is made (the prototype's reading of pr-8 item 2). Once the
 * authority has been accepted the link is used, and reads as E7.
 */
type Face =
  | "live"
  | "before"
  | "waiting_app"
  | "checking"
  | "offer"
  | "done"
  | "error_link"
  | "error_no_app"
  | "error_not_you"
  | "error_no_answer"
  | "error_cant_give"
  | "error_offer_failed"
  | "error_offer_expired"
  | "cancelled"
  | "declined"
  | "finishing"
  | "offline";

type Phase = "before" | "waiting_app" | "checking" | "proved" | "E8" | "E9" | "E10" | "E11" | "E12" | "E13";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function CollectView({ claimRef }: { claimRef: string }) {
  const { hydrated, authorityGrants, organizations, openClaim, presentCitizenCredential, answerOffer, finishRegistration } = useDemo();
  const forced = useScreenState("SCR-AUT-05", [
    "live",
    "before",
    "waiting_app",
    "checking",
    "offer",
    "done",
    "error_link",
    "error_no_app",
    "error_not_you",
    "error_no_answer",
    "error_cant_give",
    "error_offer_failed",
    "error_offer_expired",
    "cancelled",
    "declined",
    "finishing",
    "offline",
  ]) as Face;

  const [look, setLook] = useState<{ kind: "valid"; orgName: string } | { kind: "invalid" } | null>(null);
  const [phase, setPhase] = useState<Phase>("before");
  const [grantId, setGrantId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [askedAt, setAskedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    setLook(openClaim(claimRef));
    setAddress(`${window.location.host}/authority/claim`);
    setPhone(window.matchMedia("(max-width: 640px), (pointer: coarse)").matches);
    // Read once per visit: what the link opens is decided when it loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, claimRef]);

  /* The time remaining on the identity request and the offer is shown and
     counts down (SC 2.2.1's essential exception, stated with the time). */
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const g = grantId ? authorityGrants.find((x) => x.id === grantId) : undefined;
  const orgName = g ? orgNameOf({ organizations }, g.orgId) : look?.kind === "valid" ? look.orgName : "The organisation";
  const sample = authorityGrants.find((x) => x.status === "ACTIVE") ?? authorityGrants[0];

  const natural: Face = (() => {
    if (!look) return "before";
    if (phase === "E8") return "error_no_app";
    if (phase === "E9") return "error_not_you";
    if (phase === "E10") return "error_no_answer";
    if (phase === "E11") return "error_cant_give";
    if (phase === "E12") return "error_offer_failed";
    if (phase === "E13") return "error_offer_expired";
    if (phase === "checking") return "checking";
    if (g && phase === "proved") {
      if (g.status === "ACTIVE") return "done";
      if (g.status === "ISSUING" && g.accepted) return "finishing";
      if (g.status === "ISSUING") return g.offerExpiresAt !== null && g.offerExpiresAt < now ? "error_offer_expired" : "offer";
      if (g.status === "DECLINED") return "declined";
      if (g.status === "CANCELLED") return "cancelled";
      if (g.status === "FAILED") return "error_cant_give";
      return "error_link";
    }
    if (look.kind === "invalid") return "error_link";
    if (phase === "waiting_app") return "waiting_app";
    return "before";
  })();
  const face: Face = forced === "live" ? natural : forced;
  const live = forced === "live";
  const shown = g ?? (forced !== "live" ? sample : undefined);

  const share = (cid: string) => {
    setPhase("checking");
    /* Steps 11–12 — the presentation verifies, the challenge and the DID
       match, the ID number's keyed hash is compared, G2–G6 run again. */
    window.setTimeout(() => {
      const res = presentCitizenCredential(claimRef, cid);
      if (res.ok) {
        setGrantId(res.grantId);
        setPhase("proved");
      } else if (res.error === "E7") {
        setLook({ kind: "invalid" });
        setPhase("before");
      } else setPhase(res.error);
    }, LOCAL_MS);
  };

  const again = () => {
    setGrantId(null);
    setPhase("before");
    setAskedAt(null);
    setLook(openClaim(claimRef));
  };

  const errors: Partial<Record<Face, { text: string; retry?: string }>> = {
    error_link: { text: "This link isn't valid any more. Ask the person who sent it for a new one." },
    cancelled: { text: "This link isn't valid any more. Ask the person who sent it for a new one." },
    error_no_app: { text: "You need the Bhutan NDI app with your citizen ID to receive this." },
    error_not_you: { text: `This authority is for someone else. If it's meant for you, ask ${orgName} to check your details.` },
    error_no_answer: { text: "We didn't get your details. You can try again.", retry: "Try again" },
    error_cant_give: { text: `${orgName} can't give this authority any more. Nothing has been given.` },
    error_offer_failed: { text: "Something went wrong. Nothing has been given. Try again in a few minutes.", retry: "Try again" },
    error_offer_expired: { text: "This offer has expired. Open your link again to receive it.", retry: "Open the link again" },
    declined: { text: "You've declined this authority. Nothing has been given." },
  };
  const error = errors[face];
  const unnamed = face === "error_link" || face === "cancelled";

  const identityLeft = askedAt ? IDENTITY_MS - (now - askedAt) : IDENTITY_MS;
  const offerLeft = shown?.offerExpiresAt ? shown.offerExpiresAt - now : 30 * 60_000;

  return (
    <div className="flex min-h-dvh flex-col">
      <AuthHeader />
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 px-4 py-8 min-[641px]:px-6 min-[641px]:py-10">
        {/* ---- NDI's name and address, before anything else ---- */}
        <div className="flex flex-col gap-2">
          <p className="m-0 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <Icon name="lock" size={12} strokeWidth={2.2} />
            NDI Entity Wallet{address ? ` · ${address}` : ""}
          </p>
          <h1 className="m-0 font-display text-[clamp(23px,3vw,30px)] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
            {unnamed
              ? "This link can't be opened"
              : face === "offer"
                ? "Here's what you'll be able to do"
                : face === "done" || face === "finishing"
                  ? "Collect your authority"
                : `${orgName} wants to give you authority to act for it`}
          </h1>
        </div>

        {face === "offline" ? (
          <p role="alert" className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. Nothing has been given.
            <HairlineButton onClick={() => window.location.reload()}>Retry</HairlineButton>
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4" aria-live="polite">
            {error ? (
              <>
                <p role="alert" className="m-0 text-[14.5px] leading-[1.6] text-body">
                  {error.text}
                </p>
                {face === "error_no_app" ? (
                  <a href="https://www.bhutanndi.com" target="_blank" rel="noreferrer noopener" className="ndi-plainlink self-start text-[13.5px] font-medium text-accent">
                    How to get the app
                  </a>
                ) : null}
                {error.retry ? (
                  <div>
                    <GradientButton onClick={() => live && again()}>{error.retry}</GradientButton>
                  </div>
                ) : null}
              </>
            ) : face === "checking" ? (
              <p role="status" className="m-0 flex items-center gap-2 text-[14.5px] text-body">
                <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--ndi-info)" }} />
                Checking…
              </p>
            ) : face === "waiting_app" ? (
              <>
                <p className="m-0 text-[14.5px] leading-[1.6] text-body">Open Bhutan NDI to share your ID.</p>
                {phone ? (
                  <GradientButton block>
                    <Icon name="phone" size={15} strokeWidth={2} />
                    Open Bhutan NDI
                  </GradientButton>
                ) : (
                  <div className="w-full max-w-[220px]">
                    <QrPlaceholder value={`ndi-identity-${claimRef}`} />
                  </div>
                )}
                <p className="m-0 text-[13px] text-muted">Time remaining: {mmss(identityLeft)}. For your security, the request ends after 5 minutes.</p>
                <div>
                  <HairlineButton onClick={() => setPhase("before")}>Cancel</HairlineButton>
                </div>
              </>
            ) : face === "offer" && shown ? (
              <>
                <Statement>{statement({ organizations }, shown, "delegate")}</Statement>
                <p className="m-0 text-[13.5px] leading-[1.6] text-muted">
                  It will be in your own Bhutan NDI app, in your name. It doesn&rsquo;t include {orgName}&rsquo;s licence or TPN — only the licence number you act under.
                </p>
                {phone ? (
                  <GradientButton block>
                    <Icon name="phone" size={15} strokeWidth={2} />
                    Collect in Bhutan NDI
                  </GradientButton>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="m-0 text-[14px] font-medium text-strong">Collect in Bhutan NDI</p>
                    <div className="w-full max-w-[220px]">
                      <QrPlaceholder value={`ndi-offer-${claimRef}`} />
                    </div>
                  </div>
                )}
                <p className="m-0 text-[13px] text-muted">Time remaining: {mmss(offerLeft)}. For your security, the offer ends after 30 minutes.</p>
              </>
            ) : face === "finishing" ? (
              <p role="status" className="m-0 text-[14.5px] leading-[1.6] text-body">
                Almost done — we&rsquo;re finishing setting up your authority. It will work in a few minutes.
              </p>
            ) : face === "done" && shown ? (
              <p role="status" className="m-0 flex items-start gap-2 text-[14.5px] leading-[1.6] text-body">
                <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                You have authority to act for {orgName} until {formatDate(shown.validUntil)}. It&rsquo;s in your Bhutan NDI app.
              </p>
            ) : (
              <>
                <p className="m-0 text-[14.5px] leading-[1.6] text-body">Only continue if you expected authority from {ending(orgName)}</p>
                <div>
                  <GradientButton
                    onClick={() => {
                      if (!live) return;
                      setAskedAt(Date.now());
                      setPhase("waiting_app");
                    }}
                  >
                    Continue with Bhutan NDI
                  </GradientButton>
                </div>
              </>
            )}
          </div>
        </Panel>

        {/* ---- The Bhutan NDI app, which the prototype can't reach ---- */}
        {live && face === "waiting_app" ? (
          <SimulatedStep
            standsFor="the Bhutan NDI app on the phone — its identity request and consent screen"
            action={
              <>
                {SIM_CITIZENS.map((c) => (
                  <SimulatedAction key={c.cid} onClick={() => share(c.cid)}>
                    Share {c.name}&rsquo;s ID
                  </SimulatedAction>
                ))}
                <SimulatedAction onClick={() => setPhase("E10")}>Decline in the app</SimulatedAction>
                <SimulatedAction onClick={() => setPhase("E8")}>No Bhutan NDI app</SimulatedAction>
              </>
            }
          >
            Bhutan NDI Verification asks for the citizen credential, its challenge bound to this authority. The ID number shared is compared with
            the one {orgName} entered — by its keyed hash, never the number. Sharing someone else&rsquo;s plays a forwarded link (Journey U); the third
            time ends it.
          </SimulatedStep>
        ) : null}
        {live && face === "offer" ? (
          <SimulatedStep
            standsFor="the Bhutan NDI app's offer screen"
            action={
              <>
                <SimulatedAction onClick={() => answerOffer(claimRef, "accept")}>Accept in the app</SimulatedAction>
                <SimulatedAction onClick={() => answerOffer(claimRef, "accept_unregistered")}>Accept — the registration is slow</SimulatedAction>
                <SimulatedAction onClick={() => answerOffer(claimRef, "decline")}>Decline in the app</SimulatedAction>
                <SimulatedAction
                  onClick={() => {
                    answerOffer(claimRef, "expire");
                    setPhase("E13");
                  }}
                >
                  Let 30 minutes pass
                </SimulatedAction>
                <SimulatedAction
                  onClick={() => {
                    answerOffer(claimRef, "send_failed");
                    setPhase("E12");
                  }}
                >
                  The offer can&rsquo;t be sent
                </SimulatedAction>
              </>
            }
          >
            The app shows {orgName} as the issuer, from NDI&rsquo;s list; what they may do in words, never codes; where; the licence number; the limit
            in ngultrum; and the end date (UXD-50). Accepting registers its status with NDI, and only then is it active (D23).
          </SimulatedStep>
        ) : null}
        {live && face === "error_not_you" ? (
          <SimulatedStep standsFor="the link being opened again" action={<SimulatedAction onClick={again}>Open the link again</SimulatedAction>}>
            Nothing was given and the attempt was recorded. The link still works for the right person, until the third mismatch ends it.
          </SimulatedStep>
        ) : null}
        {live && face === "finishing" && g ? (
          <SimulatedStep standsFor="NDI's revocation service" action={<SimulatedAction onClick={() => finishRegistration(g.id)}>The registration goes through</SimulatedAction>}>
            Until its status is registered, the authority fails every check the Single Window makes — so a slow registration fails closed (E17).
          </SimulatedStep>
        ) : null}
      </main>
    </div>
  );
}
