<script>
	const { data } = $props();
	import { base } from '$app/paths';
	import { parse } from 'marked';

	function setHash(id) {
		location.hash = id;
	}
</script>

<svelte:head>
	<title>NOT YET BUT SOON - loop[delirium]</title>
</svelte:head>

<img src="{base}/img/not-yet-but-soon.jpg" alt="NOT YET BUT SOON" />

<h1>NOT YET BUT SOON</h1>

<p>
	Curated and produced by loop[delirium] in assocation with
	<a href="https://hyphastudios.com/">Hypha Studios</a>
</p>

<p>
	Thu - Sun 3pm - 8pm<br />
	<b>14 Nov 2024 - 6 Dec 2024 </b>
</p>

<p>
	Hypha Gallery 2<br />
	Sugar House Island<br />
	107 High Street London E15 4QZ
</p>

<iframe
	title="Google map of gallery location"
	src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19856.09242593031!2d-0.024965272143553374!3d51.53134792994257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761dbbd906b75f%3A0xc217413b8afaedc5!2sHypha%20Gallery%202%20Sugar%20House%20Island!5e0!3m2!1sen!2suk!4v1731778219127!5m2!1sen!2suk"
	width="600"
	height="250"
	style="border:0;"
	loading="lazy"
	referrerpolicy="no-referrer-when-downgrade"
></iframe>

<h2>Events</h2>

<p>All events are free</p>

<ul>
	<li>
		<b>Sunday 17 November - 4pm</b>
		<a href="https://www.eventbrite.co.uk/e/loopdelirium-artist-talks-tickets-1084273624599"
			>Exhibition tour & artist talks</a
		>
	</li>
	<li><b>Friday 22 November - 4pm</b> - Workshop: AI and the future of film</li>
	<li>
		<b>Saturday 30 November - 4pm</b> - Workshop: Anatomy of an installation: Concept, Code Design and
		Fabrication
	</li>
	<li>
		<b>Thursday 5 December - 4:30pm - 8pm</b> HINTERLANDS: A mixed-reality dance work about the speculative
		futures of human evolution
	</li>
	<li>
		<b>Friday 6th December - 5pm</b> Closing night event - performances with special guests to be announced
	</li>
</ul>

<h2>Artworks</h2>

{#each data.rows as row}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<h3 onclick={() => setHash(row.id)} id={row.id}>
		{row.id}.
		{row.title} ({row.date}) - {row.artist}
	</h3>
	<p class="details">{[row.medium, row.dimensions].join(', ')}</p>
	{@html parse(row.description)}
{/each}

<style>
	.details {
		text-transform: uppercase;
		font-size: 11px;
		color: #999;
	}
</style>
