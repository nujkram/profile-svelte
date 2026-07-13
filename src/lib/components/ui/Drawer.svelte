<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { trapFocus } from '$lib/actions';

	let {
		open = $bindable(false),
		width = 'w-24',
		children
	}: {
		open?: boolean;
		width?: string;
		children: Snippet;
	} = $props();

	$effect(() => {
		if (!open) return;

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') open = false;
		};

		document.addEventListener('keydown', handleKeydown);
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = '';
		};
	});
</script>

{#if open}
	<div class="fixed inset-0 z-50">
		<button
			class="absolute inset-0 h-full w-full cursor-default bg-surface-950/60 backdrop-blur-sm"
			transition:fade={{ duration: 200 }}
			aria-label="Close menu"
			onclick={() => (open = false)}
		></button>
		<aside
			class="absolute inset-y-0 left-0 {width} border-r border-surface-700/50 bg-surface-100 dark:bg-surface-900"
			transition:fly={{ x: -96, duration: 250 }}
			use:trapFocus
		>
			{@render children()}
		</aside>
	</div>
{/if}
