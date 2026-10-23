<script>
	import QrCode from 'svelte-qrcode';

	const { data } = $props();

	const url = 'https://www.loopdelirium.com/not-yet-but-soon';
</script>

<svelte:head>
	<title>cards</title>
</svelte:head>

<div class="sheet">
	<h2>Artworks</h2>

	{#each data.rows as row}
		<div class="card">
			<div class="id">
				{row.id}
			</div>
			<div class="artwork">
				<div class="title">
					<b>{row.title}</b> ({row.date})
				</div>
				<div class="artist">
					{row.artist}
				</div>
				<p class="details">
					{row.medium}<br />
					{row.dimensions}
				</p>
				<div class="qr">
					<QrCode value="{url}#{row.id}" size={60} />
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	/* Printed wall labels: keep them black on white regardless of the site theme. */
	.sheet {
		padding: 1em;
		background: #fff;
		color: #000;
		font-family: Helvetica, sans-serif;
		font-weight: normal;
	}

	@media print {
		.card {
			break-inside: avoid;
		}
	}
	.card {
		display: flex;
		border: 1px dashed #ccc;
		margin: 2em;
		padding: 1.6em;
		width: 12cm;
		height: 5cm;
		box-sizing: border-box;
	}

	.id {
		padding-right: 0.8em;
	}

	.artwork {
		position: relative;
		flex-grow: 2;
		font-size: 18px;
		line-height: 22px;
	}

	.details {
		font-size: 14px;
		line-height: 16px;
		text-transform: uppercase;
		color: #666;
		width: calc(100% - 70px);
	}

	.qr {
		position: absolute;
		bottom: 0;
		right: 0;
		margin-left: 1em;
	}

	.qr > :global(img) {
		display: block;
	}
</style>
