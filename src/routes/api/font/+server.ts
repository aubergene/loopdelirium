import type { RequestHandler } from './$types';
import { readFileSync } from 'fs';
import { json } from '@sveltejs/kit';

// Loaded once at startup — safe for static prerender and adapter-node.
const fullFont = JSON.parse(readFileSync('static/fonts/inter-28pt-light.json', 'utf-8'));

export const GET: RequestHandler = ({ url }) => {
	const chars = url.searchParams.get('chars') ?? '';
	const charSet = new Set(chars);

	const glyphs: Record<string, unknown> = {};
	for (const char of charSet) {
		if (fullFont.glyphs[char]) glyphs[char] = fullFont.glyphs[char];
	}

	return json({ capHeight: fullFont.capHeight, glyphs });
};

// Prerender known char sets so static builds work.
// Add an entry here for each page that uses the font.
export const prerender = true;
export const entries = () => [
	{ chars: encodeURIComponent([...new Set('loop delirium  ')].join('')) },
];
