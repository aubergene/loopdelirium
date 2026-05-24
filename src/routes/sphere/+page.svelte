<script lang="ts">
	import { onMount } from 'svelte';
	import TextOnCurve from '$lib/TextOnCurve.svelte';
	import { torusSpiral, torusNormal } from '$lib/curves';
	import type { Font } from '$lib/glyphs';

	let font = $state<Font | null>(null);

	let torusTurns  = $state(4);
	let tubeTurns   = $state(1);
	let torusR      = $state(1.0);
	let torusSmallR = $state(0.38);

	let charScale     = $state(0.12);
	let repeats       = $state(2);
	let scrollSpeed   = $state(0.05);
	let rotationSpeed = $state(0);
	let viewYaw       = $state(0.4);
	let viewPitch     = $state(0.3);

	const curve    = $derived(torusSpiral(torusTurns, tubeTurns, torusR, torusSmallR));
	const normalFn = $derived(torusNormal(torusR));

	onMount(async () => {
		font = await fetch('/fonts/typode.json').then((r) => r.json());
	});
</script>

<svelte:head><title>loop delirium</title></svelte:head>

{#if font}
	<TextOnCurve
		text="loop delirium  "
		{font}
		{curve}
		{normalFn}
		{charScale}
		{repeats}
		{scrollSpeed}
		{rotationSpeed}
		{viewYaw}
		{viewPitch}
	/>
{:else}
	<div class="loading">loading font…</div>
{/if}

<div class="controls">
	<label
		>torus turns: {torusTurns}
		<input type="range" min="1" max="12" step="1" bind:value={torusTurns} />
	</label>
	<label
		>tube turns: {tubeTurns}
		<input type="range" min="0" max="6" step="0.1" bind:value={tubeTurns} />
	</label>
	<label
		>major R: {torusR.toFixed(2)}
		<input type="range" min="0.5" max="2" step="0.01" bind:value={torusR} />
	</label>
	<label
		>tube r: {torusSmallR.toFixed(2)}
		<input type="range" min="0.1" max="0.6" step="0.01" bind:value={torusSmallR} />
	</label>
	<label
		>char size: {charScale.toFixed(2)}
		<input type="range" min="0.04" max="0.3" step="0.01" bind:value={charScale} />
	</label>
	<label
		>repeats: {repeats}
		<input type="range" min="1" max="10" step="1" bind:value={repeats} />
	</label>
	<label
		>scroll: {scrollSpeed.toFixed(3)}
		<input type="range" min="-0.3" max="0.3" step="0.001" bind:value={scrollSpeed} />
	</label>
	<label
		>rotate: {rotationSpeed.toFixed(2)}
		<input type="range" min="-2" max="2" step="0.01" bind:value={rotationSpeed} />
	</label>
	<label
		>yaw: {viewYaw.toFixed(2)}
		<input type="range" min="-3.14" max="3.14" step="0.01" bind:value={viewYaw} />
	</label>
	<label
		>pitch: {viewPitch.toFixed(2)}
		<input type="range" min="-1.5" max="1.5" step="0.01" bind:value={viewPitch} />
	</label>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #0a0a14;
		color: #c8e8ff;
		font-family: monospace;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50vw;
		opacity: 0.4;
	}

	.controls {
		display: flex;
		gap: 2rem;
		padding: 1rem;
		flex-wrap: wrap;
		align-items: flex-end;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.75rem;
	}
</style>
