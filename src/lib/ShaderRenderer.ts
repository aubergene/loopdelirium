// ── ShaderRenderer ─────────────────────────────────────────────────────────
// Pure TypeScript WebGL renderer — no Svelte dependency.
//
// Call createRenderer(canvas, vert, frag) once the canvas is in the DOM.
// It returns a { setUniforms, destroy } handle.  The Svelte component that
// owns the canvas is responsible for calling destroy() on unmount.
//
// Standard uniforms are provided automatically every frame:
//   uniform float uTime;       seconds since renderer was created
//   uniform vec2  uResolution; canvas pixel dimensions (HiDPI-aware)
//   uniform vec2  uMouse;      smoothed mouse position in [0,1]×[0,1]
//
// Any additional uniforms your shader declares can be uploaded via
// setUniforms(). Call it whenever the values change.
// ──────────────────────────────────────────────────────────────────────────

// The value types we support for extra uniforms.
// The length of the array determines which gl.uniform*f overload is used.
export type UniformValue =
	| number
	| [number, number]
	| [number, number, number]
	| [number, number, number, number];

export interface Renderer {
	setUniforms(uniforms: Record<string, UniformValue>): void;
	destroy(): void;
}

// ── Shader compilation ────────────────────────────────────────────────────
// Sends GLSL source to the GPU driver to compile into native GPU code.
// type is gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
	const s = gl.createShader(type)!;
	gl.shaderSource(s, src);
	gl.compileShader(s);
	if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
		console.error(`[ShaderRenderer] ${type === gl.VERTEX_SHADER ? 'vert' : 'frag'} compile FAILED:`, gl.getShaderInfoLog(s));
	return s;
}

export function createRenderer(
	canvas: HTMLCanvasElement,
	vert: string,
	frag: string
): Renderer {
	// ── Context ───────────────────────────────────────────────────────────
	// 'webgl' = WebGL 1, the OpenGL ES 2.0 subset. Runs everywhere.
	const gl = canvas.getContext('webgl');
	if (!gl) throw new Error('WebGL not supported');

	// ── Compile and link ──────────────────────────────────────────────────
	// A "program" pairs a vertex + fragment shader. The linker checks that
	// `varying` outputs from the vertex shader match the fragment shader inputs.
	const prog = gl.createProgram()!;
	gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vert));
	gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, frag));
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
		console.error('[ShaderRenderer] program link FAILED:', gl.getProgramInfoLog(prog));
	gl.useProgram(prog);

	// ── Fullscreen quad ───────────────────────────────────────────────────
	// Two triangles (6 vertices) in clip-space [-1,1] that tile the viewport.
	// The vertex shader is trivial — all interesting work is in the fragment.
	//   tri 1: bottom-left   tri 2: top-right   together: full rectangle
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
		gl.STATIC_DRAW
	);
	const aPos = gl.getAttribLocation(prog, 'aPosition');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

	// ── Standard uniform locations ────────────────────────────────────────
	// getUniformLocation returns an opaque handle for each named uniform.
	// Returns null if the shader doesn't declare/use it — uploads to null
	// are silently ignored by WebGL, so we don't need to guard against it.
	const uTime = gl.getUniformLocation(prog, 'uTime');
	const uRes = gl.getUniformLocation(prog, 'uResolution');
	const uMouse = gl.getUniformLocation(prog, 'uMouse');

	// ── Extra uniform locations ───────────────────────────────────────────
	// Looked up on first use and cached. This avoids calling getUniformLocation
	// (a driver round-trip) on every frame.
	const extraLocs = new Map<string, WebGLUniformLocation | null>();
	let currentUniforms: Record<string, UniformValue> = {};

	function uploadExtras() {
		for (const [name, value] of Object.entries(currentUniforms)) {
			if (!extraLocs.has(name))
				extraLocs.set(name, gl.getUniformLocation(prog, name));
			const loc = extraLocs.get(name)!;
			if (typeof value === 'number') gl.uniform1f(loc, value);
			else if (value.length === 2) gl.uniform2f(loc, value[0], value[1]);
			else if (value.length === 3) gl.uniform3f(loc, value[0], value[1], value[2]);
			else gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
		}
	}

	// ── Mouse tracking ────────────────────────────────────────────────────
	// targetMouse = where the cursor is (normalized 0-1).
	// mouse = smoothed version sent to the shader — exponential lerp at
	// alpha=0.06 per frame gives a lazy, organic follow feel.
	let targetMouse = [0.25, 0.5];
	let mouse = [0.25, 0.5];

	function onMouseMove(e: MouseEvent) {
		const r = canvas.getBoundingClientRect();
		targetMouse = [
			(e.clientX - r.left) / r.width,
			1 - (e.clientY - r.top) / r.height // flip Y: WebGL Y=0 is bottom
		];
	}
	canvas.addEventListener('mousemove', onMouseMove);

	// ── HiDPI resize ──────────────────────────────────────────────────────
	// canvas.width/height = pixel buffer size (must match gl.viewport).
	// Multiplying by devicePixelRatio keeps output sharp on Retina screens.
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
	// Each frame: smooth mouse, upload all uniforms, draw the fullscreen quad.
	// The fragment shader then runs once per pixel inside the quad.
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
		uploadExtras();

		// 6 vertices = 2 triangles = fullscreen quad
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	animId = requestAnimationFrame(render);

	return {
		// Called by the Svelte component via $effect whenever the uniforms prop
		// changes. Storing the reference is enough — uploadExtras() reads it
		// on the next frame.
		setUniforms(uniforms: Record<string, UniformValue>) {
			currentUniforms = uniforms;
		},

		destroy() {
			cancelAnimationFrame(animId);
			canvas.removeEventListener('mousemove', onMouseMove);
			ro.disconnect();
		}
	};
}
