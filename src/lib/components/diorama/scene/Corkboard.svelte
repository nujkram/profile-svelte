<script lang="ts">
	import { T } from '@threlte/core';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Hotspot from './Hotspot.svelte';

	let { count }: { count: number } = $props();

	const d = getDiorama();

	const notes = $derived(
		Array.from({ length: Math.min(count, 6) }, (_, i) => ({
			x: -0.46 + (i % 3) * 0.46,
			y: 0.24 - Math.floor(i / 3) * 0.48,
			tilt: (((i * 5) % 7) - 3) * 0.05
		}))
	);
</script>

<Hotspot
	id="testimonials"
	label="Testimonials"
	position={[-3.97, 2.5, 2.2]}
	rotation={[0, Math.PI / 2, 0]}
	labelPosition={[0, 0.9, 0.1]}
>
	<Box size={[1.64, 1.24, 0.04]} color={d.pal.woodDark} />
	<Box size={[1.5, 1.1, 0.06]} color={d.pal.cork} />

	{#each notes as note, i}
		<T.Group position={[note.x, note.y, 0.04]} rotation={[0, 0, note.tilt]}>
			<Box size={[0.38, 0.38, 0.012]} color={d.pal.notes[i % d.pal.notes.length]} />
			{#each [0.08, 0, -0.08] as line, j}
				<Box
					size={[j === 2 ? 0.16 : 0.26, 0.022, 0.016]}
					position={[j === 2 ? -0.05 : 0, line - 0.03, 0]}
					color="#64748b"
				/>
			{/each}
			<T.Mesh position={[0, 0.15, 0.02]} castShadow>
				<T.SphereGeometry args={[0.03, 10, 8]} />
				<T.MeshStandardMaterial color="#ef4444" roughness={0.4} />
			</T.Mesh>
		</T.Group>
	{/each}
</Hotspot>
