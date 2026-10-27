/* The old per-operation scope builder is no longer reachable. Raw scope is
   never authored on a screen (EW-FLOW3-SD/D8, UXD-58): what someone can do
   is chosen from four boxes on SCR-DEL-02, and a hand-built scope sent for
   acceptance would bypass every rule that screen and the store apply. */
import { redirect } from "next/navigation";

export default function ScopeRedirectPage(): never {
  redirect("/people-who-can-act");
}
