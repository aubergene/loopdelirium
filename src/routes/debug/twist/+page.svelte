<script lang="ts">
	import { Pane, Separator, Button } from 'svelte-tweakpane-ui';
	import TextOnCurve from '#lib/TextOnCurve.svelte';
	import TwistControls from '#lib/TwistControls.svelte';
	import { torusSpiral, torusNormal } from '#lib/curves.js';
	import {
		DEFAULT_SETTINGS,
		loadSettings,
		saveSettings,
		copySettings,
		toggleFullscreen,
	} from '#lib/twistSettings.js';

	let { data } = $props();

	let settings = $state(loadSettings());
	let showPane = $state(true);

	const curve = $derived(
		torusSpiral(settings.torusTurns, settings.tubeTurns, settings.torusR, settings.torusSmallR),
	);
	const normalFn = $derived(torusNormal(settings.torusR));

	$effect(() => saveSettings($state.snapshot(settings)));

	function onKey(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement) return;
		if (e.key === 'h') showPane = !showPane;
		if (e.key === 'f') toggleFullscreen();
	}
</script>

<svelte:head><title>debug: twist</title></svelte:head>
<svelte:window onkeydown={onKey} />

<div class="stage">
	<TextOnCurve
		text={settings.text}
		font={data.font}
		{curve}
		{normalFn}
		repeats={settings.repeats}
		zoom={settings.zoom}
		letterSpacing={settings.letterSpacing}
		scrollSpeed={settings.scrollSpeed}
		rotationSpeed={settings.rotationSpeed}
		smoothing={settings.smoothing}
		viewYaw={settings.viewYaw}
		viewPitch={settings.viewPitch}
		color={settings.color}
	/>
</div>

{#if showPane}
	<Pane title="twist · H to hide" position="fixed">
		<TwistControls bind:settings />
		<Separator />
		<Button title="copy settings" on:click={() => copySettings($state.snapshot(settings))} />
		<Button title="reset to home page look" on:click={() => (settings = { ...DEFAULT_SETTINGS })} />
		<Button title="fullscreen (F)" on:click={toggleFullscreen} />
	</Pane>
{/if}

<style>
	.stage {
		position: fixed;
		inset: 0;
	}

	.stage :global(canvas) {
		width: 100%;
		height: 100%;
		aspect-ratio: auto;
	}
</style>
