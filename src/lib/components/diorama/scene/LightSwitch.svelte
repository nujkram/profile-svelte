<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { getDiorama } from '../theme.svelte';
	import Box from './Box.svelte';
	import Label from './Label.svelte';

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

<!-- On the left wall between the phone table and the corkboard. Pressing it must not count as
     a click on empty space, which would close an open panel, so it holds the panel while pressed -->
<T.Group
	position={[-3.97, 1.55, 0.85]}
	rotation={[0, Math.PI / 2, 0]}
	scale={hovered ? 1.15 : 1}
	onpointerdown={() => (d.stage.holdPanel = true)}
	onclick={(event: { stopPropagation: () => void }) => {
		event.stopPropagation();
		d.stage.holdPanel = false;
		d.toggleLight();
	}}
	onpointermissed={() => (d.stage.holdPanel = false)}
	onpointerenter={() => setHover(true)}
	onpointerleave={() => setHover(false)}
>
	<Box size={[0.3, 0.42, 0.03]} color={d.pal.paper} />
	<!-- Rocker: top pressed in when on -->
	<Box
		size={[0.13, 0.22, 0.05]}
		position={[0, 0, 0.025]}
		rotation={[d.lightOn ? -0.28 : 0.28, 0, 0]}
		color={d.lightOn ? d.pal.lamp : d.pal.metal}
		emissive={d.pal.lamp}
		emissiveIntensity={d.lightOn ? 0.5 : 0}
	/>
	<Label
		text={d.lightOn ? 'Light: on' : 'Light: off'}
		position={[0, 0.48, 0.05]}
		height={d.labelHeight * 0.78}
		fixed
		highlighted={hovered}
	/>
</T.Group>
