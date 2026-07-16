import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

// Privacy-friendly analytics: aggregate daily counters per path — view
// counts, visitor country tallies (from the hosting platform's geo header,
// never the IP itself), referrer buckets, time-on-page sums, section reach,
// and conversion events. No IPs, cookies, or fingerprints are stored. All
// keys written to Mongo come from fixed whitelists, never raw client input.

const REFERRER_BUCKETS: Record<string, string> = {
	google: 'google',
	bing: 'bing',
	linkedin: 'linkedin',
	github: 'github',
	facebook: 'facebook',
	twitter: 'x',
	't.co': 'x',
	'x.com': 'x',
	instagram: 'instagram',
	youtube: 'youtube'
};

const SECTION_IDS = new Set([
	'about',
	'experience',
	'projects',
	'education',
	'skills',
	'testimonials',
	'contact'
]);

const EVENT_PATTERN = /^(social_[a-z]{1,20}|project_live|project_source|website|contact_submit)$/;

const bucketReferrer = (referrer: string, ownHost: string): string => {
	if (!referrer) return 'direct';
	try {
		const host = new URL(referrer).hostname.toLowerCase();
		if (!host || host === ownHost) return 'direct';
		for (const [needle, bucket] of Object.entries(REFERRER_BUCKETS)) {
			if (host === needle || host.includes(needle)) return bucket;
		}
		return 'other';
	} catch {
		return 'direct';
	}
};

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, url }: any) => {
	let path = '/';
	let duration = 0;
	let referrer = '';
	let event = '';
	let sections: string[] = [];
	try {
		const data = await request.json();
		path = String(data?.path || '/').slice(0, 200);
		duration = Math.floor(Number(data?.duration) || 0);
		referrer = String(data?.referrer || '').slice(0, 500);
		event = String(data?.event || '').slice(0, 40);
		sections = Array.isArray(data?.sections) ? data.sections.slice(0, 20) : [];
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

	// Conversion event beacon
	if (event) {
		if (EVENT_PATTERN.test(event)) {
			await Pageviews.updateOne(
				{ date, path },
				{ $inc: { [`events.${event}`]: 1 } },
				{ upsert: true }
			);
		}
		return json({ status: 'Success' });
	}

	// Leave beacon: time-on-page (capped at 30 minutes so an idle tab can't
	// skew averages) plus which whitelisted sections the visitor reached
	if (duration > 0) {
		const inc: Record<string, number> = {
			durationSum: Math.min(duration, 1800),
			durationCount: 1
		};
		for (const section of sections) {
			if (SECTION_IDS.has(String(section))) inc[`sections.${section}`] = 1;
		}
		await Pageviews.updateOne({ date, path }, { $inc: inc }, { upsert: true });
		return json({ status: 'Success' });
	}

	// View ping — tally country (two-letter code from the CDN edge) and referrer bucket
	const country = (
		request.headers.get('x-vercel-ip-country') ||
		request.headers.get('cf-ipcountry') ||
		'ZZ'
	)
		.toUpperCase()
		.slice(0, 2);
	const countryKey = /^[A-Z]{2}$/.test(country) ? country : 'ZZ';
	const referrerKey = bucketReferrer(referrer, url.hostname);

	await Pageviews.updateOne(
		{ date, path },
		{
			$inc: {
				count: 1,
				[`countries.${countryKey}`]: 1,
				[`referrers.${referrerKey}`]: 1
			}
		},
		{ upsert: true }
	);

	return json({ status: 'Success' });
};
