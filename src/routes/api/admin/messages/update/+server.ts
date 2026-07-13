import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }: any) => {
	const { _id, isRead } = await request.json();
	const db = await clientPromise();
	const Messages = db.collection('messages');

	const response = await Messages.updateOne({ _id }, { $set: { isRead: Boolean(isRead) } });

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: isRead ? 'Marked as read' : 'Marked as unread',
			response
		})
	);
};
