<script lang="ts">
	import { T } from '@threlte/core';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Cyl from './Cyl.svelte';
	import Hotspot from './Hotspot.svelte';

	const d = getDiorama();
</script>

<!-- A side table against the left wall: a telephone and a tray of letters -->
<Hotspot
	id="contact"
	label="Contact"
	position={[-3.55, 0, -0.5]}
	rotation={[0, Math.PI / 2, 0]}
	labelPosition={[0, 1.55, 0]}
>
	<!-- Table -->
	<Box size={[1.4, 0.08, 0.62]} position={[0, 0.8, 0]} color={d.pal.wood} />
	<Box size={[1.24, 0.05, 0.5]} position={[0, 0.3, 0]} color={d.pal.wood} />
	{#each [[-0.62, -0.24], [0.62, -0.24], [-0.62, 0.24], [0.62, 0.24]] as [x, z]}
		<Box size={[0.08, 0.8, 0.08]} position={[x, 0.4, z]} color={d.pal.woodDark} />
	{/each}

	<!-- Telephone -->
	<T.Group position={[-0.34, 0.84, 0]}>
		<Box size={[0.4, 0.1, 0.3]} position={[0, 0.05, 0]} color={d.pal.primary} />
		<Box size={[0.3, 0.06, 0.24]} position={[0, 0.13, -0.01]} color={d.pal.primary} />
		<Cyl radius={0.075} height={0.02} position={[0, 0.17, 0]} color={d.pal.paper} />
		<Cyl radius={0.03} height={0.03} position={[0, 0.175, 0]} color={d.pal.primaryDeep} />
		{#each [-0.17, 0.17] as x}
			<Box size={[0.05, 0.08, 0.1]} position={[x, 0.17, -0.02]} color={d.pal.primaryDeep} />
		{/each}
		<!-- The handset leaves the cradle while the figure is on a call -->
		{#if !d.stage.phoneLifted}
			{#each [-0.17, 0.17] as x}
				<Cyl
					radius={0.065}
					height={0.07}
					position={[x, 0.25, -0.02]}
					rotation={[Math.PI / 2, 0, 0]}
					color={d.pal.primaryDeep}
				/>
			{/each}
			<Box size={[0.4, 0.06, 0.08]} position={[0, 0.27, -0.02]} color={d.pal.primaryDeep} />
		{/if}
	</T.Group>

	<!-- Letter tray with a few envelopes, one propped up -->
	<T.Group position={[0.34, 0.84, 0]}>
		<Box size={[0.5, 0.03, 0.36]} position={[0, 0.015, 0]} color={d.pal.woodDark} />
		<Box size={[0.5, 0.08, 0.03]} position={[0, 0.055, -0.165]} color={d.pal.woodDark} />
		<Box size={[0.03, 0.08, 0.36]} position={[-0.235, 0.055, 0]} color={d.pal.woodDark} />
		<Box size={[0.03, 0.08, 0.36]} position={[0.235, 0.055, 0]} color={d.pal.woodDark} />
		{#each [0.12, -0.2, 0.3] as turn, i}
			<T.Group position={[0, 0.045 + i * 0.022, 0.01]} rotation={[0, turn, 0]}>
				<Box size={[0.38, 0.02, 0.26]} color="#ffffff" />
				<Box size={[0.07, 0.022, 0.07]} position={[0.13, 0, -0.07]} color="#ef4444" />
			</T.Group>
		{/each}
		<T.Group position={[0, 0.22, -0.13]} rotation={[-0.3, 0, 0]}>
			<Box size={[0.36, 0.25, 0.015]} color="#ffffff" />
			<Box size={[0.2, 0.02, 0.017]} position={[-0.03, 0.01, 0]} color={d.pal.metal} />
			<Box size={[0.14, 0.02, 0.017]} position={[-0.06, -0.04, 0]} color={d.pal.metal} />
			<Box size={[0.07, 0.07, 0.017]} position={[0.12, 0.07, 0]} color={d.pal.tertiary} />
		</T.Group>
	</T.Group>
</Hotspot>
