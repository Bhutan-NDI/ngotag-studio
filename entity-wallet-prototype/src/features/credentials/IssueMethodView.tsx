import { AppShell } from "@/components/layout/AppShell";
import { OptionCards, type MethodOption } from "@/components/ui/OptionCards";
import { PageHeader } from "@/components/ui/PageHeader";

/**
 * How the credential reaches the holder. Every route below ends in the same
 * place — an offer in the holder's wallet — and differs only in what you must
 * already have: a connection, an address, or a screen they can point a phone at.
 */
const OPTIONS: MethodOption[] = [
  {
    heading: "QR code",
    tag: "No connection needed",
    icon: "verify",
    description:
      "Generate a scannable code that issues on scan. Nothing has to exist between you and the holder beforehand.",
    href: "/credentials/issue/connection-oob",
    recommended: true,
  },
  {
    heading: "Connection",
    tag: "Existing holders",
    icon: "connections",
    description:
      "Issue to a holder you are already connected with. No new invitation, and the channel is already trusted.",
    href: "/credentials/connections",
  },
  {
    heading: "Email",
    tag: "Single holder",
    icon: "mail",
    description:
      "Send an offer to one email address. The holder accepts it in their wallet app.",
    href: "/credentials/issue/email",
  },
  {
    heading: "Bulk",
    tag: "CSV upload",
    icon: "layers",
    description:
      "Issue to many holders at once from a .csv whose columns map to your schema's attributes.",
    href: "/credentials/issue/bulk-issuance",
  },
];

export function IssueMethodView() {
  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Credentials", href: "/credentials" }, { label: "Issue" }]}
          title="Issue credentials"
        />
        <p className="m-0 max-w-[62ch] text-[15px] leading-[1.6] text-muted">
          Choose how the offer reaches the holder. You will pick the schema and credential
          definition next, whichever route you take.
        </p>
        <OptionCards options={OPTIONS} />
      </div>
    </AppShell>
  );
}
