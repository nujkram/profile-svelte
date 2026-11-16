<script lang="ts">
	import { fly } from 'svelte/transition';
	import { trapFocus } from '$lib/actions';
	import type { Profile, Section } from './sections';
	import SectionContent from './SectionContent.svelte';

	let {
		profile,
		section,
		reducedMotion,
		onclose
	}: { profile: Profile; section: Section; reducedMotion: boolean; onclose: () => void } = $props();
</script>

<!-- Bottom sheet on phones, side panel from sm up; top offset clears the floating theme toggle -->
<div
	role="dialog"
	aria-labelledby="diorama-panel-title"
	use:trapFocus
	transition:fly={{ y: 24, duration: reducedMotion ? 0 : 220 }}
	class="card absolute inset-x-2 bottom-2 z-20 flex max-h-[54%] flex-col !bg-white/95 shadow-xl backdrop-blur dark:!bg-surface-900/95 sm:inset-x-auto sm:bottom-3 sm:right-3 sm:top-16 sm:max-h-none sm:w-[380px]"
>
	<div class="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
		<h2 id="diorama-panel-title" class="h3 gradient-heading">{section.label}</h2>
		<button
			type="button"
			class="btn-icon btn-icon-sm btn-icon-ghost shrink-0"
			aria-label="Close {section.label}"
			onclick={onclose}>✕</button
		>
	</div>

	<div class="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
		<SectionContent {profile} id={section.id} />
	</div>

	<div class="border-t border-surface-500/20 px-5 py-3">
		<a href="/#{section.id}" class="btn btn-primary w-full">
			{section.id === 'contact' ? 'Send a message' : 'View on portfolio'}
		</a>
	</div>
</div>
