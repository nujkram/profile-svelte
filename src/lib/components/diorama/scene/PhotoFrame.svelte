<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import type { Texture } from 'three';
	import { squarePhoto } from '../textures';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Hotspot from './Hotspot.svelte';

	let { hasImage }: { hasImage: boolean } = $props();

	const d = getDiorama();
	const { invalidate } = useThrelte();

	let photo = $state<Texture | null>(null);

	$effect(() => {
		if (!hasImage) return;
		let cancelled = false;
		let loaded: Texture | null = null;
		squarePhoto('/profile-image.jpg').then((texture) => {
			if (cancelled) return texture?.dispose();
			loaded = texture;
			photo = texture;
			invalidate();
		});
		return () => {
			cancelled = true;
			loaded?.dispose();
		};
	});
</script>

<Hotspot id="about" position={[-0.35, 3.05, -3.97]}>
	<Box size={[0.86, 0.86, 0.06]} color={d.pal.woodDark} />
	<!-- Keyed so the mesh is rebuilt when the photo arrives; swapping only the material leaves
	     the mesh on three's default one -->
	{#key photo}
		<T.Mesh position={[0, 0, 0.035]}>
			<T.PlaneGeometry args={[0.7, 0.7]} />
			{#if photo}
				<T.MeshBasicMaterial map={photo} toneMapped={false} />
			{:else}
				<T.MeshStandardMaterial color={d.pal.primary} />
			{/if}
		</T.Mesh>
	{/key}
</Hotspot>
