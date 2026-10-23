// Call useDeviceOrientation() at the top level of a Svelte component script.
// It registers event listeners via $effect and cleans up automatically.
//
// The raw alpha/beta/gamma Euler angles hit gimbal lock when the phone is held
// upright (beta ≈ 90°): gamma then rotates about the same axis as alpha, so a
// tiny forward/back tilt can make gamma jump ±90° and alpha jump 180°. Instead
// we expose angles derived from the physical orientation, which stay continuous:
//
//   pitch   — forward/back tilt. 0 = upright, -90 = flat screen-up,
//             positive = top tilted away. Equals beta - 90 when there's no roll.
//   roll    — left/right tilt, -90…90. Equals gamma when flat; when upright it's
//             the "steering wheel" tilt.
//   heading — compass heading 0…360, measured along a device axis halfway
//             between the top edge and the back of the phone. Equals alpha when
//             flat or upright; it's only undefined when that axis points
//             straight up or down, a pose nobody holds a phone in.

const DEG = Math.PI / 180;

type GatedOrientationEvent = { requestPermission?: () => Promise<'granted' | 'denied'> };
const gated = () => DeviceOrientationEvent as unknown as GatedOrientationEvent;
const requestPermission = () => gated().requestPermission!();

// `enabled` is read reactively; when it returns false, listeners are removed and
// the angles reset to null.
export function useDeviceOrientation(enabled: () => boolean = () => true) {
	let pitch = $state<number | null>(null);
	let roll = $state<number | null>(null);
	let heading = $state<number | null>(null);
	let needsPermission = $state(false);
	let permission = $state<'unknown' | 'granted' | 'denied'>('unknown');
	let requesting = false;

	function handleOrientation(e: DeviceOrientationEvent) {
		if (e.alpha === null || e.beta === null || e.gamma === null) return;
		const sa = Math.sin(e.alpha * DEG),
			ca = Math.cos(e.alpha * DEG);
		const sb = Math.sin(e.beta * DEG),
			cb = Math.cos(e.beta * DEG);
		const sg = Math.sin(e.gamma * DEG),
			cg = Math.cos(e.gamma * DEG);

		// World "up" in device coordinates: R(alpha,beta,gamma)ᵀ · [0, 0, 1]
		const ux = -cb * sg;
		const uy = sb;
		const uz = cb * cg;
		pitch = -Math.atan2(uz, uy) / DEG;
		roll = Math.asin(Math.max(-1, Math.min(1, -ux))) / DEG;

		// Device vector (0, 1, -1) rotated into world space: R · v
		const t = cb + cg * sb;
		const wx = -sg * ca - t * sa;
		const wy = -sg * sa + t * ca;
		heading = (((Math.atan2(-wx, wy) / DEG) % 360) + 360) % 360;
	}

	async function grantPermission() {
		if (requesting) return;
		requesting = true;
		try {
			permission = (await requestPermission()) === 'granted' ? 'granted' : 'denied';
		} catch {
			// Rejected because the event wasn't a user gesture (e.g. the touchend at
			// the end of a scroll) — leave it and try again on the next tap.
		} finally {
			requesting = false;
		}
	}

	$effect(() => {
		if (!enabled() || typeof window === 'undefined' || !window.DeviceOrientationEvent) return;
		if (permission === 'denied') return;

		if (typeof gated().requestPermission === 'function' && permission !== 'granted') {
			// Desktop Chrome also gates the API, but there's no sensor to ask for.
			if (!matchMedia('(pointer: coarse)').matches) return;

			// iOS: motion access must be requested from a user gesture. Ask on the
			// first tap anywhere; Safari only fires click on interactive elements,
			// so listen for touchend as well.
			needsPermission = true;
			window.addEventListener('touchend', grantPermission);
			window.addEventListener('click', grantPermission);
			return () => {
				needsPermission = false;
				window.removeEventListener('touchend', grantPermission);
				window.removeEventListener('click', grantPermission);
			};
		}

		window.addEventListener('deviceorientation', handleOrientation);
		return () => {
			window.removeEventListener('deviceorientation', handleOrientation);
			pitch = roll = heading = null;
		};
	});

	return {
		get pitch() {
			return pitch;
		},
		get roll() {
			return roll;
		},
		get heading() {
			return heading;
		},
		get needsPermission() {
			return needsPermission;
		},
		grantPermission,
	};
}
