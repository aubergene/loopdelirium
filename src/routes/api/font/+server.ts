import type { RequestHandler } from './$types';
import { readFileSync } from 'fs';
import { json } from '@sveltejs/kit';

// Loaded once at startup — safe for static prerender and adapter-node.
const fullFont = JSON.parse(readFileSync('static/fonts/google-sans-light.json', 'utf-8'));

// Fixed set of glyphs needed by the main page.
const MAIN_CHARS = new Set('loop [delirium]  ');

export const GET: RequestHandler = () => {
	const glyphs: Record<string, unknown> = {};
	for (const char of MAIN_CHARS) {
		if (fullFont.glyphs[char]) glyphs[char] = fullFont.glyphs[char];
	}
	return json({ capHeight: fullFont.capHeight, glyphs });
};

export const prerender = true;
