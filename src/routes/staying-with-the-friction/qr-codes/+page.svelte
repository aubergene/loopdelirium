<script lang="ts">
	import QrCode from 'svelte-qrcode';
	import { artworks } from '#lib/data/staying-with-the-friction.js';

	const url = 'https://www.loopdelirium.com/staying-with-the-friction';
</script>

<svelte:head>
	<title>QR codes</title>
</svelte:head>

<div class="sheet">
	{#each artworks as artwork}
		<div class="card">
			<QrCode value="{url}/{artwork.id}" size={120} />
			<div>
				<div class="id">{artwork.id}</div>
				<div class="title">{artwork.title}</div>
				<div class="artist">{artwork.artist}</div>
			</div>
		</div>
	{/each}
</div>

<style>
	/* Printed for the wall: keep them black on white regardless of the site theme. */
	.sheet {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5cm;
		padding: 1cm;
		background: #fff;
		color: #000;
		font-family: Helvetica, sans-serif;
		font-weight: normal;
	}

	.card {
		display: flex;
		gap: 0.4cm;
		align-items: center;
		width: 8.5cm;
		padding: 0.4cm;
		border: 1px dashed #ccc;
		box-sizing: border-box;
		break-inside: avoid;
		font-size: 12px;
		line-height: 1.35;
	}

	.card :global(img) {
		display: block;
		flex-shrink: 0;
	}

	.id {
		color: #666;
	}

	.title {
		font-weight: bold;
	}
</style>
