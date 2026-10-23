<script lang="ts">
	import {
		Pane,
		Folder,
		Slider,
		Checkbox,
		Button,
		List,
		Monitor,
		Color,
	} from 'svelte-tweakpane-ui';
	import TextOnCurve from '#lib/TextOnCurve.svelte';
	import TwistControls from '#lib/TwistControls.svelte';
	import { torusSpiral, torusNormal } from '#lib/curves.js';
	import { loadSettings, saveSettings, toggleFullscreen } from '#lib/twistSettings.js';
	import { useAudioReactive } from '#lib/audioReactive.svelte.js';

	let { data } = $props();

	// ── Settings ──────────────────────────────────────────────────────────
	// The look is shared with /debug/twist; audio and display settings are
	// specific to this page.

	type ScreensaverSettings = {
		background: string;
		wakeLock: boolean;
		audio: {
			enabled: boolean;
			deviceId: string;
			sensitivity: number;
			autoLevel: boolean;
			zoom: number;
			speed: number;
			spin: number;
			tilt: number;
		};
	};

	const SS_KEY = 'screensaver-v1';
	const SS_DEFAULTS: ScreensaverSettings = {
		background: '#0a0a14',
		wakeLock: true,
		audio: {
			enabled: false,
			deviceId: '',
			sensitivity: 0,
			autoLevel: true,
			zoom: 0.25,
			speed: 0.5,
			spin: 0.5,
			tilt: 0.2,
		},
	};

	function loadSs(): ScreensaverSettings {
		try {
			const saved = JSON.parse(localStorage.getItem(SS_KEY) ?? '{}') ?? {};
			return { ...SS_DEFAULTS, ...saved, audio: { ...SS_DEFAULTS.audio, ...saved.audio } };
		} catch {
			return structuredClone(SS_DEFAULTS);
		}
	}

	let settings = $state(loadSettings());
	let ss = $state(loadSs());

	$effect(() => saveSettings($state.snapshot(settings)));
	$effect(() => {
		try {
			localStorage.setItem(SS_KEY, JSON.stringify($state.snapshot(ss)));
		} catch {
			// Storage unavailable — settings just won't persist.
		}
	});

	const curve = $derived(
		torusSpiral(settings.torusTurns, settings.tubeTurns, settings.torusR, settings.torusSmallR),
	);
	const normalFn = $derived(torusNormal(settings.torusR));

	// ── Audio ─────────────────────────────────────────────────────────────

	const audio = useAudioReactive();

	$effect(() => {
		audio.sensitivity = ss.audio.sensitivity;
		audio.autoLevel = ss.audio.autoLevel;
	});

	// Start/stop with the checkbox, restart when the input device changes.
	$effect(() => {
		if (ss.audio.enabled) audio.start(ss.audio.deviceId || undefined);
		else audio.stop();
		return () => audio.stop();
	});

	const deviceOptions = $derived([
		{ text: 'default input', value: '' },
		...audio.devices.map((d) => ({ text: d.label, value: d.deviceId })),
	]);

	// Audio nudges the look on top of its base settings. Zoom, scroll, rotation
	// and pitch are cheap to change every frame; shape settings are not.
	const zoom = $derived(settings.zoom * (1 + ss.audio.zoom * audio.bass));
	const scrollSpeed = $derived(
		settings.scrollSpeed +
			Math.sign(settings.scrollSpeed || 1) * ss.audio.speed * audio.level * 0.015,
	);
	const rotationSpeed = $derived(settings.rotationSpeed + ss.audio.spin * audio.mid * 1.5);
	const viewPitch = $derived(settings.viewPitch + ss.audio.tilt * audio.high * 0.6);
	// The envelopes are already smooth; extra easing would blur the beat.
	const smoothing = $derived(
		audio.running ? Math.min(settings.smoothing, 0.05) : settings.smoothing,
	);

	// ── Display: controls, idle cursor, wake lock ─────────────────────────

	let showPane = $state(false);
	let idle = $state(false);
	let idleTimer: ReturnType<typeof setTimeout>;

	function wake() {
		idle = false;
		clearTimeout(idleTimer);
		idleTimer = setTimeout(() => (idle = true), 2500);
		audio.resume();
	}

	function onKey(e: KeyboardEvent) {
		wake();
		if (e.target instanceof HTMLInputElement) return;
		if (e.key === 'h') showPane = !showPane;
		if (e.key === 'f') toggleFullscreen();
	}

	$effect(() => {
		wake();
		return () => clearTimeout(idleTimer);
	});

	// Keep the screen from sleeping while this page is visible.
	$effect(() => {
		if (!ss.wakeLock || !('wakeLock' in navigator)) return;
		let lock: WakeLockSentinel | null = null;
		const acquire = async () => {
			if (document.visibilityState !== 'visible') return;
			try {
				lock = await navigator.wakeLock.request('screen');
			} catch {
				// Denied (e.g. battery saver) — nothing to do.
			}
		};
		acquire();
		document.addEventListener('visibilitychange', acquire);
		return () => {
			document.removeEventListener('visibilitychange', acquire);
			lock?.release();
		};
	});
