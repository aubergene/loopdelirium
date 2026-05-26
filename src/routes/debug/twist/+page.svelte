<script lang="ts">
	import { Pane, Slider, Folder, Separator, Button } from 'svelte-tweakpane-ui';
	import TextOnCurve from '$lib/TextOnCurve.svelte';
	import { torusSpiral, torusNormal } from '$lib/curves';

	let { data } = $props();

	// Torus shape
	let torusTurns  = $state(4);
	let tubeTurns   = $state(1);
	let torusR      = $state(1.0);
	let torusSmallR = $state(0.38);

	// Text
	let charScale = $state(0.12);
	let repeats   = $state(2);

	// Animation
	let scrollSpeed   = $state(0.05);
	let rotationSpeed = $state(0);

	// View
	let viewYaw   = $state(0.4);
	let viewPitch = $state(0.3);

	const curve    = $derived(torusSpiral(torusTurns, tubeTurns, torusR, torusSmallR));
	const normalFn = $derived(torusNormal(torusR));

	function copySettings() {
		const settings = {
			torusTurns, tubeTurns, torusR, torusSmallR,
			charScale, repeats, scrollSpeed, rotationSpeed, viewYaw, viewPitch,
		};
		navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
	}
</script>

<svelte:head><title>debug: twist</title></svelte:head>

<TextOnCurve
	text="loop delirium  "
	font={data.font}
	{curve}
	{normalFn}
	{charScale}
	{repeats}
	{scrollSpeed}
	{rotationSpeed}
	{viewYaw}
	{viewPitch}
/>

<Pane title="twist" position="fixed">
	<Folder title="torus">
		<Slider bind:value={torusTurns}  min={1}   max={12}  step={1}    label="turns (major)" />
		<Slider bind:value={tubeTurns}   min={0}   max={6}   step={0.1}  label="turns (tube)"  />
		<Slider bind:value={torusR}      min={0.5} max={2}   step={0.01} label="major R"        />
		<Slider bind:value={torusSmallR} min={0.1} max={0.6} step={0.01} label="tube r"         />
	</Folder>
	<Folder title="text">
		<Slider bind:value={charScale} min={0.04} max={0.3} step={0.01} label="char size" />
		<Slider bind:value={repeats}   min={1}    max={10}  step={1}    label="repeats"   />
	</Folder>
	<Folder title="animation">
		<Slider bind:value={scrollSpeed}   min={-0.3} max={0.3} step={0.001} label="scroll speed"   />
		<Slider bind:value={rotationSpeed} min={-2}   max={2}   step={0.01}  label="rotation speed" />
	</Folder>
	<Folder title="view">
		<Slider bind:value={viewYaw}   min={-3.14} max={3.14} step={0.01} label="yaw"   />
		<Slider bind:value={viewPitch} min={-1.5}  max={1.5}  step={0.01} label="pitch" />
	</Folder>
	<Separator />
	<Button title="copy settings" on:click={copySettings} />
</Pane>

<style>
	:global(body) {
		margin: 0;
		background: #0a0a14;
		color: #c8e8ff;
		font-family: monospace;
	}
</style>
