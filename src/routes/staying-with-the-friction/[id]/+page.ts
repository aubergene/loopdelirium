import { error } from '@sveltejs/kit';
import { artworks } from '#lib/data/staying-with-the-friction.js';
import type { EntryGenerator, PageLoad } from './$types';

// QR codes on the wall labels link here by id, so they keep working if a work
// is renamed.
export const entries: EntryGenerator = () => artworks.map(({ id }) => ({ id }));

export const load: PageLoad = ({ params }) => {
	const artwork = artworks.find(({ id }) => id === params.id);
	if (!artwork) error(404, 'Artwork not found');
	return { artwork };
};
