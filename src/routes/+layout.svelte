<script>
	import './style.css';

	let { children } = $props();
</script>

<div class="container">
	{@render children()}
</div>

<style>
	.container {
		width: 80%;
		margin: auto;
		font-family: Helvetica, sans-serif;
		line-height: 200%;
	}
</style>
