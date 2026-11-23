/**
 * Downloads the "Staying with the Friction" artist & work info sheet and writes
 * the public columns (id, artist, title, label) to a CSV the site reads.
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

const artworks = rows
	.slice(headerIndex + 1)
	.map((row) => ({
		id: row[index.id].trim(),
		artist: row[index.artist].trim(),
		title: row[index.title].trim(),
		label: row[index.label]
			.replace(/​/g, '')
			.split(/\r?\n/)
			.map((line) => line.trim())
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim(),
	}))
	.filter((artwork) => artwork.id && artwork.title);

writeFileSync(OUT, csvFormat(artworks) + '\n');
console.log(`Wrote ${artworks.length} artworks to ${OUT}`);
