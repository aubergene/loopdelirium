<script lang="ts">
	import { onMount } from 'svelte';
	import { createRenderer, type Renderer, type UniformValue } from './ShaderRenderer';

	let {
		vert,
		frag,
		uniforms = {}
	}: {
		vert: string;
		frag: string;
		uniforms?: Record<string, UniformValue>;
	} = $props();

	let canvas: HTMLCanvasElement;

	// $state makes `renderer` a reactive signal. When onMount sets it,
	// the $effect below re-runs — that's how the initial uniforms get applied.
	let renderer = $state<Renderer | null>(null);

	onMount(() => {
		renderer = createRenderer(canvas, vert, frag);
		return () => {
			renderer?.destroy();
			renderer = null;
		};
	});

	// $effect tracks `renderer` and `uniforms` as reactive dependencies.
	// It runs whenever either changes:
	//   - after mount, when renderer goes null → Renderer
	//   - whenever the parent updates the uniforms prop
	// Unlike a plain closure, $effect is a proper reactive context so prop
	// updates are guaranteed to be seen here.
	$effect(() => {
		renderer?.setUniforms(uniforms);
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		cursor: crosshair;
	}
</style>
