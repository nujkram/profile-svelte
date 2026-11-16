<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import type { Texture } from 'three';
	import { loadPhoto } from '../textures';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Hotspot from './Hotspot.svelte';

	// A small copy of static/family.JPG; the original is 10 MB for a frame a few hundred pixels tall
	const SRC = '/family-frame.jpg';
	const HEIGHT = 0.8;
	const BORDER = 0.08;

	const d = getDiorama();
	const { invalidate } = useThrelte();

	let photo = $state<Texture | null>(null);
	// Portrait until the photo arrives, so the frame doesn't change shape when it loads
	let aspect = $state(2 / 3);
	const width = $derived(HEIGHT * aspect);

	$effect(() => {
		let cancelled = false;
		let loaded: Texture | null = null;
		loadPhoto(SRC).then((result) => {
			if (!result) return;
			if (cancelled) return result.texture.dispose();
			loaded = result.texture;
			photo = result.texture;
			aspect = result.aspect;
			invalidate();
		});
		return () => {
			cancelled = true;
			loaded?.dispose();
		};
	});
</script>

<Hotspot id="about" position={[-0.35, 3.05, -3.97]}>
	<Box size={[width + BORDER * 2, HEIGHT + BORDER * 2, 0.06]} color={d.pal.woodDark} />
	<!-- Keyed so the mesh is rebuilt when the photo arrives; swapping only the material leaves
	     the mesh on three's default one -->
	{#key photo}
		<T.Mesh position={[0, 0, 0.035]}>
			<T.PlaneGeometry args={[width, HEIGHT]} />
			{#if photo}
				<T.MeshBasicMaterial map={photo} toneMapped={false} />
			{:else}
				<T.MeshStandardMaterial color={d.pal.primary} />
			{/if}
		</T.Mesh>
	{/key}
</Hotspot>
