<script>
	const { children, title } = $props();
</script>

<svelte:head>
	<title>{title} - loop[delirium]</title>
</svelte:head>

{@render children()}
