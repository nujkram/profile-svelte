import clientPromise from '$lib/server/mongo';

/** The single profile document that feeds every public page. */
export async function getPublicProfile() {
	const db = await clientPromise();
	const [profile] = await db.collection('profile').find({}).toArray();
	return profile;
}
