<script lang="ts">
	import {
		Briefcase,
		Envelope,
		People,
		Person,
		Quote,
		Star,
		Computer,
		Share
	} from '$lib/components/icons';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { user, profile, messageCount, unreadMessageCount, viewCount } = data;

	const date = new Date();
	const yearStarted = profile?.yearStarted;
	const years = yearStarted ? date.getFullYear() - yearStarted : 0;

	const stats = [
		{ label: 'Skills', value: profile?.skills?.length || 0, href: '/dashboard/skills', icon: Star },
		{
			label: 'Experiences',
			value: profile?.experiences?.length || 0,
			href: '/dashboard/experiences',
			icon: Computer
		},
		{
			label: 'Projects',
			value: profile?.portfolio?.length || 0,
			href: '/dashboard/portfolio',
			icon: Briefcase
		},
		{
			label: 'Testimonials',
			value: profile?.testimonials?.length || 0,
			href: '/dashboard/testimonials',
			icon: Quote
		},
		{
			label: 'Social Links',
			value: profile?.social?.length || 0,
			href: '/dashboard/social',
			icon: Share
		},
		{
			label: unreadMessageCount ? `Messages (${unreadMessageCount} new)` : 'Messages',
			value: messageCount || 0,
			href: '/dashboard/messages',
			icon: Envelope
		},
		{ label: 'Views (30 days)', value: viewCount || 0, href: '/', icon: People },
		{ label: 'Years Coding', value: years, href: '/dashboard/profile', icon: Person }
	];

	// Profile completeness checklist — each item maps to the page where it can be fixed
	const checklist = [
		{ label: 'Profile photo', done: !!profile?.image, href: '/dashboard/profile' },
		{ label: 'Work title', done: !!profile?.workTitle, href: '/dashboard/profile' },
		{ label: 'About summary', done: !!profile?.about, href: '/dashboard/profile' },
		{ label: 'Expertise summary', done: !!profile?.expertise, href: '/dashboard/profile' },
		{
			label: 'Facts (projects, clients, companies)',
			done: !!(profile?.facts?.projects && profile?.facts?.clients && profile?.facts?.companies),
			href: '/dashboard/profile'
		},
		{
			label: 'Education',
			done: !!(profile?.collegeDegree && profile?.collegeSchool),
			href: '/dashboard/profile'
		},
		{
			label: 'At least 3 skills',
			done: (profile?.skills?.length || 0) >= 3,
			href: '/dashboard/skills'
		},
		{
			label: 'At least 1 work experience',
			done: (profile?.experiences?.length || 0) >= 1,
			href: '/dashboard/experiences'
		},
		{
			label: 'At least 1 project',
			done: (profile?.portfolio?.length || 0) >= 1,
			href: '/dashboard/portfolio'
		},
		{
			label: 'At least 1 testimonial',
			done: (profile?.testimonials?.length || 0) >= 1,
			href: '/dashboard/testimonials'
		},
		{
			label: 'At least 1 social link',
			done: (profile?.social?.length || 0) >= 1,
			href: '/dashboard/social'
		}
	];

	const doneCount = checklist.filter((item) => item.done).length;
	const completeness = Math.round((doneCount / checklist.length) * 100);

	const quickActions = [
		{
			title: 'Edit Profile',
			description: 'Name, about, education, facts and photo',
			href: '/dashboard/profile',
			icon: Person
		},
		{
			title: 'Manage Skills',
			description: 'Add or update the skills shown on your profile',
			href: '/dashboard/skills',
			icon: Star
		},
		{
			title: 'Manage Experiences',
			description: 'Keep your work history timeline up to date',
			href: '/dashboard/experiences',
			icon: Computer
		},
		{
			title: 'Manage Projects',
			description: 'Showcase the work you want visitors to see',
			href: '/dashboard/portfolio',
			icon: Briefcase
		},
		{
			title: 'Manage Testimonials',
			description: 'Collect and curate recommendations',
			href: '/dashboard/testimonials',
			icon: Quote
		},
		{
			title: 'Social Links',
			description: 'Control where visitors can reach you',
			href: '/dashboard/social',
			icon: Share
		}
	];
</script>

<div class="max-w-6xl mx-auto space-y-8">
	<!-- Header -->
	<header class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			{#if profile?.image}
				<img
					src={profile.image}
					alt={profile?.firstName}
					class="w-16 h-16 rounded-full ring-2 ring-primary-500/50 object-cover"
				/>
			{/if}
			<div>
				<h1 class="h2">Welcome back, {user?.firstName || profile?.firstName || 'there'}</h1>
				<p class="opacity-60">Manage your public profile and portfolio from here.</p>
			</div>
		</div>
		<div class="flex items-center gap-3">
			{#if profile?.isAvailable}
				<span class="badge badge-soft-success">Available for freelance</span>
			{:else}
				<span class="badge badge-soft-error">Not available</span>
			{/if}
			<a href="/api/pdf/resume" download class="btn btn-ghost">Download Résumé</a>
			<a href="/api/pdf/cv" download class="btn btn-ghost">Download CV</a>
			<a href="/" class="btn btn-primary">View Public Profile</a>
		</div>
	</header>

	<!-- Stats -->
	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
		{#each stats as stat}
			<a
				href={stat.href}
				class="card p-5 flex items-center gap-4 hover:bg-primary-500/5 hover:border-primary-500/40 transition-all duration-200 !no-underline"
			>
				<div class="btn-icon btn-icon-primary pointer-events-none">
					<stat.icon />
				</div>
				<div>
					<p class="text-3xl font-bold">{stat.value}</p>
					<p class="text-sm opacity-60">{stat.label}</p>
				</div>
			</a>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Profile completeness -->
		<section class="card p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="h4">Profile Completeness</h2>
				<span
					class="badge {completeness === 100
						? 'badge-success'
						: completeness >= 60
							? 'badge-primary'
							: 'badge-warning'}">{completeness}%</span
				>
			</div>

			<div class="w-full h-2 rounded-full bg-surface-500/20 mb-6 overflow-hidden">
				<div
					class="h-full rounded-full bg-gradient-to-r from-primary-500 to-tertiary-500 transition-all duration-500"
					style="width: {completeness}%"
				></div>
			</div>

			<ul class="space-y-2">
				{#each checklist as item}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-500/10 transition-colors !no-underline"
						>
							{#if item.done}
								<span
									class="w-5 h-5 flex items-center justify-center rounded-full bg-success-500 text-white text-xs shrink-0"
									>✓</span
								>
								<span class="opacity-60 line-through">{item.label}</span>
							{:else}
								<span class="w-5 h-5 rounded-full border-2 border-surface-400/50 shrink-0"></span>
								<span>{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Quick actions -->
		<section class="space-y-4">
			<h2 class="h4">Quick Actions</h2>
			{#each quickActions as action}
				<a
					href={action.href}
					class="card p-5 flex items-center gap-4 hover:bg-primary-500/5 hover:border-primary-500/40 transition-all duration-200 !no-underline group"
				>
					<div class="btn-icon btn-icon-primary pointer-events-none">
						<action.icon />
					</div>
					<div class="flex-1">
						<h3 class="font-semibold">{action.title}</h3>
						<p class="text-sm opacity-60">{action.description}</p>
					</div>
					<span class="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
						>→</span
					>
				</a>
			{/each}
		</section>
	</div>
</div>
