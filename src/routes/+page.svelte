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
</script>

<svelte:head>
	<title>loop[delirium]</title>
</svelte:head>

<div class="canvas-wrap">
	<TextOnCurve
		text="loop [delirium]  "
		font={data.font}
		{curve}
		{normalFn}
		repeats={7}
		zoom={1.0}
		{scrollSpeed}
		letterSpacing={-0.17}
		{rotationSpeed}
		viewYaw={-0.61}
		{viewPitch}
		smoothing={0.25}
	/>
</div>

{#if orientation.needsPermission}
	<button class="motion-prompt" onclick={orientation.grantPermission}>
		tap to enable motion
	</button>
{/if}

<div class="content">
	<h1>loop[delirium]</h1>
	<p>
		Follow us on instagram <a href="https://www.instagram.com/loopdelirium">@loopdelirium</a>.
	</p>
	<h2>Shows</h2>
	<ul>
		<li>
			<a href={resolve('/(content)/not-yet-but-soon')}>not yet, but soon</a>
			- 14 Nov - 7 Dec - Sugar House Island
		</li>
	</ul>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #0a0a14;
		color: #c8e8ff;
		font-family: monospace;
	}

	.canvas-wrap {
		width: 100%;
	}

	.motion-prompt {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		background: #1a1a2e;
		color: #c8e8ff;
		border: 1px solid #c8e8ff44;
		padding: 0.5rem 1.2rem;
		font-family: monospace;
		font-size: 0.8rem;
		cursor: pointer;
		z-index: 10;
	}

	.content {
		padding: 1.5rem 2rem;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		font-weight: normal;
		letter-spacing: 0.05em;
	}

	h2 {
		margin: 1.5rem 0 0.5rem;
		font-size: 1rem;
		font-weight: normal;
		opacity: 0.6;
	}

	a {
		color: #c8e8ff;
	}

	ul {
		margin: 0;
		padding-left: 1.2rem;
	}
</style>
