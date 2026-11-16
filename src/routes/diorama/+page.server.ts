import { getPublicProfile } from '$lib/server/profile';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const full = await getPublicProfile();
	// The photo is a large base64 string; the scene loads it from /profile-image.jpg instead.
	const { image, ...profile } = full ?? {};

	return {
		profile,
		hasImage: Boolean(image)
	};
}
