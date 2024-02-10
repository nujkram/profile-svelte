<script lang="ts">
	import { page } from '$app/stores';
	import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { Computer, Home, People, Person, Star } from '$lib/components/icons/index';
	export let user: any;
</script>

<AppRail>
	<AppRailAnchor title="Home" href="/dashboard" selected={$page.url.pathname === '/dashboard'}>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Home />
			</div>
		</svelte:fragment>
		<span>Home</span>
	</AppRailAnchor>
	
	<AppRailAnchor
		title="Profile"
		href="/dashboard/profile"
		selected={$page.url.pathname === '/dashboard/profile'}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Person />
			</div>
		</svelte:fragment>
		<span>Profile</span>
	</AppRailAnchor>

	<AppRailAnchor
		title="Skills"
		href="/dashboard/skills"
		selected={$page.url.pathname === '/dashboard/skills'}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Star />
			</div>
		</svelte:fragment>
		<span>Skills</span>
	</AppRailAnchor>
	
	<AppRailAnchor
		title="Experiences"
		href="/dashboard/experiences"
		selected={$page.url.pathname === '/dashboard/experiences'}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Computer />
			</div>
		</svelte:fragment>
		<span>Experiences</span>
	</AppRailAnchor>

	{#if user?.role === 'ADMINISTRATOR'}
		<AppRailAnchor
			title="Users"
			href="/dashboard/users"
			selected={$page.url.pathname === '/dashboard/users'}
		>
			<svelte:fragment slot="lead">
				<div class="flex items-center justify-center">
					<People />
				</div>
			</svelte:fragment>
			<span>Users</span>
		</AppRailAnchor>
	{/if}
</AppRail>
