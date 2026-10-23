<script lang="ts">
	import { resolve } from '$app/paths';
	import { prefersReducedMotion } from 'svelte/motion';
	import TextOnCurve from '#lib/TextOnCurve.svelte';
	import { torusSpiral, torusNormal } from '#lib/curves.js';
	import { useDeviceOrientation } from '#lib/deviceOrientation.svelte.js';

	let { data } = $props();

	const curve = torusSpiral(1, 3, 0.83, 0.4);
	const normalFn = torusNormal(0.83);

	const orientation = useDeviceOrientation(() => !prefersReducedMotion.current);

	// Desktop: the mouse position (-1…1 across the viewport) stands in for tilt.
	let mouse = $state<{ x: number; y: number } | null>(null);
	$effect(() => {
		if (prefersReducedMotion.current) return;
		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			mouse = { x: (e.clientX / innerWidth) * 2 - 1, y: (e.clientY / innerHeight) * 2 - 1 };
		};
		const onLeave = (e: MouseEvent) => {
			if (!e.relatedTarget) mouse = null;
		};
		window.addEventListener('pointermove', onMove);
		document.addEventListener('mouseout', onLeave);
		return () => {
			window.removeEventListener('pointermove', onMove);
			document.removeEventListener('mouseout', onLeave);
			mouse = null;
		};
	});

	const DEFAULT_PITCH = -0.26;
	const DEFAULT_SCROLL = -0.02;
	const DEFAULT_ROTATION = 0.26;

	const viewPitch = $derived(
		orientation.pitch !== null
			? Math.max(-1.5, Math.min(1.5, orientation.pitch * (1.5 / 90)))
			: mouse
				? DEFAULT_PITCH + mouse.y * 0.7
				: DEFAULT_PITCH,
	);

	// cos() so the speed wraps smoothly through north instead of snapping at 0/360.
	const scrollSpeed = $derived(
		prefersReducedMotion.current
			? 0
			: orientation.heading !== null
				? DEFAULT_SCROLL - 0.1 * Math.cos(orientation.heading * (Math.PI / 180))
				: DEFAULT_SCROLL,
	);
	const rotationSpeed = $derived(
		prefersReducedMotion.current
			? 0
			: orientation.roll !== null
				? (orientation.roll / 90) * 1.5
				: mouse
					? DEFAULT_ROTATION + mouse.x * 1.0
					: DEFAULT_ROTATION,
	);

	// zoom=1 fits the logo to the canvas height, and it's ~1.45× wider than tall,
	// so on narrower screens scale down to keep it inside the width.
	let stageW = $state(0);
	let stageH = $state(0);
	const zoom = $derived(stageH ? Math.min(0.92, (stageW / stageH) * 0.62) : 0.92);

	let hasMouse = $state(false);
	$effect(() => {
		hasMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
	});
	const hint = $derived(
		prefersReducedMotion.current
			? null
			: orientation.pitch !== null
				? 'tilt to steer'
				: hasMouse
					? 'move to steer'
					: null,
	);
</script>

<svelte:head>
	<title>loop[delirium]</title>
	<meta name="description" content="loop[delirium] is an art collective." />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="loop[delirium]" />
	<meta property="og:title" content="loop[delirium]" />
	<meta property="og:description" content="loop[delirium] is an art collective." />
	<meta property="og:url" content="https://www.loopdelirium.com/" />
	<meta property="og:image" content="https://www.loopdelirium.com/img/og-home.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="stage" bind:clientWidth={stageW} bind:clientHeight={stageH}>
	<div class="logo" aria-hidden="true">
		<TextOnCurve
			text="loop [delirium]  "
			font={data.font}
			{curve}
			{normalFn}
			repeats={7}
			{zoom}
			{scrollSpeed}
			letterSpacing={-0.17}
			{rotationSpeed}
			viewYaw={-0.61}
			{viewPitch}
			smoothing={0.25}
		/>
	</div>

	<header class="corner top-left">
		<h1>loop[delirium]</h1>
		<p class="muted">art collective</p>
	</header>

	<nav class="corner top-right" aria-label="Elsewhere">
		<a href="https://www.instagram.com/loopdelirium">Instagram <span aria-hidden="true">↗</span></a>
	</nav>

	<section class="corner bottom-left" aria-labelledby="shows">
		<h2 id="shows" class="label">Shows</h2>
		<a class="show" href={resolve('/(content)/not-yet-but-soon')}>
			<span class="show-title">not yet, but soon</span>
			<span class="muted">14 Nov – 6 Dec 2024</span>
			<span class="muted">Sugar House Island</span>
		</a>
	</section>

	<div class="corner bottom-right">
		{#if orientation.needsPermission}
			<button class="label hint" onclick={orientation.grantPermission}>tap to enable motion</button>
		{:else if hint}
			<p class="label hint">{hint}</p>
		{/if}
	</div>
</main>

<style>
	.stage {
		position: relative;
		height: 100vh;
		height: 100svh;
		overflow: hidden;
		background: radial-gradient(ellipse 60% 55% at 50% 50%, #141832 0%, #0a0a14 70%);
	}

	.logo {
		position: absolute;
		inset: 0;
	}

	.logo :global(canvas) {
		width: 100%;
		height: 100%;
		aspect-ratio: auto;
		background: transparent;
	}

	.corner {
		position: absolute;
		max-width: min(22rem, 45vw);
		font-size: 0.9375rem;
		line-height: 1.45;
		animation: fade-in 1.2s 0.3s ease-out both;
	}

	.top-left {
		top: var(--gutter);
		left: var(--gutter);
	}

	.top-right {
		top: var(--gutter);
		right: var(--gutter);
		text-align: right;
	}

	.bottom-left {
		bottom: var(--gutter);
		left: var(--gutter);
	}

	.bottom-right {
		bottom: var(--gutter);
		right: var(--gutter);
		text-align: right;
	}

	h1,
	h2,
	p {
		margin: 0;
		font: inherit;
	}

	h1 {
		letter-spacing: 0.01em;
	}

	.muted {
		color: var(--muted);
	}

	.label {
		margin-bottom: 0.4rem;
		color: var(--muted);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	a {
		color: var(--fg);
		text-decoration: none;
	}

	.show {
		display: flex;
		flex-direction: column;
	}

	.show-title,
	.top-right a {
		text-decoration: underline;
		text-decoration-color: rgb(200 232 255 / 0.3);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.25em;
		transition: text-decoration-color 0.2s;
	}

	a:hover .show-title,
	.top-right a:hover,
	a:focus-visible .show-title,
	.top-right a:focus-visible {
		text-decoration-color: var(--fg);
	}

	a:focus-visible,
	button:focus-visible {
		outline: 1px solid var(--fg);
		outline-offset: 4px;
	}

	.hint {
		margin: 0;
	}

	button.hint {
		padding: 0.5rem 0.8rem;
		border: 1px solid rgb(200 232 255 / 0.3);
		border-radius: 999px;
		background: rgb(10 10 20 / 0.6);
		color: var(--fg);
		font-family: inherit;
		cursor: pointer;
	}

	@media (max-width: 600px) {
		.corner {
			font-size: 0.875rem;
		}

		.bottom-left {
			max-width: 60vw;
		}

		.bottom-right {
			max-width: 35vw;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.corner {
			animation: none;
		}
	}
</style>
