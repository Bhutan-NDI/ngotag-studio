/**
 * Copy for the legal pages.
 *
 * IMPORTANT: this is placeholder text. The section structure is taken from the
 * reference app, and each section says the kind of thing that belongs in it,
 * but none of it has been through counsel and none of it should ship to a real
 * marketplace listing as-is. The pages say so on their face rather than only
 * here, because a policy page that looks finished is the one nobody checks.
 */

export const LEGAL = {
  productName: "NDI Studio",
  publisherName: "Bhutan NDI",
  supportEmail: "support@bhutanndi.bt",
  privacyEmail: "privacy@bhutanndi.bt",
  lastUpdated: "24 August 2026",
};

export interface LegalSection {
  heading: string;
  body: string[];
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "Data we collect and process",
    body: [
      "Account data: the name, email address and organization membership of each person who signs in to the Studio.",
      "Operational data: the schemas, credential definitions, connections and issuance or verification records an organization creates while using the service.",
      "Technical data: request logs, IP addresses and browser metadata retained for security and troubleshooting.",
    ],
  },
  {
    heading: "SSI-specific data handling",
    body: [
      "Credential subject attributes pass through the agent when a credential is issued. They are not retained in the Studio beyond the issuance record unless an organization explicitly stores them.",
      "Presentation data received during verification is evaluated against the proof request and discarded once the result is recorded.",
      "Private keys for an organization's DIDs are held in that organization's wallet and are never exported to the Studio.",
    ],
  },
  {
    heading: "How we use data",
    body: [
      "To operate the service: authenticating people, showing an organization its own records, and carrying out the issuance and verification it asks for.",
      "To keep the service secure and available, including abuse prevention and capacity planning.",
      "To meet legal and regulatory obligations that apply to the operator.",
    ],
  },
  {
    heading: "Processing locations and subprocessors",
    body: [
      "Where the service is hosted, and which subprocessors handle data on the operator's behalf, must be listed here with their roles and locations before this page is published.",
    ],
  },
  {
    heading: "Retention and deletion",
    body: [
      "Operational records are retained for as long as the organization exists in the service. Deleting an organization removes its schemas, definitions, connections and issuance records.",
      "Credentials already held in a wallet are outside the operator's control and are not deleted by removing an organization.",
      "Retention periods for logs and backups must be stated here before publication.",
    ],
  },
  {
    heading: "Security",
    body: [
      "Transport is encrypted end to end. Access to production data is limited to named operators and audited.",
      "The specific certifications, audit regime and incident-notification timelines that apply must be stated here before publication.",
    ],
  },
  {
    heading: "GDPR and EU customer provisions",
    body: [
      "Where the operator processes personal data on a customer's behalf it acts as a processor, and the customer as controller.",
      "The lawful basis, transfer mechanism and data-processing agreement that apply must be stated here before publication.",
    ],
  },
  {
    heading: "Privacy rights and contact",
    body: [
      "Individuals may request access to, correction of, or deletion of their personal data.",
      `Requests go to ${LEGAL.privacyEmail} and are answered within the period required by applicable law.`,
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "Marketplace subscription and account activation",
    body: [
      "A subscription is activated by completing onboarding and linking the subscription to an organization in the Studio.",
      "Entitlements, seat counts and metered limits follow the plan purchased through the marketplace listing.",
    ],
  },
  {
    heading: "Acceptable use and customer responsibilities",
    body: [
      "Customers are responsible for the accuracy of the credentials they issue and for having a lawful basis to issue them.",
      "The service may not be used to issue credentials the customer is not authorised to attest to, or to request attributes beyond what a verification legitimately needs.",
      "Customers are responsible for the security of their own wallet keys and API credentials.",
    ],
  },
  {
    heading: "SSI-specific terms",
    body: [
      "The operator provides the issuance and verification infrastructure. It is not a party to the trust relationship between an issuer, a holder and a verifier.",
      "Revocation is available where the credential definition supports it. A credential already accepted into a wallet cannot be recalled by any other means.",
      "Ledger writes are public and permanent by design; nothing written to a ledger can be deleted on request.",
    ],
  },
  {
    heading: "SLA, support tiers, and uptime",
    body: [
      "Target availability, support response times and any service credits must be stated here before publication.",
    ],
  },
  {
    heading: "Data export, portability, and deletion",
    body: [
      "Customers may export their schemas, definitions and issuance records at any time while their subscription is active.",
      "On termination, data is retained for a defined grace period and then deleted. That period must be stated here before publication.",
    ],
  },
  {
    heading: "Suspension and termination",
    body: [
      "The operator may suspend a subscription for non-payment or for use that breaches the acceptable-use terms.",
      "Customers may terminate at any time; the effect on entitlements already paid for must be stated here before publication.",
    ],
  },
  {
    heading: "Liability limits and disclaimers",
    body: [
      "Limitation of liability, warranty disclaimers and indemnities must be drafted by counsel and stated here before publication.",
    ],
  },
  {
    heading: "Service ownership and changes",
    body: [
      "The operator owns the service and its documentation. Customers own the data they put into it.",
      "Material changes to these terms are notified in advance, and the notice period must be stated here before publication.",
    ],
  },
];

export const SUPPORT_SECTIONS: LegalSection[] = [
  {
    heading: "Support scope",
    body: [
      "Support covers the Studio and the agent it talks to: issuance, verification, schemas, definitions, connections and wallet setup.",
      "It does not cover the holder's wallet application, a customer's own integration code, or the behaviour of a third-party ledger.",
    ],
  },
  {
    heading: "Billing handoff",
    body: [
      "Questions about invoices, plan changes and subscription state are handled by the marketplace the subscription was bought through, not by product support.",
      "If a support request turns out to be a billing question it is redirected rather than closed.",
    ],
  },
  {
    heading: "What to include",
    body: [
      "The organization name and, where relevant, the schema or credential definition identifier.",
      "What you expected to happen, what happened instead, and the time it happened.",
      "Any reference id shown on an error, which lets the request be traced in the logs.",
    ],
  },
];
