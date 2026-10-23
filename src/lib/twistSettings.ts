// Shared look settings for /debug/twist and /screensaver. Both pages read and
// write the same localStorage key, so a look designed in one shows up in the other.

export type TwistSettings = {
	text: string;
	color: string;
	torusTurns: number;
	tubeTurns: number;
	torusR: number;
	torusSmallR: number;
	repeats: number;
	zoom: number;
	letterSpacing: number;
	scrollSpeed: number;
	rotationSpeed: number;
	smoothing: number;
	viewYaw: number;
	viewPitch: number;
};

// Matches the home page logo.
export const DEFAULT_SETTINGS: TwistSettings = {
	text: 'loop [delirium]  ',
	color: '#c8e8ff',
	torusTurns: 1,
	tubeTurns: 3,
	torusR: 0.83,
	torusSmallR: 0.4,
	repeats: 7,
	zoom: 1,
	letterSpacing: -0.17,
	scrollSpeed: -0.02,
	rotationSpeed: 0.26,
	smoothing: 0.25,
	viewYaw: -0.61,
	viewPitch: -0.26,
};

const STORAGE_KEY = 'twist-v2';

export function loadSettings(): TwistSettings {
	let saved: Partial<TwistSettings> = {};
	try {
		saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {};
	} catch {
		// Private mode or corrupt JSON — fall back to defaults.
	}
	const s = { ...DEFAULT_SETTINGS, ...saved };
	s.torusTurns = Math.round(s.torusTurns);
	s.tubeTurns = Math.round(s.tubeTurns);
	return s;
}

export function saveSettings(s: TwistSettings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
	} catch {
		// Storage unavailable — settings just won't persist.
	}
}

export async function copySettings(s: TwistSettings) {
	await navigator.clipboard.writeText(JSON.stringify(s, null, 2));
}

export function toggleFullscreen() {
	if (document.fullscreenElement) document.exitFullscreen();
	else document.documentElement.requestFullscreen();
}
