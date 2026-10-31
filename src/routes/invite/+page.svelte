<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Toggle } from '$lib/components/ui';
	import { reveal } from '$lib/actions/reveal';
	import { confetti } from './confetti';

	let { data }: { data: any } = $props();
	const inv = $derived(data.invitation);

	const TBA = 'To be announced';
	const STORAGE_KEY = 'invite-rsvp';

	// Photos live in /static, in the same order as the kids. Set src to '' to
	// show the placeholder; position is the focal point for the circle crop.
	const PHOTOS = [
		{ src: '/ada-invite.jpeg', position: '50% 8%' },
		{ src: '/jin.jpeg', position: '44% 22%' }
	];

	const mapLink = (url: string, address: string, venue: string) =>
		url ||
		(address || venue
			? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue, address].filter(Boolean).join(', '))}`
			: '');

	const events = $derived([
		{
			icon: '🕊️',
			heading: 'Baptism',
			time: inv.baptismTime,
			venue: inv.baptismVenue,
			address: inv.baptismAddress,
			map: mapLink(inv.baptismMapUrl, inv.baptismAddress, inv.baptismVenue)
		},
		{
			icon: '🎈',
			heading: 'Celebration',
			time: inv.partyTime,
			venue: inv.partyVenue,
			address: inv.partyAddress,
			map: mapLink(inv.partyMapUrl, inv.partyAddress, inv.partyVenue)
		}
	]);

	// Countdown runs client-side only so SSR and hydration agree
	let daysLeft: number | null = $state(null);
	let shownDays = $state(0);
	onMount(() => {
		const update = () => {
			const target = new Date(`${inv.date}T00:00:00`);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			daysLeft = Math.round((target.getTime() - today.getTime()) / 86_400_000);
		};
		update();
		countUp(daysLeft ?? 0);
		const timer = setInterval(update, 60_000);

		// A welcome burst once the hero has popped in
		const welcome = setTimeout(() => {
			confetti({ x: 0.2, y: 0.35, count: 60, spread: 70 });
			confetti({ x: 0.8, y: 0.35, count: 60, spread: 70 });
		}, 900);

		return () => {
			clearInterval(timer);
			clearTimeout(welcome);
		};
	});

	// Tick the day counter up from 0 for a bit of anticipation
	const countUp = (target: number) => {
		if (target <= 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			shownDays = target;
			return;
		}
		const start = performance.now();
		const duration = 1400;
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			shownDays = Math.round(target * (1 - Math.pow(1 - t, 3)));
			if (t < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	};

	// Tapping a photo throws a little confetti from it
	const celebrate = (event: MouseEvent) => {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		confetti({
			x: (rect.left + rect.width / 2) / innerWidth,
			y: (rect.top + rect.height / 2) / innerHeight,
			count: 45,
			spread: 160,
			speed: 9
		});
	};

	// RSVP form
	let name = $state('');
	let attending: boolean | null = $state(null);
	let plusOne = $state(false);
	let plusOneName = $state('');
	let kids = $state(0);
	let company = $state('');
	let submitting = $state(false);
	let error = $state('');
	let submitted = $state(false);

	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
			if (saved?.name) {
				({ name, attending, plusOne, plusOneName, kids } = saved);
				submitted = true;
			}
		} catch {
			// storage unavailable — form just starts empty
		}
	});

	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		error = '';
		if (attending === null) {
			error = 'Please let us know if you can make it';
			return;
		}
		submitting = true;
		try {
			const payload = {
				name,
				attending,
				plusOne: attending && plusOne,
				plusOneName: attending && plusOne ? plusOneName : '',
				kids: attending ? kids : 0,
				company
			};
			const response = await fetch('/api/rsvp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = await response.json();
			if (!response.ok) {
				error = result.message || 'Something went wrong, please try again';
				return;
			}
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
			} catch {
				// not critical
			}
			submitted = true;
			if (attending) confetti({ y: 0.6, count: 160, spread: 140, speed: 14 });
		} catch {
			error = 'Could not send your RSVP — check your connection and try again';
		} finally {
			submitting = false;
		}
	};
</script>

<svelte:head>
	<title>Ada & Jin's Celebration · {inv.dateText}</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta property="og:title" content="Ada turns 3 · Jin turns 1 & gets baptized" />
	<meta property="og:description" content="{inv.dateText} — please RSVP!" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{page.url.origin}/invite" />
	<meta property="og:image" content="{page.url.origin}/ada-and-jin.jpeg" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1536" />
	<meta property="og:image:height" content="1024" />
	<meta
		property="og:image:alt"
		content="Invitation for Jin's christening and 1st birthday and Ada's 3rd birthday"
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="description" content="{inv.dateText} — please RSVP!" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="invite fixed inset-0 -z-10" aria-hidden="true">
	<span class="balloon b1"></span>
	<span class="balloon b2"></span>
	<span class="balloon b3"></span>
	<span class="balloon b4"></span>
</div>

<article class="invite-font mx-auto max-w-xl space-y-6 pb-16 pt-10">
	<!-- Hero -->
	<header class="paper p-8 text-center">
		<p class="rise text-sm font-medium uppercase tracking-[0.25em] text-rose-400">
			{inv.title}
		</p>
		<div class="mt-6 grid gap-6 sm:grid-cols-2">
			{#each inv.kids as kid, i}
				{@const photo = PHOTOS[i]}
				<div class="pop space-y-1" style:animation-delay="{200 + i * 220}ms">
					{#if photo?.src}
						<button
							type="button"
							class="photo-btn relative mx-auto block"
							aria-label="Celebrate {kid.name.split(' ')[0]}!"
							onclick={celebrate}
						>
							<img
								src={photo.src}
								alt={kid.name}
								class="bob h-32 w-32 rounded-full object-cover ring-4 {i === 0
									? 'ring-rose-200 dark:ring-rose-400/40'
									: 'ring-sky-200 dark:ring-sky-400/40'}"
								style:object-position={photo.position}
								style:animation-delay="{i * -2}s"
							/>
							<span class="sparkle -right-2 top-1" aria-hidden="true">✨</span>
							<span
								class="sparkle -left-3 bottom-3 text-sm"
								style:animation-delay="1.2s"
								aria-hidden="true">{i === 0 ? '💖' : '💙'}</span
							>
						</button>
					{:else}
						<div
							class="mx-auto flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed {i ===
							0
								? 'border-rose-300 bg-rose-50 text-rose-400 dark:border-rose-400/50 dark:bg-rose-400/10 dark:text-rose-300'
								: 'border-sky-300 bg-sky-50 text-sky-400 dark:border-sky-400/50 dark:bg-sky-400/10 dark:text-sky-300'}"
							role="img"
							aria-label="Photo of {kid.name} coming soon"
						>
							<span class="text-4xl" aria-hidden="true">{i === 0 ? '🎀' : '⭐'}</span>
							<span class="text-xs font-medium" aria-hidden="true">Photo soon</span>
						</div>
					{/if}
					<h2
						class="text-2xl font-semibold {i === 0
							? 'text-rose-500 dark:text-rose-300'
							: 'text-sky-500 dark:text-sky-300'}"
					>
						{kid.name.split(' ')[0]}
					</h2>
					<p class="text-sm text-slate-500 dark:text-slate-400">{kid.name}</p>
					<p
						class="inline-block rounded-full px-3 py-1 text-sm font-medium {i === 0
							? 'bg-rose-50 dark:bg-rose-400/15 text-rose-600 dark:text-rose-300'
							: 'bg-sky-50 dark:bg-sky-400/15 text-sky-600 dark:text-sky-300'}"
					>
						{kid.milestone}
					</p>
				</div>
			{/each}
		</div>

		<div class="rise mt-8 space-y-1" style:animation-delay="700ms">
			<p class="text-xl font-semibold text-slate-700 dark:text-slate-100">{inv.dateText}</p>
			{#if daysLeft !== null}
				<p class="text-sm text-slate-500 dark:text-slate-400">
					{#if daysLeft > 1}
						<span class="font-semibold text-rose-500 dark:text-rose-300">{shownDays}</span> days to go
					{:else if daysLeft === 1}
						Tomorrow!
					{:else if daysLeft === 0}
						Today's the day! 🎉
					{:else}
						Thank you for celebrating with us 💕
					{/if}
				</p>
			{/if}
		</div>

		{#if inv.message}
			<p
				class="rise mt-6 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300"
				style:animation-delay="850ms"
			>
				{inv.message}
			</p>
		{/if}
	</header>

	<!-- Event details -->
	<section class="grid gap-4 sm:grid-cols-2">
		{#each events as ev, i}
			<div class="paper space-y-2 p-6" use:reveal={{ delay: i * 150 }}>
				<h3
					class="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-100"
				>
					<span aria-hidden="true">{ev.icon}</span>
					{ev.heading}
				</h3>
				<dl class="space-y-1 text-sm text-slate-600 dark:text-slate-300">
					<div>
						<dt class="sr-only">Time</dt>
						<dd class={ev.time ? '' : 'italic text-slate-400 dark:text-slate-500'}>
							🕒 {ev.time || TBA}
						</dd>
					</div>
					<div>
						<dt class="sr-only">Venue</dt>
						<dd class={ev.venue ? 'font-medium' : 'italic text-slate-400 dark:text-slate-500'}>
							📍 {ev.venue || TBA}
						</dd>
					</div>
					{#if ev.address}
						<div>
							<dt class="sr-only">Address</dt>
							<dd class="pl-6 text-slate-500 dark:text-slate-400">{ev.address}</dd>
						</div>
					{/if}
				</dl>
				{#if ev.map}
					<a
						href={ev.map}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-block pt-1 text-sm font-medium text-rose-500 dark:text-rose-300 underline underline-offset-2"
						>Open in Maps →</a
					>
				{/if}
			</div>
		{/each}
	</section>

	{#if inv.dressCode}
		<section class="paper p-6 text-center" use:reveal>
			<h3 class="text-sm font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
				Dress code
			</h3>
			<p class="mt-1 text-slate-700 dark:text-slate-100">{inv.dressCode}</p>
		</section>
	{/if}

	<!-- RSVP -->
	<section class="paper p-6 sm:p-8" id="rsvp" use:reveal>
		<h3 class="text-center text-2xl font-semibold text-slate-700 dark:text-slate-100">RSVP</h3>
		{#if inv.rsvpDeadline}
			<p class="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
				Kindly reply by {inv.rsvpDeadline}
			</p>
		{/if}

		{#if !inv.rsvpOpen}
			<p class="mt-6 text-center text-slate-600 dark:text-slate-300">
				RSVPs are now closed. Please message us directly if your plans changed. 💌
			</p>
		{:else if submitted}
			<div class="mt-6 space-y-4 text-center">
				<p class="bounce text-4xl" aria-hidden="true">{attending ? '🥳' : '💌'}</p>
				<p class="text-lg text-slate-700 dark:text-slate-100">
					{#if attending}
						Thank you, {name}! We can't wait to see you.
					{:else}
						Thank you for letting us know, {name}. You'll be missed!
					{/if}
				</p>
				{#if attending}
					<p class="text-sm text-slate-500 dark:text-slate-400">
						{plusOne ? `With ${plusOneName}` : 'No plus-one'}
						· {kids}
						{kids === 1 ? 'kid' : 'kids'}
					</p>
				{/if}
				<button type="button" class="pill-btn-ghost" onclick={() => (submitted = false)}>
					Update my RSVP
				</button>
			</div>
		{:else}
			<form class="mt-6 space-y-5" onsubmit={submit}>
				<label class="block space-y-1">
					<span class="text-sm font-medium text-slate-600 dark:text-slate-300">Your name</span>
					<input
						class="field"
						type="text"
						bind:value={name}
						required
						maxlength="120"
						autocomplete="name"
						placeholder="e.g. Tita Maria Santos"
					/>
					<span class="block text-xs text-slate-400 dark:text-slate-500"
						>Already replied? Use the same name to update your answer.</span
					>
				</label>

				<fieldset class="space-y-2">
					<legend class="text-sm font-medium text-slate-600 dark:text-slate-300"
						>Will you be joining us?</legend
					>
					<div class="grid grid-cols-2 gap-3">
						<button
							type="button"
							class="choice {attending === true ? 'choice-on' : ''}"
							aria-pressed={attending === true}
							onclick={() => (attending = true)}>I'll be there 🎉</button
						>
						<button
							type="button"
							class="choice {attending === false ? 'choice-on' : ''}"
							aria-pressed={attending === false}
							onclick={() => (attending = false)}>Can't make it</button
						>
					</div>
				</fieldset>

				{#if attending}
					<div class="flex items-center justify-between gap-4">
						<span class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>Bringing a plus-one?</span
						>
						<Toggle bind:checked={plusOne} label="Bringing a plus-one" />
					</div>
					{#if plusOne}
						<label class="block space-y-1">
							<span class="text-sm font-medium text-slate-600 dark:text-slate-300"
								>Plus-one's name</span
							>
							<input
								class="field"
								type="text"
								bind:value={plusOneName}
								required
								maxlength="120"
								placeholder="Their full name"
							/>
						</label>
					{/if}
					<div class="flex items-center justify-between gap-4">
						<span class="text-sm font-medium text-slate-600 dark:text-slate-300">
							Kids coming with you
							<span class="block text-xs font-normal text-slate-400 dark:text-slate-500"
								>Not counting yourself</span
							>
						</span>
						<div class="flex items-center gap-3">
							<button
								type="button"
								class="stepper"
								aria-label="One fewer kid"
								disabled={kids <= 0}
								onclick={() => (kids = Math.max(0, kids - 1))}>−</button
							>
							<span
								class="w-6 text-center text-lg font-semibold text-slate-700 dark:text-slate-100"
								aria-live="polite">{kids}</span
							>
							<button
								type="button"
								class="stepper"
								aria-label="One more kid"
								disabled={kids >= 10}
								onclick={() => (kids = Math.min(10, kids + 1))}>+</button
							>
						</div>
					</div>
				{/if}

				<!-- Honeypot: hidden from people, irresistible to bots -->
				<div class="absolute -left-[9999px]" aria-hidden="true">
					<label>Company <input type="text" tabindex="-1" bind:value={company} /></label>
				</div>

				{#if error}
					<p
						class="rounded-lg bg-rose-50 dark:bg-rose-400/15 px-3 py-2 text-sm text-rose-600 dark:text-rose-300"
						role="alert"
					>
						{error}
					</p>
				{/if}

				<button type="submit" class="pill-btn w-full" disabled={submitting}>
					{submitting ? 'Sending…' : 'Send RSVP'}
				</button>
			</form>
		{/if}
	</section>

	<p class="text-center text-sm text-slate-500 dark:text-slate-400">
		With love, the Gersaniva family 💕
	</p>
</article>

<style lang="postcss">
	.invite {
		background:
			radial-gradient(circle at 15% 20%, #ffe4ec 0, transparent 45%),
			radial-gradient(circle at 85% 30%, #e0f2fe 0, transparent 45%),
			radial-gradient(circle at 50% 90%, #fef3c7 0, transparent 50%), #fffaf7;
		overflow: hidden;
	}
	:global(.dark) .invite {
		background:
			radial-gradient(circle at 15% 20%, rgba(244, 114, 182, 0.18) 0, transparent 45%),
			radial-gradient(circle at 85% 30%, rgba(56, 189, 248, 0.15) 0, transparent 45%),
			radial-gradient(circle at 50% 90%, rgba(251, 191, 36, 0.1) 0, transparent 50%), #1a1523;
	}
	.invite-font {
		font-family: 'Fredoka', ui-rounded, system-ui, sans-serif;
	}
	.paper {
		@apply rounded-3xl border border-white bg-white/90 shadow-[0_10px_40px_-15px_rgba(244,114,182,0.35)];
	}
	.field {
		@apply w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-300;
	}
	.invite-font :global([role='switch'][aria-checked='true']) {
		background-color: #fb7185;
	}
	.choice {
		@apply rounded-xl border border-rose-100 bg-white px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300;
	}
	.choice-on {
		@apply border-rose-400 bg-rose-50 text-rose-600;
	}
	.stepper {
		@apply flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-lg font-semibold text-rose-600 transition-colors hover:bg-rose-200 disabled:opacity-40;
	}
	.pill-btn {
		@apply rounded-full bg-rose-400 px-6 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-rose-500 hover:shadow-lg active:translate-y-0 disabled:opacity-60;
	}
	.pill-btn-ghost {
		@apply rounded-full bg-rose-50 px-5 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100;
	}

	:global(.dark) .paper {
		@apply border-white/10 bg-slate-900/85 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)];
	}
	:global(.dark) .field {
		@apply border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500;
	}
	:global(.dark) .choice {
		@apply border-slate-700 bg-slate-800 text-slate-300 hover:border-rose-400;
	}
	:global(.dark) .choice-on {
		@apply border-rose-400 bg-rose-400/15 text-rose-300;
	}
	:global(.dark) .stepper {
		@apply bg-rose-400/20 text-rose-300 hover:bg-rose-400/30;
	}
	:global(.dark) .pill-btn-ghost {
		@apply bg-rose-400/15 text-rose-300 hover:bg-rose-400/25;
	}

	.balloon {
		position: absolute;
		width: 70px;
		height: 86px;
		border-radius: 50% 50% 48% 48%;
		opacity: 0.35;
		animation: float 12s ease-in-out infinite;
	}
	.balloon::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 100%;
		width: 1px;
		height: 60px;
		background: currentColor;
		opacity: 0.4;
	}
	.b1 {
		left: 6%;
		top: 12%;
		background: #fda4af;
		color: #fda4af;
	}
	.b2 {
		right: 8%;
		top: 18%;
		background: #7dd3fc;
		color: #7dd3fc;
		animation-delay: -3s;
	}
	.b3 {
		left: 10%;
		bottom: 18%;
		background: #fcd34d;
		color: #fcd34d;
		animation-delay: -6s;
	}
	.b4 {
		right: 12%;
		bottom: 10%;
		background: #c4b5fd;
		color: #c4b5fd;
		animation-delay: -9s;
	}
	@keyframes float {
		0%,
		100% {
			transform: translateY(0) rotate(-3deg);
		}
		50% {
			transform: translateY(-24px) rotate(3deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.balloon {
			animation: none;
		}
	}

	/* Entrance, photo and celebration effects */
	.photo-btn {
		-webkit-tap-highlight-color: transparent;
		border-radius: 9999px;
	}
	.photo-btn:focus-visible {
		@apply outline-none ring-2 ring-rose-300 ring-offset-4;
	}
	.sparkle {
		position: absolute;
		pointer-events: none;
		font-size: 1.1rem;
	}

	@media (prefers-reduced-motion: no-preference) {
		.rise {
			animation: rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
		}
		.pop {
			animation: pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
		}
		.bob {
			animation: bob 4s ease-in-out infinite;
		}
		.photo-btn:hover .bob,
		.photo-btn:active .bob {
			animation: wiggle 0.5s ease-in-out;
		}
		.sparkle {
			animation: twinkle 2.4s ease-in-out infinite;
		}
		.bounce {
			display: inline-block;
			animation: bounce 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 2;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.6) translateY(20px);
		}
	}
	@keyframes bob {
		0%,
		100% {
			transform: translateY(0) rotate(-1.5deg);
		}
		50% {
			transform: translateY(-6px) rotate(1.5deg);
		}
	}
	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(0) scale(1.04);
		}
		25% {
			transform: rotate(-6deg) scale(1.06);
		}
		75% {
			transform: rotate(6deg) scale(1.06);
		}
	}
	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.2;
			transform: scale(0.7) rotate(0);
		}
		50% {
			opacity: 1;
			transform: scale(1.15) rotate(15deg);
		}
	}
	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0) scale(1);
		}
		40% {
			transform: translateY(-14px) scale(1.15);
		}
	}
</style>
