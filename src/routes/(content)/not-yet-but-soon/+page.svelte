<script>
	const { data } = $props();
	import { asset } from '$app/paths';
	import { parse } from 'marked';

	const events = [
		{
			date: 'Sunday 17 November',
			time: '4pm',
			title: 'Exhibition tour & artist talks',
			href: 'https://www.eventbrite.co.uk/e/loopdelirium-artist-talks-tickets-1084273624599',
		},
		{ date: 'Friday 22 November', time: '4pm', title: 'Workshop: AI and the future of film' },
		{
			date: 'Saturday 30 November',
			time: '4pm',
			title: 'Workshop: Anatomy of an installation: Concept, Code Design and Fabrication',
		},
		{
			date: 'Thursday 5 December',
			time: '4:30pm – 8pm',
			title: 'HINTERLANDS',
			note: 'A mixed-reality dance work about the speculative futures of human evolution',
		},
		{
			date: 'Friday 6 December',
			time: '5pm',
			title: 'Closing night event',
			note: 'Performances with special guests to be announced',
		},
	];
</script>

<svelte:head>
	<title>NOT YET BUT SOON - loop[delirium]</title>
</svelte:head>

<section class="intro">
	<img class="poster" src={asset('img/not-yet-but-soon.jpg')} alt="NOT YET BUT SOON" />

	<div>
		<p class="label">Exhibition · 2024</p>
		<h1>NOT YET BUT SOON</h1>
		<p class="lede">
			Curated and produced by loop[delirium] in association with
			<a href="https://hyphastudios.com/">Hypha Studios</a>
		</p>

		<dl class="facts">
			<div>
				<dt class="label">Dates</dt>
				<dd>14 Nov – 6 Dec 2024</dd>
			</div>
			<div>
				<dt class="label">Open</dt>
				<dd>Thu – Sun, 3pm – 8pm</dd>
			</div>
			<div>
				<dt class="label">Venue</dt>
				<dd>
					Hypha Gallery 2<br />
					Sugar House Island<br />
					107 High Street, London E15 4QZ
				</dd>
			</div>
		</dl>
	</div>
</section>

<iframe
	class="map"
	title="Google map of gallery location"
	src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19856.09242593031!2d-0.024965272143553374!3d51.53134792994257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761dbbd906b75f%3A0xc217413b8afaedc5!2sHypha%20Gallery%202%20Sugar%20House%20Island!5e0!3m2!1sen!2suk!4v1731778219127!5m2!1sen!2suk"
	loading="lazy"
	referrerpolicy="no-referrer-when-downgrade"
></iframe>

