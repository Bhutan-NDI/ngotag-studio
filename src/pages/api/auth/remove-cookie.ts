import type { APIRoute } from 'astro';
import { removeFromCookies } from '../../../api/Auth';

export const post: APIRoute = async ({ request, cookies, redirect }) => {
	/* Get body from request */
	const body = await request.json();

	body &&
		body.length > 0 &&
		body.forEach((item) => {
			removeFromCookies(cookies, item.key, {
				path: '/',
			});
		});

	return redirect("/");
};
