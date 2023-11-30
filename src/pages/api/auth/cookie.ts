import type { APIRoute } from 'astro';
import { pathRoutes } from '../../../config/pathRoutes';
import { setToCookies } from '../../../api/Auth';

export const post: APIRoute = async ({ request, cookies, redirect }) => {
	const payload = await request.json();

	try {
		if (payload && Array.isArray(payload)) {
			payload.forEach((item) => {
				setToCookies(cookies, item.key + 'CCCVVV', item.value as string);
			});
			console.log(92323, payload);
		}
	} catch (err) {
		console.error('Unable to set data with invalid format');
	}

	// return redirect(pathRoutes.users.dashboard);
};
