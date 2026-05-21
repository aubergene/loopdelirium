<script lang="ts">
	import { onMount } from 'svelte';

	let { text, length }: { text: string; length: number } = $props();

	const FONT_PX = 80;
	const CORNER_R = FONT_PX * 0.95;
	const BACK_Z = 2 * CORNER_R;
	const PERSP = BACK_Z * 1.5;
	const CORNER_PERIM = Math.PI * CORNER_R;

	const MAX_GYRO_SPEED = 400; // px/s at full tilt
	const GYRO_DEAD_ZONE = 10; // degrees
	const DEFAULT_SPEED = 60; // px/s when no gyro

	// Populated on mount after BadeenDisplay loads; fallback keeps things rendering immediately
	let widthOf = $state((_c: string) => FONT_PX * 0.6);

	// Front track width = sum of widths of the first `length` chars
	const frontText = $derived(
		(text + ' '.repeat(Math.max(0, length - text.length))).slice(0, length),
	);
	const W = $derived(frontText.split('').reduce((s, c) => s + widthOf(c), 0));
	const BELT_TOTAL = $derived(2 * W + 2 * CORNER_PERIM);

	// Fill belt with text chars then spaces until cumulative width covers the full loop
	const beltChars = $derived.by(() => {
		const chars: string[] = [];
		let total = 0;
		while (total < BELT_TOTAL && chars.length < 500) {
			const c = chars.length < text.length ? text[chars.length] : ' ';
			chars.push(c);
			total += widthOf(c);
		}
		return chars;
	});

	const N = $derived(beltChars.length);

	// cumPos[i] = left-edge pixel position of char i along the belt
	const cumPos = $derived.by(() => {
		const arr = [0];
		for (const c of beltChars) arr.push(arr[arr.length - 1] + widthOf(c));
		return arr;
	});

	let pixelOffset = $state(0); // continuous px position along belt
	let rotateXDeg = $state(0);
	let debugGyro = $state({ gamma: 0, beta: 0, speed: 0, supported: false });

	function beltPosToTransform(rawPos: number, w: number): string {
		const p = ((rawPos % BELT_TOTAL) + BELT_TOTAL) % BELT_TOTAL;

		let x: number, z: number, rotY: number;

		if (p <= W) {
			// Front: leading edge = left edge of span
			x = W - p;
			z = 0;
			rotY = 0;
		} else if (p <= W + CORNER_PERIM) {
			// Left corner: interpolate x correction from 0 (front exit) → -w (back entry)
			const t = (p - W) / CORNER_PERIM;
			const angle = t * Math.PI;
			x = -CORNER_R * Math.sin(angle) - w * t;
			z = -CORNER_R * (1 - Math.cos(angle));
			rotY = -t * 180;
		} else if (p <= 2 * W + CORNER_PERIM) {
			// Back: leading edge = right edge of span, so translateX places left edge at ref - w
			x = p - W - CORNER_PERIM - w;
			z = -BACK_Z;
			rotY = -180;
		} else {
			// Right corner: interpolate x correction from -w (back exit) → 0 (front entry)
			const t = (p - 2 * W - CORNER_PERIM) / CORNER_PERIM;
			const angle = t * Math.PI;
			x = W + CORNER_R * Math.sin(angle) - w * (1 - t);
			z = -BACK_Z + CORNER_R * (1 - Math.cos(angle));
			rotY = -180 - t * 180;
		}

		return `translateX(${x.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg)`;
	}

	function handleKeydown(event: KeyboardEvent) {
		const step = W / length;
		if (event.key === 'ArrowRight') pixelOffset += step;
		else if (event.key === 'ArrowLeft') pixelOffset -= step;
	}

	onMount(() => {
		let gyroSpeed = 0;
		let gyroActive = false;
		let lastTime: number | null = null;

		function handleOrientation(e: DeviceOrientationEvent) {
			const gamma = e.gamma ?? 0;
			const beta = e.beta ?? 60;
			gyroActive = true;
			rotateXDeg = Math.max(-30, Math.min(30, (beta - 60) * 0.5));
			const abs = Math.abs(gamma);
			gyroSpeed =
				abs < GYRO_DEAD_ZONE
					? 0
					: Math.sign(gamma) * ((abs - GYRO_DEAD_ZONE) / (90 - GYRO_DEAD_ZONE)) * MAX_GYRO_SPEED;
			debugGyro = { gamma, beta, speed: gyroSpeed, supported: true };
		}

		function tick(time: number) {
			if (lastTime !== null) {
				const dt = (time - lastTime) / 1000;
				const speed = gyroActive ? gyroSpeed : DEFAULT_SPEED;
				if (speed !== 0) {
					pixelOffset = (((pixelOffset + speed * dt) % BELT_TOTAL) + BELT_TOTAL) % BELT_TOTAL;
				}
			}
			lastTime = time;
			animId = requestAnimationFrame(tick);
		}

		let animId = requestAnimationFrame(tick);

		function addOrientationListener() {
			window.addEventListener('deviceorientation', handleOrientation);
		}

		if (
			typeof DeviceOrientationEvent !== 'undefined' &&
			typeof (DeviceOrientationEvent as any).requestPermission === 'function'
		) {
			window.addEventListener(
				'touchstart',
				async function onFirstTouch() {
					try {
						const perm = await (DeviceOrientationEvent as any).requestPermission();
						if (perm === 'granted') addOrientationListener();
					} catch {}
				},
				{ once: true },
			);
		} else {
			addOrientationListener();
		}

		document.fonts.load(`${FONT_PX}px BadeenDisplay`).then(() => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d')!;
			ctx.font = `${FONT_PX}px BadeenDisplay`;
			const map: Record<string, number> = {};
			for (const c of new Set([...text, ' '])) {
				map[c] = ctx.measureText(c).width;
			}
			widthOf = (c) => map[c] ?? map[' '] ?? FONT_PX * 0.6;
		});

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('deviceorientation', handleOrientation);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="belt-outer" style="perspective: {PERSP}px;">
	<div
		class="belt-inner"
		style="width: {W}px; height: {FONT_PX *
			1.2}px; font-size: {FONT_PX}px; transform: rotateX({rotateXDeg}deg);"
	>
		{#each beltChars as char, i}
			<span
				class="char"
				style="width: {widthOf(char)}px; height: {FONT_PX * 1.2}px; line-height: {FONT_PX *
					1.2}px; transform: {beltPosToTransform(W - cumPos[i] + pixelOffset, widthOf(char))};">{char}</span
			>
		{/each}
	</div>
