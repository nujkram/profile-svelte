<script lang="ts">
	import { T } from '@threlte/core';
	import { yearOf, type Experience } from '../sections';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Hotspot from './Hotspot.svelte';
	import Label from './Label.svelte';

	let { experiences }: { experiences: Experience[] } = $props();

	const d = getDiorama();

	const LENGTH = 3.4;
	// Newest first, matching the home page; the wall has room for seven.
	const pins = $derived([...experiences].reverse().slice(0, 7));
	const xAt = (i: number) =>
		pins.length < 2 ? 0 : LENGTH / 2 - 0.3 - (i * (LENGTH - 0.6)) / (pins.length - 1);
</script>

<!-- Rotated so the group's front faces into the room from the left wall -->
<Hotspot
	id="experience"
	label="Experience"
	position={[-3.97, 2.65, -1.6]}
	rotation={[0, Math.PI / 2, 0]}
	labelPosition={[0, 0.95, 0.1]}
>
	<Box size={[LENGTH, 0.05, 0.04]} position={[0, 0, 0.02]} color={d.pal.metal} />
	{#each pins as pin, i}
		{@const up = i % 2 === 0}
		<T.Group position={[xAt(i), 0, 0.04]}>
			<T.Mesh castShadow>
				<T.SphereGeometry args={[0.09, 16, 12]} />
				<T.MeshStandardMaterial color={up ? d.pal.primary : d.pal.tertiary} roughness={0.5} />
			</T.Mesh>
			<Box size={[0.02, 0.2, 0.02]} position={[0, up ? 0.15 : -0.15, 0]} color={d.pal.metal} />
			<Box size={[0.44, 0.3, 0.02]} position={[0, up ? 0.4 : -0.4, 0]} color={d.pal.paper} />
			<Box
				size={[0.3, 0.04, 0.025]}
				position={[-0.04, up ? 0.46 : -0.34, 0]}
				color={up ? d.pal.primary : d.pal.tertiary}
			/>
			<Box size={[0.34, 0.03, 0.025]} position={[0, up ? 0.38 : -0.42, 0]} color={d.pal.metal} />
			{#if yearOf(pin.date)}
				<Label text={yearOf(pin.date)} position={[0, up ? -0.22 : 0.22, 0.05]} height={0.17} />
			{/if}
		</T.Group>
	{/each}
</Hotspot>