<section>
	<h2 class="section-title">
		Events <span>All events are free</span>
	</h2>
	<ul class="events">
		{#each events as event}
			<li>
				<p class="when">{event.date} · {event.time}</p>
				<div>
					<p class="what">
						{#if event.href}
							<a href={event.href}>{event.title} <span aria-hidden="true">↗</span></a>
						{:else}
							{event.title}
						{/if}
					</p>
					{#if event.note}<p class="note">{event.note}</p>{/if}
				</div>
			</li>
		{/each}
	</ul>
</section>

<section>
	<h2 class="section-title">
		Artworks <span>{data.rows.length} works</span>
	</h2>

	{#each data.rows as row}
		<article class="artwork" id={row.id}>
			<a class="num" href="#{row.id}" aria-label="Link to {row.title.trim()}">
				{row.id.padStart(2, '0')}
			</a>
			<div>
				<h3>{row.title.trim()}</h3>
				<p class="byline">{row.artist} · {row.date}</p>
				<p class="label">{[row.medium, row.dimensions].filter(Boolean).join(', ')}</p>
				{#if row.description}
					<div class="description">{@html parse(row.description)}</div>
				{/if}
			</div>
		</article>
	{/each}
</section>

<style>
	p,
	h1,
	h2,
	h3,
	dl,
	dd {
		margin: 0;
	}

	.label {
		color: var(--muted);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	a {
		text-decoration: underline;
		text-decoration-color: rgb(200 232 255 / 0.3);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.25em;
		transition: text-decoration-color 0.2s;
	}

	a:hover,
	a:focus-visible {
		text-decoration-color: var(--fg);
	}

	/* ── Intro ─────────────────────────────────────────────── */

	.intro {
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
		gap: clamp(1.5rem, 5vw, 4.5rem);
		align-items: end;
		padding: clamp(1rem, 4vw, 3rem) 0 3rem;
	}

	.poster {
		display: block;
		width: 100%;
		max-width: 502px;
		height: auto;
	}

	h1 {
		margin: 0.6rem 0 1.25rem;
		font-size: clamp(2.25rem, 6vw, 4.75rem);
		font-weight: 300;
		line-height: 0.95;
		letter-spacing: -0.01em;
	}

	.lede {
		max-width: 32rem;
		margin-bottom: 2rem;
		color: var(--muted);
		font-size: 1.0625rem;
		line-height: 1.5;
	}

	.facts > div {
		display: grid;
		grid-template-columns: 6rem 1fr;
		gap: 1rem;
		padding: 0.8rem 0;
		border-top: 1px solid var(--faint);
		line-height: 1.5;
	}

	.facts dt {
		padding-top: 0.2rem;
	}

	/* Google's embed can't be themed, so invert it to sit on the dark page. */
	.map {
		display: block;
		width: 100%;
		height: clamp(220px, 30vw, 320px);
		border: 0;
		filter: grayscale(1) invert(0.92) contrast(0.85);
		opacity: 0.85;
	}

	/* ── Sections ──────────────────────────────────────────── */

	section {
		margin-top: 4rem;
	}

	.intro {
		margin-top: 0;
	}

	.section-title {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding-bottom: 0.8rem;
		border-bottom: 1px solid var(--faint);
		font-size: 1.5rem;
		font-weight: 300;
	}

	.section-title span {
		color: var(--muted);
		font-size: 0.875rem;
	}

	/* ── Events ────────────────────────────────────────────── */

	.events {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.events li {
		display: grid;
		grid-template-columns: 18rem 1fr;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--faint);
		line-height: 1.5;
	}

	.when,
	.note {
		color: var(--muted);
	}

	/* ── Artworks ──────────────────────────────────────────── */

	.artwork {
		display: grid;
		grid-template-columns: 4rem minmax(0, 1fr);
		gap: 1rem;
		padding: 2rem 0;
		border-bottom: 1px solid var(--faint);
		scroll-margin-top: 1rem;
	}

	/* Visitors arrive here from the QR codes on the wall labels. */
	.artwork:target {
		margin: 0 calc(-1 * var(--gutter));
		padding-inline: var(--gutter);
		background: rgb(200 232 255 / 0.05);
		box-shadow: inset 2px 0 0 var(--fg);
	}

	.num {
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		text-decoration: none;
		line-height: 1.9;
	}

	.num:hover {
		color: var(--fg);
	}

	h3 {
		font-size: 1.375rem;
		font-weight: 300;
		line-height: 1.3;
	}

	.byline {
		margin: 0.25rem 0 0.6rem;
		color: var(--muted);
	}

	.description {
		max-width: 65ch;
		margin-top: 1.25rem;
		color: rgb(200 232 255 / 0.82);
		line-height: 1.65;
	}

	.description :global(p) {
		margin: 0 0 1em;
	}

	.description :global(p:last-child) {
		margin-bottom: 0;
	}

	@media (max-width: 720px) {
		.intro {
			grid-template-columns: 1fr;
		}

		.events li {
			grid-template-columns: 1fr;
			gap: 0.2rem;
		}

		.artwork {
			grid-template-columns: 2.5rem minmax(0, 1fr);
		}
	}
</style>
