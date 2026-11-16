<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Group } from 'three';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Cyl from './Cyl.svelte';
	import Hotspot from './Hotspot.svelte';

	const d = getDiorama();

	let arm = $state<Group>();
	let head = $state<Group>();
	let elapsed = 0;

	useTask(
		(delta) => {
			elapsed += delta;
			if (arm) arm.rotation.z = -0.55 + Math.sin(elapsed * 4) * 0.28;
			if (head) head.rotation.z = Math.sin(elapsed * 2) * 0.05;
		},
		{ running: () => !d.reducedMotion }
	);
</script>

<!-- The chair is swivelled away from the desk so the figure faces the default camera -->
<Hotspot
	id="about"
	label="About"
	position={[-0.9, 0, -1.95]}
	rotation={[0, Math.PI / 4, 0]}
	labelPosition={[0, 2.4, 0]}
>
	<!-- Chair -->
	<Cyl radius={0.34} height={0.06} position={[0, 0.03, 0]} color={d.pal.plastic} />
	<Cyl radius={0.05} height={0.5} position={[0, 0.3, 0]} color={d.pal.metal} />
	<Box size={[0.72, 0.1, 0.7]} position={[0, 0.6, 0]} color={d.pal.chair} />
	<Box size={[0.72, 0.85, 0.1]} position={[0, 1.05, -0.36]} color={d.pal.chair} />

	<!-- Legs -->
	{#each [-0.15, 0.15] as x}
		<Box size={[0.2, 0.18, 0.58]} position={[x, 0.74, 0.2]} color={d.pal.trousers} />
		<Box size={[0.18, 0.56, 0.18]} position={[x, 0.42, 0.48]} color={d.pal.trousers} />
		<Box size={[0.2, 0.12, 0.3]} position={[x, 0.1, 0.54]} color={d.pal.paper} />
	{/each}

	<!-- Black polo: body, collar and placket -->
	<Box size={[0.54, 0.62, 0.3]} position={[0, 1.1, 0]} color={d.pal.shirt} />
	<Box size={[0.14, 0.1, 0.14]} position={[0, 1.44, 0]} color={d.pal.skin} />
	<Box
		size={[0.17, 0.06, 0.12]}
		position={[-0.1, 1.41, 0.1]}
		rotation={[0.3, 0, 0.35]}
		color={d.pal.collar}
	/>
	<Box
		size={[0.17, 0.06, 0.12]}
		position={[0.1, 1.41, 0.1]}
		rotation={[0.3, 0, -0.35]}
		color={d.pal.collar}
	/>
	<Box size={[0.05, 0.2, 0.02]} position={[0, 1.27, 0.15]} color={d.pal.collar} />

	<!-- Resting arm: short sleeve, bare forearm -->
	<Box size={[0.15, 0.24, 0.15]} position={[-0.35, 1.25, 0.03]} color={d.pal.shirt} />
	<Box size={[0.12, 0.34, 0.12]} position={[-0.35, 0.97, 0.06]} color={d.pal.skin} />

	<!-- Waving arm, pivoting at the shoulder -->
	<T.Group bind:ref={arm} position={[0.34, 1.32, 0]} rotation={[0, 0, -0.55]}>
		<Box size={[0.15, 0.24, 0.15]} position={[0, 0.08, 0]} color={d.pal.shirt} />
		<Box size={[0.12, 0.32, 0.12]} position={[0, 0.35, 0]} color={d.pal.skin} />
		<Box size={[0.15, 0.15, 0.13]} position={[0, 0.57, 0]} color={d.pal.skin} />
	</T.Group>

	<!-- Head, tipped back a touch so the face meets the raised camera -->
	<T.Group bind:ref={head} position={[0, 1.68, 0.01]} rotation={[-0.16, 0, 0]}>
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
</Hotspot>
