<script lang="ts">
	import { Slider, Folder, Text, Color } from 'svelte-tweakpane-ui';
	import type { TwistSettings } from './twistSettings';

	let { settings = $bindable() }: { settings: TwistSettings } = $props();
</script>

<Folder title="text">
	<Text bind:value={settings.text} label="text" />
	<Color bind:value={settings.color} label="colour" />
	<Slider bind:value={settings.repeats} min={1} max={20} step={1} label="repeats" />
	<Slider bind:value={settings.letterSpacing} min={-1} max={1} step={0.01} label="spacing" />
</Folder>
<Folder title="torus">
	<Slider bind:value={settings.torusTurns} min={1} max={12} step={1} label="turns (major)" />
	<Slider bind:value={settings.tubeTurns} min={0} max={6} step={1} label="turns (tube)" />
	<Slider bind:value={settings.torusR} min={0.5} max={2} step={0.01} label="major R" />
	<Slider bind:value={settings.torusSmallR} min={0.1} max={0.6} step={0.01} label="tube r" />
</Folder>
<Folder title="motion">
	<Slider bind:value={settings.scrollSpeed} min={-0.3} max={0.3} step={0.001} label="scroll" />
	<Slider bind:value={settings.rotationSpeed} min={-2} max={2} step={0.01} label="rotation" />
	<Slider bind:value={settings.smoothing} min={0} max={1} step={0.01} label="smoothing" />
</Folder>
<Folder title="view">
	<Slider bind:value={settings.zoom} min={0.25} max={4} step={0.05} label="zoom" />
	<Slider bind:value={settings.viewPitch} min={-1.5} max={1.5} step={0.01} label="pitch" />
	<Slider bind:value={settings.viewYaw} min={-3.14} max={3.14} step={0.01} label="yaw" />
</Folder>
