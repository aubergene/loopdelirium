import type { PageLoad } from './$types';

const TEXT = 'loop delirium  ';
const chars = encodeURIComponent([...new Set(TEXT)].join(''));

export const load: PageLoad = async ({ fetch }) => {
	const font = await fetch(`/api/font?chars=${chars}`).then((r) => r.json());
	return { font };
};
