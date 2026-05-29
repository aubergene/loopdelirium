<script lang="ts">
	import { browser } from '$app/environment';
	import { Pane, Slider, Folder, Separator, Button } from 'svelte-tweakpane-ui';
	import TextOnCurve from '$lib/TextOnCurve.svelte';
	import { torusSpiral, torusNormal } from '$lib/curves';

	let { data } = $props();

	const STORAGE_KEY = 'twist-v2';

	function load() {
		if (!browser) return null;
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		} catch {
			return null;
		}
	}

	const s = load();

	// Torus shape
	let torusTurns = $state(Math.round(s?.torusTurns ?? 4));
	let tubeTurns = $state(Math.round(s?.tubeTurns ?? 1));
	let torusR = $state(s?.torusR ?? 1.0);
	let torusSmallR = $state(s?.torusSmallR ?? 0.38);

	// Text
	let repeats = $state(s?.repeats ?? 6);
	let zoom = $state(s?.zoom ?? 1.0);
	let letterSpacing = $state(s?.letterSpacing ?? -0.3);

	// Animation
	let scrollSpeed = $state(s?.scrollSpeed ?? 0.05);
	let rotationSpeed = $state(s?.rotationSpeed ?? 0);

	// View — yaw kept as state but no slider; nudge buttons adjust it
	let viewYaw = $state(s?.viewYaw ?? -0.48);
	let viewPitch = $state(s?.viewPitch ?? 0.3);

	const curve = $derived(torusSpiral(torusTurns, tubeTurns, torusR, torusSmallR));
	const normalFn = $derived(torusNormal(torusR));

	// Persist whenever any setting changes
	$effect(() => {
		const settings = {
			torusTurns,
			tubeTurns,
			torusR,
			torusSmallR,
			repeats,
			zoom,
			letterSpacing,
			scrollSpeed,
			rotationSpeed,
			viewYaw,
			viewPitch,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	});

	function copySettings() {
		const text = JSON.stringify(
			{
				torusTurns,
				tubeTurns,
				torusR,
				torusSmallR,
				repeats,
				zoom,
				letterSpacing,
				scrollSpeed,
				rotationSpeed,
				viewYaw,
				viewPitch,
			},
			null,
			2,
		);
		const ta = Object.assign(document.createElement('textarea'), {
			value: text,
			style: 'position:fixed;left:-9999px;top:0',
		});
		document.body.appendChild(ta);
		ta.focus();
		ta.select();
		const ok = document.execCommand('copy');
		ta.remove();
		if (!ok) navigator.clipboard?.writeText(text);
	}
</script>

<svelte:head><title>debug: twist</title></svelte:head>

<TextOnCurve
	text="loop [delirium]   "
	font={data.font}
	{curve}
	{normalFn}
	{repeats}
	{zoom}
	{letterSpacing}
	{scrollSpeed}
	{rotationSpeed}
	{viewYaw}
	{viewPitch}
/>

<Pane title="twist" position="fixed">
	<Folder title="torus">
		<Slider bind:value={torusTurns} min={1} max={12} step={1} label="turns (major)" />
		<Slider bind:value={tubeTurns} min={0} max={6} step={1} label="turns (tube)" />
		<Slider bind:value={torusR} min={0.5} max={2} step={0.01} label="major R" />
		<Slider bind:value={torusSmallR} min={0.1} max={0.6} step={0.01} label="tube r" />
	</Folder>
	<Folder title="text">
		<Slider bind:value={repeats} min={1} max={20} step={1} label="repeats (size)" />
		<Slider bind:value={zoom} min={0.25} max={4} step={0.05} label="zoom" />
		<Button title="fit (zoom = 1)" onclick={() => (zoom = 1)} />
		<Slider bind:value={letterSpacing} min={-1} max={1} step={0.01} label="letter spacing" />
	</Folder>
	<Folder title="animation">
		<Slider bind:value={scrollSpeed} min={-0.3} max={0.3} step={0.001} label="scroll speed" />
		<Slider bind:value={rotationSpeed} min={-2} max={2} step={0.01} label="rotation speed" />
	</Folder>
	<Folder title="view">
		<Slider bind:value={viewPitch} min={-1.5} max={1.5} step={0.01} label="pitch" />
		<Slider bind:value={viewYaw} min={-3.14} max={3.14} step={0.01} label="yaw" />
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
