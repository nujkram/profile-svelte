import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

// Privacy-friendly analytics: aggregate daily counters per path — view
// counts, visitor country tallies (from the hosting platform's geo header,
// never the IP itself), and time-on-page sums. No IPs, cookies, or
// fingerprints are stored.
/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }: any) => {
	let path = '/';
	let duration = 0;
	try {
		const data = await request.json();
		path = String(data?.path || '/').slice(0, 200);
		duration = Math.floor(Number(data?.duration) || 0);
	} catch {
		// default to a plain view ping
	}

	// Only public pages are worth counting
	if (path.startsWith('/dashboard') || path.startsWith('/api') || path.startsWith('/auth')) {
		return json({ status: 'Success' });
	}

	const db = await clientPromise();
	const Pageviews = db.collection<any>('pageviews');
	const date = new Date().toISOString().slice(0, 10);

	if (duration > 0) {
		// Time-on-page beacon; cap at 30 minutes so an idle tab can't skew averages
		const seconds = Math.min(duration, 1800);
		await Pageviews.updateOne(
			{ date, path },
			{ $inc: { durationSum: seconds, durationCount: 1 } },
			{ upsert: true }
		);
		return json({ status: 'Success' });
	}

	// View ping — tally the visitor's country (two-letter code from the CDN edge)
	const country = (
		request.headers.get('x-vercel-ip-country') ||
		request.headers.get('cf-ipcountry') ||
		'ZZ'
	)
		.toUpperCase()
		.slice(0, 2);
	const countryKey = /^[A-Z]{2}$/.test(country) ? country : 'ZZ';

	await Pageviews.updateOne(
		{ date, path },
		{ $inc: { count: 1, [`countries.${countryKey}`]: 1 } },
		{ upsert: true }
	);

	return json({ status: 'Success' });
};
