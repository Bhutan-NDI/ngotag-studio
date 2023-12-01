import type { APIRoute } from "astro";
import { pathRoutes } from "../../../config/pathRoutes";
import { setToCookies } from "../../../api/Auth";
import { storageKeys } from "../../../config/CommonConstant";

export const post: APIRoute = async ({ request, cookies, redirect }) => {
    /* Get body from request */
    const body = await request.json();
    
    const sessionCookie = body?.data

    setToCookies(cookies, storageKeys.SESSION, sessionCookie?.access_token as string, {
        path: "/"
    })
    setToCookies(cookies, "role", sessionCookie?.role as string, {
        path: "/"
    })

    return redirect(pathRoutes.users.dashboard);

};