import { getPublicProfile } from '$lib/server/profile';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const full = await getPublicProfile();
	// The profile photo is a large base64 string the diorama doesn't use
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { image, ...profile } = full ?? {};

	return { profile };
}
