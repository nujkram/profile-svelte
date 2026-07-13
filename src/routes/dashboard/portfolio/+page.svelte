<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/components/ui';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { profile } = data;

	const _id = profile?._id;

	type Project = {
		title: string;
		description: string;
		tech: string;
		link: string;
		repo: string;
	};

	let projects: Project[] = $state(
		(profile?.portfolio || []).map((project: any) => ({
			title: project.title || '',
			description: project.description || '',
			tech: project.tech || '',
			link: project.link || '',
			repo: project.repo || ''
		}))
	);

	let isSaving = $state(false);

	const addProject = () => {
		projects = [...projects, { title: '', description: '', tech: '', link: '', repo: '' }];
	};

	const removeProject = (index: number) => {
		projects = projects.filter((_, i) => i !== index);
	};

	const moveProject = (index: number, direction: number) => {
		const target = index + direction;
		if (target < 0 || target >= projects.length) return;
		const copy = [...projects];
		[copy[index], copy[target]] = [copy[target], copy[index]];
		projects = copy;
	};

	const handleSave = async () => {
		const cart = projects
			.map((project) => ({
				title: project.title.trim(),
				description: project.description.trim(),
				tech: project.tech.trim(),
				link: project.link.trim(),
				repo: project.repo.trim()
			}))
			.filter((project) => project.title);

		isSaving = true;
		try {
			const response = await fetch('/api/admin/portfolio/update', {
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
			<h1 class="h3">Projects</h1>
			<p class="opacity-60 text-sm">
				Shown in the Projects section of your public profile — the first entry here appears first.
			</p>
		</div>
		<button type="button" class="btn btn-primary" onclick={addProject}>+ Add Project</button>
	</header>

	{#if projects.length === 0}
		<div class="card p-10 text-center space-y-3">
			<p class="opacity-60">
				No projects yet. This is the strongest section of a portfolio — add the work you're most
				proud of.
			</p>
			<button type="button" class="btn btn-primary" onclick={addProject}>+ Add Project</button>
		</div>
	{:else}
		<div class="space-y-4">
			{#each projects as project, i}
				<div class="card p-5">
					<div class="flex items-center justify-between mb-3">
						<span class="badge badge-soft-primary">#{i + 1}</span>
						<div class="flex gap-1">
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-ghost"
								title="Move up"
								disabled={i === 0}
								onclick={() => moveProject(i, -1)}>↑</button
							>
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-ghost"
								title="Move down"
								disabled={i === projects.length - 1}
								onclick={() => moveProject(i, 1)}>↓</button
							>
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-error"
								title="Remove"
								onclick={() => removeProject(i)}>✕</button
							>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label class="label">
							<span class="text-sm opacity-70">Title</span>
							<input
								class="input"
								type="text"
								placeholder="e.g. Clinic Management System"
								bind:value={project.title}
							/>
						</label>
						<label class="label">
							<span class="text-sm opacity-70">Tech Stack (comma-separated)</span>
							<input
								class="input"
								type="text"
								placeholder="e.g. SvelteKit, MongoDB, Tailwind"
								bind:value={project.tech}
							/>
						</label>
						<label class="label md:col-span-2">
							<span class="text-sm opacity-70">Description</span>
							<textarea
								class="textarea"
								rows="3"
								placeholder="What it does, who it's for, and what you built"
								bind:value={project.description}
							></textarea>
						</label>
						<label class="label">
							<span class="text-sm opacity-70">Live Link (optional)</span>
							<input
								class="input"
								type="url"
								placeholder="https://example.com"
								bind:value={project.link}
							/>
						</label>
						<label class="label">
							<span class="text-sm opacity-70">Source Code (optional)</span>
							<input
								class="input"
								type="url"
								placeholder="https://github.com/you/repo"
								bind:value={project.repo}
							/>
						</label>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex gap-4 justify-end sticky bottom-4">
		<button type="button" class="btn btn-ghost" onclick={() => goto('/dashboard/')}>Cancel</button>
		<button type="button" class="btn btn-success" disabled={isSaving} onclick={handleSave}
			>{isSaving ? 'Saving…' : 'Save Projects'}</button
		>
	</div>
</div>
