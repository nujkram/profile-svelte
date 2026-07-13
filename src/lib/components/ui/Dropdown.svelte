<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scale } from 'svelte/transition';
	import { clickOutside } from '$lib/actions';

	let {
		trigger,
		children
	}: {
		trigger: Snippet<[{ open: boolean; toggle: () => void }]>;
		children: Snippet<[{ close: () => void }]>;
	} = $props();

	let open = $state(false);

	const toggle = () => (open = !open);
	const close = () => (open = false);

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') close();
	};
</script>

<div class="relative" use:clickOutside={close} onkeydown={handleKeydown} role="presentation">
	{@render trigger({ open, toggle })}
	{#if open}
		<div
			class="card absolute right-0 top-full z-40 mt-2 min-w-40 p-2 shadow-xl"
			transition:scale={{ start: 0.95, duration: 120 }}
		>
			{@render children({ close })}
		</div>
	{/if}
</div>
