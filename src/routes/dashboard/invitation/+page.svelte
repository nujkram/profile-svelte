<script lang="ts">
	import { format } from 'date-fns';
	import { toast, Toggle } from '$lib/components/ui';

	let { data }: { data: any } = $props();

	type Rsvp = {
		_id: string;
		name: string;
		attending: boolean;
		plusOne: boolean;
		plusOneName: string;
		kids: number;
		updatedAt: string | Date;
	};

	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	let inv = $state(structuredClone(data.invitation));
	// svelte-ignore state_referenced_locally -- intentional initial copy
	let rsvps: Rsvp[] = $state(data.rsvps || []);
	let isSaving = $state(false);

	const going = $derived(rsvps.filter((r) => r.attending));
	const totals = $derived({
		households: going.length,
		adults: going.reduce((sum, r) => sum + 1 + (r.plusOne ? 1 : 0), 0),
		kids: going.reduce((sum, r) => sum + (r.kids || 0), 0),
		declined: rsvps.length - going.length
	});

	const inviteUrl = $derived(
		typeof location === 'undefined' ? '/invite' : `${location.origin}/invite`
	);

	const save = async () => {
		isSaving = true;
		try {
			const response = await fetch('/api/admin/invitation/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(inv)
			});
			const result = await response.json();
			if (!response.ok) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isSaving = false;
		}
	};

	const removeRsvp = async (rsvp: Rsvp) => {
		if (!confirm(`Delete the RSVP from ${rsvp.name}? This cannot be undone.`)) return;
		try {
			const response = await fetch('/api/admin/rsvps/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ _id: rsvp._id })
			});
			const result = await response.json();
			rsvps = rsvps.filter((r) => r._id !== rsvp._id);
			toast.success(result.message);
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(inviteUrl);
			toast.success('Invite link copied');
		} catch {
			toast.error(`Couldn't copy — the link is ${inviteUrl}`);
		}
	};

	const downloadCsv = () => {
		const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
		const rows = [
			['Name', 'Attending', 'Plus-one', 'Plus-one name', 'Kids', 'Updated'],
			...rsvps.map((r) => [
				r.name,
				r.attending ? 'Yes' : 'No',
				r.plusOne ? 'Yes' : 'No',
				r.plusOneName,
				r.kids,
				formatDate(r.updatedAt)
			])
		];
		const csv = rows.map((row) => row.map(cell).join(',')).join('\n');
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = 'rsvps.csv';
		a.click();
		URL.revokeObjectURL(url);
	};

	const formatDate = (value: string | Date) => format(new Date(value), 'MMM d, h:mm a');
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="h3">Birthday Invite</h1>
			<p class="opacity-60 text-sm">
				Edit the event details and track RSVPs for Ada & Jin's celebration.
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<button type="button" class="btn btn-neutral" onclick={copyLink}>Copy invite link</button>
			<a href="/invite" target="_blank" class="btn btn-ghost">View invite ↗</a>
		</div>
	</header>

	<!-- RSVP summary -->
	<section class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		{#each [{ label: 'Households coming', value: totals.households }, { label: 'Adults', value: totals.adults }, { label: 'Kids', value: totals.kids }, { label: 'Declined', value: totals.declined }] as stat}
			<div class="card p-4">
				<p class="text-xs uppercase tracking-wide opacity-60">{stat.label}</p>
				<p class="text-2xl font-semibold">{stat.value}</p>
			</div>
		{/each}
	</section>
	<p class="text-sm opacity-70 -mt-3">
		Total headcount: <strong>{totals.adults + totals.kids}</strong>
	</p>

	<!-- RSVP list -->
	<section class="card p-5 space-y-4">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h2 class="h4">RSVPs ({rsvps.length})</h2>
			<button
				type="button"
				class="btn btn-ghost"
				onclick={downloadCsv}
				disabled={rsvps.length === 0}>Download CSV</button
			>
		</div>
		{#if rsvps.length === 0}
			<p class="opacity-60 text-sm">No RSVPs yet. Share the invite link to get started.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="text-left opacity-60">
						<tr>
							<th class="py-2 pr-3 font-medium">Name</th>
							<th class="py-2 pr-3 font-medium">Coming</th>
							<th class="py-2 pr-3 font-medium">Plus-one</th>
							<th class="py-2 pr-3 font-medium">Kids</th>
							<th class="py-2 pr-3 font-medium">Updated</th>
							<th class="py-2"><span class="sr-only">Actions</span></th>
						</tr>
					</thead>
					<tbody>
						{#each rsvps as rsvp (rsvp._id)}
							<tr class="border-t border-surface-500/15">
								<td class="py-2 pr-3 font-medium">{rsvp.name}</td>
								<td class="py-2 pr-3">
									<span class="badge {rsvp.attending ? 'badge-soft-success' : 'badge-soft-error'}">
										{rsvp.attending ? 'Yes' : 'No'}
									</span>
								</td>
								<td class="py-2 pr-3">{rsvp.plusOne ? rsvp.plusOneName : '—'}</td>
								<td class="py-2 pr-3">{rsvp.attending ? rsvp.kids : '—'}</td>
								<td class="py-2 pr-3 opacity-60 whitespace-nowrap">{formatDate(rsvp.updatedAt)}</td>
								<td class="py-2 text-right">
									<button
										type="button"
										class="btn-icon btn-icon-sm btn-icon-error"
										aria-label="Delete RSVP from {rsvp.name}"
										onclick={() => removeRsvp(rsvp)}>✕</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<!-- Event details editor -->
	<form
		class="card p-5 space-y-6"
		onsubmit={(e) => {
			e.preventDefault();
			save();
		}}
	>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h2 class="h4">Event details</h2>
			<div class="flex items-center gap-3">
				<span class="text-sm opacity-70">Accepting RSVPs</span>
				<Toggle bind:checked={inv.rsvpOpen} label="Accepting RSVPs" />
			</div>
		</div>
		<p class="text-sm opacity-60 -mt-4">Leave a field blank to show "To be announced".</p>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			<label class="label">
				<span>Heading</span>
				<input class="input" type="text" bind:value={inv.title} />
			</label>
			<label class="label">
				<span>RSVP by</span>
				<input class="input" type="text" bind:value={inv.rsvpDeadline} placeholder="e.g. Nov 20" />
			</label>
			<label class="label">
				<span>Date (for countdown)</span>
				<input class="input" type="date" bind:value={inv.date} />
			</label>
			<label class="label">
				<span>Date as shown</span>
				<input class="input" type="text" bind:value={inv.dateText} />
			</label>
		</div>

		<fieldset class="space-y-3">
			<legend class="text-sm font-semibold opacity-80 mb-2">Celebrants</legend>
			{#each inv.kids as kid}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
					<input class="input" type="text" bind:value={kid.name} aria-label="Name" />
					<input class="input" type="text" bind:value={kid.milestone} aria-label="Milestone" />
				</div>
			{/each}
		</fieldset>

		{#each [{ key: 'baptism', title: 'Baptism' }, { key: 'party', title: 'Celebration' }] as block}
			<fieldset class="space-y-3">
				<legend class="text-sm font-semibold opacity-80 mb-2">{block.title}</legend>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
					<label class="label">
						<span>Time</span>
						<input
							class="input"
							type="text"
							bind:value={inv[`${block.key}Time`]}
							placeholder="e.g. 10:00 AM"
						/>
					</label>
					<label class="label">
						<span>Venue</span>
						<input class="input" type="text" bind:value={inv[`${block.key}Venue`]} />
					</label>
					<label class="label">
						<span>Address</span>
						<input class="input" type="text" bind:value={inv[`${block.key}Address`]} />
					</label>
					<label class="label">
						<span>Map link (optional)</span>
						<input
							class="input"
							type="url"
							bind:value={inv[`${block.key}MapUrl`]}
							placeholder="Defaults to a Google Maps search"
						/>
					</label>
				</div>
			</fieldset>
		{/each}

		<div class="grid grid-cols-1 gap-3">
			<label class="label">
				<span>Dress code / theme</span>
				<input class="input" type="text" bind:value={inv.dressCode} />
			</label>
			<label class="label">
				<span>Message</span>
				<textarea class="textarea" rows="4" bind:value={inv.message}></textarea>
			</label>
		</div>

		<div class="flex justify-end">
			<button type="submit" class="btn btn-primary" disabled={isSaving}>
				{isSaving ? 'Saving…' : 'Save details'}
			</button>
		</div>
	</form>
</div>
