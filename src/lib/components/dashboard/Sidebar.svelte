<script lang="ts">
	import { page } from '$app/state';
	import { Computer, Home, People, Person, Share, Star } from '$lib/components/icons';

	let {
		user,
		onNavigate
	}: {
		user: any;
		onNavigate?: () => void;
	} = $props();

	const navItems = $derived([
		{ href: '/dashboard', label: 'Home', icon: Home },
		{ href: '/dashboard/profile', label: 'Profile', icon: Person },
		{ href: '/dashboard/social', label: 'Social', icon: Share },
		{ href: '/dashboard/skills', label: 'Skills', icon: Star },
		{ href: '/dashboard/experiences', label: 'Experience', icon: Computer },
		...(user?.role === 'ADMINISTRATOR'
			? [{ href: '/dashboard/users', label: 'Users', icon: People }]
			: [])
	]);
</script>

<nav class="flex h-full w-24 flex-col gap-1 overflow-y-auto p-2" aria-label="Dashboard">
	{#each navItems as item}
		{@const active = page.url.pathname === item.href}
		<a
			href={item.href}
			aria-current={active ? 'page' : undefined}
			onclick={() => onNavigate?.()}
			class="flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs transition-colors
				{active
				? 'bg-primary-500/15 text-primary-600 dark:text-primary-300'
				: 'opacity-70 hover:bg-surface-500/10 hover:opacity-100'}"
		>
			<item.icon width={18} height={18} />
			<span>{item.label}</span>
		</a>
	{/each}
</nav>
