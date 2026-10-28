import clientPromise from '$lib/server/mongo';
import { DEFAULT_INVITATION, INVITATION_ID, sanitizeInvitation } from '$lib/server/invitation';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Invitations = db.collection<any>('invitation');

	const fields = sanitizeInvitation(data);
	// Mongo rejects an update that touches the same path in $set and $setOnInsert
	const onInsert = fields.kids ? {} : { kids: DEFAULT_INVITATION.kids };

	const response = await Invitations.updateOne(
		{ _id: INVITATION_ID },
		{
			$set: { ...fields, updatedAt: new Date() },
			$setOnInsert: { _id: INVITATION_ID, ...onInsert }
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
