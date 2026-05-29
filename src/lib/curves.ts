import { normalize, sub, cross } from './math3d';
import type { Vec3 } from './math3d';

export type Curve = (t: number) => Vec3;
export type NormalFn = (p: Vec3) => Vec3;

// The local coordinate frame at a point on a surface curve.
// T = direction of travel, N = outward surface normal, B = cross(N,T) = "up" for text.
export interface SurfaceFrame {
	P: Vec3;
	T: Vec3;
	N: Vec3;
	B: Vec3;
}

const DT = 1e-4;

export function frameAt(curve: Curve, t: number, normalFn: NormalFn): SurfaceFrame {
	// Forward-difference tangent, flipped near t=1 to stay in range
	const t2 = t + DT < 1 ? t + DT : t - DT;
	const P = curve(t);
	const P2 = curve(t2);
	const T = normalize(t + DT < 1 ? sub(P2, P) : sub(P, P2));
	const N = normalFn(P);
	const B = normalize(cross(N, T));
	return { P, T, N, B };
}

// Precomputes arc-length values at `samples` evenly-spaced t values.
// Returns [table, totalLength, maxDist] where maxDist is the max distance from origin.
export function buildArcTable(curve: Curve, samples = 2000): [Float64Array, number, number] {
	const table = new Float64Array(samples + 1);
	let len = 0;
	let maxDist = 0;
	let prev = curve(0);
	for (let i = 1; i <= samples; i++) {
		const p = curve(i / samples);
		const dx = p[0] - prev[0],
			dy = p[1] - prev[1],
			dz = p[2] - prev[2];
		len += Math.sqrt(dx * dx + dy * dy + dz * dz);
		table[i] = len;
		const d = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
		if (d > maxDist) maxDist = d;
		prev = p;
	}
	return [table, len, maxDist];
}

// Converts an arc-length position s (wrapping modulo totalLength) to a t value.
export function arcToT(table: Float64Array, s: number, totalLength: number): number {
	const samples = table.length - 1;
	const target = ((s % totalLength) + totalLength) % totalLength;
	let lo = 0,
		hi = samples;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (table[mid] <= target) lo = mid;
		else hi = mid;
	}
	const s0 = table[lo],
		s1 = table[hi];
	return (lo + (target - s0) / (s1 - s0)) / samples;
}

// Sphere spiral: winds `turns` times from south pole (t=0) to north pole (t=1).
export function sphereSpiral(turns: number, radius = 1): Curve {
	return (t: number): Vec3 => {
		const phi = t * Math.PI - Math.PI / 2; // latitude -π/2 … +π/2
		const theta = t * Math.PI * 2 * turns; // longitude winds n times
		return [
			radius * Math.cos(phi) * Math.cos(theta),
			radius * Math.sin(phi),
			radius * Math.cos(phi) * Math.sin(theta),
		];
	};
}

// Outward unit normal for a sphere centred at the origin.
export const sphereNormal: NormalFn = (P) => normalize(P);

// Torus helix: winds `torusTurns` times around the major circle and
// `tubeTurns` times around the tube cross-section.
// Varying the ratio between the two creates different twist / braid effects.
export function torusSpiral(torusTurns: number, tubeTurns: number, R = 1.0, r = 0.38): Curve {
	return (t: number): Vec3 => {
		const theta = t * Math.PI * 2 * torusTurns;
		const phi = t * Math.PI * 2 * tubeTurns;
		const cosPhi = Math.cos(phi);
		return [
			(R + r * cosPhi) * Math.cos(theta),
			r * Math.sin(phi),
			(R + r * cosPhi) * Math.sin(theta),
		];
	};
}

// Outward unit normal for a torus with major radius R centred at the origin.
// Projects P onto the major circle to find the tube centre, then points outward.
export function torusNormal(R: number): NormalFn {
	return (P: Vec3): Vec3 => {
		const xzLen = Math.sqrt(P[0] * P[0] + P[2] * P[2]);
		if (xzLen < 1e-10) return [0, 1, 0];
		const invXzLen = R / xzLen;
		return normalize([P[0] - P[0] * invXzLen, P[1], P[2] - P[2] * invXzLen]);
	};
}
