<script>
	import QrCode from 'svelte-qrcode';
	import { parse } from 'marked';

	const { data } = $props();

	const url = 'https://www.loopdelirium.com/not-yet-but-soon';
</script>

<svelte:head>
	<title>cards</title>
</svelte:head>

<h2>Artworks</h2>

{#each data.rows as row}
	<div class="artwork">
		<div class="qr">
			<QrCode value="{url}#{row.id}" size="100" />
		</div>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<h3>
			{row.id}
			{row.title} ({row.date}) - {row.artist}
		</h3>
		<p class="details">{[row.medium, row.dimensions].join(', ')}</p>
		{@html parse(row.description)}
	</div>
{/each}

<style>
	.details {
		text-transform: uppercase;
		font-size: 13px;
		color: #666;
	}

	h3 {
		margin-top: 0;
	}

	.artwork {
		border: 1px solid #999;
		margin: 2em;
		padding: 2em;
	}

	.qr {
		float: right;
		margin-left: 32px;
	}
</style>
