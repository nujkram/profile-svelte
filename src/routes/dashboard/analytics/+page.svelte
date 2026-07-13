<script lang="ts">
	import { format } from 'date-fns';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { days, totalViews, avgDuration, countries } = data;

	const maxDay = Math.max(1, ...days.map((d: any) => d.count));
	const maxCountry = Math.max(1, ...countries.map((c: any) => c.count));
	const busiest = days.reduce((a: any, b: any) => (b.count > a.count ? b : a), days[0]);

	const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
	const countryName = (code: string) => {
		if (code === 'ZZ') return 'Unknown';
		try {
			return regionNames.of(code) || code;
		} catch {
			return code;
		}
	};
	const flag = (code: string) =>
		code === 'ZZ'
			? '🌐'
			: String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

	const mmss = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return m ? `${m}m ${s}s` : `${s}s`;
	};

	const dayLabel = (date: string) => format(new Date(date + 'T00:00:00'), 'MMM d');

	const tiles = [
		{ label: 'Views (30 days)', value: totalViews },
		{ label: 'Avg time on page', value: mmss(avgDuration) },
		{
			label: 'Top country',
			value: countries.length ? `${flag(countries[0].code)} ${countryName(countries[0].code)}` : '—'
		},
		{ label: 'Busiest day', value: busiest?.count ? dayLabel(busiest.date) : '—' }
	];
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<header>
		<h1 class="h3">Analytics</h1>
		<p class="opacity-60 text-sm">
			Visitor activity on your public profile. Aggregates only — no cookies, IPs, or personal data
			are stored, and Do Not Track is honoured.
		</p>
	</header>

	<!-- Stat tiles -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		{#each tiles as tile}
			<div class="card p-5">
				<p class="text-2xl font-bold">{tile.value}</p>
				<p class="text-sm opacity-60">{tile.label}</p>
			</div>
		{/each}
	</div>

	<!-- Daily views -->
	<section class="card p-6">
		<h2 class="h4 mb-4">Daily views — last 30 days</h2>
		<div
			class="flex items-end gap-[2px] h-40"
			role="img"
			aria-label="Daily view counts for the last 30 days"
		>
			{#each days as day}
				<div
					class="group relative flex-1 flex flex-col justify-end h-full"
					title="{dayLabel(day.date)} — {day.count} view{day.count === 1 ? '' : 's'}"
				>
					<div
						class="w-full rounded-t bg-primary-500 transition-colors group-hover:bg-primary-400 {day.count
							? ''
							: 'opacity-20'}"
						style="height: {day.count ? Math.max(4, (day.count / maxDay) * 100) : 2}%"
					></div>
				</div>
			{/each}
		</div>
		<div class="flex justify-between mt-2 text-xs opacity-50">
			<span>{dayLabel(days[0].date)}</span>
			<span>{dayLabel(days[days.length - 1].date)}</span>
		</div>
	</section>

	<!-- Countries -->
	<section class="card p-6">
		<h2 class="h4 mb-4">Visitors by country</h2>
		{#if countries.length === 0}
			<p class="opacity-60">
				No visits recorded yet — country data appears once real traffic arrives.
			</p>
		{:else}
			<ul class="space-y-3">
				{#each countries as country}
					<li class="flex items-center gap-3">
						<span class="text-xl w-7 text-center shrink-0" aria-hidden="true"
							>{flag(country.code)}</span
						>
						<span class="w-36 truncate shrink-0">{countryName(country.code)}</span>
						<div class="flex-1 h-3 rounded-full bg-surface-500/10 overflow-hidden">
							<div
								class="h-full rounded-full bg-primary-500"
								style="width: {(country.count / maxCountry) * 100}%"
							></div>
						</div>
						<span class="w-12 text-right text-sm opacity-70 shrink-0">{country.count}</span>
					</li>
				{/each}
			</ul>
			<p class="mt-4 text-xs opacity-50">
				Country comes from the CDN edge header at request time; “Unknown” covers local traffic and
				visitors whose location isn’t reported.
			</p>
		{/if}
	</section>
</div>
