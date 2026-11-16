<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { NeutralToneMapping, PCFShadowMap } from 'three';
	import type { Profile, Section, SectionId } from './sections';
	import World from './scene/World.svelte';

	let {
		profile,
		hasImage,
		sections,
		active,
		reducedMotion,
		onselect
	}: {
		profile: Profile;
		hasImage: boolean;
		sections: Section[];
		active: SectionId | null;
		reducedMotion: boolean;
		onselect: (id: SectionId) => void;
	} = $props();
</script>

<Canvas dpr={[1, 2]} toneMapping={NeutralToneMapping} shadows={PCFShadowMap}>
	<World {profile} {hasImage} {sections} {active} {reducedMotion} {onselect} />
</Canvas>
