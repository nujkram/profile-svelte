<script lang="ts">
	import { page } from '$app/state';

	const status = $derived(page.status);

	const quips: Record<number, { emoji: string; title: string; quip: string }> = {
		400: {
			emoji: '🤨',
			title: 'That request made no sense',
			quip: 'The server read it twice, squinted, and gave up. No hard feelings — happens to the best of us.'
		},
		401: {
			emoji: '🔐',
			title: 'Members only, I’m afraid',
			quip: 'You’ve found the dashboard — Mark’s private control room. It’s mostly buttons he presses while nodding seriously. Honestly, you’re not missing much.'
		},
		403: {
			emoji: '🚧',
			title: 'You shall not pass',
			quip: 'This area is protected by an invisible bouncer. He’s very good at his job and completely immune to flattery.'
		},
		404: {
			emoji: '🕵️',
			title: 'Page not found',
			quip: 'Either this page never existed, or it saw you coming and hid. Our best detective is on the case, and he’s found nothing. He’s not a very good detective.'
		},
		500: {
			emoji: '🔥',
			title: 'Something broke (it was probably us)',
			quip: 'The hamster powering this server has fallen off its wheel. A developer has been dispatched, muttering about semicolons. Everything is fine. This is fine.'
		}
	};

	const fallback = {
		emoji: '🤷',
		title: 'Well, this is awkward',
		quip: 'Something went wrong in a way we didn’t even have a joke prepared for. Congratulations — you’ve found a truly original error.'
	};

	const info = $derived(quips[status] ?? fallback);
</script>

<svelte:head>
	<title>{status} — {info.title}</title>
</svelte:head>

<div class="flex min-h-[80dvh] items-center justify-center px-4">
	<div class="card mx-auto flex w-full max-w-xl flex-col items-center gap-4 p-10 text-center">
		<span class="text-6xl" aria-hidden="true">{info.emoji}</span>
		<p class="gradient-heading text-7xl font-bold leading-none md:text-8xl">{status}</p>
		<h1 class="h2">{info.title}</h1>
		<p class="leading-relaxed opacity-70">{info.quip}</p>

		{#if page.error?.message && page.error.message !== 'Not Found'}
			<p class="text-xs italic opacity-40">The technical bit: {page.error.message}</p>
		{/if}

		<div class="mt-2 flex flex-wrap justify-center gap-3">
			<a href="/" class="btn btn-primary">Take me home</a>
			<button type="button" class="btn btn-ghost" onclick={() => history.back()}>
				Retreat slowly
			</button>
		</div>
	</div>
</div>
