<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { NeutralToneMapping, PCFShadowMap } from 'three';
	import type { Profile, Section, SectionId } from './sections';
	import World from './scene/World.svelte';

	let {
		profile,
		sections,
		active,
		reducedMotion,
		lightOn,
		onselect,
		onclose,
		ontogglelight
	}: {
		profile: Profile;
		sections: Section[];
		active: SectionId | null;
		reducedMotion: boolean;
		lightOn: boolean;
		onselect: (id: SectionId) => void;
		onclose: () => void;
		ontogglelight: () => void;
	} = $props();
</script>

<Canvas dpr={[1, 2]} toneMapping={NeutralToneMapping} shadows={PCFShadowMap}>
	<World
		{profile}
		{sections}
		{active}
		{reducedMotion}
		{lightOn}
		{onselect}
		{onclose}
		{ontogglelight}
	/>
</Canvas>
