/* SCR-DEL-02 was "Give someone authority" until UX-EW-01 v0.23 renamed it
   "Appoint someone", so appointing is not confused with the *Give authority
   to act* box on it. The old address is kept for links saved before then. */
import { redirect } from "next/navigation";

export default function GiveRedirectPage(): never {
  redirect("/people-who-can-act/appoint");
}
