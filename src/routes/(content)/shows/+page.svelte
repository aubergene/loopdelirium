<script>
	import { asset, resolve } from '$app/paths';

	const shows = [
		{
			href: resolve('/(content)/staying-with-the-friction'),
			title: 'STAYING WITH THE FRICTION',
			poster: asset('img/staying-with-the-friction.jpg'),
			dates: '27 Nov 2026 – 10 Jan 2027',
			venue: 'Hypha Gallery South Bank, London',
		},
		{
			href: resolve('/(content)/not-yet-but-soon'),
			title: 'NOT YET BUT SOON',
			poster: asset('img/not-yet-but-soon.jpg'),
			dates: '14 Nov – 6 Dec 2024',
			venue: 'Hypha Gallery 2, Sugar House Island, London',
		},
	];
</script>

<svelte:head>
	<title>Shows - loop[delirium]</title>
	<meta name="description" content="Exhibitions curated by loop[delirium]." />
</svelte:head>

<h1>Shows</h1>

<ul class="shows">
	{#each shows as show}
		<li>
			<a href={show.href}>
				<img src={show.poster} alt="" />
				<span class="title">{show.title}</span>
				<span class="muted">{show.dates}</span>
				<span class="muted">{show.venue}</span>
			</a>
		</li>
	{/each}
</ul>

<style>
	h1 {
		margin: clamp(1rem, 4vw, 3rem) 0 2rem;
		font-size: clamp(2.25rem, 6vw, 4.75rem);
		font-weight: 300;
		line-height: 0.95;
		letter-spacing: -0.01em;
	}

	.shows {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: end;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		text-decoration: none;
		line-height: 1.5;
	}

	img {
		width: 100%;
		height: auto;
		margin-bottom: 0.8rem;
		transition: opacity 0.2s;
	}

	a:hover img {
		opacity: 0.85;
	}

	.title {
		font-size: 1.375rem;
		font-weight: 300;
		text-decoration: underline;
		text-decoration-color: rgb(200 232 255 / 0.3);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.25em;
		transition: text-decoration-color 0.2s;
	}

	a:hover .title,
	a:focus-visible .title {
		text-decoration-color: var(--fg);
	}

	.muted {
		color: var(--muted);
	}
</style>
