<script>
	let { children } = $props();
</script>

{@render children()}

<style>
	@font-face {
		font-family: 'Google Sans Flex';
		src: url('/fonts/GoogleSansFlex_36pt-Light.ttf') format('truetype');
		font-weight: 300;
		font-display: swap;
	}

	:global(:root) {
		--bg: #0a0a14;
		--fg: #c8e8ff;
		--muted: rgb(200 232 255 / 0.55);
		--faint: rgb(200 232 255 / 0.14);
		--gutter: clamp(1rem, 3.5vw, 2.5rem);
		color-scheme: dark;
	}

	:global(html, body) {
		margin: 0;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Google Sans Flex', system-ui, sans-serif;
		font-weight: 300;
		-webkit-font-smoothing: antialiased;
	}

	:global(a) {
		color: var(--fg);
	}
</style>
