// ── Fragment Shader ────────────────────────────────────────────────────────
// For every pixel the GPU calls main(). We:
//   1. Construct a ray from the camera through this pixel
//   2. March the ray through the scene using an SDF
//   3. Shade the hit point with lighting
//
// SDF = Signed Distance Function. f(p) returns the signed distance from
// point p to the nearest surface (positive = outside, negative = inside).
// The magical property: if f(p) = d, we can safely step d units along the
// ray without overshooting any surface. This is "sphere tracing" — no need
// to solve complex ray-surface intersection equations.

precision highp float;

/* Uniforms are values we send from JavaScript, the same for every pixel */
uniform float uTime;        /* seconds since start                       */
uniform vec2  uResolution;  /* canvas width × height in physical pixels  */
uniform vec2  uMouse;       /* mouse position, both components in [0, 1] */
uniform float uTwist;       /* base twist rate in radians/unit (default 1.8) */


// ── Domain warp: twist ─────────────────────────────────────────────────────
// A "domain warp" transforms the INPUT coordinate before evaluating an SDF.
// The SDF sees warped space and doesn't know the difference.
//
// Here we rotate the XZ plane by an angle that grows linearly with height Y.
// The further you are from Y=0, the more the space is rotated.
// Result: the torus spirals / twists as you move up or down.
//
// k = twist rate (radians of rotation per unit of Y).
vec3 twist(vec3 p, float k) {
  float c = cos(k * p.y), s = sin(k * p.y);
  /* GLSL mat2 is column-major: mat2(c,-s,s,c) has col0=(c,-s), col1=(s,c)
   * mat * (p.x, p.z) = (c*p.x + s*p.z,  -s*p.x + c*p.z)
   * Original p.y moves to the z slot so length(q.xz) is no longer
   * invariant under this rotation — that's what makes the twist visible. */
  return vec3(c*p.x + s*p.z,  -s*p.x + c*p.z,  p.y);
}


// ── SDF: Torus ───────────────────────────────────────────────────────────
// A torus is a donut. It lies flat in the XZ plane, centered at origin.
// r.x = major radius  — distance from center of donut to center of tube
// r.y = minor radius  — thickness of the tube
//
// How the math works:
//   Step 1. Collapse p onto the major circle:
//             qx = |p.xz| - r.x
//           qx is the signed distance from p to the ring of major radius.
//   Step 2. The tube surface lives where (qx, p.y) has magnitude r.y:
//             dist = |(qx, p.y)| - r.y
float sdTorus(vec3 p, vec2 r) {
  float qx = length(p.xz) - r.x;
  return length(vec2(qx, p.y)) - r.y;
}


// ── Scene SDF ──────────────────────────────────────────────────────────────
// This single function defines ALL geometry in the world.
// Return the distance from p to the nearest surface.
// Combine multiple shapes with min() (union), -min() (subtraction), etc.
float scene(vec3 p) {
  vec3  tp = twist(p, uTwist);
  return sdTorus(tp, vec2(1.1, 0.38));
}


// ── Surface normal (tetrahedron technique) ─────────────────────────────────
// The normal at a surface point p tells us which way the surface faces.
// We can't derive it analytically here (domain warp complicates things),
// so we estimate it numerically: the SDF gradient ≈ the normal.
//
// Naïve finite differences would take 6 samples (±x, ±y, ±z).
// The tetrahedron technique achieves the same accuracy with only 4 samples
// by choosing sample offsets that form the vertices of a tetrahedron.
// The math works out because the 4 weighted samples cancel out correctly.
vec3 calcNormal(vec3 p) {
  const float h = 0.001;
  const vec2  k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * scene(p + k.xyy * h) +
    k.yyx * scene(p + k.yyx * h) +
    k.yxy * scene(p + k.yxy * h) +
    k.xxx * scene(p + k.xxx * h)
  );
}


// ── Ray marcher (sphere tracer) ────────────────────────────────────────────
// Starting at ray origin ro, step along direction rd until we hit something.
// Returns the total distance traveled t (positive hit) or -1.0 (miss).
//
// Each iteration:
//   p = current position on the ray
//   d = scene(p) = distance to nearest surface
//   Since no surface is closer than d, we can safely advance by d.
//   This is the "sphere tracing" guarantee — it's what makes SDFs special.
//
// We stop when d < ε (hit) or t > maxDist (escaped the scene).
float march(vec3 ro, vec3 rd) {
  float t = 0.05;
  for (int i = 0; i < 120; i++) {
    float d = scene(ro + t * rd);
    if (d < 0.0005) return t;   /* close enough to surface → hit          */
    if (t > 20.0)   return -1.0; /* too far → miss                         */
    t += d;                       /* sphere-trace step                      */
  }
  return -1.0;
}


