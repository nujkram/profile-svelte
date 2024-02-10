<script lang="ts">
	import { page } from '$app/stores';
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		Drawer,
		initializeStores,
		getDrawerStore,
		LightSwitch,
		Toast,
		popup
	} from '@skeletonlabs/skeleton';
	import type { DrawerSettings, PopupSettings } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
	import { List } from '$lib/components/icons/index';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	initializeStores();

	$: user = $page.data.user;
	

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'left'
	};

	const handleLogout = () => {
		goto('/auth/logout/');
	};

	const drawerSettings: DrawerSettings = {
		id: 'mobileSidebar',
		// Provide your property overrides:
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[80px]',
		rounded: 'rounded-none',
		position: 'left'
	};

	const drawerStore = getDrawerStore();

	const drawerOpen = (): void => {
		drawerStore.open(drawerSettings);
	};
</script>

<Drawer>
	<Sidebar {user} />
</Drawer>
<!-- App Shell -->
<AppShell slotSidebarLeft="w-0 lg:w-20">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		{#if $page.data.user}
			<AppBar>
				<svelte:fragment slot="lead">
					<div class="flex items-center">
						<button class="lg:hidden btn btn-sm mr-4" on:click={drawerOpen}>
							<List />
						</button>
                        <a href="/" class="flex items-center space-x-2">   
						<strong class="text-xl uppercase md:block hidden">MARK GERSANIVA</strong>
						<strong class="text-xl uppercase md:hidden block">MARK</strong>
                        </a>
					</div>
				</svelte:fragment>
				<svelte:fragment slot="trail">
					<LightSwitch />
					{#if $page.data.user}
						<button class="btn variant-filled w-auto" use:popup={popupClick}
							>Hi, {$page.data.user.firstName || 'User'}</button
						>
						<div class="card p-4 bg-gray-900" data-popup="popupClick">
							<button
								type="button"
								class="btn variant-outline-surface variant-filled-surface"
								on:click={handleLogout}>Logout</button
							>
							<div class="arrow bg-gray-900" />
						</div>
					{/if}
				</svelte:fragment>
			</AppBar>
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		{#if $page.data.user}
			<Sidebar {user} />
		{/if}
	</svelte:fragment>
	<!-- Page Route Content -->
	<div class="px-6 py-4">
		<slot />
		<Toast />
	</div>
</AppShell>
