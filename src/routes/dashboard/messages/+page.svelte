<script lang="ts">
	import { format } from 'date-fns';
	import { toast } from '$lib/components/ui';

	let { data }: { data: any } = $props();

	type Message = {
		_id: string;
		name: string;
		email: string;
		message: string;
		isRead: boolean;
		createdAt: string | Date;
	};

	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	let messages: Message[] = $state(data.messages || []);

	const unreadCount = $derived(messages.filter((m) => !m.isRead).length);

	const toggleRead = async (message: Message) => {
		const isRead = !message.isRead;
		try {
			const response = await fetch('/api/admin/messages/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ _id: message._id, isRead })
			});
			const result = await response.json();
			message.isRead = isRead;
			toast.success(result.message);
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	const removeMessage = async (message: Message) => {
		if (!confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
		try {
			const response = await fetch('/api/admin/messages/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ _id: message._id })
			});
			const result = await response.json();
			messages = messages.filter((m) => m._id !== message._id);
			toast.success(result.message);
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	const formatDate = (value: string | Date) => format(new Date(value), 'MMM d, yyyy h:mm a');
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="h3">Messages</h1>
			<p class="opacity-60 text-sm">Inquiries sent through the contact form on your public profile.</p>
		</div>
		{#if unreadCount > 0}
			<span class="badge badge-primary">{unreadCount} unread</span>
		{/if}
	</header>

	{#if messages.length === 0}
		<div class="card p-10 text-center space-y-3">
			<p class="opacity-60">
				No messages yet. When someone fills in the contact form, their message lands here.
			</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each messages as message (message._id)}
				<article class="card p-5 {message.isRead ? 'opacity-70' : 'border-primary-500/40'}">
					<div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
						<div class="flex items-baseline gap-2">
							{#if !message.isRead}
								<span class="w-2 h-2 rounded-full bg-primary-500 shrink-0" title="Unread"></span>
							{/if}
							<h2 class="font-semibold">{message.name}</h2>
							<a href="mailto:{message.email}" class="anchor text-sm">{message.email}</a>
						</div>
						<span class="text-xs opacity-50">{formatDate(message.createdAt)}</span>
					</div>

					<p class="leading-relaxed whitespace-pre-line mb-4">{message.message}</p>

					<div class="flex flex-wrap gap-2 justify-end">
						<a
							href="mailto:{message.email}?subject=Re: your message"
							class="btn btn-ghost !px-3 !py-1 text-sm">Reply</a
						>
						<button
							type="button"
							class="btn btn-ghost !px-3 !py-1 text-sm"
							onclick={() => toggleRead(message)}
						>
							{message.isRead ? 'Mark unread' : 'Mark read'}
						</button>
						<button
							type="button"
							class="btn btn-ghost !px-3 !py-1 text-sm text-error-500"
							onclick={() => removeMessage(message)}>Delete</button
						>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
