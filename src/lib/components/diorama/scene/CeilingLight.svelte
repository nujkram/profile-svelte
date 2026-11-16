<script lang="ts">
	import { T } from '@threlte/core';
	import { getDiorama } from '../theme.svelte';
	import Cyl from './Cyl.svelte';

	const d = getDiorama();

	// Overhead, at the height of the wall tops. The cutaway has no ceiling, so the lamp simply
	// sits where one would be. Slightly back from centre so it reads against the corner of the
	// walls instead of covering the desk.
	const X = -0.5;
	const Y = 4;
	const Z = -0.5;
	const on = $derived(d.lightOn);
</script>

<!-- A plain flush ceiling lamp: base plate and a frosted dome -->
<T.Group position={[X, Y, Z]}>
	<!-- The plate is narrower than the dome so its glow shows from the camera above -->
	<Cyl radius={0.26} height={0.06} segments={32} color={d.pal.paper} />
	<T.Mesh position={[0, -0.03, 0]} rotation={[Math.PI, 0, 0]} scale={[1, 0.55, 1]}>
		<T.SphereGeometry args={[0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
		<T.MeshStandardMaterial
			color={on ? '#fff6d8' : d.pal.metal}
			emissive={d.pal.lamp}
			emissiveIntensity={on ? 1.6 : 0}
		/>
	</T.Mesh>
	{#if on}
		<!-- By day it only adds a little warmth; at night it lights the room -->
		<T.PointLight
			position={[0, -0.5, 0]}
			color={d.pal.lamp}
			intensity={d.pal.dark ? 110 : 16}
			decay={1.7}
		/>
	{/if}
</T.Group>
