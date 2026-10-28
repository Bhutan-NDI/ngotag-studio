import { redirect } from "next/navigation";

/* The pre-spec issuance form, replaced by Flow 8's SCR-AUT-02. */
export default function Page() {
  redirect("/authority-to-act/give");
}
