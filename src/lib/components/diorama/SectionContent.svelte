<script lang="ts">
	import { initials, techList, type Profile, type SectionId } from './sections';

	let { profile, id }: { profile: Profile; id: SectionId } = $props();

	const years = $derived(new Date().getFullYear() - (profile?.yearStarted ?? 0));

	// The website field is stored without a protocol.
	const externalUrl = (value: string) => (/^https?:\/\//.test(value) ? value : `https://${value}`);
</script>

{#if id === 'about'}
	<p class="font-semibold">
		{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ')}
		{#if profile?.workTitle}<span class="font-normal opacity-70"> · {profile.workTitle}</span>{/if}
	</p>
	<p class="mt-3 leading-relaxed">{profile?.about || '--'}</p>
	<dl class="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
		{#each [{ label: 'Email', value: profile?.email }, { label: 'Website', value: profile?.website }, { label: 'Degree', value: profile?.degree }, { label: 'City', value: profile?.city }] as detail}
			{#if detail.value}
				<dt class="font-bold text-primary-500 dark:text-primary-400">{detail.label}</dt>
				<dd class="min-w-0 break-words">
					{#if detail.label === 'Website'}
						<a
							href={externalUrl(detail.value)}
							target="_blank"
							rel="noopener noreferrer"
							class="anchor">{detail.value}</a
						>
					{:else}
						{detail.value}
					{/if}
				</dd>
			{/if}
		{/each}
	</dl>
	{#if profile?.yearStarted}
		<p class="mt-4 text-sm opacity-80">{years} years in the IT industry.</p>
	{/if}
	{#if profile?.facts}
		<div class="mt-4 grid grid-cols-3 gap-2">
			{#each Object.entries(profile.facts) as [key, value]}
				<div class="card card-ghost p-3 text-center">
					<span class="block text-xl font-bold text-primary-500">{value}</span>
					<span class="text-[11px] uppercase tracking-wide opacity-70">{key}</span>
				</div>
			{/each}
		</div>
	{/if}
{:else if id === 'experience'}
	<div class="relative border-l-2 border-primary-500/30 pl-5">
		{#each [...(profile?.experiences ?? [])].reverse() as exp}
			<div class="relative mb-5 last:mb-0">
				<div
					class="absolute -left-[calc(1.25rem+5px)] top-1.5 h-2 w-2 rounded-full bg-primary-500"
				></div>
				<div class="flex flex-wrap items-baseline gap-2">
					<h3 class="font-semibold text-primary-500 dark:text-primary-400">{exp?.title}</h3>
					<span class="badge badge-soft-surface">{exp?.date || 'NA'}</span>
				</div>
				<p class="text-sm font-medium">
					{exp?.company || 'NA'}
					<span class="italic opacity-60">({exp?.location || 'NA'})</span>
				</p>
				{#if exp?.delegation}<p class="mt-1 text-sm opacity-80">{exp.delegation}</p>{/if}
			</div>
		{/each}
	</div>
{:else if id === 'projects'}
	<div class="space-y-3">
		{#each profile?.portfolio ?? [] as project}
			<div class="card card-ghost p-4">
				<h3 class="font-semibold text-primary-500 dark:text-primary-400">{project.title}</h3>
				{#if project.description}<p class="mt-1 text-sm opacity-80">{project.description}</p>{/if}
				{#if project.tech}
					<div class="mt-2 flex flex-wrap gap-1.5">
						{#each techList(project.tech) as tech}
							<span class="badge badge-soft-primary">{tech}</span>
						{/each}
					</div>
				{/if}
				{#if project.link || project.repo}
					<div class="mt-2 flex gap-4 text-sm">
						{#if project.link}
							<a href={project.link} target="_blank" rel="noopener noreferrer" class="anchor"
								>Live ↗</a
							>
						{/if}
						{#if project.repo}
							<a href={project.repo} target="_blank" rel="noopener noreferrer" class="anchor"
								>Source ↗</a
							>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else if id === 'education'}
	<div class="space-y-5">
		{#each [{ level: 'Masters', year: profile?.mastersYear, degree: profile?.mastersDegree, school: profile?.mastersSchool, description: profile?.mastersDescription }, { level: 'College', year: profile?.collegeYear, degree: profile?.collegeDegree, school: profile?.collegeSchool, description: profile?.collegeDescription }] as item}
			{#if item.degree || item.school}
				<div>
					<div class="flex items-baseline gap-2">
						<h3 class="font-semibold">{item.level}</h3>
						<span class="badge badge-soft-primary">{item.year || 'NA'}</span>
					</div>
					<p class="mt-1 font-bold">{item.degree || 'NA'}</p>
					<p class="italic text-primary-500 dark:text-primary-400">{item.school || 'NA'}</p>
					{#if item.description}<p class="mt-1 text-sm opacity-70">{item.description}</p>{/if}
				</div>
			{/if}
		{/each}
	</div>
{:else if id === 'skills'}
	{#if profile?.skills?.length}
		<div class="grid grid-cols-4 gap-4">
			{#each profile.skills as skill}
				<div class="skill-icon-wrapper" title={skill.name}>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- icons are authored in the dashboard -->
					{@html skill.icon}
					<span class="mt-1 text-xs opacity-70">{skill.name}</span>
				</div>
			{/each}
		</div>
	{:else}
		<p class="opacity-60">No skills added yet.</p>
	{/if}
{:else if id === 'testimonials'}
	<div class="space-y-3">
		{#each profile?.testimonials ?? [] as testimonial}
			<figure class="card card-ghost p-4">
				<blockquote class="text-sm leading-relaxed opacity-90">“{testimonial.message}”</blockquote>
				<figcaption class="mt-3 flex items-center gap-3">
					{#if testimonial.image}
						<img
							src={testimonial.image}
							alt=""
							loading="lazy"
							class="h-9 w-9 rounded-full object-cover ring-2 ring-primary-500/40"
						/>
					{:else}
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-xs font-bold text-primary-600 dark:text-primary-300"
						>
							{initials(testimonial.name) || '?'}
						</div>
					{/if}
					<div class="text-sm">
						<p class="font-semibold">{testimonial.name}</p>
						<p class="opacity-60">
							{[testimonial.position, testimonial.company].filter(Boolean).join(', ')}
						</p>
					</div>
				</figcaption>
			</figure>
		{/each}
	</div>
{:else if id === 'contact'}
	<p class="leading-relaxed">
		Have a project in mind or just want to say hello? Send a message and I'll get back to you.
	</p>
	{#if profile?.email}
		<p class="mt-3 text-sm">
			<span class="font-bold text-primary-500 dark:text-primary-400">Email</span>
			<a href="mailto:{profile.email}" class="anchor ml-2 break-all">{profile.email}</a>
		</p>
	{/if}
{/if}
