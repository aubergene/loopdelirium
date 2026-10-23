<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} - loop[delirium]</title>
</svelte:head>

<main>
	<p class="label">{page.status}</p>
	<h1>
		{page.status === 404
			? 'This page has looped away.'
			: (page.error?.message ?? 'Something went wrong.')}
	</h1>
	<a href={resolve('/')}>Back to loop[delirium]</a>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.25rem;
		min-height: 100svh;
		padding: 0 var(--gutter);
		box-sizing: border-box;
	}

	.label {
		margin: 0;
		color: var(--muted);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		font-size: clamp(1.75rem, 5vw, 3.5rem);
		font-weight: 300;
		line-height: 1.1;
	}

	a {
		align-self: flex-start;
		text-decoration: underline;
		text-decoration-color: rgb(200 232 255 / 0.3);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.25em;
	}

	a:hover {
		text-decoration-color: var(--fg);
	}
</style>
