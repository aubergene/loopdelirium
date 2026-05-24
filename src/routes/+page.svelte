<script lang="ts">
	import { base } from '$app/paths'
	import LoopText from '$lib/LoopText.svelte'
	import TwistText from '$lib/TwistText.svelte'
	import TextOnCurve from '$lib/TextOnCurve.svelte'
	import { sphereSpiral, sphereNormal } from '$lib/curves'

	let { data } = $props()

	const curve = sphereSpiral(8, 1)
	let twist = $state(1.8)
</script>

<svelte:head>
	<title>loop[delirium]</title>
</svelte:head>

<h1>loop[delirium]</h1>

<LoopText text="loop  delirium  " length={8} />

<p>
	Follow us on instagram <a href="https://www.instagram.com/loopdelirium">@loopdelirium</a>.
</p>

<label>
	twist: {twist.toFixed(1)}
	<input type="range" min="0" max="6" step="0.1" bind:value={twist} />
</label>

<TwistText {twist} />

<TextOnCurve
	text="loop delirium "
	font={data.font}
	{curve}
	normalFn={sphereNormal}
/>

<h2>Shows</h2>

<ul>
	<li>
		<a href="{base}/not-yet-but-soon">not yet, but soon</a> - 14 Nov - 7 Dec - Sugar House Island
	</li>
</ul>
