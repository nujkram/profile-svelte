import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

// Privacy-friendly page-view counter: aggregate daily counts per path,
// no IPs, cookies, or fingerprints stored.
/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }: any) => {
	let path = '/';
	try {
		const data = await request.json();
		path = String(data?.path || '/').slice(0, 200);
	} catch {
		// default to '/'
	}

	// Only public pages are worth counting
	if (path.startsWith('/dashboard') || path.startsWith('/api') || path.startsWith('/auth')) {
		return json({ status: 'Success' });
	}

	const db = await clientPromise();
	const Pageviews = db.collection('pageviews');
	const date = new Date().toISOString().slice(0, 10);

	await Pageviews.updateOne({ date, path }, { $inc: { count: 1 } }, { upsert: true });

	return json({ status: 'Success' });
};
