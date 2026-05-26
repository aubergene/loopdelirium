// Call useDeviceOrientation() at the top level of a Svelte component script.
// It registers event listeners via $effect and cleans up automatically.

export function useDeviceOrientation() {
	let beta  = $state<number | null>(null);
	let gamma = $state<number | null>(null);
	let needsPermission = $state(false);

	function handleOrientation(e: DeviceOrientationEvent) {
		beta  = e.beta;
		gamma = e.gamma;
	}

	async function grantPermission() {
		const result = await (DeviceOrientationEvent as unknown as {
			requestPermission(): Promise<'granted' | 'denied'>;
		}).requestPermission();
		if (result === 'granted') {
			needsPermission = false;
			window.addEventListener('deviceorientation', handleOrientation);
		}
	}

	$effect(() => {
		if (typeof window === 'undefined' || !window.DeviceOrientationEvent) return;

		if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
			needsPermission = true;
			return;
		}

		window.addEventListener('deviceorientation', handleOrientation);
		return () => window.removeEventListener('deviceorientation', handleOrientation);
	});

	return {
		get beta()             { return beta; },
		get gamma()            { return gamma; },
		get needsPermission()  { return needsPermission; },
		grantPermission,
	};
}
