import { csvParse } from 'd3-dsv';
import artworks from '$lib/data/not-yet-but-soon-artworks.csv?raw';

const rows = csvParse(artworks);

export function load() {
	return {
		rows,
	};
}
