<script>
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<header class="site-header">
	<a href={resolve('/')}>loop[delirium]</a>
</header>

<main class="container">
	{@render children()}
</main>

<style>
	.site-header {
		padding: var(--gutter);
	}

	.site-header a {
		text-decoration: none;
	}

	.site-header a:hover {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.25em;
	}

	.container {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 var(--gutter) 6rem;
	}

	@media print {
		.site-header {
			display: none;
		}
	}
</style>
