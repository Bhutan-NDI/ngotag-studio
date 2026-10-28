import { redirect } from "next/navigation";

/* The pre-spec register of Role and Capability credentials, replaced by
   Flow 8's SCR-AUT-01. Kept as a redirect so an old link still lands. */
export default function Page() {
  redirect("/authority-to-act");
}
