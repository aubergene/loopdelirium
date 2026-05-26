<script lang="ts">
	import { onMount } from 'svelte';
	import { frameAt } from './curves';
	import type { Curve, NormalFn, SurfaceFrame } from './curves';
	import { getGlyph, glyphTo3D } from './glyphs';
	import type { Font, Glyph } from './glyphs';
	import { applyView, applyViewZ } from './math3d';
	import type { Vec3 } from './math3d';

	let {
		text,
		font,
		curve,
		normalFn,
		charScale = 0.12,
		repeats = 2,
		scrollSpeed = 0.05,
		rotationSpeed = 0,
		viewYaw = 0.4,
		viewPitch = 0.3,
		color = '#c8e8ff',
	}: {
		text: string;
		font: Font;
		curve: Curve;
		normalFn: NormalFn;
		charScale?: number;
		repeats?: number;
		scrollSpeed?: number;
		rotationSpeed?: number;
		viewYaw?: number;
		viewPitch?: number;
		color?: string;
	} = $props();

	let canvas: HTMLCanvasElement;

	type Placement = { glyph: Glyph; baseT: number };
	type WorkEntry = { glyph: Glyph; frame: SurfaceFrame; facingZ: number; depth: number };

	// Plain let — only read from the rAF closure, not the template.
	let placements: Placement[] = [];
	// Stable work array reused each frame to avoid per-frame allocation.
	let work: WorkEntry[] = [];

	$effect(() => {
		const total = repeats * text.length;
		const tPerChar = 1 / total;
		placements = Array.from({ length: total }, (_, i) => ({
			glyph: getGlyph(font, text[i % text.length]),
			baseT: i * tPerChar,
		}));
		work = Array.from({ length: total }, () => ({
			glyph: [],
			frame: { P: [0,0,0], T: [0,0,0], N: [0,0,0], B: [0,0,0] },
			facingZ: 0,
			depth: 0,
		}));
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
		let tOffset = 0;
		let yawAngle = 0;
		let last = performance.now();
		let animId: number;

		function draw() {
			const focal = canvas.height * 0.85;
			const hw = canvas.width / 2;
			const hh = canvas.height / 2;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.strokeStyle = color;
			ctx.lineWidth = devicePixelRatio * 1.2;

			// Hoist trig: 4 calls total instead of 4 per vertex.
			const cy = Math.cos(viewYaw + yawAngle), sy = Math.sin(viewYaw + yawAngle);
			const cx = Math.cos(viewPitch),           sx = Math.sin(viewPitch);

			const project = (p: Vec3): [number, number] => {
				const rp = applyView(p, cy, sy, cx, sx);
				const w  = camZ + rp[2];
				return [(rp[0] / w) * focal + hw, (-rp[1] / w) * focal + hh];
			};

			// Populate stable work array in-place.
			const n = placements.length;
			for (let i = 0; i < n; i++) {
				const { glyph, baseT } = placements[i];
				const t     = ((baseT + tOffset) % 1 + 1) % 1;
				const frame = frameAt(curve, t, normalFn);
				work[i].glyph   = glyph;
				work[i].frame   = frame;
				work[i].facingZ = applyViewZ(frame.N, cy, sy, cx, sx);
				work[i].depth   = applyViewZ(frame.P, cy, sy, cx, sx);
			}
			work.length = n;
			work.sort((a, b) => a.depth - b.depth);

			for (let i = 0; i < n; i++) {
				const { glyph, frame, facingZ } = work[i];
				const alpha = facingZ < 0
					? Math.min(1, -facingZ * 1.5)
					: Math.min(0.35, facingZ * 0.5);
				if (alpha < 0.01) continue;
				ctx.globalAlpha = alpha;

				for (const polyline of glyph) {
					if (polyline.length < 2) continue;
					ctx.beginPath();
					for (let j = 0; j < polyline.length; j++) {
						const [u, v] = polyline[j];
						const [sx2, sy2] = project(glyphTo3D(u, v, frame, charScale));
						if (j === 0) ctx.moveTo(sx2, sy2);
						else         ctx.lineTo(sx2, sy2);
					}
					ctx.stroke();
				}
			}
			ctx.globalAlpha = 1;
		}

		function loop(now: number) {
			animId = requestAnimationFrame(loop);
			const dt = (now - last) / 1000;
			last = now;
			tOffset  = (tOffset + scrollSpeed * dt) % 1;
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
