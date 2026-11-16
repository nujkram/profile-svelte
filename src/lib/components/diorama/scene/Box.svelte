<script lang="ts">
	import { T } from '@threlte/core';
	import type { Vec3 } from '../sections';

	let {
		size,
		position = [0, 0, 0],
		rotation = [0, 0, 0],
		color,
		emissive = '#000000',
		emissiveIntensity = 0,
		roughness = 0.85
	}: {
		size: Vec3;
		position?: Vec3;
		rotation?: Vec3;
		color: string;
		emissive?: string;
		emissiveIntensity?: number;
		roughness?: number;
	} = $props();
</script>

<T.Mesh {position} {rotation} castShadow receiveShadow>
	<T.BoxGeometry args={size} />
	<T.MeshStandardMaterial {color} {roughness} {emissive} {emissiveIntensity} />
</T.Mesh>
