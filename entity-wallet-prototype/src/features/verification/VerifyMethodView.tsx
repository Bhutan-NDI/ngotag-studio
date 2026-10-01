import { AppShell } from "@/components/layout/AppShell";
import { OptionCards, type MethodOption } from "@/components/ui/OptionCards";
import { PageHeader } from "@/components/ui/PageHeader";

/**
 * How the proof request reaches the holder.
 *
 * The three routes diverge immediately after this: connection-based requests
 * pick a holder from the connection list, and the other two pick the schema
 * first because there is no holder to pick yet.
 */
const OPTIONS: MethodOption[] = [
  {
    heading: "QR code",
    tag: "No connection needed",
    icon: "verify",
    description:
      "Generate a scannable code that requests a proof on scan. Nothing has to exist between you and the holder beforehand.",
    href: "/verification/verify-credentials/schema",
    recommended: true,
  },
  {
    heading: "Connection",
    tag: "Existing holders",
    icon: "connections",
    description:
      "Request a presentation from a holder you are already connected with, down a channel that is already trusted.",
    href: "/verification/verify-credentials/schemas",
  },
  {
    heading: "Email",
    tag: "Single holder",
    icon: "mail",
    description:
      "Send a proof request to one email address. The holder responds in their wallet app.",
    href: "/verification/verify-credentials/email/schemas",
  },
];

export function VerifyMethodView() {
  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Verification", href: "/verification" }, { label: "Request proof" }]}
          title="Request a proof"
        />
        <p className="m-0 max-w-[62ch] text-[15px] leading-[1.6] text-muted">
          Choose how the request reaches the holder. You will pick the credential and the attributes
          you want presented next, whichever route you take.
        </p>
        <OptionCards options={OPTIONS} />
      </div>
    </AppShell>
  );
}
