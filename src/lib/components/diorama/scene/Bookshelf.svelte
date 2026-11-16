<script lang="ts">
	import { T } from '@threlte/core';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Cyl from './Cyl.svelte';
	import Hotspot from './Hotspot.svelte';

	let { degrees }: { degrees: number } = $props();

	const d = getDiorama();

	const SHELVES = [0.1, 0.78, 1.46];

	// Deterministic "random" spines so the shelf looks the same on every visit.
	const books = SHELVES.flatMap((y, shelf) => {
		const row = [];
		let x = -0.6;
		for (let i = 0; x < 0.5; i++) {
			const seed = (shelf * 7 + i * 13) % 10;
			const width = 0.09 + (seed % 4) * 0.02;
			const height = 0.4 + (seed % 5) * 0.04;
			// Leave a gap on each shelf rather than filling it edge to edge
			if (seed !== 3) row.push({ x: x + width / 2, y: y + 0.03 + height / 2, width, height, seed });
			x += width + 0.012;
		}
		return row;
	});
</script>

<Hotspot id="education" label="Education" position={[2.85, 0, -3.62]} labelPosition={[0, 3.05, 0]}>
	<!-- Carcass -->
	<Box size={[1.5, 2.2, 0.05]} position={[0, 1.1, -0.2]} color={d.pal.woodDark} />
	<Box size={[0.06, 2.2, 0.45]} position={[-0.72, 1.1, 0]} color={d.pal.wood} />
	<Box size={[0.06, 2.2, 0.45]} position={[0.72, 1.1, 0]} color={d.pal.wood} />
	{#each [...SHELVES, 2.17] as y}
		<Box size={[1.5, 0.06, 0.45]} position={[0, y, 0]} color={d.pal.wood} />
	{/each}

	{#each books as book}
		<Box
			size={[book.width, book.height, 0.3]}
			position={[book.x, book.y, 0.02]}
			color={d.pal.books[book.seed % d.pal.books.length]}
		/>
	{/each}

	<!-- One framed diploma per degree, and a mortarboard, on top -->
	{#each Array(degrees) as _, i}
		<T.Group position={[-0.42 + i * 0.5, 2.44, -0.05]} rotation={[-0.18, 0, 0]}>
			<Box size={[0.42, 0.34, 0.03]} color={d.pal.woodDark} />
			<Box size={[0.34, 0.26, 0.035]} color={d.pal.paper} />
			<Box size={[0.2, 0.025, 0.04]} position={[0, 0.04, 0]} color={d.pal.primary} />
			<Cyl
				radius={0.035}
				height={0.012}
				position={[0.09, -0.07, 0.02]}
				rotation={[Math.PI / 2, 0, 0]}
				color="#f59e0b"
			/>
		</T.Group>
	{/each}
	<T.Group position={[0.48, 2.2, 0.02]} rotation={[0, 0.5, 0]}>
		<Cyl radius={0.13} height={0.12} position={[0, 0.06, 0]} color={d.pal.plastic} />
		<Box size={[0.4, 0.03, 0.4]} position={[0, 0.135, 0]} color={d.pal.plastic} />
		<Box size={[0.02, 0.16, 0.02]} position={[0.18, 0.06, 0.18]} color="#f59e0b" />
	</T.Group>
</Hotspot>
