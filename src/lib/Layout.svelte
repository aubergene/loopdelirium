<script module>
	import { h1, h2, h3 } from './components.js';
	export { h1, h2, h3 };
</script>

<script>
	const { children, title } = $props();
</script>

<svelte:head>
	<title>{title} - loop[delirium]</title>
</svelte:head>

{@render children()}
