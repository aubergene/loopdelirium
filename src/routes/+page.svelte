<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import TextOnCurve from '$lib/TextOnCurve.svelte';
	import { torusSpiral, torusNormal } from '$lib/curves';

	let { data } = $props();

	const curve = torusSpiral(4, 2, 1.0, 0.38);
	const normalFn = torusNormal(1.0);

	// Device-orientation controlled on mobile, fixed on desktop
	let viewPitch = $state(0.3);
	let rotationSpeed = $state(0.26);
	let needsPermission = $state(false);

	function handleOrientation(e: DeviceOrientationEvent) {
		if (e.beta === null || e.gamma === null) return;
		// beta ~90 = phone upright; map to pitch so upright = 0
		viewPitch = Math.max(-1.5, Math.min(1.5, (e.beta - 90) * (1.5 / 90)));
		// gamma: negative = tilt left, positive = tilt right
		rotationSpeed = (e.gamma / 90) * 1.5;
	}

	async function grantPermission() {
		const result = await (
			DeviceOrientationEvent as DeviceOrientationEvent & {
				requestPermission(): Promise<'granted' | 'denied'>;
			}
		).requestPermission();
		if (result === 'granted') {
			needsPermission = false;
			window.addEventListener('deviceorientation', handleOrientation);
		}
	}

	onMount(() => {
		if (!window.DeviceOrientationEvent) return;

		if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
			// iOS 13+ requires a user gesture to grant permission
			needsPermission = true;
		} else {
			window.addEventListener('deviceorientation', handleOrientation);
			return () => window.removeEventListener('deviceorientation', handleOrientation);
		}
	});
</script>

<svelte:head>
	<title>loop[delirium]</title>
</svelte:head>

<div class="canvas-wrap">
	<TextOnCurve
		text="loop delirium  "
		font={data.font}
		{curve}
		{normalFn}
		charScale={0.2}
		repeats={4}
		scrollSpeed={-0.013}
		{rotationSpeed}
		viewYaw={-0.48}
		{viewPitch}
	/>
</div>

{#if needsPermission}
	<button class="motion-prompt" onclick={grantPermission}> tap to enable motion </button>
{/if}

<div class="content">
	<h1>loop[delirium]</h1>
	<p>
		Follow us on instagram <a href="https://www.instagram.com/loopdelirium">@loopdelirium</a>.
	</p>
	<h2>Shows</h2>
	<ul>
		<li>
			<a href="{base}/not-yet-but-soon">not yet, but soon</a> - 14 Nov - 7 Dec - Sugar House Island
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

	.canvas-wrap {
		width: 100%;
	}

	@media (max-width: 600px) {
		.canvas-wrap {
			width: 95%;
			margin: 0 auto;
		}
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
