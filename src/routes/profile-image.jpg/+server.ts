import { error } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

// Serves the profile photo (stored as a base64 data URL in Mongo) as a real
// image URL so social-preview crawlers and JSON-LD can reference it.
/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	const db = await clientPromise();
	const Profile = db.collection('profile');
	const [profile] = await Profile.find({}, { projection: { image: 1 } }).toArray();

	const match = /^data:(image\/(?:png|jpe?g));base64,(.+)$/.exec(profile?.image ?? '');
	if (!match) throw error(404, 'No profile image');

	return new Response(new Uint8Array(Buffer.from(match[2], 'base64')), {
		headers: {
			'Content-Type': match[1],
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
