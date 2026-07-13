<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/components/ui';
	import { readImageResized } from '$lib/utils/imageHelper';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { profile } = data;

	const _id = profile?._id;

	type Testimonial = {
		message: string;
		name: string;
		position: string;
		company: string;
		image: string;
	};

	let testimonials: Testimonial[] = $state(
		(profile?.testimonials || []).map((item: any) => ({
			message: item.message || '',
			name: item.name || '',
			position: item.position || '',
			company: item.company || '',
			image: item.image || item.src || ''
		}))
	);

	let isSaving = $state(false);

	const addTestimonial = () => {
		testimonials = [
			...testimonials,
			{ message: '', name: '', position: '', company: '', image: '' }
		];
	};

	const removeTestimonial = (index: number) => {
		testimonials = testimonials.filter((_, i) => i !== index);
	};

	const moveTestimonial = (index: number, direction: number) => {
		const target = index + direction;
		if (target < 0 || target >= testimonials.length) return;
		const copy = [...testimonials];
		[copy[index], copy[target]] = [copy[target], copy[index]];
		testimonials = copy;
	};

	const handleImageUpload = async (event: Event, index: number) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		testimonials[index].image = await readImageResized(file, 256);
	};

	const initials = (name: string) =>
		name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');

	const handleSave = async () => {
		const cart = testimonials
			.map((item) => ({
				message: item.message.trim(),
				name: item.name.trim(),
				position: item.position.trim(),
				company: item.company.trim(),
				image: item.image.trim()
			}))
			.filter((item) => item.message && item.name);

		isSaving = true;
		try {
			const response = await fetch('/api/admin/testimonials/update', {
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
			<h1 class="h3">Testimonials</h1>
			<p class="opacity-60 text-sm">
				What colleagues and clients say about you — shown as a carousel on your public profile.
			</p>
		</div>
		<button type="button" class="btn btn-primary" onclick={addTestimonial}>+ Add Testimonial</button
		>
	</header>

	{#if testimonials.length === 0}
		<div class="card p-10 text-center space-y-3">
			<p class="opacity-60">
				No testimonials yet. Add a recommendation from someone you've worked with.
			</p>
			<button type="button" class="btn btn-primary" onclick={addTestimonial}
				>+ Add Testimonial</button
			>
		</div>
	{:else}
		<div class="space-y-4">
			{#each testimonials as testimonial, i}
				<div class="card p-5">
					<div class="flex items-center justify-between mb-3">
						<span class="badge badge-soft-primary">#{i + 1}</span>
						<div class="flex gap-1">
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-ghost"
								title="Move up"
								disabled={i === 0}
								onclick={() => moveTestimonial(i, -1)}>↑</button
							>
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-ghost"
								title="Move down"
								disabled={i === testimonials.length - 1}
								onclick={() => moveTestimonial(i, 1)}>↓</button
							>
							<button
								type="button"
								class="btn-icon btn-icon-sm btn-icon-error"
								title="Remove"
								onclick={() => removeTestimonial(i)}>✕</button
							>
						</div>
					</div>

					<div class="flex flex-col sm:flex-row gap-4">
						<!-- Avatar + upload -->
						<div class="flex flex-col items-center gap-2 shrink-0">
							{#if testimonial.image}
								<img
									src={testimonial.image}
									alt={testimonial.name}
									class="w-16 h-16 rounded-full object-cover ring-2 ring-primary-500/40"
								/>
							{:else}
								<div
									class="w-16 h-16 rounded-full flex items-center justify-center bg-primary-500/15 text-primary-600 dark:text-primary-300 font-bold"
								>
									{initials(testimonial.name) || '?'}
								</div>
							{/if}
							<label class="btn btn-ghost btn-icon-sm text-xs cursor-pointer !px-2 !py-1">
								Photo
								<input
									type="file"
									accept="image/*"
									class="hidden"
									onchange={(event) => handleImageUpload(event, i)}
								/>
							</label>
						</div>

						<div class="flex-1 space-y-2">
							<label class="label">
								<span class="text-sm opacity-70">Testimonial</span>
								<textarea
									class="textarea"
									rows="4"
									placeholder="What they said about working with you"
									bind:value={testimonial.message}
								></textarea>
							</label>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-2">
								<label class="label">
									<span class="text-sm opacity-70">Name</span>
									<input
										class="input"
										type="text"
										placeholder="Jane Doe"
										bind:value={testimonial.name}
									/>
								</label>
								<label class="label">
									<span class="text-sm opacity-70">Position</span>
									<input
										class="input"
										type="text"
										placeholder="Project Manager"
										bind:value={testimonial.position}
									/>
								</label>
								<label class="label">
									<span class="text-sm opacity-70">Company</span>
									<input
										class="input"
										type="text"
										placeholder="Company name"
										bind:value={testimonial.company}
									/>
								</label>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex gap-4 justify-end sticky bottom-4">
		<button type="button" class="btn btn-ghost" onclick={() => goto('/dashboard/')}>Cancel</button>
		<button type="button" class="btn btn-success" disabled={isSaving} onclick={handleSave}
			>{isSaving ? 'Saving…' : 'Save Testimonials'}</button
		>
	</div>
</div>
