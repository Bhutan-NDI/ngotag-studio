import type { APIRoute } from 'astro';
import { setToCookies } from '../../../api/Auth';

export const post: APIRoute | boolean = async ({
	request,
	cookies,
	redirect,
}) => {
	/* Get body from request */
	const body = await request.json();
	
	body &&
		body?.length > 0 &&
		body?.forEach((item) => {
			console.log(345345, cookies, item.key, item?.value);
			if (!item?.value) {
				return;
			}
			setToCookies(cookies, item.key, item?.value as string, {
				path: '/',
			});
		});

	return redirect('#');
};
