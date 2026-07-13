<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';

	export let data: any;
	const { profile } = data;

	const _id = profile?._id;

	type SocialLink = { name: string; icon: string; link: string };

	let socials: SocialLink[] = (profile?.social || []).map((item: any) => ({
		name: item.name || '',
		icon: item.icon || '',
		link: item.link || ''
	}));

	let isSaving = false;

	const toastStore = getToastStore();

	const addSocial = () => {
		socials = [...socials, { name: '', icon: '', link: '' }];
	};

	const removeSocial = (index: number) => {
		socials = socials.filter((_, i) => i !== index);
	};

	const moveSocial = (index: number, direction: number) => {
		const target = index + direction;
		if (target < 0 || target >= socials.length) return;
		const copy = [...socials];
		[copy[index], copy[target]] = [copy[target], copy[index]];
		socials = copy;
	};

	const handleSave = async () => {
		const cart = socials
			.map((item) => ({
				name: item.name.trim(),
				icon: item.icon.trim(),
				link: item.link.trim()
			}))
			.filter((item) => item.name);

		isSaving = true;
		try {
			const response = await fetch('/api/admin/social/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ _id, cart })
			});
			const result = await response.json();
			const toastSettings: ToastSettings = { message: result.message, timeout: 5000 };
			toastStore.trigger(toastSettings);
			goto('/dashboard/');
		} catch (error: any) {
			toastStore.trigger({
				message: error.message,
				timeout: 5000,
				background: 'variant-filled-error'
			});
			console.error(error);
		} finally {
			isSaving = false;
		}
	};
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="h3">Social Links</h1>
			<p class="opacity-60 text-sm">
				Shown in your profile hero so visitors can reach you. Paste an SVG from
				<a
					href="https://fontawesome.com/icons"
					target="_blank"
					rel="noopener noreferrer"
					class="anchor">Font Awesome</a
				> into the icon field.
			</p>
		</div>
		<button type="button" class="btn variant-filled-primary" on:click={addSocial}>+ Add Link</button>
	</header>

	{#if socials.length === 0}
		<div class="card p-10 text-center space-y-3">
			<p class="opacity-60">No social links yet. Add LinkedIn, GitHub, or anywhere else you're active.</p>
			<button type="button" class="btn variant-filled-primary" on:click={addSocial}>+ Add Link</button>
		</div>
	{:else}
		<div class="space-y-3">
			{#each socials as social, i}
				<div class="card p-4 flex flex-col sm:flex-row gap-4 sm:items-start">
					<!-- Icon preview -->
					<div
						class="skill-icon-wrapper shrink-0 self-center sm:self-start !cursor-default w-14 h-14 flex items-center justify-center rounded-token bg-surface-500/10"
						title={social.name || 'Preview'}
					>
						{#if social.icon}
							{@html social.icon}
						{:else}
							<span class="opacity-30 text-2xl">?</span>
						{/if}
					</div>

					<div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
						<label class="label">
							<span class="text-sm opacity-70">Name</span>
							<input class="input" type="text" placeholder="e.g. LinkedIn" bind:value={social.name} />
						</label>
						<label class="label">
							<span class="text-sm opacity-70">Link</span>
							<input
								class="input"
								type="url"
								placeholder="https://www.linkedin.com/in/you"
								bind:value={social.link}
							/>
						</label>
						<label class="label md:col-span-2">
							<span class="text-sm opacity-70">SVG Icon</span>
							<textarea
								class="textarea font-mono text-xs"
								rows="2"
								placeholder="<svg ...>...</svg>"
								bind:value={social.icon}
							/>
						</label>
					</div>

					<div class="flex sm:flex-col gap-1 justify-end shrink-0">
						<button
							type="button"
							class="btn-icon btn-icon-sm variant-soft"
							title="Move up"
							disabled={i === 0}
							on:click={() => moveSocial(i, -1)}>↑</button
						>
						<button
							type="button"
							class="btn-icon btn-icon-sm variant-soft"
							title="Move down"
							disabled={i === socials.length - 1}
							on:click={() => moveSocial(i, 1)}>↓</button
						>
						<button
							type="button"
							class="btn-icon btn-icon-sm variant-soft-error"
							title="Remove"
							on:click={() => removeSocial(i)}>✕</button
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex gap-4 justify-end sticky bottom-4">
		<button type="button" class="btn variant-soft" on:click={() => goto('/dashboard/')}>Cancel</button>
		<button
			type="button"
			class="btn variant-filled-success"
			disabled={isSaving}
			on:click={handleSave}>{isSaving ? 'Saving…' : 'Save Links'}</button
		>
	</div>
</div>
