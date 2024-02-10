export const ssr = false;
import clientPromise from "$lib/server/mongo";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }: { locals: unknown }) {

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { user }: any = locals;
	const db = await clientPromise();
	const Profile = db.collection('profile');

	const profile = await Profile.findOne({ 'username': user.username });

	return {
		user,
		profile
	};
}
