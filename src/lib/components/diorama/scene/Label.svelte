<script lang="ts">
	import { T } from '@threlte/core';
	import type { Vec3 } from '../sections';
	import { labelTexture } from '../textures';
	import { getDiorama } from '../theme.svelte';

	let {
		text,
		position = [0, 0, 0],
		height = 0.36,
		highlighted = false,
		fixed = false
	}: {
		text: string;
		position?: Vec3;
		/** World units, or a fraction of the view when `fixed`. */
		height?: number;
		highlighted?: boolean;
		/** Keep the same on-screen size however far away the label is. */
		fixed?: boolean;
	} = $props();

	const d = getDiorama();

	const label = $derived(
		labelTexture(
			text,
			highlighted ? d.pal.primary : d.pal.labelBg,
			highlighted ? '#ffffff' : d.pal.labelFg
		)
	);

	$effect(() => {
		const { texture } = label;
		return () => texture.dispose();
	});
</script>

<!-- Drawn on top of everything so a label is never hidden behind furniture -->
<T.Sprite {position} scale={[height * label.aspect, height, 1]} renderOrder={10}>
	<T.SpriteMaterial
		map={label.texture}
		depthTest={false}
		toneMapped={false}
		sizeAttenuation={!fixed}
	/>
</T.Sprite>
