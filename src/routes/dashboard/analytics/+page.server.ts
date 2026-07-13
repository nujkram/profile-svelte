export const ssr = false;
import clientPromise from '$lib/server/mongo';

const DAYS = 30;

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }: { locals: unknown }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { user }: any = locals;
	const db = await clientPromise();

	const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
	const docs = await db
		.collection('pageviews')
		.find({ date: { $gte: since } })
		.toArray();

	// Fill a continuous day series (zeroes included) so the chart has no gaps
	const byDate = new Map<string, number>();
	for (const doc of docs) {
		byDate.set(doc.date, (byDate.get(doc.date) || 0) + (doc.count || 0));
	}
	const days: { date: string; count: number }[] = [];
	for (let i = DAYS - 1; i >= 0; i--) {
		const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
		days.push({ date, count: byDate.get(date) || 0 });
	}

	// Totals
	let totalViews = 0;
	let durationSum = 0;
	let durationCount = 0;
	const countryTotals: Record<string, number> = {};
	for (const doc of docs) {
		totalViews += doc.count || 0;
		durationSum += doc.durationSum || 0;
		durationCount += doc.durationCount || 0;
		for (const [code, n] of Object.entries(doc.countries || {})) {
			countryTotals[code] = (countryTotals[code] || 0) + Number(n);
		}
	}

	const countries = Object.entries(countryTotals)
		.map(([code, count]) => ({ code, count }))
		.sort((a, b) => b.count - a.count);

	return {
		user,
		days,
		totalViews,
		avgDuration: durationCount ? Math.round(durationSum / durationCount) : 0,
		countries
	};
}
