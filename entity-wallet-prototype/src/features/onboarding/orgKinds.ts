import type { OrgKind } from "@/lib/demoData";

/**
 * Which register can vouch for each kind of organisation.
 *
 * A governance input still being decided (GovTech requirements items 17–18),
 * so it is data attached to the kind rather than the companies register
 * hard-coded into the flow. The screen names the register before anyone
 * proves anything — a person about to answer a proof request should know
 * who is going to be asked about them.
 *
 * `register: null` is the case the manual-review decision changed. With no
 * register to answer automatically, an organisation used to be unable to
 * register at all; HOLDER is "automatic where a register answers; otherwise
 * NDI review" (Flow 1 design §8), so it now goes to review instead of
 * stopping.
 */
export const ORG_KINDS: {
  value: OrgKind;
  label: string;
  register: string | null;
}[] = [
  { value: "company", label: "Private or public limited company", register: "Corporate Regulatory Authority" },
  { value: "licensed", label: "Licensed business — sole proprietorship or partnership", register: "Ministry of Industry, Commerce & Employment" },
  { value: "cso", label: "Civil society organisation", register: null },
];

export const kindOf = (value: OrgKind | undefined) => ORG_KINDS.find((k) => k.value === value) ?? ORG_KINDS[0];
