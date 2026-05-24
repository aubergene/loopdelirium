export type Vec3 = [number, number, number]

export const add       = (a: Vec3, b: Vec3): Vec3 => [a[0]+b[0], a[1]+b[1], a[2]+b[2]]
export const sub       = (a: Vec3, b: Vec3): Vec3 => [a[0]-b[0], a[1]-b[1], a[2]-b[2]]
export const scale     = (v: Vec3, s: number): Vec3 => [v[0]*s, v[1]*s, v[2]*s]
export const dot       = (a: Vec3, b: Vec3): number => a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
export const len       = (v: Vec3): number => Math.sqrt(dot(v, v))
export const normalize = (v: Vec3): Vec3 => { const l = len(v); return l > 1e-10 ? scale(v, 1/l) : [0, 1, 0] }
export const cross     = (a: Vec3, b: Vec3): Vec3 => [
	a[1]*b[2] - a[2]*b[1],
	a[2]*b[0] - a[0]*b[2],
	a[0]*b[1] - a[1]*b[0]
]
export const rotateY   = (v: Vec3, a: number): Vec3 => {
	const c = Math.cos(a), s = Math.sin(a)
	return [c*v[0] + s*v[2], v[1], -s*v[0] + c*v[2]]
}
export const rotateX   = (v: Vec3, a: number): Vec3 => {
	const c = Math.cos(a), s = Math.sin(a)
	return [v[0], c*v[1] - s*v[2], s*v[1] + c*v[2]]
}
