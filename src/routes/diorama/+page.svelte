<script lang="ts">
	import type { Component } from 'svelte';
	import InfoPanel from '$lib/components/diorama/InfoPanel.svelte';
	import SectionContent from '$lib/components/diorama/SectionContent.svelte';
	import { availableSections, type SectionId } from '$lib/components/diorama/sections';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { profile } = data;

	const sections = availableSections(profile);
	const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
	const pageTitle = `${fullName || 'Portfolio'} — Diorama`;
	const description = `A miniature 3D desk room you can explore: every object opens a part of ${
		profile?.firstName || 'the'
	} portfolio.`;

	let active = $state<SectionId | null>(null);
	const activeSection = $derived(sections.find((section) => section.id === active));

	// three.js is only fetched here, in the browser, so the rest of the site stays light.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let Scene = $state<Component<any> | null>(null);
	let failed = $state(false);
	let reducedMotion = $state(false);

	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reducedMotion = query.matches);
		sync();
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});

	$effect(() => {
		let cancelled = false;

		const probe = document.createElement('canvas');
		const gl = probe.getContext('webgl2') || probe.getContext('webgl');
		if (!gl) {
			failed = true;
			return;
		}
		gl.getExtension('WEBGL_lose_context')?.loseContext();

		import('$lib/components/diorama/Scene.svelte')
			.then((module) => {
				if (!cancelled) Scene = module.default;
			})
			.catch(() => {
				if (!cancelled) failed = true;
			});

		return () => {
			cancelled = true;
		};
	});

	// The room's ceiling light; the wall switch in the scene and the header button both flip it
	let lightOn = $state(true);

	const toggle = (id: SectionId) => (active = active === id ? null : id);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
</svelte:head>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') active = null;
	}}
/>

{#if failed}
	<!-- No WebGL: the same content as plain cards -->
	<div class="mx-auto max-w-3xl">
		<a href="/" class="chip">← Portfolio</a>
		<h1 class="h2 gradient-heading mt-4">{fullName}</h1>
		<p class="mt-2 opacity-70">
			The 3D diorama needs WebGL, which this browser doesn't offer. Here is everything it shows.
		</p>
		{#each sections as section}
			<div class="card mt-6 p-6">
				<h2 class="h3 gradient-heading mb-4">{section.label}</h2>
				<SectionContent {profile} id={section.id} />
			</div>
		{/each}
	</div>
{:else}
	<div
		class="relative h-[calc(100dvh-2rem)] min-h-[460px] overflow-hidden rounded-2xl border border-surface-200 bg-[#e8f1fb] dark:border-surface-700/60 dark:bg-surface-950"
	>
		<div class="absolute inset-0 touch-none">
			{#if Scene}
				<Scene
					{profile}
					{sections}
					{active}
					{reducedMotion}
					{lightOn}
					onselect={(id: SectionId) => (active = id)}
					onclose={() => (active = null)}
					ontogglelight={() => (lightOn = !lightOn)}
				/>
			{:else}
				<div class="flex h-full items-center justify-center">
					<p class="animate-pulse text-sm opacity-60 motion-reduce:animate-none">
						Building the room…
					</p>
				</div>
			{/if}
		</div>

		<header class="pointer-events-none absolute left-3 top-3 z-10 max-w-[70%] sm:left-4 sm:top-4">
			<a
				href="/"
				class="chip pointer-events-auto !bg-white/85 backdrop-blur hover:!bg-primary-500 dark:!bg-surface-900/85"
				>← Portfolio</a
			>
			<button
				type="button"
				aria-pressed={lightOn}
				onclick={() => (lightOn = !lightOn)}
				class="chip pointer-events-auto ml-1 !bg-white/85 backdrop-blur hover:!bg-primary-500 dark:!bg-surface-900/85"
				>Light: {lightOn ? 'on' : 'off'}</button
			>
			<div class="mt-3 w-fit rounded-xl bg-white/75 px-3 py-2 backdrop-blur dark:bg-surface-900/75">
				<h1 class="text-lg font-bold sm:text-xl">
					<span class="gradient-heading">{profile?.firstName || 'My'}'s desk</span>
				</h1>
				<p class="text-xs opacity-70">Drag to look around. Pick an object to open it.</p>
			</div>
		</header>

		<nav
			aria-label="Diorama sections"
			class="absolute inset-x-2 bottom-3 z-10 flex flex-wrap justify-center gap-1.5 sm:gap-2 {activeSection
				? 'sm:right-[396px]'
				: ''}"
		>
			{#each sections as section}
				<button
					type="button"
					aria-pressed={active === section.id}
					onclick={() => toggle(section.id)}
					class="chip backdrop-blur {active === section.id
						? '!bg-primary-500 text-white'
						: '!bg-white/85 hover:!bg-primary-500 dark:!bg-surface-900/85'}">{section.label}</button
				>
			{/each}
		</nav>

		{#if activeSection}
			<InfoPanel
				{profile}
				section={activeSection}
				{reducedMotion}
				onclose={() => (active = null)}
			/>
		{/if}
	</div>
{/if}
