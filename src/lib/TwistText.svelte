<script lang="ts">
	import ShaderCanvas from './ShaderCanvas.svelte';
	import VERT from './shaders/twist.vert?raw';
	import FRAG from './shaders/twist.frag?raw';

	// twist controls the base rate in radians/unit of Y.
	// Higher = more spirals visible. Try 0 (none) to 4 (very tight).
	let { twist = 1.8 }: { twist?: number } = $props();
</script>

<ShaderCanvas vert={VERT} frag={FRAG} uniforms={{ uTwist: twist }} />
