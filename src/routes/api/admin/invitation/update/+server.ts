import clientPromise from '$lib/server/mongo';
import { DEFAULT_INVITATION, INVITATION_ID, sanitizeInvitation } from '$lib/server/invitation';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Invitations = db.collection<any>('invitation');

	const response = await Invitations.updateOne(
		{ _id: INVITATION_ID },
		{
			$set: { ...sanitizeInvitation(data), updatedAt: new Date() },
			$setOnInsert: { _id: INVITATION_ID, kids: DEFAULT_INVITATION.kids }
		},
		{ upsert: true }
	);

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: 'Invitation updated',
			response
		})
	);
};
