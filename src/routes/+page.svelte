<script lang="ts">
	import { base } from '$app/paths';
	import TextOnCurve from '$lib/TextOnCurve.svelte';
	import { torusSpiral, torusNormal } from '$lib/curves';
	import { useDeviceOrientation } from '$lib/deviceOrientation.svelte';

	let { data } = $props();

	const curve    = torusSpiral(4, 2, 1.0, 0.38);
	const normalFn = torusNormal(1.0);

	const orientation = useDeviceOrientation();

	const viewPitch = $derived(
		orientation.beta !== null
			? Math.max(-1.5, Math.min(1.5, (orientation.beta - 90) * (1.5 / 90)))
			: 0.3
	);
	const rotationSpeed = $derived(
		orientation.gamma !== null ? (orientation.gamma / 90) * 1.5 : 0.26
	);
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

	.canvas-wrap {
		width: 100%;
	}

	@media (max-width: 600px) {
		.canvas-wrap {
			width: 95%;
			margin: 0 auto;
		}
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

	a { color: #c8e8ff; }

	ul {
		margin: 0;
		padding-left: 1.2rem;
	}
</style>
