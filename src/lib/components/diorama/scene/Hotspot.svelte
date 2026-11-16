<script lang="ts">
	import type { Snippet } from 'svelte';
	import { T, useThrelte } from '@threlte/core';
	import type { SectionId, Vec3 } from '../sections';
	import { getDiorama } from '../theme.svelte';
	import Label from './Label.svelte';

	let {
		id,
		position = [0, 0, 0],
		rotation = [0, 0, 0],
		label,
		labelPosition = [0, 1, 0],
		grow = true,
		children
	}: {
		id: SectionId;
		position?: Vec3;
		rotation?: Vec3;
		/** Omit for a second object that belongs to an already-labelled section. */
		label?: string;
		labelPosition?: Vec3;
		/** Swell slightly on hover. Turn off for content that moves away from the origin. */
		grow?: boolean;
		/** `lit` is true while hovered or while this section is open. */
		children: Snippet<[{ lit: boolean }]>;
	} = $props();

	const d = getDiorama();
	const { dom } = useThrelte();

	let hovered = $state(false);
	const lit = $derived(hovered || d.active === id);

	const setHover = (value: boolean) => {
		hovered = value;
		dom.style.cursor = value ? 'pointer' : '';
	};

	$effect(() => () => {
		dom.style.cursor = '';
	});
</script>

<!-- A real click (not a drag) that lands on no hotspot reports a miss here first, closing the
     panel; if another hotspot was hit, its onclick then opens that section -->
<T.Group
	{position}
	{rotation}
	scale={hovered && grow ? 1.05 : 1}
	onclick={(event: { stopPropagation: () => void }) => {
		event.stopPropagation();
		d.select(id);
	}}
	onpointermissed={() => d.close()}
	onpointerenter={() => setHover(true)}
	onpointerleave={() => setHover(false)}
>
	{@render children({ lit })}
	{#if label}
		<Label text={label} position={labelPosition} height={d.labelHeight} fixed highlighted={lit} />
	{/if}
</T.Group>
