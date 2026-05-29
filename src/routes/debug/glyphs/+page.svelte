<script lang="ts">
	import type { Font } from '$lib/glyphs';
	import { CHAR_H } from '$lib/glyphs';

	let { data }: { data: { font: Font } } = $props();

	const PREVIEW_TEXT   = 'loop delirium';
	const PREVIEW_SCALE  = 28;   // px per glyph unit
	const PREVIEW_PAD    = 16;
	const PREVIEW_H      = Math.ceil((CHAR_H + 1.2) * PREVIEW_SCALE + PREVIEW_PAD * 2); // room for descenders

	const CELL_W  = 90;
	const CELL_H  = 115;
	const PAD     = 10;
	const Y_RANGE = 4.2;
	const SCALE   = (CELL_H - PAD * 2) / Y_RANGE;

	const chars = $derived(Object.keys(data.font.glyphs).sort());

	function drawCmds(ctx: CanvasRenderingContext2D, font: Font, char: string, tx: (x: number) => number, ty: (y: number) => number) {
		const entry = font.glyphs[char];
		if (!entry) return;
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
		ctx.fill();
	}

	function drawPreview(canvas: HTMLCanvasElement, _: unknown) {
		const font = data.font;
		const totalAdvance = [...PREVIEW_TEXT].reduce((sum, c) => sum + (font.glyphs[c]?.advance ?? 1), 0);

		canvas.height = PREVIEW_H;
		canvas.width  = Math.ceil(totalAdvance * PREVIEW_SCALE + PREVIEW_PAD * 2);

		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Baseline guide
		ctx.strokeStyle = '#2a2a44';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(0, PREVIEW_PAD + CHAR_H * PREVIEW_SCALE);
		ctx.lineTo(canvas.width, PREVIEW_PAD + CHAR_H * PREVIEW_SCALE);
		ctx.stroke();

		ctx.fillStyle = '#c8e8ff';
		let x = 0;
		for (const char of PREVIEW_TEXT) {
			const entry = font.glyphs[char];
			if (!entry) { x += 1; continue; }
			const ox = x;
			drawCmds(ctx, font, char,
				(u) => PREVIEW_PAD + (ox + u) * PREVIEW_SCALE,
				(v) => PREVIEW_PAD + v * PREVIEW_SCALE,
			);
			x += entry.advance;
		}
	}

	function drawGlyph(canvas: HTMLCanvasElement, char: string) {
		const entry = data.font.glyphs[char];
		if (!canvas || !entry) return;

		canvas.width  = CELL_W;
		canvas.height = CELL_H;

		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, CELL_W, CELL_H);

		const tx = (x: number) => PAD + x * SCALE;
		const ty = (y: number) => PAD + y * SCALE;

		ctx.strokeStyle = '#2a2a44';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(0, PAD);
		ctx.lineTo(CELL_W, PAD);
		ctx.stroke();

		ctx.strokeStyle = '#3a3a55';
		ctx.beginPath();
		ctx.moveTo(0, PAD + CHAR_H * SCALE);
		ctx.lineTo(CELL_W, PAD + CHAR_H * SCALE);
		ctx.stroke();

		ctx.fillStyle = '#c8e8ff';
		drawCmds(ctx, data.font, char, tx, ty);

		ctx.fillStyle = '#556';
		ctx.font = '9px monospace';
		ctx.fillText(JSON.stringify(char), 2, CELL_H - 2);
	}
</script>

<div class="page">
	<h1>Glyph debug</h1>

	<div class="preview-wrap">
		<canvas use:drawPreview={null}></canvas>
	</div>

	<p class="hint">
		{chars.length} glyphs loaded. Cap line / baseline guides shown per cell.
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
	h1 { margin: 0 0 1rem; font-size: 1.1rem; }
	.preview-wrap {
		margin-bottom: 2rem;
		background: #111;
		display: inline-block;
		border: 1px solid #1a1a2e;
	}
	.preview-wrap canvas { display: block; }
	.hint { margin: 0 0 1rem; color: #556; font-size: 0.8rem; }
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
