<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Group } from 'three';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Cyl from './Cyl.svelte';
	import {
		FACE_CAMERA,
		SEAT,
		SIT,
		routine,
		type Cond,
		type FigureState,
		type Pose
	} from './figureRoutine';
	import Hotspot from './Hotspot.svelte';
	import Label from './Label.svelte';

	let { hasNotes }: { hasNotes: boolean } = $props();

	const d = getDiorama();

	// Rig joints, driven directly each frame
	let root = $state<Group>();
	let chair = $state<Group>();
	let body = $state<Group>();
	let upper = $state<Group>();
	let head = $state<Group>();
	let lShoulder = $state<Group>();
	let lElbow = $state<Group>();
	let rShoulder = $state<Group>();
	let rElbow = $state<Group>();
	let lHip = $state<Group>();
	let lKnee = $state<Group>();
	let rHip = $state<Group>();
	let rKnee = $state<Group>();

	// What the script wants, and where the rig currently is on its way there
	const target: FigureState = { pose: SIT, mode: null, seated: true };
	const pose: Pose = { ...SIT };
	const at = { x: SEAT[0], z: SEAT[1], heading: FACE_CAMERA };
	let walkAmount = 0;
	let elapsed = 0;

	// svelte-ignore state_referenced_locally -- the set of activities is fixed for the scene's life
	const script = routine(target, {
		hasNotes,
		wanted: () => d.active === 'about',
		setPhoneLifted: (lifted) => (d.stage.phoneLifted = lifted)
	});
	let cond: Cond | null = null;

	const angleTo = (from: number, to: number) => {
		let delta = (to - from) % (Math.PI * 2);
		if (delta > Math.PI) delta -= Math.PI * 2;
		if (delta < -Math.PI) delta += Math.PI * 2;
		return delta;
	};

	/** Advances the current condition; returns true once it is satisfied. */
	function step(current: Cond, delta: number, hurry: boolean) {
		if (current.kind === 'wait') {
			current.time -= delta;
			return current.time <= 0 || (hurry && current.skippable);
		}
		if (current.kind === 'turn') {
			const remaining = angleTo(at.heading, current.angle);
			at.heading += remaining * Math.min(1, delta * 7);
			return Math.abs(remaining) < 0.04;
		}
		const dx = current.x - at.x;
		const dz = current.z - at.z;
		const distance = Math.hypot(dx, dz);
		const reach = (hurry ? 3.4 : 1.6) * delta;
		if (distance <= reach) {
			at.x = current.x;
			at.z = current.z;
			return true;
		}
		at.x += (dx / distance) * reach;
		at.z += (dz / distance) * reach;
		if (!current.keepFacing) {
			at.heading += angleTo(at.heading, Math.atan2(dx, dz)) * Math.min(1, delta * 10);
		}
		return false;
	}

	/** Writes the pose, plus the looping motion for the current mode, onto the joints. */
	function apply() {
		if (!root || !body || !upper || !head) return;
		const { mode } = target;
		const t = elapsed;
		const stride = Math.sin(t * 9) * walkAmount;

		// The hotspot group sits at the chair, so the root is placed relative to it
		root.position.set(at.x - SEAT[0], 0, at.z - SEAT[1]);
		root.rotation.y = at.heading;
		if (chair && target.seated) {
			chair.position.copy(root.position);
			chair.rotation.y = at.heading;
		}

		body.position.y = pose.hipY + Math.abs(Math.cos(t * 9)) * 0.04 * walkAmount;
		upper.rotation.x = pose.lean;
		head.rotation.set(
			pose.headX + (mode === 'talk' ? Math.sin(t * 5) * 0.06 : 0),
			mode === 'read' ? Math.sin(t * 1.3) * 0.3 : 0,
			pose.headZ + Math.sin(t * 2) * 0.04
		);

		const tap = mode === 'type' ? Math.sin(t * 16) * 0.09 : 0;
		lShoulder?.rotation.set(pose.lShX + stride * 0.7, 0, pose.lShZ);
		lElbow?.rotation.set(pose.lElX + tap, 0, 0);
		rShoulder?.rotation.set(pose.rShX - stride * 0.7, 0, pose.rShZ);
		rElbow?.rotation.set(
			pose.rElX - tap,
			0,
			pose.rElZ + (mode === 'wave' ? Math.sin(t * 8) * 0.4 : 0)
		);

		lHip?.rotation.set(pose.hipX - stride * 0.6, 0, 0);
		rHip?.rotation.set(pose.hipX + stride * 0.6, 0, 0);
		lKnee?.rotation.set(pose.knee + Math.max(0, stride) * 0.7, 0, 0);
		rKnee?.rotation.set(pose.knee + Math.max(0, -stride) * 0.7, 0, 0);
	}

	useTask(
		(delta) => {
			// A background tab resumes with one huge frame; don't let it teleport the figure
			const dt = Math.min(delta, 0.1);
			elapsed += dt;

			const hurry = d.active === 'about';
			if (!cond || step(cond, dt, hurry)) cond = script.next().value ?? null;

			const ease = 1 - Math.exp(-dt * 9);
			for (const key of Object.keys(pose) as (keyof Pose)[]) {
				pose[key] += (target.pose[key] - pose[key]) * ease;
			}
			walkAmount += ((target.mode === 'walk' ? 1 : 0) - walkAmount) * ease;

			apply();
		},
		{ running: () => !d.reducedMotion }
	);

	// With reduced motion the task never runs, so place the seated pose once the rig exists
	$effect(() => {
		if (d.reducedMotion) apply();
	});

	const SHOULDER_Y = 0.58;
