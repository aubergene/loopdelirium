<script lang="ts">
	import type { Font } from '$lib/glyphs';
	import { CHAR_H } from '$lib/glyphs';

	let { data }: { data: { font: Font } } = $props();

	const CELL_W  = 90;
	const CELL_H  = 115;   // extra height for descenders (g, p, q, y reach y≈4)
	const PAD     = 10;
	const Y_RANGE = 4.2;   // coordinate units shown: cap=0 … descender≈4
	const SCALE   = (CELL_H - PAD * 2) / Y_RANGE;

	const chars = $derived(Object.keys(data.font.glyphs).sort());

	function drawGlyph(canvas: HTMLCanvasElement, char: string) {
		const entry = data.font.glyphs[char];
		if (!canvas || !entry) return;

		canvas.width  = CELL_W;
		canvas.height = CELL_H;

		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, CELL_W, CELL_H);

		const tx = (x: number) => PAD + x * SCALE;
		const ty = (y: number) => PAD + y * SCALE;

		// Cap line (y=0)
		ctx.strokeStyle = '#2a2a44';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(0, PAD);
		ctx.lineTo(CELL_W, PAD);
		ctx.stroke();

		// Baseline (y=CHAR_H=3)
		ctx.strokeStyle = '#3a3a55';
		ctx.beginPath();
		ctx.moveTo(0, PAD + CHAR_H * SCALE);
		ctx.lineTo(CELL_W, PAD + CHAR_H * SCALE);
		ctx.stroke();

		// Glyph — nonzero handles opposite-winding holes and ignores degenerate loops
		ctx.fillStyle = '#c8e8ff';
		ctx.beginPath();
		for (const cmd of entry.cmds) {
			switch (cmd[0]) {
				case 'M': ctx.moveTo(tx(cmd[1]), ty(cmd[2])); break;
				case 'L': ctx.lineTo(tx(cmd[1]), ty(cmd[2])); break;
				case 'Q': ctx.quadraticCurveTo(tx(cmd[1]), ty(cmd[2]), tx(cmd[3]), ty(cmd[4])); break;
				case 'C': ctx.bezierCurveTo(tx(cmd[1]), ty(cmd[2]), tx(cmd[3]), ty(cmd[4]), tx(cmd[5]), ty(cmd[6])); break;
				case 'Z': ctx.closePath(); break;
			}
		}
		ctx.fill(); // nonzero — correct for opposite-winding holes and degenerate loops

		// Char label
		ctx.fillStyle = '#556';
		ctx.font = '9px monospace';
		ctx.fillText(JSON.stringify(char), 2, CELL_H - 2);
	}
</script>

<div class="page">
	<h1>Glyph debug</h1>
	<p class="hint">
		Dark blue = cap line (y=0), slightly lighter = baseline (y={CHAR_H}).
		{chars.length} glyphs loaded.
	</p>
	<div class="grid">
		{#each chars as char}
			<div class="cell">
				<canvas use:drawGlyph={char}></canvas>
			</div>
		{/each}
	</div>
</div>

<style>
	.page {
		background: #0a0a14;
		color: #c8e8ff;
		min-height: 100vh;
		padding: 2rem;
		font-family: monospace;
	}
	h1 { margin: 0 0 0.25rem; font-size: 1.1rem; }
	.hint { margin: 0 0 1.5rem; color: #556; font-size: 0.8rem; }
	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.cell canvas {
		display: block;
		background: #111;
		border: 1px solid #1a1a2e;
	}
</style>
