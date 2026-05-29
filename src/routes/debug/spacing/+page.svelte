<script lang="ts">
	import TextOnCurve from '$lib/TextOnCurve.svelte';
	import { torusSpiral, torusNormal } from '$lib/curves';

	let { data } = $props();

	const TEXT = 'loop loop2 loop3  ';

	const configs: {
		label: string;
		note?: string;
		torusTurns: number;
		tubeTurns: number;
		R: number;
		r: number;
		repeats: number;
		letterSpacing: number;
		viewYaw: number;
		viewPitch: number;
	}[] = [
		// Baseline: tubeTurns=0 means characters stay on the outer equator — constant-speed circle.
		// Spacing should be PERFECT here. Any visible gaps = remaining bug.
		{
			label: 'major=1 tube=0',
			note: 'pure circle — should be perfectly uniform',
			torusTurns: 1, tubeTurns: 0, R: 1, r: 0.38,
			repeats: 3, letterSpacing: 0, viewYaw: -0.48, viewPitch: 0.3,
		},
		{
			label: 'major=2 tube=0',
			note: 'two loops of pure circle',
			torusTurns: 2, tubeTurns: 0, R: 1, r: 0.38,
			repeats: 5, letterSpacing: 0, viewYaw: -0.48, viewPitch: 0.3,
		},
		{
			label: 'major=4 tube=0',
			note: 'four loops of pure circle',
			torusTurns: 4, tubeTurns: 0, R: 1, r: 0.38,
			repeats: 10, letterSpacing: 0, viewYaw: -0.48, viewPitch: 0.3,
		},
		// Add tube winding — now the curve speed varies
		{
			label: 'major=1 tube=1',
			note: 'simplest helix — introduces speed variation',
			torusTurns: 1, tubeTurns: 1, R: 1, r: 0.38,
			repeats: 3, letterSpacing: 0, viewYaw: -0.48, viewPitch: 0.3,
		},
		{
			label: 'major=4 tube=1',
			torusTurns: 4, tubeTurns: 1, R: 1, r: 0.38,
			repeats: 10, letterSpacing: 0, viewYaw: -0.48, viewPitch: 0.3,
		},
		{
			label: 'major=4 tube=2',
			note: 'main page setting',
			torusTurns: 4, tubeTurns: 2, R: 1, r: 0.38,
			repeats: 10, letterSpacing: 0, viewYaw: -0.48, viewPitch: 0.3,
		},
		{
			label: 'major=4 tube=4',
			torusTurns: 4, tubeTurns: 4, R: 1, r: 0.38,
			repeats: 10, letterSpacing: 0, viewYaw: -0.48, viewPitch: 0.3,
		},
	];
</script>

<svelte:head><title>debug: spacing</title></svelte:head>

<div class="page">
	<h1>spacing debug</h1>
	<p class="hint">
		All instances scroll at 0.01 (slow), rotation off. Test string: <code>{TEXT}</code>
	</p>

	{#each configs as cfg}
		<div class="panel">
			<div class="label">
				<strong>{cfg.label}</strong>
				{#if cfg.note}<span class="note"> — {cfg.note}</span>{/if}
				<span class="params">
					torusTurns={cfg.torusTurns} tubeTurns={cfg.tubeTurns}
					R={cfg.R} r={cfg.r} repeats={cfg.repeats} letterSpacing={cfg.letterSpacing}
				</span>
			</div>
			<TextOnCurve
				text={TEXT}
				font={data.font}
				curve={torusSpiral(cfg.torusTurns, cfg.tubeTurns, cfg.R, cfg.r)}
				normalFn={torusNormal(cfg.R)}
				repeats={cfg.repeats}
				letterSpacing={cfg.letterSpacing}
				scrollSpeed={0.01}
				rotationSpeed={0}
				viewYaw={cfg.viewYaw}
				viewPitch={cfg.viewPitch}
			/>
		</div>
	{/each}
</div>

<style>
	:global(body) {
		margin: 0;
		background: #0a0a14;
		color: #c8e8ff;
		font-family: monospace;
	}

	.page {
		padding: 1.5rem 2rem;
		max-width: 900px;
		margin: 0 auto;
	}

	h1 { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: normal; }

	.hint { margin: 0 0 1.5rem; color: #556; font-size: 0.8rem; }

	code { color: #c8e8ff99; }

	.panel { margin-bottom: 2rem; border: 1px solid #1a1a2e; }

	.label {
		padding: 0.4rem 0.6rem;
		background: #111;
		border-bottom: 1px solid #1a1a2e;
		font-size: 0.75rem;
		line-height: 1.6;
	}

	.note { color: #889; }

	.params { display: block; color: #445; font-size: 0.68rem; }
</style>
