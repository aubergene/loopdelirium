<script lang="ts">
	import { onMount } from 'svelte';
	import { frameAt } from './curves';
	import type { Curve, NormalFn } from './curves';
	import { getGlyph, glyphTo3D } from './glyphs';
	import type { Font } from './glyphs';
	import { rotateY, rotateX } from './math3d';
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

	// Evenly distribute exactly (repeats * text.length) chars around t=[0,1].
	let placements = $state<{ char: string; baseT: number }[]>([]);
	$effect(() => {
		const total = repeats * text.length;
		const tPerChar = 1 / total;
		const result: { char: string; baseT: number }[] = [];
		for (let i = 0; i < total; i++)
			result.push({ char: text[i % text.length], baseT: i * tPerChar });
		placements = result;
	});

	onMount(() => {
		const ctx = canvas.getContext('2d')!;

		const resize = () => {
			canvas.width = Math.floor(canvas.clientWidth * devicePixelRatio);
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

			const totalYaw = viewYaw + yawAngle;
			const project = (p: Vec3): [number, number] => {
				const rp = rotateX(rotateY(p, totalYaw), viewPitch);
				const w = camZ + rp[2];
				return [(rp[0] / w) * focal + hw, (-rp[1] / w) * focal + hh];
			};

			const entries = placements.map(({ char, baseT }) => {
				const t = ((baseT + tOffset) % 1 + 1) % 1;
				const frame = frameAt(curve, t, normalFn);
				const rN = rotateX(rotateY(frame.N, totalYaw), viewPitch);
				const rP = rotateX(rotateY(frame.P, totalYaw), viewPitch);
				return { char, frame, rN, depth: rP[2] };
			});
			entries.sort((a, b) => a.depth - b.depth);

			for (const { char, frame, rN } of entries) {
				const facing = rN[2];
				const alpha =
					facing < 0 ? Math.min(1, -facing * 1.5) : Math.min(0.35, facing * 0.5);
				if (alpha < 0.01) continue;
				ctx.globalAlpha = alpha;

				for (const polyline of getGlyph(font, char)) {
					if (polyline.length < 2) continue;
					ctx.beginPath();
					for (let j = 0; j < polyline.length; j++) {
						const [u, v] = polyline[j];
						const [sx, sy] = project(glyphTo3D(u, v, frame, charScale));
						if (j === 0) ctx.moveTo(sx, sy);
						else ctx.lineTo(sx, sy);
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
			tOffset = (tOffset + scrollSpeed * dt) % 1;
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
