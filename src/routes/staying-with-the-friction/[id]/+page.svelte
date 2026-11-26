<script lang="ts">
	import { parseInline } from 'marked';

	let { data } = $props();

	const artwork = $derived(data.artwork);

	// Some labels use " // " to separate the medium line from the description.
	const paragraphs = $derived(
		artwork.label
			.split(/\n+|\s+\/\/\s+/)
			.map((p) => p.trim())
			.filter(Boolean),
	);
</script>

<svelte:head>
	<title>{artwork.title} – {artwork.artist}</title>
</svelte:head>

<main>
	<p class="label">Staying with the Friction</p>
	<h1>{artwork.title}</h1>
	<p class="artist">{artwork.artist}</p>

	{#each paragraphs as paragraph}
		<p class="text">{@html parseInline(paragraph)}</p>
	{/each}
</main>

<style>
	main {
		max-width: 36rem;
		padding: var(--gutter) var(--gutter) 4rem;
	}

	p,
	h1 {
		margin: 0;
	}

	.label {
		color: var(--muted);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	h1 {
		margin: 2.5rem 0 0.4rem;
		font-size: clamp(2rem, 9vw, 3rem);
		font-weight: 300;
		line-height: 1.05;
	}

	.artist {
		margin-bottom: 2rem;
		color: var(--muted);
		font-size: 1.125rem;
	}

	.text {
		margin-bottom: 1em;
		color: rgb(200 232 255 / 0.82);
		font-size: 1.0625rem;
		line-height: 1.65;
	}
</style>
