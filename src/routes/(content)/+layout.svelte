<script>
	let { children } = $props();
</script>

<div class="container">
	{@render children()}
</div>

<style>
	.container {
		width: 80%;
		margin: auto;
		font-family: Helvetica, sans-serif;
		line-height: 200%;
	}

	@media (max-width: 600px) {
		.container {
			width: 100%;
		}
	}
</style>
