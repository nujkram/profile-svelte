<script lang="ts">
	let {
		checked = $bindable(false),
		name = '',
		disabled = false,
		label = ''
	}: {
		checked?: boolean;
		name?: string;
		disabled?: boolean;
		label?: string;
	} = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label || undefined}
	{disabled}
	class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
		{checked ? 'bg-primary-600' : 'bg-surface-400 dark:bg-surface-600'}"
	onclick={() => (checked = !checked)}
>
	<span
		class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
			{checked ? 'translate-x-6' : 'translate-x-1'}"
	></span>
</button>
{#if name}
	<input type="hidden" {name} value={checked} />
{/if}
