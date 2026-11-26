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
			<div>
				<div class="title">{artwork.title}</div>
				<div class="artist">{artwork.artist}</div>
			</div>
			<QrCode value="{url}/{artwork.id}" size={120} />
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
		font-family: 'Google Sans Flex', sans-serif;
		font-weight: 300;
	}

	.card {
		display: flex;
		gap: 0.4cm;
		justify-content: space-between;
		align-items: center;
		width: 9.5cm;
		padding: 0.4cm;
		border: 1px dashed #ccc;
		box-sizing: border-box;
		break-inside: avoid;
		font-size: 16px;
		line-height: 1.3;
	}

	.card :global(img) {
		display: block;
		flex-shrink: 0;
	}

	.title {
		font-size: 20px;
	}

	.artist {
		margin-top: 0.2em;
		color: #555;
	}
</style>
