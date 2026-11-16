<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import type { Texture } from 'three';
	import type { Skill } from '../sections';
	import { svgTexture } from '../textures';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Hotspot from './Hotspot.svelte';

	let { skills }: { skills: Skill[] } = $props();

	const d = getDiorama();
	const { invalidate } = useThrelte();

	const COLS = 4;
	const tiles = $derived(skills.slice(0, 12));
	let icons = $state<(Texture | null)[]>([]);

	$effect(() => {
		let cancelled = false;
		let loaded: (Texture | null)[] = [];
		Promise.all(tiles.map((skill) => svgTexture(skill.icon || '', '#0f172a'))).then((textures) => {
			loaded = textures;
			if (cancelled) return textures.forEach((texture) => texture?.dispose());
			icons = textures;
			invalidate();
		});
		return () => {
			cancelled = true;
			loaded.forEach((texture) => texture?.dispose());
		};
	});
</script>

<Hotspot id="skills" label="Skills" position={[-2.7, 2.75, -3.97]} labelPosition={[0, 1, 0.1]}>
	<Box size={[1.84, 1.44, 0.04]} color={d.pal.woodDark} />
	<Box size={[1.7, 1.3, 0.06]} color={d.pal.board} />

	{#each tiles as _, i}
		{@const x = -0.6 + (i % COLS) * 0.4}
		{@const y = 0.4 - Math.floor(i / COLS) * 0.4}
		<T.Group position={[x, y, 0.05]}>
			<Box size={[0.3, 0.3, 0.04]} color={d.pal.paper} />
			<T.Mesh position={[0, 0.19, 0.005]}>
				<T.SphereGeometry args={[0.025, 10, 8]} />
				<T.MeshStandardMaterial color={d.pal.metal} />
			</T.Mesh>
			{#if icons[i]}
				<T.Mesh position={[0, 0, 0.022]}>
					<T.PlaneGeometry args={[0.28, 0.28]} />
					<T.MeshBasicMaterial map={icons[i]} transparent toneMapped={false} />
				</T.Mesh>
			{:else}
				<Box size={[0.14, 0.14, 0.05]} color={d.pal.books[i % d.pal.books.length]} />
			{/if}
		</T.Group>
	{/each}
</Hotspot>
