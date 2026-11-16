<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls, interactivity } from '@threlte/extras';
	import { gsap } from 'gsap';
	import type { DirectionalLight, PerspectiveCamera } from 'three';
	import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
	import { HOME, type Profile, type Section, type SectionId } from '../sections';
	import { buildPalette, setDiorama, watchDarkMode } from '../theme.svelte';
	import Bookshelf from './Bookshelf.svelte';
	import ContactTable from './ContactTable.svelte';
	import Corkboard from './Corkboard.svelte';
	import Desk from './Desk.svelte';
	import Figure from './Figure.svelte';
	import Monitor from './Monitor.svelte';
	import Pegboard from './Pegboard.svelte';
	import PhotoFrame from './PhotoFrame.svelte';
	import Room from './Room.svelte';
	import WallTimeline from './WallTimeline.svelte';

	let {
		profile,
		hasImage,
		sections,
		active,
		reducedMotion,
		onselect
	}: {
		profile: Profile;
		hasImage: boolean;
		sections: Section[];
		active: SectionId | null;
		reducedMotion: boolean;
		onselect: (id: SectionId) => void;
	} = $props();

	interactivity();

	const theme = watchDarkMode();
	const pal = $derived(buildPalette(theme.dark));

	setDiorama({
		get pal() {
			return pal;
		},
		get active() {
			return active;
		},
		get reducedMotion() {
			return reducedMotion;
		},
		get labelHeight() {
			return labelHeight;
		},
		select: (id) => onselect(id)
	});

	const { size, invalidate } = useThrelte();

	const FOV = 30;

	let camera = $state<PerspectiveCamera>();
	let controls = $state<OrbitControlsImpl>();

	const has = (id: SectionId) => sections.some((section) => section.id === id);
	const degrees = $derived(
		[profile?.mastersDegree, profile?.collegeDegree].filter(Boolean).length || 1
	);

	// The field of view is vertical, so a narrow screen has to stand further back to fit the room.
	const aspect = $derived($size.width / Math.max($size.height, 1));
	const fit = $derived(Math.min(3.4, Math.max(1, 1.35 / aspect)));
	const compact = $derived($size.width < 640);
	// Hotspot labels keep a fixed pixel height: as a fraction of the view, that is
	// px * 2 * tan(fov / 2) / canvas height.
	const labelHeight = $derived(
		((compact ? 20 : 26) * 2 * Math.tan((FOV * Math.PI) / 360)) / Math.max($size.height, 1)
	);

	const pose = $derived.by(() => {
		const section = sections.find((item) => item.id === active);
		const { target, offset } = section ?? HOME;
		// Section offsets are authored for a wide view; back off a little so the object has context.
		const k = section ? 1.45 * Math.min(fit, 1.5) : fit;
		let [x, y, z] = target;
		if (section && compact) {
			// The panel is a bottom sheet: aim a quarter of the view lower to lift the object
			// into the clear upper half.
			y -= 0.13 * Math.hypot(...offset) * k;
		} else if (section) {
			// The panel covers the right side: aim to the camera's right to slide the object left.
			const azimuth = Math.atan2(offset[0], offset[2]);
			const shift = 0.2 * Math.hypot(...offset) * k * Math.min(1, 1.6 / aspect);
			x += Math.cos(azimuth) * shift;
			z -= Math.sin(azimuth) * shift;
		}
		return {
			target: { x, y, z },
			position: { x: x + offset[0] * k, y: y + offset[1] * k, z: z + offset[2] * k }
		};
	});

	let placed = false;

	$effect(() => {
		const next = pose;
		if (!camera || !controls) return;
		const cam = camera;
		const ctl = controls;
		const apply = () => {
			ctl.update();
			invalidate();
		};

		if (reducedMotion || !placed) {
			placed = true;
			cam.position.set(next.position.x, next.position.y, next.position.z);
			ctl.target.set(next.target.x, next.target.y, next.target.z);
			apply();
			return;
		}

		const tween = gsap
			.timeline({ defaults: { duration: 1.1, ease: 'power2.inOut' }, onUpdate: apply })
			.to(cam.position, next.position, 0)
			.to(ctl.target, next.target, 0);
		return () => tween.kill();
	});

	const setupShadow = (light: DirectionalLight) => {
		const shadowCamera = light.shadow.camera;
		shadowCamera.left = -8;
		shadowCamera.right = 8;
		shadowCamera.top = 8;
		shadowCamera.bottom = -8;
		shadowCamera.near = 1;
		shadowCamera.far = 40;
		shadowCamera.updateProjectionMatrix();
		light.shadow.mapSize.set(2048, 2048);
		light.shadow.bias = -0.0004;
		light.shadow.normalBias = 0.03;
	};
</script>

<T.Color attach="background" args={[pal.background]} />

<T.PerspectiveCamera makeDefault fov={FOV} near={0.5} far={160} bind:ref={camera}>
	<OrbitControls
		bind:ref={controls}
		enableDamping={!reducedMotion}
		enablePan={false}
		minDistance={4}
		maxDistance={19 * fit}
		minPolarAngle={0.5}
		maxPolarAngle={1.5}
		minAzimuthAngle={0.1}
		maxAzimuthAngle={1.47}
	/>
</T.PerspectiveCamera>

<T.HemisphereLight
	color={pal.dark ? '#8497dc' : '#ffffff'}
	groundColor={pal.dark ? '#43342a' : '#cbb89c'}
	intensity={pal.dark ? 1.7 : 2.1}
/>
<T.DirectionalLight
	position={[7, 12, 9]}
	color={pal.dark ? '#8fa8ff' : '#fff4e0'}
	intensity={pal.dark ? 1.3 : 2.4}
	castShadow
	oncreate={setupShadow}
/>

<Room />
<Desk />
<Figure />
<PhotoFrame {hasImage} />
<WallTimeline experiences={profile?.experiences ?? []} />
<Monitor projects={profile?.portfolio ?? []} interactive={has('projects')} />
<Bookshelf {degrees} />
<Pegboard skills={profile?.skills ?? []} />
{#if has('testimonials')}
	<Corkboard count={profile?.testimonials?.length ?? 0} />
{/if}
<ContactTable />