</script>

<svelte:head><title>screensaver - loop[delirium]</title></svelte:head>
<svelte:window onkeydown={onKey} onpointermove={wake} onpointerdown={wake} />

<div class="stage" class:idle style:background={ss.background}>
	<TextOnCurve
		text={settings.text}
		font={data.font}
		{curve}
		{normalFn}
		repeats={settings.repeats}
		{zoom}
		letterSpacing={settings.letterSpacing}
		{scrollSpeed}
		{rotationSpeed}
		{smoothing}
		viewYaw={settings.viewYaw}
		{viewPitch}
		color={settings.color}
	/>
</div>

{#if !showPane}
	<div class="chips" class:idle>
		<button onclick={() => (showPane = true)}>controls <kbd>H</kbd></button>
		<button onclick={toggleFullscreen}>fullscreen <kbd>F</kbd></button>
	</div>
{/if}

{#if showPane}
	<Pane title="screensaver · H to hide" position="fixed">
		<Folder title="audio">
			<Checkbox bind:value={ss.audio.enabled} label="listen" />
			{#if audio.error}
				<Monitor value={audio.error} label="error" />
			{/if}
			{#if audio.suspended}
				<Monitor value="click anywhere to start" label="status" />
			{/if}
			<List bind:value={ss.audio.deviceId} options={deviceOptions} label="input" />
			<Checkbox bind:value={ss.audio.autoLevel} label="auto level" />
			<Slider bind:value={ss.audio.sensitivity} min={-20} max={20} step={1} label="sensitivity" />
			<Monitor value={audio.bass} graph min={0} max={1} label="bass" />
			<Monitor value={audio.mid} graph min={0} max={1} label="mid" />
			<Monitor value={audio.high} graph min={0} max={1} label="high" />
			<Slider bind:value={ss.audio.zoom} min={0} max={1} step={0.01} label="bass → zoom" />
			<Slider bind:value={ss.audio.speed} min={0} max={1} step={0.01} label="level → scroll" />
			<Slider bind:value={ss.audio.spin} min={0} max={1} step={0.01} label="mid → spin" />
			<Slider bind:value={ss.audio.tilt} min={0} max={1} step={0.01} label="high → tilt" />
		</Folder>
		<Folder title="display">
			<Color bind:value={ss.background} label="background" />
			<Checkbox bind:value={ss.wakeLock} label="keep awake" />
			<Button title="fullscreen (F)" on:click={toggleFullscreen} />
		</Folder>
		<Folder title="look" expanded={false}>
			<TwistControls bind:settings />
		</Folder>
	</Pane>
{/if}

<style>
	.stage {
		position: fixed;
		inset: 0;
	}

	.stage.idle {
		cursor: none;
	}

	.stage :global(canvas) {
		width: 100%;
		height: 100%;
		aspect-ratio: auto;
		background: transparent;
	}

	.chips {
		position: fixed;
		right: var(--gutter);
		bottom: var(--gutter);
		display: flex;
		gap: 0.5rem;
		transition: opacity 0.6s;
	}

	.chips.idle {
		opacity: 0;
		pointer-events: none;
	}

	.chips button {
		padding: 0.45rem 0.8rem;
		border: 1px solid var(--faint);
		border-radius: 999px;
		background: rgb(10 10 20 / 0.6);
		color: var(--muted);
		font: inherit;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.chips button:hover {
		color: var(--fg);
	}

	kbd {
		margin-left: 0.3rem;
		font-family: inherit;
		opacity: 0.6;
	}
</style>
