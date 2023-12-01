import type { APIRoute } from "astro";
import {pathRoutes} from '../../../config/pathRoutes'
import { storageKeys } from "../../../config/CommonConstant";

export const get: APIRoute = async ({ redirect, cookies }) => {
  cookies.delete(storageKeys.SESSION, {
    path: "/",
  });
  cookies.delete("role", {
    path: "/",
  });
  return redirect(pathRoutes.auth.sinIn);
};