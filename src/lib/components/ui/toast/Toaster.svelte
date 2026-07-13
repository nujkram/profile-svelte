<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';
	import { toast, type ToastKind } from './toast.svelte';

	const kindClasses: Record<ToastKind, string> = {
		info: 'border-primary-500/40',
		success: 'border-success-500/60',
		error: 'border-error-500/60'
	};

	const kindIcons: Record<ToastKind, string> = {
		info: 'ℹ',
		success: '✓',
		error: '✕'
	};

	const iconClasses: Record<ToastKind, string> = {
		info: 'bg-primary-500/15 text-primary-500',
		success: 'bg-success-500/15 text-success-500',
		error: 'bg-error-500/15 text-error-500'
	};
</script>

<div
	class="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
	aria-live="polite"
>
	{#each toast.items as item (item.id)}
		<div
			animate:flip={{ duration: 200 }}
			in:fly={{ y: 16, duration: 250 }}
			out:fade={{ duration: 150 }}
			class="card flex items-center gap-3 border-l-4 p-4 shadow-lg {kindClasses[item.kind]}"
			role="status"
		>
			<span
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm {iconClasses[
					item.kind
				]}">{kindIcons[item.kind]}</span
			>
			<p class="flex-1 text-sm">{item.message}</p>
			<button
				type="button"
				class="opacity-40 transition-opacity hover:opacity-100"
				aria-label="Dismiss notification"
				onclick={() => toast.dismiss(item.id)}>✕</button
			>
		</div>
	{/each}
</div>
