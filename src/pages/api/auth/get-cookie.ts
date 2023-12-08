import type { APIRoute } from 'astro';
import { getFromCookies } from '../../../api/Auth';

export const post: APIRoute = async ({ request, cookies, redirect }) => {
	/* Get body from request */
	const body = await request.json();
	getFromCookies(cookies, body);
	return redirect('/');
};
