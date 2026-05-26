/**
 * Converts a TTF/OTF font to the path-command JSON format used by TextOnCurve.
 *
 * Output coordinate system (matches glyphs.ts):
 *   x: 0 = left edge of glyph
 *   y: 0 = cap line, CHAR_H (3) = baseline
 *   advance: normalised advance width (varies per glyph)
 *
 * Usage:
 *   pnpm convert-font static/fonts/GoogleSansFlex_36pt-Light.ttf static/fonts/google-sans-light.json
 */

import opentype from 'opentype.js';
import { readFileSync, writeFileSync } from 'fs';

const CHAR_H = 3; // baseline in our coordinate system
const PRECISION = 4; // decimal places for coordinates

const CHARS =
	' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

type Cmd =
	| ['M', number, number]
	| ['L', number, number]
	| ['Q', number, number, number, number]
	| ['C', number, number, number, number, number, number]
	| ['Z'];

interface GlyphEntry {
	advance: number;
	cmds: Cmd[];
}

interface FontData {
	capHeight: number;
	glyphs: Record<string, GlyphEntry>;
}

function r(n: number, precision: number): number {
	const f = 10 ** precision;
	return Math.round(n * f) / f;
}

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
	console.error('Usage: pnpm convert-font <input.ttf> <output.json>');
	process.exit(1);
}

const font = opentype.parse(readFileSync(inputPath).buffer);
const upm = font.unitsPerEm;

// Use the font's capHeight if available, fall back to ascender
const capHeight: number =
	(font.tables as any).os2?.sCapHeight ?? font.ascender ?? upm * 0.7;

const scale = CHAR_H / capHeight;

function normX(x: number): number {
	return r(x * scale, PRECISION);
}
function normY(y: number): number {
	// getPath returns canvas-space y: baseline=0, cap=-capHeight
	return r((y + capHeight) * scale, PRECISION);
}

const glyphs: Record<string, GlyphEntry> = {};
let missing = 0;

for (const char of CHARS) {
	const glyph = font.charToGlyph(char);

	// opentype.js returns .notdef for missing chars
	if (!glyph || glyph.index === 0) {
		missing++;
		continue;
	}

	const advance = r((glyph.advanceWidth ?? 0) * scale, PRECISION);
	const path = glyph.getPath(0, 0, upm);
	const cmds: Cmd[] = [];

	for (const cmd of path.commands) {
		switch (cmd.type) {
			case 'M':
				cmds.push(['M', normX(cmd.x), normY(cmd.y)]);
				break;
			case 'L':
				cmds.push(['L', normX(cmd.x), normY(cmd.y)]);
				break;
			case 'Q':
				cmds.push(['Q', normX(cmd.x1), normY(cmd.y1), normX(cmd.x), normY(cmd.y)]);
				break;
			case 'C':
				cmds.push([
					'C',
					normX(cmd.x1), normY(cmd.y1),
					normX(cmd.x2), normY(cmd.y2),
					normX(cmd.x),  normY(cmd.y),
				]);
				break;
			case 'Z':
				cmds.push(['Z']);
				break;
		}
	}

	glyphs[char] = { advance, cmds };
}

const output: FontData = { capHeight: CHAR_H, glyphs };
writeFileSync(outputPath, JSON.stringify(output, null, 2));

const total = CHARS.length;
console.log(`Converted ${total - missing}/${total} glyphs → ${outputPath}`);
if (missing > 0) console.warn(`  ${missing} chars not found in font (got .notdef)`);
