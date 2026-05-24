import { add, scale } from './math3d'
import type { Vec3 } from './math3d'
import type { SurfaceFrame } from './curves'

export type Polyline = [number, number][]
export type Glyph    = Polyline[]
export type Font     = Record<string, unknown>

// Typode coordinate system: x ∈ [0, 2], y ∈ [0, 3] for most glyphs (y=0 = cap, y=3 = baseline).
// Descenders (g, j, p, q, y) extend to y=4.
export const CHAR_W       = 2    // glyph cell width
export const CHAR_H       = 3    // cap height used for vertical centring
export const CHAR_ADVANCE = 2.5  // advance width including inter-character gap

// Look up a character in the font, handling typode's symbol indirection table.
export function getGlyph(font: Font, char: string): Glyph {
	if (char in font) return font[char] as Glyph
	const symbols = font['symbols'] as [string[], string[]] | undefined
	if (symbols) {
		const idx = symbols[0].indexOf(char)
		if (idx >= 0 && symbols[1][idx] in font) return font[symbols[1][idx]] as Glyph
	}
	return []
}

// Map a glyph 2D point (u, v) to a 3D world position on the surface.
// Characters are centred vertically on the curve; u=0 is the left edge of the cell.
export function glyphTo3D(u: number, v: number, frame: SurfaceFrame, glyphScale: number): Vec3 {
	return add(
		add(frame.P, scale(frame.T, u * glyphScale)),
		scale(frame.B, (v - CHAR_H / 2) * glyphScale)
	)
}