void main() {
  // ── Centered, aspect-corrected ray UV ─────────────────────────────────
  // gl_FragCoord is the pixel position in screen space (0,0 = bottom-left).
  // We subtract the half-resolution to center the origin at screen center.
  // Dividing by resolution.y preserves the aspect ratio: horizontal spans
  // more than [-0.5, 0.5] on a wide screen, vertical always ±0.5.
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // ── Camera: spherical-coordinate orbit ──────────────────────────────────
  // We place the camera on a sphere of radius camR, looking at the origin.
  // Mouse X rotates it left/right (azimuth θ), mouse Y tilts up/down (φ).
  //
  // Spherical → Cartesian:
  //   x = r · sin(φ) · cos(θ)
  //   y = r · cos(φ)          ← Y is "up" in our world
  //   z = r · sin(φ) · sin(θ)
  float theta = uMouse.x * 6.2832;        /* full 360° horizontal orbit   */
  float phi   = mix(0.4, 1.35, uMouse.y); /* elevation: avoid gimbal lock  */
  float camR  = 4.5;

  vec3 ro = camR * vec3(
    sin(phi) * cos(theta),
    cos(phi),
    sin(phi) * sin(theta)
  );

  /* Build camera basis: forward (toward origin), right, up.
   * These three orthonormal vectors define the camera's local frame.   */
  vec3 forward = normalize(-ro);
  vec3 right   = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up      = cross(right, forward);

  /* Ray direction: project UV onto the camera image plane.
   * focal (1.8) controls field of view: larger = narrower, more telephoto. */
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.8 * forward);

  // ── March! ────────────────────────────────────────────────────────────
  float t   = march(ro, rd);
  vec3  col = vec3(0.0);

  if (t > 0.0) {
    vec3 pos = ro + t * rd;
    vec3 n   = calcNormal(pos);
    vec3 v   = -rd;               /* view direction (pointing at camera)   */

    // ── Blinn-Phong lighting ─────────────────────────────────────────────
    // Two light sources, each contributing diffuse and specular terms.
    //
    // Diffuse (matte): intensity = max(0, n·l)
    //   Surface is bright when facing the light (n·l=1), dark when edge-on.
    //
    // Specular (shiny): uses the halfway vector h = normalize(l + v)
    //   Bright when h≈n, i.e., when the light bounces mirror-like toward us.
    //   Exponent (48) controls sharpness: higher = tighter highlight.
    vec3  l1   = normalize(vec3( 2.0,  3.0,  1.5));
    vec3  l2   = normalize(vec3(-1.5, -0.5, -2.0));

    float d1   = max(0.0, dot(n, l1));
    float d2   = max(0.0, dot(n, l2)) * 0.35;

    vec3  h1   = normalize(l1 + v);
    float spec = pow(max(0.0, dot(n, h1)), 48.0);

    // ── Fresnel rim ───────────────────────────────────────────────────────
    // At grazing angles (n·v → 0), surfaces become more reflective.
    // Schlick approximation: F = (1 - n·v)^5. We use exponent 3 for a
    // more prominent artistic rim glow — physically looser but prettier.
    float fresnel = pow(1.0 - abs(dot(n, v)), 3.0);

    vec3 baseCol = vec3(0.05, 0.5,  0.65);   /* teal base                  */
    vec3 rimCol  = vec3(0.2,  0.35, 1.0);    /* blue rim glow              */

    col  = baseCol * (d1 + d2);
    col += vec3(0.9, 0.95, 1.0) * spec * 0.6;
    col += rimCol * fresnel * 0.55;
    col += baseCol * 0.04;  /* ambient floor                               */
  }

  // ── Gamma correction ─────────────────────────────────────────────────────
  // All our lighting math is in linear light space.
  // Monitors expect sRGB (gamma ≈ 2.2), so we must convert before output:
  //   sRGB = linear ^ (1/2.2)
  // Without this, dark regions look washed out and bright regions clip.
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));

  gl_FragColor = vec4(col, 1.0);
}
