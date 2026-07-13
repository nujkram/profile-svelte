<script lang="ts">
	import { page } from '$app/state';
	import { toast } from '$lib/components/ui';
	import { Archive, Computer, People } from '$lib/components/icons';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { profile } = data;
	const date = new Date();

	const yearStarted = profile?.yearStarted;
	const years = date.getFullYear() - yearStarted;
	const experience = `Innovative, task-driven professional with ${years} years of experience in IT industry and development across diverse industries.`;

	// --- SEO ---
	const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
	const pageTitle = [fullName, profile?.workTitle].filter(Boolean).join(' — ') || 'Portfolio';
	const description = (profile?.about || '').slice(0, 157).replace(/\s+\S*$/, '') + '…';
	const origin = page.url.origin;
	const ogImage = `${origin}/profile-image.jpg`;

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: fullName,
		jobTitle: profile?.workTitle,
		description: profile?.about,
		email: profile?.email ? `mailto:${profile.email}` : undefined,
		url: origin,
		image: ogImage,
		address: profile?.city
			? { '@type': 'PostalAddress', addressLocality: profile.city, addressCountry: 'PH' }
			: undefined,
		alumniOf: [profile?.mastersSchool, profile?.collegeSchool]
			.filter(Boolean)
			.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
		sameAs: (profile?.social || []).map((s: { link: string }) => s.link).filter(Boolean)
	});

	const factIconMap: Record<string, typeof Computer> = {
		projects: Computer,
		clients: People,
		companies: Archive
	};

	const techList = (tech: string) =>
		tech
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);

	let heroImage = $state<HTMLImageElement>();
	let aboutSection = $state<HTMLElement>();
	let projectsSection = $state<HTMLElement>();
	let experienceSection = $state<HTMLElement>();
	let educationSection = $state<HTMLElement>();
	let skillsSection = $state<HTMLElement>();
	let testimonialsSection = $state<HTMLElement>();
	let factElements: HTMLElement[] = $state([]);

	const initials = (name: string) =>
		name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');

	// Contact form
	let contact = $state({ name: '', email: '', message: '', company: '' });
	let sending = $state(false);

	const submitContact = async (event: SubmitEvent) => {
		event.preventDefault();
		sending = true;
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(contact)
			});
			const result = await response.json();
			if (response.ok && result.status === 'Success') {
				toast.success("Message sent — I'll get back to you soon!");
				contact = { name: '', email: '', message: '', company: '' };
			} else {
				toast.error(result.message || 'Something went wrong — please try again.');
			}
		} catch {
			toast.error('Network hiccup — please try again.');
		} finally {
			sending = false;
		}
	};

	// Testimonials carousel
	let carousel = $state<HTMLElement>();
	let current = $state(0);
	let paused = $state(false);
	const testimonialCount = profile?.testimonials?.length ?? 0;

	const goTo = (index: number) => {
		const el = carousel;
		if (!el || !el.children.length) return;
		const count = el.children.length;
		const i = ((index % count) + count) % count; // wrap around
		current = i;
		const child = el.children[i] as HTMLElement;
		const delta = child.getBoundingClientRect().left - el.getBoundingClientRect().left;
		el.scrollBy({ left: delta, behavior: 'smooth' });
	};

	// Keep the active dot in sync when the user scrolls or swipes manually.
	const syncCurrent = () => {
		const el = carousel;
		if (!el) return;
		const base = el.getBoundingClientRect().left;
		let nearest = 0;
		let min = Infinity;
		Array.from(el.children).forEach((child, i) => {
			const distance = Math.abs((child as HTMLElement).getBoundingClientRect().left - base);
			if (distance < min) {
				min = distance;
				nearest = i;
			}
		});
		current = nearest;
	};

	// Auto-advance every 5s; pauses on hover/focus and respects reduced motion.
	$effect(() => {
		if (!carousel || testimonialCount <= 1) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const id = setInterval(() => {
			if (!paused) goTo(current + 1);
		}, 5000);
		return () => clearInterval(id);
	});

	$effect(() => {
		let ctx: { revert: () => void } | undefined;
		let cancelled = false;

		import('$lib/utils/gsap').then(({ gsap, ScrollTrigger, animateCounter }) => {
			if (cancelled) return;

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
				gsap.from(aboutSection!, {
					scrollTrigger: {
						trigger: aboutSection,
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
						start: 'top 85%'
					},
					y: 20,
					opacity: 0,
					duration: 0.5,
					stagger: 0.08,
					ease: 'power2.out'
				});

				// About stats - animated counters
				ScrollTrigger.create({
					trigger: '.about-stats',
					start: 'top 90%',
					onEnter: () => {
						gsap.from('.about-stat', {
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

				// Projects - staggered scroll reveal
				if (projectsSection) {
					gsap.from('.project-card', {
						scrollTrigger: {
							trigger: projectsSection,
							start: 'top 80%'
						},
						y: 30,
						opacity: 0,
						duration: 0.6,
						stagger: 0.12,
						ease: 'power3.out'
					});
				}

				// Experience timeline - staggered scroll reveal
				gsap.from('.experience-item', {
					scrollTrigger: {
						trigger: experienceSection,
						start: 'top 80%'
					},
					x: -30,
					opacity: 0,
					duration: 0.6,
					stagger: 0.2,
					ease: 'power3.out'
				});

				// Education - scroll reveal
				gsap.from(educationSection!, {
					scrollTrigger: { trigger: educationSection, start: 'top 85%' },
					y: 30,
					opacity: 0,
					duration: 0.6,
					ease: 'power3.out'
				});

				// Skills icons - pop in
				gsap.from('.skill-icon-wrapper', {
					scrollTrigger: { trigger: skillsSection, start: 'top 95%' },
					y: 20,
					opacity: 0,
					duration: 0.4,
					stagger: 0.05,
					ease: 'power2.out'
				});

				// Testimonials - staggered scroll reveal
				if (testimonialsSection) {
					gsap.from('.testimonial-card', {
						scrollTrigger: {
							trigger: testimonialsSection,
							start: 'top 85%'
						},
						y: 30,
						opacity: 0,
						duration: 0.6,
						stagger: 0.1,
						ease: 'power3.out'
					});
				}
			});

			// Trigger positions shift once the hero image loads, so re-measure.
			if (heroImage && !heroImage.complete) {
				heroImage.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
			}
		});

		return () => {
			cancelled = true;
			ctx?.revert();
		};
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={origin + '/'} />

	<meta property="og:type" content="profile" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={origin + '/'} />
	<meta property="og:image" content={ogImage} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<div class="max-w-5xl mx-auto">
<!-- Hero Section -->
<section class="relative py-16 mb-8 overflow-hidden rounded-2xl">
	<div
		class="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-surface-500/10 to-tertiary-500/20 -z-10"
	></div>

	<div class="flex flex-col items-center text-center gap-4">
		<img
			src={profile?.image}
			alt={profile?.firstName}
			bind:this={heroImage}
			class="hero-image rounded-full w-32 h-32 ring-4 ring-primary-500/50 shadow-xl"
		/>
		<h1 class="hero-name text-3xl md:text-5xl lg:text-6xl font-bold">
			{profile?.firstName}
			<span class="gradient-heading">{profile?.lastName}</span>{#if profile?.credentials}<span
					class="font-normal opacity-70">, {profile.credentials}</span
				>{/if}
		</h1>
		<p class="hero-title text-lg md:text-xl italic opacity-70">{profile?.workTitle || ''}</p>

		{#if profile?.isAvailable}
			<span class="badge badge-success">Available for Freelance</span>
		{:else}
			<span class="badge badge-error">Currently Unavailable</span>
		{/if}

		<div class="hero-social flex gap-5 items-center mt-2">
			{#if profile?.social?.length}
				{#each profile.social as social}
					<a
						href={social.link}
						target="_blank"
						title={social.name}
						rel="noopener noreferrer"
						class="btn-icon btn-icon-primary transition-all duration-300 hover:scale-110"
					>
						{@html social.icon}
					</a>
				{/each}
			{:else}
				<a
					href="https://www.linkedin.com/in/nujkram/"
					target="_blank"
					title="LinkedIn"
					rel="noopener noreferrer"
					class="btn-icon btn-icon-primary transition-all duration-300 hover:scale-110"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" fill="currentColor"><path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"/></svg>
				</a>
				<a
					href="https://github.com/nujkram"
					target="_blank"
					title="GitHub"
					rel="noopener noreferrer"
					class="btn-icon btn-icon-primary transition-all duration-300 hover:scale-110"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 640 640"><path d="M237.9 461.4C237.9 463.4 235.6 465 232.7 465C229.4 465.3 227.1 463.7 227.1 461.4C227.1 459.4 229.4 457.8 232.3 457.8C235.3 457.5 237.9 459.1 237.9 461.4zM206.8 456.9C206.1 458.9 208.1 461.2 211.1 461.8C213.7 462.8 216.7 461.8 217.3 459.8C217.9 457.8 216 455.5 213 454.6C210.4 453.9 207.5 454.9 206.8 456.9zM251 455.2C248.1 455.9 246.1 457.8 246.4 460.1C246.7 462.1 249.3 463.4 252.3 462.7C255.2 462 257.2 460.1 256.9 458.1C256.6 456.2 253.9 454.9 251 455.2zM316.8 72C178.1 72 72 177.3 72 316C72 426.9 141.8 521.8 241.5 555.2C254.3 557.5 258.8 549.6 258.8 543.1C258.8 536.9 258.5 502.7 258.5 481.7C258.5 481.7 188.5 496.7 173.8 451.9C173.8 451.9 162.4 422.8 146 415.3C146 415.3 123.1 399.6 147.6 399.9C147.6 399.9 172.5 401.9 186.2 425.7C208.1 464.3 244.8 453.2 259.1 446.6C261.4 430.6 267.9 419.5 275.1 412.9C219.2 406.7 162.8 398.6 162.8 302.4C162.8 274.9 170.4 261.1 186.4 243.5C183.8 237 175.3 210.2 189 175.6C209.9 169.1 258 202.6 258 202.6C278 197 299.5 194.1 320.8 194.1C342.1 194.1 363.6 197 383.6 202.6C383.6 202.6 431.7 169 452.6 175.6C466.3 210.3 457.8 237 455.2 243.5C471.2 261.2 481 275 481 302.4C481 398.9 422.1 406.6 366.2 412.9C375.4 420.8 383.2 435.8 383.2 459.3C383.2 493 382.9 534.7 382.9 542.9C382.9 549.4 387.5 557.3 400.2 555C500.2 521.8 568 426.9 568 316C568 177.3 455.5 72 316.8 72zM169.2 416.9C167.9 417.9 168.2 420.2 169.9 422.1C171.5 423.7 173.8 424.4 175.1 423.1C176.4 422.1 176.1 419.8 174.4 417.9C172.8 416.3 170.5 415.6 169.2 416.9zM158.4 408.8C157.7 410.1 158.7 411.7 160.7 412.7C162.3 413.7 164.3 413.4 165 412C165.7 410.7 164.7 409.1 162.7 408.1C160.7 407.5 159.1 407.8 158.4 408.8zM190.8 444.4C189.2 445.7 189.8 448.7 192.1 450.6C194.4 452.9 197.3 453.2 198.6 451.6C199.9 450.3 199.3 447.3 197.3 445.4C195.1 443.1 192.1 442.8 190.8 444.4zM179.4 429.7C177.8 430.7 177.8 433.3 179.4 435.6C181 437.9 183.7 438.9 185 437.9C186.6 436.6 186.6 434 185 431.7C183.6 429.4 181 428.4 179.4 429.7z"/></svg>
				</a>
			{/if}
		</div>

		<nav class="hero-nav flex flex-wrap gap-2 justify-center mt-4">
			{#each ['About', 'Experience', ...(profile?.portfolio?.length ? ['Projects'] : []), 'Education', 'Skills', ...(profile?.testimonials?.length ? ['Testimonials'] : []), 'Contact'] as section}
				<a href="#{section.toLowerCase()}" class="chip">{section}</a>
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
				<span class="font-bold text-primary-500 dark:text-primary-400">{detail.label}:</span>
				{#if detail.label === 'Website' && detail.value}
					<a href={detail.value} target="_blank" rel="noopener noreferrer" class="anchor">{detail.value}</a>
				{:else}
					<span>{detail.value || 'NA'}</span>
				{/if}
			</div>
		{/each}
	</div>

	<hr class="!border-surface-500/30 my-4" />
	<p class="text-justify leading-relaxed">{experience} {profile?.experience || '--'}</p>
	{#if profile?.workBackground}
		<p class="text-justify leading-relaxed mt-4">{profile.workBackground}</p>
	{/if}
	{#if profile?.expertise}
		<p class="text-justify leading-relaxed mt-4">{profile.expertise}</p>
	{/if}

	{#if profile?.facts}
		<div class="about-stats grid grid-cols-3 gap-4 mt-6">
			{#each Object.entries(profile.facts) as [key, value], i}
				{@const StatIcon = factIconMap[key] || Archive}
				<div class="about-stat card card-ghost p-4 flex flex-col items-center text-center">
					<StatIcon width={22} height={22} />
					<span
						class="h3 font-bold text-primary-500 mt-2"
						data-target={value}
						bind:this={factElements[i]}>0</span
					>
					<span class="text-xs uppercase tracking-wide opacity-70 mt-1">{key}</span>
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- Work Experience Section -->
<section id="experience" bind:this={experienceSection} class="card p-6 mb-8">
	<h2 class="h2 gradient-heading mb-6">Work Experience</h2>

	<div class="relative pl-8 border-l-2 border-primary-500/30">
		{#each [...(profile?.experiences || [])].reverse() as exp}
			<div class="experience-item relative mb-8 last:mb-0">
				<!-- Timeline dot -->
				<div
					class="absolute -left-[calc(2rem+5px)] top-1 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-surface-50 dark:ring-surface-950"
				></div>

				<div class="card card-ghost p-4 hover:bg-primary-500/5 hover:border-primary-500/40 transition-all duration-300">
					<div class="flex flex-wrap items-baseline gap-2 mb-1">
						<h3 class="h3 text-primary-500 dark:text-primary-400">{exp?.title}</h3>
						<span class="badge badge-soft-surface">{exp?.date || 'NA'}</span>
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

<!-- Projects Section -->
{#if profile?.portfolio?.length}
	<section id="projects" bind:this={projectsSection} class="card p-6 mb-8">
		<h2 class="h2 gradient-heading mb-6">Projects</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each profile.portfolio as project}
				<div
					class="project-card card card-ghost p-5 flex flex-col gap-3 hover:bg-primary-500/5 hover:border-primary-500/40 transition-all duration-300"
				>
					<h3 class="h4 text-primary-500 dark:text-primary-400">{project.title}</h3>
					{#if project.description}
						<p class="text-sm opacity-80 flex-1">{project.description}</p>
					{/if}
					{#if project.tech}
						<div class="flex flex-wrap gap-1.5">
							{#each techList(project.tech) as tech}
								<span class="badge badge-soft-primary">{tech}</span>
							{/each}
						</div>
					{/if}
					{#if project.link || project.repo}
						<div class="flex gap-4 mt-1">
							{#if project.link}
								<a href={project.link} target="_blank" rel="noopener noreferrer" class="anchor text-sm"
									>Live ↗</a
								>
							{/if}
							{#if project.repo}
								<a href={project.repo} target="_blank" rel="noopener noreferrer" class="anchor text-sm"
									>Source ↗</a
								>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{/if}

<!-- Education & Skills Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
	<section id="education" bind:this={educationSection} class="card p-6">
		<h2 class="h2 gradient-heading mb-4">Education</h2>

		<div class="space-y-6">
			<div>
				<div class="flex items-baseline gap-2">
					<h4 class="h4">Masters</h4>
					<span class="badge badge-soft-primary">{profile?.mastersYear || 'NA'}</span>
				</div>
				<p class="font-bold mt-1">{profile?.mastersDegree || 'NA'}</p>
				<p class="italic text-primary-500 dark:text-primary-400 underline">{profile?.mastersSchool || 'NA'}</p>
				<p class="text-sm opacity-70 mt-1">{profile?.mastersDescription || 'NA'}</p>
			</div>
			<hr class="!border-surface-500/30" />
			<div>
				<div class="flex items-baseline gap-2">
					<h4 class="h4">College</h4>
					<span class="badge badge-soft-primary">{profile?.collegeYear || 'NA'}</span>
				</div>
				<p class="font-bold mt-1">{profile?.collegeDegree || 'NA'}</p>
				<p class="italic text-primary-500 dark:text-primary-400 underline">{profile?.collegeSchool || 'NA'}</p>
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

<!-- Testimonials Section -->
{#if profile?.testimonials?.length}
	<section
		id="testimonials"
		bind:this={testimonialsSection}
		class="mb-8"
		aria-roledescription="carousel"
		aria-label="Testimonials"
		onpointerenter={() => (paused = true)}
		onpointerleave={() => (paused = false)}
		onfocusin={() => (paused = true)}
		onfocusout={() => (paused = false)}
	>
		<div class="flex items-center justify-between mb-6 gap-4">
			<h2 class="h2 gradient-heading">Testimonials</h2>
			{#if profile.testimonials.length > 1}
				<div class="flex gap-2 shrink-0">
					<button
						type="button"
						class="btn-icon btn-icon-ghost"
						aria-label="Previous testimonial"
						onclick={() => goTo(current - 1)}>‹</button
					>
					<button
						type="button"
						class="btn-icon btn-icon-ghost"
						aria-label="Next testimonial"
						onclick={() => goTo(current + 1)}>›</button
					>
				</div>
			{/if}
		</div>

		<div
			bind:this={carousel}
			onscroll={syncCurrent}
			class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scroll-smooth"
		>
			{#each profile.testimonials as testimonial}
				<figure
					class="testimonial-card card card-ghost p-6 shrink-0 w-[85%] sm:w-[420px] snap-center flex flex-col"
				>
					<div class="text-5xl leading-none text-primary-500/40 font-serif">&ldquo;</div>
					<blockquote class="flex-1 -mt-2 leading-relaxed opacity-90">
						{testimonial.message}
					</blockquote>
					<figcaption class="flex items-center gap-3 mt-5 pt-4 border-t border-surface-500/20">
						{#if testimonial.image}
							<img
								src={testimonial.image}
								alt={testimonial.name}
								class="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/40"
							/>
						{:else}
							<div
								class="w-12 h-12 rounded-full flex items-center justify-center bg-primary-500/15 text-primary-600 dark:text-primary-300 font-bold shrink-0"
							>
								{initials(testimonial.name) || '?'}
							</div>
						{/if}
						<div>
							<p class="font-semibold">{testimonial.name}</p>
							<p class="text-sm opacity-60">
								{testimonial.position}{#if testimonial.position && testimonial.company}, {/if}{testimonial.company}
							</p>
						</div>
					</figcaption>
				</figure>
			{/each}
		</div>

		{#if profile.testimonials.length > 1}
			<div class="flex justify-center gap-2 mt-2">
				{#each profile.testimonials as _, i}
					<button
						type="button"
						class="h-2 rounded-full transition-all duration-300 {current === i
							? 'w-6 bg-primary-500'
							: 'w-2 bg-surface-400/50 hover:bg-surface-400'}"
						aria-label="Go to testimonial {i + 1}"
						aria-current={current === i ? 'true' : undefined}
						onclick={() => goTo(i)}
					></button>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<!-- Contact Section -->
<section id="contact" class="card p-6 mb-8">
	<h2 class="h2 gradient-heading mb-2 text-center">Let's Work Together</h2>
	<p class="mb-6 text-center opacity-70">Have a project in mind? I'd love to hear about it.</p>

	<form class="mx-auto flex max-w-xl flex-col gap-4" onsubmit={submitContact}>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<label class="label">
				<span>Name</span>
				<input
					class="input"
					type="text"
					name="name"
					required
					maxlength="120"
					autocomplete="name"
					bind:value={contact.name}
					placeholder="Your name"
				/>
			</label>
			<label class="label">
				<span>Email</span>
				<input
					class="input"
					type="email"
					name="email"
					required
					maxlength="254"
					autocomplete="email"
					bind:value={contact.email}
					placeholder="you@example.com"
				/>
			</label>
		</div>
		<label class="label">
			<span>Message</span>
			<textarea
				class="textarea"
				name="message"
				rows="5"
				required
				minlength="10"
				maxlength="5000"
				bind:value={contact.message}
				placeholder="Tell me about your project…"></textarea>
		</label>
		<!-- Honeypot: humans never see this field; bots can't resist it. -->
		<label class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
			<span>Company</span>
			<input type="text" name="company" tabindex="-1" autocomplete="off" bind:value={contact.company} />
		</label>
		<button type="submit" class="btn btn-primary self-center px-10" disabled={sending}>
			{sending ? 'Sending…' : 'Send Message'}
		</button>
	</form>
</section>

<!-- Footer -->
<footer class="text-center py-12 mt-8">
	<p class="text-sm opacity-50">&copy; {date.getFullYear()} {profile?.firstName} {profile?.lastName}. All rights reserved.</p>
</footer>
</div>
