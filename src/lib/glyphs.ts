import { add, scale } from './math3d'
import type { Vec3 } from './math3d'
import type { SurfaceFrame } from './curves'

export type Cmd =
	| ['M', number, number]
	| ['L', number, number]
	| ['Q', number, number, number, number]
	| ['C', number, number, number, number, number, number]
	| ['Z']

export interface GlyphEntry {
	advance: number
	cmds: Cmd[]
}

export interface Font {
	capHeight: number
	glyphs: Record<string, GlyphEntry>
}

// y=0 = cap line, y=CHAR_H = baseline (matches our coordinate system)
export const CHAR_H = 3

// Map a glyph 2D point (u, v) to a 3D world position on the surface.
// Characters are centred vertically on the curve; u=0 is the left glyph edge.
export function glyphTo3D(u: number, v: number, frame: SurfaceFrame, glyphScale: number): Vec3 {
	return add(
		add(frame.P, scale(frame.T, u * glyphScale)),
		scale(frame.B, (v - CHAR_H / 2) * glyphScale)
	)
}
