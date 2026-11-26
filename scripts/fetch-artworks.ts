/**
 * Downloads the "Staying with the Friction" artist & work info sheet and writes
 * the public columns (id, artist, title, label, year, medium, instagram) to a CSV
 * the site reads.
 *
 * The sheet also holds install logistics (power, invigilation availability…),
 * which are deliberately left out.
 *
 * Usage:
 *   pnpm fetch-artworks
 *   pnpm fetch-artworks path/to/downloaded.csv   # use a local export instead
 */

import { csvParseRows, csvFormat } from 'd3-dsv';
import { readFileSync, writeFileSync } from 'fs';

const SHEET_ID = '1xHQLvaw4BUOGzvhNWCjM9Y5YkkiArTd3m4TZFID9j70';
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const OUT = 'src/lib/data/staying-with-the-friction-artworks.csv';

const COLUMNS = {
	id: 'id',
	artist: 'Artist Name',
	title: 'Work Title',
	label: 'What you would like the label to say?',
};

// Added late, so may be missing or blank.
const OPTIONAL_COLUMNS = {
	year: 'Year',
	medium: 'Medium',
	instagram: 'Instagram',
};

// Accepts "handle", "@handle" or a profile URL; anything else is dropped.
function instagramHandle(value: string) {
	const handle = value
		.trim()
		.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
		.replace(/^@/, '')
		.replace(/[/?#].*$/, '');
	if (!handle) return '';
	if (!/^[a-z0-9._]{1,30}$/i.test(handle)) {
		console.warn(`Ignoring Instagram handle "${value}"`);
		return '';
	}
	return handle;
}

function tidy(value = '') {
	return value
		.replace(/\u200b/g, '')
		.split(/\r?\n/)
		.map((line) => line.trim())
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

const local = process.argv[2];
const text = local ? readFileSync(local, 'utf8') : await fetch(URL).then((r) => r.text());

// The sheet opens with a couple of rows of notes, so find the header row.
const rows = csvParseRows(text);
const headerIndex = rows.findIndex((row) => row.includes(COLUMNS.title));
if (headerIndex === -1) throw new Error(`No "${COLUMNS.title}" column found`);
const header = rows[headerIndex];

const index = Object.fromEntries(
	Object.entries(COLUMNS).map(([key, name]) => {
		const i = header.indexOf(name);
		if (i === -1) throw new Error(`No "${name}" column found`);
		return [key, i];
	}),
);
const optionalIndex = Object.fromEntries(
	Object.entries(OPTIONAL_COLUMNS).map(([key, name]) => [key, header.indexOf(name)]),
);
const optional = (row: string[], key: keyof typeof OPTIONAL_COLUMNS) =>
	optionalIndex[key] === -1 ? '' : row[optionalIndex[key]];

const artworks = rows
	.slice(headerIndex + 1)
	.map((row) => ({
		id: row[index.id].trim(),
		artist: row[index.artist].trim(),
		title: row[index.title].trim(),
		label: tidy(row[index.label]),
		year: tidy(optional(row, 'year')),
		medium: tidy(optional(row, 'medium')),
		instagram: instagramHandle(optional(row, 'instagram')),
	}))
	.filter((artwork) => artwork.id && artwork.title);

writeFileSync(OUT, csvFormat(artworks) + '\n');
console.log(`Wrote ${artworks.length} artworks to ${OUT}`);
