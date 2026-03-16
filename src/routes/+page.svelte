<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Archive, Computer, People } from '$lib/components/icons';

	export let data: any;
	const { user, profile } = data;
	const date = new Date();

	const yearStarted = profile?.yearStarted;
	const years = date.getFullYear() - yearStarted;
	const experience = `Innovative, task-driven professional with ${years} years of experience in IT industry and development across diverse industries.`;

	const factIconMap: Record<string, typeof Computer> = {
		projects: Computer,
		clients: People,
		companies: Archive
	};

	let heroSection: HTMLElement;
	let aboutSection: HTMLElement;
	let factsSection: HTMLElement;
	let experienceSection: HTMLElement;
	let educationSection: HTMLElement;
	let skillsSection: HTMLElement;
	let factElements: HTMLElement[] = [];
	let ctx: any;

	onMount(async () => {
		const { gsap, ScrollTrigger, animateCounter } = await import('$lib/utils/gsap');

		const scroller = document.querySelector('#page') as HTMLElement;

		ctx = gsap.context(() => {
			// Hero entrance animation
			const heroTl = gsap.timeline();
			heroTl
				.from('.hero-image', {
					scale: 0.8,
					opacity: 0,
					duration: 0.8,
					ease: 'back.out(1.7)'
				})
				.from(
					'.hero-name',
					{ y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' },
					'-=0.4'
				)
				.from(
					'.hero-title',
					{ y: 20, opacity: 0, duration: 0.5, ease: 'power3.out' },
					'-=0.3'
				)
				.from(
					'.hero-social > a',
					{
						y: 15,
						opacity: 0,
						duration: 0.4,
						stagger: 0.1,
						ease: 'power2.out',
						clearProps: 'all'
					},
					'-=0.2'
				)
				.from(
					'.hero-nav a',
					{
						y: 10,
						opacity: 0,
						duration: 0.3,
						stagger: 0.05,
						ease: 'power2.out'
					},
					'-=0.2'
				);

			// About section - scroll triggered
			gsap.from(aboutSection, {
				scrollTrigger: {
					trigger: aboutSection,
					scroller,
					start: 'top 85%',
					toggleActions: 'play none none none'
				},
				y: 40,
				opacity: 0,
				duration: 0.7,
				ease: 'power3.out'
			});

			gsap.from('.about-detail-item', {
				scrollTrigger: {
					trigger: '.about-detail-grid',
					scroller,
					start: 'top 85%'
				},
				y: 20,
				opacity: 0,
				duration: 0.5,
				stagger: 0.08,
				ease: 'power2.out'
			});

			// Facts section - animated counters
			ScrollTrigger.create({
				trigger: factsSection,
				scroller,
				start: 'top 80%',
				onEnter: () => {
					gsap.from('.fact-card', {
						scale: 0.9,
						opacity: 0,
						duration: 0.6,
						stagger: 0.15,
						ease: 'back.out(1.4)'
					});
					factElements.forEach((el) => {
						const target = parseInt(el.dataset.target || '0', 10);
						animateCounter(el, target, 2);
					});
				},
				once: true
			});

			// Experience timeline - staggered scroll reveal
			gsap.from('.experience-item', {
				scrollTrigger: {
					trigger: experienceSection,
					scroller,
					start: 'top 80%'
				},
				x: -30,
				opacity: 0,
				duration: 0.6,
				stagger: 0.2,
				ease: 'power3.out'
			});

			// Education - scroll reveal
			gsap.from(educationSection, {
				scrollTrigger: { trigger: educationSection, scroller, start: 'top 85%' },
				y: 30,
				opacity: 0,
				duration: 0.6,
				ease: 'power3.out'
			});

			// Skills icons - pop in
			gsap.from('.skill-icon-wrapper', {
				scrollTrigger: { trigger: skillsSection, scroller, start: 'top 95%' },
				y: 20,
				opacity: 0,
				duration: 0.4,
				stagger: 0.05,
				ease: 'power2.out'
			});
		});
	});

	onDestroy(() => {
		if (ctx) ctx.revert();
	});
</script>

<!-- Hero Section -->
<section
	bind:this={heroSection}
	class="relative py-16 mb-8 overflow-hidden rounded-container-token"
>
	<div
		class="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-surface-500/10 to-tertiary-500/20 -z-10"
	></div>

	<div class="flex flex-col items-center text-center gap-4">
		<img
			src={profile?.image}
			alt={profile?.firstName}
			class="hero-image rounded-full w-32 h-32 ring-4 ring-primary-500/50 shadow-xl"
		/>
		<h1 class="hero-name text-3xl md:text-5xl lg:text-6xl font-bold">
			{profile?.firstName}
			<span class="gradient-heading">{profile?.lastName}</span>
		</h1>
		<p class="hero-title text-lg md:text-xl italic opacity-70">{profile?.workTitle || ''}</p>

		{#if profile?.isAvailable}
			<span class="badge variant-filled-success">Available for Freelance</span>
		{:else}
			<span class="badge variant-filled-error">Currently Unavailable</span>
		{/if}

		<div class="hero-social flex gap-5 items-center mt-2">
			<a
				href="https://www.linkedin.com/in/nujkram/"
				target="_blank"
				title="LinkedIn"
				rel="noopener noreferrer"
				class="btn-icon variant-soft-primary hover:variant-filled-primary transition-all duration-300 hover:scale-110"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" fill="currentColor"><path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"/></svg>
			</a>
			<a
				href="https://github.com/nujkram"
				target="_blank"
				title="GitHub"
				rel="noopener noreferrer"
				class="btn-icon variant-soft-primary hover:variant-filled-primary transition-all duration-300 hover:scale-110"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M237.9 461.4C237.9 463.4 235.6 465 232.7 465C229.4 465.3 227.1 463.7 227.1 461.4C227.1 459.4 229.4 457.8 232.3 457.8C235.3 457.5 237.9 459.1 237.9 461.4zM206.8 456.9C206.1 458.9 208.1 461.2 211.1 461.8C213.7 462.8 216.7 461.8 217.3 459.8C217.9 457.8 216 455.5 213 454.6C210.4 453.9 207.5 454.9 206.8 456.9zM251 455.2C248.1 455.9 246.1 457.8 246.4 460.1C246.7 462.1 249.3 463.4 252.3 462.7C255.2 462 257.2 460.1 256.9 458.1C256.6 456.2 253.9 454.9 251 455.2zM316.8 72C178.1 72 72 177.3 72 316C72 426.9 141.8 521.8 241.5 555.2C254.3 557.5 258.8 549.6 258.8 543.1C258.8 536.9 258.5 502.7 258.5 481.7C258.5 481.7 188.5 496.7 173.8 451.9C173.8 451.9 162.4 422.8 146 415.3C146 415.3 123.1 399.6 147.6 399.9C147.6 399.9 172.5 401.9 186.2 425.7C208.1 464.3 244.8 453.2 259.1 446.6C261.4 430.6 267.9 419.5 275.1 412.9C219.2 406.7 162.8 398.6 162.8 302.4C162.8 274.9 170.4 261.1 186.4 243.5C183.8 237 175.3 210.2 189 175.6C209.9 169.1 258 202.6 258 202.6C278 197 299.5 194.1 320.8 194.1C342.1 194.1 363.6 197 383.6 202.6C383.6 202.6 431.7 169 452.6 175.6C466.3 210.3 457.8 237 455.2 243.5C471.2 261.2 481 275 481 302.4C481 398.9 422.1 406.6 366.2 412.9C375.4 420.8 383.2 435.8 383.2 459.3C383.2 493 382.9 534.7 382.9 542.9C382.9 549.4 387.5 557.3 400.2 555C500.2 521.8 568 426.9 568 316C568 177.3 455.5 72 316.8 72zM169.2 416.9C167.9 417.9 168.2 420.2 169.9 422.1C171.5 423.7 173.8 424.4 175.1 423.1C176.4 422.1 176.1 419.8 174.4 417.9C172.8 416.3 170.5 415.6 169.2 416.9zM158.4 408.8C157.7 410.1 158.7 411.7 160.7 412.7C162.3 413.7 164.3 413.4 165 412C165.7 410.7 164.7 409.1 162.7 408.1C160.7 407.5 159.1 407.8 158.4 408.8zM190.8 444.4C189.2 445.7 189.8 448.7 192.1 450.6C194.4 452.9 197.3 453.2 198.6 451.6C199.9 450.3 199.3 447.3 197.3 445.4C195.1 443.1 192.1 442.8 190.8 444.4zM179.4 429.7C177.8 430.7 177.8 433.3 179.4 435.6C181 437.9 183.7 438.9 185 437.9C186.6 436.6 186.6 434 185 431.7C183.6 429.4 181 428.4 179.4 429.7z"/></svg>
			</a>
		</div>

		<nav class="hero-nav flex flex-wrap gap-2 justify-center mt-4">
			{#each ['About', 'Facts', 'Experience', 'Education', 'Skills'] as section}
				<a href="#{section.toLowerCase()}" class="chip variant-soft hover:variant-filled-primary transition-all">{section}</a>
			{/each}
		</nav>
	</div>
</section>

<!-- About Section -->
<section id="about" bind:this={aboutSection} class="card p-6 mb-8">
	<h2 class="h2 gradient-heading mb-4">About</h2>
	<p class="text-lg leading-relaxed text-justify mb-6">{profile?.about || '--'}</p>

	<div class="about-detail-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
		{#each [{ label: 'Email', value: profile?.email }, { label: 'Website', value: profile?.website }, { label: 'Degree', value: profile?.degree }, { label: 'Nationality', value: profile?.nationality }, { label: 'City', value: profile?.city }, { label: 'Civil Status', value: profile?.civilStatus }] as detail}
			<div class="about-detail-item flex gap-2 items-baseline">
				<span class="font-bold text-primary-400">{detail.label}:</span>
				{#if detail.label === 'Website' && detail.value}
					<a href={detail.value} target="_blank" rel="noopener noreferrer" class="anchor">{detail.value}</a>
				{:else}
					<span>{detail.value || 'NA'}</span>
				{/if}
			</div>
		{/each}
	</div>

	<hr class="!border-surface-700 my-4" />
	<p class="text-justify leading-relaxed">{experience} {profile?.experience || '--'}</p>
</section>

<!-- Facts Section -->
<section id="facts" bind:this={factsSection} class="mb-8">
	<div class="card p-6">
		<h2 class="h2 gradient-heading mb-2">Facts</h2>
		<p class="text-justify mb-6">{profile?.expertise || '--'}</p>

		<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
			{#if profile.facts}
				{#each Object.entries(profile?.facts) as [key, value], i}
					<div
						class="fact-card card variant-ghost p-6 text-center hover:variant-soft-primary transition-all duration-300"
					>
						<div class="flex justify-center mb-3">
							<svelte:component this={factIconMap[key] || Archive} width={28} height={28} />
						</div>
						<h3
							class="h2 font-bold text-primary-500"
							data-target={value}
							bind:this={factElements[i]}
						>
							0
						</h3>
						<p class="font-semibold text-sm uppercase tracking-wide mt-1">{key}</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</section>

<!-- Work Experience Section -->
<section id="experience" bind:this={experienceSection} class="card p-6 mb-8">
	<h2 class="h2 gradient-heading mb-6">Work Experience</h2>

	<div class="relative pl-8 border-l-2 border-primary-500/30">
		{#each [...profile.experiences].reverse() as exp}
			<div class="experience-item relative mb-8 last:mb-0">
				<!-- Timeline dot -->
				<div
					class="absolute -left-[calc(2rem+5px)] top-1 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-surface-900"
				></div>

				<div class="card variant-ghost p-4 hover:variant-soft-primary transition-all duration-300">
					<div class="flex flex-wrap items-baseline gap-2 mb-1">
						<h3 class="h3 text-primary-400">{exp?.title}</h3>
						<span class="badge variant-soft-surface">{exp?.date || 'NA'}</span>
					</div>
					<h4 class="h4 mb-1">
						{exp?.company || 'NA'}
						<span class="text-sm italic opacity-60">({exp?.location || 'NA'})</span>
					</h4>
					<p class="opacity-80">{exp?.delegation || 'NA'}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Education & Skills Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
	<section id="education" bind:this={educationSection} class="card p-6">
		<h2 class="h2 gradient-heading mb-4">Education</h2>

		<div class="space-y-6">
			<div>
				<div class="flex items-baseline gap-2">
					<h4 class="h4">Masters</h4>
					<span class="badge variant-soft-primary">{profile?.mastersYear || 'NA'}</span>
				</div>
				<p class="font-bold mt-1">{profile?.mastersDegree || 'NA'}</p>
				<p class="italic text-primary-400 underline">{profile?.mastersSchool || 'NA'}</p>
				<p class="text-sm opacity-70 mt-1">{profile?.mastersDescription || 'NA'}</p>
			</div>
			<hr class="!border-surface-700" />
			<div>
				<div class="flex items-baseline gap-2">
					<h4 class="h4">College</h4>
					<span class="badge variant-soft-primary">{profile?.collegeYear || 'NA'}</span>
				</div>
				<p class="font-bold mt-1">{profile?.collegeDegree || 'NA'}</p>
				<p class="italic text-primary-400 underline">{profile?.collegeSchool || 'NA'}</p>
				<p class="text-sm opacity-70 mt-1">{profile?.collegeDescription || 'NA'}</p>
			</div>
		</div>
	</section>

	<section id="skills" bind:this={skillsSection} class="card p-6">
		<h2 class="h2 gradient-heading mb-4">Skills</h2>
		<p class="mb-4 opacity-70">It takes talent to make money, but it takes brains to keep them.</p>
		<div class="grid grid-cols-4 sm:grid-cols-5 gap-4">
			{#if profile?.skills?.length}
				{#each profile.skills as skill}
					<div
						class="skill-icon-wrapper"
						title={skill.name}
					>
						{@html skill.icon}
						<span class="text-xs mt-1 opacity-70">{skill.name}</span>
					</div>
				{/each}
			{:else}
				<p class="col-span-full opacity-50">No skills added yet.</p>
			{/if}
		</div>
	</section>
</div>

<!-- Footer -->
<footer class="text-center py-12 mt-8">
	<h2 class="h2 gradient-heading mb-4">Let's Work Together</h2>
	<p class="mb-6 opacity-70">Have a project in mind? I'd love to hear about it.</p>
	<a href="mailto:{profile?.email}" class="btn variant-filled-primary">Get In Touch</a>
	<p class="mt-8 text-sm opacity-50">&copy; {date.getFullYear()} {profile?.firstName} {profile?.lastName}. All rights reserved.</p>
</footer>
