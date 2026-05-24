import { normalize, sub, cross } from './math3d'
import type { Vec3 } from './math3d'

export type Curve    = (t: number) => Vec3
export type NormalFn = (p: Vec3) => Vec3

// The local coordinate frame at a point on a surface curve.
// T = direction of travel, N = outward surface normal, B = cross(N,T) = "up" for text.
export interface SurfaceFrame {
	P: Vec3
	T: Vec3
	N: Vec3
	B: Vec3
}

const DT = 1e-4

export function frameAt(curve: Curve, t: number, normalFn: NormalFn): SurfaceFrame {
	// Forward-difference tangent, flipped near t=1 to stay in range
	const t2 = t + DT < 1 ? t + DT : t - DT
	const P  = curve(t)
	const P2 = curve(t2)
	const T  = normalize(t + DT < 1 ? sub(P2, P) : sub(P, P2))
	const N  = normalFn(P)
	const B  = normalize(cross(N, T))
	return { P, T, N, B }
}

// Sphere spiral: winds `turns` times from south pole (t=0) to north pole (t=1).
export function sphereSpiral(turns: number, radius = 1): Curve {
	return (t: number): Vec3 => {
		const phi   = t * Math.PI - Math.PI / 2  // latitude -π/2 … +π/2
		const theta = t * Math.PI * 2 * turns     // longitude winds n times
		return [
			radius * Math.cos(phi) * Math.cos(theta),
			radius * Math.sin(phi),
			radius * Math.cos(phi) * Math.sin(theta)
		]
	}
}

// Outward unit normal for a sphere centred at the origin.
export const sphereNormal: NormalFn = (P) => normalize(P)

// Torus helix: winds `torusTurns` times around the major circle and
// `tubeTurns` times around the tube cross-section.
// Varying the ratio between the two creates different twist / braid effects.
export function torusSpiral(torusTurns: number, tubeTurns: number, R = 1.0, r = 0.38): Curve {
	return (t: number): Vec3 => {
		const theta = t * Math.PI * 2 * torusTurns
		const phi   = t * Math.PI * 2 * tubeTurns
		return [
			(R + r * Math.cos(phi)) * Math.cos(theta),
			r * Math.sin(phi),
			(R + r * Math.cos(phi)) * Math.sin(theta)
		]
	}
}

// Outward unit normal for a torus with major radius R centred at the origin.
// Projects P onto the major circle to find the tube centre, then points outward.
export function torusNormal(R: number): NormalFn {
	return (P: Vec3): Vec3 => {
		const xzLen = Math.sqrt(P[0] * P[0] + P[2] * P[2])
		if (xzLen < 1e-10) return [0, 1, 0]
		return normalize([P[0] - (P[0] / xzLen) * R, P[1], P[2] - (P[2] / xzLen) * R])
	}
}
