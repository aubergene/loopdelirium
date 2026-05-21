// ── Vertex Shader ─────────────────────────────────────────────────────────
// `attribute` = per-vertex data coming from our JavaScript array
// `varying`   = value passed to the fragment shader (interpolated across triangle)
// `gl_Position` = built-in output: the final clip-space position (x,y,z,w)
//
// Clip space: both x and y range from -1 to +1 across the screen.
// (0,0) is the center. w=1.0 means no perspective divide — flat screen quad.

attribute vec2 aPosition;
varying   vec2 vUv;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vUv = aPosition * 0.5 + 0.5;  /* [-1,1] → [0,1]  */
}
