<script lang="ts">
	import ShaderCanvas from './ShaderCanvas.svelte';
	import VERT from './shaders/twist.vert?raw';
	import FRAG from './shaders/twist.frag?raw';
</script>

<ShaderCanvas vert={VERT} frag={FRAG} />
