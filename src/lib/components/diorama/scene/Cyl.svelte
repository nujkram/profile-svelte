<script lang="ts">
	import { T } from '@threlte/core';
	import type { Vec3 } from '../sections';

	let {
		radius,
		radiusTop = radius,
		height,
		segments = 20,
		position = [0, 0, 0],
		rotation = [0, 0, 0],
		color,
		emissive = '#000000',
		emissiveIntensity = 0,
		roughness = 0.85
	}: {
		radius: number;
		radiusTop?: number;
		height: number;
		segments?: number;
		position?: Vec3;
		rotation?: Vec3;
		color: string;
		emissive?: string;
		emissiveIntensity?: number;
		roughness?: number;
	} = $props();
</script>

<T.Mesh {position} {rotation} castShadow receiveShadow>
	<T.CylinderGeometry args={[radiusTop, radius, height, segments]} />
	<T.MeshStandardMaterial {color} {roughness} {emissive} {emissiveIntensity} />
</T.Mesh>
