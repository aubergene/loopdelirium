<script lang="ts">
	// ── ShaderCanvas ───────────────────────────────────────────────────────────
	// A generic "Shadertoy-style" fullscreen-quad renderer.
	//
	// You provide two GLSL strings (vert + frag); this component handles every
	// piece of boilerplate: context creation, compile, link, buffer upload,
	// the render loop, mouse tracking, and HiDPI resize.
	//
	// Your fragment shader gets three standard uniforms for free:
	//   uniform float uTime;        seconds since mount
	//   uniform vec2  uResolution;  canvas size in physical pixels
	//   uniform vec2  uMouse;       smoothed mouse [0,1] × [0,1]
	//
	// Your vertex shader must declare:
	//   attribute vec2 aPosition;   clip-space position fed by the quad
	// ──────────────────────────────────────────────────────────────────────────

	import { onMount } from 'svelte';

	let { vert, frag }: { vert: string; frag: string } = $props();

	let canvas: HTMLCanvasElement;

	onMount(() => {
		// ── Context ───────────────────────────────────────────────────────────
		// 'webgl' = WebGL 1, the OpenGL ES 2.0 subset. Runs everywhere.
		// Every subsequent call goes through this `gl` handle.
		const gl = canvas.getContext('webgl');
		if (!gl) {
			console.error('WebGL not supported');
			return;
		}

		// ── Compile a shader ──────────────────────────────────────────────────
		// Sends GLSL source to the GPU driver to compile into native GPU code.
		// If there's a syntax error, getShaderInfoLog() returns the message.
		function compile(type: number, src: string): WebGLShader {
			const s = gl.createShader(type)!;
			gl.shaderSource(s, src);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
				console.error('Shader compile error:', gl.getShaderInfoLog(s));
			return s;
		}

		const vs = compile(gl.VERTEX_SHADER, vert);
		const fs = compile(gl.FRAGMENT_SHADER, frag);

		// ── Link the program ──────────────────────────────────────────────────
		// A "program" pairs a vertex + fragment shader. The linker checks that
		// `varying` outputs from the vertex shader match the fragment shader inputs.
		const prog = gl.createProgram()!;
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
			console.error('Program link error:', gl.getProgramInfoLog(prog));
		gl.useProgram(prog);

		// ── Fullscreen quad ───────────────────────────────────────────────────
		// Two triangles (6 vertices) in clip-space [-1,1] that tile the viewport.
		// The vertex shader is trivial — all interesting work is in the fragment.
		//   tri 1: ◣   tri 2: ◥   → together: □
		const quadVerts = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

		// Tell the GPU how to parse the buffer for `aPosition`: 2 floats per vertex.
		const aPos = gl.getAttribLocation(prog, 'aPosition');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		// ── Standard uniforms ─────────────────────────────────────────────────
		// getUniformLocation returns an opaque handle we pass to uniform*() each frame.
		// Returns null if the shader doesn't use the uniform — that's fine, we just
		// skip the upload (WebGL ignores uniform1f(null, ...)).
		const uTime = gl.getUniformLocation(prog, 'uTime');
		const uRes = gl.getUniformLocation(prog, 'uResolution');
		const uMouse = gl.getUniformLocation(prog, 'uMouse');

		// ── Mouse tracking ────────────────────────────────────────────────────
		// targetMouse = where the cursor actually is (normalized 0→1).
		// mouse = smoothed version we send to the shader each frame.
		// Exponential lerp (alpha=0.06) gives a lazy, organic follow feel.
		let targetMouse = [0.5, 0.5];
		let mouse = [0.5, 0.5];

		function onMouseMove(e: MouseEvent) {
			const r = canvas.getBoundingClientRect();
			targetMouse = [
				(e.clientX - r.left) / r.width,
				1 - (e.clientY - r.top) / r.height, // flip Y: WebGL Y=0 is bottom
			];
		}
		canvas.addEventListener('mousemove', onMouseMove);

		// ── HiDPI resize ──────────────────────────────────────────────────────
		// canvas.width/height = pixel buffer size (must match gl.viewport).
		// canvas.clientWidth/Height = CSS layout size.
		// Multiplying by devicePixelRatio keeps the buffer sharp on Retina screens.
		function resize() {
			const w = Math.floor(canvas.clientWidth * devicePixelRatio);
			const h = Math.floor(canvas.clientHeight * devicePixelRatio);
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
				gl.viewport(0, 0, w, h);
			}
		}
		const ro = new ResizeObserver(resize);
		ro.observe(canvas);
		resize();

		// ── Render loop ───────────────────────────────────────────────────────
		// requestAnimationFrame fires before the browser paints (~60fps).
		// We upload the three uniforms then issue a single draw call that runs
		// the fragment shader once per pixel.
		const startTime = performance.now();
		let animId: number;

		function render(now: number) {
			animId = requestAnimationFrame(render);

			const a = 0.06;
			mouse[0] += (targetMouse[0] - mouse[0]) * a;
			mouse[1] += (targetMouse[1] - mouse[1]) * a;

			gl.uniform1f(uTime, (now - startTime) / 1000);
			gl.uniform2f(uRes, canvas.width, canvas.height);
			gl.uniform2f(uMouse, mouse[0], mouse[1]);

			// 6 vertices = 2 triangles = fullscreen quad → fragment shader runs for every pixel
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}

		animId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(animId);
			canvas.removeEventListener('mousemove', onMouseMove);
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
		cursor: crosshair;
	}
</style>
