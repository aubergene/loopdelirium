<script>
	let { children } = $props();
</script>

<div class="container">
	{@render children()}
</div>

<style>
	:global(html, body) {
		background: #000;
		color: #333;
		margin: 0;
	}

	:global(a) {
		color: #444;
	}

	:global(a:hover) {
		color: #666;
	}

	.container {
		width: 80%;
		margin: auto;
		font-family: Helvetica, sans-serif;
		line-height: 200%;
	}
</style>
