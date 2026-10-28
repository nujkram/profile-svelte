export const ssr = false;
import { error } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { getInvitation } from '$lib/server/invitation';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }: { locals: unknown }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { user }: any = locals;
	// The layout's 401 doesn't stop this load from running and returning data
	if (!user) error(401, 'Unauthorized');
	const db = await clientPromise();

	const invitation = await getInvitation(db);
	const rsvps = await db
		.collection<any>('rsvps')
		.find({}, { projection: { ip: 0 } })
		.sort({ updatedAt: -1 })
		.toArray();

	return {
		user,
		invitation,
		rsvps
	};
}
