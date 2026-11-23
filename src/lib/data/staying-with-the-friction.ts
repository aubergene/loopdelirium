import { csvParse } from 'd3-dsv';
import csv from './staying-with-the-friction-artworks.csv?raw';

// Regenerate the CSV from the Google Sheet with `pnpm fetch-artworks`.
export const artworks = csvParse(csv, ({ id, artist, title, label }) => ({
	id: id!,
	artist: artist!,
	title: title!,
	label: label ?? '',
}));
