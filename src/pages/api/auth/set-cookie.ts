import type { APIRoute } from 'astro';
import { setToCookies } from '../../../api/Auth';

export const post: APIRoute = async ({ request, cookies, redirect }) => {
	/* Get body from request */
	const body = await request.json();

	body &&
		body.length > 0 &&
		body.forEach((item) => {
			setToCookies(cookies, item.key, item?.value as string, {
				path: '/',
			});
		});

	return redirect("/");
};
