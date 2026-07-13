<script lang="ts">
	import '../app.postcss';
	import { page } from '$app/state';
	import { afterNavigate, goto, onNavigate } from '$app/navigation';
	import { Drawer, Dropdown, ThemeToggle, Toaster } from '$lib/components/ui';
	import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
	import { List } from '$lib/components/icons';

	let { children } = $props();

	let drawerOpen = $state(false);

	const user = $derived(page.data.user);

	// Cross-fade page navigations where the browser supports the View Transitions API.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const handleLogout = () => {
		goto('/auth/logout/');
	};

	// Count public page views (aggregate only). Skips visitors with Do Not Track.
	afterNavigate(() => {
		if (navigator.doNotTrack === '1') return;
		const path = page.url.pathname;
		if (path.startsWith('/dashboard') || path.startsWith('/auth')) return;
		fetch('/api/pageview', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ path }),
			keepalive: true
		}).catch(() => {});
	});
</script>

<Drawer bind:open={drawerOpen}>
	<Sidebar onNavigate={() => (drawerOpen = false)} />
</Drawer>

<div class="min-h-dvh">
	{#if user}
		<header
			class="sticky top-0 z-40 border-b border-surface-200 bg-surface-50/80 backdrop-blur dark:border-surface-800 dark:bg-surface-950/80"
		>
			<div class="flex h-16 items-center gap-4 px-4 md:px-6">
				<button
					type="button"
					class="btn-icon btn-icon-ghost lg:hidden"
					aria-label="Open navigation"
					onclick={() => (drawerOpen = true)}
				>
					<List />
				</button>
				<a href="/" class="flex items-center space-x-2">
					<strong class="hidden text-xl uppercase md:block">Mark Gersaniva</strong>
					<strong class="block text-xl uppercase md:hidden">Mark</strong>
				</a>
				<div class="ml-auto flex items-center gap-2">
					<ThemeToggle />
					<Dropdown>
						{#snippet trigger({ open, toggle })}
							<button
								type="button"
								class="btn btn-neutral"
								aria-expanded={open}
								aria-haspopup="menu"
								onclick={toggle}
							>
								Hi, {user.firstName || 'User'}
								<span class="text-xs opacity-60">▾</span>
							</button>
						{/snippet}
						{#snippet children({ close })}
							<button
								type="button"
								class="btn btn-ghost w-full justify-start"
								onclick={() => {
									close();
									handleLogout();
								}}>Logout</button
							>
						{/snippet}
					</Dropdown>
				</div>
			</div>
		</header>

		<div class="flex">
			<aside
				class="sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 border-r border-surface-200 dark:border-surface-800 lg:block"
			>
				<Sidebar />
			</aside>
			<main class="min-w-0 flex-1 px-4 py-6 md:px-6">
				{@render children()}
			</main>
		</div>
	{:else}
		<div
			class="fixed right-4 top-4 z-40 rounded-full bg-surface-50/70 shadow backdrop-blur dark:bg-surface-950/70"
		>
			<ThemeToggle />
		</div>
		<main class="px-4 py-4 md:px-6">
			{@render children()}
		</main>
	{/if}
</div>

<Toaster />
