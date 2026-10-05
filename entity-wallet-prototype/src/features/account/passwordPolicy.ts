/**
 * The password policy, in one place, because SCR-ONB-01 states it before the
 * password screen and SCR-ONB-04 checks it — and two copies of a policy are
 * how a sign-up form ends up promising one rule and enforcing another.
 *
 * "Policy shown before entry, not as an error afterwards" (UX-EW-01 §3.2,
 * SCR-ONB-04). The rules themselves are Keycloak's to enforce; these mirror
 * them so the person knows before they type.
 */
export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 12 characters", test: (v) => v.length >= 12 },
  { label: "An uppercase and a lowercase letter", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** One line, for SCR-ONB-01's up-front summary. */
export const PASSWORD_SUMMARY =
  "Your password will need at least 12 characters, with upper and lower case, a number and a symbol.";
