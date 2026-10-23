// Microphone / line-in analysis for audio-reactive visuals.
//
// Exposes four smoothed 0…1 values — level (overall), bass, mid, high — updated
// every animation frame. With auto-level on, each band is measured against its
// own recent peak, so the response is similar in a quiet room or a loud gallery.

const BANDS = {
	bass: [20, 150],
	mid: [150, 2000],
	high: [2000, 10000],
} as const;

const RANGE_DB = 40; // dynamic range mapped onto 0…1
const PEAK_FLOOR_DB = -60; // never auto-level up past this, so silence stays near 0
const PEAK_DECAY_S = 4; // how quickly the auto-level peak relaxes
const ATTACK_S = 0.02;
const RELEASE_S = 0.25;

export type AudioDevice = { label: string; deviceId: string };

export function useAudioReactive() {
	let level = $state(0);
	let bass = $state(0);
	let mid = $state(0);
	let high = $state(0);
	let running = $state(false);
	let suspended = $state(false);
	let error = $state<string | null>(null);
	let devices = $state<AudioDevice[]>([]);

	// Tuned from outside; read every frame.
	let sensitivity = 0; // dB offset
	let autoLevel = true;

	let ctx: AudioContext | null = null;
	let stream: MediaStream | null = null;
	let analyser: AnalyserNode | null = null;
	let freq = new Float32Array(0);
	let animId = 0;
	const peaks: Record<string, number> = { level: -30, bass: -30, mid: -30, high: -30 };
	const env: Record<string, number> = { level: 0, bass: 0, mid: 0, high: 0 };

	function bandDb(lo: number, hi: number, binHz: number) {
		const a = Math.max(1, Math.floor(lo / binHz));
		const b = Math.min(freq.length - 1, Math.ceil(hi / binHz));
		let sum = 0;
		for (let i = a; i <= b; i++) sum += 10 ** (freq[i] / 10); // dB → power
		return 10 * Math.log10(sum / (b - a + 1) + 1e-12);
	}

	function normalise(name: string, db: number, dt: number) {
		const decay = Math.exp(-dt / PEAK_DECAY_S);
		peaks[name] = Math.max(db, PEAK_FLOOR_DB + (peaks[name] - PEAK_FLOOR_DB) * decay);
		const top = (autoLevel ? Math.max(peaks[name], PEAK_FLOOR_DB) : -10) - sensitivity;
		const target = Math.min(1, Math.max(0, (db - (top - RANGE_DB)) / RANGE_DB));
		const tc = target > env[name] ? ATTACK_S : RELEASE_S;
		env[name] += (target - env[name]) * (1 - Math.exp(-dt / tc));
		return env[name];
	}

	let last = 0;
	function tick(now: number) {
		animId = requestAnimationFrame(tick);
		if (!analyser || !ctx) return;
		const dt = Math.min((now - (last || now)) / 1000, 0.1) || 1 / 60;
		last = now;
		suspended = ctx.state === 'suspended';
		analyser.getFloatFrequencyData(freq);
		const binHz = ctx.sampleRate / analyser.fftSize;
		bass = normalise('bass', bandDb(...BANDS.bass, binHz), dt);
		mid = normalise('mid', bandDb(...BANDS.mid, binHz), dt);
		high = normalise('high', bandDb(...BANDS.high, binHz), dt);
		level = normalise('level', bandDb(20, 10000, binHz), dt);
	}

	async function refreshDevices() {
		const all = await navigator.mediaDevices.enumerateDevices();
		devices = all
			.filter((d) => d.kind === 'audioinput')
			.map((d, i) => ({ label: d.label || `Input ${i + 1}`, deviceId: d.deviceId }));
	}

	async function start(deviceId?: string) {
		stop();
		error = null;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					deviceId: deviceId ? { exact: deviceId } : undefined,
					// Raw signal: these are tuned for voice calls and flatten music.
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false,
				},
			});
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			return;
		}
		ctx = new AudioContext();
		analyser = ctx.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.5;
		freq = new Float32Array(analyser.frequencyBinCount);
		ctx.createMediaStreamSource(stream).connect(analyser);
		running = true;
		last = 0;
		animId = requestAnimationFrame(tick);
		await refreshDevices(); // labels are only available after permission
	}

	function stop() {
		cancelAnimationFrame(animId);
		stream?.getTracks().forEach((t) => t.stop());
		ctx?.close();
		stream = null;
		ctx = null;
		analyser = null;
		running = false;
		suspended = false;
		level = bass = mid = high = 0;
		for (const k in env) env[k] = 0;
	}

	// Browsers start an AudioContext suspended until a user gesture.
	function resume() {
		if (ctx?.state === 'suspended') ctx.resume();
	}

	return {
		get level() {
			return level;
		},
		get bass() {
			return bass;
		},
		get mid() {
			return mid;
		},
		get high() {
			return high;
		},
		get running() {
			return running;
		},
		get suspended() {
			return suspended;
		},
		get error() {
			return error;
		},
		get devices() {
			return devices;
		},
		set sensitivity(v: number) {
			sensitivity = v;
		},
		set autoLevel(v: boolean) {
			autoLevel = v;
		},
		start,
		stop,
		resume,
	};
}