</div>

<!-- <pre class="gyro-debug">gyro: {debugGyro.supported
		? `γ=${debugGyro.gamma.toFixed(1)}° β=${debugGyro.beta.toFixed(1)}° spd=${debugGyro.speed.toFixed(0)}px/s`
		: 'no data yet'} | px=${pixelOffset.toFixed(1)}</pre> -->

<style>
	@font-face {
		font-family: 'BadeenDisplay';
		src: url('/fonts/BadeenDisplay-Regular.woff2') format('woff2');
		font-display: block;
	}

	@font-face {
		font-family: 'GoogleSansFlex';
		src: url('/fonts/GoogleSansFlex_72pt-ExtraBold.woff2') format('woff2');
		font-display: block;
	}

	.gyro-debug {
		font-size: 12px;
		opacity: 0.6;
		margin-top: 8px;
	}

	.belt-outer {
		display: inline-block;
	}

	.belt-inner {
		position: relative;
		transform-style: preserve-3d;
		font-family: 'BadeenDisplay', monospace;
		/* font-family: 'GoogleSansFlex', monospace; */
		overflow: visible;
		transition: transform 0.1s linear;
	}

	.char {
		position: absolute;
		top: 0;
		left: 0;
		text-align: center;
		opacity: 0.7;
		transform-origin: center;
	}
</style>
