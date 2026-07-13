<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/components/ui';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { profile } = data;

	const _id = profile?._id;

	type Experience = {
		title: string;
		date: string;
		company: string;
		location: string;
		delegation: string;
	};

	let experiences: Experience[] = $state(
		(profile?.experiences || []).map((exp: any) => ({
			title: exp.title || '',
			date: exp.date || '',
			company: exp.company || '',
			location: exp.location || '',
			delegation: exp.delegation || ''
		}))
	);

	let isSaving = $state(false);

	const addExperience = () => {
		experiences = [...experiences, { title: '', date: '', company: '', location: '', delegation: '' }];
	};

	const removeExperience = (index: number) => {
		experiences = experiences.filter((_, i) => i !== index);
	};

	const moveExperience = (index: number, direction: number) => {
		const target = index + direction;
		if (target < 0 || target >= experiences.length) return;
		const copy = [...experiences];
		[copy[index], copy[target]] = [copy[target], copy[index]];
		experiences = copy;
	};

	const handleSave = async () => {
		const cart = experiences.filter((exp) => exp.title.trim());

		isSaving = true;
		try {
			const response = await fetch('/api/admin/experiences/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ _id, cart })
			});
			const result = await response.json();
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
			<h1 class="h3">Work Experience</h1>
			<p class="opacity-60 text-sm">
				Your public timeline shows these in reverse order — the bottom entry here appears first.
			</p>
		</div>
		<button type="button" class="btn btn-primary" onclick={addExperience}
			>+ Add Experience</button
		>
	</header>

	{#if experiences.length === 0}
		<div class="card p-10 text-center space-y-3">
			<p class="opacity-60">No experiences yet. Add your first role to build your timeline.</p>
			<button type="button" class="btn btn-primary" onclick={addExperience}
				>+ Add Experience</button
			>
		</div>
	{:else}
		<div class="space-y-4">
			{#each experiences as exp, i}
				<div class="card p-5">
					<div class="flex items-center justify-between mb-3">
						<span class="badge badge-soft-primary">#{i + 1}</span>
						<div class="flex gap-1">
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-ghost"
								title="Move up"
								disabled={i === 0}
								onclick={() => moveExperience(i, -1)}>↑</button
							>
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-ghost"
								title="Move down"
								disabled={i === experiences.length - 1}
								onclick={() => moveExperience(i, 1)}>↓</button
							>
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-error"
								title="Remove"
								onclick={() => removeExperience(i)}>✕</button
							>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label class="label">
							<span class="text-sm opacity-70">Job Title</span>
							<input
								class="input"
								type="text"
								placeholder="e.g. Lead Developer"
								bind:value={exp.title}
							/>
						</label>
						<label class="label">
							<span class="text-sm opacity-70">Date</span>
							<input
								class="input"
								type="text"
								placeholder="e.g. Jan 2020 - Present"
								bind:value={exp.date}
							/>
						</label>
						<label class="label">
							<span class="text-sm opacity-70">Company</span>
							<input class="input" type="text" placeholder="Company name" bind:value={exp.company} />
						</label>
						<label class="label">
							<span class="text-sm opacity-70">Location</span>
							<input
								class="input"
								type="text"
								placeholder="e.g. Roxas City, Philippines"
								bind:value={exp.location}
							/>
						</label>
						<label class="label md:col-span-2">
							<span class="text-sm opacity-70">Responsibilities</span>
							<textarea
								class="textarea"
								rows="3"
								placeholder="What you did and delivered in this role"
								bind:value={exp.delegation}></textarea>
						</label>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex gap-4 justify-end sticky bottom-4">
		<button type="button" class="btn btn-ghost" onclick={() => goto('/dashboard/')}>Cancel</button>
		<button
			type="button"
			class="btn btn-success"
			disabled={isSaving}
			onclick={handleSave}>{isSaving ? 'Saving…' : 'Save Experiences'}</button
		>
	</div>
</div>
