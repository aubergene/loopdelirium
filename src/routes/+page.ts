import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const font = await fetch('/api/font').then((r) => r.json());
	return { font };
};
