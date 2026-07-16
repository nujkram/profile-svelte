<script lang="ts">
	import { format } from 'date-fns';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const {
		days,
		totalViews,
		prevViews,
		avgDuration,
		messagesCount,
		weekdays,
		countries,
		referrers,
		sections,
		events
	} = data;

	const maxDay = Math.max(1, ...days.map((d: any) => d.count));
	const maxWeekday = Math.max(1, ...weekdays.map((w: any) => w.avg));
	const maxCountry = Math.max(1, ...countries.map((c: any) => c.count));
	const maxReferrer = Math.max(1, ...referrers.map((r: any) => r.count));
	const maxEvent = Math.max(1, ...events.map((e: any) => e.count));
	const busiest = days.reduce((a: any, b: any) => (b.count > a.count ? b : a), days[0]);

	// Views trend vs the previous 30-day window
	const delta = prevViews > 0 ? Math.round(((totalViews - prevViews) / prevViews) * 100) : null;

	// Contact conversion rate
	const contactRate = totalViews ? Math.round((messagesCount / totalViews) * 1000) / 10 : 0;

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

	const referrerLabels: Record<string, string> = {
		direct: 'Direct / bookmark',
		google: 'Google',
		bing: 'Bing',
		linkedin: 'LinkedIn',
		github: 'GitHub',
		facebook: 'Facebook',
		x: 'X (Twitter)',
		instagram: 'Instagram',
		youtube: 'YouTube',
		other: 'Other sites'
	};

	const eventLabel = (key: string) => {
		if (key.startsWith('social_')) {
			const name = key.slice(7);
			return `${name.charAt(0).toUpperCase()}${name.slice(1)} clicks`;
		}
		const labels: Record<string, string> = {
			project_live: 'Project demos opened',
			project_source: 'Project source opened',
			website: 'Website link clicks',
			contact_submit: 'Contact form submissions'
		};
		return labels[key] || key;
	};

	// Engagement funnel in page order; % of views that reached each section
	const FUNNEL_ORDER = [
		'about',
		'experience',
		'projects',
		'education',
		'skills',
		'testimonials',
		'contact'
	];
	const sectionCount = (id: string) => sections.find((s: any) => s.key === id)?.count || 0;
	const funnel = FUNNEL_ORDER.map((id) => ({
		id,
		label: id.charAt(0).toUpperCase() + id.slice(1),
		count: sectionCount(id),
		percent: totalViews ? Math.min(100, Math.round((sectionCount(id) / totalViews) * 100)) : 0
	}));
	const hasFunnelData = funnel.some((f) => f.count > 0);

	const mmss = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return m ? `${m}m ${s}s` : `${s}s`;
	};

	const dayLabel = (date: string) => format(new Date(date + 'T00:00:00'), 'MMM d');
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<header>
		<h1 class="h3">Analytics</h1>
		<p class="opacity-60 text-sm">
			Visitor activity on your public profile. Aggregates only — no cookies, IPs, or personal data
			are stored, and Do Not Track is honoured.
		</p>
	</header>

	<!-- KPI tiles -->
	<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
		<div class="card p-5">
			<p class="text-2xl font-bold">{totalViews}</p>
			<p class="text-sm opacity-60">Views (30 days)</p>
			{#if delta !== null}
				<p
					class="text-xs mt-1 {delta >= 0
						? 'text-success-600 dark:text-success-400'
						: 'text-error-600 dark:text-error-400'}"
				>
					{delta >= 0 ? '▲' : '▼'}
					{Math.abs(delta)}% vs previous 30 days
				</p>
			{:else}
				<p class="text-xs mt-1 opacity-40">No previous period to compare yet</p>
			{/if}
		</div>
		<div class="card p-5">
			<p class="text-2xl font-bold">{mmss(avgDuration)}</p>
			<p class="text-sm opacity-60">Avg time on page</p>
		</div>
		<div class="card p-5">
			<p class="text-2xl font-bold">{contactRate}%</p>
			<p class="text-sm opacity-60">Contact rate</p>
			<p class="text-xs mt-1 opacity-40">
				{messagesCount} message{messagesCount === 1 ? '' : 's'} / {totalViews} views
			</p>
		</div>
		<div class="card p-5">
			<p class="text-2xl font-bold">
				{countries.length ? `${flag(countries[0].code)} ${countryName(countries[0].code)}` : '—'}
			</p>
			<p class="text-sm opacity-60">Top country</p>
		</div>
		<div class="card p-5">
			<p class="text-2xl font-bold">
				{referrers.length ? referrerLabels[referrers[0].key] || referrers[0].key : '—'}
			</p>
			<p class="text-sm opacity-60">Top traffic source</p>
		</div>
		<div class="card p-5">
			<p class="text-2xl font-bold">{busiest?.count ? dayLabel(busiest.date) : '—'}</p>
			<p class="text-sm opacity-60">Busiest day</p>
		</div>
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

	<!-- Weekday pattern -->
	<section class="card p-6">
		<h2 class="h4 mb-4">Average views by weekday</h2>
		<div class="flex items-end gap-3 h-28" role="img" aria-label="Average views per weekday">
			{#each weekdays as weekday}
				<div
					class="group flex-1 flex flex-col justify-end items-center h-full gap-1"
					title="{weekday.label} — {weekday.avg} avg views"
				>
					<div
						class="w-full rounded-t bg-primary-500 transition-colors group-hover:bg-primary-400 {weekday.avg
							? ''
							: 'opacity-20'}"
						style="height: {weekday.avg ? Math.max(4, (weekday.avg / maxWeekday) * 100) : 2}%"
					></div>
					<span class="text-xs opacity-50">{weekday.label}</span>
				</div>
			{/each}
		</div>
		<p class="mt-3 text-xs opacity-50">
			Post updates or share your profile on the days visitors are already looking.
		</p>
	</section>

	<!-- Traffic sources -->
	<section class="card p-6">
		<h2 class="h4 mb-4">Traffic sources</h2>
		{#if referrers.length === 0}
			<p class="opacity-60">
				No source data yet — referrers are tallied for visits that arrive after this deploys.
			</p>
		{:else}
			<ul class="space-y-3">
				{#each referrers as referrer}
					<li class="flex items-center gap-3">
						<span class="w-36 truncate shrink-0"
							>{referrerLabels[referrer.key] || referrer.key}</span
						>
						<div class="flex-1 h-3 rounded-full bg-surface-500/10 overflow-hidden">
							<div
								class="h-full rounded-full bg-primary-500"
								style="width: {(referrer.count / maxReferrer) * 100}%"
							></div>
						</div>
						<span class="w-12 text-right text-sm opacity-70 shrink-0">{referrer.count}</span>
					</li>
				{/each}
			</ul>
			<p class="mt-4 text-xs opacity-50">
				Where to invest: sources sending visitors deserve more of your posts and links.
			</p>
		{/if}
	</section>

	<!-- Engagement funnel -->
	<section class="card p-6">
		<h2 class="h4 mb-4">How far visitors get</h2>
		{#if !hasFunnelData}
			<p class="opacity-60">
				No section data yet — reach is tracked for visits that arrive after this deploys.
			</p>
		{:else}
			<ul class="space-y-3">
				{#each funnel as step}
					<li class="flex items-center gap-3">
						<span class="w-36 truncate shrink-0">{step.label}</span>
						<div class="flex-1 h-3 rounded-full bg-surface-500/10 overflow-hidden">
							<div class="h-full rounded-full bg-primary-500" style="width: {step.percent}%"></div>
						</div>
						<span class="w-12 text-right text-sm opacity-70 shrink-0">{step.percent}%</span>
					</li>
				{/each}
			</ul>
			<p class="mt-4 text-xs opacity-50">
				Percentage of views that scrolled far enough to see each section. A steep drop marks where
				visitors lose interest — consider moving important content above that point.
			</p>
		{/if}
	</section>

	<!-- Conversions -->
	<section class="card p-6">
		<h2 class="h4 mb-4">Conversions &amp; clicks</h2>
		{#if events.length === 0}
			<p class="opacity-60">
				Nothing recorded yet — social, project, website clicks and contact submissions are counted
				for visits after this deploys.
			</p>
		{:else}
			<ul class="space-y-3">
				{#each events as event}
					<li class="flex items-center gap-3">
						<span class="w-52 truncate shrink-0">{eventLabel(event.key)}</span>
						<div class="flex-1 h-3 rounded-full bg-surface-500/10 overflow-hidden">
							<div
								class="h-full rounded-full bg-primary-500"
								style="width: {(event.count / maxEvent) * 100}%"
							></div>
						</div>
						<span class="w-12 text-right text-sm opacity-70 shrink-0">{event.count}</span>
					</li>
				{/each}
			</ul>
		{/if}
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
