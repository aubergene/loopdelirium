import type { PageLoad } from './$types';

// Debug page loads all glyphs so every character is available while tweaking.
export const load: PageLoad = async ({ fetch }) => {
	const font = await fetch('/fonts/google-sans-light.json').then((r) => r.json());
	return { font };
};
