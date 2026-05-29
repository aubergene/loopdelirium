import type { PageLoad } from './$types';

// All printable ASCII — debug pages need every glyph
const CHARS =
	' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

export const load: PageLoad = async ({ fetch }) => {
	const font = await fetch(`/api/font?chars=${encodeURIComponent(CHARS)}`).then((r) => r.json());
	return { font };
};
