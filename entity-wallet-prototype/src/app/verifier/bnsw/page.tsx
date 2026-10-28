import { redirect } from "next/navigation";

/* The pre-spec counterparty page — a wallet hop per declaration and a signed
   PASS/FAIL from an "Authority Verification API" — replaced by Flow 9's
   simulated Single Window (FLOW-AUT-02, UX-EW-06 SCR-AUT-07). Kept as a
   redirect so an old link still lands. */
export default function Page() {
  redirect("/simulated/bnsw");
}