</script>

{#snippet arm(side: 1 | -1, holdsPhone: boolean)}
	<!-- Short sleeve, then a bare forearm hinged at the elbow -->
	<Box size={[0.15, 0.26, 0.15]} position={[0, -0.11, 0]} color={d.pal.shirt} />
	{#if side === 1}
		<T.Group bind:ref={rElbow} position={[0, -0.24, 0]}>
			{@render forearm(holdsPhone)}
		</T.Group>
	{:else}
		<T.Group bind:ref={lElbow} position={[0, -0.24, 0]}>
			{@render forearm(holdsPhone)}
		</T.Group>
	{/if}
{/snippet}

{#snippet forearm(holdsPhone: boolean)}
	<Box size={[0.12, 0.32, 0.12]} position={[0, -0.16, 0]} color={d.pal.skin} />
	<Box size={[0.14, 0.14, 0.13]} position={[0, -0.38, 0]} color={d.pal.skin} />
	{#if holdsPhone}
		<Box size={[0.09, 0.4, 0.08]} position={[-0.09, -0.36, 0.02]} color={d.pal.primaryDeep} />
		<Box size={[0.11, 0.12, 0.12]} position={[-0.11, -0.2, 0.02]} color={d.pal.primaryDeep} />
		<Box size={[0.11, 0.12, 0.12]} position={[-0.11, -0.52, 0.02]} color={d.pal.primaryDeep} />
	{/if}
{/snippet}

{#snippet shin()}
	<Box size={[0.18, 0.5, 0.18]} position={[0, -0.25, 0]} color={d.pal.trousers} />
	<Box size={[0.2, 0.12, 0.3]} position={[0, -0.56, 0.05]} color={d.pal.paper} />
{/snippet}

<!-- The group sits at the chair; the figure's root moves within it, so it doesn't swell on hover -->
<Hotspot id="about" position={[SEAT[0], 0, SEAT[1]]} grow={false}>
	{#snippet children({ lit })}
		<T.Group bind:ref={chair} rotation={[0, FACE_CAMERA, 0]}>
			<Cyl radius={0.34} height={0.06} position={[0, 0.03, 0]} color={d.pal.plastic} />
			<Cyl radius={0.05} height={0.5} position={[0, 0.3, 0]} color={d.pal.metal} />
			<Box size={[0.72, 0.1, 0.7]} position={[0, 0.6, 0]} color={d.pal.chair} />
			<Box size={[0.72, 0.85, 0.1]} position={[0, 1.05, -0.36]} color={d.pal.chair} />
		</T.Group>

		<T.Group bind:ref={root} rotation={[0, FACE_CAMERA, 0]}>
			<!-- Origin at the hips -->
			<T.Group bind:ref={body} position={[0, SIT.hipY, 0]}>
				<Label
					text="About"
					position={[0, 1.62, 0]}
					height={d.labelHeight}
					fixed
					highlighted={lit}
				/>

				<T.Group bind:ref={upper}>
					<!-- Black polo: body, collar and placket -->
					<Box size={[0.54, 0.62, 0.3]} position={[0, 0.36, 0]} color={d.pal.shirt} />
					<Box size={[0.14, 0.1, 0.14]} position={[0, 0.7, 0]} color={d.pal.skin} />
					<Box
						size={[0.17, 0.06, 0.12]}
						position={[-0.1, 0.67, 0.1]}
						rotation={[0.3, 0, 0.35]}
						color={d.pal.collar}
					/>
					<Box
						size={[0.17, 0.06, 0.12]}
						position={[0.1, 0.67, 0.1]}
						rotation={[0.3, 0, -0.35]}
						color={d.pal.collar}
					/>
					<Box size={[0.05, 0.2, 0.02]} position={[0, 0.53, 0.15]} color={d.pal.collar} />

					<T.Group
						bind:ref={lShoulder}
						position={[-0.35, SHOULDER_Y, 0]}
						rotation={[SIT.lShX, 0, SIT.lShZ]}
					>
						{@render arm(-1, false)}
					</T.Group>
					<T.Group
						bind:ref={rShoulder}
						position={[0.35, SHOULDER_Y, 0]}
						rotation={[SIT.rShX, 0, SIT.rShZ]}
					>
						{@render arm(1, d.stage.phoneLifted)}
					</T.Group>

					<!-- Head, tipped back a touch when seated so the face meets the raised camera -->
					<T.Group bind:ref={head} position={[0, 0.94, 0.01]} rotation={[SIT.headX, 0, 0]}>
						<Box size={[0.4, 0.4, 0.38]} color={d.pal.skin} />
						<Box size={[0.06, 0.1, 0.06]} position={[-0.22, -0.02, 0]} color={d.pal.skin} />
						<Box size={[0.06, 0.1, 0.06]} position={[0.22, -0.02, 0]} color={d.pal.skin} />

						<!-- Thick, side-swept black hair -->
						<Box size={[0.5, 0.2, 0.48]} position={[0, 0.25, -0.02]} color={d.pal.hair} />
						<Box size={[0.48, 0.38, 0.14]} position={[0, 0.06, -0.2]} color={d.pal.hair} />
						<Box size={[0.07, 0.24, 0.3]} position={[-0.23, 0.12, -0.04]} color={d.pal.hair} />
						<Box size={[0.07, 0.2, 0.3]} position={[0.23, 0.14, -0.04]} color={d.pal.hair} />
						<Box
							size={[0.34, 0.12, 0.08]}
							position={[-0.06, 0.17, 0.19]}
							rotation={[0, 0, 0.22]}
							color={d.pal.hair}
						/>
						<Box
							size={[0.16, 0.1, 0.08]}
							position={[0.16, 0.19, 0.19]}
							rotation={[0, 0, -0.3]}
							color={d.pal.hair}
						/>
						<Box
							size={[0.2, 0.1, 0.2]}
							position={[0.08, 0.37, 0.02]}
							rotation={[0, 0.3, 0.15]}
							color={d.pal.hair}
						/>

						<!-- Face: brows, eyes, wide smile, goatee -->
						<Box size={[0.1, 0.022, 0.02]} position={[-0.1, 0.07, 0.195]} color={d.pal.hair} />
						<Box size={[0.1, 0.022, 0.02]} position={[0.1, 0.07, 0.195]} color={d.pal.hair} />
						<Box size={[0.055, 0.05, 0.02]} position={[-0.1, 0.01, 0.195]} color={d.pal.hair} />
						<Box size={[0.055, 0.05, 0.02]} position={[0.1, 0.01, 0.195]} color={d.pal.hair} />
						<Box size={[0.2, 0.07, 0.02]} position={[0, -0.09, 0.195]} color="#7a3b2e" />
						<Box size={[0.17, 0.04, 0.025]} position={[0, -0.08, 0.195]} color="#ffffff" />
						<Box size={[0.1, 0.07, 0.03]} position={[0, -0.175, 0.19]} color={d.pal.hair} />
					</T.Group>
				</T.Group>

				<!-- Legs: thigh from the hip, shin hinged at the knee -->
				<T.Group bind:ref={lHip} position={[-0.15, 0, 0]} rotation={[SIT.hipX, 0, 0]}>
					<Box size={[0.2, 0.4, 0.2]} position={[0, -0.2, 0]} color={d.pal.trousers} />
					<T.Group bind:ref={lKnee} position={[0, -0.4, 0]} rotation={[SIT.knee, 0, 0]}>
						{@render shin()}
					</T.Group>
				</T.Group>
				<T.Group bind:ref={rHip} position={[0.15, 0, 0]} rotation={[SIT.hipX, 0, 0]}>
					<Box size={[0.2, 0.4, 0.2]} position={[0, -0.2, 0]} color={d.pal.trousers} />
					<T.Group bind:ref={rKnee} position={[0, -0.4, 0]} rotation={[SIT.knee, 0, 0]}>
						{@render shin()}
					</T.Group>
				</T.Group>
			</T.Group>
		</T.Group>
	{/snippet}
</Hotspot>
