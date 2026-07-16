export const ssr = false;
import clientPromise from '$lib/server/mongo';

const DAYS = 30;
const dayKey = (offset: number) =>
	new Date(Date.now() - offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const mergeTotals = (docs: any[], field: string): { key: string; count: number }[] => {
	const totals: Record<string, number> = {};
	for (const doc of docs) {
		for (const [key, n] of Object.entries(doc[field] || {})) {
			totals[key] = (totals[key] || 0) + Number(n);
		}
	}
	return Object.entries(totals)
		.map(([key, count]) => ({ key, count }))
		.sort((a, b) => b.count - a.count);
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }: { locals: unknown }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { user }: any = locals;
	const db = await clientPromise();

	// Two windows: current 30 days and the 30 before, for the trend delta
	const since = dayKey(DAYS);
	const prevSince = dayKey(DAYS * 2);
	const allDocs = await db
		.collection('pageviews')
		.find({ date: { $gte: prevSince } })
		.toArray();
	const docs = allDocs.filter((doc: any) => doc.date >= since);
	const prevDocs = allDocs.filter((doc: any) => doc.date < since);

	// Fill a continuous day series (zeroes included) so the chart has no gaps
	const byDate = new Map<string, number>();
	for (const doc of docs) {
		byDate.set(doc.date, (byDate.get(doc.date) || 0) + (doc.count || 0));
	}
	const days: { date: string; count: number }[] = [];
	for (let i = DAYS - 1; i >= 0; i--) {
		const date = dayKey(i);
		days.push({ date, count: byDate.get(date) || 0 });
	}

	// Totals for the current window
	let totalViews = 0;
	let durationSum = 0;
	let durationCount = 0;
	for (const doc of docs) {
		totalViews += doc.count || 0;
		durationSum += doc.durationSum || 0;
		durationCount += doc.durationCount || 0;
	}
	const prevViews = prevDocs.reduce((sum: number, doc: any) => sum + (doc.count || 0), 0);

	// Weekday averages (0 = Monday … 6 = Sunday) from the zero-filled series
	const weekdaySums = Array(7).fill(0);
	const weekdayCounts = Array(7).fill(0);
	for (const day of days) {
		const index = (new Date(day.date + 'T00:00:00').getDay() + 6) % 7;
		weekdaySums[index] += day.count;
		weekdayCounts[index] += 1;
	}
	const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({
		label,
		avg: weekdayCounts[i] ? Math.round((weekdaySums[i] / weekdayCounts[i]) * 10) / 10 : 0
	}));

	// Contact conversions from the messages collection (created in the window)
	const messagesCount = await db
		.collection('messages')
		.countDocuments({ createdAt: { $gte: new Date(since + 'T00:00:00Z') } });

	return {
		user,
		days,
		totalViews,
		prevViews,
		avgDuration: durationCount ? Math.round(durationSum / durationCount) : 0,
		messagesCount,
		weekdays,
		countries: mergeTotals(docs, 'countries').map(({ key, count }) => ({ code: key, count })),
		referrers: mergeTotals(docs, 'referrers'),
		sections: mergeTotals(docs, 'sections'),
		events: mergeTotals(docs, 'events')
	};
}
