import type { PageLoad } from './$types';
import { asset } from '$app/paths';

// Client-only: the controls and settings live in the browser.
export const ssr = false;

// The full font (all printable ASCII) so any text can be typed in.
export const load: PageLoad = async ({ fetch }) => {
	const font = await fetch(asset('fonts/google-sans-light.json')).then((r) => r.json());
	return { font };
};
