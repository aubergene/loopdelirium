import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const font = await fetch('/fonts/google-sans-light.json').then((r) => r.json());
	return { font };
};
