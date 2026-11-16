<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Group } from 'three';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Cyl from './Cyl.svelte';

	const d = getDiorama();

	let leaves = $state<Group>();
	let elapsed = 0;

	useTask(
		(delta) => {
			elapsed += delta;
			if (leaves) leaves.rotation.z = Math.sin(elapsed * 1.2) * 0.05;
		},
		{ running: () => !d.reducedMotion }
	);
</script>

<!-- Floor slab and the two standing walls of the cutaway -->
<Box size={[8.3, 0.3, 8.3]} position={[-0.15, -0.15, -0.15]} color={d.pal.floor} />
<Box size={[8.5, 0.12, 8.5]} position={[-0.15, -0.36, -0.15]} color={d.pal.floorEdge} />
<Box size={[8.3, 4, 0.3]} position={[-0.15, 2, -4.15]} color={d.pal.wall} />
<Box size={[0.3, 4, 8]} position={[-4.15, 2, 0]} color={d.pal.wall} />
<Box size={[8, 0.22, 0.06]} position={[0, 0.11, -3.97]} color={d.pal.wallTrim} />
<Box size={[0.06, 0.22, 8]} position={[-3.97, 0.11, 0]} color={d.pal.wallTrim} />

<!-- Rug -->
<Cyl radius={1.7} height={0.03} segments={48} position={[0.3, 0.015, 0.3]} color={d.pal.rug} />
<Cyl radius={1.32} height={0.035} segments={48} position={[0.3, 0.02, 0.3]} color={d.pal.rugTrim} />
<Cyl radius={1.2} height={0.04} segments={48} position={[0.3, 0.025, 0.3]} color={d.pal.rug} />

<!-- Window on the back wall -->
<T.Group position={[1.15, 2.7, -3.98]}>
	<Box size={[1.5, 1.5, 0.08]} color={d.pal.paper} />
	<Box
		size={[1.3, 1.3, 0.1]}
		color={d.pal.sky}
		emissive={d.pal.sky}
		emissiveIntensity={d.pal.dark ? 0.5 : 0.35}
	/>
	<Box size={[0.06, 1.3, 0.12]} color={d.pal.paper} />
	<Box size={[1.3, 0.06, 0.12]} color={d.pal.paper} />
	<Box size={[1.7, 0.08, 0.22]} position={[0, -0.79, 0.08]} color={d.pal.paper} />
	{#if d.pal.dark}
		<T.Mesh position={[0.32, 0.3, 0.06]}>
			<T.CircleGeometry args={[0.16, 24]} />
			<T.MeshBasicMaterial color="#fef9c3" toneMapped={false} />
		</T.Mesh>
	{/if}
</T.Group>

<!-- Potted plant -->
<T.Group position={[-3.3, 0, 3.4]}>
	<Cyl radius={0.26} radiusTop={0.34} height={0.5} position={[0, 0.25, 0]} color={d.pal.pot} />
	<Cyl radius={0.03} height={0.5} position={[0, 0.7, 0]} color={d.pal.woodDark} />
	<T.Group bind:ref={leaves} position={[0, 0.9, 0]}>
		{#each [[0, 0.35, 0, 0.42], [0.28, 0.1, 0.1, 0.3], [-0.26, 0.15, -0.08, 0.32], [0.05, 0.05, -0.3, 0.28], [-0.05, 0.12, 0.3, 0.3]] as [x, y, z, r]}
			<T.Mesh position={[x, y, z]} castShadow>
				<T.IcosahedronGeometry args={[r, 0]} />
				<T.MeshStandardMaterial color={d.pal.plant} flatShading roughness={0.9} />
			</T.Mesh>
		{/each}
	</T.Group>
</T.Group>
