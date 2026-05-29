<script lang="ts">
	import { onMount } from 'svelte';
	import { frameAt, buildArcTable, arcToT } from './curves';
	import type { Curve, NormalFn } from './curves';
	import type { Font, GlyphEntry } from './glyphs';
	import { CHAR_H } from './glyphs';
	import { add, scale, applyView, applyViewZ } from './math3d';
	import type { Vec3 } from './math3d';

	let {
		text,
		font,
		curve,
		normalFn,
		repeats = 6,
		zoom = 1,
		scrollSpeed = 0.05,
		rotationSpeed = 0,
		viewYaw = 0.4,
		viewPitch = 0.3,
		color = '#c8e8ff',
		letterSpacing = 0,
	}: {
		text: string;
		font: Font;
		curve: Curve;
		normalFn: NormalFn;
		repeats?: number;
		zoom?: number;
		scrollSpeed?: number;
		rotationSpeed?: number;
		viewYaw?: number;
		viewPitch?: number;
		color?: string;
		letterSpacing?: number;
	} = $props();

	let canvas: HTMLCanvasElement;

	// baseS = arc-length position of the character's left edge
	type Placement = { glyph: GlyphEntry; baseS: number };
	type WorkEntry = { glyph: GlyphEntry; s0: number; facingZ: number; depth: number };

	let placements: Placement[] = [];
	let work: WorkEntry[] = [];

	// Shared arc-length table, updated whenever curve changes
	let arcTable: Float64Array = new Float64Array(2);
	let totalArcLength = 1;
	// One arc-length unit per glyph advance unit — derived from repeats so text fills the loop.
	let arcPerUnit = 0.1;

	$effect(() => {
		const [table, len] = buildArcTable(curve);
		arcTable = table;
		totalArcLength = len;

		const chars = [...text];
		const naturalTotal = chars.reduce(
			(sum, c) => sum + (font.glyphs[c]?.advance ?? 1),
			0
		);
		const stride = naturalTotal + chars.length * letterSpacing;
		arcPerUnit = len / (repeats * stride);

		const result: Placement[] = [];
		for (let j = 0; j < repeats; j++) {
			let cumAdvance = 0;
			for (const char of chars) {
				const glyph = font.glyphs[char] ?? font.glyphs[' '];
				if (!glyph) { cumAdvance += 1 + letterSpacing; continue; }
				result.push({ glyph, baseS: (j * stride + cumAdvance) * arcPerUnit });
				cumAdvance += glyph.advance + letterSpacing;
			}
		}

		placements = result;
		work = result.map(() => ({ glyph: font.glyphs[' '] ?? { advance: 1, cmds: [] }, s0: 0, facingZ: 0, depth: 0 }));
	});

	onMount(() => {
		const ctx = canvas.getContext('2d')!;

		const resize = () => {
			canvas.width  = Math.floor(canvas.clientWidth  * devicePixelRatio);
			canvas.height = Math.floor(canvas.clientHeight * devicePixelRatio);
		};
		const ro = new ResizeObserver(resize);
		ro.observe(canvas);
		resize();

		const camZ = 3.0;
		let sOffset = 0;
		let yawAngle = 0;
		let last = performance.now();
		let animId: number;

		function draw() {
			const focal = canvas.height * 0.85;
			const hw = canvas.width / 2;
			const hh = canvas.height / 2;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = color;

			const cy = Math.cos(viewYaw + yawAngle), sy = Math.sin(viewYaw + yawAngle);
			const cx = Math.cos(viewPitch),           sx = Math.sin(viewPitch);

			const project = (p: Vec3): [number, number] => {
				const rp = applyView(p, cy, sy, cx, sx);
				const w  = camZ + rp[2];
				return [(rp[0] / w) * focal + hw, (-rp[1] / w) * focal + hh];
			};

			const len = totalArcLength;
			const n = placements.length;
			for (let i = 0; i < n; i++) {
				const { glyph, baseS } = placements[i];
				const s0 = ((baseS + sOffset) % len + len) % len;
				// Use glyph centre for depth sort and facing
				const midS = (s0 + (glyph.advance / 2) * arcPerUnit) % len;
				const midFrame = frameAt(curve, arcToT(arcTable, midS, len), normalFn);
				work[i].glyph   = glyph;
				work[i].s0      = s0;
				work[i].facingZ = applyViewZ(midFrame.N, cy, sy, cx, sx);
				work[i].depth   = applyViewZ(midFrame.P, cy, sy, cx, sx);
			}
			work.length = n;
			work.sort((a, b) => a.depth - b.depth);

			for (let i = 0; i < n; i++) {
				const { glyph, s0, facingZ } = work[i];
				const alpha = facingZ < 0
					? Math.min(1, -facingZ * 1.5)
					: Math.min(0.35, facingZ * 0.5);
				if (alpha < 0.01) continue;
				ctx.globalAlpha = alpha;

				// Map each glyph vertex directly onto the torus surface.
				// u moves along the curve (arc-length space), v lifts off radially via B.
				// arcPerUnit is used for both — keeps rendering and placement in the same unit system.
				// zoom scales rendering only, allowing size adjustment independent of repeats.
				const renderUnit = arcPerUnit * zoom;
				const p3d = (u: number, v: number): Vec3 => {
					const s = (s0 + u * renderUnit) % len;
					const f = frameAt(curve, arcToT(arcTable, s, len), normalFn);
					return add(f.P, scale(f.B, (v - CHAR_H / 2) * renderUnit));
				};

				ctx.beginPath();
				let newContour = true;
				for (const cmd of glyph.cmds) {
					switch (cmd[0]) {
						case 'M': {
							if (!newContour) ctx.closePath();
							newContour = false;
							const [sx2, sy2] = project(p3d(cmd[1], cmd[2]));
							ctx.moveTo(sx2, sy2);
							break;
						}
						case 'L': {
							const [sx2, sy2] = project(p3d(cmd[1], cmd[2]));
							ctx.lineTo(sx2, sy2);
							break;
						}
						case 'Q': {
							const [cpx, cpy] = project(p3d(cmd[1], cmd[2]));
							const [ex,  ey]  = project(p3d(cmd[3], cmd[4]));
							ctx.quadraticCurveTo(cpx, cpy, ex, ey);
							break;
						}
						case 'C': {
							const [cp1x, cp1y] = project(p3d(cmd[1], cmd[2]));
							const [cp2x, cp2y] = project(p3d(cmd[3], cmd[4]));
							const [ex,   ey]   = project(p3d(cmd[5], cmd[6]));
							ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
							break;
						}
						case 'Z':
							ctx.closePath();
							newContour = true;
							break;
					}
				}
				ctx.closePath();
				ctx.fill();
			}
			ctx.globalAlpha = 1;
		}

		function loop(now: number) {
			animId = requestAnimationFrame(loop);
			const dt = (now - last) / 1000;
			last = now;
			sOffset = ((sOffset + scrollSpeed * totalArcLength * dt) % totalArcLength + totalArcLength) % totalArcLength;
			yawAngle += rotationSpeed * dt;
			draw();
		}

		animId = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(animId);
			ro.disconnect();
		};
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #0a0a14;
	}
</style>
