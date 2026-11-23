<script>
	import { asset } from '$app/paths';

	const artists = [
		{ name: 'Nathan Bayliss', instagram: '_nate_bliss_' },
		{ name: 'Owen Planchart', instagram: 'owenplanch.art' },
		{ name: 'Julian Burgess', instagram: 'julianbramleyburgess' },
		{ name: 'Hanaphora', instagram: 'hanaphora_' },
		{ name: 'Savannah Perry', instagram: 'figuralcrow' },
		{ name: 'Rafa Roeder', instagram: 'rafaroeder' },
		{ name: 'Rob Hall', instagram: 'rob_hall_life' },
		{ name: 'Camila Colussi', instagram: 'camilacolussi' },
		{ name: 'Mirko Febbo', instagram: 'mirko.febbo' },
		{ name: 'Mikhail Aaron' },
		{ name: 'Weezy Derham', instagram: 'dreamb0y.me' },
	];

	const description =
		'An exhibition curated by loop[delirium] with Hypha Studios. 27 Nov 2026 – 10 Jan 2027, Hypha Gallery South Bank, London.';
</script>

<svelte:head>
	<title>STAYING WITH THE FRICTION - loop[delirium]</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="loop[delirium]" />
	<meta property="og:title" content="STAYING WITH THE FRICTION" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content="https://www.loopdelirium.com/staying-with-the-friction" />
	<meta
		property="og:image"
		content="https://www.loopdelirium.com/img/staying-with-the-friction.jpg"
	/>
	<meta property="og:image:width" content="1280" />
	<meta property="og:image:height" content="1600" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<section class="intro">
	<img
		class="poster"
		src={asset('img/staying-with-the-friction.jpg')}
		alt="STAYING WITH THE FRICTION"
	/>

	<div>
		<p class="label">Exhibition · 2026</p>
		<h1>STAYING WITH THE FRICTION</h1>
		<p class="lede">
			Curated by loop[delirium], presented by
			<a href="https://hyphastudios.com/">Hypha Studios</a>
		</p>

		<dl class="facts">
			<div>
				<dt class="label">Opening</dt>
				<dd>
					Thu 26 Nov, 6pm – 9pm<br />
					<a href="https://www.tickettailor.com/events/hyphastudios/2518352"
						>RSVP <span aria-hidden="true">↗</span></a
					>
				</dd>
			</div>
			<div>
				<dt class="label">Dates</dt>
				<dd>27 Nov 2026 – 10 Jan 2027</dd>
			</div>
			<div>
				<dt class="label">Open</dt>
				<dd>
					Thu – Sun, 12pm – 6pm<br />
					<span class="muted">Closed 21 Dec – 3 Jan</span>
				</dd>
			</div>
			<div>
				<dt class="label">Venue</dt>
				<dd>
					Hypha Gallery South Bank, Gallery 3<br />
					42 Southwark Bridge Rd, London SE1 9EU
				</dd>
			</div>
		</dl>
	</div>
</section>

<iframe
	class="map"
	title="Google map of gallery location"
	src="https://www.google.com/maps?q=42+Southwark+Bridge+Rd,+London+SE1+9EU&output=embed"
	loading="lazy"
	referrerpolicy="no-referrer-when-downgrade"
></iframe>

<section>
	<h2 class="section-title">About</h2>
	<div class="description">
		<p>
			Friction may arise between surfaces, bodies, ideas. Friction may be a contest, a caress, a
			force that holds, a source of heat and energy. Friction is generative.
		</p>
		<p>
			<em>Staying with the friction</em> considers the everyday encounters that give lived experience
			form, structure and meaning.
		</p>
		<p>
			This show finds a collection of interdisciplinary practitioners engaging with this resistance
			– creating work in iterative, recursive ways, exploring process as form and effort as reward.
			The pieces interrogate the nature of labour, the relationship between automator and automated,
			and the poetic potential within systems of control. The works ruminate on what may emerge when
			these categories are dissolved – new mythologies and vantage points that lie beyond the
			predicted horizon.
		</p>
		<p>
			Working across durational performance, sculpture, painting and computational systems, the
			assembled artists search for the necessary frictions, asking: what are the sites of resistance
			that ground us, propel us and keep us tethered?
		</p>
	</div>
</section>

<section>
	<h2 class="section-title">
		Artists <span>{artists.length} artists</span>
	</h2>
	<ul class="artists">
		{#each artists as artist}
			<li>
				{#if artist.instagram}
					<a href="https://www.instagram.com/{artist.instagram}">{artist.name}</a>
				{:else}
					{artist.name}
				{/if}
			</li>
		{/each}
	</ul>
</section>

<section>
	<h2 class="section-title">Special guests</h2>
	<ul class="artists">
		<li>London Fields Life Drawing</li>
		<li>L’Atelier Frenchie</li>
	</ul>
	<p class="more">More to be announced</p>
</section>

<section class="credits">
	<p>In partnership with HUB and Bridges Fund Management</p>
	<p>Graphic design by Nathan Bayliss</p>
</section>

<style>
	p,
	h1,
	h2,
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

	.muted {
		color: var(--muted);
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

	.description {
		max-width: 65ch;
		margin-top: 1.25rem;
		color: rgb(200 232 255 / 0.82);
		line-height: 1.65;
	}

	.description p {
		margin: 0 0 1em;
	}

	.description p:last-child {
		margin-bottom: 0;
	}

	/* ── Artists ───────────────────────────────────────────── */

	.artists {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.artists li {
		padding: 1rem 0;
		border-bottom: 1px solid var(--faint);
		font-size: 1.125rem;
		font-weight: 300;
	}

	.more {
		margin-top: 1rem;
		color: var(--muted);
	}

	.credits {
		color: var(--muted);
		line-height: 1.6;
	}

	@media (max-width: 720px) {
		.intro {
			grid-template-columns: 1fr;
		}
	}
</style>
