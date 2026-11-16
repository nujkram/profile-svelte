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
		children
	}: {
		id: SectionId;
		position?: Vec3;
		rotation?: Vec3;
		/** Omit for a second object that belongs to an already-labelled section. */
		label?: string;
		labelPosition?: Vec3;
		children: Snippet;
	} = $props();

	const d = getDiorama();
	const { dom } = useThrelte();

	let hovered = $state(false);

	const setHover = (value: boolean) => {
		hovered = value;
		dom.style.cursor = value ? 'pointer' : '';
	};

	$effect(() => () => {
		dom.style.cursor = '';
	});
</script>

<T.Group
	{position}
	{rotation}
	scale={hovered ? 1.05 : 1}
	onclick={(event: { stopPropagation: () => void }) => {
		event.stopPropagation();
		d.select(id);
	}}
	onpointerenter={() => setHover(true)}
	onpointerleave={() => setHover(false)}
>
	{@render children()}
	{#if label}
		<Label
			text={label}
			position={labelPosition}
			height={d.labelHeight}
			fixed
			highlighted={hovered || d.active === id}
		/>
	{/if}
</T.Group>
