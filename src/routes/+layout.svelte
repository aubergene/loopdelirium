<script>
	let { children } = $props();
</script>

{@render children()}

<style>
	:global(html, body) {
		margin: 0;
		background: #000;
	}

	:global(a) {
		color: #444;
	}

	:global(a:hover) {
		color: #666;
	}
</style>
