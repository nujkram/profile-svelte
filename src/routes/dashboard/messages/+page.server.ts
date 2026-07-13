export const ssr = false;
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }: { locals: unknown }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { user }: any = locals;
	const db = await clientPromise();
	const Messages = db.collection('messages');

	const messages = await Messages.find({}).sort({ createdAt: -1 }).toArray();

	return {
		user,
		messages
	};
}
