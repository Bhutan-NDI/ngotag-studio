/* An earlier address for appointing someone, from before Flow 3 had its own
   screens. It goes to the one screen that appoints (SCR-DEL-02). */
import { redirect } from "next/navigation";

export default function NewRelationRedirectPage(): never {
  redirect("/people-who-can-act/appoint");
}
