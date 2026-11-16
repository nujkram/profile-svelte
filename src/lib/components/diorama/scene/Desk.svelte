<script lang="ts">
	import { T } from '@threlte/core';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Cyl from './Cyl.svelte';

	const d = getDiorama();
</script>

<T.Group position={[-1.2, 0, -3.25]}>
	<!-- Table -->
	<Box size={[2.9, 0.1, 1.25]} position={[0, 1, 0]} color={d.pal.wood} />
	{#each [[-1.35, -0.52], [1.35, -0.52], [-1.35, 0.52], [1.35, 0.52]] as [x, z]}
		<Box size={[0.1, 0.95, 0.1]} position={[x, 0.475, z]} color={d.pal.woodDark} />
	{/each}
	<Box size={[0.7, 0.6, 1.05]} position={[0.95, 0.65, 0]} color={d.pal.woodDark} />
	<Box size={[0.5, 0.04, 0.02]} position={[0.95, 0.75, 0.54]} color={d.pal.metal} />
	<Box size={[0.5, 0.04, 0.02]} position={[0.95, 0.5, 0.54]} color={d.pal.metal} />

	<!-- Keyboard and mug -->
	<Box size={[0.8, 0.04, 0.26]} position={[0.2, 1.07, 0.3]} color={d.pal.plastic} />
	<Cyl radius={0.09} height={0.18} position={[-0.75, 1.14, 0.3]} color={d.pal.paper} />
	<Cyl radius={0.075} height={0.02} position={[-0.75, 1.225, 0.3]} color="#6b4226" />

	<!-- Desk lamp: the room's light source at night -->
	<T.Group position={[-1.15, 1.05, -0.3]}>
		<Cyl radius={0.16} height={0.04} position={[0, 0.02, 0]} color={d.pal.plastic} />
		<Cyl radius={0.025} height={0.7} position={[0, 0.37, 0]} color={d.pal.metal} />
		<Cyl
			radius={0.2}
			radiusTop={0.08}
			height={0.22}
			position={[0.12, 0.74, 0.08]}
			rotation={[0.35, 0, -0.5]}
			color={d.pal.tertiary}
			emissive={d.pal.lamp}
			emissiveIntensity={d.pal.dark ? 0.9 : 0}
		/>
		{#if d.pal.dark}
			<T.PointLight
				position={[0.3, 0.6, 0.3]}
				color={d.pal.lamp}
				intensity={14}
				distance={9}
				decay={1.6}
			/>
		{/if}
	</T.Group>
</T.Group>
