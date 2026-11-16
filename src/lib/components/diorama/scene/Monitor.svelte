<script lang="ts">
	import { T } from '@threlte/core';
	import type { Project } from '../sections';
	import { screenTexture } from '../textures';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Cyl from './Cyl.svelte';
	import Hotspot from './Hotspot.svelte';

	let { projects, interactive }: { projects: Project[]; interactive: boolean } = $props();

	const d = getDiorama();

	const titles = $derived(projects.map((project) => project.title || '').filter(Boolean));
	const screen = $derived(screenTexture(titles, d.pal.screen, d.pal.tertiary, d.pal.primary));

	$effect(() => {
		const texture = screen;
		return () => texture.dispose();
	});
</script>

{#snippet monitor()}
	<Cyl radius={0.26} height={0.04} position={[0, 0.02, 0]} color={d.pal.plastic} />
	<Box size={[0.08, 0.34, 0.06]} position={[0, 0.2, -0.02]} color={d.pal.plastic} />
	<Box size={[1.5, 0.92, 0.08]} position={[0, 0.8, 0]} color={d.pal.plastic} />
	<T.Mesh position={[0, 0.8, 0.045]}>
		<T.PlaneGeometry args={[1.38, 0.8]} />
		<T.MeshBasicMaterial map={screen} toneMapped={false} />
	</T.Mesh>
	{#if d.pal.dark}
		<T.PointLight
			position={[0, 0.8, 0.7]}
			color={d.pal.tertiary}
			intensity={2.5}
			distance={4}
			decay={1.8}
		/>
	{/if}

	<!-- One cartridge per project, stacked beside the screen -->
	{#each projects.slice(0, 6) as _, i}
		<Box
			size={[0.46, 0.08, 0.32]}
			position={[1.2, 0.04 + i * 0.085, 0.25]}
			rotation={[0, ((i * 37) % 11) * 0.05 - 0.25, 0]}
			color={d.pal.books[i % d.pal.books.length]}
		/>
	{/each}
{/snippet}

{#if interactive}
	<Hotspot
		id="projects"
		label="Projects"
		position={[-1.15, 1.05, -3.5]}
		labelPosition={[0, 1.5, 0]}
	>
		{@render monitor()}
	</Hotspot>
{:else}
	<T.Group position={[-1.15, 1.05, -3.5]}>
		{@render monitor()}
	</T.Group>
{/if}
