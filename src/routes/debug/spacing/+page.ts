import type { PageLoad } from './$types';

const CHARS =
	' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

export const load: PageLoad = async ({ fetch }) => {
	const font = await fetch(`/api/font?chars=${encodeURIComponent(CHARS)}`).then((r) => r.json());
	return { font };
};
