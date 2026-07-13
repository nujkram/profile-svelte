<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/components/ui';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { profile } = data;

	const _id = profile?._id;

	type Skill = { name: string; icon: string };

	let skills: Skill[] = $state(
		(profile?.skills || []).map((skill: any) => ({
			name: skill.name || '',
			icon: skill.icon || ''
		}))
	);

	let isSaving = $state(false);

	const addSkill = () => {
		skills = [...skills, { name: '', icon: '' }];
	};

	const removeSkill = (index: number) => {
		skills = skills.filter((_, i) => i !== index);
	};

	const moveSkill = (index: number, direction: number) => {
		const target = index + direction;
		if (target < 0 || target >= skills.length) return;
		const copy = [...skills];
		[copy[index], copy[target]] = [copy[target], copy[index]];
		skills = copy;
	};

	const handleSave = async () => {
		const cart = skills
			.map((skill) => ({ name: skill.name.trim(), icon: skill.icon.trim() }))
			.filter((skill) => skill.name);

		isSaving = true;
		try {
			const response = await fetch('/api/admin/skills/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ _id, cart, baseUpdatedAt: profile?.updatedAt })
			});
			const result = await response.json();
			if (!response.ok) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			goto('/dashboard/');
		} catch (error: any) {
			toast.error(error.message);
			console.error(error);
		} finally {
			isSaving = false;
		}
	};
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="h3">Skills</h1>
			<p class="opacity-60 text-sm">
				These appear as icons on your public profile. Paste an SVG from
				<a
					href="https://fontawesome.com/icons"
					target="_blank"
					rel="noopener noreferrer"
					class="anchor">Font Awesome</a
				>
				or
				<a href="https://simpleicons.org/" target="_blank" rel="noopener noreferrer" class="anchor"
					>Simple Icons</a
				> into the icon field.
			</p>
		</div>
		<button type="button" class="btn btn-primary" onclick={addSkill}>+ Add Skill</button>
	</header>

	{#if skills.length === 0}
		<div class="card p-10 text-center space-y-3">
			<p class="opacity-60">No skills yet. Add your first one to show it off on your profile.</p>
			<button type="button" class="btn btn-primary" onclick={addSkill}>+ Add Skill</button>
		</div>
	{:else}
		<div class="space-y-3">
			{#each skills as skill, i}
				<div class="card p-4 flex flex-col sm:flex-row gap-4 sm:items-start">
					<!-- Icon preview -->
					<div
						class="skill-icon-wrapper shrink-0 self-center sm:self-start !cursor-default w-14 h-14 flex items-center justify-center rounded-lg bg-surface-500/10"
						title={skill.name || 'Preview'}
					>
						{#if skill.icon}
							{@html skill.icon}
						{:else}
							<span class="opacity-30 text-2xl">?</span>
						{/if}
					</div>

					<div class="flex-1 grid grid-cols-1 gap-2">
						<label class="label">
							<span class="text-sm opacity-70">Name</span>
							<input class="input" type="text" placeholder="e.g. Svelte" bind:value={skill.name} />
						</label>
						<label class="label">
							<span class="text-sm opacity-70">SVG Icon</span>
							<textarea
								class="textarea font-mono text-xs"
								rows="2"
								placeholder="<svg ...>...</svg>"
								bind:value={skill.icon}
							></textarea>
						</label>
					</div>

					<div class="flex sm:flex-col gap-1 justify-end shrink-0">
						<button
							type="button"
							class="btn-icon btn-icon-sm btn-icon-ghost"
							title="Move up"
							disabled={i === 0}
							onclick={() => moveSkill(i, -1)}>↑</button
						>
						<button
							type="button"
							class="btn-icon btn-icon-sm btn-icon-ghost"
							title="Move down"
							disabled={i === skills.length - 1}
							onclick={() => moveSkill(i, 1)}>↓</button
						>
						<button
							type="button"
							class="btn-icon btn-icon-sm btn-icon-error"
							title="Remove"
							onclick={() => removeSkill(i)}>✕</button
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex gap-4 justify-end sticky bottom-4">
		<button type="button" class="btn btn-ghost" onclick={() => goto('/dashboard/')}>Cancel</button>
		<button type="button" class="btn btn-success" disabled={isSaving} onclick={handleSave}
			>{isSaving ? 'Saving…' : 'Save Skills'}</button
		>
	</div>
</div>
